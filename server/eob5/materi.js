/**
 * server/eob5/materi.js
 * CRUD materi/modul ajar dan tujuan pembelajaran.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/materi — daftar materi/modul ajar
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, tipe } = req.query

    const conditions = ['guru_id = $1']
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
    if (tipe) {
      conditions.push(`tipe = $${idx++}`)
      params.push(tipe)
    }

    const { rows } = await pool.query(`
      SELECT * FROM materi
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data materi' })
  }
})

// GET /api/eob5/materi/:id — detail materi
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      'SELECT * FROM materi WHERE id = $1 AND guru_id = $2',
      [id, guruId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil detail materi' })
  }
})

// POST /api/eob5/materi — upload/buat materi baru
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { judul, deskripsi, kelas, mata_pelajaran, url_file, tipe } = req.body

    if (!judul) {
      return res.status(400).json({ error: 'Judul materi wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO materi (guru_id, judul, deskripsi, kelas, mata_pelajaran, url_file, tipe)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [guruId, judul, deskripsi, kelas, mata_pelajaran, url_file, tipe])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan materi' })
  }
})

// PUT /api/eob5/materi/:id — update materi
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { judul, deskripsi, kelas, mata_pelajaran, url_file, tipe } = req.body

    const { rows } = await pool.query(`
      UPDATE materi
      SET judul          = COALESCE($1, judul),
          deskripsi      = COALESCE($2, deskripsi),
          kelas          = COALESCE($3, kelas),
          mata_pelajaran = COALESCE($4, mata_pelajaran),
          url_file       = COALESCE($5, url_file),
          tipe           = COALESCE($6, tipe)
      WHERE id = $7 AND guru_id = $8
      RETURNING *
    `, [judul, deskripsi, kelas, mata_pelajaran, url_file, tipe, id, guruId])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate materi' })
  }
})

// DELETE /api/eob5/materi/:id — hapus materi
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rowCount } = await pool.query(
      'DELETE FROM materi WHERE id = $1 AND guru_id = $2',
      [id, guruId]
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' })
    }
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus materi' })
  }
})

// GET /api/eob5/tujuan-pembelajaran — daftar TP per mapel/kelas
router.get('/tujuan-pembelajaran', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran } = req.query

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

    const { rows } = await pool.query(`
      SELECT * FROM tujuan_pembelajaran
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil tujuan pembelajaran' })
  }
})

export default router
