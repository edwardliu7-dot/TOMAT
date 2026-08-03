/**
 * server/eob5/kesiswaan.js
 * Overview Kesiswaan: statistik per kelas + alert siswa bermasalah.
 *
 * GET /api/eob5/kesiswaan/overview      — ringkasan per kelas
 * GET /api/eob5/kesiswaan/siswa-absensi — absensi + poin per siswa
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /overview
router.get('/overview', requireGuru, async (req, res) => {
  try {
    // Per kelas: absensi aggregate + poin
    const { rows: kelasRows } = await pool.query(`
      SELECT
        st.kelas,
        COUNT(DISTINCT st.id)                                       AS "totalSiswa",
        COUNT(a.id) FILTER (WHERE a.status = 'hadir')               AS hadir,
        COUNT(a.id) FILTER (WHERE a.status = 'izin')                AS izin,
        COUNT(a.id) FILTER (WHERE a.status = 'sakit')               AS sakit,
        COUNT(a.id) FILTER (WHERE a.status = 'alpha')               AS alpa,
        COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'negatif'), 0) AS "totalPoinNegatif",
        COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'positif'), 0) AS "totalPoinPositif"
      FROM students st
      LEFT JOIN absensi       a  ON a.student_id = st.id
      LEFT JOIN point_records p ON p.student_id = st.id
      GROUP BY st.kelas
      ORDER BY st.kelas
    `)

    // Top 6 siswa poin negatif terbanyak
    const { rows: topNegatif } = await pool.query(`
      SELECT
        st.id   AS "studentId",
        st.name AS "namaLengkap",
        st.kelas,
        SUM(p.poin) FILTER (WHERE p.jenis = 'negatif') AS "totalPoin"
      FROM students st
      JOIN point_records p ON p.student_id = st.id
      WHERE p.jenis = 'negatif'
      GROUP BY st.id, st.name, st.kelas
      HAVING SUM(p.poin) FILTER (WHERE p.jenis = 'negatif') > 0
      ORDER BY "totalPoin" DESC
      LIMIT 6
    `)

    // Top 6 siswa poin positif terbanyak
    const { rows: topPositif } = await pool.query(`
      SELECT
        st.id   AS "studentId",
        st.name AS "namaLengkap",
        st.kelas,
        SUM(p.poin) FILTER (WHERE p.jenis = 'positif') AS "totalPoin"
      FROM students st
      JOIN point_records p ON p.student_id = st.id
      WHERE p.jenis = 'positif'
      GROUP BY st.id, st.name, st.kelas
      HAVING SUM(p.poin) FILTER (WHERE p.jenis = 'positif') > 0
      ORDER BY "totalPoin" DESC
      LIMIT 6
    `)

    const perKelas = kelasRows.map(r => ({
      kelas:             r.kelas,
      totalSiswa:        parseInt(r.totalSiswa)        || 0,
      hadir:             parseInt(r.hadir)             || 0,
      izin:              parseInt(r.izin)              || 0,
      sakit:             parseInt(r.sakit)             || 0,
      alpa:              parseInt(r.alpa)              || 0,
      totalPoinNegatif:  parseInt(r.totalPoinNegatif)  || 0,
      totalPoinPositif:  parseInt(r.totalPoinPositif)  || 0,
    }))

    res.json({
      perKelas,
      siswaPoinTerbanyak:      topNegatif,
      siswaPoinPositifTerbanyak: topPositif,
    })
  } catch (err) {
    console.error('[kesiswaan/overview]', err)
    res.status(500).json({ error: 'Gagal memuat data kesiswaan' })
  }
})

// GET /siswa-absensi — absensi + poin per siswa (semua kelas)
router.get('/siswa-absensi', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        st.id   AS "studentId",
        st.name AS "namaLengkap",
        st.kelas,
        COUNT(a.id) FILTER (WHERE a.status = 'hadir')               AS hadir,
        COUNT(a.id) FILTER (WHERE a.status = 'izin')                AS izin,
        COUNT(a.id) FILTER (WHERE a.status = 'sakit')               AS sakit,
        COUNT(a.id) FILTER (WHERE a.status = 'alpha')               AS alpa,
        COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'positif'), 0) AS "totalPoinPositif",
        COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'negatif'), 0) AS "totalPoinNegatif"
      FROM students st
      LEFT JOIN absensi        a  ON a.student_id = st.id
      LEFT JOIN point_records  p  ON p.student_id = st.id
      GROUP BY st.id, st.name, st.kelas
      ORDER BY st.kelas, st.name
    `)

    const result = rows.map(r => {
      const hadir = parseInt(r.hadir) || 0
      const izin  = parseInt(r.izin)  || 0
      const sakit = parseInt(r.sakit) || 0
      const alpa  = parseInt(r.alpa)  || 0
      const total = hadir + izin + sakit + alpa
      const pctHadir = total > 0 ? Math.round((hadir / total) * 100) : 0
      return {
        studentId:       r.studentId,
        namaLengkap:     r.namaLengkap,
        kelas:           r.kelas,
        hadir, izin, sakit, alpa, pctHadir,
        totalPoinPositif: parseInt(r.totalPoinPositif) || 0,
        totalPoinNegatif: parseInt(r.totalPoinNegatif) || 0,
      }
    })

    res.json(result)
  } catch (err) {
    console.error('[kesiswaan/siswa-absensi]', err)
    res.status(500).json({ error: 'Gagal memuat data absensi siswa' })
  }
})

export default router
