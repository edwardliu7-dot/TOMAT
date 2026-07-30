import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { getAccessibleGrades } from './kelas.js'
import { checkAndAwardBadges } from './gamify.js'
import { notifyUser } from './notifications.js'
import { getBossRaid, raidToClient } from './boss-state.js'
import { computeHunger } from './pet-state.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/boss-raid — active raid for this student's class (may be null)
router.get('/boss-raid', async (req, res) => {
  try {
    const kelas = await getMyKelas(req)
    res.json({ raid: kelas ? raidToClient(getBossRaid(kelas)) : null })
  } catch (err) {
    console.error('siswa/boss-raid GET error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

async function getMyKelas(req) {
  const { rows } = await pool.query('select kelas from students where id = $1', [req.session.user.id])
  return rows[0]?.kelas || null
}

// GET /api/siswa/tugas — tasks assigned to this student's own class
router.get('/tugas', async (req, res) => {
  try {
    const kelas = await getMyKelas(req)
    if (!kelas) return res.json({ tugas: [] })
    const { rows } = await pool.query(
      `select t.*,
        (select row_to_json(n) from nilai n where n.tugas_id = t.id and n.student_id = $2) as nilai
       from tugas t
       where t.kelas = $1
       order by t.assigned_at desc`,
      [kelas, req.session.user.id]
    )
    res.json({ tugas: rows })
  } catch (err) {
    console.error('siswa/tugas error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/tugas/laporan-keluar — record student exiting app during task session
router.post('/tugas/laporan-keluar', async (req, res) => {
  try {
    const { tugasId, correctAtExit, totalQuestions } = req.body || {}
    const tId = parseInt(tugasId, 10)
    if (!Number.isFinite(tId)) {
      return res.status(400).json({ error: 'Data tidak valid.' })
    }
    const kelas = await getMyKelas(req)
    const { rows: tugasRows } = await pool.query(
      'select * from tugas where id = $1 and kelas = $2 limit 1',
      [tId, kelas]
    )
    if (!tugasRows[0]) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
    const tugas = tugasRows[0]

    // Record exit event
    await pool.query(
      `insert into task_exit_reports (student_id, tugas_id, correct_at_exit, total_questions)
       values ($1, $2, $3, $4)`,
      [
        req.session.user.id,
        tId,
        Math.max(0, parseInt(correctAtExit, 10) || 0),
        Math.max(1, parseInt(totalQuestions, 10) || tugas.total_questions),
      ]
    )

    // Notify guru
    const studentName = req.session.user.name || req.session.user.username || 'Siswa'
    await notifyUser({
      userId: tugas.guru_id,
      role:   'guru',
      type:   'task_exit',
      title:  '⚠️ Siswa Keluar Saat Tugas',
      body:   `${studentName} meninggalkan aplikasi saat mengerjakan ${tugas.game_name}. Soal direset otomatis (${correctAtExit ?? 0}/${tugas.total_questions} terjawab saat keluar).`,
      url:    '/',
      metadata: { tugasId: tId, studentId: req.session.user.id, correctAtExit: correctAtExit ?? 0 },
    })

    res.json({ ok: true })
  } catch (err) {
    console.error('siswa/tugas/laporan-keluar error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/nilai — submit result of a completed task
router.post('/nilai', async (req, res) => {
  try {
    const { rows: petRows } = await pool.query(
      'select pet_hunger_until from students where id = $1',
      [req.session.user.id],
    )
    if (computeHunger(petRows[0]?.pet_hunger_until).isDead) {
      return res.status(403).json({ error: 'Tomi sedang mati. Hidupkan Tomi kembali sebelum mengerjakan mode tugas.' })
    }
    const { tugasId, correctCount } = req.body || {}
    const tId = parseInt(tugasId, 10)
    const correct = parseInt(correctCount, 10)
    if (!Number.isFinite(tId) || !Number.isFinite(correct) || correct < 0) {
      return res.status(400).json({ error: 'Data nilai tidak valid.' })
    }
    const kelas = await getMyKelas(req)
    const { rows: tugasRows } = await pool.query('select * from tugas where id = $1', [tId])
    const tugas = tugasRows[0]
    if (!tugas || tugas.kelas !== kelas) {
      return res.status(403).json({ error: 'Tugas tidak ditemukan untuk kelas Anda.' })
    }
    if (tugas.status !== 'active') {
      return res.status(403).json({ error: 'Tugas ini sudah ditutup oleh guru.' })
    }
    // total_questions is authoritative from the server-side tugas record, never from the client,
    // to prevent students from forging a smaller total to inflate their score.
    const total = tugas.total_questions
    const clampedCorrect = Math.min(correct, total)
    const score = Math.round((clampedCorrect / total) * 100)
    const { rows: existing } = await pool.query(
      'select id from nilai where tugas_id = $1 and student_id = $2',
      [tId, req.session.user.id]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Tugas ini sudah pernah dikerjakan dan tidak dapat diulang.' })
    }
    const { rows } = await pool.query(
      `insert into nilai (tugas_id, student_id, correct_count, total_questions, score)
       values ($1,$2,$3,$4,$5)
       returning *`,
      [tId, req.session.user.id, clampedCorrect, total, score]
    )
    // A finished task can unlock "nilai_sempurna", "rajin_berlatih" or "penjelajah_lengkap" —
    // check right after the insert so the badge shows up as soon as the student finishes.
    const newBadges = await checkAndAwardBadges(req.session.user.id)
    await notifyUser({
      userId: tugas.guru_id,
      role: 'guru',
      type: 'nilai_baru',
      title: 'Nilai tugas baru',
      body: `${req.session.user.id} mengumpulkan ${tugas.game_name} dengan nilai ${score}.`,
      url: '/',
      metadata: { tugasId: tId, studentId: req.session.user.id, nilaiId: rows[0].id, score },
    })
    res.json({ nilai: rows[0], newBadges })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Tugas ini sudah pernah dikerjakan dan tidak dapat diulang.' })
    }
    console.error('siswa/nilai error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/siswa/nilai — this student's own grades
router.get('/nilai', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select n.*, t.game_name, t.game_emoji, t.type, t.due_at
       from nilai n join tugas t on t.id = n.tugas_id
       where n.student_id = $1
       order by n.completed_at desc`,
      [req.session.user.id]
    )
    res.json({ nilai: rows })
  } catch (err) {
    console.error('siswa/nilai list error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/siswa/bab-locks — lock state for own grade + all lower grades
router.get('/bab-locks', async (req, res) => {
  try {
    const kelas = await getMyKelas(req)
    const grades = getAccessibleGrades(kelas)
    if (grades.length === 0) return res.json({ locks: [], grades: [] })
    const { rows } = await pool.query(
      `select * from bab_locks where grade = any($1) order by grade, bab`,
      [grades]
    )
    res.json({ locks: rows, grades })
  } catch (err) {
    console.error('siswa/bab-locks error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
