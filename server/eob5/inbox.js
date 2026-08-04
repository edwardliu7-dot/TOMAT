/**
 * server/eob5/inbox.js
 * Inbox pesan guru ↔ siswa menggunakan tabel `pesan_pribadi` (Neon DB, shared dengan TOMAT).
 *
 * GET  /api/eob5/inbox                    — daftar thread + unreadCount per siswa
 * GET  /api/eob5/inbox/:studentId         — semua pesan dalam satu thread
 * POST /api/eob5/inbox/:studentId         — kirim balasan ke siswa
 * POST /api/eob5/inbox/:studentId/read    — tandai semua pesan dari siswa sebagai sudah dibaca
 *
 * Catatan: studentId di sini adalah ID siswa dari sistem TOMAT (tipe text),
 * bukan UUID dari guru_eob5_students.
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET / — daftar semua thread (dikelompokkan per siswa) dengan jumlah pesan belum dibaca
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    const { rows } = await pool.query(
      `SELECT
         CASE
           WHEN sender_role = 'siswa' THEN sender_id
           ELSE recipient_id
         END AS student_id,
         MAX(created_at) AS last_message_at,
         COUNT(*) FILTER (
           WHERE recipient_id = $1
             AND recipient_role = 'guru'
             AND read_at IS NULL
         ) AS unread_count,
         (
           SELECT body FROM pesan_pribadi p2
           WHERE (p2.sender_id = $1 AND p2.recipient_id = CASE WHEN sender_role = 'siswa' THEN sender_id ELSE recipient_id END)
              OR (p2.recipient_id = $1 AND p2.sender_id = CASE WHEN sender_role = 'siswa' THEN sender_id ELSE recipient_id END)
           ORDER BY p2.created_at DESC LIMIT 1
         ) AS last_body
       FROM pesan_pribadi
       WHERE (sender_id = $1 AND sender_role = 'guru')
          OR (recipient_id = $1 AND recipient_role = 'guru')
       GROUP BY student_id
       ORDER BY last_message_at DESC`,
      [guruId]
    )

    // Enrich dengan nama siswa dari tabel students
    const studentIds = rows.map(r => r.student_id)
    let nameMap = {}
    if (studentIds.length) {
      const { rows: students } = await pool.query(
        `SELECT id, name, kelas FROM students WHERE id = ANY($1::text[])`,
        [studentIds]
      )
      for (const s of students) nameMap[s.id] = { name: s.name, kelas: s.kelas }
    }

    const threads = rows.map(r => ({
      studentId:      r.student_id,
      studentName:    nameMap[r.student_id]?.name || r.student_id,
      studentKelas:   nameMap[r.student_id]?.kelas || null,
      unreadCount:    parseInt(r.unread_count) || 0,
      lastMessageAt:  r.last_message_at,
      lastBody:       r.last_body || '',
    }))

    res.json(threads)
  } catch (err) {
    console.error('[eob5/inbox] list error:', err)
    res.status(500).json({ error: 'Gagal memuat inbox' })
  }
})

// GET /:studentId — semua pesan dalam thread dengan satu siswa
router.get('/:studentId', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { studentId } = req.params

    const { rows } = await pool.query(
      `SELECT id, sender_id, sender_role, recipient_id, recipient_role,
              body, created_at, delivered_at, read_at
       FROM pesan_pribadi
       WHERE (sender_id = $1 AND sender_role = 'guru'   AND recipient_id = $2 AND recipient_role = 'siswa')
          OR (sender_id = $2 AND sender_role = 'siswa'  AND recipient_id = $1 AND recipient_role = 'guru')
       ORDER BY created_at ASC`,
      [guruId, studentId]
    )

    res.json(rows)
  } catch (err) {
    console.error('[eob5/inbox] thread error:', err)
    res.status(500).json({ error: 'Gagal memuat thread pesan' })
  }
})

// POST /:studentId — kirim balasan ke siswa
router.post('/:studentId', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { studentId } = req.params
    const { body } = req.body || {}

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'body pesan wajib diisi' })
    }

    const { rows } = await pool.query(
      `INSERT INTO pesan_pribadi (sender_id, sender_role, recipient_id, recipient_role, body)
       VALUES ($1, 'guru', $2, 'siswa', $3)
       RETURNING id, sender_id, sender_role, recipient_id, recipient_role, body, created_at`,
      [guruId, studentId, body.trim()]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/inbox] send error:', err)
    res.status(500).json({ error: 'Gagal mengirim pesan' })
  }
})

// POST /:studentId/read — tandai semua pesan dari siswa sebagai sudah dibaca
router.post('/:studentId/read', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { studentId } = req.params

    const { rowCount } = await pool.query(
      `UPDATE pesan_pribadi
       SET read_at = NOW()
       WHERE sender_id = $1 AND sender_role = 'siswa'
         AND recipient_id = $2 AND recipient_role = 'guru'
         AND read_at IS NULL`,
      [studentId, guruId]
    )

    res.json({ success: true, marked: rowCount })
  } catch (err) {
    console.error('[eob5/inbox] read error:', err)
    res.status(500).json({ error: 'Gagal menandai pesan sebagai dibaca' })
  }
})

export default router
