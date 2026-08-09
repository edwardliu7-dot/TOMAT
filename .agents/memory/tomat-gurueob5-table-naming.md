---
name: GuruEOB5 table naming convention
description: Tabel modul GURU tidak boleh pakai prefix eob5_; gunakan nama tabel lama atau nama tanpa prefix
---

## Aturan

Tabel modul GuruEOB5 **tidak menggunakan prefix `eob5_`**. Prefix ini menyebabkan data hilang karena data lama ada di tabel tanpa prefix dari standalone GuruEOB5 app.

**Why:** Standalone GuruEOB5 app sudah punya data di tabel tanpa prefix. Menambah prefix `eob5_` membuat tabel baru yang kosong, sehingga GURU module membaca data kosong.

**How to apply:** Saat menambah tabel baru untuk GURU module, JANGAN pakai prefix. Gunakan nama deskriptif tanpa prefix modul.

## Mapping nama tabel (eob5_ lama → nama yang benar)

| Nama Lama (salah) | Nama Benar | Catatan |
|---|---|---|
| `eob5_grades` | `grades` | tabel lama, ada data (174+ rows) |
| `eob5_journal_entries` | `journal_entries` | tabel lama, ada data (85+ rows) |
| `eob5_subjects` | `subjects` | tabel lama, kolom: `teacher_id` bukan `guru_id` |
| `eob5_tujuan_pembelajaran` | `tujuan_pembelajaran` | tabel lama, kolom: `teacher_id` bukan `guru_id`, `description` bukan `deskripsi` |
| `eob5_academic_calendars` | `academic_calendars` | tabel lama, kolom: `created_by` bukan `guru_id` |
| `eob5_academic_weeks` | `academic_weeks` | tabel lama |
| `eob5_prosem` | `prosem` | tabel lama, kolom: `teacher_id` bukan `guru_id` |
| `eob5_prosem_items` | `prosem_items` | tabel lama + ALTER TABLE adds subject_id/kelas/urutan |
| `eob5_documents` | `documents` | tabel lama |
| `eob5_modul_ajar` | `ai_modul_ajar` | tabel lama |
| `eob5_soal_tersimpan` | `ai_soal_otomatis` | tabel lama |
| `eob5_bahan_ajar` | `bahan_ajar` | tabel lama |
| `eob5_app_feedback` | `feedback` | tabel lama, kolom: `teacher_id`, `teacher_name` |
| `eob5_student_accounts` | `student_accounts` | tabel lama, kolom: `username` bukan `eob5_username` |
| `eob5_absensi` | `absensi` | RENAME dilakukan di DB (500 rows dipindah) |
| `eob5_student_points` | `student_points` | RENAME dilakukan di DB (288 rows dipindah) |
| `eob5_kelas_guru` | `kelas_guru` | tabel baru (kosong) |
| `eob5_nilai` | `nilai_guru` | tabel baru — jangan gunakan `nilai` karena conflict dengan TOMAT |
| `eob5_poin` | `poin` | tabel baru |
| `eob5_nilai_akademik` | `nilai_akademik` | tabel baru |
| `eob5_materi` | `materi` | tabel baru |
| `eob5_jadwal` | `jadwal` | tabel baru |
| `eob5_kalender_akademik` | `kalender_akademik` | tabel baru |
| `eob5_info_pekanan` | `info_pekanan` | tabel baru |
| `eob5_inbox` | `inbox` | tabel baru |
| `eob5_feedback` | `feedback_siswa` | tabel baru — jangan gunakan `feedback` karena conflict |

## Kolom berbeda di tabel lama

Tabel lama dari standalone GuruEOB5 menggunakan `teacher_id` bukan `guru_id`:
- `subjects.teacher_id` — semua query harus pakai `teacher_id` (atau alias `teacher_id AS guru_id`)
- `journal_entries.teacher_id` — semua query harus pakai `teacher_id`
- `tujuan_pembelajaran.teacher_id` + `description` (bukan `deskripsi`)
- `prosem.teacher_id`
- `academic_calendars.created_by` (bukan `guru_id`)

File yang sudah aware: `subjects.js`, `journal.js`, `grades.js`, `prosem.js`, `academic-calendars.js`
