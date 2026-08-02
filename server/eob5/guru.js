/**
 * server/eob5/guru.js
 * CRUD manajemen guru untuk EOB5.
 *
 * GET    /api/eob5/guru/list   — daftar semua guru
 * GET    /api/eob5/guru/:id    — detail guru
 * POST   /api/eob5/guru        — tambah guru (admin only)
 * PUT    /api/eob5/guru/:id    — update data guru
 * DELETE /api/eob5/guru/:id    — hapus guru (admin only)
 */

import express from 'express'
import { pool } from '../db.js'
import { requireGuru, requireAdmin } from './middleware.js'

const router = express.Router()

// GET /list — daftar semua guru
router.get('/list', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, email, whatsapp, kelas_diampu,
              jabatan, wali_kelas_kelas, photo_url, bio, created_at
       FROM gurus ORDER BY name`
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/guru] list error:', err)
    res.status(500).json({ error: 'Gagal memuat daftar guru' })
  }
})

// GET /:id — detail guru
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, email, whatsapp, kelas_diampu,
              jabatan, wali_kelas_kelas, photo_url, bio, created_at
       FROM gurus WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/guru] detail error:', err)
    res.status(500).json({ error: 'Gagal memuat data guru' })
  }
})

// POST / — tambah guru baru (admin/kepala sekolah only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, name, password, email, whatsapp, jabatan, kelas_diampu, wali_kelas_kelas } = req.body || {}
    if (!username || !name || !password) {
      return res.status(400).json({ error: 'Username, nama, dan password wajib diisi' })
    }

    // ID dari username (lowercase, spasi → tanda hubung)
    const id = String(username).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Cek duplikat
    const existing = await pool.query('SELECT id FROM gurus WHERE username = $1 OR id = $2', [username, id])
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Username sudah digunakan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO gurus (id, username, name, password, email, whatsapp, jabatan, kelas_diampu, wali_kelas_kelas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, username, name, email, whatsapp, jabatan, kelas_diampu, wali_kelas_kelas, created_at`,
      [
        id, username, name, password,
        email || null,
        whatsapp || null,
        jabatan || [],
        kelas_diampu || [],
        wali_kelas_kelas || null,
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/guru] tambah error:', err)
    res.status(500).json({ error: 'Gagal menambahkan guru' })
  }
})

// PUT /:id — update data guru
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const { id } = req.params
    const me = req.session.user
    const jabatanSaya = me.jabatan || []
    const isAdmin = jabatanSaya.includes('kepala_sekolah') || jabatanSaya.includes('admin')

    // Guru hanya bisa edit diri sendiri kecuali admin
    if (me.id !== id && !isAdmin) {
      return res.status(403).json({ error: 'Anda hanya bisa mengubah data diri sendiri' })
    }

    const { name, email, whatsapp, photo_url, bio, jabatan, kelas_diampu, wali_kelas_kelas } = req.body || {}

    const existing = await pool.query('SELECT id FROM gurus WHERE id = $1', [id])
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' })

    const { rows } = await pool.query(
      `UPDATE gurus SET
        name             = COALESCE($2, name),
        email            = COALESCE($3, email),
        whatsapp         = COALESCE($4, whatsapp),
        photo_url        = COALESCE($5, photo_url),
        bio              = COALESCE($6, bio),
        jabatan          = COALESCE($7, jabatan),
        kelas_diampu     = COALESCE($8, kelas_diampu),
        wali_kelas_kelas = COALESCE($9, wali_kelas_kelas)
       WHERE id = $1
       RETURNING id, username, name, email, whatsapp, jabatan, kelas_diampu, wali_kelas_kelas, photo_url, bio`,
      [id, name || null, email || null, whatsapp || null, photo_url || null, bio || null,
       jabatan || null, kelas_diampu || null, wali_kelas_kelas || null]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/guru] update error:', err)
    res.status(500).json({ error: 'Gagal memperbarui data guru' })
  }
})

// DELETE /:id — hapus guru (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === req.session.user.id) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' })
    }
    const result = await pool.query('DELETE FROM gurus WHERE id = $1 RETURNING id', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' })
    res.json({ ok: true, id })
  } catch (err) {
    console.error('[eob5/guru] hapus error:', err)
    res.status(500).json({ error: 'Gagal menghapus guru' })
  }
})

export default router
