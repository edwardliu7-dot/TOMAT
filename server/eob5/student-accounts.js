/**
 * server/eob5/student-accounts.js
 * Generate akun login siswa (username otomatis) untuk wali kelas.
 * Tabel: student_accounts (bukan eob5_student_accounts)
 * Kolom: username (bukan eob5_username), password (bukan password_plain)
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'
import { buildAccountCardsPdf } from './lib/student-account-card.js'

const router = Router()

// ─── Auth helper ──────────────────────────────────────────────────────────────

/**
 * Cek apakah guru adalah wali kelas.
 * jabatan bisa berupa string atau array di DB.
 */
async function getWaliKelas(guruId) {
  const { rows } = await pool.query(
    'SELECT wali_kelas_kelas, name, jabatan FROM gurus WHERE id = $1',
    [guruId]
  )
  if (!rows.length) return null
  const guru = rows[0]
  const jabatan = Array.isArray(guru.jabatan)
    ? guru.jabatan
    : (guru.jabatan || '').split(',').map(s => s.trim())
  if (!jabatan.includes('wali_kelas')) return null
  if (!guru.wali_kelas_kelas) return null
  return guru
}

// ─── Username / password helpers ──────────────────────────────────────────────

function usernameBase(namaLengkap) {
  return namaLengkap
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5)
}

/** Cek uniqueness di tabel students kolom username */
async function usernameTaken(username) {
  const { rows } = await pool.query(
    'SELECT id FROM students WHERE username = $1', [username]
  )
  return rows.length > 0
}

/** Generate username unik maks 7 karakter */
async function uniqueUsername(namaLengkap) {
  const base = usernameBase(namaLengkap)
  if (!(await usernameTaken(base))) return base
  for (let n = 2; n <= 9; n++) {
    const candidate = base + n
    if (!(await usernameTaken(candidate))) return candidate
  }
  for (let n = 10; n <= 99; n++) {
    const candidate = base + n
    if (!(await usernameTaken(candidate))) return candidate
  }
  return base + Math.floor(Math.random() * 1000)
}

/** 6-digit PIN numerik, mudah diketik siswa */
function randomPassword() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function getStudentAccount(studentId) {
  const { rows } = await pool.query(
    'SELECT * FROM student_accounts WHERE student_id = $1', [studentId]
  )
  return rows[0] || null
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /pdf-all — PDF semua siswa di kelas wali kelas (harus SEBELUM /:id)
router.get('/pdf-all', requireGuru, async (req, res) => {
  try {
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
    if (!withAccounts.length) {
      return res.status(404).json({ error: 'Belum ada akun yang dibuat' })
    }

    const pdfBuf = await buildAccountCardsPdf(withAccounts)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="kartu-akun-kelas-${guru.wali_kelas_kelas}.pdf"`,
    })
    res.send(pdfBuf)
  } catch (err) {
    console.error('[eob5/student-accounts] pdf-all error:', err)
    res.status(500).json({ error: 'Gagal membuat PDF' })
  }
})

// GET / — daftar siswa + status akun di kelas wali kelas
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses fitur ini' })
    }

    const { rows: students } = await pool.query(
      'SELECT id, name, kelas FROM students WHERE kelas = $1 ORDER BY name',
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

// POST /generate-all — generate semua siswa di kelas wali kelas (harus SEBELUM /:id)
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
    for (const s of students) {
      const existing = await getStudentAccount(s.id)
      if (existing) {
        results.push({ student_id: s.id, nama_lengkap: s.name, skipped: true, username: existing.username })
        continue
      }

      const username = await uniqueUsername(s.name)
      const password = randomPassword()
      await pool.query(
        `INSERT INTO student_accounts (student_id, username, password, created_by)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (student_id) DO UPDATE
           SET username = EXCLUDED.username,
               password = EXCLUDED.password,
               created_by = EXCLUDED.created_by`,
        [s.id, username, password, guruId]
      )
      // Sync username ke tabel students
      await pool.query('UPDATE students SET username = $1 WHERE id = $2', [username, s.id])
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
    const forceRegen = req.body?.force === true || req.body?.regenerate === true

    const existing = await getStudentAccount(student.id)
    if (existing && !forceRegen) {
      return res.json({
        student_id: student.id,
        nama_lengkap: student.name,
        username: existing.username,
        password: existing.password,
        already_exists: true,
      })
    }

    const username = await uniqueUsername(student.name)
    const password = randomPassword()
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
    // Sync username ke tabel students
    await pool.query('UPDATE students SET username = $1 WHERE id = $2', [username, student.id])

    res.status(201).json({
      student_id: student.id,
      nama_lengkap: student.name,
      username: rows[0].username,
      password: rows[0].password,
    })
  } catch (err) {
    console.error('[eob5/student-accounts] generate error:', err)
    res.status(500).json({ error: 'Gagal generate akun siswa' })
  }
})

// GET /:id/pdf — PDF kartu akun satu siswa
router.get('/:id/pdf', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const guru = await getWaliKelas(guruId)
    if (!guru) return res.status(403).json({ error: 'Hanya wali kelas' })

    const { rows: studentRows } = await pool.query(
      'SELECT name, kelas FROM students WHERE id = $1 AND kelas = $2',
      [req.params.id, guru.wali_kelas_kelas]
    )
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const account = await getStudentAccount(req.params.id)
    if (!account) return res.status(404).json({ error: 'Akun belum dibuat' })

    const pdfBuf = await buildAccountCardsPdf([{
      name: studentRows[0].name,
      kelas: studentRows[0].kelas,
      username: account.username,
      password: account.password,
    }])

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="kartu-akun-${account.username}.pdf"`,
    })
    res.send(pdfBuf)
  } catch (err) {
    console.error('[eob5/student-accounts] pdf error:', err)
    res.status(500).json({ error: 'Gagal membuat PDF' })
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
