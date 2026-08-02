/**
 * server/eob5/tujuan-pembelajaran.js
 * CRUD tujuan pembelajaran per prosem/subject.
 * Menggunakan tabel lama `tujuan_pembelajaran` dan `subjects`.
 * Kolom: teacher_id (bukan guru_id), description (bukan deskripsi).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

async function ownsSubject(subjectId, guruId) {
  if (!subjectId) return true
  const { rows } = await pool.query(
    'SELECT id FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows.length > 0
}

// GET / — daftar TP
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, kelas, mata_pelajaran } = req.query

    if (subject_id && !(await ownsSubject(subject_id, guruId))) return res.json([])

    const params = [guruId]
    const conditions = ['teacher_id = $1']
    let idx = 2

    if (subject_id) { params.push(subject_id); conditions.push(`subject_id = $${idx++}`) }
    if (calendar_id) { params.push(calendar_id); conditions.push(`calendar_id = $${idx++}`) }
    if (kelas) { params.push(kelas); conditions.push(`kelas = $${idx++}`) }
    if (mata_pelajaran) { params.push(mata_pelajaran); conditions.push(`mata_pelajaran = $${idx++}`) }

    const { rows } = await pool.query(
      `SELECT id, teacher_id AS guru_id, subject_id, calendar_id,
              mata_pelajaran, kelas, description AS deskripsi, kode_tp,
              lingkup_materi, tp_number, created_at
       FROM tujuan_pembelajaran
       WHERE ${conditions.join(' AND ')}
       ORDER BY tp_number ASC, created_at ASC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/tp] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil tujuan pembelajaran' })
  }
})

// POST / — buat TP
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, mata_pelajaran, kelas, deskripsi, kode_tp,
            lingkup_materi, tp_number } = req.body || {}

    if (!deskripsi) return res.status(400).json({ error: 'Deskripsi TP wajib diisi' })
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO tujuan_pembelajaran
         (teacher_id, subject_id, calendar_id, mata_pelajaran, kelas, description,
          kode_tp, lingkup_materi, tp_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, teacher_id AS guru_id, subject_id, calendar_id,
                 mata_pelajaran, kelas, description AS deskripsi, kode_tp,
                 lingkup_materi, tp_number, created_at`,
      [guruId, subject_id || null, calendar_id || null, mata_pelajaran || null,
       kelas || null, deskripsi, kode_tp || null,
       lingkup_materi !== undefined ? lingkup_materi : null,
       tp_number !== undefined ? tp_number : null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/tp] create error:', err)
    res.status(500).json({ error: 'Gagal membuat tujuan pembelajaran' })
  }
})

// POST /bulk — buat banyak TP sekaligus
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, items } = req.body || {}

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items[] wajib diisi' })
    }
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const client = await pool.connect()
    let count = 0
    try {
      await client.query('BEGIN')
      for (const item of items) {
        if (!item.deskripsi) continue
        await client.query(
          `INSERT INTO tujuan_pembelajaran
             (teacher_id, subject_id, calendar_id, mata_pelajaran, kelas, description,
              kode_tp, lingkup_materi, tp_number)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [guruId, subject_id || item.subject_id || null,
           calendar_id || item.calendar_id || null,
           item.mata_pelajaran || null, item.kelas || null, item.deskripsi,
           item.kode_tp || null,
           item.lingkup_materi !== undefined ? item.lingkup_materi : null,
           item.tp_number !== undefined ? item.tp_number : null]
        )
        count++
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ count, skipped: items.length - count })
  } catch (err) {
    console.error('[eob5/tp] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan tujuan pembelajaran' })
  }
})

// PATCH /:id — update TP
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { deskripsi, kode_tp, mata_pelajaran, kelas, lingkup_materi, tp_number } = req.body || {}

    const { rows } = await pool.query(
      `UPDATE tujuan_pembelajaran
       SET description    = COALESCE($1, description),
           kode_tp        = COALESCE($2, kode_tp),
           mata_pelajaran = COALESCE($3, mata_pelajaran),
           kelas          = COALESCE($4, kelas),
           lingkup_materi = COALESCE($5, lingkup_materi),
           tp_number      = COALESCE($6, tp_number)
       WHERE id = $7 AND teacher_id = $8
       RETURNING id, teacher_id AS guru_id, subject_id, calendar_id,
                 mata_pelajaran, kelas, description AS deskripsi, kode_tp,
                 lingkup_materi, tp_number, created_at`,
      [deskripsi || null, kode_tp !== undefined ? kode_tp : null,
       mata_pelajaran || null, kelas || null,
       lingkup_materi !== undefined ? lingkup_materi : null,
       tp_number !== undefined ? tp_number : null, id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'TP tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/tp] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate tujuan pembelajaran' })
  }
})

// DELETE /:id — hapus TP
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { rows } = await pool.query(
      'DELETE FROM tujuan_pembelajaran WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'TP tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/tp] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus tujuan pembelajaran' })
  }
})

export default router
