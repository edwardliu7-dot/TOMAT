# Prompt 04 — GuruEOB5: Backend Routes Bagian 2
## (Nilai, Materi, Jadwal, Prosem, Soal AI, Rekap, Inbox)

## Prasyarat
- Prompt 00 selesai: `docs/audit-eob5.md` ada.
- Prompt 03 selesai: `server/eob5/middleware.js` ada, tabel absensi sudah terdaftar.
- Kode sumber EOB5 tersedia di `/tmp/eob5-source/`.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang menambahkan **Bagian 2** dari backend GuruEOB5: route untuk nilai akademik, materi ajar, jadwal, program semester, soal otomatis (AI), rekap, dan inbox/pesan.

---

## Konteks Teknis TOMAT Server

Session: `req.session.user = { id, role: 'guru'|'siswa', name, email, kelas }`

Import middleware dari file yang sudah dibuat di Prompt 03:
```js
import { requireAuth, requireGuru } from './middleware.js'
```

Import pool:
```js
import { pool } from '../db.js'
```

---

## Aturan Konversi TypeScript → JavaScript

Sama seperti Prompt 03:
- Hapus semua type annotations
- Drizzle queries → `pool.query('SQL', [params])`
- Semua local imports tambahkan `.js`
- `import.meta.env.*` → `process.env.*`
- Export default router di akhir file

---

## File yang Dibuat di `server/eob5/`

### `server/eob5/nilai.js`
Routes dari group `grades` + `points`:
- `GET /api/eob5/nilai` — daftar nilai (filter: kelas, mapel, periode)
- `POST /api/eob5/nilai` — input nilai
- `PUT /api/eob5/nilai/:id` — update nilai
- `DELETE /api/eob5/nilai/:id` — hapus nilai
- `GET /api/eob5/nilai/rekap` — rekap nilai per siswa/kelas
- `GET /api/eob5/nilai/siswa/:studentId` — semua nilai satu siswa

> **Penting:** Tabel `nilai` di TOMAT **hanya untuk skor game**. Buat tabel terpisah `eob5_nilai_akademik` untuk nilai mata pelajaran EOB5.

### `server/eob5/materi.js`
Routes dari group `subjects`, `bahan-ajar`, `modul-ajar`, `documents`, `tujuan-pembelajaran`:
- `GET /api/eob5/materi` — daftar materi/modul ajar
- `POST /api/eob5/materi` — upload/buat materi baru
- `PUT /api/eob5/materi/:id` — update materi
- `DELETE /api/eob5/materi/:id` — hapus materi
- `GET /api/eob5/materi/:id` — detail materi
- `GET /api/eob5/tujuan-pembelajaran` — daftar TP per mapel/kelas

### `server/eob5/jadwal.js`
Routes dari group `jadwal`, `academic-calendars`, `info-pekanan`:
- `GET /api/eob5/jadwal` — jadwal pelajaran (filter: kelas, guru)
- `POST /api/eob5/jadwal` — input jadwal
- `PUT /api/eob5/jadwal/:id` — update jadwal
- `GET /api/eob5/kalender-akademik` — kalender akademik
- `POST /api/eob5/kalender-akademik` — tambah event kalender
- `GET /api/eob5/info-pekanan` — info mingguan

### `server/eob5/prosem.js`
Routes dari group `prosem`:
- `GET /api/eob5/prosem` — daftar program semester
- `POST /api/eob5/prosem` — buat prosem baru
- `PUT /api/eob5/prosem/:id` — update prosem
- `DELETE /api/eob5/prosem/:id` — hapus prosem
- `GET /api/eob5/prosem/:id` — detail prosem lengkap

### `server/eob5/soal-otomatis.js`
Routes dari group `soal-otomatis` — menggunakan Groq AI (bukan Gemini, sesuaikan):
- `POST /api/eob5/soal-otomatis/generate` — generate soal dari topik/TP

> **Catatan API:** Sekarang tersedia `GROQ_API_KEY` di environment. Gunakan Groq (model: `llama-3.1-70b-versatile` atau `mixtral-8x7b-32768`) sebagai pengganti Gemini. Groq API kompatibel dengan format OpenAI.
>
> Install Groq SDK jika belum: `npm install groq-sdk`

```javascript
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/generate', requireGuru, async (req, res) => {
  const { topik, tingkat, jumlah = 5, jenis = 'pilihan-ganda' } = req.body
  
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
  res.json(result)
})
```

### `server/eob5/rekap.js`
Routes dari group `rekap`:
- `GET /api/eob5/rekap/kelas/:kelas` — rekap lengkap satu kelas (nilai + absensi)
- `GET /api/eob5/rekap/siswa/:id` — rekap lengkap satu siswa
- `GET /api/eob5/rekap/guru/:id` — rekap aktivitas guru
- `GET /api/eob5/rekap/periode` — rekap per periode/semester

### `server/eob5/inbox.js`
Routes dari group `inbox`, `feedback`:

> **Penting:** TOMAT sudah punya sistem chat (`server/komunikasi.js`, tabel `pesan_pribadi`, `pesan_forum_kelas`). **Jangan duplikasi** sistem chat.
>
> Inbox EOB5 adalah untuk **notifikasi/pengumuman resmi** dari admin/guru ke semua guru, bukan percakapan. Jika EOB5 inbox-nya sama seperti chat TOMAT, **skip file ini** dan gunakan `/api/komunikasi/*` yang sudah ada.
>
> Kalau benar-benar berbeda (misalnya: broadcast pengumuman sekolah), buat tabel `eob5_inbox` yang terpisah.

- `GET /api/eob5/inbox` — daftar pesan masuk guru
- `POST /api/eob5/inbox` — kirim pengumuman
- `PUT /api/eob5/inbox/:id/baca` — tandai sudah dibaca
- `GET /api/eob5/feedback` — daftar feedback dari siswa

---

## Tabel Baru di `server/schema.js`

Tambahkan di `ensureSchema()` setelah tabel EOB5 Bagian 1:

```javascript
// ── GuruEOB5 Tables (Bagian 2) ───────────────────────────────────────────────

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_nilai_akademik (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    guru_id INTEGER REFERENCES gurus(id),
    mata_pelajaran VARCHAR(100) NOT NULL,
    jenis_nilai VARCHAR(50) NOT NULL,  -- UH | UTS | UAS | tugas | praktik
    nilai NUMERIC(5,2),
    semester VARCHAR(10),
    tahun_ajaran VARCHAR(20),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_materi (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER REFERENCES gurus(id),
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kelas VARCHAR(50),
    mata_pelajaran VARCHAR(100),
    url_file TEXT,
    tipe VARCHAR(50),  -- pdf | video | link | modul-ajar
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_jadwal (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER REFERENCES gurus(id),
    kelas VARCHAR(50) NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    hari VARCHAR(20) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan VARCHAR(50),
    tahun_ajaran VARCHAR(20)
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_prosem (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER REFERENCES gurus(id),
    mata_pelajaran VARCHAR(100) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    semester INTEGER NOT NULL,
    tahun_ajaran VARCHAR(20) NOT NULL,
    konten JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_soal_tersimpan (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER REFERENCES gurus(id),
    topik VARCHAR(255),
    soal_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_inbox (
    id SERIAL PRIMARY KEY,
    pengirim_id INTEGER REFERENCES gurus(id),
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    target_role VARCHAR(20) DEFAULT 'guru',  -- guru | semua
    dibaca_oleh JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

-- Tambahkan tabel lain sesuai audit-eob5.md yang belum tercakup
```

---

## Mount di `server/index.js`

```javascript
// Tambahkan di imports:
import eob5NilaiRouter from './eob5/nilai.js'
import eob5MateriRouter from './eob5/materi.js'
import eob5JadwalRouter from './eob5/jadwal.js'
import eob5ProsemRouter from './eob5/prosem.js'
import eob5SoalOtomatisRouter from './eob5/soal-otomatis.js'
import eob5RekapRouter from './eob5/rekap.js'
import eob5InboxRouter from './eob5/inbox.js'

// Tambahkan di mount:
app.use('/api/eob5/nilai', eob5NilaiRouter)
app.use('/api/eob5/materi', eob5MateriRouter)
app.use('/api/eob5/jadwal', eob5JadwalRouter)
app.use('/api/eob5/prosem', eob5ProsemRouter)
app.use('/api/eob5/soal-otomatis', eob5SoalOtomatisRouter)
app.use('/api/eob5/rekap', eob5RekapRouter)
app.use('/api/eob5/inbox', eob5InboxRouter)
```

---

## Aturan Wajib

- **Jangan duplikasi** sistem chat TOMAT (`/api/komunikasi/*`).
- **Tabel `nilai` TOMAT** hanya untuk skor game — buat `eob5_nilai_akademik` terpisah.
- **Groq SDK** untuk soal otomatis (bukan Gemini) — `GROQ_API_KEY` sudah ada di environment.
- Prefix semua tabel baru dengan `eob5_`.
- Tidak ada TypeScript di files baru.
- Semua error response: `{ error: 'pesan indonesia' }`.

---

## Kriteria Selesai

- [ ] `server/eob5/nilai.js` — CRUD nilai akademik
- [ ] `server/eob5/materi.js` — CRUD materi/modul ajar
- [ ] `server/eob5/jadwal.js` — CRUD jadwal
- [ ] `server/eob5/prosem.js` — CRUD prosem
- [ ] `server/eob5/soal-otomatis.js` — generate soal via Groq
- [ ] `server/eob5/rekap.js` — endpoint rekap
- [ ] `server/eob5/inbox.js` — inbox/pengumuman (atau didokumentasikan kenapa di-skip)
- [ ] Semua tabel baru terdaftar di `ensureSchema()`
- [ ] Semua router terdaftar di `server/index.js`
- [ ] Server start tanpa error
- [ ] `POST /api/eob5/soal-otomatis/generate` return soal valid dari Groq
