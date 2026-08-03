/**
 * server/eob5/materi.js
 * Materi/modul ajar — dialihkan ke tabel `bahan_ajar` (tabel yang sudah ada dengan data).
 * Tabel `materi` sudah di-DROP (tabel baru SMARTISA, 0 data).
 * Tujuan pembelajaran tetap menggunakan `tujuan_pembelajaran` (tabel lama).
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/materi — redirect ke bahan_ajar
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran } = req.query

    const conditions = ['created_by = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`kelas = $${idx++}`)
      params.push(kelas)
    }
    if (mata_pelajaran) {
      conditions.push(`mata_pelajaran ILIKE $${idx++}`)
      params.push(`%${mata_pelajaran}%`)
    }

    const { rows } = await pool.query(`
      SELECT id, judul, deskripsi, kelas, mata_pelajaran, link_url AS url_file,
             file_name, file_type, created_at, 'link' AS tipe
      FROM bahan_ajar
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data materi' })
  }
})

// GET /api/eob5/materi/:id
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      `SELECT id, judul, deskripsi, kelas, mata_pelajaran, link_url AS url_file,
              file_name, file_type, created_at
       FROM bahan_ajar WHERE id = $1 AND created_by = $2`,
      [req.params.id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Materi tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil detail materi' })
  }
})

// POST /api/eob5/materi — simpan ke bahan_ajar
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { judul, deskripsi, kelas, mata_pelajaran, url_file } = req.body

    if (!judul) return res.status(400).json({ error: 'Judul materi wajib diisi' })

    const guruRes = await pool.query('SELECT name FROM gurus WHERE id = $1', [guruId])
    const { rows } = await pool.query(`
      INSERT INTO bahan_ajar (judul, mata_pelajaran, kelas, deskripsi, link_url, created_by, created_by_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, judul, deskripsi, kelas, mata_pelajaran, link_url AS url_file, created_at
    `, [judul, mata_pelajaran, kelas, deskripsi, url_file, guruId, guruRes.rows[0]?.name])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan materi' })
  }
})

// PUT /api/eob5/materi/:id
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { judul, deskripsi, kelas, mata_pelajaran, url_file } = req.body

    const { rows } = await pool.query(`
      UPDATE bahan_ajar
      SET judul          = COALESCE($1, judul),
          deskripsi      = COALESCE($2, deskripsi),
          kelas          = COALESCE($3, kelas),
          mata_pelajaran = COALESCE($4, mata_pelajaran),
          link_url       = COALESCE($5, link_url)
      WHERE id = $6 AND created_by = $7
      RETURNING id, judul, deskripsi, kelas, mata_pelajaran, link_url AS url_file, created_at
    `, [judul, deskripsi, kelas, mata_pelajaran, url_file, req.params.id, guruId])

    if (!rows.length) return res.status(404).json({ error: 'Materi tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate materi' })
  }
})

// DELETE /api/eob5/materi/:id
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rowCount } = await pool.query(
      'DELETE FROM bahan_ajar WHERE id = $1 AND created_by = $2',
      [req.params.id, guruId]
    )
    if (!rowCount) return res.status(404).json({ error: 'Materi tidak ditemukan' })
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus materi' })
  }
})

// GET /api/eob5/tujuan-pembelajaran
router.get('/tujuan-pembelajaran', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran } = req.query

    const conditions = ['teacher_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) { conditions.push(`kelas = $${idx++}`); params.push(kelas) }
    if (mata_pelajaran) { conditions.push(`mata_pelajaran ILIKE $${idx++}`); params.push(`%${mata_pelajaran}%`) }

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
