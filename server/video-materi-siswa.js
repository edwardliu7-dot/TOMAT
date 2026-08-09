import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()

router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/video-materi?grade=7&subject=matematika
router.get('/video-materi', async (req, res) => {
  try {
    const grade = Number.parseInt(req.query.grade, 10)
    const subject = String(req.query.subject || '').trim().toLowerCase()
    if (![7, 8, 9].includes(grade) || !['matematika', 'ipa'].includes(subject)) {
      return res.status(400).json({ error: 'Parameter materi tidak valid.' })
    }

    const { rows: studentRows } = await pool.query(
      'select kelas from students where id = $1',
      [req.session.user.id],
    )
    const kelas = studentRows[0]?.kelas
    if (!kelas) return res.json({ videos: [] })

    const { rows } = await pool.query(
      `select id, kelas, grade, subject, bab, title, description,
              youtube_video_id, created_at
       from tomat_video_materi
       where kelas = $1 and grade = $2 and subject = $3
       order by bab, created_at desc`,
      [kelas, grade, subject],
    )
    res.json({
      videos: rows.map(row => ({
        id: row.id,
        kelas: row.kelas,
        grade: row.grade,
        subject: row.subject,
        bab: row.bab,
        title: row.title,
        description: row.description || '',
        youtubeVideoId: row.youtube_video_id,
        createdAt: row.created_at,
      })),
    })
  } catch (error) {
    console.error('siswa/video-materi GET error', error)
    res.status(500).json({ error: 'Video materi belum dapat dimuat.' })
  }
})

export default router