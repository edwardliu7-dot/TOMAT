import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { listMobaMatchResults } from './moba/results.js'
import { isMobaEnabled } from './moba/access.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))
router.use((req, res, next) => {
  if (isMobaEnabled()) return next()
  return res.status(403).json({ error: 'MOBA Arena sedang dikunci.' })
})

router.get('/', async (req, res) => {
  try {
    const results = await listMobaMatchResults(pool, {
      limit: req.query.limit,
      offset: req.query.offset,
    })
    res.json({ results })
  } catch (error) {
    console.error('[moba-results] list error:', error)
    res.status(500).json({ error: 'Riwayat pertandingan MOBA belum dapat dimuat.' })
  }
})

export default router