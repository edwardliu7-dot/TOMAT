import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { getGuruGrades } from './kelas.js'
import { notifyClassStudents } from './notifications.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))

async function getMyKelasDiampu(req) {
  const { rows } = await pool.query('select kelas_diampu from gurus where id = $1', [req.session.user.id])
  return rows[0]?.kelas_diampu || []
}

// GET /api/guru/students — roster of students in the classes this teacher teaches
router.get('/students', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    if (kelasDiampu.length === 0) return res.json({ students: [] })
    const { rows } = await pool.query(
       `select id, username, name, kelas, photo_url, equipped_bingkai from students where kelas = any($1) order by kelas, name`,
      [kelasDiampu]
    )
    res.json({ students: rows })
  } catch (err) {
    console.error('guru/students error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/guru/tugas — tasks created by this teacher
router.get('/tugas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select * from tugas where guru_id = $1 order by assigned_at desc`,
      [req.session.user.id]
    )
    res.json({ tugas: rows })
  } catch (err) {
    console.error('guru/tugas list error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/guru/tugas — assign a new task to a class this teacher teaches
router.post('/tugas', async (req, res) => {
  try {
    const { kelas, gameKey, gameName, gameEmoji, bab, type, totalQuestions, dueAt, difficulty } = req.body || {}
    if (!kelas || !gameKey || !gameName || !type || !totalQuestions) {
      return res.status(400).json({ error: 'Data tugas tidak lengkap.' })
    }
    if (!['harian', 'formatif', 'sumatif'].includes(type)) {
      return res.status(400).json({ error: 'Jenis tugas tidak valid.' })
    }
    const difficultyValue = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(kelas)) {
      return res.status(403).json({ error: 'Anda tidak mengampu kelas ini.' })
    }
    const totalQ = parseInt(totalQuestions, 10)
    if (!Number.isFinite(totalQ) || totalQ <= 0) {
      return res.status(400).json({ error: 'Jumlah soal tidak valid.' })
    }
    const { rows } = await pool.query(
      `insert into tugas (guru_id, kelas, game_key, game_name, game_emoji, bab, type, total_questions, due_at, difficulty)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`,
      [req.session.user.id, kelas, gameKey, gameName, gameEmoji || null, bab || null, type, totalQ, dueAt || null, difficultyValue]
    )
    await notifyClassStudents(kelas, {
      type: 'tugas_baru',
      title: 'Tugas baru dari guru',
      body: `${gameEmoji || '📝'} ${gameName} · ${totalQ} soal`,
      url: '/',
      metadata: { tugasId: rows[0].id, gameKey, kelas },
    })
    res.json({ tugas: rows[0] })
  } catch (err) {
    console.error('guru/tugas create error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/guru/tugas/:id — close/reopen a task
router.patch('/tugas/:id', async (req, res) => {
  try {
    const { status } = req.body || {}
    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' })
    }
    const { rows } = await pool.query(
      `update tugas set status = $1 where id = $2 and guru_id = $3 returning *`,
      [status, req.params.id, req.session.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
    res.json({ tugas: rows[0] })
  } catch (err) {
    console.error('guru/tugas update error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/guru/nilai — grade recap for all tasks this teacher assigned
router.get('/nilai', async (req, res) => {
  try {
    const { rows } = await pool.query(
       `select n.*, t.game_name, t.game_emoji, t.type, t.kelas, t.due_at,
          s.name as student_name, s.username as student_username,
          s.photo_url as student_photo_url, s.equipped_bingkai as student_equipped_bingkai
       from nilai n
       join tugas t on t.id = n.tugas_id
       join students s on s.id = n.student_id
       where t.guru_id = $1
       order by n.completed_at desc`,
      [req.session.user.id]
    )
    res.json({ nilai: rows })
  } catch (err) {
    console.error('guru/nilai error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/guru/bab-locks — lock state for grades this teacher teaches
router.get('/bab-locks', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const grades = getGuruGrades(kelasDiampu)
    if (grades.length === 0) return res.json({ locks: [] })
    const { rows } = await pool.query(
      `select * from bab_locks where grade = any($1) order by grade, bab`,
      [grades]
    )
    res.json({ locks: rows, grades })
  } catch (err) {
    console.error('guru/bab-locks get error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/guru/bab-locks — lock/unlock a bab for a grade this teacher teaches
router.post('/bab-locks', async (req, res) => {
  try {
    const { grade, bab, locked } = req.body || {}
    const gradeNum = parseInt(grade, 10)
    if (!Number.isFinite(gradeNum) || !bab || typeof locked !== 'boolean') {
      return res.status(400).json({ error: 'Data kunci bab tidak valid.' })
    }
    const kelasDiampu = await getMyKelasDiampu(req)
    const myGrades = getGuruGrades(kelasDiampu)
    if (!myGrades.includes(gradeNum)) {
      return res.status(403).json({ error: 'Anda tidak mengampu kelas ini.' })
    }
    const { rows } = await pool.query(
      `insert into bab_locks (grade, bab, locked, updated_by, updated_at) values ($1,$2,$3,$4, now())
       on conflict (grade, bab) do update set locked = $3, updated_by = $4, updated_at = now()
       returning *`,
      [gradeNum, bab, locked, req.session.user.id]
    )
    res.json({ lock: rows[0] })
  } catch (err) {
    console.error('guru/bab-locks set error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
