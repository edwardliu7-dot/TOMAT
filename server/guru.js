import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { getGuruGrades } from './kelas.js'
import { notifyClassStudents } from './notifications.js'
import { createBossRaid, endBossRaid, getBossRaid, bossRaids, raidToClient } from './boss-state.js'
import { SUPPORTED_TOURNAMENT_GAMES, genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound, getTournamentIo } from './tournament-state.js'
import { startTournamentRound_all } from './tournament-engine.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))

// ── Boss Raid endpoints ───────────────────────────────────────────────────────

// GET /api/guru/boss-raid — list active raids for this guru's classes
router.get('/boss-raid', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const raids = kelasDiampu.map(k => raidToClient(getBossRaid(k))).filter(Boolean)
    res.json({ raids })
  } catch (err) {
    console.error('guru/boss-raid GET error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/guru/boss-raid — create / start a new raid for a class
router.post('/boss-raid', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const {
      kelas, maxHp = 1000, bossName = 'Boss Matematika', bossEmoji = '👹',
      rewardType = null, rewardAmount = 0,
    } = req.body || {}
    if (!kelas) return res.status(400).json({ error: 'kelas wajib diisi.' })
    if (!kelasDiampu.includes(kelas)) return res.status(403).json({ error: 'Kamu tidak mengajar kelas ini.' })
    const validRewardTypes = ['koin', 'exp', 'koin_exp']
    const safeRewardType   = validRewardTypes.includes(rewardType) ? rewardType : null
    const safeRewardAmount = Math.min(1000, Math.max(0, Number(rewardAmount) || 0))
    const raid = createBossRaid({
      kelas, guruId: req.session.user.id,
      guruName: req.session.user.name,
      maxHp: Math.min(5000, Math.max(100, Number(maxHp) || 1000)),
      bossName: String(bossName).slice(0, 50),
      bossEmoji: String(bossEmoji).slice(0, 4),
      rewardType: safeRewardType,
      rewardAmount: safeRewardAmount,
    })
    res.json({ raid: raidToClient(raid) })
  } catch (err) {
    console.error('guru/boss-raid POST error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// DELETE /api/guru/boss-raid/:kelas — end a raid early
router.delete('/boss-raid/:kelas', async (req, res) => {
  try {
    const kelas = decodeURIComponent(req.params.kelas)
    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(kelas)) return res.status(403).json({ error: 'Kamu tidak mengajar kelas ini.' })
    endBossRaid(kelas, true)
    res.json({ ok: true })
  } catch (err) {
    console.error('guru/boss-raid DELETE error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

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
       `select id, username, name, kelas, photo_url, equipped_bingkai, is_test_account
        from students where kelas = any($1) order by kelas, name`,
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

// PATCH /api/guru/tugas/:id — close/reopen or edit a task
router.patch('/tugas/:id', async (req, res) => {
  try {
    const { status, type, totalQuestions, dueAt, difficulty } = req.body || {}

    // Status-only update (close/reopen)
    if (status !== undefined) {
      if (!['active', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid.' })
      }
      const { rows } = await pool.query(
        `update tugas set status = $1 where id = $2 and guru_id = $3 returning *`,
        [status, req.params.id, req.session.user.id]
      )
      if (rows.length === 0) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
      return res.json({ tugas: rows[0] })
    }

    // Full edit update
    if (type !== undefined || totalQuestions !== undefined || dueAt !== undefined || difficulty !== undefined) {
      if (type && !['harian', 'formatif', 'sumatif'].includes(type)) {
        return res.status(400).json({ error: 'Jenis tugas tidak valid.' })
      }
      const totalQ = totalQuestions !== undefined ? parseInt(totalQuestions, 10) : undefined
      if (totalQ !== undefined && (!Number.isFinite(totalQ) || totalQ <= 0)) {
        return res.status(400).json({ error: 'Jumlah soal tidak valid.' })
      }
      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({ error: 'Tingkat kesulitan tidak valid.' })
      }
      const { rows } = await pool.query(
        `update tugas
         set type = coalesce($1, type),
             total_questions = coalesce($2, total_questions),
             due_at = $3,
             difficulty = coalesce($4, difficulty)
         where id = $5 and guru_id = $6
         returning *`,
        [type || null, totalQ || null, dueAt || null, difficulty || null, req.params.id, req.session.user.id]
      )
      if (rows.length === 0) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
      return res.json({ tugas: rows[0] })
    }

    res.status(400).json({ error: 'Tidak ada perubahan yang dikirim.' })
  } catch (err) {
    console.error('guru/tugas update error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// DELETE /api/guru/tugas/:id — delete a task and its grades (cascade)
router.delete('/tugas/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `delete from tugas where id = $1 and guru_id = $2 returning id`,
      [req.params.id, req.session.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
    res.json({ ok: true })
  } catch (err) {
    console.error('guru/tugas delete error', err)
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

// ══════════════════════════════════════════════════════════════════════════════
// TOURNAMENT ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/guru/tournament/games — list game yang didukung turnamen
router.get('/tournament/games', (_req, res) => {
  res.json({ games: SUPPORTED_TOURNAMENT_GAMES })
})

// GET /api/guru/tournament — turnamen aktif untuk kelas guru ini
router.get('/tournament', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const active = [...tournaments.values()]
      .filter(t => kelasDiampu.includes(t.kelas))
      .map(tournamentToClient)
    res.json({ tournaments: active })
  } catch (err) {
    console.error('guru/tournament GET error', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/guru/tournament — mulai turnamen baru
router.post('/tournament', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    const { kelas, gameKey } = req.body || {}

    if (!kelas || !kelasDiampu.includes(kelas))
      return res.status(403).json({ error: 'Kelas tidak valid.' })
    if (!SUPPORTED_TOURNAMENT_GAMES.includes(gameKey))
      return res.status(400).json({ error: `Game '${gameKey}' belum didukung untuk turnamen.` })

    // Cek tidak ada turnamen aktif untuk kelas ini
    const existing = [...tournaments.values()].find(
      t => t.kelas === kelas && t.status !== 'finished'
    )
    if (existing) return res.status(409).json({ error: 'Turnamen masih aktif untuk kelas ini.' })

    // Ambil semua siswa di kelas
    const { rows } = await pool.query(
      'SELECT id AS "userId", name FROM students WHERE kelas = $1',
      [kelas]
    )
    if (rows.length < 2)
      return res.status(400).json({ error: 'Minimal 2 siswa diperlukan untuk memulai turnamen.' })

    const students    = rows.map(r => ({ ...r, socketId: null }))
    const tournamentId = crypto.randomUUID()
    const firstRound  = buildFirstRound(students)

    const tournament = {
      id:           tournamentId,
      kelas,
      guruId:       req.session.user.id,
      gameKey,
      status:       'in-progress',
      currentRound: 1,
      rounds:       [firstRound],
      students,
      champion:     null,
      createdAt:    Date.now(),
    }
    tournaments.set(tournamentId, tournament)

    // Notify semua siswa di kelas via socket
    const io = getTournamentIo()
    io?.to(`kelas:${kelas}`).emit('tournament:started', {
      tournamentId,
      gameKey,
      state: tournamentToClient(tournament),
    })

    // Mulai ronde 1
    startTournamentRound_all(io, tournament)

    res.json({ tournament: tournamentToClient(tournament) })
  } catch (err) {
    console.error('guru/tournament POST error', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/guru/tournament/:id — batalkan turnamen
router.delete('/tournament/:id', async (req, res) => {
  try {
    const t = tournaments.get(req.params.id)
    if (!t) return res.status(404).json({ error: 'Turnamen tidak ditemukan.' })
    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.includes(t.kelas)) return res.status(403).json({ error: 'Akses ditolak.' })

    const wasFinished = t.status === 'finished'
    t.status = 'finished'
    const io = getTournamentIo()
    io?.to(`tournament:${t.id}`).emit('tournament:cancelled')
    io?.to(`kelas:${t.kelas}`).emit('tournament:cancelled')

    // Save to history with status 'cancelled' only if it wasn't already saved as 'finished'
    if (!wasFinished) {
      const totalParticipants = t.rounds?.[0]?.matches?.reduce(
        (a, m) => a + (m.player1 ? 1 : 0) + (m.player2 ? 1 : 0), 0
      ) ?? 0
      await pool.query(
        `insert into tournament_history
           (id, kelas, guru_id, game_key, status, champion_name, champion_id, total_participants, total_rounds, finished_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
         on conflict (id) do nothing`,
        [t.id, t.kelas, t.guruId, t.gameKey, 'cancelled',
         t.champion?.name ?? null, t.champion?.userId ?? null,
         totalParticipants, t.rounds?.length ?? 0]
      )
    }

    tournaments.delete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('guru/tournament DELETE error', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/guru/tournament/history — riwayat turnamen untuk kelas guru ini
router.get('/tournament/history', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    if (!kelasDiampu.length) return res.json({ history: [] })
    const placeholders = kelasDiampu.map((_, i) => `$${i + 1}`).join(',')
    const { rows } = await pool.query(
      `select id, kelas, game_key, status, champion_name, champion_id,
              total_participants, total_rounds, finished_at
       from tournament_history
       where kelas in (${placeholders})
       order by finished_at desc
       limit 50`,
      kelasDiampu
    )
    res.json({ history: rows })
  } catch (err) {
    console.error('guru/tournament/history GET error', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
