# BLP Sync — Step 8: Server Updates

Dua perubahan di sisi server untuk menyamai GitHub asli.

---

## Perubahan 1: Purge Expired Submissions (Auto-delete)

GitHub asli menghapus konten submission (base64 audio/teks) 7 hari setelah direview guru. Ini penting agar database tidak membengkak karena data audio base64.

### Tambahkan ke `server/index.js`

```javascript
// Purge konten submission yang sudah direview lebih dari 7 hari
// Konten dihapus tapi metadata (reviewedAt, type, expired: true) tetap ada
async function purgeExpiredSubmissions() {
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()

    const rows = await pool.query(
      `SELECT student_id, record_date, submissions
       FROM daily_records
       WHERE submissions IS NOT NULL
         AND submissions != '{}'::jsonb`
    )

    let purgedCount = 0
    for (const row of rows.rows) {
      const subs = row.submissions || {}
      let changed = false

      for (const [actId, sub] of Object.entries(subs)) {
        if (
          sub.reviewedAt &&
          sub.reviewedAt < cutoff &&
          !sub.expired &&
          (sub.type === 'audio' || sub.type === 'text') &&
          sub.content
        ) {
          subs[actId] = { ...sub, content: undefined, expired: true }
          delete subs[actId].content
          changed = true
          purgedCount++
        }
      }

      if (changed) {
        await pool.query(
          'UPDATE daily_records SET submissions = $3::jsonb WHERE student_id = $1 AND record_date = $2',
          [row.student_id, row.record_date, JSON.stringify(subs)]
        )
      }
    }

    if (purgedCount > 0) {
      console.log(`[purge] Expired ${purgedCount} submission content(s)`)
    }
  } catch (err) {
    console.error('[purge] Error during submission purge:', err)
  }
}
```

### Panggil di startServer()

```javascript
async function startServer() {
  // ... existing code ...

  // Jalankan sekali saat startup, lalu setiap jam
  purgeExpiredSubmissions()
  setInterval(purgeExpiredSubmissions, 60 * 60 * 1000)
}
```

---

## Perubahan 2: Fix Dashboard Query (Hapus Filter 2 Bulan)

`server/blp/dashboard.js` saat ini membatasi `daily_records` hanya 2 bulan terakhir. GitHub asli mengambil semua records.

### Cari dan hapus filter ini di `server/blp/dashboard.js`:

```javascript
// HAPUS baris ini (atau variasi serupa):
AND record_date >= (CURRENT_DATE - INTERVAL '2 months')
```

```javascript
// Ganti dengan query tanpa filter tanggal:
pool.query(
  `SELECT student_id, record_date, completed_activities, score, submissions
   FROM daily_records
   WHERE student_id = ANY($1)`,
  [studentIds]
)
```

### Mengapa ini penting?

Tanpa filter, guru dan siswa bisa melihat semua riwayat BLP dari awal, bukan hanya 2 bulan terakhir. Fungsi rekap dan download PDF/Excel membutuhkan data historis lengkap.

> **Catatan performa:** Jika siswa punya data bertahun-tahun, query bisa lambat. Solusi yang lebih baik: tambahkan index pada `(student_id, record_date)` dan biarkan client filter berdasarkan bulan.

```sql
-- Tambahkan ke schema.js jika belum ada:
CREATE INDEX IF NOT EXISTS idx_daily_records_student_date
  ON daily_records (student_id, record_date);
```

---

## Perubahan 3: Schema Migration

Tambahkan migrasi ID aktivitas ke `server/schema.js` (lihat `01-db-migration.md` untuk SQL lengkap).

Letakkan di akhir fungsi `ensureSchema()`, setelah semua `CREATE TABLE IF NOT EXISTS`.

---

## Ringkasan Perubahan Server

| File | Perubahan |
|------|-----------|
| `server/index.js` | Tambah `purgeExpiredSubmissions()` + `setInterval` |
| `server/blp/dashboard.js` | Hapus filter `INTERVAL '2 months'` di query records guru |
| `server/schema.js` | Tambah SQL migrasi activity IDs (idempotent) |
