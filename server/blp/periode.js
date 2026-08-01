/**
 * server/blp/periode.js
 * PUT /api/blp/periods — guru (wali kelas) mengatur rentang tanggal aktif BLP per kelas/bulan
 */

import express from 'express'
import { pool } from '../db.js'
import { requireBlpGuru, loadGuru, normalizeKelas } from './helpers.js'

const router = express.Router()

// PUT /api/blp/periods
// Guru mengatur rentang hari aktif BLP untuk satu kelas di bulan tertentu.
// Hanya wali kelas untuk kelas tersebut yang bisa mengatur.
router.put('/periods', requireBlpGuru(), async (req, res) => {
  try {
    const { kelas, year, month, startDay, endDay } = req.body || {}

    if (
      typeof kelas !== 'string' || !kelas.trim() ||
      !Number.isInteger(year) || year < 2000 || year > 2100 ||
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(startDay) || startDay < 1 || startDay > 31 ||
      !Number.isInteger(endDay) || endDay < 1 || endDay > 31 ||
      endDay < startDay
    ) {
      return res.status(400).json({ error: 'Data rentang tanggal aktif BLP tidak valid' })
    }

    const guru = await loadGuru(req.session.user.id)
    if (!guru) {
      return res.status(404).json({ error: 'Akun guru tidak ditemukan atau bukan wali kelas' })
    }

    const targetKelas = normalizeKelas(kelas)
    if (!guru.kelasWali.includes(targetKelas)) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengatur kelas ini' })
    }

    await pool.query(
      `INSERT INTO blp_periods (kelas, year, month, start_day, end_day, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (kelas, year, month)
       DO UPDATE SET
         start_day  = EXCLUDED.start_day,
         end_day    = EXCLUDED.end_day,
         updated_by = EXCLUDED.updated_by,
         updated_at = now()`,
      [targetKelas, year, month, startDay, endDay, guru.id]
    )

    res.json({ kelas: targetKelas, year, month, startDay, endDay })
  } catch (err) {
    console.error('[blp/periode] error', err)
    res.status(500).json({ error: 'Gagal menyimpan rentang tanggal aktif BLP' })
  }
})

export default router
