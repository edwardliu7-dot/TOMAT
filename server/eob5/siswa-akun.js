/**
 * server/eob5/siswa-akun.js
 * Manajemen data siswa untuk EOB5 — menggunakan tabel `students` TOMAT.
 *
 * GET  /api/eob5/siswa/list       — daftar siswa (filter by kelas)
 * GET  /api/eob5/siswa/:id        — detail siswa
 * PUT  /api/eob5/siswa/:id        — update data siswa
 * GET  /api/eob5/siswa/:id/rekap  — rekap lengkap satu siswa (absensi + nilai + poin)
 */

import express from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = express.Router()

// GET /list — daftar siswa, bisa filter by kelas
router.get('/list', requireGuru, async (req, res) => {
  try {
    const { kelas, search } = req.query
    const params = []
    const conditions = []

    if (kelas) {
      params.push(kelas)
      conditions.push(`s.kelas = $${params.length}`)
    }

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(s.name ILIKE $${params.length} OR s.username ILIKE $${params.length})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT s.id, s.username, s.name, s.kelas, s.email, s.whatsapp,
              s.jenis_kelamin, s.bio, s.photo_url, s.created_at,
              COALESCE(rek.total_hadir, 0)  AS total_hadir,
              COALESCE(rek.total_alpha, 0)  AS total_alpha
       FROM students s
       LEFT JOIN (
         SELECT student_id,
                COUNT(*) FILTER (WHERE status = 'hadir') AS total_hadir,
                COUNT(*) FILTER (WHERE status = 'alpha') AS total_alpha
         FROM eob5_absensi
         GROUP BY student_id
       ) rek ON rek.student_id = s.id
       ${where}
       ORDER BY s.kelas, s.name`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/siswa] list error:', err)
    res.status(500).json({ error: 'Gagal memuat daftar siswa' })
  }
})

// GET /:id — detail siswa
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, kelas, email, whatsapp,
              jenis_kelamin, bio, photo_url, quran_bookmark, created_at
       FROM students WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/siswa] detail error:', err)
    res.status(500).json({ error: 'Gagal memuat data siswa' })
  }
})

// PUT /:id — update data siswa (guru bisa update kelas, jenis_kelamin, dll)
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const { id } = req.params
    const { name, kelas, email, whatsapp, jenis_kelamin, bio } = req.body || {}

    const existing = await pool.query('SELECT id FROM students WHERE id = $1', [id])
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' })

    const { rows } = await pool.query(
      `UPDATE students SET
        name         = COALESCE($2, name),
        kelas        = COALESCE($3, kelas),
        email        = COALESCE($4, email),
        whatsapp     = COALESCE($5, whatsapp),
        jenis_kelamin = COALESCE($6, jenis_kelamin),
        bio          = COALESCE($7, bio)
       WHERE id = $1
       RETURNING id, username, name, kelas, email, whatsapp, jenis_kelamin, bio`,
      [id, name || null, kelas || null, email || null, whatsapp || null,
       jenis_kelamin || null, bio || null]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/siswa] update error:', err)
    res.status(500).json({ error: 'Gagal memperbarui data siswa' })
  }
})

// GET /:id/rekap — rekap lengkap satu siswa
router.get('/:id/rekap', requireGuru, async (req, res) => {
  try {
    const { id } = req.params
    const { bulan, tahun } = req.query

    const siswaRes = await pool.query(
      `SELECT id, username, name, kelas, email, whatsapp, jenis_kelamin FROM students WHERE id = $1`,
      [id]
    )
    if (siswaRes.rowCount === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    const siswa = siswaRes.rows[0]

    // Filter bulan/tahun jika ada
    const filterParams = [id]
    let dateFilter = ''
    if (tahun && bulan) {
      filterParams.push(`${tahun}-${String(bulan).padStart(2, '0')}-01`)
      filterParams.push(`${tahun}-${String(bulan).padStart(2, '0')}-31`)
      dateFilter = `AND tanggal BETWEEN $${filterParams.length - 1} AND $${filterParams.length}`
    }

    const [absensiRes, nilaiRes, poinRes] = await Promise.all([
      pool.query(
        `SELECT tanggal, status, keterangan, guru_id FROM eob5_absensi
         WHERE student_id = $1 ${dateFilter} ORDER BY tanggal DESC`,
        filterParams
      ),
      pool.query(
        `SELECT id, jenis, nilai, keterangan, tanggal, mata_pelajaran FROM eob5_nilai
         WHERE student_id = $1 ${dateFilter} ORDER BY tanggal DESC`,
        filterParams
      ).catch(() => ({ rows: [] })),  // graceful fallback jika tabel belum ada
      pool.query(
        `SELECT id, jenis, poin, keterangan, tanggal FROM eob5_poin
         WHERE student_id = $1 ${dateFilter} ORDER BY tanggal DESC`,
        filterParams
      ).catch(() => ({ rows: [] })),
    ])

    // Hitung ringkasan absensi
    const absensiCount = { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
    for (const r of absensiRes.rows) {
      absensiCount[r.status] = (absensiCount[r.status] || 0) + 1
    }

    const totalPoin = poinRes.rows.reduce((sum, r) => sum + (r.jenis === 'positif' ? r.poin : -r.poin), 0)

    res.json({
      siswa,
      absensi: {
        rekap: absensiCount,
        riwayat: absensiRes.rows,
      },
      nilai: nilaiRes.rows,
      poin: {
        total: totalPoin,
        riwayat: poinRes.rows,
      },
    })
  } catch (err) {
    console.error('[eob5/siswa] rekap error:', err)
    res.status(500).json({ error: 'Gagal memuat rekap siswa' })
  }
})

export default router
