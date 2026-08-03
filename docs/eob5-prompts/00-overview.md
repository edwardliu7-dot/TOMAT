# Audit EOB5 vs GitHub — Ringkasan & Urutan Eksekusi

Sumber referensi: https://github.com/edwardliu7-dot/gurueob5  
Tabel skema original: `lib/db/src/schema/*.ts`  
Route original: `artifacts/api-server/src/routes/*.ts`

## Perbedaan yang Ditemukan

| # | Area | Severity | Prompt |
|---|------|----------|--------|
| 1 | Schema: `sumatif_tengah` missing, `attendance_records` vs `absensi`, `point_records` vs `student_points` | 🔴 Kritis | 01 |
| 2 | Grades — jenis enum hanya 3, unique constraint missing, frontend tidak tampilkan sumatif tengah | 🔴 Kritis | 02 |
| 3 | Attendance — rekap masih pakai tabel `absensi` lama, status 'alpha' vs 'alpa' inkonsisten | 🟠 Tinggi | 03 |
| 4 | Tujuan Pembelajaran — bulk import tidak punya `shiftTpNumbers` logic, AI file extraction missing | 🟠 Tinggi | 04 |
| 5 | Points — tabel masih `student_points` (original: `point_records`), missing `bulk-mixed` endpoint | 🟠 Tinggi | 05 |
| 6 | Student Accounts — endpoint path berbeda, username generation berbeda, PDF card export missing | 🟡 Sedang | 06 |
| 7 | AI Features — soal param names tidak cocok, modul ajar storage limit missing, DOCX export belum lengkap | 🟡 Sedang | 07 |
| 8 | Prosem — original punya AI extraction dari file + linkage ke `subjects` dan `academic_calendars` | 🟡 Sedang | 08 |
| 9 | Frontend screens — NilaiScreen, TP screen, PoinScreen, AkunSiswaScreen belum sesuai asli | 🟡 Sedang | 09 |

---

## ⚠️ ATURAN WAJIB: TIDAK BOLEH Ada Prefix `eob5_`

**JANGAN PERNAH** menambahkan prefix `eob5_` pada nama tabel, nama kolom, maupun variabel apapun.

Menggunakan prefix `eob5_` menyebabkan query membaca/menulis ke tabel kosong baru, bukan ke tabel lama yang sudah berisi data → **data hilang di production**.

Jika GitHub original memakai prefix `eob5_`, **abaikan** — workspace ini tidak pakai prefix.

---

## 📋 Pemetaan Nama Tabel yang Benar (WAJIB DIIKUTI)

| Nama Salah (jangan pakai) | Nama Benar (pakai ini) | Catatan |
|---|---|---|
| `eob5_grades` | `grades` | Ada data 174+ rows |
| `eob5_journal_entries` | `journal_entries` | Ada data 85+ rows |
| `eob5_subjects` | `subjects` | Kolom: `teacher_id` (BUKAN `guru_id`) |
| `eob5_tujuan_pembelajaran` | `tujuan_pembelajaran` | Kolom: `teacher_id`, `description` (BUKAN `deskripsi`) |
| `eob5_academic_calendars` | `academic_calendars` | Kolom: `created_by` (BUKAN `guru_id`) |
| `eob5_academic_weeks` | `academic_weeks` | — |
| `eob5_prosem` | `prosem` | Kolom: `teacher_id` (BUKAN `guru_id`) |
| `eob5_prosem_items` | `prosem_items` | — |
| `eob5_documents` | `documents` | — |
| `eob5_modul_ajar` | `ai_modul_ajar` | — |
| `eob5_soal_tersimpan` | `ai_soal_otomatis` | — |
| `eob5_bahan_ajar` | `bahan_ajar` | — |
| `eob5_app_feedback` | `feedback` | Kolom: `teacher_id`, `teacher_name` |
| `eob5_student_accounts` | `student_accounts` | Kolom: `username` (BUKAN `eob5_username`) |
| `eob5_absensi` | `absensi` | Data sudah ada di sini |
| `eob5_student_points` | `student_points` | Data sudah ada di sini |
| `eob5_kelas_guru` | `kelas_guru` | — |
| `eob5_nilai` | `nilai_guru` | Jangan pakai `nilai` — konflik dengan TOMAT |
| `eob5_poin` | `poin` | — |
| `eob5_nilai_akademik` | `nilai_akademik` | — |
| `eob5_materi` | `materi` | — |
| `eob5_jadwal` | `jadwal` | — |
| `eob5_kalender_akademik` | `kalender_akademik` | — |
| `eob5_info_pekanan` | `info_pekanan` | — |
| `eob5_inbox` | `inbox` | — |
| `eob5_feedback` | `feedback_siswa` | Jangan pakai `feedback` — sudah dipakai |

---

## 📋 Kolom Berbeda di Tabel Lama (WAJIB DIIKUTI)

Tabel lama dari standalone GuruEOB5 menggunakan **`teacher_id`**, bukan `guru_id`:

| Tabel | Kolom Benar | Kolom Salah |
|---|---|---|
| `subjects` | `teacher_id` | `guru_id` |
| `journal_entries` | `teacher_id` | `guru_id` |
| `tujuan_pembelajaran` | `teacher_id` | `guru_id` |
| `tujuan_pembelajaran` | `description` | `deskripsi` |
| `prosem` | `teacher_id` | `guru_id` |
| `academic_calendars` | `created_by` | `guru_id` |
| `student_accounts` | `username` | `eob5_username` |
| `student_accounts` | `password` | `password_plain` |

**Selalu gunakan kolom di kolom "Benar".** Jangan ikuti nama dari GitHub jika berbeda.

---

## Catatan Adaptasi (Sengaja Berbeda dari GitHub Original)

- **Prefix tabel/kolom**: GitHub original pakai `eob5_` prefix pada beberapa nama — workspace TIDAK pakai prefix. Jangan ikuti konvensi prefix dari GitHub.
- **Scoping absensi/nilai/poin**: Asli pakai `school` field; workspace pakai `kelas_diampu` dari tabel `gurus`. Ini OK — harus tetap pakai `kelas_diampu` karena TOMAT tidak punya konsep `school` yang sama.
- **Auth middleware**: Asli pakai `requireAuth` + `getCurrentGuru`; workspace pakai `requireGuru` + `req.session.user`. Jangan ubah ini.
- **TypeScript → JavaScript**: Asli TS + Drizzle ORM; workspace JS + `pool.query`. Jangan konversi balik.
- **UUID vs integer ID**: Workspace memakai campuran (integer legacy + UUID baru). Jangan break existing data.

---

## Urutan Eksekusi yang Disarankan

1. Prompt 01 — schema dulu (semua prompt lain tergantung ini)
2. Prompt 02 + 03 — bisa paralel (grades + attendance independen)
3. Prompt 04 + 05 — bisa paralel (TP + points independen)
4. Prompt 06 + 07 — bisa paralel (akun siswa + AI independen)
5. Prompt 08 (prosem)
6. Prompt 09 (frontend) — paling akhir, setelah backend beres
