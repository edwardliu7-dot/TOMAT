import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { listMobaPlayerHistory } from './moba/results.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

router.get('/history', async (req, res) => {
  try {
    const history = await listMobaPlayerHistory(pool, {
      userId: req.session.user.id,
      limit: req.query.limit,
      offset: req.query.offset,
      includeReward: true,
    })
    res.json(history)
  } catch (error) {
    console.error('[moba-history] list error:', error)
    res.status(500).json({ error: 'Riwayat pertandingan MOBA belum dapat dimuat.' })
  }
})

export default router