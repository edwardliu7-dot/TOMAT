# Prompt 05 — Points: Rename Tabel + Endpoint Bulk Mixed

> Bisa dieksekusi paralel dengan Prompt 03 dan 04.
> **Prasyarat:** Prompt 01 harus selesai dulu (rename `student_points` → `point_records`).

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md`. Tabel poin yang benar setelah rename adalah `point_records`. JANGAN pakai `eob5_point_records`, `eob5_student_points`, atau `eob5_poin`. Data lama ada di `student_points` — Prompt 01 sudah merenamenya ke `point_records`.

## Latar Belakang

Original (`artifacts/api-server/src/routes/points.ts`) vs workspace:

1. **Nama tabel berbeda** — Original: `point_records`; workspace sebelum Prompt 01: `student_points`. Sudah diperbaiki di schema (Prompt 01), tapi query di `points.js` harus ikut diupdate.

2. **Missing endpoint `POST /bulk-mixed`** — Original punya endpoint ini untuk input satu hari sekaligus semua siswa dengan poin berbeda-beda per siswa (mirip `attendance/bulk-mixed`).

3. **Kolom nama tabel di query** — Semua `FROM student_points` dan `JOIN student_points` harus diubah ke `point_records`.

## Yang Harus Dilakukan

### 1. Rename semua referensi tabel di `server/eob5/points.js`

Cari dan ganti seluruh string `student_points` → `point_records` dalam file ini.

Kolom yang ada di `point_records`:
- `id` (uuid/serial)
- `student_id` (FK ke students)
- `jenis` — 'positif' atau 'negatif'
- `poin` — angka
- `keterangan` — teks wajib
- `tanggal` — tanggal
- `created_at`

**Tidak ada** kolom `guru_id` di tabel original. Jika workspace menyimpan `guru_id`, itu kolom tambahan — biarkan saja, tidak perlu dihapus.

### 2. Tambah endpoint `POST /points/bulk-mixed`

Original: endpoint ini menerima satu tanggal + array entries, masing-masing entry punya `studentId`, `jenis`, `poin`, `keterangan`. Siswa yang tidak ada di array berarti tidak diisi (berbeda dari attendance yang wajib semua).

```js
// POST /bulk-mixed — input poin berbeda per siswa untuk satu hari
// Semua query ke tabel: point_records  (BUKAN eob5_point_records atau student_points)
router.post('/bulk-mixed', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, entries } = req.body || {}

    if (!tanggal || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'tanggal dan entries[] wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    // filter hanya siswa yang boleh diakses guru ini
    const targets = entries.filter(e =>
      e.student_id && e.jenis && e.poin !== undefined && allowed.has(e.student_id)
    )

    if (targets.length === 0) {
      return res.json({ count: 0 })
    }

    const inserted = []
    for (const e of targets) {
      const { rows } = await pool.query(
        `INSERT INTO point_records (student_id, guru_id, jenis, poin, keterangan, tanggal)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [e.student_id, guruId, e.jenis, e.poin, e.keterangan || '', tanggal]
      )
      inserted.push(rows[0])
    }

    res.json({ count: inserted.length, records: inserted })
  } catch (err) {
    console.error('[eob5/points] bulk-mixed error:', err)
    res.status(500).json({ error: 'Gagal menyimpan poin massal' })
  }
})
```

### 3. Tambah endpoint `POST /points/bulk` (jika belum ada)

Mirip bulk-mixed tapi satu jenis+poin+keterangan untuk banyak siswa sekaligus:

```js
// Semua query ke tabel: point_records  (BUKAN eob5_point_records atau student_points)
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, student_ids, jenis, poin, keterangan } = req.body || {}

    if (!tanggal || !Array.isArray(student_ids) || !student_ids.length || !jenis || poin === undefined) {
      return res.status(400).json({ error: 'tanggal, student_ids[], jenis, dan poin wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    const targets = student_ids.filter(id => allowed.has(id))

    if (targets.length === 0) {
      return res.status(400).json({ error: 'Tidak ada siswa valid yang dipilih' })
    }

    const inserted = []
    for (const studentId of targets) {
      const { rows } = await pool.query(
        `INSERT INTO point_records (student_id, guru_id, jenis, poin, keterangan, tanggal)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [studentId, guruId, jenis, poin, keterangan || '', tanggal]
      )
      inserted.push(rows[0])
    }

    res.json({ count: inserted.length })
  } catch (err) {
    console.error('[eob5/points] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan poin massal' })
  }
})
```

### 4. Pastikan route terdaftar di server index

Cek `server/index.js` atau `server/eob5/index.js` — pastikan `points` router sudah ter-mount dan ada di path yang benar (`/api/eob5/points`).

### 5. Frontend — `src/screens/eob5/Eob5PoinScreen.jsx`

Tambahkan UI untuk input poin massal per hari:
- Pilih tanggal
- Tampilkan daftar siswa dari kelas tertentu
- Tiap baris punya input jenis (positif/negatif) + poin + keterangan
- Tombol "Simpan Semua" → call `POST /api/eob5/points/bulk-mixed`
- Siswa yang kolom poin-nya kosong → skip (tidak dikirim)

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Catatan |
|---|---|---|
| Poin siswa | `point_records` | Hasil rename dari `student_points`; BUKAN `eob5_point_records` |
| Data siswa | `students` | BUKAN `eob5_students` |

## Verifikasi

1. `POST /api/eob5/points/bulk-mixed` dengan 3 siswa, poin berbeda → semua tersimpan
2. GET /points → tampil record dari tabel `point_records`
3. Cek DB: `SELECT * FROM point_records LIMIT 5` → data ada

## File yang Disentuh
- `server/eob5/points.js`
- `src/screens/eob5/Eob5PoinScreen.jsx`
