/**
 * server/eob5/soal-otomatis.js
 * Generate soal otomatis menggunakan Groq AI (llama-3.1-70b-versatile).
 * Menggunakan tabel lama `ai_soal_otomatis` (bukan ai_soal_otomatis).
 * Kolom: teacher_id (bukan guru_id), content (bukan soal_json).
 */

import { Router } from 'express'
import Groq from 'groq-sdk'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// POST /api/eob5/soal-otomatis/generate — generate soal dari topik/TP
router.post('/generate', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { topik, tingkat, jumlah = 5, jenis = 'pilihan-ganda', simpan = false } = req.body

    if (!topik || !tingkat) {
      return res.status(400).json({ error: 'Topik dan tingkat kelas wajib diisi' })
    }

    if (jumlah < 1 || jumlah > 20) {
      return res.status(400).json({ error: 'Jumlah soal harus antara 1 dan 20' })
    }

    const prompt = `Buatkan ${jumlah} soal ${jenis} untuk mata pelajaran tingkat SMP.
Topik: ${topik}
Tingkat kelas: ${tingkat}
Format output JSON:
{
  "soal": [
    {
      "pertanyaan": "...",
      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "jawaban": "A",
      "pembahasan": "..."
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content)

    // Simpan ke database jika diminta
    if (simpan && result.soal) {
      await pool.query(`
        INSERT INTO ai_soal_otomatis (teacher_id, topik, materi, content)
        VALUES ($1, $2, $3, $4)
      `, [guruId, topik, topik, JSON.stringify(result)])
    }

    res.json(result)
  } catch (err) {
    console.error(err)
    if (err?.status === 401 || err?.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'GROQ_API_KEY tidak valid atau belum dikonfigurasi' })
    }
    res.status(500).json({ error: 'Gagal generate soal: ' + (err.message || 'Terjadi kesalahan') })
  }
})

// GET /api/eob5/soal-otomatis/tersimpan — daftar soal yang sudah disimpan
router.get('/tersimpan', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    const { rows } = await pool.query(`
      SELECT id, COALESCE(topik, materi) AS topik, created_at
      FROM ai_soal_otomatis
      WHERE teacher_id = $1
      ORDER BY created_at DESC
    `, [guruId])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil soal tersimpan' })
  }
})

// GET /api/eob5/soal-otomatis/tersimpan/:id — detail soal tersimpan
router.get('/tersimpan/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT id, COALESCE(topik, materi) AS topik, content AS soal_json, created_at
       FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2`,
      [id, guruId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Soal tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil soal' })
  }
})

// DELETE /api/eob5/soal-otomatis/tersimpan/:id — hapus soal tersimpan
router.delete('/tersimpan/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const { rowCount } = await pool.query(
      'DELETE FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2',
      [id, guruId]
    )

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Soal tidak ditemukan' })
    }
    res.json({ sukses: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus soal' })
  }
})

export default router
