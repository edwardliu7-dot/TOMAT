/**
 * server/blp/haid.js
 * POST /api/blp/students/:id/haid     — catat mulai periode haid
 * PUT  /api/blp/students/:id/haid/end — catat selesai periode haid
 */

import express from 'express'
import { pool } from '../db.js'
import { requireBlpSiswa, getJakartaTodayDateString } from './helpers.js'

const router = express.Router()

// POST /api/blp/students/:id/haid
// Siswa perempuan mencatat awal periode haid.
// Aktivitas sholat tidak dihitung selama periode ini berjalan.
router.post('/students/:id/haid', requireBlpSiswa('id'), async (req, res) => {
  try {
    const { id } = req.params
    const today = getJakartaTodayDateString()

    const studentRes = await pool.query(
      'SELECT jenis_kelamin FROM students WHERE id = $1',
      [id]
    )
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }
    if (studentRes.rows[0].jenis_kelamin === 'L') {
      return res.status(400).json({ error: 'Fitur ini hanya tersedia untuk siswa perempuan' })
    }

    // Cegah periode ganda yang masih terbuka
    const openRes = await pool.query(
      'SELECT id FROM haid_periods WHERE student_id = $1 AND end_date IS NULL',
      [id]
    )
    if ((openRes.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: 'Masih ada periode haid yang belum ditutup' })
    }

    const result = await pool.query(
      'INSERT INTO haid_periods (student_id, start_date) VALUES ($1, $2) RETURNING id, start_date',
      [id, today]
    )

    res.json({
      id: result.rows[0].id,
      startDate: result.rows[0].start_date.toISOString().slice(0, 10),
      endDate: null,
    })
  } catch (err) {
    console.error('[blp/haid] POST haid error', err)
    res.status(500).json({ error: 'Gagal mencatat awal haid' })
  }
})

// PUT /api/blp/students/:id/haid/end
// Siswa menutup periode haid yang sedang aktif.
router.put('/students/:id/haid/end', requireBlpSiswa('id'), async (req, res) => {
  try {
    const { id } = req.params
    const today = getJakartaTodayDateString()

    const result = await pool.query(
      `UPDATE haid_periods
       SET end_date = $2, updated_at = now()
       WHERE student_id = $1 AND end_date IS NULL
       RETURNING id, start_date, end_date`,
      [id, today]
    )

    if ((result.rowCount ?? 0) === 0) {
      return res.status(404).json({ error: 'Tidak ada periode haid yang sedang aktif' })
    }

    res.json({
      id: result.rows[0].id,
      startDate: result.rows[0].start_date.toISOString().slice(0, 10),
      endDate: result.rows[0].end_date.toISOString().slice(0, 10),
    })
  } catch (err) {
    console.error('[blp/haid] PUT haid/end error', err)
    res.status(500).json({ error: 'Gagal mencatat akhir haid' })
  }
})

export default router
