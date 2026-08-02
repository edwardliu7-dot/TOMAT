# Prompt 08 — Prosem: Subject + Calendar Linkage + AI File Extraction

> Eksekusi ini setelah Prompt 04 selesai (ada kesamaan infrastruktur AI file parsing).

## Latar Belakang

Prosem di original (`artifacts/api-server/src/routes/prosem.ts`) menggunakan pendekatan relasional:

- `prosem` berisi: `teacherId`, `subjectId` (FK ke subjects), `calendarId` (FK ke academic_calendars), `kelas`
- `prosem_items` berisi: `prosemId`, `weekId` (FK ke academic_weeks), `kd`, `materi`, `jp`, `catatan`

Workspace menggunakan pendekatan denormalized:
- `prosem` berisi: `teacher_id`, `mata_pelajaran`, `kelas`, `semester`, `tahun_ajaran`, `konten` (JSONB)
- `prosem_items` berisi: `prosem_id`, `week_id`, `kd`, `materi`, `jp`, `catatan`, `subject_id`, `kelas`, `urutan`

**Rekomendasi:** Jangan ubah skema prosem yang ada — terlalu berisiko break data yang sudah ada. Yang perlu diselaraskan adalah **fitur** yang hilang, bukan skema.

## Fitur yang Hilang

### 1. Linkage ke `subjects`

Original: setiap prosem terikat ke satu `subject_id`. Ketika guru pilih mata pelajaran di prosem, bisa pilih dari daftar `subjects` miliknya.

Workspace: prosem hanya punya `mata_pelajaran` (text bebas). Ini mempersulit sinkronisasi dengan jurnal dan TP.

**Yang perlu dilakukan:** Di frontend `Eob5ProsemScreen.jsx`, ketika guru membuat prosem baru, tampilkan dropdown mata pelajaran yang diambil dari `GET /api/eob5/subjects` — bukan text input bebas. Isi `mata_pelajaran` dari `subject.name` dan simpan juga `subject_id` jika kolom sudah ada di tabel.

Cek schema: apakah `prosem` punya kolom `subject_id`? Kalau belum:
```sql
ALTER TABLE prosem ADD COLUMN IF NOT EXISTS subject_id text;
```
(pakai text/uuid sesuai tipe subjects.id di workspace)

### 2. Linkage ke `academic_calendars`

Original: prosem terikat ke `calendar_id` (FK ke academic_calendars). Ini memungkinkan prosem_items terikat ke `week_id` yang spesifik.

Workspace mungkin tidak enforce FK ini. Pastikan:
- Saat create prosem, kalau ada `calendar_id` di body → simpan ke kolom `calendar_id`
- Kalau kolom belum ada: `ALTER TABLE prosem ADD COLUMN IF NOT EXISTS calendar_id text`

### 3. Validasi ownership prosem items

Original memastikan `prosemItemId` yang dilink dari jurnal entries milik guru yang sama. Cek di `server/eob5/journal.js`:

```js
async function ownsProsemItem(prosemItemId, guruId) {
  const { rows } = await pool.query(
    `SELECT pi.id FROM prosem_items pi
     JOIN prosem p ON p.id = pi.prosem_id
     WHERE pi.id = $1 AND p.teacher_id = $2`,
    [prosemItemId, guruId]
  )
  return rows.length > 0
}
```

Pastikan ini sudah ada dan dipanggil saat POST/PATCH jurnal entry dengan `prosem_item_id`.

### 4. AI Prosem Extraction dari File (Fitur Baru)

Original punya `extractProsemFromFile` (via Groq) yang parse PDF/DOCX syllabus dan menghasilkan prosem items per minggu. Ini adalah fitur lanjutan.

Tambahkan endpoint `POST /prosem/import-analyze`:

```js
router.post('/import-analyze', requireGuru, upload.single('file'), async (req, res) => {
  // Parse file PDF atau DOCX
  // Kirim teks ke Groq dengan prompt untuk ekstrak:
  //   - Daftar materi per pekan
  //   - Jam pelajaran (JP) per materi
  //   - Kompetensi Dasar (KD) jika ada
  // Return: { items: [{ pekanKe, materi, jp, kd, catatan }] }
  try {
    if (!req.file) return res.status(400).json({ error: 'File wajib diupload' })

    let text = ''
    if (req.file.mimetype === 'application/pdf' || req.file.originalname?.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(req.file.buffer)
      text = parsed.text
    } else {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer: req.file.buffer })
      text = result.value
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten yang mengekstrak Program Semester (Prosem) dari dokumen silabus guru Indonesia.
Ekstrak daftar materi per pekan dalam format JSON.
Return: { "items": [ { "pekanKe": 1, "materi": "...", "jp": 2, "kd": "...", "catatan": "" } ] }
Jika JP tidak disebutkan, gunakan 2 sebagai default. pekanKe mulai dari 1.`
        },
        { role: 'user', content: `Dokumen:\n\n${text.slice(0, 10000)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    if (!result.items?.length) {
      return res.status(422).json({ error: 'Tidak dapat mengekstrak prosem dari dokumen ini' })
    }

    res.json({ items: result.items })
  } catch (err) {
    console.error('[eob5/prosem] import-analyze error:', err)
    res.status(500).json({ error: 'Gagal menganalisis file' })
  }
})
```

### 5. Frontend — `src/screens/eob5/Eob5ProsemScreen.jsx`

- Ubah field "Mata Pelajaran" dari text input bebas → dropdown pilih dari `GET /api/eob5/subjects`
- Tambahkan tombol "Import dari File" (PDF/DOCX) → call `/prosem/import-analyze` → preview → konfirmasi simpan
- Pastikan ada dropdown pilih `calendar_id` dari `GET /api/eob5/academic-calendars`

## Verifikasi

1. Buat prosem baru → dropdown mata pelajaran muncul (dari tabel subjects)
2. Upload file silabus PDF → AI ekstrak daftar materi per pekan
3. Simpan → prosem items tersimpan dengan pekan yang benar
4. Buat jurnal entry dengan prosem_item_id → validasi ownership berhasil

## File yang Disentuh
- `server/eob5/prosem.js`
- `server/eob5/journal.js`
- `server/schema.js` (ADD COLUMN subject_id/calendar_id ke prosem jika belum ada)
- `src/screens/eob5/Eob5ProsemScreen.jsx`
