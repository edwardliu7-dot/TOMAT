# Prompt 01 — BLP Harian: Backend Routes

## Prasyarat
- Prompt 00 sudah selesai: `docs/audit-blp.md` sudah ada, folder `server/blp/` sudah dibuat.
- Kode sumber BLP tersedia di `/tmp/blp-source/`.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang menambahkan backend BLP Harian ke dalam server TOMAT. Tujuannya: semua API BLP berjalan di server TOMAT yang sama, di bawah prefix `/api/blp/*`, menggunakan session dan database pool yang sudah ada.

---

## Konteks Teknis TOMAT Server

```
server/
├── index.js       ← entry point, mount semua router di sini
├── db.js          ← export { pool } — SELALU import dari sini
├── schema.js      ← ensureSchema() — tambah tabel baru di sini
├── auth.js        ← /api/auth/* — login/logout/profil (JANGAN diganti)
└── blp/           ← (kosong) ← kamu isi di sini
```

Session user tersimpan di `req.session.user` dengan shape:
```js
{
  id: number,
  role: 'guru' | 'siswa',
  name: string,
  email: string,
  kelas: string,    // untuk siswa
}
```

Middleware auth yang sudah ada di TOMAT (gunakan langsung, jangan buat ulang):
```js
// Contoh pemakaian di router BLP:
function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Belum login' })
  next()
}
function requireSiswa(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'siswa') return res.status(403).json({ error: 'Akses ditolak' })
  next()
}
function requireGuru(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'guru') return res.status(403).json({ error: 'Akses ditolak' })
  next()
}
```

---

## Cara Kerja

1. Baca `docs/audit-blp.md` untuk memahami semua route dan tabel BLP.
2. Baca kode sumber di `/tmp/blp-source/` untuk memahami logika tiap endpoint.
3. Port setiap route BLP ke file-file di `server/blp/` dalam format **JavaScript biasa** (bukan TypeScript).
4. Daftarkan semua tabel baru BLP di `server/schema.js` → fungsi `ensureSchema()`.
5. Mount semua router BLP di `server/index.js`.

---

## Aturan Konversi TypeScript → JavaScript

```typescript
// SEBELUM (TypeScript)
import { Router, Request, Response } from 'express'
import { db } from '../db'
import { blpActivities } from '../schema'

const router: Router = Router()

router.get('/today', async (req: Request, res: Response) => {
  const userId: number = req.session.user.id
  const results: ActivityRow[] = await db.select().from(blpActivities)
  res.json(results)
})
```

```javascript
// SESUDAH (JavaScript — gunakan pola ini)
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.get('/today', async (req, res) => {
  const userId = req.session.user.id
  const { rows } = await pool.query(
    'SELECT * FROM blp_activities WHERE student_id = $1',
    [userId]
  )
  res.json(rows)
})

export default router
```

Aturan konversi:
- Hapus semua type annotations (`: string`, `<T>`, `interface`, `type`, dll)
- Ganti `import { db } from '../db'` + Drizzle queries → `import { pool } from '../db.js'` + raw SQL
- Ganti semua Drizzle ORM calls (`.select()`, `.insert()`, `.where()`, dll) → `pool.query('SQL', [params])`
- Ganti `import.meta.env.*` → `process.env.*`
- Tambahkan `.js` di semua local imports
- Export default router di akhir file

---

## Tabel Baru di Schema

Tabel-tabel **baru** yang hanya dimiliki BLP (bukan `gurus`/`students` yang sudah ada) harus ditambahkan ke `server/schema.js` di dalam fungsi `ensureSchema()` dengan pola:

```javascript
// Di dalam ensureSchema(), setelah tabel TOMAT yang sudah ada:

// ── BLP Harian ───────────────────────────────────────────────────────────────
await pool.query(`
  CREATE TABLE IF NOT EXISTS blp_[nama_tabel] (
    id SERIAL PRIMARY KEY,
    -- kolom-kolom dari schema BLP
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`ALTER TABLE blp_[nama_tabel] ADD COLUMN IF NOT EXISTS [kolom_baru] [tipe]`)
```

**Prefix semua tabel BLP baru dengan `blp_`** untuk menghindari konflik nama.

---

## File yang Dibuat/Diubah

### File Baru (buat di `server/blp/`)
Pecah berdasarkan domain fungsional, misalnya:
- `server/blp/aktivitas.js` — CRUD aktivitas harian siswa
- `server/blp/rekap.js` — rekap aktivitas per periode
- `server/blp/[fitur-lain].js` — sesuai audit

Setiap file harus:
1. Import `{ pool }` dari `'../db.js'`
2. Definisikan middleware auth inline (copy dari Konteks Teknis di atas)
3. Export default `router`

### File yang Diubah

**`server/schema.js`** — tambahkan tabel-tabel BLP baru di `ensureSchema()`:
```javascript
// Tambahkan di bagian akhir ensureSchema(), sebelum closing brace:

// ── BLP Harian Tables ────────────────────────────────────────────────────────
await pool.query(`CREATE TABLE IF NOT EXISTS blp_[...] (...)`)
// dst.
```

**`server/index.js`** — mount semua router BLP:
```javascript
// Tambahkan di bagian imports:
import blpAktivitasRouter from './blp/aktivitas.js'
// ... dst

// Tambahkan di bagian mount (setelah router TOMAT yang sudah ada):
app.use('/api/blp/aktivitas', blpAktivitasRouter)
// ... dst
```

---

## Penanganan Auth BLP

BLP mungkin punya endpoint login/logout sendiri. **Jangan port endpoint auth BLP.**  
Semua auth sudah ditangani oleh `/api/auth/*` TOMAT yang sudah ada.  
Jika BLP punya middleware `requireAuth` sendiri, ganti dengan versi TOMAT di atas.

---

## Aturan Wajib

- **Jangan ubah** file TOMAT yang sudah ada kecuali `server/schema.js` dan `server/index.js`.
- **Jangan buat** endpoint duplikat yang sudah ada di TOMAT (cek RULES.md §4).
- Semua tabel baru BLP diberi **prefix `blp_`**.
- Semua error response harus berformat `{ error: 'pesan' }`.
- Password user **tidak** perlu di-hash ulang — TOMAT menyimpan plaintext (warisan).

---

## Kriteria Selesai

- [ ] Semua route BLP terdaftar di `server/blp/*.js` (plain JS, bukan TS)
- [ ] Tabel baru BLP terdaftar di `server/schema.js` dengan prefix `blp_`
- [ ] Semua router BLP di-mount di `server/index.js` di bawah `/api/blp/*`
- [ ] Server TOMAT masih start tanpa error (`npm run dev`)
- [ ] Endpoint BLP bisa di-test via curl (contoh: `curl http://localhost:5000/api/blp/aktivitas`)
- [ ] Tidak ada perubahan pada frontend (src/) sama sekali
