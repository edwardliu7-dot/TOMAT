import express from 'express'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'
import { computeHunger, getHungerUntil } from './pet-state.js'

const router = express.Router()

// Check if a guru qualifies as an active subject teacher for TOMAT:
// jabatan must include 'guru_mapel' AND they must have at least one subject entry.
// Runs a profile-sync first so guru_mapel with mapel+kelas_diampu filled get
// their subjects auto-created without needing to visit the EOB5 subjects page first.
async function computeHasMateriTerdaftar(guruId, jabatan) {
  if (!Array.isArray(jabatan) || !jabatan.includes('guru_mapel')) return false
  try {
    // Mirror syncSubjectFolders logic from server/eob5/subjects.js
    const { rows: guruRows } = await pool.query(
      'SELECT mapel, kelas_diampu FROM gurus WHERE id = $1',
      [guruId]
    )
    if (guruRows.length) {
      const { mapel = [], kelas_diampu = [] } = guruRows[0]
      if (mapel?.length && kelas_diampu?.length) {
        const { rows: existing } = await pool.query(
          'SELECT name FROM subjects WHERE teacher_id = $1',
          [guruId]
        )
        const existingNames = new Set(existing.map(s => s.name))
        for (const m of mapel) {
          for (const k of kelas_diampu) {
            const name = `${m} - ${k}`
            if (!existingNames.has(name)) {
              await pool.query(
                'INSERT INTO subjects (teacher_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [guruId, name]
              )
            }
          }
        }
      }
    }

    const { rows } = await pool.query(
      `SELECT 1 FROM subjects WHERE teacher_id = $1 AND deleted_at IS NULL LIMIT 1`,
      [guruId]
    )
    return rows.length > 0
  } catch {
    return false
  }
}

function sanitizeUser(row, role, extra = {}) {
  const base = {
    id: row.id,
    username: row.username,
    name: row.name,
    role,
    kelas: role === 'siswa' ? row.kelas : row.kelas_diampu,
    photoUrl: row.photo_url || null,
    bio: row.bio || null,
    ...extra,
  }
  if (role !== 'siswa') return base
  // Gamifikasi fields are server-authoritative and only meaningful for students —
  // included on login/me so PlayerContext can hydrate without a second round-trip.
  return {
    ...base,
    petIsDead: computeHunger(getHungerUntil(row.pet_hunger_map, row.equipped_pet_skin || 'golden')).isDead,
    coins: row.coins,
    level: row.level,
    exp: row.exp,
    maxExp: Math.floor(100 * Math.pow(1.5, row.level - 1)),
    bestSurvivalStreak: row.best_survival_streak,
    equippedBingkai: row.equipped_bingkai,
    equippedSpanduk: row.equipped_spanduk,
    equippedTema: row.equipped_tema,
    equippedStiker: row.equipped_stiker,
    stikerLayout:    row.stiker_layout || [],
    equippedPetSkin: row.equipped_pet_skin || 'golden',
  }
}

// The client compresses by decoded image bytes, while the request contains a
// base64 data URL. Leave room for base64 overhead and JSON quoting.
const MAX_PHOTO_BYTES = 1100 * 1024 // ~1.1MB encoded data URL
const MAX_BIO_LENGTH = 300

// Regex to detect bcrypt hash format (starts with $2a$, $2b$, or $2y$)
const BCRYPT_HASH_RE = /^\$2[aby]\$/

// Helper: Verify password (supports both bcrypt hash and plaintext for legacy accounts)
async function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword) return false
  
  // If stored password looks like a bcrypt hash, use bcrypt verification
  if (BCRYPT_HASH_RE.test(storedPassword)) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword)
    } catch (err) {
      console.error('bcrypt compare error:', err)
      return false
    }
  }
  
  // Fallback: plaintext comparison for legacy accounts
  return inputPassword === storedPassword
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
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' })
    }
    
    // Verify password: supports both bcrypt hash (from GuruEOB5) and plaintext (legacy)
    const passwordMatch = await verifyPassword(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Username atau password salah.' })
    }
    
    req.session.user = {
      id:           user.id,
      role,
      name:         user.name || user.username || null,
      username:     user.username || null,
      kelas:        role === 'siswa' ? (user.kelas || null) : null,
      // Guru-specific — needed by requireAdmin middleware and feature checks
      jabatan:      role === 'guru' ? (user.jabatan || []) : undefined,
      kelas_diampu: role === 'guru' ? (user.kelas_diampu || []) : undefined,
      wali_kelas_kelas: role === 'guru' ? (user.wali_kelas_kelas || null) : undefined,
    }
    if (role === 'guru') {
      req.session.user.hasMateriTerdaftar = await computeHasMateriTerdaftar(user.id, user.jabatan || [])
    }

    // Award daily login bonus on fresh login (siswa only) — same logic as /me
    let dailyBonus = null
    if (role === 'siswa') {
      const today     = new Date().toISOString().slice(0, 10)
      const lastDate  = user.last_login_bonus_date
        ? new Date(user.last_login_bonus_date).toISOString().slice(0, 10)
        : null
      if (lastDate !== today) {
        const yesterday  = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
        const newStreak  = lastDate === yesterday ? (user.login_streak || 0) + 1 : 1
        const STREAK_COINS = [50, 75, 100, 125, 150, 175, 200]
        const bonusCoins = STREAK_COINS[Math.min(newStreak - 1, 6)]
        try {
          await pool.query(
            `update students
                set coins              = coins + $2,
                    total_coins_earned = total_coins_earned + $2,
                    last_login_bonus_date = current_date,
                    login_streak       = $3
              where id = $1`,
            [user.id, bonusCoins, newStreak]
          )
          dailyBonus = { coins: bonusCoins, streak: newStreak }
        } catch (bonusErr) {
          console.error('login daily bonus error', bonusErr)
          // Non-fatal — login still succeeds
        }
      }
    }

    const guruExtra = role === 'guru' ? { hasMateriTerdaftar: req.session.user.hasMateriTerdaftar ?? false } : {}
    res.json({ user: sanitizeUser(user, role, guruExtra), dailyBonus })
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
    // Backfill missing fields into session (older sessions may lack these)
    let needsSave = false
    if (session.role === 'siswa' && session.kelas === undefined) {
      session.kelas = user.kelas || null
      needsSave = true
    }
    if (!session.name) {
      session.name = user.name || user.username || null
      needsSave = true
    }
    if (!session.username) {
      session.username = user.username || null
      needsSave = true
    }
    // Sync guru-specific session fields from DB on every /me call so that
    // jabatan changes (e.g. adding guru_mapel) take effect without re-login.
    if (session.role === 'guru') {
      const freshJabatan = user.jabatan || []
      const jabatanChanged = JSON.stringify(session.jabatan) !== JSON.stringify(freshJabatan)
      if (jabatanChanged) {
        session.jabatan = freshJabatan
        needsSave = true
      }
      if (!session.kelas_diampu) {
        session.kelas_diampu = user.kelas_diampu || []
        needsSave = true
      }
      if (session.wali_kelas_kelas === undefined) {
        session.wali_kelas_kelas = user.wali_kelas_kelas || null
        needsSave = true
      }
      // Recompute hasMateriTerdaftar whenever it is unknown or jabatan changed
      if (session.hasMateriTerdaftar === undefined || jabatanChanged) {
        session.hasMateriTerdaftar = await computeHasMateriTerdaftar(session.id, session.jabatan || [])
        needsSave = true
      }
    }
    if (needsSave) req.session.save(() => {})

    // Daily login bonus (siswa only) — awarded once per calendar day
    let dailyBonus = null
    if (session.role === 'siswa') {
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD local-ish (UTC)
      const lastDate = user.last_login_bonus_date
        ? new Date(user.last_login_bonus_date).toISOString().slice(0, 10)
        : null
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
        const newStreak  = lastDate === yesterday ? (user.login_streak || 0) + 1 : 1
        const STREAK_COINS = [50, 75, 100, 125, 150, 175, 200]
        const bonusCoins = STREAK_COINS[Math.min(newStreak - 1, 6)]
        try {
          await pool.query(
            `update students
               set coins              = coins + $2,
                   total_coins_earned = total_coins_earned + $2,
                   last_login_bonus_date = current_date,
                   login_streak       = $3
             where id = $1`,
            [session.id, bonusCoins, newStreak]
          )
          user.coins = (user.coins || 0) + bonusCoins
          dailyBonus = { coins: bonusCoins, streak: newStreak }
        } catch (bonusErr) {
          console.error('daily bonus error', bonusErr)
          // Non-fatal — still return the user
        }
      }
    }

    const guruExtra = session.role === 'guru' ? { hasMateriTerdaftar: session.hasMateriTerdaftar ?? false } : {}
    res.json({ user: sanitizeUser(user, session.role, guruExtra), dailyBonus })
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
    const hasPhotoUpdate = photoUrl !== undefined
    const hasBioUpdate = bio !== undefined
    const { rows } = await pool.query(
      `update ${table} set
        photo_url = case when $2 then $3 else photo_url end,
        bio = case when $4 then $5 else bio end
       where id = $1 returning *`,
      [session.id, hasPhotoUpdate, photoUrl, hasBioUpdate, bio]
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
