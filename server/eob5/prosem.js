/**
 * server/eob5/prosem.js
 * CRUD program semester (prosem).
 * Menggunakan tabel lama `prosem`.
 * Kolom: teacher_id (bukan guru_id).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/prosem — daftar program semester
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, semester, tahun_ajaran } = req.query

    const conditions = ['teacher_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`mata_pelajaran = $${idx++}`)
      params.push(mata_pelajaran)
    }
    if (semester) {
      conditions.push(`semester = $${idx++}`)
      params.push(semester)
    }
    if (tahun_ajaran) {
      conditions.push(`tahun_ajaran = $${idx++}`)
      params.push(tahun_ajaran)
    }

    const { rows } = await pool.query(`
      SELECT id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, created_at
      FROM prosem
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data prosem' })
  }
})

// GET /api/eob5/prosem/:id — detail prosem lengkap (termasuk konten)
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, konten, created_at
       FROM prosem WHERE id = $1 AND teacher_id = $2`,
      [id, guruId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil detail prosem' })
  }
})

// POST /api/eob5/prosem — buat prosem baru
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { mata_pelajaran, kelas, semester, tahun_ajaran, konten } = req.body

    if (!mata_pelajaran || !kelas || !semester || !tahun_ajaran) {
      return res.status(400).json({ error: 'Data tidak lengkap: mata_pelajaran, kelas, semester, tahun_ajaran wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO prosem (teacher_id, mata_pelajaran, kelas, semester, tahun_ajaran, konten)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, konten, created_at
    `, [guruId, mata_pelajaran, kelas, semester, tahun_ajaran, konten ? JSON.stringify(konten) : null])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan prosem' })
  }
})

// PUT /api/eob5/prosem/:id — update prosem
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { mata_pelajaran, kelas, semester, tahun_ajaran, konten } = req.body

    const { rows } = await pool.query(`
      UPDATE prosem
      SET mata_pelajaran = COALESCE($1, mata_pelajaran),
          kelas          = COALESCE($2, kelas),
          semester       = COALESCE($3, semester),
          tahun_ajaran   = COALESCE($4, tahun_ajaran),
          konten         = COALESCE($5, konten)
      WHERE id = $6 AND teacher_id = $7
      RETURNING id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, konten, created_at
    `, [mata_pelajaran, kelas, semester, tahun_ajaran, konten ? JSON.stringify(konten) : null, id, guruId])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate prosem' })
  }
})

// DELETE /api/eob5/prosem/:id — hapus prosem
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rowCount } = await pool.query(
      'DELETE FROM prosem WHERE id = $1 AND teacher_id = $2',
      [id, guruId]
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    }
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus prosem' })
  }
})

export default router
