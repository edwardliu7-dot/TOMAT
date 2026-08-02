/**
 * server/eob5/student-accounts.js
 * Generate akun login siswa (username otomatis) untuk wali kelas.
 * Menggunakan tabel lama `student_accounts` (bukan student_accounts).
 * Kolom: username (bukan eob5_username), password (bukan password_plain).
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

function makeUsername(name, kelas, index) {
  const base = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16)
  const suffix = String(index).padStart(3, '0')
  return `${base}${suffix}`
}

function makePassword(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

async function getWaliKelas(guruId) {
  const { rows } = await pool.query(
    'SELECT wali_kelas_kelas, name FROM gurus WHERE id = $1', [guruId]
  )
  if (!rows.length || !rows[0].wali_kelas_kelas) return null
  return rows[0]
}

async function getStudentAccount(studentId) {
  const { rows } = await pool.query(
    'SELECT * FROM student_accounts WHERE student_id = $1', [studentId]
  )
  return rows[0] || null
}

// GET / — daftar siswa + status akun di kelas wali kelas
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses fitur ini' })
    }

    const { rows: students } = await pool.query(
      'SELECT id, name, kelas, username FROM students WHERE kelas = $1 ORDER BY name',
      [guru.wali_kelas_kelas]
    )

    const result = await Promise.all(students.map(async s => {
      const acct = await getStudentAccount(s.id)
      return {
        student_id: s.id,
        nama_lengkap: s.name,
        kelas: s.kelas,
        has_account: !!acct,
        username: acct?.username ?? null,
        password: acct?.password ?? null,
        created_at: acct?.created_at ?? null,
      }
    }))

    res.json(result)
  } catch (err) {
    console.error('[eob5/student-accounts] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar akun siswa' })
  }
})

// POST /generate-all — generate semua siswa di kelas wali kelas (harus sebelum /:id)
router.post('/generate-all', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses fitur ini' })
    }

    const { rows: students } = await pool.query(
      'SELECT id, name FROM students WHERE kelas = $1 ORDER BY name',
      [guru.wali_kelas_kelas]
    )

    const results = []
    for (let i = 0; i < students.length; i++) {
      const s = students[i]
      const existing = await getStudentAccount(s.id)
      if (existing) {
        results.push({ student_id: s.id, nama_lengkap: s.name, skipped: true, username: existing.username })
        continue
      }

      let username = makeUsername(s.name, guru.wali_kelas_kelas, i + 1)
      const { rows: dup } = await pool.query(
        'SELECT id FROM student_accounts WHERE username = $1', [username]
      )
      if (dup.length) username = username.slice(0, 14) + String(Date.now()).slice(-4)

      const password = makePassword()
      await pool.query(
        `INSERT INTO student_accounts (student_id, username, password, created_by)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (student_id) DO UPDATE
           SET username = EXCLUDED.username,
               password = EXCLUDED.password,
               created_by = EXCLUDED.created_by`,
        [s.id, username, password, guruId]
      )
      results.push({ student_id: s.id, nama_lengkap: s.name, skipped: false, username, password })
    }

    res.json({ count: results.filter(r => !r.skipped).length, results })
  } catch (err) {
    console.error('[eob5/student-accounts] generate-all error:', err)
    res.status(500).json({ error: 'Gagal generate akun massal' })
  }
})

// POST /:id/generate — generate/regen akun satu siswa
router.post('/:id/generate', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses fitur ini' })
    }

    const { rows: studentRows } = await pool.query(
      'SELECT id, name, kelas FROM students WHERE id = $1 AND kelas = $2',
      [req.params.id, guru.wali_kelas_kelas]
    )
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan di kelas Anda' })
    }
    const student = studentRows[0]
    const forceRegen = req.body?.force === true

    const existing = await getStudentAccount(student.id)
    if (existing && !forceRegen) {
      return res.json({
        student_id: student.id, nama_lengkap: student.name,
        username: existing.username, password: existing.password,
        already_exists: true,
      })
    }

    const { rows: count } = await pool.query(
      'SELECT COUNT(*) AS n FROM student_accounts', []
    )
    const idx = parseInt(count[0].n) + 1
    let username = makeUsername(student.name, guru.wali_kelas_kelas, idx)
    const { rows: dup } = await pool.query(
      'SELECT id FROM student_accounts WHERE username = $1 AND student_id != $2',
      [username, student.id]
    )
    if (dup.length) username = username.slice(0, 14) + String(Date.now()).slice(-4)

    const password = makePassword()
    const { rows } = await pool.query(
      `INSERT INTO student_accounts (student_id, username, password, created_by)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (student_id) DO UPDATE
         SET username = EXCLUDED.username,
             password = EXCLUDED.password,
             created_by = EXCLUDED.created_by
       RETURNING *`,
      [student.id, username, password, guruId]
    )

    res.status(201).json({
      student_id: student.id, nama_lengkap: student.name,
      username: rows[0].username, password: rows[0].password,
    })
  } catch (err) {
    console.error('[eob5/student-accounts] generate error:', err)
    res.status(500).json({ error: 'Gagal generate akun siswa' })
  }
})

// GET /:id — detail akun satu siswa
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses fitur ini' })
    }

    const { rows: studentRows } = await pool.query(
      'SELECT id, name, kelas FROM students WHERE id = $1 AND kelas = $2',
      [req.params.id, guru.wali_kelas_kelas]
    )
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan di kelas Anda' })
    }

    const acct = await getStudentAccount(req.params.id)
    if (!acct) return res.status(404).json({ error: 'Akun belum digenerate' })

    res.json({
      student_id: studentRows[0].id,
      nama_lengkap: studentRows[0].name,
      username: acct.username,
      password: acct.password,
      created_at: acct.created_at,
    })
  } catch (err) {
    console.error('[eob5/student-accounts] detail error:', err)
    res.status(500).json({ error: 'Gagal mengambil akun siswa' })
  }
})

export default router
