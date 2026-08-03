# Prompt 03 — Attendance: Perbaikan Rekap & Tracking Pengisi

> Bisa dieksekusi paralel dengan Prompt 02.

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md`. Tabel absensi lama adalah `absensi` (BUKAN `eob5_absensi`). Tabel absensi baru adalah `attendance_records` (BUKAN `eob5_attendance_records`). JANGAN membuat tabel baru dengan prefix `eob5_`.

## Latar Belakang

Original (`artifacts/api-server/src/routes/attendance.ts`) punya 3 perbedaan penting vs workspace:

1. **Rekap masih pakai tabel `absensi` lama** — `attendance.js` di workspace sudah tulis ke `attendance_records`, tapi `GET /rekap` di file yang sama masih JOIN ke tabel `absensi`. Akibatnya rekap kosong meskipun data sudah diinput.

2. **`filled_by_teacher_id` + `filled_by_teacher_name` tidak diisi saat bulk** — endpoint `POST /bulk` dan `POST /bulk-mixed` tidak menyimpan nama guru yang mengisi absensi. Original menyimpan ini untuk audit trail.

3. **Status `alpha` masih diterima** — sudah ditangani di Prompt 01, tapi verifikasi di semua endpoint (bulk dan bulk-mixed juga).

## Yang Harus Dilakukan

### 1. Perbaiki GET /rekap di `server/eob5/attendance.js`

Cari route `GET /rekap`. Saat ini kemungkinan query JOIN ke tabel `absensi`:
```sql
FROM students s LEFT JOIN absensi a ON a.student_id = s.id
```

Ubah ke `attendance_records`:
```sql
FROM students s LEFT JOIN attendance_records a ON a.student_id = s.id
```

> **Ingat:** Tabel yang benar adalah `attendance_records`, BUKAN `eob5_attendance_records`.

Sesuaikan juga nama kolom — `attendance_records` tidak punya kolom `guru_id`, melainkan `filled_by_teacher_id`. Filter rekap harus disesuaikan.

Perhatikan: rekap perlu tetap bisa difilter oleh guru berdasarkan `kelas_diampu` (karena kita tidak pakai model `school`). Logika benar:

```sql
SELECT s.id, s.name, s.kelas,
       COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
       COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
       COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
       COUNT(*) FILTER (WHERE a.status = 'alpa')  AS alpa,
       COUNT(a.id) AS total_tercatat
FROM students s
LEFT JOIN attendance_records a ON a.student_id = s.id
WHERE s.kelas = ANY($1::text[])   -- filter dari kelas_diampu guru
  AND (tanggal filter jika ada)
GROUP BY s.id, s.name, s.kelas
ORDER BY s.kelas, s.name
```

### 2. Tambah `filled_by_teacher_id` + `filled_by_teacher_name` di bulk endpoints

Di `POST /bulk` dan `POST /bulk-mixed`, ambil nama guru dari session/DB dan sertakan saat INSERT:

```js
// Ambil nama guru dari tabel gurus (BUKAN eob5_gurus — pakai gurus)
const { rows: guruRows } = await pool.query('SELECT name FROM gurus WHERE id = $1', [guruId])
const guruName = guruRows[0]?.name || ''

// Sertakan di INSERT ke attendance_records (BUKAN eob5_attendance_records)
INSERT INTO attendance_records (student_id, tanggal, status, filled_by_teacher_id, filled_by_teacher_name)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (student_id, tanggal) DO UPDATE SET
  status = EXCLUDED.status,
  filled_by_teacher_id = EXCLUDED.filled_by_teacher_id,
  filled_by_teacher_name = EXCLUDED.filled_by_teacher_name
```

### 3. Pastikan GET / juga pakai `attendance_records`

Cek apakah GET `/` (daftar absensi) sudah pakai `attendance_records` atau masih `absensi`. Kalau masih `absensi`, pindahkan ke `attendance_records`.

Catatan adaptasi: Original filter by `school`, workspace filter by `kelas_diampu`. Pertahankan filter `kelas_diampu` — jangan ubah ke `school`.

### 4. Hapus atau alias route di `absensi.js` (opsional)

File `server/eob5/absensi.js` adalah versi lama. Pastikan di `server/index.js` (atau `server/eob5/index.js`), router `absensi` tidak menimpa router `attendance`. Kalau ada konflik, nonaktifkan `absensi.js`.

### 5. Perbaiki GET /rekap di `server/eob5/rekap.js`

File `rekap.js` punya endpoint `GET /rekap/absensi`. Ini juga kemungkinan masih JOIN ke tabel `absensi` lama. Perbaiki dengan logika sama seperti poin 1 — gunakan `attendance_records`.

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Catatan |
|---|---|---|
| Absensi lama (baca-only) | `absensi` | BUKAN `eob5_absensi` — ada data lama di sini |
| Absensi baru (tulis) | `attendance_records` | BUKAN `eob5_attendance_records` |
| Data guru | `gurus` | BUKAN `eob5_gurus` |
| Data siswa | `students` | BUKAN `eob5_students` |

## Verifikasi

1. Input absensi 5 siswa via `POST /bulk-mixed`
2. Panggil `GET /rekap?kelas=...` → harus tampil data siswa dengan count hadir/sakit/izin/alpa
3. Cek kolom `filled_by_teacher_name` di DB — harus terisi nama guru
4. Panggil `GET /` → harus tampil record dari `attendance_records`, bukan `absensi`

## File yang Disentuh
- `server/eob5/attendance.js`
- `server/eob5/rekap.js`
- (opsional) `server/eob5/absensi.js` — disable/remove jika konflik
