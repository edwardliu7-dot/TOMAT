/**
 * server/eob5/documents.js
 * Upload/download dokumen per mata pelajaran.
 * Menggunakan tabel lama `documents` dan `subjects`.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

const META_COLS = `id, subject_id, name, description,
                   file_name, file_type, file_size, uploaded_at`

async function ownsSubject(subjectId, guruId) {
  const { rows } = await pool.query(
    'SELECT id FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows.length > 0
}

// GET / — daftar dokumen
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id } = req.query

    if (subject_id) {
      if (!(await ownsSubject(subject_id, guruId))) return res.json([])
      const { rows } = await pool.query(
        `SELECT ${META_COLS} FROM documents
         WHERE subject_id = $1 ORDER BY uploaded_at DESC`,
        [subject_id]
      )
      return res.json(rows)
    }

    const { rows } = await pool.query(
      `SELECT d.id, d.subject_id, d.name, d.description,
              d.file_name, d.file_type, d.file_size, d.uploaded_at
       FROM documents d
       JOIN subjects s ON s.id = d.subject_id
       WHERE s.teacher_id = $1 AND s.deleted_at IS NULL
       ORDER BY d.uploaded_at DESC`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/documents] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar dokumen' })
  }
})

// POST / — upload dokumen
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, name, description, file_name, file_type, file_size, file_data } = req.body || {}

    if (!name) return res.status(400).json({ error: 'Nama dokumen wajib diisi' })
    if (!subject_id) return res.status(400).json({ error: 'subject_id wajib diisi' })
    if (!(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    if (file_data && file_data.length > 14_000_000) {
      return res.status(413).json({ error: 'File terlalu besar (maks. ~10 MB)' })
    }

    const { rows } = await pool.query(
      `INSERT INTO documents
         (subject_id, name, description, file_name, file_type, file_size, file_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING ${META_COLS}`,
      [subject_id, name, description || null, file_name || null,
       file_type || null, file_size || null, file_data || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/documents] upload error:', err)
    res.status(500).json({ error: 'Gagal menyimpan dokumen' })
  }
})

// DELETE /:id — hapus dokumen
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows: existing } = await pool.query(
      'SELECT subject_id FROM documents WHERE id = $1', [id]
    )
    if (!existing.length || !(await ownsSubject(existing[0].subject_id, guruId))) {
      return res.status(404).json({ error: 'Dokumen tidak ditemukan' })
    }

    await pool.query('DELETE FROM documents WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/documents] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus dokumen' })
  }
})

// GET /:id/file — download / inline
router.get('/:id/file', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT d.subject_id, d.file_data, d.file_name, d.file_type
       FROM documents d
       WHERE d.id = $1`,
      [id]
    )
    if (!rows.length || !(await ownsSubject(rows[0].subject_id, guruId))) {
      return res.status(404).json({ error: 'Dokumen tidak ditemukan' })
    }

    const doc = rows[0]
    if (!doc.file_data) {
      return res.status(404).json({ error: 'File tidak tersedia' })
    }

    const buffer = Buffer.from(doc.file_data, 'base64')
    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream')
    res.setHeader('Content-Length', String(buffer.length))
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.file_name || 'file')}"`
    )
    res.send(buffer)
  } catch (err) {
    console.error('[eob5/documents] download error:', err)
    res.status(500).json({ error: 'Gagal mengunduh dokumen' })
  }
})

export default router
