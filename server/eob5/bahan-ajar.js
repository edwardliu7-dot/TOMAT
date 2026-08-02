/**
 * server/eob5/bahan-ajar.js
 * Upload bahan ajar (PDF base64 atau link URL) — semua guru bisa lihat & upload.
 * Menggunakan tabel lama `bahan_ajar` (bukan bahan_ajar).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

function isAdmin(user) {
  const jabatan = user.jabatan || []
  return jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
}

// GET / — daftar bahan ajar (metadata)
router.get('/', requireGuru, async (req, res) => {
  try {
    const { mata_pelajaran, kelas } = req.query
    const params = []
    const conditions = []

    if (mata_pelajaran) { params.push(mata_pelajaran); conditions.push(`mata_pelajaran = $${params.length}`) }
    if (kelas) { params.push(kelas); conditions.push(`kelas = $${params.length}`) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT id, judul, mata_pelajaran, kelas, deskripsi,
              file_name, file_type, file_size, link_url,
              created_by, created_by_name, created_at
       FROM bahan_ajar ${where}
       ORDER BY created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/bahan-ajar] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar bahan ajar' })
  }
})

// GET /:id/file — download file
router.get('/:id/file', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT file_data, file_name, file_type FROM bahan_ajar WHERE id = $1',
      [req.params.id]
    )
    if (!rows.length || !rows[0].file_data) {
      return res.status(404).json({ error: 'File tidak ditemukan' })
    }
    const { file_data, file_name, file_type } = rows[0]
    const buf = Buffer.from(file_data, 'base64')
    res.setHeader('Content-Type', file_type || 'application/octet-stream')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file_name || 'file')}"`
    )
    res.send(buf)
  } catch (err) {
    console.error('[eob5/bahan-ajar] download error:', err)
    res.status(500).json({ error: 'Gagal mengunduh file' })
  }
})

// POST / — upload bahan ajar
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guruName = req.session.user.name || ''
    const { judul, mata_pelajaran, kelas, deskripsi,
            file_name, file_type, file_size, file_data, link_url } = req.body || {}

    if (!judul || typeof judul !== 'string' || !judul.trim()) {
      return res.status(400).json({ error: 'Judul harus diisi' })
    }
    if (!file_data && !link_url) {
      return res.status(400).json({ error: 'file_data (base64) atau link_url wajib diisi' })
    }
    if (file_data && file_data.length > 14_000_000) {
      return res.status(413).json({ error: 'File terlalu besar (maks. ~10 MB)' })
    }

    const { rows } = await pool.query(
      `INSERT INTO bahan_ajar
         (judul, mata_pelajaran, kelas, deskripsi, file_name, file_type, file_size,
          file_data, link_url, created_by, created_by_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, judul, mata_pelajaran, kelas, deskripsi,
                 file_name, file_type, file_size, link_url,
                 created_by, created_by_name, created_at`,
      [judul.trim(), mata_pelajaran || null, kelas || null, deskripsi || null,
       file_name || null, file_type || null, file_size || null,
       file_data || null, link_url || null, guruId, guruName]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/bahan-ajar] upload error:', err)
    res.status(500).json({ error: 'Gagal menyimpan bahan ajar' })
  }
})

// DELETE /:id — pemilik atau admin
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      'SELECT id, created_by FROM bahan_ajar WHERE id = $1', [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Bahan ajar tidak ditemukan' })

    const isOwner = rows[0].created_by === guruId
    if (!isOwner && !isAdmin(req.session.user)) {
      return res.status(403).json({ error: 'Hanya pembuat atau admin yang dapat menghapus bahan ajar ini' })
    }

    await pool.query('DELETE FROM bahan_ajar WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/bahan-ajar] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus bahan ajar' })
  }
})

export default router
