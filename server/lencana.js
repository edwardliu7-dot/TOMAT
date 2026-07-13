import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/lencana — every badge definition, annotated with whether (and when) this
// student earned it. Badges themselves are awarded elsewhere (gamify.js checkAndAwardBadges),
// this endpoint only reads the current state for the collection screen.
router.get('/', async (req, res) => {
  try {
    const [badgesRes, earnedRes] = await Promise.all([
      pool.query('select * from badges order by sort_order'),
      pool.query('select badge_id, earned_at from student_badges where student_id = $1', [req.session.user.id]),
    ])
    const earnedMap = new Map(earnedRes.rows.map(r => [r.badge_id, r.earned_at]))
    const badges = badgesRes.rows.map(b => ({
      ...b,
      isUnlocked: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) || null,
    }))
    res.json({ badges, unlockedCount: earnedMap.size, totalCount: badges.length })
  } catch (err) {
    console.error('lencana error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
