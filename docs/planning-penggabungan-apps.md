# Planning Penggabungan TOMAT + BLP Harian + GuruEOB5

> Dibuat: 1 Agustus 2026  
> Status: **Belum dikerjakan — siap untuk dieksekusi**

---

## Latar Belakang

Saat ini ada 3 aplikasi terpisah yang berbagi database Neon yang sama (tabel `gurus` dan `students`):

| App | Repo / Lokasi | Stack | Fungsi |
|---|---|---|---|
| **TOMAT** | Repl ini | React 18 JSX + Express JS + Socket.io + Neon | Game RPG edukasi Math siswa SMP |
| **BLP Harian** | github: edwardliu7-dot/BLP | React 19 TSX + Express TS + Tailwind + Neon | Tracker aktivitas BLP harian siswa |
| **GuruEOB5** | github: edwardliu7-dot/GuruEOB5 | React TSX + Vite + Tailwind + ShadCN + Express TS + Drizzle ORM + Neon | Administrasi guru (absensi, nilai, prosem, soal AI, jadwal, dll) |

**Masalah saat ini:** Guru harus login 3 kali di 3 URL berbeda. Siswa harus membuka 2 app berbeda.

---

## Kondisi Sekarang vs Hasil Akhir

### Sekarang
```
🎮 TOMAT          → tomat.replit.app    (login sendiri)
📋 BLP Harian     → blp.replit.app      (login sendiri)
🏫 GuruEOB5       → gurueob5.replit.app (login sendiri)
```

### Target Akhir (Pilihan B selesai)
```
🏠 smp-tisa.app   → login SEKALI → akses semua app
```

---

## Temuan Teknis Penting

### DB sudah share
- TOMAT dan BLP sudah pakai `gurus`/`students` tabel yang sama di Neon
- GuruEOB5 punya `lib/db/src/neon/gurus.ts` dan `lib/db/src/neon/tomat-students.ts` → sudah mengarah ke DB yang sama

### Overlap fitur (aman dipertahankan terpisah)
| Domain | TOMAT | BLP | GuruEOB5 | Keputusan |
|---|---|---|---|---|
| Auth / Login | ✅ | ✅ | ✅ | → **satu auth, share session** |
| Data siswa | ✅ | ✅ | ✅ | → sudah satu tabel, aman |
| Nilai | `nilai` (game score) | `score` (BLP score) | `grades` (akademik) | → beda domain, **pertahankan terpisah** |
| Chat/komunikasi | ✅ | ❌ | ❌ | → tetap di TOMAT |
| Absensi | ❌ | ❌ | ✅ | → tetap di GuruEOB5 |
| AI soal/modul | ❌ | ❌ | ✅ Gemini | → tetap di GuruEOB5, bisa disambung nanti |
| Profil foto | ✅ | ✅ | ❌ | → sudah share via `photo_url` |

### GuruEOB5 route list (dari `artifacts/api-server/src/routes/index.ts`)
`health, auth, dashboard, roles, teachers, students, subjects, documents, tujuan-pembelajaran, journal, attendance, grades, points, academic-calendars, prosem, info-pekanan, modul-ajar, soal-otomatis, student-accounts, feedback, bahan-ajar, jadwal, rekap, inbox`

### Stack mismatch
- TOMAT: **JavaScript** (JSX)
- BLP + GuruEOB5: **TypeScript** (TSX)
- Ini hambatan utama jika ingin full merge frontend

---

## 3 Pilihan Pendekatan

### ❌ Pilihan A — App Switcher saja (1–2 minggu)
Tambahkan tombol di navbar masing-masing app yang mengarah ke app lain. Login tetap 3x terpisah.
- **Tidak direkomendasikan** — manfaat kecil, masalah utama (login 3x) tidak selesai.

---

### ✅ Pilihan B — Satu Login, Tiga App (2–4 minggu) — **DIREKOMENDASIKAN**
Buat shared auth server. Login sekali, session berlaku di semua app. Tampilan masing-masing app tidak berubah, tapi ada app switcher di navbar.

**Tampilan guru setelah selesai:**
```
┌────────────────────────────────────────────┐
│  🏠 SMP TISA   [TOMAT] [BLP] [EOB5]  👤  │
├────────────────────────────────────────────┤
│  (klik TOMAT → dashboard guru TOMAT)       │
│  (klik BLP   → rekap BLP siswa)            │
│  (klik EOB5  → absensi, nilai, prosem...)  │
└────────────────────────────────────────────┘
```

**Tampilan siswa setelah selesai:**
```
┌────────────────────────────────────────────┐
│  🏠 SMP TISA        [TOMAT] [BLP]    👤   │
├────────────────────────────────────────────┤
│  (klik TOMAT → main game seperti biasa)    │
│  (klik BLP   → isi aktivitas harian BLP)   │
└────────────────────────────────────────────┘
```

---

### ⏳ Pilihan C — Satu App Besar (2–3 bulan, opsional nanti)
Gabung ketiga app jadi satu codebase, satu navigasi, satu bundle.
- **Risiko tinggi** karena beda teknologi (JS vs TS)
- **Waktu sangat lama**
- Kerjakan ini hanya setelah Pilihan B stabil

---

## Rencana Implementasi Pilihan B

### Fase 1 — Unified Auth Server
1. Buat shared auth endpoint di server TOMAT (sudah paling mature) atau server baru
   - `POST /api/auth/login` — cek `students` + `gurus`, return role + userId
   - `GET /api/auth/me` — cek session aktif
   - `POST /api/auth/logout`
2. BLP dan GuruEOB5 redirect ke auth endpoint yang sama
3. Session cookie di-share via `domain: '.smp-tisa.app'` (butuh satu domain)

### Fase 2 — App Switcher
1. Tambahkan komponen `AppSwitcher` di navbar masing-masing app
2. Siswa: tombol TOMAT + BLP
3. Guru: tombol TOMAT + BLP + EOB5
4. Deep-link antar-app (contoh: dari TOMAT tugas → langsung ke BLP hari itu)

### Fase 3 — Monorepo Structure (opsional, jangka panjang)
Jadikan satu monorepo dengan pnpm workspaces seperti struktur GuruEOB5, tapi diperluas:
```
smp-tisa/
├── apps/
│   ├── tomat/          ← frontend TOMAT (JSX tetap)
│   ├── blp/            ← frontend BLP (TSX)
│   └── guru-eob5/      ← frontend GuruEOB5 (TSX)
├── server/
│   ├── auth.ts         ← shared auth
│   ├── tomat/          ← TOMAT routes + Socket.io
│   ├── blp/            ← BLP routes
│   └── eob5/           ← GuruEOB5 routes
└── lib/
    ├── db/             ← schema bersama (Drizzle)
    └── shared-types/   ← User, Guru, Session types
```

---

## Hambatan yang Harus Diselesaikan Sebelum Mulai

| # | Hambatan | Solusi |
|---|---|---|
| 1 | **Stack JS vs TS** | Jalankan TOMAT tetap JSX selama fase 1–2; migrate TS bertahap di fase 3 |
| 2 | **DB schema management konflik** | GuruEOB5 pakai Drizzle, TOMAT pakai ensureSchema(). Pilih Drizzle sebagai standar; wrap ensureSchema TOMAT di Drizzle migration sekali |
| 3 | **Socket.io TOMAT** | Server gabungan harus tetap expose Socket.io untuk duel/turnamen/boss raid |
| 4 | **Session cross-domain** | Butuh satu domain bersama, atau gunakan SSO token-based |
| 5 | **GuruEOB5 kemungkinan pakai DB terpisah** (VPS) | Cek apakah `NEON_DATABASE_URL` sama dengan TOMAT; kalau beda, perlu migrasi atau dual-pool |
| 6 | **BLP punya fitur Quran + Haid** | Tidak konflik, tetap modul BLP, tidak perlu merge ke TOMAT |

---

## Urutan Kerja yang Disarankan

```
[✅ Sekarang] Ketiga app berjalan terpisah

[Langkah 1]  Verifikasi NEON_DATABASE_URL ketiga app — apakah sama?
             Kalau beda → tentukan mana yang jadi "master DB"

[Langkah 2]  Implement Fase 1 (Unified Auth) di server TOMAT
             → tambah endpoint /api/auth/* yang bisa dipakai BLP + EOB5

[Langkah 3]  Update BLP untuk pakai auth TOMAT
             → ganti login flow BLP ke auth bersama

[Langkah 4]  Update GuruEOB5 untuk pakai auth TOMAT
             → ganti login flow GuruEOB5 ke auth bersama

[Langkah 5]  Tambah App Switcher di navbar semua app (Fase 2)

[Langkah 6]  Deploy semua di satu domain (opsional, butuh setup nginx/reverse proxy)

[Nanti]      Fase 3 jika diperlukan
```

---

## Pertanyaan yang Perlu Dijawab Sebelum Mulai

1. Apakah `NEON_DATABASE_URL` di ketiga app sama persis?
2. Apakah GuruEOB5 sudah live di Replit, atau masih lokal/VPS?
3. Apakah mau semua app di **satu domain** (butuh custom domain baru), atau cukup **link antar-domain** dulu?
4. Apakah GuruEOB5 mau di-migrate ke Replit juga, atau tetap di hosting sendiri?

---

*Dokumen ini bisa dijadikan brief untuk mulai mengerjakan kapan saja.*
