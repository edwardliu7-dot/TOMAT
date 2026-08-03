# Prompt 02 — Grades: Tambah Sumatif Tengah

> **Prasyarat:** Prompt 01 harus selesai dulu (schema `sumatif_tengah` harus sudah ada).

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md`. Tabel yang dipakai di sini adalah `grades` (BUKAN `eob5_grades`). Kolom guru: tidak ada `guru_id` di `grades` — kolom yang benar bergantung pada skema workspace (cek `server/schema.js`).

## Latar Belakang

Original (`artifacts/api-server/src/routes/grades.ts`) mendukung 4 jenis penilaian Kurikulum Merdeka:

| Jenis | Kolom unik | Keterangan |
|-------|-----------|-----------|
| `formatif` | student + subject + calendar + lingkup_materi + tp_number | Per Tujuan Pembelajaran |
| `sumatif_lm` | student + subject + calendar + lingkup_materi | Per Lingkup Materi |
| `sumatif_tengah` | student + subject + calendar | Ujian Tengah Semester |
| `sumatif_akhir` | student + subject + calendar | Ujian Akhir Semester |

Workspace saat ini hanya punya 3 jenis (tidak ada `sumatif_tengah`), sehingga guru tidak bisa input nilai ujian tengah semester.

## Yang Harus Dilakukan

### 1. Backend — `server/eob5/grades.js`

#### POST / — input nilai
Validasi `jenis` saat ini mungkin tidak mencakup `sumatif_tengah`. Pastikan di blok validasi:

```js
const JENIS_VALID = ['formatif', 'sumatif_lm', 'sumatif_tengah', 'sumatif_akhir']
if (!JENIS_VALID.includes(jenis)) {
  return res.status(400).json({ error: `Jenis tidak valid: ${jenis}` })
}
```

#### POST / — ON CONFLICT upsert
Original menggunakan INSERT ... ON CONFLICT DO UPDATE per jenis. Tambahkan logika upsert untuk `sumatif_tengah`:

Untuk `sumatif_tengah`, konflik terjadi bila student_id + subject_id + calendar_id sudah ada dengan jenis itu. Tambahkan upsert:

```js
// Di blok INSERT, gunakan ON CONFLICT dengan partial index (Postgres 9.5+):
// Karena partial unique index berbeda per jenis, upsert yang paling praktis adalah:
// 1. Cek apakah sudah ada record dengan jenis + student + subject + calendar
// 2. Kalau ada → UPDATE, kalau tidak → INSERT
```

Implementasi yang aman (menghindari race condition) — lihat pola yang sudah ada di kode untuk `sumatif_akhir` sebagai referensi, tambahkan case serupa untuk `sumatif_tengah`:

```sql
-- Untuk sumatif_tengah: cari dulu, update kalau ada, insert kalau belum ada
-- Semua query ke tabel: grades  (BUKAN eob5_grades)
SELECT id FROM grades
WHERE student_id = $1 AND subject_id = $2 AND calendar_id = $3 AND jenis = 'sumatif_tengah'
```

### 2. Frontend — `src/screens/eob5/Eob5NilaiScreen.jsx`

Buka file ini dan cari bagian yang merender tab/pilihan jenis penilaian. Tambahkan `sumatif_tengah` sebagai opsi:

```jsx
// Cari array atau switch seperti ini:
const JENIS_OPTIONS = [
  { value: 'formatif', label: 'Formatif' },
  { value: 'sumatif_lm', label: 'Sumatif LM' },
  { value: 'sumatif_akhir', label: 'Sumatif Akhir' },
]

// Ubah menjadi:
const JENIS_OPTIONS = [
  { value: 'formatif', label: 'Formatif' },
  { value: 'sumatif_lm', label: 'Sumatif LM' },
  { value: 'sumatif_tengah', label: 'Sumatif Tengah' },
  { value: 'sumatif_akhir', label: 'Sumatif Akhir' },
]
```

Sesuaikan form input — untuk `sumatif_tengah`:
- Tidak perlu kolom `lingkup_materi` (sama seperti `sumatif_akhir`)
- Tidak perlu kolom `tp_number`
- Hanya perlu `nilai` (angka), `student_id`, `subject_id`, `calendar_id`

### 3. Frontend — Filter/Tab di NilaiScreen

Pastikan tab/filter "Sumatif Tengah" juga muncul di rekap/tampilan nilai. Kalau ada switch-case per jenis yang menentukan kolom apa yang ditampilkan, tambahkan case untuk `sumatif_tengah`.

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Catatan |
|---|---|---|
| Nilai/Penilaian | `grades` | BUKAN `eob5_grades` |
| Mata Pelajaran | `subjects` | BUKAN `eob5_subjects`; kolom guru: `teacher_id` |
| Kalender Akademik | `academic_calendars` | BUKAN `eob5_academic_calendars`; kolom guru: `created_by` |

## Verifikasi

1. Buka NilaiScreen → harus ada tab/opsi "Sumatif Tengah"
2. Input nilai sumatif tengah untuk satu siswa → harus tersimpan
3. Input nilai sumatif tengah yang sama dua kali → harus di-update (tidak duplikat)
4. Rekap/daftar nilai harus menampilkan `sumatif_tengah`

## File yang Disentuh
- `server/eob5/grades.js`
- `src/screens/eob5/Eob5NilaiScreen.jsx`
