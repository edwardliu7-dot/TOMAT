import express from 'express'
import crypto from 'node:crypto'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))

// List arenas for the current guru
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'select id, name, config, created_at, updated_at from moba_arenas where guru_id = $1 order by updated_at desc',
      [req.session.user.id]
    )
    res.json({ arenas: rows })
  } catch (err) {
    console.error('[moba-arenas] list error', err)
    res.status(500).json({ error: 'Gagal memuat daftar arena.' })
  }
})

// Get a single arena
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'select id, name, config, created_at, updated_at from moba_arenas where id = $1 and guru_id = $2',
      [req.params.id, req.session.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Arena tidak ditemukan.' })
    res.json({ arena: rows[0] })
  } catch (err) {
    console.error('[moba-arenas] get error', err)
    res.status(500).json({ error: 'Gagal mengambil arena.' })
  }
})

// Create new arena
router.post('/', async (req, res) => {
  try {
    const id = crypto.randomUUID()
    const { name, config } = req.body || {}
    if (!config) return res.status(400).json({ error: 'config arena wajib dikirim.' })

    await pool.query(
      `insert into moba_arenas (id, guru_id, name, config) values ($1,$2,$3,$4)`,
      [id, req.session.user.id, name || null, JSON.stringify(config)]
    )
    res.status(201).json({ id })
  } catch (err) {
    console.error('[moba-arenas] create error', err)
    res.status(500).json({ error: 'Gagal menyimpan arena.' })
  }
})

// Update arena
router.put('/:id', async (req, res) => {
  try {
    const { name, config } = req.body || {}
    if (!config) return res.status(400).json({ error: 'config arena wajib dikirim.' })

    const { rows } = await pool.query(
      `update moba_arenas set name = $1, config = $2, updated_at = now() where id = $3 and guru_id = $4 returning id`,
      [name || null, JSON.stringify(config), req.params.id, req.session.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Arena tidak ditemukan atau tidak punya akses.' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[moba-arenas] update error', err)
    res.status(500).json({ error: 'Gagal mengupdate arena.' })
  }
})

// Delete arena
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'delete from moba_arenas where id = $1 and guru_id = $2 returning id',
      [req.params.id, req.session.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Arena tidak ditemukan atau tidak punya akses.' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[moba-arenas] delete error', err)
    res.status(500).json({ error: 'Gagal menghapus arena.' })
  }
})

export default router
