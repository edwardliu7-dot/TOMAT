# Prompt 07 — AI Features: Soal Otomatis + Modul Ajar Alignment

> Bisa dieksekusi paralel dengan Prompt 06.

## Latar Belakang

Original (`artifacts/api-server/src/routes/soal-otomatis.ts` dan `modul-ajar.ts`) punya beberapa perbedaan dengan workspace:

### Soal Otomatis
1. **Parameter berbeda** — Original: `jenisSoal` (bukan `jenis`), `tingkatKesulitan` enum (mudah/sedang/sulit), `jumlahSoal` (bukan `jumlah`), wajib ada `subjectId` FK
2. **DOCX export** — Original: `GET /soal-otomatis/:id/docx` yang return file Word; workspace mungkin belum ada atau berbeda
3. **Storage limit** — Original: 15 entri per guru (hapus yang terlama)

### Modul Ajar
1. **Storage limit** — Original: 15 entri per guru; workspace mungkin tidak ada limit
2. **DOCX export** — Original: `GET /modul-ajar/:id/docx`; workspace mungkin ada tapi perlu dicek
3. **Kolom `kelas`** — Original menyimpan `kelas` di tabel `ai_modul_ajar`; workspace mungkin belum ada kolom ini (sudah di-ALTER?)
4. **Model AI** — Original: `llama-3.3-70b-versatile`; workspace: `llama-3.1-70b-versatile` (perlu di-upgrade)

## Yang Harus Dilakukan

### 1. Upgrade model AI ke `llama-3.3-70b-versatile`

Di `server/eob5/soal-otomatis.js` dan `server/eob5/modul-ajar.js`, ubah semua:
```js
model: 'llama-3.1-70b-versatile'
// → 
model: 'llama-3.3-70b-versatile'
```

### 2. Selaraskan parameter soal-otomatis dengan original

Di `server/eob5/soal-otomatis.js`, pastikan endpoint `POST /generate` accept parameter:
- `jumlahSoal` (angka, 1–20) — original pakai ini, bukan `jumlah`
- `jenisSoal` — enum: `pilihan_ganda` | `esai` (original pakai underscore, bukan dash)
- `tingkatKesulitan` — enum: `mudah` | `sedang` | `sulit`
- `materi` — teks topik (wajib)
- `subjectId` — UUID mata pelajaran (wajib, ownership dicek)

Tambahkan backward compat: kalau request pakai `jenis` (lama) → map ke `jenisSoal`. Sama untuk `jumlah` → `jumlahSoal`.

Ubah prompt AI agar gunakan parameter baru:
```js
const prompt = `Buatkan ${jumlahSoal} soal ${jenisSoal === 'esai' ? 'esai' : 'pilihan ganda'} 
untuk mata pelajaran ${mataPelajaran} tingkat SMP/SMA.
Topik/materi: ${materi}
Tingkat kesulitan: ${tingkatKesulitan}

Format JSON:
{
  "soal": [
    {
      "pertanyaan": "...",
      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],  // kosong untuk esai
      "jawaban": "A",      // atau jawaban lengkap untuk esai
      "pembahasan": "..."
    }
  ]
}`
```

### 3. Tambah storage limit (prune oldest) di soal-otomatis dan modul-ajar

Setelah INSERT berhasil, tambahkan cleanup:

```js
// Untuk soal-otomatis:
const MAX_PER_TEACHER = 15
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
```

Sama untuk `ai_modul_ajar` di `modul-ajar.js`.

### 4. Verifikasi/tambah DOCX export untuk soal-otomatis

Cek apakah `GET /soal-otomatis/:id/docx` sudah ada di workspace. Kalau belum:

Install `docx` jika belum: `npm install docx`

Buat `server/eob5/lib/docx-soal.js`:
```js
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function buildSoalDocx(soalData, metadata) {
  // soalData: { soal: [{ pertanyaan, pilihan, jawaban, pembahasan }] }
  // metadata: { topik, jenisSoal, tingkatKesulitan, mataPelajaran }
  const children = []

  children.push(new Paragraph({
    text: `Soal ${metadata.mataPelajaran || ''}`,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }))
  children.push(new Paragraph({ text: `Topik: ${metadata.topik || metadata.materi}` }))
  children.push(new Paragraph({ text: `Tingkat: ${metadata.tingkatKesulitan || '-'}` }))
  children.push(new Paragraph({ text: '' }))

  soalData.soal.forEach((s, i) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: `${i + 1}. ${s.pertanyaan}`, bold: true })],
    }))
    if (s.pilihan?.length) {
      s.pilihan.forEach(p => children.push(new Paragraph({ text: `   ${p}` })))
    }
    children.push(new Paragraph({ text: `Jawaban: ${s.jawaban}` }))
    if (s.pembahasan) {
      children.push(new Paragraph({ text: `Pembahasan: ${s.pembahasan}`, style: 'aside' }))
    }
    children.push(new Paragraph({ text: '' }))
  })

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBuffer(doc)
}
```

Tambahkan route di `soal-otomatis.js`:
```js
router.get('/:id/docx', requireGuru, async (req, res) => {
  const guruId = req.session.user.id
  const { rows } = await pool.query(
    'SELECT * FROM ai_soal_otomatis WHERE id = $1 AND teacher_id = $2',
    [req.params.id, guruId]
  )
  if (!rows.length) return res.status(404).json({ error: 'Soal tidak ditemukan' })

  const soalData = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content
  const buf = await buildSoalDocx(soalData, rows[0])

  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="soal-${rows[0].topik?.slice(0,20) || 'otomatis'}.docx"`,
  })
  res.send(buf)
})
```

### 5. Cek/tambah DOCX export untuk modul-ajar

Cek apakah `GET /modul-ajar/:id/docx` sudah ada dan berfungsi. Kalau sudah ada, test download-nya. Kalau belum ada, implementasi serupa dengan soal.

### 6. Frontend — `src/screens/eob5/Eob5SoalAiScreen.jsx`

- Ganti field `jenis` → `jenisSoal`, `jumlah` → `jumlahSoal` di form
- Tambahkan dropdown `tingkatKesulitan` (Mudah/Sedang/Sulit) kalau belum ada
- Tambahkan tombol "Download DOCX" di list soal tersimpan

## Verifikasi

1. Generate soal pilihan_ganda dengan `jumlahSoal: 5`, `tingkatKesulitan: 'sedang'` → berhasil
2. Generate soal ke-16 → soal ke-1 (terlama) terhapus otomatis
3. `GET /soal-otomatis/:id/docx` → download file .docx

## File yang Disentuh
- `server/eob5/soal-otomatis.js`
- `server/eob5/modul-ajar.js`
- `server/eob5/lib/docx-soal.js` (baru atau update)
- `src/screens/eob5/Eob5SoalAiScreen.jsx`
- `package.json` (install `docx` jika belum ada)
