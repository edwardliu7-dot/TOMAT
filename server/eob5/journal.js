/**
 * server/eob5/journal.js
 * CRUD jurnal mengajar.
 * Menggunakan tabel lama `journal_entries` dan `subjects`.
 * Kolom: teacher_id (bukan guru_id).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

async function ownsSubject(subjectId, guruId) {
  const { rows } = await pool.query(
    'SELECT id FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows.length > 0
}

// GET / — daftar jurnal
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id } = req.query

    if (subject_id) {
      if (!(await ownsSubject(subject_id, guruId))) {
        return res.json([])
      }
      const { rows } = await pool.query(
        `SELECT j.*, s.name AS subject_name
         FROM journal_entries j
         LEFT JOIN subjects s ON s.id = j.subject_id
         WHERE j.subject_id = $1 AND j.teacher_id = $2
         ORDER BY j.tanggal DESC, j.created_at DESC`,
        [subject_id, guruId]
      )
      return res.json(rows)
    }

    const { rows } = await pool.query(
      `SELECT j.*, s.name AS subject_name
       FROM journal_entries j
       LEFT JOIN subjects s ON s.id = j.subject_id
       WHERE j.teacher_id = $1
       ORDER BY j.tanggal DESC, j.created_at DESC`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/journal] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil jurnal' })
  }
})

// POST / — buat entri jurnal
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, tanggal, kelas, materi, kd, jp, catatan, prosem_item_id } = req.body || {}

    if (!subject_id || !tanggal || !kelas || !materi) {
      return res.status(400).json({ error: 'subject_id, tanggal, kelas, dan materi wajib diisi' })
    }
    if (!(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO journal_entries
         (teacher_id, subject_id, tanggal, kelas, materi, kd, jp, catatan, prosem_item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [guruId, subject_id, tanggal, kelas, materi, kd || null, jp || null, catatan || null, prosem_item_id || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/journal] create error:', err)
    res.status(500).json({ error: 'Gagal membuat entri jurnal' })
  }
})

// PATCH /:id — update entri
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { subject_id, tanggal, kelas, materi, kd, jp, catatan, prosem_item_id } = req.body || {}

    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `UPDATE journal_entries
       SET subject_id      = COALESCE($1, subject_id),
           tanggal         = COALESCE($2, tanggal),
           kelas           = COALESCE($3, kelas),
           materi          = COALESCE($4, materi),
           kd              = COALESCE($5, kd),
           jp              = COALESCE($6, jp),
           catatan         = COALESCE($7, catatan),
           prosem_item_id  = COALESCE($8, prosem_item_id)
       WHERE id = $9 AND teacher_id = $10
       RETURNING *`,
      [subject_id || null, tanggal || null, kelas || null, materi || null,
       kd !== undefined ? kd : null, jp !== undefined ? jp : null,
       catatan !== undefined ? catatan : null,
       prosem_item_id !== undefined ? prosem_item_id : null,
       id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Entri jurnal tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/journal] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate entri jurnal' })
  }
})

// DELETE /:id — hapus entri
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      'DELETE FROM journal_entries WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Entri jurnal tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/journal] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus entri jurnal' })
  }
})

export default router
