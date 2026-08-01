/**
 * server/eob5/academic-calendars.js
 * CRUD kalender akademik & pekan efektif.
 *
 * GET    /api/eob5/academic-calendars           — daftar kalender
 * POST   /api/eob5/academic-calendars           — buat kalender (admin)
 * DELETE /api/eob5/academic-calendars/:id       — hapus kalender (admin)
 * GET    /api/eob5/academic-weeks               — daftar pekan (filter: calendar_id)
 * POST   /api/eob5/academic-weeks               — buat pekan (admin)
 * PATCH  /api/eob5/academic-weeks/:id           — update pekan
 * DELETE /api/eob5/academic-weeks/:id           — hapus pekan (admin)
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru, requireAdmin } from './middleware.js'

const router = Router()

// ── Kalender Akademik ─────────────────────────────────────────────────────────

// GET /academic-calendars — daftar kalender per guru/sekolah
router.get('/academic-calendars', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      `SELECT * FROM eob5_academic_calendars
       WHERE guru_id = $1 OR is_shared = true
       ORDER BY tahun_ajaran DESC, semester`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/academic-calendars] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil kalender akademik' })
  }
})

// POST /academic-calendars — buat kalender baru
router.post('/academic-calendars', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { nama, tahun_ajaran, semester, is_shared } = req.body || {}

    if (!nama || !tahun_ajaran || semester === undefined) {
      return res.status(400).json({ error: 'nama, tahun_ajaran, dan semester wajib diisi' })
    }

    const { rows } = await pool.query(
      `INSERT INTO eob5_academic_calendars (guru_id, nama, tahun_ajaran, semester, is_shared)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [guruId, nama, tahun_ajaran, semester, is_shared ?? false]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/academic-calendars] create error:', err)
    res.status(500).json({ error: 'Gagal membuat kalender akademik' })
  }
})

// DELETE /academic-calendars/:id
router.delete('/academic-calendars/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      'DELETE FROM eob5_academic_calendars WHERE id = $1 AND guru_id = $2 RETURNING id',
      [id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Kalender tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/academic-calendars] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus kalender' })
  }
})

// ── Pekan Efektif ─────────────────────────────────────────────────────────────

async function calendarBelongsToGuru(calendarId, guruId) {
  const { rows } = await pool.query(
    'SELECT id FROM eob5_academic_calendars WHERE id = $1 AND (guru_id = $2 OR is_shared = true)',
    [calendarId, guruId]
  )
  return rows.length > 0
}

async function weekBelongsToGuru(weekId, guruId) {
  const { rows } = await pool.query(
    `SELECT w.id FROM eob5_academic_weeks w
     JOIN eob5_academic_calendars c ON c.id = w.calendar_id
     WHERE w.id = $1 AND (c.guru_id = $2 OR c.is_shared = true)`,
    [weekId, guruId]
  )
  return rows.length > 0
}

// GET /academic-weeks
router.get('/academic-weeks', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { calendar_id } = req.query

    if (calendar_id) {
      if (!(await calendarBelongsToGuru(calendar_id, guruId))) return res.json([])
      const { rows } = await pool.query(
        'SELECT * FROM eob5_academic_weeks WHERE calendar_id = $1 ORDER BY pekan_ke',
        [calendar_id]
      )
      return res.json(rows)
    }

    const { rows } = await pool.query(
      `SELECT w.* FROM eob5_academic_weeks w
       JOIN eob5_academic_calendars c ON c.id = w.calendar_id
       WHERE c.guru_id = $1 OR c.is_shared = true
       ORDER BY w.calendar_id, w.pekan_ke`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/academic-weeks] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar pekan' })
  }
})

// POST /academic-weeks
router.post('/academic-weeks', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { calendar_id, pekan_ke, tanggal_mulai, tanggal_selesai, jenis } = req.body || {}

    if (!calendar_id || pekan_ke === undefined || !tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({ error: 'calendar_id, pekan_ke, tanggal_mulai, tanggal_selesai wajib diisi' })
    }
    if (!(await calendarBelongsToGuru(calendar_id, guruId))) {
      return res.status(404).json({ error: 'Kalender tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO eob5_academic_weeks (calendar_id, pekan_ke, tanggal_mulai, tanggal_selesai, jenis)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [calendar_id, pekan_ke, tanggal_mulai, tanggal_selesai, jenis || 'efektif']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/academic-weeks] create error:', err)
    res.status(500).json({ error: 'Gagal membuat pekan' })
  }
})

// PATCH /academic-weeks/:id
router.patch('/academic-weeks/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { calendar_id, pekan_ke, tanggal_mulai, tanggal_selesai, jenis } = req.body || {}

    if (!(await weekBelongsToGuru(id, guruId))) {
      return res.status(404).json({ error: 'Pekan tidak ditemukan' })
    }
    if (calendar_id && !(await calendarBelongsToGuru(calendar_id, guruId))) {
      return res.status(404).json({ error: 'Kalender tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `UPDATE eob5_academic_weeks
       SET calendar_id    = COALESCE($1, calendar_id),
           pekan_ke       = COALESCE($2, pekan_ke),
           tanggal_mulai  = COALESCE($3, tanggal_mulai),
           tanggal_selesai= COALESCE($4, tanggal_selesai),
           jenis          = COALESCE($5, jenis)
       WHERE id = $6
       RETURNING *`,
      [calendar_id || null, pekan_ke !== undefined ? pekan_ke : null,
       tanggal_mulai || null, tanggal_selesai || null, jenis || null, id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Pekan tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/academic-weeks] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate pekan' })
  }
})

// DELETE /academic-weeks/:id
router.delete('/academic-weeks/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    if (!(await weekBelongsToGuru(id, guruId))) {
      return res.status(404).json({ error: 'Pekan tidak ditemukan' })
    }
    await pool.query('DELETE FROM eob5_academic_weeks WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/academic-weeks] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus pekan' })
  }
})

export default router
