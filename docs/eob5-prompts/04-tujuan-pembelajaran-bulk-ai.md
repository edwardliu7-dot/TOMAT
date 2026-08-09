# Prompt 04 — Tujuan Pembelajaran: Bulk Import Cerdas + AI Extraction

> Bisa dieksekusi paralel dengan Prompt 03.

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md`. Tabel yang dipakai: `tujuan_pembelajaran` (BUKAN `eob5_tujuan_pembelajaran`). Kolom guru: `teacher_id` (BUKAN `guru_id`). Kolom deskripsi: `description` (BUKAN `deskripsi`).

## Latar Belakang

Original (`artifacts/api-server/src/routes/tujuan-pembelajaran.ts`) punya dua fitur lanjutan yang belum ada di workspace:

### Fitur 1: `shiftTpNumbers` — Bulk Insert yang Tidak Merusak Urutan

Saat guru upload banyak TP sekaligus (misalnya dari dokumen), original menggunakan logika:
- Cek TP mana yang sudah ada di DB untuk subject+calendar ini
- Hitung titik insert yang aman agar tidak bentrok dengan TP yang ada
- **Shift** semua TP yang lebih besar dari insertAt sebesar +N (geser ke atas)
- Baru insert TP baru di tengah

Tanpa logika ini, bulk insert akan overwrite/duplikat `tp_number` yang sudah ada.

### Fitur 2: AI Extraction dari File (PDF/DOCX)

Original punya endpoint `POST /tujuan-pembelajaran/import-analyze` yang:
1. Menerima file PDF atau DOCX
2. Parse teks dari file (`pdf-parse` / `mammoth`)
3. Kirim teks ke Groq LLM untuk ekstrak struktur TP (lingkup materi + nomor + deskripsi)
4. Punya fallback prompt kalau parsing pertama gagal
5. Return daftar TP yang siap di-review guru sebelum disimpan

## Yang Harus Dilakukan

### 1. Tambah `shiftTpNumbers` di `server/eob5/tujuan-pembelajaran.js`

Tambahkan helper function sebelum route handlers:

```js
/**
 * Geser semua tp_number >= insertAt sebesar +amount untuk subject+calendar tertentu.
 * Dipanggil sebelum insert TP baru agar tidak bentrok dengan urutan yang sudah ada.
 *
 * Tabel: tujuan_pembelajaran  (BUKAN eob5_tujuan_pembelajaran)
 * Kolom FK guru: teacher_id   (BUKAN guru_id)
 * Kolom deskripsi: description (BUKAN deskripsi)
 */
async function shiftTpNumbers(subjectId, calendarId, insertAt, amount) {
  await pool.query(
    `UPDATE tujuan_pembelajaran
     SET tp_number = tp_number + $1
     WHERE subject_id = $2 AND calendar_id = $3 AND tp_number >= $4`,
    [amount, subjectId, calendarId, insertAt]
  )
}
```

Lalu di endpoint `POST /bulk` (atau buat endpoint baru `POST /bulk-import` jika belum ada), gunakan logika berikut:

```js
// Kelompokkan item baru berdasarkan lingkup_materi
// Untuk setiap lingkup materi:
//   1. Ambil tp_number tertinggi yang sudah ada di lingkup itu
//   2. insertAt = max(maxDalamLM, globalLastUsed) + 1
//   3. shiftTpNumbers(subjectId, calendarId, insertAt, jumlahItemBaru)
//   4. Insert item baru mulai dari insertAt
//   5. Update globalLastUsed = insertAt + jumlahItemBaru - 1

// INSERT ke tujuan_pembelajaran (BUKAN eob5_tujuan_pembelajaran):
// Kolom wajib: subject_id, calendar_id, teacher_id, lingkup_materi, tp_number, description
// JANGAN pakai: guru_id (nama kolom salah), deskripsi (nama kolom salah)
```

Jika endpoint `POST /bulk` sudah ada, refactor agar memakai `shiftTpNumbers`.
Jika belum ada, buat endpoint baru `POST /tujuan-pembelajaran/bulk`.

### 2. Tambah Endpoint `POST /tujuan-pembelajaran/import-analyze`

Endpoint ini menerima upload file (PDF atau DOCX) dan mengembalikan array TP yang diekstrak AI.

#### 2a. Install dependensi (cek dulu apakah sudah ada)

```bash
# Cek package.json
grep -E "pdf-parse|mammoth" package.json
# Kalau belum ada:
npm install pdf-parse mammoth
```

#### 2b. Implementasi route

```js
import multer from 'multer'   // sudah ada di TOMAT? kalau tidak: npm install multer
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

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

    if (!text.trim()) return res.status(400).json({ error: 'File tidak mengandung teks yang bisa dibaca' })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: TP_EXTRACT_PROMPT },
        { role: 'user', content: `Isi dokumen:\n\n${text.slice(0, 12000)}` }
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
```

### 3. Frontend — `src/screens/eob5/Eob5KurikulumScreen.jsx` (atau nama screen TP)

Tambahkan tombol "Import dari File" yang:
1. Buka file picker (accept: `.pdf,.docx`)
2. Upload ke `POST /api/eob5/tujuan-pembelajaran/import-analyze`
3. Tampilkan preview daftar TP yang diekstrak
4. Guru bisa uncheck item yang tidak mau disimpan
5. Konfirmasi → `POST /api/eob5/tujuan-pembelajaran/bulk` untuk simpan semua

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Kolom Perlu Diperhatikan |
|---|---|---|
| TP | `tujuan_pembelajaran` | `teacher_id` (bukan `guru_id`), `description` (bukan `deskripsi`) |
| Mata Pelajaran | `subjects` | `teacher_id` (bukan `guru_id`) |
| Kalender Akademik | `academic_calendars` | `created_by` (bukan `guru_id`) |

## Verifikasi

1. Upload file PDF berisi daftar TP → harus return array item dengan lingkupMateri + tpNumber + description
2. Simpan hasil → TP tersimpan di DB dengan tp_number yang benar
3. Upload lagi ke subject yang sama → TP lama tidak tertimpa, nomor digeser otomatis

## File yang Disentuh
- `server/eob5/tujuan-pembelajaran.js`
- `src/screens/eob5/Eob5KurikulumScreen.jsx` (atau screen TP yang ada)
- `package.json` (jika perlu install `pdf-parse`, `mammoth`, `multer`)
