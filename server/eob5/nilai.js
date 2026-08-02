/**
 * server/eob5/nilai.js
 * CRUD nilai akademik mata pelajaran (nilai_akademik).
 * Terpisah dari tabel `nilai` TOMAT yang hanya untuk skor game.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/nilai — daftar nilai (filter: kelas, mapel, periode)
router.get('/', requireGuru, async (req, res) => {
  try {
    const { kelas, mata_pelajaran, semester, tahun_ajaran } = req.query
    const guruId = req.session.user.id

    const conditions = ['n.guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`s.kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`n.mata_pelajaran = $${idx++}`)
      params.push(mata_pelajaran)
    }
    if (semester) {
      conditions.push(`n.semester = $${idx++}`)
      params.push(semester)
    }
    if (tahun_ajaran) {
      conditions.push(`n.tahun_ajaran = $${idx++}`)
      params.push(tahun_ajaran)
    }

    const { rows } = await pool.query(`
      SELECT n.*, s.name AS nama_siswa, s.kelas
      FROM nilai_akademik n
      JOIN students s ON s.id = n.student_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.name, n.created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data nilai' })
  }
})

// GET /api/eob5/nilai/rekap — rekap nilai per siswa/kelas
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, tahun_ajaran } = req.query

    const conditions = ['n.guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`s.kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`n.mata_pelajaran = $${idx++}`)
      params.push(mata_pelajaran)
    }
    if (tahun_ajaran) {
      conditions.push(`n.tahun_ajaran = $${idx++}`)
      params.push(tahun_ajaran)
    }

    const { rows } = await pool.query(`
      SELECT
        s.id AS student_id,
        s.name AS nama_siswa,
        s.kelas,
        n.mata_pelajaran,
        n.jenis_nilai,
        AVG(n.nilai) AS rata_rata,
        COUNT(*) AS jumlah_nilai
      FROM nilai_akademik n
      JOIN students s ON s.id = n.student_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY s.id, s.name, s.kelas, n.mata_pelajaran, n.jenis_nilai
      ORDER BY s.name, n.mata_pelajaran, n.jenis_nilai
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap nilai' })
  }
})

// GET /api/eob5/nilai/siswa/:studentId — semua nilai satu siswa
router.get('/siswa/:studentId', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { studentId } = req.params

    const { rows } = await pool.query(`
      SELECT n.*, s.name AS nama_siswa, s.kelas
      FROM nilai_akademik n
      JOIN students s ON s.id = n.student_id
      WHERE n.guru_id = $1 AND n.student_id = $2
      ORDER BY n.created_at DESC
    `, [guruId, studentId])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil nilai siswa' })
  }
})

// POST /api/eob5/nilai — input nilai
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan } = req.body

    if (!student_id || !mata_pelajaran || !jenis_nilai || nilai == null) {
      return res.status(400).json({ error: 'Data tidak lengkap: student_id, mata_pelajaran, jenis_nilai, nilai wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO nilai_akademik (student_id, guru_id, mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [student_id, guruId, mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan nilai' })
  }
})

// PUT /api/eob5/nilai/:id — update nilai
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan } = req.body

    const { rows } = await pool.query(`
      UPDATE nilai_akademik
      SET mata_pelajaran = COALESCE($1, mata_pelajaran),
          jenis_nilai    = COALESCE($2, jenis_nilai),
          nilai          = COALESCE($3, nilai),
          semester       = COALESCE($4, semester),
          tahun_ajaran   = COALESCE($5, tahun_ajaran),
          keterangan     = COALESCE($6, keterangan)
      WHERE id = $7 AND guru_id = $8
      RETURNING *
    `, [mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan, id, guruId])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data nilai tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate nilai' })
  }
})

// DELETE /api/eob5/nilai/:id — hapus nilai
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rowCount } = await pool.query(
      'DELETE FROM nilai_akademik WHERE id = $1 AND guru_id = $2',
      [id, guruId]
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Data nilai tidak ditemukan' })
    }
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus nilai' })
  }
})

export default router
