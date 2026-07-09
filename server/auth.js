import express from 'express'
import { pool } from './db.js'

const router = express.Router()

const KELAS_OPTIONS = [
  'VII Ibnu Batutah',
  'VIII Ibnu Sina', 'IX Al Khawarizmi',
]

function sanitizeUser(row, role) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role,
    kelas: role === 'siswa' ? row.kelas : row.kelas_diampu,
  }
}

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

// POST /api/auth/register  { role, username, name, password, kelas, email?, whatsapp? }
router.post('/register', async (req, res) => {
  try {
    const { role, username, name, password, kelas, email, whatsapp } = req.body || {}
    if (!role || !username || !name || !password) {
      return res.status(400).json({ error: 'Username, nama, dan password wajib diisi.' })
    }
    if (role !== 'siswa' && role !== 'guru') {
      return res.status(400).json({ error: 'Role tidak valid.' })
    }
    if (role === 'siswa' && !kelas) {
      return res.status(400).json({ error: 'Kelas wajib diisi untuk siswa.' })
    }
    if (role === 'siswa' && !KELAS_OPTIONS.includes(kelas)) {
      return res.status(400).json({ error: 'Kelas tidak valid.' })
    }
    if (role === 'guru') {
      const kelasList = Array.isArray(kelas) ? kelas : [kelas].filter(Boolean)
      const cleaned = [...new Set(kelasList.map(k => typeof k === 'string' ? k.trim() : '').filter(Boolean))]
      if (cleaned.length === 0) {
        return res.status(400).json({ error: 'Pilih minimal satu kelas yang diampu.' })
      }
      if (cleaned.some(k => !KELAS_OPTIONS.includes(k))) {
        return res.status(400).json({ error: 'Kelas yang diampu tidak valid.' })
      }
      req.body.kelas = cleaned
    }
    if (role === 'siswa' && !email) {
      return res.status(400).json({ error: 'Email wajib diisi untuk siswa.' })
    }
    if (role === 'siswa' && !whatsapp) {
      return res.status(400).json({ error: 'WhatsApp wajib diisi untuk siswa.' })
    }
    const table = role === 'guru' ? 'gurus' : 'students'
    const id = username.trim().toLowerCase()

    const existing = await pool.query(`select id from ${table} where lower(username) = lower($1) or lower(id) = lower($1)`, [id])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username sudah terdaftar. Gunakan username lain.' })
    }

    let user
    if (role === 'guru') {
      const { rows } = await pool.query(
        `insert into gurus (id, username, name, password, kelas_diampu, created_at) values ($1,$1,$2,$3,$4, now()) returning *`,
        [id, name, password, req.body.kelas]
      )
      user = rows[0]
    } else {
      const { rows } = await pool.query(
        `insert into students (id, username, name, password, kelas, email, whatsapp, created_at) values ($1,$1,$2,$3,$4,$5,$6, now()) returning *`,
        [id, name, password, kelas, email || null, whatsapp || null]
      )
      user = rows[0]
    }

    req.session.user = { id: user.id, role }
    res.json({ user: sanitizeUser(user, role) })
  } catch (err) {
    console.error('register error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server saat mendaftar.' })
  }
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
