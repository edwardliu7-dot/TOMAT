# Prompt 00 — Audit & Persiapan Direktori

## Prasyarat
Tidak ada. Ini adalah prompt pertama dari seri Pilihan C (penggabungan 3 app jadi satu).

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP (Kelas 7–9).  
Stack: React 18 JSX + Express JS + Socket.io + PostgreSQL (Neon).

**Baca RULES.md sebelum melakukan apapun.** File itu adalah panduan wajib arsitektur proyek ini.

Tujuan seri prompt ini: menggabungkan 2 aplikasi lain ke dalam TOMAT sehingga guru/siswa hanya perlu login sekali:
- **BLP Harian** (github: edwardliu7-dot/BLP) — React 19 TSX + Express TS + Tailwind — tracker aktivitas harian siswa
- **GuruEOB5** (github: edwardliu7-dot/GuruEOB5) — React TSX + Vite + Tailwind + ShadCN + Express TS + Drizzle ORM — administrasi guru (absensi, nilai, prosem, soal AI, dll)

Kedua app sudah share database Neon yang sama (`gurus` + `students` tables).

---

## Tugas Prompt Ini

### 1. Clone Repository Sumber

```bash
# Coba clone dulu (kalau repos public)
git clone https://github.com/edwardliu7-dot/BLP /tmp/blp-source
git clone https://github.com/edwardliu7-dot/GuruEOB5 /tmp/eob5-source
```

Jika repos **private** dan gagal diclone, **berhenti di sini** dan minta user untuk:
1. Upload zip file BLP ke `/tmp/blp-source/`
2. Upload zip file GuruEOB5 ke `/tmp/eob5-source/`

Jika sudah tersedia (baik clone atau upload), lanjutkan ke langkah berikut.

---

### 2. Audit BLP Harian

Explore `/tmp/blp-source/` secara menyeluruh. Tulis hasil audit ke **`docs/audit-blp.md`** dengan isi:

```markdown
# Audit BLP Harian

## Struktur Folder
[daftar folder/file penting]

## Stack & Dependencies
[dari package.json — dependencies yang TIDAK ada di TOMAT saat ini]

## Backend Routes
[daftar semua endpoint dari server/routes/ atau sejenisnya]
Format: METHOD /path/endpoint — keterangan singkat

## Frontend Screens
[daftar semua halaman/screen utama]

## Database
[tabel-tabel yang HANYA dimiliki BLP (bukan gurus/students)]
[kolom-kolom tambahan di tabel gurus/students yang BLP punya]

## Auth System BLP
[bagaimana BLP melakukan login/logout/session]

## Fitur Utama
[ringkasan 5–10 poin fitur utama BLP]

## Catatan Integrasi
[hal-hal yang perlu diperhatikan saat merge]
```

---

### 3. Audit GuruEOB5

Explore `/tmp/eob5-source/` secara menyeluruh. Tulis ke **`docs/audit-eob5.md`**:

```markdown
# Audit GuruEOB5

## Struktur Folder
[daftar folder/file penting]

## Stack & Dependencies
[dependencies yang TIDAK ada di TOMAT — perhatikan Drizzle ORM, ShadCN, Gemini SDK]

## Backend Routes
[SEMUA route dari artifacts/api-server/src/routes/ atau sejenisnya]
Route list dari docs: health, auth, dashboard, roles, teachers, students, subjects,
documents, tujuan-pembelajaran, journal, attendance, grades, points,
academic-calendars, prosem, info-pekanan, modul-ajar, soal-otomatis,
student-accounts, feedback, bahan-ajar, jadwal, rekap, inbox

## Frontend Screens
[daftar semua halaman/screen per kategori fitur]

## Database
[semua tabel EOB5 dengan skema kolom utamanya]
[Drizzle schema files]

## Auth System EOB5
[bagaimana EOB5 melakukan login — apakah sudah pakai Neon DB yang sama?]

## Fitur Utama
[ringkasan fitur-fitur utama: absensi, nilai, prosem, jadwal, soal AI, dll]

## Integrasi Gemini
[bagaimana soal-otomatis menggunakan Gemini — model, prompt structure, env var name]

## Catatan Integrasi
[hal-hal yang perlu diperhatikan saat merge ke TOMAT]
```

---

### 4. Buat Direktori Struktur Baru

Buat folder-folder berikut (cukup `.gitkeep` atau file kosong agar terbuat):

```
server/blp/              ← akan berisi backend routes BLP (JS)
server/eob5/             ← akan berisi backend routes EOB5 (JS)
src/screens/blp/         ← akan berisi frontend screens BLP (JSX)
src/screens/eob5/        ← akan berisi frontend screens EOB5 (JSX)
src/components/blp/      ← akan berisi komponen UI reusable BLP
src/components/eob5/     ← akan berisi komponen UI reusable EOB5
```

---

### 5. Cek Dependency yang Dibutuhkan

Dari hasil audit, identifikasi packages yang harus ditambahkan ke TOMAT.

Buat file **`docs/dependencies-to-add.md`**:

```markdown
# Dependensi Baru yang Dibutuhkan

## Dari BLP
[nama package — alasan dibutuhkan — apakah ada alternatif sudah ada di TOMAT?]

## Dari EOB5
[nama package — alasan dibutuhkan]

## Yang TIDAK perlu diinstall
- Tailwind CSS → TOMAT pakai inline styles
- ShadCN/ui → TOMAT pakai inline styles
- Drizzle ORM → akan dikonversi ke pool.query biasa
- Auth libraries EOB5/BLP → akan pakai auth TOMAT yang sudah ada

## Packages yang perlu diinstall sekarang
[hanya yang benar-benar dibutuhkan dan belum ada]
```

Install packages yang benar-benar dibutuhkan (jangan install Tailwind/ShadCN/Drizzle).

---

### 6. Update RULES.md

Tambahkan section baru di bagian bawah RULES.md tentang struktur BLP + EOB5:

```markdown
---

## 17. Modul BLP Harian

- Backend routes: `server/blp/*.js` — prefix `/api/blp/*`
- Frontend screens: `src/screens/blp/` 
- Entry point layar: `BlpHomeScreen.jsx`
- Auth: pakai session TOMAT yang ada — tidak ada login terpisah
- Teks: semua Bahasa Indonesia
- Styling: inline styles (BUKAN Tailwind)

## 18. Modul GuruEOB5

- Backend routes: `server/eob5/*.js` — prefix `/api/eob5/*`
- Frontend screens: `src/screens/eob5/`
- Entry point layar: `Eob5DashboardScreen.jsx`
- Auth: pakai session TOMAT yang ada — tidak ada login terpisah
- Teks: semua Bahasa Indonesia
- Styling: inline styles (BUKAN Tailwind/ShadCN)
- Drizzle schema → dikonversi ke `ensureSchema()` di `server/schema.js`
```

---

## Aturan Wajib

- **Jangan ubah** file TOMAT yang sudah ada kecuali RULES.md di atas.
- **Jangan install** Tailwind, ShadCN, atau Drizzle ORM.
- **Jangan ubah** `server/schema.js` — itu akan dilakukan di prompt berikutnya.
- Simpan semua output audit ke `docs/` — ini akan dipakai oleh prompt 01–07.

---

## Kriteria Selesai

- [ ] `/tmp/blp-source/` dan `/tmp/eob5-source/` berisi kode sumber yang bisa dibaca
- [ ] `docs/audit-blp.md` lengkap (routes, screens, schema, auth)
- [ ] `docs/audit-eob5.md` lengkap (routes, screens, schema, auth, Gemini info)
- [ ] `docs/dependencies-to-add.md` ada
- [ ] Folder `server/blp/`, `server/eob5/`, `src/screens/blp/`, `src/screens/eob5/` terbuat
- [ ] RULES.md sudah ditambah section 17 & 18
- [ ] App TOMAT masih berjalan normal (tidak ada yang diubah)
