/**
 * server/blp/helpers.js
 * Shared utilities untuk semua router BLP Harian.
 */

import { pool } from '../db.js'

// ── Timezone ─────────────────────────────────────────────────────────────────
const JAKARTA_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function getJakartaTodayDateString() {
  return JAKARTA_DATE_FORMATTER.format(new Date())
}

// ── Username / ID normalization ───────────────────────────────────────────────
export function normalizeUsername(username) {
  return String(username || '').trim().replace(/\s+/g, ' ')
}

export function toId(username) {
  return normalizeUsername(username).toLowerCase().replace(/\s+/g, '-')
}

// ── Kelas normalization ───────────────────────────────────────────────────────
// Normalize kelas names so spelling variants (e.g. "Batutah" vs "Batuttah")
// don't silently hide students from a wali kelas.
const KELAS_OPTIONS = ['VII Ibnu Batuttah', 'VIII Ibnu Sina', 'IX Al Khawarizmi']

function kelasMatchKey(kelas) {
  return String(kelas || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(.)\1+/g, '$1')
}

const KELAS_CANONICAL_BY_KEY = Object.fromEntries(
  KELAS_OPTIONS.map(k => [kelasMatchKey(k), k])
)

export function normalizeKelas(kelas) {
  return KELAS_CANONICAL_BY_KEY[kelasMatchKey(kelas)] || kelas
}

// ── Guru helpers ──────────────────────────────────────────────────────────────
export function isWaliKelas(row) {
  return !!(row.jabatan || []).includes('wali_kelas') && !!row.wali_kelas_kelas
}

export async function loadGuru(id) {
  const res = await pool.query(
    'SELECT id, username, name, jabatan, wali_kelas_kelas, photo_url, bio FROM gurus WHERE id = $1',
    [id]
  )
  if (res.rowCount === 0) return null
  const row = res.rows[0]
  if (!isWaliKelas(row)) return null
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    kelasWali: [normalizeKelas(row.wali_kelas_kelas)],
    photoUrl: row.photo_url,
    bio: row.bio,
  }
}

// ── Student helpers ───────────────────────────────────────────────────────────
export async function loadStudent(id) {
  const studentRes = await pool.query(
    `SELECT id, username, name, kelas, email, whatsapp, photo_url, bio,
            quran_bookmark, jenis_kelamin
     FROM students WHERE id = $1`,
    [id]
  )
  if (studentRes.rowCount === 0) return null
  const row = studentRes.rows[0]

  const [recordsRes, haidRes] = await Promise.all([
    pool.query(
      'SELECT record_date, completed_activities, score, submissions FROM daily_records WHERE student_id = $1',
      [id]
    ),
    pool.query(
      'SELECT id, start_date, end_date FROM haid_periods WHERE student_id = $1 ORDER BY start_date DESC',
      [id]
    ),
  ])

  const records = {}
  for (const r of recordsRes.rows) {
    const dateKey = r.record_date.toISOString().slice(0, 10)
    records[dateKey] = {
      date: dateKey,
      completedActivities: r.completed_activities || [],
      score: r.score,
      submissions: r.submissions || {},
    }
  }

  const haidPeriods = haidRes.rows.map(r => ({
    id: r.id,
    startDate: r.start_date.toISOString().slice(0, 10),
    endDate: r.end_date ? r.end_date.toISOString().slice(0, 10) : null,
  }))

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    kelas: normalizeKelas(row.kelas),
    email: row.email,
    whatsapp: row.whatsapp,
    photoUrl: row.photo_url,
    bio: row.bio,
    quranBookmark: row.quran_bookmark || null,
    jenisKelamin: row.jenis_kelamin || null,
    haidPeriods,
    records,
  }
}

// ── BLP Period key ────────────────────────────────────────────────────────────
export function blpPeriodKey(kelas, year, month) {
  return `${kelas}__${year}-${String(month).padStart(2, '0')}`
}

// ── Auth middleware ───────────────────────────────────────────────────────────
// TOMAT session: req.session.user = { id, role, name, username, kelas }
export function requireBlpSiswa(idParam) {
  return (req, res, next) => {
    if (!req.session?.user || req.session.user.role !== 'siswa') {
      return res.status(401).json({ error: 'Anda harus login sebagai siswa' })
    }
    if (idParam && req.session.user.id !== req.params[idParam]) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke data ini' })
    }
    next()
  }
}

export function requireBlpGuru(idParam) {
  return (req, res, next) => {
    if (!req.session?.user || req.session.user.role !== 'guru') {
      return res.status(401).json({ error: 'Anda harus login sebagai guru' })
    }
    if (idParam && req.session.user.id !== req.params[idParam]) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke data ini' })
    }
    next()
  }
}

export function requireBlpAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Anda harus login untuk melakukan ini' })
  }
  next()
}
