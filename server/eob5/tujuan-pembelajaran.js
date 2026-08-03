/**
 * server/eob5/tujuan-pembelajaran.js
 * CRUD tujuan pembelajaran per prosem/subject.
 * Menggunakan tabel `tujuan_pembelajaran`.
 * Kolom: teacher_id (bukan guru_id), description (bukan deskripsi).
 */

import { createRequire } from 'module'
import { Router } from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TP_EXTRACT_PROMPT = `
Kamu adalah asisten yang mengekstrak Tujuan Pembelajaran (TP) dari dokumen guru Indonesia (Kurikulum Merdeka).
Dokumen mungkin menyebut TP sebagai "Tujuan Pembelajaran", "Capaian Pembelajaran", "Indikator", atau istilah lain.

Tugas:
1. Cari setiap kelompok level-atas (Lingkup Materi) dan beri nomor urut integer mulai dari 1.
2. Di dalam setiap kelompok, ekstrak setiap TP dan beri tp_number urut mulai dari 1.
3. Jika tidak ada pembagian kelompok, masukkan semua ke lingkupMateri 1.
4. description harus berisi teks lengkap TP, dirapikan.
5. Abaikan header, footer, identitas guru/sekolah.
6. Jangan return items kosong jika ada teks yang menyerupai daftar materi.

Return JSON: { "items": [ { "lingkupMateri": 1, "tpNumber": 1, "description": "..." } ] }
`

async function ownsSubject(subjectId, guruId) {
  if (!subjectId) return true
  const { rows } = await pool.query(
    'SELECT id FROM subjects WHERE id = $1 AND teacher_id = $2 AND deleted_at IS NULL',
    [subjectId, guruId]
  )
  return rows.length > 0
}

/**
 * Geser semua tp_number >= insertAt sebesar +amount untuk subject+calendar tertentu.
 * Dipanggil sebelum bulk insert agar tidak bentrok dengan urutan yang sudah ada.
 */
async function shiftTpNumbers(client, subjectId, calendarId, insertAt, amount) {
  await client.query(
    `UPDATE tujuan_pembelajaran
     SET tp_number = tp_number + $1
     WHERE subject_id IS NOT DISTINCT FROM $2
       AND calendar_id IS NOT DISTINCT FROM $3
       AND tp_number >= $4`,
    [amount, subjectId, calendarId, insertAt]
  )
}

// GET / — daftar TP
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, subjectId, calendarId, kelas, mata_pelajaran } = req.query
    const sid = subject_id || subjectId
    const cid = calendar_id || calendarId

    if (sid && !(await ownsSubject(sid, guruId))) return res.json([])

    const params = [guruId]
    const conditions = ['teacher_id = $1']
    let idx = 2

    if (sid)           { params.push(sid);           conditions.push(`subject_id = $${idx++}`) }
    if (cid)           { params.push(cid);           conditions.push(`calendar_id = $${idx++}`) }
    if (kelas)         { params.push(kelas);         conditions.push(`kelas = $${idx++}`) }
    if (mata_pelajaran){ params.push(mata_pelajaran); conditions.push(`mata_pelajaran = $${idx++}`) }

    const { rows } = await pool.query(
      `SELECT id, teacher_id AS guru_id, subject_id, calendar_id,
              mata_pelajaran, kelas, description AS deskripsi, kode_tp,
              lingkup_materi, tp_number, created_at
       FROM tujuan_pembelajaran
       WHERE ${conditions.join(' AND ')}
       ORDER BY lingkup_materi ASC NULLS LAST, tp_number ASC NULLS LAST, created_at ASC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/tp] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil tujuan pembelajaran' })
  }
})

// POST / — buat TP
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, mata_pelajaran, kelas, deskripsi, description,
            kode_tp, lingkup_materi, tp_number } = req.body || {}
    const desc = description || deskripsi

    if (!desc) return res.status(400).json({ error: 'Deskripsi TP wajib diisi' })
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO tujuan_pembelajaran
         (teacher_id, subject_id, calendar_id, mata_pelajaran, kelas, description,
          kode_tp, lingkup_materi, tp_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, teacher_id AS guru_id, subject_id, calendar_id,
                 mata_pelajaran, kelas, description AS deskripsi, kode_tp,
                 lingkup_materi, tp_number, created_at`,
      [guruId, subject_id || null, calendar_id || null, mata_pelajaran || null,
       kelas || null, desc, kode_tp || null,
       lingkup_materi !== undefined ? lingkup_materi : null,
       tp_number !== undefined ? tp_number : null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/tp] create error:', err)
    res.status(500).json({ error: 'Gagal membuat tujuan pembelajaran' })
  }
})

// POST /bulk — buat banyak TP sekaligus dengan shiftTpNumbers agar urutan aman
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { subject_id, calendar_id, items } = req.body || {}

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items[] wajib diisi' })
    }
    if (subject_id && !(await ownsSubject(subject_id, guruId))) {
      return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' })
    }

    const subId = subject_id || null
    const calId = calendar_id || null

    // Kelompokkan item per lingkup_materi
    const byLM = new Map()
    for (const item of items) {
      const lm = item.lingkup_materi ?? item.lingkupMateri ?? 1
      const desc = item.description || item.deskripsi || ''
      if (!desc.trim()) continue
      const arr = byLM.get(lm) ?? []
      arr.push({ ...item, _lm: lm, _desc: desc })
      byLM.set(lm, arr)
    }
    if (!byLM.size) return res.status(400).json({ error: 'Tidak ada item valid untuk disimpan' })

    const client = await pool.connect()
    let count = 0
    try {
      await client.query('BEGIN')

      // Ambil tp_number tertinggi yang sudah ada (global untuk subject+calendar)
      const { rows: maxRows } = await client.query(
        `SELECT COALESCE(MAX(tp_number), 0) AS max_tp
         FROM tujuan_pembelajaran
         WHERE subject_id IS NOT DISTINCT FROM $1
           AND calendar_id IS NOT DISTINCT FROM $2`,
        [subId, calId]
      )
      let globalLastUsed = parseInt(maxRows[0].max_tp) || 0

      // Proses per lingkup materi
      for (const [lm, lmItems] of [...byLM.entries()].sort((a, b) => a[0] - b[0])) {
        // Ambil tp_number tertinggi di lingkup materi ini
        const { rows: lmMax } = await client.query(
          `SELECT COALESCE(MAX(tp_number), 0) AS max_lm
           FROM tujuan_pembelajaran
           WHERE subject_id IS NOT DISTINCT FROM $1
             AND calendar_id IS NOT DISTINCT FROM $2
             AND lingkup_materi = $3`,
          [subId, calId, lm]
        )
        const maxDalamLM = parseInt(lmMax[0].max_lm) || 0
        const insertAt = Math.max(maxDalamLM, globalLastUsed) + 1

        // Geser TP yang sudah ada di atas insertAt
        await shiftTpNumbers(client, subId, calId, insertAt, lmItems.length)

        // Insert TP baru
        for (let i = 0; i < lmItems.length; i++) {
          const item = lmItems[i]
          const tpNum = item.tp_number ?? item.tpNumber ?? (insertAt + i)
          await client.query(
            `INSERT INTO tujuan_pembelajaran
               (teacher_id, subject_id, calendar_id, mata_pelajaran, kelas, description,
                kode_tp, lingkup_materi, tp_number)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [guruId, subId, calId,
             item.mata_pelajaran || null, item.kelas || null, item._desc,
             item.kode_tp || null, lm, insertAt + i]
          )
          count++
        }
        globalLastUsed = insertAt + lmItems.length - 1
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ count, skipped: items.length - count })
  } catch (err) {
    console.error('[eob5/tp] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan tujuan pembelajaran' })
  }
})

// POST /import-analyze — parse PDF/DOCX + ekstrak TP via Groq AI
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
        { role: 'system', content: TP_EXTRACT_PROMPT },
        { role: 'user', content: `Isi dokumen:\n\n${text.slice(0, 12000)}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    if (!result.items || !Array.isArray(result.items) || result.items.length === 0) {
      return res.status(422).json({ error: 'AI tidak dapat menemukan Tujuan Pembelajaran dalam dokumen ini' })
    }

    res.json({ items: result.items })
  } catch (err) {
    console.error('[eob5/tp] import-analyze error:', err)
    res.status(500).json({ error: 'Gagal menganalisis file' })
  }
})

// PATCH /:id — update TP
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { deskripsi, description, kode_tp, mata_pelajaran, kelas, lingkup_materi, tp_number } = req.body || {}
    const desc = description || deskripsi || null

    const { rows } = await pool.query(
      `UPDATE tujuan_pembelajaran
       SET description    = COALESCE($1, description),
           kode_tp        = COALESCE($2, kode_tp),
           mata_pelajaran = COALESCE($3, mata_pelajaran),
           kelas          = COALESCE($4, kelas),
           lingkup_materi = COALESCE($5, lingkup_materi),
           tp_number      = COALESCE($6, tp_number)
       WHERE id = $7 AND teacher_id = $8
       RETURNING id, teacher_id AS guru_id, subject_id, calendar_id,
                 mata_pelajaran, kelas, description AS deskripsi, kode_tp,
                 lingkup_materi, tp_number, created_at`,
      [desc, kode_tp !== undefined ? kode_tp : null,
       mata_pelajaran || null, kelas || null,
       lingkup_materi !== undefined ? lingkup_materi : null,
       tp_number !== undefined ? tp_number : null, id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'TP tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/tp] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate tujuan pembelajaran' })
  }
})

// DELETE /:id — hapus TP
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { rows } = await pool.query(
      'DELETE FROM tujuan_pembelajaran WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'TP tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/tp] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus tujuan pembelajaran' })
  }
})

export default router
