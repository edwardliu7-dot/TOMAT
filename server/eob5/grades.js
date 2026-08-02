/**
 * server/eob5/grades.js
 * CRUD nilai siswa (formatif / sumatif_lm / sumatif_akhir).
 * Menggunakan tabel lama `grades` dan `subjects`.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

async function getStudentIds(guruId) {
  const { rows } = await pool.query(
    `SELECT s.id FROM students s
     JOIN gurus g ON s.kelas = ANY(g.kelas_diampu)
     WHERE g.id = $1`,
    [guruId]
  )
  return new Set(rows.map(r => r.id))
}

async function ownsSubject(subjectId, guruId) {
  const { rows } = await pool.query(
    'SELECT id FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows.length > 0
}

// GET / — daftar nilai
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, subject_id, calendar_id, jenis } = req.query

    const allowed = await getStudentIds(guruId)
    if (!allowed.size) return res.json([])
    if (student_id && !allowed.has(student_id)) return res.json([])

    const params = []
    const conditions = []

    if (student_id) {
      params.push(student_id); conditions.push(`g.student_id = $${params.length}`)
    } else {
      params.push([...allowed]); conditions.push(`g.student_id = ANY($${params.length}::text[])`)
    }
    if (subject_id) { params.push(subject_id); conditions.push(`g.subject_id = $${params.length}`) }
    if (calendar_id) { params.push(calendar_id); conditions.push(`g.calendar_id = $${params.length}`) }
    if (jenis) { params.push(jenis); conditions.push(`g.jenis = $${params.length}`) }

    const { rows } = await pool.query(
      `SELECT g.*, s.name AS siswa_name, s.kelas, sub.name AS subject_name
       FROM grades g
       JOIN students s ON s.id = g.student_id
       LEFT JOIN subjects sub ON sub.id = g.subject_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY g.created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/grades] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil data nilai' })
  }
})

// POST / — input nilai
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, subject_id, calendar_id, jenis, lingkup_materi, nilai, keterangan } = req.body || {}

    if (!student_id || !jenis || nilai === undefined) {
      return res.status(400).json({ error: 'student_id, jenis, dan nilai wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    if (!allowed.has(student_id)) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO grades
         (student_id, guru_id, subject_id, calendar_id, jenis, lingkup_materi, nilai, keterangan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [student_id, guruId, subject_id || null, calendar_id || null,
       jenis, lingkup_materi || null, nilai, keterangan || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/grades] create error:', err)
    res.status(500).json({ error: 'Gagal menyimpan nilai' })
  }
})

// PATCH /:id — update nilai
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { nilai, keterangan, jenis, lingkup_materi } = req.body || {}

    const allowed = await getStudentIds(guruId)
    const { rows: existing } = await pool.query(
      'SELECT student_id FROM grades WHERE id = $1', [id]
    )
    if (!existing.length || !allowed.has(existing[0].student_id)) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `UPDATE grades
       SET nilai          = COALESCE($1, nilai),
           keterangan     = COALESCE($2, keterangan),
           jenis          = COALESCE($3, jenis),
           lingkup_materi = COALESCE($4, lingkup_materi)
       WHERE id = $5
       RETURNING *`,
      [nilai !== undefined ? nilai : null, keterangan !== undefined ? keterangan : null,
       jenis || null, lingkup_materi || null, id]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/grades] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate nilai' })
  }
})

// DELETE /:id — hapus nilai
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const allowed = await getStudentIds(guruId)
    const { rows: existing } = await pool.query(
      'SELECT student_id FROM grades WHERE id = $1', [id]
    )
    if (!existing.length || !allowed.has(existing[0].student_id)) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' })
    }

    await pool.query('DELETE FROM grades WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/grades] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus nilai' })
  }
})

export default router
