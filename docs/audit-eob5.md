# Audit GuruEOB5

## Struktur Folder

```
/
├── artifacts/
│   ├── guru-eob5/                  # Frontend React (Vite + ShadCN)
│   │   ├── src/
│   │   │   ├── pages/              # Halaman-halaman utama
│   │   │   ├── components/         # Komponen UI (ShadCN-based)
│   │   │   └── ...
│   │   └── package.json
│   └── api-server/                 # Backend Express (TypeScript)
│       ├── src/
│       │   ├── index.ts            # Entry point server
│       │   ├── routes/             # Semua route handler
│       │   │   ├── index.ts        # Router aggregator
│       │   │   ├── health.ts
│       │   │   ├── auth.ts
│       │   │   ├── dashboard.ts
│       │   │   ├── roles.ts
│       │   │   ├── teachers.ts
│       │   │   ├── students.ts
│       │   │   ├── subjects.ts
│       │   │   ├── documents.ts
│       │   │   ├── tujuan-pembelajaran.ts
│       │   │   ├── journal.ts
│       │   │   ├── attendance.ts
│       │   │   ├── grades.ts
│       │   │   ├── points.ts
│       │   │   ├── academic-calendars.ts
│       │   │   ├── prosem.ts
│       │   │   ├── info-pekanan.ts
│       │   │   ├── modul-ajar.ts
│       │   │   ├── soal-otomatis.ts
│       │   │   ├── student-accounts.ts
│       │   │   ├── feedback.ts
│       │   │   ├── bahan-ajar.ts
│       │   │   ├── jadwal.ts
│       │   │   ├── rekap.ts
│       │   │   └── inbox.ts
│       │   └── lib/
│       │       ├── gemini.ts       # AI integration (pakai Groq SDK)
│       │       └── docx-soal.ts    # Konversi soal AI ke DOCX
│       └── package.json
└── lib/
    └── db/
        └── src/
            ├── schema/             # Drizzle ORM schema files
            │   ├── index.ts
            │   ├── academic-calendar.ts
            │   ├── ai-content.ts
            │   ├── attendance.ts
            │   ├── bahan-ajar.ts
            │   ├── documents.ts
            │   ├── feedback.ts
            │   ├── grades.ts
            │   ├── journal.ts
            │   ├── points.ts
            │   ├── prosem.ts
            │   ├── schedules.ts
            │   ├── student-accounts.ts
            │   ├── students.ts
            │   ├── subjects.ts
            │   └── tujuan-pembelajaran.ts
            └── neon/               # Shared Neon table definitions (gurus, tomat_students)
```

## Stack & Dependencies

**API Server — dependencies yang TIDAK ada di TOMAT:**
| Package | Keterangan |
|---------|-----------|
| `groq-sdk` | AI text generation (soal otomatis, modul ajar) — pakai `GROQ_API_KEY` |
| `drizzle-orm` | ORM → akan dikonversi ke `pool.query` biasa |
| `docx` | Generate file Word (.docx) |
| `mammoth` | Parse file Word |
| `pdf-parse` | Parse isi PDF |
| `pdfkit` | Generate file PDF |
| `pino` / `pino-http` | Structured logging |
| `cookie-parser` | Cookie middleware |
| `cors` | CORS middleware |
| `connect-pg-simple` | PostgreSQL session store — sudah ada di TOMAT |

**Frontend (guru-eob5) — tidak perlu diinstall di TOMAT:**
- Seluruh `@radix-ui/*` → ShadCN components (TOMAT pakai inline styles)
- `tailwindcss`, `tailwind-merge`, `class-variance-authority` → TOMAT pakai inline styles
- `@tanstack/react-query` → state management API calls
- `wouter` → routing SPA
- `recharts` → chart/grafik
- `react-hook-form`, `zod` → form validation
- `@uppy/core`, `@uppy/dashboard`, `@uppy/react`, `@uppy/aws-s3` → upload file ke S3
- `exceljs`, `xlsx` → export Excel
- `html2canvas` → screenshot ke canvas
- `date-fns` → utilitas tanggal

## Backend Routes

### health
```
GET  /health                     — Cek status server
```

### auth
```
POST /auth/login                 — Login guru (validasi terhadap tabel gurus di Neon)
POST /auth/logout                — Logout
GET  /auth/me                    — Ambil data guru yang sedang login
```

### dashboard
```
GET  /dashboard                  — Data ringkasan dashboard guru
```

### roles
```
GET  /roles                      — Daftar role yang tersedia
```

### teachers
```
GET  /teachers                   — Daftar semua guru
GET  /teachers/:id               — Detail guru
POST /teachers                   — Tambah guru baru
PATCH /teachers/:id              — Update data guru
DELETE /teachers/:id             — Hapus guru
```

### students
```
GET  /students                   — Daftar siswa (filter by kelas/school)
GET  /students/:id               — Detail siswa
POST /students                   — Tambah siswa baru ke roster EOB5
PATCH /students/:id              — Update data siswa
DELETE /students/:id             — Hapus siswa dari roster
```

### subjects
```
GET  /subjects                   — Daftar mata pelajaran guru yang login
POST /subjects                   — Buat mata pelajaran baru
PATCH /subjects/:id              — Update mata pelajaran
DELETE /subjects/:id             — Hapus mata pelajaran
```

### documents
```
GET  /documents                  — Daftar dokumen
POST /documents                  — Upload dokumen
DELETE /documents/:id            — Hapus dokumen
```

### tujuan-pembelajaran
```
GET  /tujuan-pembelajaran        — Daftar TP per mata pelajaran + kalender
POST /tujuan-pembelajaran        — Tambah TP baru
PATCH /tujuan-pembelajaran/:id   — Update TP
DELETE /tujuan-pembelajaran/:id  — Hapus TP
```

### journal
```
GET  /journal                    — Daftar jurnal mengajar
POST /journal                    — Buat jurnal baru
PATCH /journal/:id               — Update jurnal
DELETE /journal/:id              — Hapus jurnal
```

### attendance
```
GET  /attendance                 — Data absensi (filter by kelas/tanggal)
POST /attendance                 — Input absensi satu siswa
PATCH /attendance/:id            — Update status absensi
DELETE /attendance/:id           — Hapus record absensi
POST /attendance/bulk            — Input absensi bulk satu kelas
POST /attendance/bulk-mixed      — Input absensi bulk mixed status
GET  /attendance/rekap           — Rekap absensi per kelas
DELETE /attendance/bulk-kelas    — Hapus semua absensi kelas tertentu
```

### grades
```
GET  /grades                     — Data nilai siswa
POST /grades                     — Input nilai
PATCH /grades/:id                — Update nilai
DELETE /grades/:id               — Hapus nilai
```

### points
```
GET  /points                     — Daftar poin siswa
POST /points                     — Tambah record poin (positif/negatif)
PATCH /points/:id                — Update record poin
DELETE /points/:id               — Hapus record poin
```

### academic-calendars
```
GET  /academic-calendars         — Daftar kalender akademik
POST /academic-calendars         — Buat kalender baru
PATCH /academic-calendars/:id    — Update kalender
DELETE /academic-calendars/:id   — Hapus kalender
GET  /academic-calendars/:id/weeks — Minggu-minggu dalam kalender
POST /academic-calendars/:id/weeks — Tambah minggu ke kalender
```

### prosem
```
GET  /prosem                     — Daftar program semester
POST /prosem                     — Buat prosem baru
PATCH /prosem/:id                — Update prosem
DELETE /prosem/:id               — Hapus prosem
GET  /prosem/:id/export          — Export prosem ke Excel/PDF
```

### info-pekanan
```
GET  /info-pekanan               — Daftar info pekanan
POST /info-pekanan               — Buat info pekanan baru
PATCH /info-pekanan/:id          — Update info pekanan
DELETE /info-pekanan/:id         — Hapus info pekanan
```

### modul-ajar
```
GET  /modul-ajar                 — Daftar modul ajar tersimpan
POST /modul-ajar/generate        — Generate modul ajar via AI (Groq)
GET  /modul-ajar/:id             — Detail modul ajar
DELETE /modul-ajar/:id           — Hapus modul ajar
GET  /modul-ajar/:id/docx        — Download modul ajar sebagai file .docx
```

### soal-otomatis
```
GET  /soal-otomatis              — Daftar soal tersimpan
POST /soal-otomatis/generate     — Generate soal via AI (Groq)
GET  /soal-otomatis/:id          — Detail soal
DELETE /soal-otomatis/:id        — Hapus soal
GET  /soal-otomatis/:id/docx     — Download soal sebagai file .docx
```

### student-accounts
```
GET  /student-accounts           — Daftar akun siswa yang sudah dibuat
POST /student-accounts           — Buat akun TOMAT/BLP untuk siswa roster
GET  /student-accounts/:id       — Detail akun siswa
DELETE /student-accounts/:id     — Hapus akun siswa
```

### feedback
```
GET  /feedback                   — Daftar feedback
POST /feedback                   — Submit feedback baru
```

### bahan-ajar
```
GET  /bahan-ajar                 — Daftar bahan ajar
POST /bahan-ajar                 — Upload bahan ajar
DELETE /bahan-ajar/:id           — Hapus bahan ajar
```

### jadwal
```
GET  /jadwal                     — Daftar jadwal pelajaran
POST /jadwal                     — Buat jadwal baru
PATCH /jadwal/:id                — Update jadwal
DELETE /jadwal/:id               — Hapus jadwal
POST /jadwal/import-preview      — Preview import jadwal dari PDF
POST /jadwal/bulk                — Import jadwal bulk
```

### rekap
```
GET  /rekap/absensi              — Rekap absensi (export-ready)
GET  /rekap/nilai                — Rekap nilai (export-ready)
```

### inbox
```
GET  /inbox/unread-count         — Jumlah pesan belum dibaca
GET  /inbox                      — Daftar percakapan inbox
GET  /inbox/:studentId           — Riwayat pesan dengan siswa tertentu
PATCH /inbox/:studentId/read     — Tandai pesan sudah dibaca
POST /inbox/:studentId           — Kirim pesan ke siswa
```

## Frontend Screens

Lokasi: `artifacts/guru-eob5/src/pages/`

**Dashboard & Auth:**
- `dashboard.tsx` — Halaman utama dashboard guru
- `login.tsx` — Login guru
- `register.tsx` — Registrasi guru baru

**Akademik:**
- `absensi.tsx` — Input & rekap absensi harian
- `jurnal.tsx` — Jurnal mengajar
- `nilai.tsx` — Input nilai Kurikulum Merdeka (formatif, sumatif LM, sumatif akhir)
- `poin.tsx` — Poin perilaku siswa (positif/negatif)
- `jadwal.tsx` — Manajemen jadwal pelajaran
- `kalender.tsx` — Kalender akademik & minggu efektif

**Perencanaan:**
- `prosem.tsx` — Program Semester
- `modul-ajar.tsx` — Modul Ajar (manual + AI-generated)
- `administrasi.tsx` — Halaman administrasi umum
- `kurikulum.tsx` — Manajemen Tujuan Pembelajaran (TP)

**AI Tools:**
- `soal-otomatis.tsx` — Generate soal ujian otomatis via AI

**Data Siswa & Guru:**
- `direktori-siswa.tsx` — Direktori semua siswa
- `siswa.tsx` — Manajemen data siswa
- `akun-siswa.tsx` — Buat & kelola akun TOMAT/BLP untuk siswa
- `guru.tsx` — Manajemen data guru
- `walikelas.tsx` — Fitur khusus wali kelas
- `kesiswaan.tsx` — Urusan kesiswaan
- `kepsek.tsx` — View khusus kepala sekolah

**Komunikasi:**
- `kotak-masuk.tsx` — Inbox pesan guru↔siswa
- `info-pekanan.tsx` — Info/pengumuman mingguan
- `feedback.tsx` — Form feedback siswa

**Pengaturan:**
- `pengaturan.tsx` — Pengaturan akun guru

## Database

Semua tabel EOB5 menggunakan Drizzle ORM. Harus dikonversi ke `pool.query` dan ditambahkan ke `ensureSchema()` TOMAT.

**Tabel Baru (tidak ada di TOMAT maupun BLP):**

| Tabel | Kolom Utama |
|-------|------------|
| `guru_eob5_students` | `id` uuid, `nisn`, `namaLengkap`, `kelas`, `jenisKelamin`, `school`, `teacherId` — roster siswa EOB5 (BERBEDA dari `students` TOMAT) |
| `subjects` | `id` uuid, `name`, `teacherId`, `school`, `createdAt` |
| `attendance_records` | `id` uuid, `studentId`, `tanggal`, `status` (hadir/izin/sakit/alpa), `filledByTeacherId`, `filledByTeacherName`, `createdAt` |
| `journal_entries` | `id` uuid, `subjectId`, `teacherId`, `date`, `materi`, `catatan`, `createdAt` |
| `grades` | `id` uuid, `studentId`, `subjectId`, `calendarId`, `jenis` (formatif/sumatif_lm/sumatif_tengah/sumatif_akhir), `lingkupMateri`, `tpNumber`, `nilai`, `createdAt` |
| `point_records` | `id` uuid, `studentId`, `jenis` (positif/negatif), `poin`, `keterangan`, `tanggal`, `createdAt` |
| `tujuan_pembelajaran` | `id` uuid, `teacherId`, `subjectId`, `calendarId`, `lingkupMateri`, `tpNumber`, `description`, `createdAt` |
| `academic_calendars` | `id` uuid, `school`, `createdBy`, `tahunAjaran`, `semester`, `createdAt` |
| `academic_weeks` | `id` uuid, `calendarId`, `pekanKe`, `tanggalMulai`, `tanggalSelesai`, `jenis`, `keterangan`, `createdAt` |
| `prosem` | `id` uuid, (lihat prosem.ts) |
| `ai_modul_ajar` | `id` uuid, `teacherId`, `subjectId`, `materi`, `alokasiWaktu`, `content` (jsonb), `createdAt` |
| `ai_soal_otomatis` | `id` uuid, `teacherId`, `subjectId`, `materi`, `jumlahSoal`, `jenisSoal`, `tingkatKesulitan`, `content` (jsonb), `createdAt` |
| `schedules` | `id` uuid, `subjectId`, `kelas`, `hari`, `jamMulai`, `jamSelesai`, `school`, `createdAt` |
| `student_accounts` | `id` uuid, `studentId`, `tomatStudentId`, `username`, `password` (plaintext), `createdAt` |
| `documents` | `id` uuid, (lihat documents.ts) |
| `bahan_ajar` | (lihat bahan-ajar.ts) |
| `feedback_eob5` | (lihat feedback.ts) |

**Drizzle Schema Files:** `lib/db/src/schema/*.ts`

## Auth System EOB5

- **Library:** `express-session` + `connect-pg-simple` (PostgreSQL session store) — sama dengan TOMAT
- **Database:** Menggunakan `NEON_DATABASE_URL` yang sama — login terhadap tabel `gurus` di Neon
- **Password:** bcrypt (`bcryptjs`) — verifikasi hash bcrypt
- **Role/Jabatan:** Field `jabatan` (text array) di tabel `gurus` — nilai: `kepala_sekolah`, `guru`, `wali_kelas`, `kesiswaan`, dll
- **Session:** Menyimpan `teacherId`, `school`, `jabatan` di session
- **Middleware `requireAuth`:** Cek session; jika tidak ada → 401

**Catatan:** EOB5 menggunakan Neon DB yang sama dengan TOMAT dan BLP. Setelah merge, guru yang sudah login di TOMAT akan langsung bisa akses fitur EOB5 tanpa login ulang (single session).

## Fitur Utama

1. **Absensi Digital** — Input & rekap kehadiran harian per kelas, bulk input, export rekap
2. **Jurnal Mengajar** — Dokumentasi materi dan catatan per pertemuan
3. **Nilai Kurikulum Merdeka** — Input formatif (per TP), sumatif per LM, sumatif akhir
4. **Poin Perilaku** — Tracking poin positif/negatif siswa dengan keterangan
5. **Program Semester (Prosem)** — Perencanaan materi per semester, export ke dokumen
6. **Tujuan Pembelajaran (TP)** — Manajemen TP Kurikulum Merdeka per mata pelajaran
7. **Kalender Akademik** — Minggu efektif, hari libur, struktur semester
8. **Jadwal Pelajaran** — Input manual + import otomatis dari PDF jadwal
9. **Soal Otomatis (AI)** — Generate soal pilihan ganda/esai via Groq LLM, download DOCX
10. **Modul Ajar (AI)** — Generate modul ajar lengkap via Groq LLM, download DOCX
11. **Akun Siswa** — Guru bisa buat akun TOMAT/BLP untuk siswa dari daftar roster
12. **Inbox** — Pesan guru↔siswa, unread count
13. **Info Pekanan** — Pengumuman/info mingguan dari guru
14. **Rekap Export** — Export rekap absensi & nilai ke Excel/PDF

## Integrasi Gemini (Groq)

- **File:** `artifacts/api-server/src/lib/gemini.ts` (nama file "gemini" tapi isinya Groq SDK)
- **Model teks:** `llama-3.3-70b-versatile` (via Groq)
- **Model vision:** `meta-llama/llama-4-scout-17b-16e-instruct` (via Groq, untuk parse gambar)
- **Env Var:** `GROQ_API_KEY` — **sudah tersedia di TOMAT sebagai secret**
- **Soal Otomatis:** Fungsi `generateSoal(params)` — menerima mataPelajaran, materi, jumlahSoal, jenisSoal (pilihan_ganda/esai), tingkatKesulitan; prompt AI untuk return JSON array soal dengan kunci jawaban; `docx-soal.ts` konversi ke Word.
- **Modul Ajar:** Fungsi `generateModulAjar(params)` — return JSON terstruktur lengkap (tujuan, kegiatan, assessment); dikonversi ke .docx via library `docx`.

## Catatan Integrasi

1. **Drizzle ORM → pool.query:** Semua query Drizzle harus dikonversi ke `pool.query` biasa saat pindah ke TOMAT.
2. **Table `students` vs `guru_eob5_students`:** EOB5 punya roster siswa sendiri (bukan tabel `students` TOMAT) — perlu rename konsisten, misalnya `eob5_students`.
3. **GROQ_API_KEY sudah ada** di TOMAT secrets — tidak perlu tambah secret baru.
4. **connect-pg-simple sudah ada** di TOMAT — session store PostgreSQL sudah terpakai.
5. **File upload (Uppy/S3):** EOB5 menggunakan Uppy + AWS S3 untuk upload dokumen/bahan ajar. Perlu keputusan: pakai S3 atau simpan lokal di `/public/`.
6. **Tabel `nilai` konflik:** TOMAT sudah punya tabel `nilai`, EOB5 memakai tabel berbeda (`grades`) — tidak konflik.
7. **Route prefix:** Semua endpoint EOB5 perlu prefix `/api/eob5/` agar tidak konflik dengan TOMAT.
8. **TypeScript → JavaScript:** Semua route file `.ts` harus dikonversi ke `.js` untuk TOMAT.
9. **`pdf-parse` dan `pdfkit`:** Dipakai untuk import jadwal dari PDF — perlu diinstall di TOMAT.
10. **`docx`:** Dipakai untuk generate file Word (soal + modul ajar) — perlu diinstall.
11. **Jabatan guru berbeda:** TOMAT saat ini hanya punya field `jabatan` (text array) — EOB5 memanfaatkan nilai spesifik (`kepala_sekolah`, `wali_kelas`, dll) untuk role-based UI. Kompatibel selama kolom `jabatan` sudah ada.
