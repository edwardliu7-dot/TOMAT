/**
 * server/blp/aktivitas.js
 * PUT /api/blp/students/:id/records/:date          — siswa isi checklist harian
 * PUT /api/blp/students/:id/records/:date/submissions/:activityId/review — guru review
 */

import express from 'express'
import { pool } from '../db.js'
import {
  requireBlpSiswa,
  requireBlpGuru,
  loadGuru,
  normalizeKelas,
  getJakartaTodayDateString,
} from './helpers.js'

const router = express.Router()

// PUT /api/blp/students/:id/records/:date
// Siswa menyimpan checklist aktivitas harian BLP.
// Hanya bisa untuk tanggal hari ini (WIB).
router.put('/students/:id/records/:date', requireBlpSiswa('id'), async (req, res) => {
  try {
    const { id, date } = req.params
    const { completedActivities, score, submissions } = req.body || {}

    if (date !== getJakartaTodayDateString()) {
      return res.status(403).json({
        error: 'BLP hanya bisa diisi untuk hari ini. Tanggal yang sudah lewat atau belum tiba tidak dapat diubah.',
      })
    }

    const studentRes = await pool.query('SELECT id FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const submissionsJson = JSON.stringify(
      submissions && typeof submissions === 'object' ? submissions : {}
    )

    await pool.query(
      `INSERT INTO daily_records (student_id, record_date, completed_activities, score, submissions)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (student_id, record_date)
       DO UPDATE SET
         completed_activities = EXCLUDED.completed_activities,
         score                = EXCLUDED.score,
         submissions          = EXCLUDED.submissions,
         updated_at           = now()`,
      [
        id,
        date,
        Array.isArray(completedActivities) ? completedActivities : [],
        score ?? null,
        submissionsJson,
      ]
    )

    res.json({
      date,
      completedActivities: Array.isArray(completedActivities) ? completedActivities : [],
      score: score ?? null,
      submissions: submissions && typeof submissions === 'object' ? submissions : {},
    })
  } catch (err) {
    console.error('[blp/aktivitas] PUT records error', err)
    res.status(500).json({ error: 'Gagal menyimpan data BLP' })
  }
})

// PUT /api/blp/students/:id/records/:date/submissions/:activityId/review
// Guru menandai submission siswa sebagai sudah ditinjau (sekali saja).
// Setelah ditandai, konten upload akan dihapus otomatis setelah 7 hari.
router.put(
  '/students/:id/records/:date/submissions/:activityId/review',
  requireBlpGuru(),
  async (req, res) => {
    try {
      const { id, date, activityId } = req.params
      const guru = await loadGuru(req.session.user.id)
      if (!guru) {
        return res.status(404).json({ error: 'Akun guru tidak ditemukan atau bukan wali kelas' })
      }

      const studentRes = await pool.query('SELECT kelas FROM students WHERE id = $1', [id])
      if (studentRes.rowCount === 0) {
        return res.status(404).json({ error: 'Siswa tidak ditemukan' })
      }
      const studentKelas = normalizeKelas(studentRes.rows[0].kelas)
      if (!guru.kelasWali.includes(studentKelas)) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses ke data siswa ini' })
      }

      const recordRes = await pool.query(
        'SELECT submissions FROM daily_records WHERE student_id = $1 AND record_date = $2',
        [id, date]
      )
      if (recordRes.rowCount === 0) {
        return res.status(404).json({ error: 'Data BLP untuk tanggal ini tidak ditemukan' })
      }

      const submissions = recordRes.rows[0].submissions || {}
      const submission = submissions[activityId]
      if (!submission) {
        return res.status(404).json({ error: 'Tidak ada tugas yang dikumpulkan untuk kegiatan ini' })
      }

      // Hanya tandai sekali — tidak reset jika sudah direview
      if (!submission.reviewedAt) {
        submission.reviewedAt = new Date().toISOString()
        submissions[activityId] = submission
        await pool.query(
          'UPDATE daily_records SET submissions = $3::jsonb WHERE student_id = $1 AND record_date = $2',
          [id, date, JSON.stringify(submissions)]
        )
      }

      res.json(submission)
    } catch (err) {
      console.error('[blp/aktivitas] review submission error', err)
      res.status(500).json({ error: 'Gagal menandai tugas sebagai ditinjau' })
    }
  }
)

export default router
