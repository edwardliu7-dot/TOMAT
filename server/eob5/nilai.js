/**
 * server/eob5/nilai.js
 * CRUD nilai akademik — menggunakan tabel `grades` (tabel lama app GuruEOB5).
 * Tabel nilai_akademik sudah di-DROP karena duplikat.
 * Gunakan server/eob5/grades.js untuk operasi yang lebih detail.
 *
 * GET  /api/eob5/nilai               — daftar nilai (filter: kelas, mapel, semester)
 * GET  /api/eob5/nilai/rekap         — rekap rata-rata per siswa/mapel
 * GET  /api/eob5/nilai/siswa/:id     — semua nilai satu siswa
 * POST /api/eob5/nilai               — input nilai baru
 * PUT  /api/eob5/nilai/:id           — update nilai
 * DELETE /api/eob5/nilai/:id         — hapus nilai
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET / — daftar nilai dengan JOIN ke subjects untuk nama mapel
router.get('/', requireGuru, async (req, res) => {
  try {
    const { kelas, mata_pelajaran, semester, tahun_ajaran } = req.query
    const guruId = req.session.user.id

    const conditions = ['g.guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`s.kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`sub.name ILIKE $${idx++}`)
      params.push(`%${mata_pelajaran}%`)
    }

    const { rows } = await pool.query(`
      SELECT g.id, g.student_id, g.guru_id, g.subject_id, g.jenis, g.nilai,
             g.keterangan, g.created_at,
             sub.name AS mata_pelajaran,
             s.name   AS nama_siswa, s.kelas
      FROM grades g
      JOIN students s ON s.id = g.student_id::text
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.name, g.created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data nilai' })
  }
})

// GET /rekap
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran } = req.query

    const conditions = ['g.guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`s.kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`sub.name ILIKE $${idx++}`)
      params.push(`%${mata_pelajaran}%`)
    }

    const { rows } = await pool.query(`
      SELECT s.id AS student_id, s.name AS nama_siswa, s.kelas,
             sub.name AS mata_pelajaran, g.jenis,
             AVG(g.nilai) AS rata_rata, COUNT(*) AS jumlah_nilai
      FROM grades g
      JOIN students s ON s.id = g.student_id::text
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY s.id, s.name, s.kelas, sub.name, g.jenis
      ORDER BY s.name, sub.name, g.jenis
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap nilai' })
  }
})

// GET /siswa/:studentId
router.get('/siswa/:studentId', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { studentId } = req.params

    const { rows } = await pool.query(`
      SELECT g.id, g.student_id, g.guru_id, g.subject_id, g.jenis, g.nilai,
             g.keterangan, g.created_at,
             sub.name AS mata_pelajaran,
             s.name   AS nama_siswa, s.kelas
      FROM grades g
      JOIN students s ON s.id = g.student_id::text
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE g.guru_id = $1 AND g.student_id::text = $2
      ORDER BY g.created_at DESC
    `, [guruId, studentId])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil nilai siswa' })
  }
})

// POST / — input nilai ke grades (lookup subject_id dari nama mapel)
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, mata_pelajaran, jenis_nilai, nilai, keterangan } = req.body

    if (!student_id || !jenis_nilai || nilai == null) {
      return res.status(400).json({ error: 'student_id, jenis_nilai, dan nilai wajib diisi' })
    }

    // Cari subject_id dari nama mata_pelajaran
    let subjectId = null
    if (mata_pelajaran) {
      const subRes = await pool.query(
        `SELECT id FROM subjects WHERE teacher_id = $1 AND name ILIKE $2 AND deleted_at IS NULL LIMIT 1`,
        [guruId, mata_pelajaran]
      )
      subjectId = subRes.rows[0]?.id || null
    }

    const jenisValid = ['formatif', 'sumatif_lm', 'sumatif_tengah', 'sumatif_akhir']
    const jenis = jenisValid.includes(jenis_nilai) ? jenis_nilai : 'formatif'

    const { rows } = await pool.query(`
      INSERT INTO grades (student_id, guru_id, subject_id, jenis, nilai, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [student_id, guruId, subjectId, jenis, nilai, keterangan || null])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan nilai' })
  }
})

// PUT /:id
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { jenis_nilai, nilai, keterangan } = req.body

    const jenisValid = ['formatif', 'sumatif_lm', 'sumatif_tengah', 'sumatif_akhir']
    const jenis = jenis_nilai && jenisValid.includes(jenis_nilai) ? jenis_nilai : null

    const { rows } = await pool.query(`
      UPDATE grades
      SET jenis      = COALESCE($1, jenis),
          nilai      = COALESCE($2, nilai),
          keterangan = COALESCE($3, keterangan)
      WHERE id = $4 AND guru_id = $5
      RETURNING *
    `, [jenis, nilai ?? null, keterangan ?? null, id, guruId])

    if (!rows.length) return res.status(404).json({ error: 'Data nilai tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate nilai' })
  }
})

// DELETE /:id
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rowCount } = await pool.query(
      'DELETE FROM grades WHERE id = $1 AND guru_id = $2',
      [req.params.id, guruId]
    )
    if (!rowCount) return res.status(404).json({ error: 'Data nilai tidak ditemukan' })
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus nilai' })
  }
})

export default router
