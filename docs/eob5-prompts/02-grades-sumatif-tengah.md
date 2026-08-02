# Prompt 02 — Grades: Tambah Sumatif Tengah

> **Prasyarat:** Prompt 01 harus selesai dulu (schema `sumatif_tengah` harus sudah ada).

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

Implementasi yang aman (menghindari race condition) menggunakan INSERT ... ON CONFLICT DO UPDATE dengan WHERE clause:
```sql
INSERT INTO grades (student_id, subject_id, calendar_id, jenis, lingkup_materi, tp_number, nilai, guru_id, keterangan)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
ON CONFLICT ON CONSTRAINT grades_sumatif_tengah_unique   -- hanya berlaku jika jenis='sumatif_tengah'
DO UPDATE SET nilai = EXCLUDED.nilai, ...
```

Karena partial index tidak bisa dipakai langsung di ON CONFLICT tanpa nama constraint, gunakan pendekatan: cari dulu, update kalau ada, insert kalau belum ada (lihat pola yang sudah ada di kode untuk `sumatif_akhir` sebagai referensi).

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

## Verifikasi

1. Buka NilaiScreen → harus ada tab/opsi "Sumatif Tengah"
2. Input nilai sumatif tengah untuk satu siswa → harus tersimpan
3. Input nilai sumatif tengah yang sama dua kali → harus di-update (tidak duplikat)
4. Rekap/daftar nilai harus menampilkan `sumatif_tengah`

## File yang Disentuh
- `server/eob5/grades.js`
- `src/screens/eob5/Eob5NilaiScreen.jsx`
