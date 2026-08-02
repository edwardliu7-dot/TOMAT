# Audit BLP Harian

## Struktur Folder

```
/
├── server/
│   └── index.ts              # Entry point Express (semua route inline di satu file)
├── src/
│   ├── App.tsx               # SPA entry, conditional render by auth state
│   ├── components/
│   │   ├── Login.tsx         # Halaman login (siswa & guru)
│   │   ├── SiswaDashboard.tsx # Dashboard utama siswa
│   │   ├── GuruDashboard.tsx  # Dashboard utama guru
│   │   ├── LoadingScreen.tsx  # Layar loading
│   │   ├── modals/           # Modal fitur spesifik (BLP period, Quran, dll)
│   │   └── layout/           # PageLayout, SiteHeader, SiteFooter
│   ├── data/                 # Static data aktivitas & metadata Quran
│   └── utils/                # Logika scoring & export Excel/PDF
├── db/
│   └── schema.sql            # DDL database
└── attached_assets/          # Aset statis
```

## Stack & Dependencies

**Dependencies yang TIDAK ada di TOMAT saat ini:**
| Package | Versi | Keterangan |
|---------|-------|-----------|
| `date-fns` | ^4.4.0 | Utilitas tanggal |
| `exceljs` | ^4.4.0 | Export Excel |
| `jspdf` | ^4.2.1 | Export PDF |
| `jspdf-autotable` | ^5.0.8 | Tabel di PDF |
| `xlsx` | ^0.18.5 | Parse/write Excel |
| `@google/genai` | ^2.4.0 | Google Gemini SDK (BLP punya tapi belum dipakai aktif) |
| `lucide-react` | ^0.546.0 | Icon library |
| `motion` (framer-motion) | ^12.23.24 | Animasi |
| `clsx` | ^2.1.1 | Class utility |
| `tailwind-merge` | ^3.6.0 | Tailwind utility (TIDAK perlu di TOMAT) |

**Yang sudah ada di TOMAT:** `bcryptjs`, `express`, `express-session`, `pg`, `react`, `react-dom`, `react-easy-crop`

## Backend Routes

Semua route ada di `server/index.ts` (satu file monolitik, tidak dipisah per router):

```
GET  /api/me/dashboard-data                          — Data dashboard user yang login (siswa/guru)
GET  /api/system-data                                — Semua students, gurus, BLP periods
PUT  /api/blp-periods                                — (Guru) Set rentang tanggal BLP aktif per kelas
POST /api/login/siswa                                — Login siswa
POST /api/login/guru                                 — Login guru (hanya wali kelas)
GET  /api/auth/me                                    — Cek session yang aktif
POST /api/logout                                     — Hapus session
PUT  /api/students/:id/records/:date                 — (Siswa) Simpan catatan BLP harian
PUT  /api/students/:id/quran-bookmark                — (Siswa) Update progres baca Quran
PUT  /api/students/:id/profile                       — (Siswa) Update foto & bio
POST /api/students/:id/haid                          — (Siswa) Catat mulai haid
PUT  /api/students/:id/haid/end                      — (Siswa) Catat selesai haid
PUT  /api/gurus/:id/profile                          — (Guru) Update foto & bio guru
GET  /api/students/:id/photo                         — (Guru) Ambil foto siswa on-demand
DELETE /api/students/:id                             — (Guru) Hapus akun siswa
PUT  /api/students/:id/records/:date/submissions/:activityId/review — (Guru) Review submission siswa
GET  /api/quran/surah/:no                            — Ambil konten surah Al-Quran
```

## Frontend Screens

SPA dengan conditional rendering di `App.tsx`:
- **Login** — `src/components/Login.tsx` (form login siswa & guru)
- **Student Dashboard** — `src/components/SiswaDashboard.tsx` (checklist harian, Quran tracker, rekap skor)
- **Teacher Dashboard** — `src/components/GuruDashboard.tsx` (monitor siswa, review submission, set BLP period)
- **Loading Screen** — `src/components/LoadingScreen.tsx`

## Database

**Tabel yang HANYA dimiliki BLP (tidak ada di TOMAT):**
| Tabel | Kolom Utama |
|-------|------------|
| `daily_records` | `student_id`, `record_date`, `completed_activities` (text[]), `score`, `submissions` (jsonb), `updated_at` |
| `blp_periods` | `kelas`, `year`, `month`, `start_day`, `end_day`, `updated_by`, `updated_at` |
| `haid_periods` | `id` serial, `student_id`, `start_date`, `end_date`, `created_at`, `updated_at` |
| `nilai` | `id`, `student_id`, `label`, `score`, `created_at` |

**Kolom tambahan di tabel shared yang BLP tambahkan:**
- `students.jenis_kelamin` — `text CHECK (jenis_kelamin IN ('L', 'P'))` — ditambah via `ALTER TABLE IF NOT EXISTS`
- `students.quran_bookmark` — `jsonb` — progress baca Quran per siswa
- `students.bio` — `text` — sudah ada di TOMAT juga

## Auth System BLP

- **Library:** `express-session` (session in-memory, bukan PostgreSQL store)
- **Login Logic:** Verifikasi terhadap tabel `students` atau `gurus` di Neon. Mendukung bcrypt DAN plaintext (legacy cross-app compatibility).
- **Session:** Menyimpan `userId` dan `role` ('siswa'/'guru') di session.
- **Middleware `requireAuth(role, idParam?)`:** Enforce role-based access; jika `idParam` diberikan, user hanya bisa akses data miliknya sendiri.
- **Frontend persistence:** `localStorage` key `blp_auth_state` untuk hydrate ulang; divalidasi saat boot via `GET /api/auth/me`.
- **Username normalization:** `toId()` — lowercase, spasi → tanda hubung, sehingga "Ahmad Fauzi" menjadi "ahmad-fauzi".
- **Timezone:** Semua kalkulasi "hari ini" menggunakan `Asia/Jakarta` via `Intl.DateTimeFormat`.

## Fitur Utama

1. **Daily Checklist** — Siswa menceklis aktivitas keagamaan & sekolah harian (sholat, ngaji, dll)
2. **Quran Tracker** — Siswa mencatat progres baca Al-Quran dengan bookmark per surah/ayat
3. **Haid Period Tracking** — Siswa perempuan mencatat periode haid (aktivitas sholat otomatis dikecualikan)
4. **Skor Harian** — Sistem scoring otomatis berdasarkan aktivitas yang diceklis
5. **BLP Period Management** — Guru mengatur rentang tanggal aktif BLP per kelas per bulan
6. **Submission Review** — Guru bisa review dan approve submission aktivitas tertentu (bukti foto, dll)
7. **Rekap Dashboard Guru** — Guru melihat progress dan skor semua siswa di kelasnya
8. **Export Data** — Export laporan ke Excel/PDF (via `exceljs`, `jspdf`)
9. **Foto Profil** — Crop & upload foto untuk siswa dan guru (menggunakan `react-easy-crop` — sama dengan TOMAT)
10. **Multi-kelas Guru** — Guru bisa mengampu beberapa kelas sekaligus (`kelas_diampu` array)

## Catatan Integrasi

1. **Session store berbeda:** BLP menggunakan in-memory session, TOMAT memakai PostgreSQL (`tomat_sessions`). Saat merge, semua route BLP akan otomatis pakai session store TOMAT.
2. **Tabel `nilai` konflik nama:** TOMAT sudah punya tabel `nilai` (hasil tugas siswa) dengan skema berbeda dari `nilai` BLP (label + score). Perlu rename tabel BLP menjadi `blp_nilai` atau di-drop jika tidak dipakai.
3. **Route prefix:** Semua endpoint BLP perlu diberi prefix `/api/blp/` agar tidak konflik dengan route TOMAT.
4. **`daily_records`, `blp_periods`, `haid_periods`** — tabel baru murni BLP, aman ditambahkan ke `server/schema.js` via `ensureSchema()`.
5. **Kolom `students.jenis_kelamin`** — perlu ditambahkan ke `ensureSchema()` TOMAT.
6. **Frontend:** Seluruh UI BLP menggunakan Tailwind + ShadCN → harus dikonversi ke inline styles saat diintegrasikan ke TOMAT.
7. **No TypeScript di TOMAT:** BLP ditulis TypeScript, harus dikonversi ke JSX/JS saat migrasi.
8. **Quran API:** Mengambil konten surah dari database/JSON lokal — perlu cek apakah ada file data yang perlu dicopy ke TOMAT.
