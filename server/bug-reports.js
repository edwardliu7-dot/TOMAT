import express from 'express'
import { pool } from './db.js'
import { requireAuth } from './auth.js'

const router = express.Router()

const CATEGORIES = new Set(['Gameplay', 'Tampilan', 'Login', 'Performa', 'Lainnya'])
const SEVERITIES = new Set(['rendah', 'sedang', 'tinggi'])

router.use(requireAuth)

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

// GET /api/bug-reports — only reports submitted by the current account.
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, category, title, description, screen, device_info,
              severity, status, admin_note, created_at, updated_at
       FROM bug_reports
       WHERE reporter_id = $1 AND reporter_role = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.session.user.id, req.session.user.role]
    )
    res.json({ reports: rows })
  } catch (err) {
    console.error('bug-reports/list error', err)
    res.status(500).json({ error: 'Gagal memuat laporan bug.' })
  }
})

// POST /api/bug-reports
router.post('/', async (req, res) => {
  const category = cleanText(req.body?.category, 30)
  const title = cleanText(req.body?.title, 120)
  const description = cleanText(req.body?.description, 2000)
  const screen = cleanText(req.body?.screen, 120)
  const deviceInfo = cleanText(req.body?.deviceInfo, 160)
  const severity = cleanText(req.body?.severity, 10) || 'sedang'

  if (!CATEGORIES.has(category)) {
    return res.status(400).json({ error: 'Kategori laporan tidak valid.' })
  }
  if (title.length < 5) {
    return res.status(400).json({ error: 'Judul laporan minimal 5 karakter.' })
  }
  if (description.length < 10) {
    return res.status(400).json({ error: 'Ceritakan bug minimal 10 karakter.' })
  }
  if (!SEVERITIES.has(severity)) {
    return res.status(400).json({ error: 'Tingkat dampak tidak valid.' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO bug_reports
         (reporter_id, reporter_role, category, title, description, screen, device_info, severity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, category, title, description, screen, device_info,
                 severity, status, admin_note, created_at, updated_at`,
      [
        req.session.user.id,
        req.session.user.role,
        category,
        title,
        description,
        screen || null,
        deviceInfo || null,
        severity,
      ]
    )
    res.status(201).json({ report: rows[0] })
  } catch (err) {
    console.error('bug-reports/create error', err)
    res.status(500).json({ error: 'Gagal menyimpan laporan bug.' })
  }
})

export default router