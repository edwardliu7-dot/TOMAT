import express from 'express'
import { requireAuth, requireRole } from './auth.js'
import { SEASONAL_EVENTS, isEventActive } from './seasonal-events.js'
import { getMissionProgress, claimMissionReward } from './event-missions.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/event-missions
// Returns mission progress for all currently active events.
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    const activeEvents = SEASONAL_EVENTS.filter(ev => isEventActive(ev, now))
    const result = []
    for (const ev of activeEvents) {
      const missions = await getMissionProgress(req.session.user.id, ev.slug)
      result.push({ eventSlug: ev.slug, missions })
    }
    res.json({ events: result })
  } catch (err) {
    console.error('event-missions GET error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/event-missions/:missionId/claim
// Claims the reward for a completed mission.
router.post('/:missionId/claim', async (req, res) => {
  try {
    const result = await claimMissionReward(req.session.user.id, req.params.missionId)
    res.json(result)
  } catch (err) {
    const status =
      err.message.includes('tidak ditemukan') ? 404 :
      err.message.includes('sudah diambil')   ? 409 :
      err.message.includes('belum selesai')   ? 403 :
      err.message.includes('sudah berakhir')  ? 403 : 500
    res.status(status).json({ error: err.message })
  }
})

export default router
