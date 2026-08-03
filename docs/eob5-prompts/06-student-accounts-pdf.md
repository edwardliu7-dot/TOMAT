# Prompt 06 — Student Accounts: Wali Kelas Only + PDF Card Export

> Bisa dieksekusi paralel dengan Prompt 07.

> ⚠️ **WAJIB BACA**: Lihat tabel pemetaan lengkap di `00-overview.md`. Tabel yang dipakai: `student_accounts` (BUKAN `eob5_student_accounts`). Kolom yang benar: `username` (BUKAN `eob5_username`), `password` (BUKAN `password_plain`). Data siswa ada di `students` (BUKAN `eob5_students`).

## Latar Belakang

Original (`artifacts/api-server/src/routes/student-accounts.ts`) berbeda signifikan dengan workspace:

1. **Route path berbeda** — Original: `GET /walikelas/akun-siswa`, `POST /walikelas/akun-siswa/:id/generate`, `POST /walikelas/akun-siswa/generate-all`; workspace: `GET /student-accounts`, `POST /student-accounts`, dll.

2. **Otorisasi berbeda** — Original: hanya `wali_kelas` jabatan bisa akses, berdasarkan `wali_kelas_kelas` field di `gurus`; workspace: lebih longgar.

3. **PDF card export** — Original punya `GET /walikelas/akun-siswa/:id/pdf` dan `GET /walikelas/akun-siswa/pdf-all` yang generate kartu akun siswa sebagai PDF (bisa dicetak); workspace belum ada.

4. **Username generation** — Original: maksimal 7 karakter, hanya alfanumerik, berbasis nama siswa, cek uniqueness di tabel `students`; workspace: format berbeda.

## Yang Harus Dilakukan

### 1. Perbaiki otorisasi di `server/eob5/student-accounts.js`

Pastikan semua endpoint student accounts dicek jabatan wali_kelas:

```js
// Tabel guru: gurus  (BUKAN eob5_gurus)
async function getWaliKelas(guruId) {
  const { rows } = await pool.query(
    'SELECT wali_kelas_kelas, name, jabatan FROM gurus WHERE id = $1', [guruId]
  )
  if (!rows.length) return null
  const guru = rows[0]
  // jabatan bisa string atau array — normalize
  const jabatan = Array.isArray(guru.jabatan) ? guru.jabatan : (guru.jabatan || '').split(',')
  if (!jabatan.includes('wali_kelas')) return null
  if (!guru.wali_kelas_kelas) return null
  return guru
}
```

Di setiap route, panggil `getWaliKelas` dan return 403 kalau null.

### 2. Perbaiki username generation

Original algorithm (maksimal 7 karakter):
```js
function usernameBase(namaLengkap) {
  return namaLengkap
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5)  // 5 chars base
}

async function uniqueUsername(namaLengkap) {
  const base = usernameBase(namaLengkap)
  // Coba base saja dulu
  if (!await usernameTaken(base)) return base
  // Coba base + 1 digit (6 chars)
  for (let n = 2; n <= 9; n++) {
    const candidate = base + n
    if (!await usernameTaken(candidate)) return candidate
  }
  // Coba base + 2 digit (7 chars)
  for (let n = 10; n <= 99; n++) {
    const candidate = base + n
    if (!await usernameTaken(candidate)) return candidate
  }
  // Fallback random
  return base + Math.floor(Math.random() * 1000)
}

// Cek uniqueness di tabel students (BUKAN eob5_students)
// Kolom: username  (BUKAN eob5_username)
async function usernameTaken(username) {
  const { rows } = await pool.query(
    'SELECT id FROM students WHERE username = $1', [username]
  )
  return rows.length > 0
}
```

Password: 6-digit PIN numerik (mudah diketik siswa):
```js
function randomPassword() {
  return String(Math.floor(100000 + Math.random() * 900000))
}
```

### 3. Tambah PDF Card Export

Install `pdfkit` jika belum ada: `npm install pdfkit`

Buat file `server/eob5/lib/student-account-card.js`:

```js
import PDFDocument from 'pdfkit'

/**
 * Generate kartu akun siswa sebagai PDF buffer.
 * Satu kartu per halaman, format kartu fisik yang bisa dicetak.
 */
export function buildAccountCardsPdf(accounts) {
  // accounts: [{ name, kelas, username, password }]
  // username dan password diambil dari tabel student_accounts
  // kolom: username (BUKAN eob5_username), password (BUKAN password_plain)
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [283, 170], margin: 16 }) // 10cm x 6cm
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    accounts.forEach((acc, i) => {
      if (i > 0) doc.addPage()
      doc
        .fontSize(9).text('KARTU AKUN TOMAT', { align: 'center' })
        .moveDown(0.5)
        .fontSize(11).font('Helvetica-Bold').text(acc.name, { align: 'center' })
        .font('Helvetica').fontSize(9).text(`Kelas: ${acc.kelas}`, { align: 'center' })
        .moveDown(0.8)
        .fontSize(9).text('Username:')
        .fontSize(13).font('Helvetica-Bold').text(acc.username)
        .font('Helvetica').fontSize(9).moveDown(0.3)
        .text('Password:')
        .fontSize(13).font('Helvetica-Bold').text(acc.password)
        .font('Helvetica').fontSize(7).moveDown(0.8)
        .text('Simpan kartu ini dengan baik. Jangan bagikan ke orang lain.', { align: 'center' })
    })

    doc.end()
  })
}
```

Tambahkan route di `student-accounts.js`:

```js
// GET /:id/pdf — PDF kartu satu siswa
// Query ke: students (BUKAN eob5_students), student_accounts (BUKAN eob5_student_accounts)
// Kolom student_accounts: username, password  (BUKAN eob5_username, password_plain)
router.get('/:id/pdf', requireGuru, async (req, res) => {
  const guruId = req.session.user.id
  const guru = await getWaliKelas(guruId)
  if (!guru) return res.status(403).json({ error: 'Hanya wali kelas' })

  const { id } = req.params
  const account = await getStudentAccount(id)
  if (!account) return res.status(404).json({ error: 'Akun belum dibuat' })

  const { rows: students } = await pool.query(
    'SELECT name, kelas FROM students WHERE id = $1 AND kelas = $2',
    [id, guru.wali_kelas_kelas]
  )
  if (!students.length) return res.status(404).json({ error: 'Siswa tidak ditemukan' })

  const pdfBuf = await buildAccountCardsPdf([{
    name: students[0].name,
    kelas: students[0].kelas,
    username: account.username,
    password: account.password,
  }])

  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="kartu-akun.pdf"' })
  res.send(pdfBuf)
})

// GET /pdf-all — PDF semua siswa di kelas wali kelas ini
// Query ke: students, student_accounts (kolom: username, password)
router.get('/pdf-all', requireGuru, async (req, res) => {
  const guruId = req.session.user.id
  const guru = await getWaliKelas(guruId)
  if (!guru) return res.status(403).json({ error: 'Hanya wali kelas' })

  const { rows: students } = await pool.query(
    `SELECT s.id, s.name, s.kelas, sa.username, sa.password
     FROM students s
     LEFT JOIN student_accounts sa ON sa.student_id = s.id
     WHERE s.kelas = $1
     ORDER BY s.name`,
    [guru.wali_kelas_kelas]
  )

  const withAccounts = students.filter(s => s.username)
  if (!withAccounts.length) return res.status(404).json({ error: 'Belum ada akun yang dibuat' })

  const pdfBuf = await buildAccountCardsPdf(withAccounts)
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="kartu-akun-kelas.pdf"' })
  res.send(pdfBuf)
})
```

### 4. Frontend — `src/screens/eob5/Eob5AkunSiswaScreen.jsx`

- Tambahkan tombol "Download Kartu (PDF)" per siswa yang sudah punya akun
- Tambahkan tombol "Download Semua Kartu" di header
- Disable tombol untuk guru yang bukan wali kelas (cek jabatan dari session)

## Nama Tabel yang Digunakan di File Ini

| Tabel | Nama Benar | Kolom Perlu Diperhatikan |
|---|---|---|
| Akun siswa | `student_accounts` | `username` (bukan `eob5_username`), `password` (bukan `password_plain`) |
| Data siswa | `students` | BUKAN `eob5_students` |
| Data guru | `gurus` | BUKAN `eob5_gurus` |

## Verifikasi

1. Login sebagai guru non-wali-kelas → GET /akun-siswa harus return 403
2. Login sebagai wali kelas → berhasil lihat daftar siswa
3. Generate akun → username maks 7 char, password 6 digit angka
4. Download PDF satu siswa → PDF tergenerate dengan username + password

## File yang Disentuh
- `server/eob5/student-accounts.js`
- `server/eob5/lib/student-account-card.js` (baru)
- `src/screens/eob5/Eob5AkunSiswaScreen.jsx`
- `package.json` (install `pdfkit` jika belum ada)
