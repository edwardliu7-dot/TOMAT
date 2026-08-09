---
name: GuruEOB5 no-migration rule
description: Tabel baru SMARTISA yang menduplikat data lama sudah di-DROP; semua file eob5 diarahkan ke tabel lama.
last_updated: 2026-08-03
---

## Aturan Keras
JANGAN copy/migrasi data ke tabel baru; baca langsung dari tabel asli app lama.

**Why:** App lama GuruEOB5 masih aktif sebagai aplikasi utama. Duplikat tabel menyebabkan dua sumber kebenaran dan risiko kehilangan data saat user menginput via app lama.

## Tabel yang Sudah Di-DROP (jangan buat ulang)
| Tabel dihapus | Ganti dengan |
|---|---|
| `attendance_records` | `absensi` (kolom: student_id text, guru_id text NOT NULL, tanggal, status, keterangan) |
| `kelas_guru` | `gurus.kelas_diampu` (array) |
| `nilai_guru` | `grades` JOIN `subjects` untuk nama mapel |
| `poin` | `point_records` (dahulu student_points) |
| `nilai_akademik` | `grades` JOIN `subjects` |
| `materi` | `bahan_ajar` (created_by, link_url) |
| `jadwal` | `schedules` (teacher_id, subject_id UUID) |
| `kalender_akademik` | `academic_calendars` (created_by, nama, tahun_ajaran) |
| `info_pekanan` | dihitung dari prosem_items + journal_entries + schedules |
| `feedback_siswa` | (tidak ada padanan, fitur belum diimplementasikan) |
| `inbox` | (tidak ada padanan, fitur belum diimplementasikan) |

## Status Migrasi Data
- `attendance_records` punya 550 rows dengan UUID student_id dari DB lama yang tidak cocok dengan students.id di SMARTISA → DROP langsung tanpa migrasi (data orphaned).
- `absensi` (500 rows, student_id text) adalah sumber kebenaran yang benar.

## Catatan Teknis
- `schedules.subject_id` adalah UUID; query `grades.subject_id` perlu `::uuid` cast jika filter dari string.
- `absensi.status`: normalisasi 'alpa' → 'alpha' (ejaan lama app GuruEOB5).
- `grades.guru_id` adalah text, `grades.subject_id` adalah UUID.
