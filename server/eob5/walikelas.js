/**
 * server/eob5/walikelas.js
 * Pantauan Wali Kelas: rekap siswa per kelas guru + jurnal kelas.
 *
 * GET /api/eob5/walikelas/rekap  — siswa + absensi + nilai + poin
 * GET /api/eob5/walikelas/jurnal — jurnal mengajar kelas ini
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /rekap
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    // Ambil kelas_diampu guru
    const { rows: guruRows } = await pool.query(
      'SELECT name, kelas_diampu FROM gurus WHERE id = $1',
      [guruId]
    )
    if (!guruRows.length) return res.status(404).json({ error: 'Guru tidak ditemukan' })

    const kelasDiampu = guruRows[0].kelas_diampu || []
    // Ambil kelas pertama saja; jika guru mengajar banyak kelas, tampilkan gabungan
    const kelasLabel = kelasDiampu.join(', ') || '—'

    if (!kelasDiampu.length) {
      return res.json({ kelas: kelasLabel, siswa: [] })
    }

    // Rekap per siswa: absensi + rata nilai + poin bersih
    const { rows: siswaRows } = await pool.query(`
      SELECT
        st.id                                                         AS "studentId",
        st.name                                                       AS "namaLengkap",
        st.kelas,
        st.nisn,
        COUNT(a.id) FILTER (WHERE a.status = 'hadir')                AS hadir,
        COUNT(a.id) FILTER (WHERE a.status = 'izin')                 AS izin,
        COUNT(a.id) FILTER (WHERE a.status = 'sakit')                AS sakit,
        COUNT(a.id) FILTER (WHERE a.status = 'alpha')                AS alpa,
        AVG(g.nilai)                                                   AS "rataNilai",
        COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'positif'), 0)
          - COALESCE(SUM(p.poin) FILTER (WHERE p.jenis = 'negatif'), 0) AS "totalPoin"
      FROM students st
      LEFT JOIN absensi        a ON a.student_id = st.id
      LEFT JOIN grades         g ON g.student_id::text = st.id
      LEFT JOIN point_records  p ON p.student_id::text = st.id
      WHERE st.kelas = ANY($1::text[])
      GROUP BY st.id, st.name, st.kelas, st.nisn
      ORDER BY st.kelas, st.name
    `, [kelasDiampu])

    const siswa = siswaRows.map(r => ({
      studentId:  r.studentId,
      namaLengkap: r.namaLengkap,
      kelas:      r.kelas,
      nisn:       r.nisn || null,
      hadir:      parseInt(r.hadir)  || 0,
      izin:       parseInt(r.izin)   || 0,
      sakit:      parseInt(r.sakit)  || 0,
      alpa:       parseInt(r.alpa)   || 0,
      rataNilai:  r.rataNilai != null ? parseFloat(r.rataNilai) : null,
      totalPoin:  parseInt(r.totalPoin) || 0,
    }))

    res.json({ kelas: kelasLabel, siswa })
  } catch (err) {
    console.error('[walikelas/rekap]', err)
    res.status(500).json({ error: 'Gagal memuat rekap wali kelas' })
  }
})

// GET /jurnal — jurnal mengajar untuk kelas guru ini
router.get('/jurnal', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    const { rows: guruRows } = await pool.query(
      'SELECT kelas_diampu FROM gurus WHERE id = $1',
      [guruId]
    )
    const kelasDiampu = guruRows[0]?.kelas_diampu || []

    if (!kelasDiampu.length) return res.json({ entries: [] })

    const { rows } = await pool.query(`
      SELECT
        j.id,
        j.tanggal,
        j.materi,
        j.catatan,
        g.name                AS "teacherName",
        s.name                AS "subjectName",
        j.kelas
      FROM journal_entries j
      JOIN gurus           g ON g.id = j.teacher_id
      LEFT JOIN subjects s ON s.id = j.subject_id
      WHERE j.kelas = ANY($1::text[])
      ORDER BY j.tanggal DESC, j.created_at DESC
      LIMIT 50
    `, [kelasDiampu])

    res.json({ entries: rows })
  } catch (err) {
    console.error('[walikelas/jurnal]', err)
    res.status(500).json({ error: 'Gagal memuat jurnal kelas' })
  }
})

export default router
