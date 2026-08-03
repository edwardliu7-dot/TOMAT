/**
 * server/eob5/feedback.js
 * Feedback dari guru ke pengembang aplikasi + unread count untuk admin.
 * Menggunakan tabel lama `feedback` (bukan eob5_app_feedback).
 * Kolom: teacher_id (bukan guru_id), teacher_name (bukan guru_name).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru, requireAdmin } from './middleware.js'

const router = Router()

function isAdmin(user) {
  const jabatan = user.jabatan || []
  return jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
}

// GET /unread-count — harus sebelum GET /:id
router.get('/unread-count', requireGuru, async (req, res) => {
  try {
    if (!isAdmin(req.session.user)) return res.json({ count: 0 })
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS n FROM feedback WHERE is_read = false'
    )
    res.json({ count: parseInt(rows[0].n) })
  } catch (err) {
    console.error('[eob5/feedback] unread-count error:', err)
    res.status(500).json({ error: 'Gagal mengambil unread count' })
  }
})

// POST / — kirim feedback
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guruName = req.session.user.name || ''
    const { kategori, pesan, screenshot_base64, page_url } = req.body || {}

    if (!kategori || !['saran', 'kritik', 'bug'].includes(kategori)) {
      return res.status(400).json({ error: 'Kategori tidak valid. Pilih saran, kritik, atau bug.' })
    }
    if (!pesan || typeof pesan !== 'string' || !pesan.trim()) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' })
    }
    if (pesan.trim().length > 2000) {
      return res.status(400).json({ error: 'Pesan terlalu panjang (maks. 2000 karakter).' })
    }

    const cleanedScreenshot =
      typeof screenshot_base64 === 'string' && screenshot_base64.startsWith('data:image/')
        ? screenshot_base64 : null
    if (cleanedScreenshot && cleanedScreenshot.length > 2_000_000) {
      return res.status(413).json({ error: 'Screenshot terlalu besar (maks. 2 MB).' })
    }

    const { rows } = await pool.query(
      `INSERT INTO feedback
         (teacher_id, teacher_name, kategori, pesan, screenshot_base64, page_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [guruId, guruName, kategori, pesan.trim(),
       cleanedScreenshot, typeof page_url === 'string' ? page_url.slice(0, 500) : null]
    )
    res.status(201).json({ id: rows[0].id, message: 'Feedback berhasil dikirim. Terima kasih!' })
  } catch (err) {
    console.error('[eob5/feedback] create error:', err)
    res.status(500).json({ error: 'Gagal mengirim feedback' })
  }
})

// GET / — daftar feedback (admin: semua; guru biasa: milik sendiri)
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const admin  = isAdmin(req.session.user)
    const { rows } = await pool.query(
      admin
        ? `SELECT id, teacher_id AS guru_id, teacher_name AS guru_name,
                  kategori, pesan, page_url, is_read, created_at
           FROM feedback ORDER BY created_at DESC`
        : `SELECT id, teacher_id AS guru_id, teacher_name AS guru_name,
                  kategori, pesan, page_url, is_read, created_at
           FROM feedback WHERE teacher_id = $1 ORDER BY created_at DESC`,
      admin ? [] : [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/feedback] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar feedback' })
  }
})

// PATCH /:id/read — tandai sudah dibaca
router.patch('/:id/read', requireGuru, async (req, res) => {
  try {
    if (!isAdmin(req.session.user)) {
      return res.status(403).json({ error: 'Hanya admin yang dapat menandai feedback.' })
    }
    await pool.query(
      'UPDATE feedback SET is_read = true WHERE id = $1', [req.params.id]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[eob5/feedback] mark-read error:', err)
    res.status(500).json({ error: 'Gagal menandai feedback' })
  }
})

// DELETE /:id — hapus feedback
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    if (!isAdmin(req.session.user)) {
      return res.status(403).json({ error: 'Hanya admin yang dapat menghapus feedback.' })
    }
    await pool.query('DELETE FROM feedback WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[eob5/feedback] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus feedback' })
  }
})

export default router
