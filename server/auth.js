import express from 'express'
import { pool } from './db.js'

const router = express.Router()

function sanitizeUser(row, role) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role,
    kelas: role === 'siswa' ? row.kelas : row.kelas_diampu,
    photoUrl: row.photo_url || null,
    bio: row.bio || null,
  }
}

const MAX_PHOTO_BYTES = 800 * 1024 // ~800KB base64 data URL
const MAX_BIO_LENGTH = 300

// POST /api/auth/login  { role: 'siswa' | 'guru', username, password }
router.post('/login', async (req, res) => {
  try {
    const { role, username, password } = req.body || {}
    if (!role || !username || !password) {
      return res.status(400).json({ error: 'Role, username, dan password wajib diisi.' })
    }
    if (role !== 'siswa' && role !== 'guru') {
      return res.status(400).json({ error: 'Role tidak valid.' })
    }
    const table = role === 'guru' ? 'gurus' : 'students'
    const { rows } = await pool.query(
      `select * from ${table} where lower(username) = lower($1) or lower(id) = lower($1) limit 1`,
      [username]
    )
    const user = rows[0]
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Username atau password salah.' })
    }
    req.session.user = { id: user.id, role }
    res.json({ user: sanitizeUser(user, role) })
  } catch (err) {
    console.error('login error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server saat login.' })
  }
})

// Pendaftaran akun (siswa maupun guru) dilakukan lewat aplikasi BLP, bukan di sini,
// agar tidak terjadi akun ganda antara TOMAT dan BLP.
router.post('/register', (req, res) => {
  res.status(410).json({ error: 'Pendaftaran akun tidak tersedia di aplikasi ini. Daftar melalui aplikasi BLP.' })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const session = req.session.user
    if (!session) return res.status(401).json({ error: 'Belum login.' })
    const table = session.role === 'guru' ? 'gurus' : 'students'
    const { rows } = await pool.query(`select * from ${table} where id = $1 limit 1`, [session.id])
    const user = rows[0]
    if (!user) {
      req.session.destroy(() => {})
      return res.status(401).json({ error: 'Sesi tidak valid.' })
    }
    res.json({ user: sanitizeUser(user, session.role) })
  } catch (err) {
    console.error('me error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PUT /api/auth/profile  { photoUrl?, bio? }
router.put('/profile', async (req, res) => {
  try {
    const session = req.session.user
    if (!session) return res.status(401).json({ error: 'Belum login.' })

    const { photoUrl, bio } = req.body || {}

    if (photoUrl !== undefined && photoUrl !== null) {
      if (typeof photoUrl !== 'string' || !photoUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Format foto tidak valid.' })
      }
      if (photoUrl.length > MAX_PHOTO_BYTES) {
        return res.status(400).json({ error: 'Ukuran foto terlalu besar. Gunakan foto yang lebih kecil.' })
      }
    }
    if (bio !== undefined && bio !== null && bio.length > MAX_BIO_LENGTH) {
      return res.status(400).json({ error: `Bio maksimal ${MAX_BIO_LENGTH} karakter.` })
    }

    const table = session.role === 'guru' ? 'gurus' : 'students'
    const { rows } = await pool.query(
      `update ${table} set
        photo_url = coalesce($2, photo_url),
        bio = coalesce($3, bio)
       where id = $1 returning *`,
      [session.id, photoUrl === undefined ? null : photoUrl, bio === undefined ? null : bio]
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' })
    res.json({ user: sanitizeUser(user, session.role) })
  } catch (err) {
    console.error('update profile error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server saat menyimpan profil.' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

export function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Belum login.' })
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ error: 'Akses ditolak.' })
    }
    next()
  }
}

export default router
