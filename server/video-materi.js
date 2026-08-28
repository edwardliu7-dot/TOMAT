import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { getGradeNumber } from './kelas.js'

const router = express.Router()

router.use(requireAuth, requireRole('guru'))

function parseYoutubeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null

  let url
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  let videoId = ''

  if (hostname === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] || ''
  } else if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
    if (url.pathname === '/watch') videoId = url.searchParams.get('v') || ''
    else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] || ''
    else if (url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2] || ''
    else if (url.pathname.startsWith('/live/')) videoId = url.pathname.split('/')[2] || ''
  }

  return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null
}

function requireGuruMapelTerdaftar(req, res, next) {
  if (!req.session.user?.hasMateriTerdaftar) {
    return res.status(403).json({
      error: 'Akses ditolak. Hanya guru mapel terdaftar yang dapat mengatur video materi.',
    })
  }
  next()
}

async function getMyKelasDiampu(req) {
  const { rows } = await pool.query(
    'select kelas_diampu from gurus where id = $1',
    [req.session.user.id],
  )
  return rows[0]?.kelas_diampu || []
}

function normalizePayload(body = {}) {
  const kelas = typeof body.kelas === 'string' ? body.kelas.trim() : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim().toLowerCase() : ''
  const bab = typeof body.bab === 'string' ? body.bab.trim().toUpperCase() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const youtubeUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : ''

  return {
    kelas,
    subject,
    bab,
    title,
    description,
    youtubeUrl,
    grade: getGradeNumber(kelas),
    youtubeVideoId: parseYoutubeUrl(youtubeUrl),
  }
}

function validatePayload(payload) {
  if (!payload.kelas || !payload.grade) return 'Kelas tidak valid.'
  if (!['matematika', 'ipa'].includes(payload.subject)) return 'Mata pelajaran tidak valid.'
  if (!['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(payload.bab)) return 'BAB tidak valid.'
  if (!payload.title || payload.title.length > 255) return 'Judul wajib diisi dan maksimal 255 karakter.'
  if (payload.description.length > 2000) return 'Deskripsi maksimal 2.000 karakter.'
  if (!payload.youtubeVideoId) return 'Masukkan link YouTube yang valid.'
  return null
}

function toClient(row) {
  return {
    id: row.id,
    kelas: row.kelas,
    grade: row.grade,
    subject: row.subject,
    bab: row.bab,
    title: row.title,
    description: row.description || '',
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /api/guru/video-materi — videos owned by this guru
router.get('/video-materi', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select id, kelas, grade, subject, bab, title, description,
              youtube_url, youtube_video_id, created_at, updated_at
       from tomat_video_materi
       where guru_id = $1
       order by kelas, subject, grade, bab, created_at desc`,
      [req.session.user.id],
    )
    res.json({ videos: rows.map(toClient) })
  } catch (error) {
    console.error('guru/video-materi GET error', error)
    res.status(500).json({ error: 'Video materi belum dapat dimuat.' })
  }
})

// POST /api/guru/video-materi
router.post('/video-materi', requireGuruMapelTerdaftar, async (req, res) => {
  try {
    const payload = normalizePayload(req.body)
    const error = validatePayload(payload)
    if (error) return res.status(400).json({ error })

    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(payload.kelas)) {
      return res.status(403).json({ error: 'Kamu tidak mengajar kelas ini.' })
    }

    const { rows } = await pool.query(
      `insert into tomat_video_materi
        (guru_id, kelas, grade, subject, bab, title, description, youtube_url, youtube_video_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       returning id, kelas, grade, subject, bab, title, description,
                 youtube_url, youtube_video_id, created_at, updated_at`,
      [
        req.session.user.id, payload.kelas, payload.grade, payload.subject,
        payload.bab, payload.title, payload.description || null,
        payload.youtubeUrl, payload.youtubeVideoId,
      ],
    )
    res.status(201).json({ video: toClient(rows[0]) })
  } catch (error) {
    console.error('guru/video-materi POST error', error)
    res.status(500).json({ error: 'Video materi belum dapat disimpan.' })
  }
})

// PATCH /api/guru/video-materi/:id
router.patch('/video-materi/:id', requireGuruMapelTerdaftar, async (req, res) => {
  try {
    const payload = normalizePayload(req.body)
    const error = validatePayload(payload)
    if (error) return res.status(400).json({ error })

    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(payload.kelas)) {
      return res.status(403).json({ error: 'Kamu tidak mengajar kelas ini.' })
    }

    const { rows } = await pool.query(
      `update tomat_video_materi
       set kelas = $1, grade = $2, subject = $3, bab = $4, title = $5,
           description = $6, youtube_url = $7, youtube_video_id = $8, updated_at = now()
       where id = $9 and guru_id = $10
       returning id, kelas, grade, subject, bab, title, description,
                 youtube_url, youtube_video_id, created_at, updated_at`,
      [
        payload.kelas, payload.grade, payload.subject, payload.bab,
        payload.title, payload.description || null, payload.youtubeUrl,
        payload.youtubeVideoId, req.params.id, req.session.user.id,
      ],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Video materi tidak ditemukan.' })
    res.json({ video: toClient(rows[0]) })
  } catch (error) {
    console.error('guru/video-materi PATCH error', error)
    res.status(500).json({ error: 'Video materi belum dapat diperbarui.' })
  }
})

// DELETE /api/guru/video-materi/:id
router.delete('/video-materi/:id', requireGuruMapelTerdaftar, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'delete from tomat_video_materi where id = $1 and guru_id = $2 returning id',
      [req.params.id, req.session.user.id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Video materi tidak ditemukan.' })
    res.json({ ok: true })
  } catch (error) {
    console.error('guru/video-materi DELETE error', error)
    res.status(500).json({ error: 'Video materi belum dapat dihapus.' })
  }
})

export default router