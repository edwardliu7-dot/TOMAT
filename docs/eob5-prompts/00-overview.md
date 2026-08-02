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

## Catatan Adaptasi (Sengaja Berbeda)

Beberapa perbedaan adalah adaptasi yang DISENGAJA karena TOMAT memakai model auth berbeda:

- **Scoping absensi/nilai/poin**: Asli pakai `school` field; workspace pakai `kelas_diampu` dari tabel `gurus`. Ini OK — harus tetap pakai `kelas_diampu` karena TOMAT tidak punya konsep `school` yang sama.
- **Auth middleware**: Asli pakai `requireAuth` + `getCurrentGuru`; workspace pakai `requireGuru` + `req.session.user`. Jangan ubah ini.
- **TypeScript → JavaScript**: Asli TS + Drizzle ORM; workspace JS + `pool.query`. Jangan konversi balik.
- **UUID vs integer ID**: Workspace memakai campuran (integer legacy + UUID baru). Jangan break existing data.

## Urutan Eksekusi yang Disarankan

1. Prompt 01 — schema dulu (semua prompt lain tergantung ini)
2. Prompt 02 + 03 — bisa paralel (grades + attendance independen)
3. Prompt 04 + 05 — bisa paralel (TP + points independen)
4. Prompt 06 + 07 — bisa paralel (akun siswa + AI independen)
5. Prompt 08 (prosem)
6. Prompt 09 (frontend) — paling akhir, setelah backend beres
