# Prompt 03 — GuruEOB5: Backend Routes Bagian 1
## (Auth Bridge, Dashboard, Guru, Siswa, Absensi)

## Prasyarat
- Prompt 00 selesai: `docs/audit-eob5.md` ada, folder `server/eob5/` sudah dibuat.
- Prompt 01 & 02 selesai (atau minimal Prompt 00).
- Kode sumber EOB5 tersedia di `/tmp/eob5-source/`.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang menambahkan backend GuruEOB5 ke dalam server TOMAT, khusus **Bagian 1**: route yang menangani autentikasi bridge, dashboard, manajemen guru, manajemen siswa, dan absensi.

---

## Konteks Teknis TOMAT Server

```
server/
├── index.js       ← mount semua router di sini
├── db.js          ← export { pool } — SELALU import dari sini
├── schema.js      ← ensureSchema() — tambah tabel baru di sini
├── auth.js        ← /api/auth/* — JANGAN diganti
└── eob5/          ← (sebagian kosong) ← kamu isi di sini
```

Session user: `req.session.user = { id, role: 'guru'|'siswa', name, email, kelas }`

Middleware auth (definisikan di tiap router atau buat `server/eob5/middleware.js`):
```js
export function requireGuru(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'guru')
    return res.status(403).json({ error: 'Akses hanya untuk guru' })
  next()
}
export function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Belum login' })
  next()
}
```

---

## Cara Kerja

1. Baca `docs/audit-eob5.md` terlebih dahulu.
2. Baca kode sumber di `/tmp/eob5-source/` untuk memahami logika tiap endpoint.
3. Port route yang tercantum di bagian ini ke `server/eob5/` sebagai JavaScript biasa.
4. Tambahkan tabel baru di `server/schema.js` → `ensureSchema()`.
5. Mount router baru di `server/index.js`.

---

## Aturan Konversi TypeScript → JavaScript

```typescript
// SEBELUM
import { Router, Request, Response } from 'express'
import { db } from '../db'
import { teachers, eq } from '../schema'

const router: Router = Router()
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  const result = await db.select().from(teachers).where(eq(teachers.schoolId, 1))
  res.json(result)
})
```

```javascript
// SESUDAH
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()
router.get('/list', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM eob5_teachers WHERE school_id = $1', [1])
  res.json(rows)
})
export default router
```

Aturan:
- Hapus semua type annotations dan generics
- Drizzle queries → `pool.query('SQL', [params])`
- Semua local imports tambahkan `.js`
- `import.meta.env.*` → `process.env.*`
- Export default router di akhir setiap file

---

## File yang Dibuat di `server/eob5/`

### `server/eob5/middleware.js`
Middleware `requireAuth` dan `requireGuru` (template di atas). Di-import oleh semua router EOB5.

### `server/eob5/health.js`
Route: `GET /api/eob5/health`  
Respons: `{ ok: true, service: 'eob5', timestamp: new Date().toISOString() }`  
Tidak butuh auth.

### `server/eob5/dashboard.js`
Route: `GET /api/eob5/dashboard`  
Isi: statistik ringkasan untuk guru yang login — jumlah siswa, absensi hari ini, tugas pending, dll.  
Port dari `/tmp/eob5-source/` bagian dashboard.

### `server/eob5/guru.js`
Routes dari group `teachers` / `roles`:
- `GET /api/eob5/guru/list` — daftar semua guru
- `GET /api/eob5/guru/:id` — detail guru
- `POST /api/eob5/guru` — tambah guru (admin only)
- `PUT /api/eob5/guru/:id` — update guru
- `DELETE /api/eob5/guru/:id` — hapus guru (admin only)

### `server/eob5/siswa-akun.js`
Routes dari group `students` / `student-accounts`:
- `GET /api/eob5/siswa/list` — daftar siswa (bisa filter by kelas)
- `GET /api/eob5/siswa/:id` — detail siswa
- `PUT /api/eob5/siswa/:id` — update data siswa
- `GET /api/eob5/siswa/:id/rekap` — rekap lengkap satu siswa

> **Penting:** Tabel `students` sudah ada di TOMAT — **JANGAN buat tabel baru** untuk data siswa dasar. Gunakan tabel `students` yang sudah ada. Hanya tambahkan tabel untuk data yang **belum ada** di TOMAT.

### `server/eob5/absensi.js`
Routes dari group `attendance`:
- `GET /api/eob5/absensi` — daftar absensi (filter: kelas, tanggal, bulan)
- `POST /api/eob5/absensi` — input/update absensi
- `GET /api/eob5/absensi/rekap` — rekap absensi per siswa/kelas
- `GET /api/eob5/absensi/hari-ini` — absensi hari ini

### `server/eob5/kelas.js`
Routes dari group `subjects` / `roles` yang berkaitan dengan kelas:
- `GET /api/eob5/kelas/list` — daftar semua kelas
- `GET /api/eob5/kelas/:id/siswa` — siswa di kelas tertentu
- `GET /api/eob5/kelas/:id/guru` — guru yang mengajar kelas ini

---

## Tabel Baru di `server/schema.js`

Tambahkan di bagian akhir `ensureSchema()`, setelah semua tabel TOMAT yang sudah ada:

```javascript
// ── GuruEOB5 Tables (Bagian 1) ───────────────────────────────────────────────

// Catatan: tabel gurus, students sudah ada — JANGAN buat ulang

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_absensi (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    guru_id INTEGER REFERENCES gurus(id),
    tanggal DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'hadir',
    -- status: hadir | sakit | izin | alpha
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS eob5_kelas_guru (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER REFERENCES gurus(id),
    kelas VARCHAR(50) NOT NULL,
    mata_pelajaran VARCHAR(100),
    tahun_ajaran VARCHAR(20),
    UNIQUE(guru_id, kelas, mata_pelajaran)
  )
`)

-- Tambahkan tabel lain yang ditemukan dari audit-eob5.md
-- Prefix SEMUA tabel EOB5 baru dengan eob5_
```

**Aturan tabel:**
- Prefix semua tabel baru dengan `eob5_`
- Selalu gunakan `CREATE TABLE IF NOT EXISTS`
- Kolom baru: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
- **Jangan** drop atau rename kolom yang sudah ada

---

## Mount di `server/index.js`

```javascript
// Tambahkan di bagian imports:
import eob5HealthRouter from './eob5/health.js'
import eob5DashboardRouter from './eob5/dashboard.js'
import eob5GuruRouter from './eob5/guru.js'
import eob5SiswaAkunRouter from './eob5/siswa-akun.js'
import eob5AbsensiRouter from './eob5/absensi.js'
import eob5KelasRouter from './eob5/kelas.js'

// Tambahkan di bagian mount:
app.use('/api/eob5', eob5HealthRouter)
app.use('/api/eob5/dashboard', eob5DashboardRouter)
app.use('/api/eob5/guru', eob5GuruRouter)
app.use('/api/eob5/siswa', eob5SiswaAkunRouter)
app.use('/api/eob5/absensi', eob5AbsensiRouter)
app.use('/api/eob5/kelas', eob5KelasRouter)
```

---

## Aturan Wajib

- **Jangan ubah** router TOMAT yang sudah ada (auth.js, guru.js, siswa.js, dll).
- **Jangan buat** endpoint duplikat dengan yang sudah ada di TOMAT.
- **Prefix semua tabel baru** dengan `eob5_`.
- **Tabel `gurus` dan `students`** sudah ada — gunakan langsung, jangan buat ulang.
- Semua error response: `{ error: 'pesan dalam bahasa indonesia' }`.
- Tidak ada TypeScript (`.ts`) di files baru.

---

## Kriteria Selesai

- [ ] `server/eob5/middleware.js` ada
- [ ] `server/eob5/health.js` ada dan `GET /api/eob5/health` return `{ ok: true }`
- [ ] `server/eob5/dashboard.js` ada dengan endpoint dashboard
- [ ] `server/eob5/guru.js` ada dengan CRUD guru
- [ ] `server/eob5/siswa-akun.js` ada dengan endpoint siswa
- [ ] `server/eob5/absensi.js` ada dengan CRUD absensi
- [ ] `server/eob5/kelas.js` ada
- [ ] Tabel `eob5_absensi` dan tabel lain terdaftar di `ensureSchema()`
- [ ] Semua router terdaftar di `server/index.js`
- [ ] Server start tanpa error (`npm run dev`)
- [ ] `curl http://localhost:5000/api/eob5/health` return 200
