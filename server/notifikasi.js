import express from 'express'
import { requireAuth } from './auth.js'
import { pool } from './db.js'
import { getPushConfig } from './notifications.js'

const router = express.Router()
router.use(requireAuth)

function currentUser(req) {
  return req.session.user
}

function validSubscription(value) {
  return value
    && typeof value.endpoint === 'string'
    && value.endpoint.startsWith('https://')
    && typeof value.keys?.p256dh === 'string'
    && typeof value.keys?.auth === 'string'
    && value.endpoint.length <= 2000
    && value.keys.p256dh.length <= 300
    && value.keys.auth.length <= 300
}

router.get('/config', (req, res) => {
  res.json(getPushConfig())
})

router.post('/subscribe', async (req, res) => {
  try {
    if (!validSubscription(req.body)) {
      return res.status(400).json({ error: 'Data perangkat tidak valid.' })
    }
    const user = currentUser(req)
    const { endpoint, keys } = req.body
    await pool.query(
      `insert into push_subscriptions (endpoint, user_id, user_role, p256dh, auth, updated_at)
       values ($1,$2,$3,$4,$5,now())
       on conflict (endpoint) do update set
         user_id = $2, user_role = $3, p256dh = $4, auth = $5, updated_at = now()`,
      [endpoint, user.id, user.role, keys.p256dh, keys.auth]
    )
    res.status(201).json({ ok: true })
  } catch (err) {
    console.error('notifikasi/subscribe error', err)
    res.status(500).json({ error: 'Gagal mengaktifkan notifikasi perangkat.' })
  }
})

router.delete('/subscribe', async (req, res) => {
  try {
    const endpoint = req.body?.endpoint
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) {
      return res.status(400).json({ error: 'Alamat perangkat tidak valid.' })
    }
    await pool.query(
      'delete from push_subscriptions where endpoint = $1 and user_id = $2 and user_role = $3',
      [endpoint, currentUser(req).id, currentUser(req).role]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('notifikasi/unsubscribe error', err)
    res.status(500).json({ error: 'Gagal menonaktifkan notifikasi perangkat.' })
  }
})

router.get('/', async (req, res) => {
  try {
    const user = currentUser(req)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30))
    const { rows } = await pool.query(
      `select id, type, title, body, url, metadata, read_at, created_at
       from notifications
       where recipient_id = $1 and recipient_role = $2
       order by created_at desc
       limit $3`,
      [user.id, user.role, limit]
    )
    const { rows: countRows } = await pool.query(
      `select count(*)::int as count from notifications
       where recipient_id = $1 and recipient_role = $2 and read_at is null`,
      [user.id, user.role]
    )
    res.json({ notifications: rows, unreadCount: countRows[0]?.count || 0, push: getPushConfig() })
  } catch (err) {
    console.error('notifikasi/list error', err)
    res.status(500).json({ error: 'Gagal memuat notifikasi.' })
  }
})

router.post('/:id/read', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Notifikasi tidak valid.' })
    const user = currentUser(req)
    await pool.query(
      `update notifications set read_at = coalesce(read_at, now())
       where id = $1 and recipient_id = $2 and recipient_role = $3`,
      [id, user.id, user.role]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('notifikasi/read error', err)
    res.status(500).json({ error: 'Gagal menandai notifikasi.' })
  }
})

router.post('/read-all', async (req, res) => {
  try {
    const user = currentUser(req)
    await pool.query(
      `update notifications set read_at = now()
       where recipient_id = $1 and recipient_role = $2 and read_at is null`,
      [user.id, user.role]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('notifikasi/read-all error', err)
    res.status(500).json({ error: 'Gagal menandai notifikasi.' })
  }
})

export default router
