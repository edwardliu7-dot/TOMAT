/**
 * server/eob5/health.js
 * GET /api/eob5/health — Cek status service EOB5
 */

import express from 'express'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'eob5', timestamp: new Date().toISOString() })
})

export default router
