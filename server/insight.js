import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))

async function getMyKelasDiampu(req) {
  const { rows } = await pool.query('select kelas_diampu from gurus where id = $1', [req.session.user.id])
  return rows[0]?.kelas_diampu || []
}

// GET /api/guru/insight — per-student engagement snapshot for classes this teacher teaches:
// coins/level/exp, best survival streak, badge count, and a 7-day activity sparkline derived
// from nilai.completed_at (no separate activity-tracking table needed).
router.get('/', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    if (kelasDiampu.length === 0) return res.json({ students: [] })

    const { rows: students } = await pool.query(
       `select id, name, username, kelas, level, exp, coins, best_survival_streak, photo_url, equipped_bingkai
       from students where kelas = any($1) order by kelas, level desc, exp desc`,
      [kelasDiampu]
    )
    if (students.length === 0) return res.json({ students: [] })

    const studentIds = students.map(s => s.id)
    const [badgeCounts, activity] = await Promise.all([
      pool.query(
        `select student_id, count(*)::int as c from student_badges where student_id = any($1) group by student_id`,
        [studentIds]
      ),
      pool.query(
        `select student_id, date(completed_at) as day, count(*)::int as c
         from nilai
         where student_id = any($1) and completed_at >= now() - interval '7 days'
         group by student_id, date(completed_at)`,
        [studentIds]
      ),
    ])
    const badgeCountMap = new Map(badgeCounts.rows.map(r => [r.student_id, r.c]))
    const activityByStudent = new Map()
    for (const row of activity.rows) {
      const list = activityByStudent.get(row.student_id) || []
      list.push({ day: row.day, count: row.c })
      activityByStudent.set(row.student_id, list)
    }

    const today = new Date()
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().slice(0, 10)
    })

    const result = students.map(s => {
      const days = activityByStudent.get(s.id) || []
      const byDay = new Map(days.map(d => [new Date(d.day).toISOString().slice(0, 10), d.count]))
      const sparkline = last7Days.map(day => byDay.get(day) || 0)
      return {
        id: s.id,
        name: s.name,
        username: s.username,
        kelas: s.kelas,
         photoUrl: s.photo_url || null,
         equippedBingkai: s.equipped_bingkai || null,
        level: s.level,
        exp: s.exp,
        coins: s.coins,
        bestSurvivalStreak: s.best_survival_streak,
        badgeCount: badgeCountMap.get(s.id) || 0,
        sparkline,
        activeToday: sparkline[6] > 0,
      }
    })

    res.json({ students: result })
  } catch (err) {
    console.error('guru/insight error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
