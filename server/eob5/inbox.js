/**
 * server/eob5/inbox.js
 * Inbox pengumuman resmi sekolah untuk guru.
 * CATATAN: Tabel `inbox` dan `feedback_siswa` sudah di-DROP (tabel baru SMARTISA, 0 data).
 * Route tetap ada tapi mengembalikan array kosong agar frontend tidak error.
 * Fitur ini bisa diimplementasikan ulang menggunakan tabel yang ada di app lama.
 */

import { Router } from 'express'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/inbox
router.get('/', requireGuru, async (req, res) => {
  res.json([])
})

// POST /api/eob5/inbox
router.post('/', requireGuru, async (req, res) => {
  res.status(503).json({ error: 'Fitur inbox belum tersedia di versi ini' })
})

// PUT /api/eob5/inbox/:id/baca
router.put('/:id/baca', requireGuru, async (req, res) => {
  res.status(503).json({ error: 'Fitur inbox belum tersedia di versi ini' })
})

// GET /api/eob5/feedback — feedback dari siswa
router.get('/feedback', requireGuru, async (req, res) => {
  res.json([])
})

export default router
