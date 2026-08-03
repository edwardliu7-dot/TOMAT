/**
 * server/eob5/prosem.js
 * CRUD program semester (prosem) + AI import dari file PDF/DOCX.
 * Menggunakan tabel lama `prosem`.
 * Kolom: teacher_id (bukan guru_id).
 * Linkage: subject_id → subjects, calendar_id → academic_calendars.
 */

import { createRequire } from 'module'
import { Router } from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// GET /api/eob5/prosem — daftar program semester
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, semester, tahun_ajaran } = req.query

    const conditions = ['p.teacher_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) { conditions.push(`p.kelas = $${idx++}`); params.push(kelas) }
    if (mata_pelajaran) { conditions.push(`p.mata_pelajaran = $${idx++}`); params.push(mata_pelajaran) }
    if (semester) { conditions.push(`p.semester = $${idx++}`); params.push(semester) }
    if (tahun_ajaran) { conditions.push(`p.tahun_ajaran = $${idx++}`); params.push(tahun_ajaran) }

    const { rows } = await pool.query(`
      SELECT p.id,
             p.teacher_id AS guru_id,
             p.mata_pelajaran,
             p.kelas,
             p.semester,
             p.tahun_ajaran,
             p.subject_id,
             p.calendar_id,
             s.name AS subject_name,
             p.created_at
      FROM prosem p
      LEFT JOIN subjects s ON s.id = p.subject_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error('[eob5/prosem] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil data prosem' })
  }
})

// GET /api/eob5/prosem/:id — detail prosem lengkap (termasuk konten)
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT p.id,
              p.teacher_id AS guru_id,
              p.mata_pelajaran,
              p.kelas,
              p.semester,
              p.tahun_ajaran,
              p.subject_id,
              p.calendar_id,
              p.konten,
              s.name AS subject_name,
              p.created_at
       FROM prosem p
       LEFT JOIN subjects s ON s.id = p.subject_id
       WHERE p.id = $1 AND p.teacher_id = $2`,
      [id, guruId]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/prosem] detail error:', err)
    res.status(500).json({ error: 'Gagal mengambil detail prosem' })
  }
})

// POST /api/eob5/prosem — buat prosem baru
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { mata_pelajaran, kelas, semester, tahun_ajaran, konten, subject_id, calendar_id } = req.body

    if (!mata_pelajaran || !kelas || !semester || !tahun_ajaran) {
      return res.status(400).json({ error: 'Data tidak lengkap: mata_pelajaran, kelas, semester, tahun_ajaran wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO prosem (teacher_id, mata_pelajaran, kelas, semester, tahun_ajaran, konten, subject_id, calendar_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, subject_id, calendar_id, konten, created_at
    `, [
      guruId, mata_pelajaran, kelas, parseInt(semester), tahun_ajaran,
      konten ? JSON.stringify(konten) : null,
      subject_id || null,
      calendar_id || null,
    ])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/prosem] create error:', err)
    res.status(500).json({ error: 'Gagal menyimpan prosem' })
  }
})

// PUT /api/eob5/prosem/:id — update prosem
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { mata_pelajaran, kelas, semester, tahun_ajaran, konten, subject_id, calendar_id } = req.body

    const { rows } = await pool.query(`
      UPDATE prosem
      SET mata_pelajaran = COALESCE($1, mata_pelajaran),
          kelas          = COALESCE($2, kelas),
          semester       = COALESCE($3, semester),
          tahun_ajaran   = COALESCE($4, tahun_ajaran),
          konten         = COALESCE($5, konten),
          subject_id     = COALESCE($6, subject_id),
          calendar_id    = COALESCE($7, calendar_id)
      WHERE id = $8 AND teacher_id = $9
      RETURNING id, teacher_id AS guru_id, mata_pelajaran, kelas, semester, tahun_ajaran, subject_id, calendar_id, konten, created_at
    `, [
      mata_pelajaran || null, kelas || null,
      semester ? parseInt(semester) : null,
      tahun_ajaran || null,
      konten ? JSON.stringify(konten) : null,
      subject_id !== undefined ? (subject_id || null) : undefined,
      calendar_id !== undefined ? (calendar_id || null) : undefined,
      id, guruId,
    ])

    if (rows.length === 0) return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/prosem] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate prosem' })
  }
})

// DELETE /api/eob5/prosem/:id — hapus prosem
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rowCount } = await pool.query(
      'DELETE FROM prosem WHERE id = $1 AND teacher_id = $2',
      [id, guruId]
    )

    if (rowCount === 0) return res.status(404).json({ error: 'Prosem tidak ditemukan' })
    res.json({ sukses: true })
  } catch (err) {
    console.error('[eob5/prosem] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus prosem' })
  }
})

// POST /api/eob5/prosem/import-analyze — parse PDF/DOCX + ekstrak prosem via Groq AI
router.post('/import-analyze', requireGuru, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File wajib diupload' })

    let text = ''
    const mime = req.file.mimetype
    if (mime === 'application/pdf' || req.file.originalname?.endsWith('.pdf')) {
      const parsed = await pdfParse(req.file.buffer)
      text = parsed.text
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      req.file.originalname?.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer })
      text = result.value
    } else {
      return res.status(400).json({ error: 'Hanya file PDF atau DOCX yang didukung' })
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'File tidak mengandung teks yang bisa dibaca' })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten yang mengekstrak Program Semester (Prosem) dari dokumen silabus guru Indonesia.
Ekstrak daftar materi per pekan dalam format JSON.
Aturan:
- pekanKe adalah integer, mulai dari 1
- materi adalah deskripsi singkat materi pembelajaran
- jp adalah jam pelajaran per minggu (integer); gunakan 2 jika tidak disebutkan
- kd adalah Kompetensi Dasar atau Tujuan Pembelajaran (string, boleh kosong)
- catatan adalah catatan tambahan (string, boleh kosong)
Return HANYA JSON: { "items": [ { "pekanKe": 1, "materi": "...", "jp": 2, "kd": "...", "catatan": "" } ] }`,
        },
        { role: 'user', content: `Dokumen silabus:\n\n${text.slice(0, 12000)}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    if (!result.items || !Array.isArray(result.items) || result.items.length === 0) {
      return res.status(422).json({ error: 'AI tidak dapat menemukan data prosem dalam dokumen ini' })
    }

    // Normalize items
    const items = result.items.map((it, i) => ({
      pekanKe: parseInt(it.pekanKe) || i + 1,
      materi:  String(it.materi || '').trim(),
      jp:      parseInt(it.jp) || 2,
      kd:      String(it.kd || '').trim(),
      catatan: String(it.catatan || '').trim(),
    })).filter(it => it.materi)

    if (!items.length) {
      return res.status(422).json({ error: 'Tidak ada materi yang berhasil diekstrak dari dokumen ini' })
    }

    res.json({ items })
  } catch (err) {
    console.error('[eob5/prosem] import-analyze error:', err)
    res.status(500).json({ error: 'Gagal menganalisis file' })
  }
})

export default router
