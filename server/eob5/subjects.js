/**
 * server/eob5/subjects.js
 * CRUD mata pelajaran per guru.
 *
 * GET    /api/eob5/subjects         — daftar mata pelajaran (soft-delete aware)
 * POST   /api/eob5/subjects         — buat mata pelajaran baru
 * PATCH  /api/eob5/subjects/:id     — update nama
 * DELETE /api/eob5/subjects/:id     — soft-delete
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

/**
 * Sync "folder" subjects otomatis dari mapel × kelas_diampu guru.
 * Tidak membuat ulang yang sudah pernah di-soft-delete.
 */
async function syncSubjectFolders(guruId, mapel, kelasDiampu) {
  if (!mapel?.length || !kelasDiampu?.length) return

  // Ambil semua (termasuk yang terhapus) agar tidak recreate yang dihapus
  const { rows: existing } = await pool.query(
    'SELECT name FROM eob5_subjects WHERE guru_id = $1',
    [guruId]
  )
  const existingNames = new Set(existing.map(s => s.name))

  const missing = []
  for (const m of mapel) {
    for (const k of kelasDiampu) {
      const name = `${m} - ${k}`
      if (!existingNames.has(name)) missing.push([guruId, name])
    }
  }

  for (const [gid, name] of missing) {
    await pool.query(
      'INSERT INTO eob5_subjects (guru_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [gid, name]
    )
  }
}

// GET / — daftar mata pelajaran aktif (deleted_at IS NULL)
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    // Ambil data guru untuk sync folder
    const { rows: guruRows } = await pool.query(
      'SELECT mapel, kelas_diampu FROM gurus WHERE id = $1',
      [guruId]
    )
    if (guruRows.length) {
      const g = guruRows[0]
      await syncSubjectFolders(guruId, g.mapel || [], g.kelas_diampu || [])
    }

    const { rows } = await pool.query(
      `SELECT id, guru_id, name, created_at
       FROM eob5_subjects
       WHERE guru_id = $1 AND deleted_at IS NULL
       ORDER BY name`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/subjects] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar mata pelajaran' })
  }
})

// POST / — buat mata pelajaran baru
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { name } = req.body || {}
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nama mata pelajaran wajib diisi' })
    }

    const { rows } = await pool.query(
      `INSERT INTO eob5_subjects (guru_id, name)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id, guru_id, name, created_at`,
      [guruId, name.trim()]
    )
    if (!rows.length) {
      return res.status(409).json({ error: 'Mata pelajaran dengan nama ini sudah ada' })
    }
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/subjects] create error:', err)
    res.status(500).json({ error: 'Gagal membuat mata pelajaran' })
  }
})

// PATCH /:id — update nama
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { name } = req.body || {}
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama mata pelajaran wajib diisi' })
    }

    const { rows } = await pool.query(
      `UPDATE eob5_subjects
       SET name = $1
       WHERE id = $2 AND guru_id = $3 AND deleted_at IS NULL
       RETURNING id, guru_id, name, created_at`,
      [name.trim(), id, guruId]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/subjects] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate mata pelajaran' })
  }
})

// DELETE /:id — soft-delete
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      `UPDATE eob5_subjects
       SET deleted_at = NOW()
       WHERE id = $1 AND guru_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [id, guruId]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/subjects] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus mata pelajaran' })
  }
})

export default router
