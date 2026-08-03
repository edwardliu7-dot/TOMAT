/**
 * server/eob5/dashboard.js
 * GET /api/eob5/dashboard — Data ringkasan dashboard untuk guru yang login
 */

import express from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = express.Router()

// GET /api/eob5/dashboard
// Statistik ringkasan: jumlah siswa, absensi hari ini, tugas pending, dll.
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())

    // Jalankan semua query secara paralel
    const [
      totalSiswaRes,
      absensiHariIniRes,
      kelasDiajarRes,
      absensiRekapRes,
      recentAbsensiRes,
    ] = await Promise.all([
      // Total siswa aktif di kelas yang diampu guru ini
      pool.query(
        `SELECT COUNT(*) AS total FROM students
         WHERE kelas = ANY(
           SELECT unnest(kelas_diampu) FROM gurus WHERE id = $1
         )`,
        [guruId]
      ),
      // Absensi hari ini — dari attendance_records (sistem aktif), filter kelas diampu guru
      pool.query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
                COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
                COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
                COUNT(*) FILTER (WHERE a.status = 'alpa')  AS alpa
         FROM attendance_records a
         JOIN students s ON s.id = a.student_id
         WHERE s.kelas = ANY(
           SELECT unnest(kelas_diampu) FROM gurus WHERE id = $1
         ) AND a.tanggal = $2`,
        [guruId, today]
      ),
      // Kelas yang diampu — ambil dari array kelas_diampu di tabel gurus
      // (sumber data canonical; kelas_guru adalah tabel relasional terpisah yg belum tentu terisi)
      pool.query(
        `SELECT unnest(kelas_diampu) AS kelas FROM gurus WHERE id = $1 ORDER BY 1`,
        [guruId]
      ),
      // Rekap absensi 7 hari terakhir — dari attendance_records, filter kelas diampu
      pool.query(
        `SELECT a.tanggal, COUNT(*) AS total,
                COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
                COUNT(*) FILTER (WHERE a.status != 'hadir') AS tidak_hadir
         FROM attendance_records a
         JOIN students s ON s.id = a.student_id
         WHERE s.kelas = ANY(
           SELECT unnest(kelas_diampu) FROM gurus WHERE id = $1
         ) AND a.tanggal >= NOW() - INTERVAL '7 days'
         GROUP BY a.tanggal ORDER BY a.tanggal DESC`,
        [guruId]
      ),
      // 5 absensi terbaru — dari attendance_records
      pool.query(
        `SELECT a.id, a.tanggal, a.status, a.keterangan,
                s.name AS siswa_name, s.kelas
         FROM attendance_records a
         JOIN students s ON s.id = a.student_id
         WHERE s.kelas = ANY(
           SELECT unnest(kelas_diampu) FROM gurus WHERE id = $1
         )
         ORDER BY a.tanggal DESC, a.student_id LIMIT 5`,
        [guruId]
      ),
    ])

    const absensiToday = absensiHariIniRes.rows[0]
    const totalSiswa = parseInt(totalSiswaRes.rows[0]?.total || 0)

    res.json({
      guru: {
        id: req.session.user.id,
        name: req.session.user.name,
        role: req.session.user.role,
      },
      statistik: {
        totalSiswa,
        absensiHariIni: {
          total: parseInt(absensiToday.total || 0),
          hadir: parseInt(absensiToday.hadir || 0),
          sakit: parseInt(absensiToday.sakit || 0),
          izin: parseInt(absensiToday.izin || 0),
          alpha: parseInt(absensiToday.alpha || 0),
        },
        kelasDiampu: kelasDiajarRes.rows.map(r => r.kelas),
      },
      rekapMingguIni: absensiRekapRes.rows.map(r => ({
        // node-postgres returns DATE columns as JS Date objects — serialize to
        // YYYY-MM-DD string so the client can safely append "T00:00:00".
        tanggal: r.tanggal instanceof Date
          ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(r.tanggal)
          : (typeof r.tanggal === 'string' ? r.tanggal.slice(0, 10) : null),
        total: parseInt(r.total),
        hadir: parseInt(r.hadir),
        tidakHadir: parseInt(r.tidak_hadir),
      })),
      absensiTerbaru: recentAbsensiRes.rows,
      today,
    })
  } catch (err) {
    console.error('[eob5/dashboard] error:', err)
    res.status(500).json({ error: 'Gagal memuat data dashboard' })
  }
})

export default router
