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
  normalizeKelas,
  getJakartaTodayDateString,
} from './helpers.js'
import { notifyUser } from '../notifications.js'

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

    const studentRes = await pool.query('SELECT id, name, kelas FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }
    const { name: studentName, kelas: studentKelas } = studentRes.rows[0]

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

    // Notifikasi wali kelas bahwa siswa telah mengisi BLP hari ini
    pool.query(
      `SELECT id FROM gurus WHERE wali_kelas_kelas ILIKE $1 AND 'wali_kelas' = ANY(jabatan) LIMIT 1`,
      [studentKelas]
    ).then(({ rows }) => {
      if (rows.length) {
        notifyUser({
          userId: rows[0].id, role: 'guru',
          type: 'blp_submit', source: 'blp',
          title: 'BLP Harian Diisi',
          body: `${studentName} baru saja mengisi BLP Harian hari ini (${date}).`,
          url: '/',
        }).catch(() => {})
      }
    }).catch(() => {})

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
      // Gunakan sesi yang sudah divalidasi saat login — tidak perlu DB call tambahan
      const { jabatan = [], wali_kelas_kelas } = req.session.user
      const jabatanArr = Array.isArray(jabatan) ? jabatan : [jabatan]
      if (!jabatanArr.includes('wali_kelas') || !wali_kelas_kelas) {
        return res.status(403).json({ error: 'Hanya wali kelas yang dapat melakukan review BLP' })
      }

      const studentRes = await pool.query('SELECT kelas, name FROM students WHERE id = $1', [id])
      if (studentRes.rowCount === 0) {
        return res.status(404).json({ error: 'Siswa tidak ditemukan' })
      }
      const studentKelas = normalizeKelas(studentRes.rows[0].kelas)
      const studentName = studentRes.rows[0].name
      if (normalizeKelas(wali_kelas_kelas) !== studentKelas) {
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
      const isFirstReview = !submission.reviewedAt
      if (isFirstReview) {
        submission.reviewedAt = new Date().toISOString()
        submissions[activityId] = submission
        await pool.query(
          'UPDATE daily_records SET submissions = $3::jsonb WHERE student_id = $1 AND record_date = $2',
          [id, date, JSON.stringify(submissions)]
        )
        // Notifikasi siswa bahwa wali kelas sudah meninjau BLP-nya
        notifyUser({
          userId: id, role: 'siswa',
          type: 'blp_feedback', source: 'blp',
          title: 'BLP Harian Ditinjau',
          body: `Wali kelasmu telah meninjau pengisian BLP kamu tanggal ${date}.`,
          url: '/',
        }).catch(() => {})
      }

      res.json(submission)
    } catch (err) {
      console.error('[blp/aktivitas] review submission error', err)
      res.status(500).json({ error: 'Gagal menandai tugas sebagai ditinjau' })
    }
  }
)

export default router
