/**
 * server/eob5/grades.js
 * CRUD nilai siswa (formatif / sumatif_lm / sumatif_akhir).
 * Menggunakan tabel lama `grades` dan `subjects`.
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
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
      params.push(student_id); conditions.push(`g.student_id::text = $${params.length}`)
    } else {
      params.push([...allowed]); conditions.push(`g.student_id::text = ANY($${params.length}::text[])`)
    }
    if (subject_id) { params.push(subject_id); conditions.push(`g.subject_id = $${params.length}::uuid`) }
    if (calendar_id) { params.push(calendar_id); conditions.push(`g.calendar_id = $${params.length}`) }
    if (jenis) { params.push(jenis); conditions.push(`g.jenis = $${params.length}`) }

    const { rows } = await pool.query(
      `SELECT g.*, s.name AS siswa_name, s.kelas, sub.name AS subject_name
       FROM grades g
       JOIN students s ON s.id = g.student_id::text
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

const JENIS_VALID = ['formatif', 'sumatif_lm', 'sumatif_tengah', 'sumatif_akhir']

// POST / — input nilai (upsert per jenis)
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    // Support both camelCase (frontend) and snake_case (API)
    const student_id    = req.body?.student_id    || req.body?.studentId
    const subject_id    = req.body?.subject_id    || req.body?.subjectId    || null
    const calendar_id   = req.body?.calendar_id   || req.body?.calendarId   || null
    const jenis         = req.body?.jenis
    const lingkup_materi = req.body?.lingkup_materi ?? req.body?.lingkupMateri ?? null
    const tp_number     = req.body?.tp_number     ?? req.body?.tpNumber     ?? null
    const nilai         = req.body?.nilai
    const keterangan    = req.body?.keterangan    || null

    if (!student_id || !jenis || nilai === undefined) {
      return res.status(400).json({ error: 'student_id, jenis, dan nilai wajib diisi' })
    }
    if (!JENIS_VALID.includes(jenis)) {
      return res.status(400).json({ error: `Jenis tidak valid: ${jenis}. Harus salah satu dari: ${JENIS_VALID.join(', ')}` })
    }

    const allowed = await getStudentIds(guruId)
    if (!allowed.has(student_id)) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    // Upsert: cek apakah sudah ada berdasarkan constraint per jenis
    let existingId = null
    if (jenis === 'sumatif_tengah' || jenis === 'sumatif_akhir') {
      const { rows: ex } = await pool.query(
        `SELECT id FROM grades
         WHERE student_id::text=$1 AND subject_id IS NOT DISTINCT FROM $2
           AND calendar_id IS NOT DISTINCT FROM $3 AND jenis=$4`,
        [student_id, subject_id, calendar_id, jenis]
      )
      if (ex.length) existingId = ex[0].id
    } else if (jenis === 'sumatif_lm') {
      const { rows: ex } = await pool.query(
        `SELECT id FROM grades
         WHERE student_id::text=$1 AND subject_id IS NOT DISTINCT FROM $2
           AND calendar_id IS NOT DISTINCT FROM $3 AND jenis=$4
           AND lingkup_materi IS NOT DISTINCT FROM $5`,
        [student_id, subject_id, calendar_id, jenis, lingkup_materi]
      )
      if (ex.length) existingId = ex[0].id
    } else {
      // formatif: unique per student+subject+calendar+lm+tp
      const { rows: ex } = await pool.query(
        `SELECT id FROM grades
         WHERE student_id::text=$1 AND subject_id IS NOT DISTINCT FROM $2
           AND calendar_id IS NOT DISTINCT FROM $3 AND jenis=$4
           AND lingkup_materi IS NOT DISTINCT FROM $5
           AND tp_number IS NOT DISTINCT FROM $6`,
        [student_id, subject_id, calendar_id, jenis, lingkup_materi, tp_number]
      )
      if (ex.length) existingId = ex[0].id
    }

    let row
    if (existingId) {
      const { rows } = await pool.query(
        `UPDATE grades SET nilai=$1, keterangan=$2, guru_id=$3 WHERE id=$4 RETURNING *`,
        [nilai, keterangan, guruId, existingId]
      )
      row = rows[0]
    } else {
      const { rows } = await pool.query(
        `INSERT INTO grades
           (student_id, guru_id, subject_id, calendar_id, jenis, lingkup_materi, tp_number, nilai, keterangan)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [student_id, guruId, subject_id, calendar_id, jenis, lingkup_materi, tp_number, nilai, keterangan]
      )
      row = rows[0]
    }
    res.status(existingId ? 200 : 201).json(row)
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
      'SELECT student_id::text AS student_id FROM grades WHERE id = $1', [id]
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
      'SELECT student_id::text AS student_id FROM grades WHERE id = $1', [id]
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
