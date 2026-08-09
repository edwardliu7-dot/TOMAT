# Prompt 01 — Schema Fixes

> Eksekusi ini **pertama** sebelum prompt lainnya. Semua perbaikan logika bergantung pada schema yang benar.

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md` sebelum menulis query apapun. JANGAN pakai prefix `eob5_` pada nama tabel atau kolom.

## Latar Belakang

Perbandingan `lib/db/src/schema/*.ts` di GitHub vs `server/schema.js` di workspace menemukan 4 masalah schema:

1. **`grades.jenis` enum kurang satu nilai** — original punya 4: `formatif`, `sumatif_lm`, `sumatif_tengah`, `sumatif_akhir`; workspace hanya 3 (tidak ada `sumatif_tengah`)
2. **Unique constraint pada `grades` belum lengkap** — original punya 4 partial unique index per jenis; workspace tidak punya constraint ini sehingga duplikat nilai bisa masuk
3. **Tabel `student_points` perlu rename** — workspace memakai `student_points`, original bernama `point_records`; rename diperlukan agar query di `points.js` konsisten
4. **`attendance_records` status enum inkonsisten** — original hanya: `hadir`, `izin`, `sakit`, `alpa`; workspace masih accept `alpha` (typo lama) di validasi `STATUS_VALID` di `attendance.js`

## Yang Harus Dilakukan

### 1. Tambah `sumatif_tengah` ke `grades`

Di `server/schema.js`, cari blok `CREATE TABLE IF NOT EXISTS grades` dan ubah constraint CHECK pada kolom `jenis` dari 3 nilai menjadi 4:

```sql
-- SEBELUM (kemungkinan bentuknya):
jenis TEXT CHECK (jenis IN ('formatif','sumatif_lm','sumatif_akhir'))

-- SESUDAH:
jenis TEXT CHECK (jenis IN ('formatif','sumatif_lm','sumatif_tengah','sumatif_akhir'))
```

Juga tambahkan ALTER TABLE di bagian bawah `ensureSchema()` untuk tabel yang sudah ada di production:

```sql
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_jenis_check;
ALTER TABLE grades ADD CONSTRAINT grades_jenis_check
  CHECK (jenis IN ('formatif','sumatif_lm','sumatif_tengah','sumatif_akhir'));
```

### 2. Tambah Unique Constraints pada `grades`

Di `ensureSchema()`, setelah ALTER TABLE grades, tambahkan 4 partial unique index (pakai `IF NOT EXISTS`):

```sql
CREATE UNIQUE INDEX IF NOT EXISTS grades_formatif_unique
  ON grades (student_id, subject_id, calendar_id, lingkup_materi, tp_number)
  WHERE jenis = 'formatif';

CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_lm_unique
  ON grades (student_id, subject_id, calendar_id, lingkup_materi)
  WHERE jenis = 'sumatif_lm';

CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_tengah_unique
  ON grades (student_id, subject_id, calendar_id)
  WHERE jenis = 'sumatif_tengah';

CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_akhir_unique
  ON grades (student_id, subject_id, calendar_id)
  WHERE jenis = 'sumatif_akhir';
```

### 3. Rename `student_points` → `point_records`

> **Catatan penting:** Data sudah ada di tabel `student_points` (data dipindah dari `eob5_student_points`). Rename ke `point_records` mengikuti nama original GitHub. JANGAN buat tabel baru kosong — rename tabel yang sudah ada.

Tambahkan migration di `ensureSchema()`:
```sql
-- Rename hanya jika student_points ada dan point_records belum ada
ALTER TABLE IF EXISTS student_points RENAME TO point_records;
```

Lalu ubah nama tabel di `CREATE TABLE IF NOT EXISTS` menjadi `point_records`.

Setelah itu, ubah semua referensi `student_points` → `point_records` di `server/eob5/points.js`.

### 4. Perbaiki Status Enum di Attendance

Di `server/eob5/attendance.js`, baris:
```js
const STATUS_VALID = ['hadir', 'sakit', 'izin', 'alpha', 'alpa']
```
Ubah menjadi (hapus `alpha`, sisakan `alpa` saja — sesuai original):
```js
const STATUS_VALID = ['hadir', 'sakit', 'izin', 'alpa']
```

Pastikan juga di `server/schema.js`, tabel `absensi` (jika masih ada) tidak punya CHECK constraint yang memblokir status `alpa`. Tabel `attendance_records` yang baru sudah benar.

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Catatan |
|---|---|---|
| Nilai/Penilaian | `grades` | BUKAN `eob5_grades` |
| Absensi baru | `attendance_records` | BUKAN `eob5_absensi` atau `absensi` |
| Poin siswa | `point_records` (setelah rename dari `student_points`) | BUKAN `eob5_student_points` |

## Verifikasi

Setelah selesai:
1. Restart server, pastikan `ensureSchema()` tidak error di log
2. Test POST `/api/eob5/grades` dengan `jenis: 'sumatif_tengah'` — harus return 201
3. Test POST duplikat `sumatif_tengah` untuk student+subject+calendar yang sama — harus return error 409/conflict
4. Test POST `/api/eob5/attendance` dengan `status: 'alpha'` — harus return 400 (status tidak valid)
5. Test POST `/api/eob5/attendance` dengan `status: 'alpa'` — harus return 201

## File yang Disentuh
- `server/schema.js`
- `server/eob5/attendance.js`
- `server/eob5/points.js` (rename tabel)
