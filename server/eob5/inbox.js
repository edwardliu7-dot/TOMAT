/**
 * server/eob5/inbox.js
 * Inbox/pengumuman resmi sekolah untuk guru.
 *
 * CATATAN DESAIN: Ini adalah inbox PENGUMUMAN (broadcast resmi dari admin/kepala sekolah ke guru),
 * bukan sistem percakapan. Berbeda dari sistem chat TOMAT (/api/komunikasi/*) yang untuk
 * chat pribadi guru↔siswa. Tabel inbox terpisah dari pesan_pribadi/pesan_forum_kelas.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/inbox — daftar pesan masuk guru
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    const { rows } = await pool.query(`
      SELECT
        i.*,
        g.name AS nama_pengirim,
        (i.dibaca_oleh @> $2::jsonb) AS sudah_dibaca
      FROM inbox i
      LEFT JOIN gurus g ON g.id = i.pengirim_id
      WHERE i.target_role = 'semua' OR i.target_role = 'guru'
      ORDER BY i.created_at DESC
    `, [guruId, JSON.stringify([guruId])])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil inbox' })
  }
})

// POST /api/eob5/inbox — kirim pengumuman (hanya admin/kepala sekolah)
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { judul, isi, target_role = 'guru' } = req.body

    if (!judul || !isi) {
      return res.status(400).json({ error: 'Judul dan isi pengumuman wajib diisi' })
    }

    if (!['guru', 'semua'].includes(target_role)) {
      return res.status(400).json({ error: 'target_role harus "guru" atau "semua"' })
    }

    const { rows } = await pool.query(`
      INSERT INTO inbox (pengirim_id, judul, isi, target_role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [guruId, judul, isi, target_role])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengirim pengumuman' })
  }
})

// PUT /api/eob5/inbox/:id/baca — tandai sudah dibaca
router.put('/:id/baca', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    // Tambahkan guruId ke array dibaca_oleh (jsonb) jika belum ada
    const { rows } = await pool.query(`
      UPDATE inbox
      SET dibaca_oleh = CASE
        WHEN dibaca_oleh @> $1::jsonb THEN dibaca_oleh
        ELSE dibaca_oleh || $1::jsonb
      END
      WHERE id = $2
      RETURNING id, dibaca_oleh
    `, [JSON.stringify([guruId]), id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pesan tidak ditemukan' })
    }
    res.json({ sukses: true, dibaca_oleh: rows[0].dibaca_oleh })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menandai pesan sebagai dibaca' })
  }
})

// GET /api/eob5/feedback — daftar feedback dari siswa
router.get('/feedback', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, sudah_ditanggapi } = req.query

    const conditions = ['f.guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`s.kelas = $${idx++}`)
      params.push(kelas)
    }
    if (sudah_ditanggapi !== undefined) {
      conditions.push(`f.sudah_ditanggapi = $${idx++}`)
      params.push(sudah_ditanggapi === 'true')
    }

    const { rows } = await pool.query(`
      SELECT f.*, s.name AS nama_siswa, s.kelas
      FROM feedback_siswa f
      JOIN students s ON s.id = f.student_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY f.created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil feedback' })
  }
})

export default router
