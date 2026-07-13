import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/papan-peringkat — top students in the caller's own class, ranked by
// level then exp, plus the caller's own rank (even if outside the visible top list).
router.get('/', async (req, res) => {
  try {
    const { rows: meRows } = await pool.query('select kelas from students where id = $1', [req.session.user.id])
    const kelas = meRows[0]?.kelas
    if (!kelas) return res.json({ kelas: null, leaderboard: [], me: null })

    const { rows } = await pool.query(
      `select id, name, level, exp, equipped_bingkai,
              rank() over (order by level desc, exp desc) as rank
       from students
       where kelas = $1
       order by level desc, exp desc, name asc`,
      [kelas]
    )

    const leaderboard = rows.map(r => ({
      id: r.id,
      name: r.name,
      level: r.level,
      exp: r.exp,
      equippedBingkai: r.equipped_bingkai,
      rank: Number(r.rank),
      isMe: r.id === req.session.user.id,
    }))
    const me = leaderboard.find(r => r.isMe) || null

    res.json({ kelas, leaderboard, me })
  } catch (err) {
    console.error('papan-peringkat error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
