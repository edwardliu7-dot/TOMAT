# BLP Sync — Overview

Proyek ini adalah TOMAT (app mobile SMP TISA Islamic School) yang mengintegrasikan modul BLP Harian sebagai sub-modul.

**Referensi asal:** https://github.com/edwardliu7-dot/BLP  
**Tujuan:** Selaraskan logika BLP di workspace ini agar sama persis dengan repo GitHub asli.

---

## Struktur File BLP di Workspace

### Frontend (React JSX, inline styles, tidak pakai Tailwind)
```
src/screens/blp/
  blpAktivitasData.js          ← data aktivitas + fungsi scoring
  BlpSiswaDashboardScreen.jsx  ← dashboard utama siswa
  BlpGuruDashboardScreen.jsx   ← dashboard utama guru
  BlpHomeScreen.jsx            ← halaman home BLP siswa
  BlpIsiAktivitasScreen.jsx    ← isi checklist aktivitas harian
  BlpRiwayatScreen.jsx         ← riwayat isian siswa
  BlpQuranScreen.jsx           ← bookmark quran
  BlpHaidScreen.jsx            ← catat periode haid
  BlpGuruRekapScreen.jsx       ← rekap nilai siswa
  BlpGuruSiswaDetailScreen.jsx ← detail satu siswa (guru)
  BlpGuruPeriodeScreen.jsx     ← atur periode BLP aktif
src/contexts/BlpDataContext.jsx ← shared data context
```

### Backend (Node.js ESM, Express)
```
server/blp/
  helpers.js       ← loadStudent, loadGuru, requireAuth middleware
  aktivitas.js     ← PUT records/:date, PUT review submission
  dashboard.js     ← GET /api/blp/dashboard (system data)
  haid.js          ← POST/PUT haid periods
  periode.js       ← PUT /api/blp/periods
  profil.js        ← PUT profile, GET photo, PUT quran-bookmark
  quran.js         ← GET /api/blp/quran/surah/:no (proxy equran.id)
  siswa-admin.js   ← DELETE /api/blp/students/:id
```

---

## Perbedaan Utama yang Harus Diselaraskan

| # | Area | GitHub Asli | Workspace Saat Ini |
|---|------|-------------|-------------------|
| 1 | ID Aktivitas | `d1`–`d8`, `r1`–`r4`, `rs1`–`rs4`, `rf1`–`rf3`, `rp1`–`rp4` | `d_shalat5waktu`, `r_tepat_waktu`, dll. |
| 2 | Scoring | `getEffectiveCompletedCount` + school-day + haid auto-credit | `hitungSkorV2` sederhana tanpa school-day |
| 3 | Submission Modal | Text, Audio/Quran, Checklist | Tidak ada |
| 4 | Rekap Export | PDF (jsPDF) + Excel (ExcelJS) | Tidak ada |
| 5 | Purge Otomatis | Hapus konten submission 7 hari setelah direview | Tidak ada |
| 6 | Data Quran lengkap | 114 surah dengan nama Arab + Latin | Hanya subset surah |

---

## Urutan Pengerjaan

1. `01-db-migration.md` — Migrasi ID aktivitas di database  
2. `02-aktivitas-data.md` — Update blpAktivitasData.js  
3. `03-utils.md` — Buat utils/blpScoring.js dan utils/rekapExport.js  
4. `04-modals.md` — Buat semua modal komponen  
5. `05-siswa-dashboard.md` — Rewrite BlpSiswaDashboardScreen.jsx  
6. `06-guru-dashboard.md` — Rewrite BlpGuruDashboardScreen.jsx  
7. `07-other-screens.md` — Update layar-layar lain  
8. `08-server.md` — Update server (purge job, dashboard query)  
