/**
 * server/eob5/modul-ajar.js
 * Generate modul ajar via Groq AI + simpan ke DB.
 * Menggantikan materi.js untuk use-case modul ajar AI.
 *
 * GET    /api/eob5/modul-ajar               — daftar modul (metadata)
 * GET    /api/eob5/modul-ajar/:id           — detail modul (lengkap)
 * POST   /api/eob5/modul-ajar/generate      — generate via Groq + simpan
 * DELETE /api/eob5/modul-ajar/:id           — hapus modul
 */

import { Router } from 'express'
import Groq from 'groq-sdk'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const MAX_PER_GURU = 15

async function getOwnSubject(subjectId, guruId) {
  const { rows } = await pool.query(
    'SELECT id, name FROM eob5_subjects WHERE id = $1 AND guru_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows[0] || null
}

// GET / — daftar modul (tanpa content agar response tetap kecil)
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id } = req.query

    const params = [guruId]
    let subjectFilter = ''
    if (subject_id) {
      params.push(subject_id)
      subjectFilter = `AND subject_id = $${params.length}`
    }

    const { rows } = await pool.query(
      `SELECT id, subject_id, materi, alokasi_waktu, kelas, created_at
       FROM eob5_modul_ajar
       WHERE guru_id = $1 ${subjectFilter}
       ORDER BY created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/modul-ajar] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar modul ajar' })
  }
})

// GET /:id — detail modul (termasuk content)
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      'SELECT * FROM eob5_modul_ajar WHERE id = $1 AND guru_id = $2',
      [req.params.id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Modul ajar tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/modul-ajar] detail error:', err)
    res.status(500).json({ error: 'Gagal mengambil modul ajar' })
  }
})

// POST /generate — generate + simpan
router.post('/generate', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, materi, alokasi_waktu, kelas, tujuan_pembelajaran } = req.body || {}

    if (!materi || !alokasi_waktu) {
      return res.status(400).json({ error: 'materi dan alokasi_waktu wajib diisi' })
    }

    // Ambil nama guru & mata pelajaran jika subject_id diberikan
    let mataPelajaran = req.body.mata_pelajaran || materi
    let namaGuru = req.session.user.name || 'Guru'

    if (subject_id) {
      const subject = await getOwnSubject(subject_id, guruId)
      if (!subject) return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
      mataPelajaran = subject.name
    }

    const { rows: guruRows } = await pool.query(
      'SELECT name FROM gurus WHERE id = $1', [guruId]
    )
    if (guruRows.length) namaGuru = guruRows[0].name

    const tpText = Array.isArray(tujuan_pembelajaran) && tujuan_pembelajaran.length
      ? `\nTujuan Pembelajaran:\n${tujuan_pembelajaran.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
      : ''

    const prompt = `Kamu adalah asisten pembuatan modul ajar Kurikulum Merdeka untuk SMP.
Buat modul ajar lengkap dengan format JSON terstruktur untuk:
- Mata Pelajaran: ${mataPelajaran}
- Materi: ${materi}
- Kelas: ${kelas || '-'}
- Alokasi Waktu: ${alokasi_waktu}
- Nama Penyusun: ${namaGuru}
${tpText}

Format JSON yang harus dihasilkan:
{
  "identitas": {
    "mata_pelajaran": "...", "kelas": "...", "alokasi_waktu": "...",
    "materi": "...", "nama_penyusun": "..."
  },
  "capaian_pembelajaran": "...",
  "tujuan_pembelajaran": ["...", "..."],
  "profil_pelajar_pancasila": ["..."],
  "sarana_prasarana": ["..."],
  "model_pembelajaran": "...",
  "kegiatan_pembelajaran": {
    "pendahuluan": {"durasi": "...", "langkah": ["..."]},
    "inti": {"durasi": "...", "langkah": ["..."]},
    "penutup": {"durasi": "...", "langkah": ["..."]}
  },
  "asesmen": {
    "diagnostik": "...", "formatif": "...", "sumatif": "..."
  },
  "pengayaan_remedial": {"pengayaan": "...", "remedial": "..."},
  "refleksi_guru": "...",
  "referensi": ["..."]
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    let content
    try {
      content = JSON.parse(completion.choices[0].message.content)
    } catch {
      content = { raw: completion.choices[0].message.content }
    }

    const { rows } = await pool.query(
      `INSERT INTO eob5_modul_ajar (guru_id, subject_id, materi, alokasi_waktu, kelas, content)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, subject_id, materi, alokasi_waktu, kelas, created_at`,
      [guruId, subject_id || null, materi, alokasi_waktu, kelas || null, JSON.stringify(content)]
    )
    const saved = rows[0]

    // Pruning: pertahankan max 15 modul per guru
    try {
      const { rows: allIds } = await pool.query(
        `SELECT id FROM eob5_modul_ajar WHERE guru_id = $1 ORDER BY created_at DESC`,
        [guruId]
      )
      if (allIds.length > MAX_PER_GURU) {
        const toDelete = allIds.slice(MAX_PER_GURU).map(r => r.id)
        await pool.query(
          'DELETE FROM eob5_modul_ajar WHERE guru_id = $1 AND id = ANY($2::int[])',
          [guruId, toDelete]
        )
      }
    } catch (cleanupErr) {
      console.warn('[eob5/modul-ajar] cleanup warning:', cleanupErr.message)
    }

    res.status(201).json({ ...saved, content })
  } catch (err) {
    console.error('[eob5/modul-ajar] generate error:', err)
    res.status(500).json({ error: 'Gagal generate modul ajar: ' + err.message })
  }
})

// DELETE /:id — hapus modul
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rows } = await pool.query(
      'DELETE FROM eob5_modul_ajar WHERE id = $1 AND guru_id = $2 RETURNING id',
      [req.params.id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Modul ajar tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/modul-ajar] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus modul ajar' })
  }
})

export default router
