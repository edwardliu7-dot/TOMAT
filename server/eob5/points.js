/**
 * server/eob5/points.js
 * CRUD poin perilaku siswa (positif / negatif).
 *
 * GET    /api/eob5/points              — daftar poin (filter: student_id)
 * POST   /api/eob5/points              — input poin satu siswa
 * POST   /api/eob5/points/bulk         — input poin banyak siswa (sama semua)
 * POST   /api/eob5/points/bulk-mixed   — input poin banyak siswa, berbeda per siswa
 * PATCH  /api/eob5/points/:id          — update record
 * DELETE /api/eob5/points/:id          — hapus record
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

async function getStudentIds(guruId) {
  const { rows } = await pool.query(
    `SELECT s.id FROM students s
     JOIN gurus g ON s.kelas = ANY(g.kelas_diampu)
     WHERE g.id = $1`,
    [guruId]
  )
  return new Set(rows.map(r => r.id))
}

// GET / — daftar poin
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id } = req.query

    const allowed = await getStudentIds(guruId)
    if (!allowed.size) return res.json([])
    if (student_id && !allowed.has(student_id)) return res.json([])

    const params = student_id
      ? [student_id]
      : [[...allowed]]

    const where = student_id
      ? 'p.student_id = $1'
      : 'p.student_id = ANY($1::text[])'

    const { rows } = await pool.query(
      `SELECT p.*, s.name AS siswa_name, s.kelas
       FROM point_records p
       JOIN students s ON s.id = p.student_id
       WHERE ${where}
       ORDER BY p.tanggal DESC, p.created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/points] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil data poin' })
  }
})

// POST / — input satu siswa
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, jenis, poin, keterangan, tanggal } = req.body || {}

    if (!student_id || !jenis || poin === undefined) {
      return res.status(400).json({ error: 'student_id, jenis, dan poin wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    if (!allowed.has(student_id)) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `INSERT INTO point_records (student_id, guru_id, jenis, poin, keterangan, tanggal)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [student_id, guruId, jenis, poin, keterangan || null, tanggal || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/points] create error:', err)
    res.status(500).json({ error: 'Gagal menyimpan poin' })
  }
})

// POST /bulk — banyak siswa, poin sama
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_ids, jenis, poin, keterangan, tanggal } = req.body || {}

    if (!Array.isArray(student_ids) || !student_ids.length || !jenis || poin === undefined) {
      return res.status(400).json({ error: 'student_ids[], jenis, dan poin wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    const targets = [...new Set(student_ids)].filter(id => allowed.has(id))
    if (!targets.length) {
      return res.status(400).json({ error: 'Tidak ada siswa valid yang dipilih' })
    }

    const client = await pool.connect()
    let count = 0
    try {
      await client.query('BEGIN')
      for (const sid of targets) {
        await client.query(
          `INSERT INTO point_records (student_id, guru_id, jenis, poin, keterangan, tanggal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [sid, guruId, jenis, poin, keterangan || null, tanggal || null]
        )
        count++
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ count })
  } catch (err) {
    console.error('[eob5/points] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan poin massal' })
  }
})

// POST /bulk-mixed — satu tanggal, poin berbeda per siswa
router.post('/bulk-mixed', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, entries } = req.body || {}

    if (!tanggal || !Array.isArray(entries) || !entries.length) {
      return res.status(400).json({ error: 'tanggal dan entries[] wajib diisi' })
    }

    const allowed = await getStudentIds(guruId)
    const targets = entries.filter(e => allowed.has(e.student_id))
    if (!targets.length) return res.json({ count: 0 })

    const client = await pool.connect()
    let count = 0
    try {
      await client.query('BEGIN')
      for (const e of targets) {
        await client.query(
          `INSERT INTO point_records (student_id, guru_id, jenis, poin, keterangan, tanggal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [e.student_id, guruId, e.jenis, e.poin, e.keterangan || null, tanggal]
        )
        count++
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ count })
  } catch (err) {
    console.error('[eob5/points] bulk-mixed error:', err)
    res.status(500).json({ error: 'Gagal menyimpan poin' })
  }
})

// PATCH /:id — update record
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { jenis, poin, keterangan, tanggal } = req.body || {}

    const allowed = await getStudentIds(guruId)
    const { rows: existing } = await pool.query(
      'SELECT student_id FROM point_records WHERE id = $1', [id]
    )
    if (!existing.length || !allowed.has(existing[0].student_id)) {
      return res.status(404).json({ error: 'Record poin tidak ditemukan' })
    }

    const { rows } = await pool.query(
      `UPDATE point_records
       SET jenis      = COALESCE($1, jenis),
           poin       = COALESCE($2, poin),
           keterangan = COALESCE($3, keterangan),
           tanggal    = COALESCE($4, tanggal)
       WHERE id = $5
       RETURNING *`,
      [jenis || null, poin !== undefined ? poin : null,
       keterangan !== undefined ? keterangan : null, tanggal || null, id]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/points] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate poin' })
  }
})

// DELETE /:id — hapus record
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params

    const allowed = await getStudentIds(guruId)
    const { rows: existing } = await pool.query(
      'SELECT student_id FROM point_records WHERE id = $1', [id]
    )
    if (!existing.length || !allowed.has(existing[0].student_id)) {
      return res.status(404).json({ error: 'Record poin tidak ditemukan' })
    }

    await pool.query('DELETE FROM point_records WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/points] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus poin' })
  }
})

export default router
