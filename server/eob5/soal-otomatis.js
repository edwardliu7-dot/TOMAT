/**
 * server/eob5/soal-otomatis.js
 * Generate soal otomatis menggunakan Groq AI.
 * Tabel: ai_soal_otomatis  (BUKAN eob5_soal_tersimpan / eob5_soal_otomatis)
 * Kolom: teacher_id (BUKAN guru_id), content (JSON soal).
 */

import { Router } from 'express'
import Groq from 'groq-sdk'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'
import { buildSoalDocx } from './lib/docx-soal.js'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MAX_PER_TEACHER = 15

// ─── POST /generate ────────────────────────────────────────────────────────────
router.post('/generate', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id

    // Accept both new param names (original) and old names (backward compat)
    const {
      materi,
      topik,
      tingkat,
      simpan = false,
      subjectId,
      subject_id,
    } = req.body

    const jumlahSoal  = req.body.jumlahSoal  ?? req.body.jumlah      ?? 5
    const jenisSoal   = req.body.jenisSoal   ?? req.body.jenis        ?? 'pilihan_ganda'
    const tingkatKesulitan = req.body.tingkatKesulitan ?? req.body.kesulitan ?? 'sedang'

    const topikStr = materi || topik
    if (!topikStr) return res.status(400).json({ error: 'materi / topik wajib diisi' })
    if (jumlahSoal < 1 || jumlahSoal > 20) return res.status(400).json({ error: 'jumlahSoal harus 1–20' })

    // Resolve subject → mata pelajaran name
    let mataPelajaran = req.body.mata_pelajaran || topikStr
    const sid = subjectId || subject_id
    if (sid) {
      const { rows } = await pool.query(
        'SELECT name FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
        [sid, guruId]
      )
      if (!rows.length) return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
      mataPelajaran = rows[0].name
    }

    const prompt = `Buatkan ${jumlahSoal} soal ${jenisSoal === 'esai' ? 'esai' : 'pilihan ganda'} \
untuk mata pelajaran ${mataPelajaran} tingkat SMP/SMA.
Topik/materi: ${topikStr}
Tingkat kesulitan: ${tingkatKesulitan}

Format JSON:
{
  "soal": [
    {
      "pertanyaan": "...",
      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "jawaban": "A",
      "pembahasan": "..."
    }
  ]
}

Untuk soal esai, gunakan pilihan: [] (kosong) dan isi jawaban dengan jawaban lengkap.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(completion.choices[0].message.content)
    if (!result.soal?.length) {
      return res.status(422).json({ error: 'AI tidak menghasilkan soal. Coba topik lain.' })
    }

    // Simpan ke DB jika diminta
    if (simpan) {
      await pool.query(
        `INSERT INTO ai_soal_otomatis
           (teacher_id, topik, materi, jenis_soal, tingkat_kesulitan, subject_id, content)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [guruId, topikStr, topikStr,
         jenisSoal, tingkatKesulitan,
         sid || null, JSON.stringify(result)]
      )

      // Pruning: pertahankan maks 15 per guru
      const { rows: allIds } = await pool.query(
        'SELECT id FROM ai_soal_otomatis WHERE teacher_id = $1 ORDER BY created_at DESC',
        [guruId]
      )
      if (allIds.length > MAX_PER_TEACHER) {
        const toDelete = allIds.slice(MAX_PER_TEACHER).map(r => r.id)
        await pool.query(
          'DELETE FROM ai_soal_otomatis WHERE id = ANY($1::text[])',
          [toDelete]
        )
      }
    }

    res.json(result)
  } catch (err) {
    console.error('[eob5/soal-otomatis] generate error:', err)
    if (err?.status === 401 || err?.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'GROQ_API_KEY tidak valid atau belum dikonfigurasi' })
    }
    res.status(500).json({ error: 'Gagal generate soal: ' + (err.message || 'Terjadi kesalahan') })
  }
})

// ─── GET /tersimpan — daftar soal tersimpan ────────────────────────────────────
router.get('/tersimpan', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      `SELECT id, COALESCE(topik, materi) AS topik,
              jenis_soal, tingkat_kesulitan, created_at
       FROM ai_soal_otomatis
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [guruId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/soal-otomatis] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil soal tersimpan' })
  }
})

// ─── GET /tersimpan/:id — detail (harus SEBELUM /:id) ─────────────────────────
router.get('/tersimpan/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      `SELECT id, COALESCE(topik, materi) AS topik,
              jenis_soal, tingkat_kesulitan, content AS soal_json, created_at
       FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2`,
      [req.params.id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Soal tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/soal-otomatis] detail error:', err)
    res.status(500).json({ error: 'Gagal mengambil soal' })
  }
})

// ─── DELETE /tersimpan/:id ─────────────────────────────────────────────────────
router.delete('/tersimpan/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rowCount } = await pool.query(
      'DELETE FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2',
      [req.params.id, guruId]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Soal tidak ditemukan' })
    res.json({ sukses: true })
  } catch (err) {
    console.error('[eob5/soal-otomatis] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus soal' })
  }
})

// ─── GET /:id/docx — download soal sebagai DOCX ────────────────────────────────
router.get('/:id/docx', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      'SELECT * FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2',
      [req.params.id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Soal tidak ditemukan' })

    const row = rows[0]
    const soalData = typeof row.content === 'string' ? JSON.parse(row.content) : row.content
    const buf = await buildSoalDocx(soalData, {
      topik: row.topik || row.materi,
      materi: row.materi,
      jenisSoal: row.jenis_soal,
      tingkatKesulitan: row.tingkat_kesulitan,
    })

    const filename = `soal-${(row.topik || row.materi || 'otomatis').slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.docx`
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    res.send(buf)
  } catch (err) {
    console.error('[eob5/soal-otomatis] docx error:', err)
    res.status(500).json({ error: 'Gagal membuat file DOCX' })
  }
})

export default router
