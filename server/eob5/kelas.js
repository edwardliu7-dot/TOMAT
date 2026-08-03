/**
 * server/eob5/kelas.js
 * Manajemen kelas dan pengajar.
 * Menggunakan gurus.kelas_diampu sebagai sumber data — tabel kelas_guru sudah di-DROP.
 *
 * GET /api/eob5/kelas/list        — daftar semua kelas (dari data siswa)
 * GET /api/eob5/kelas/:id/siswa   — siswa di kelas tertentu
 * GET /api/eob5/kelas/:id/guru    — guru yang mengajar kelas ini (dari kelas_diampu)
 * POST /api/eob5/kelas/assign     — assign guru ke kelas (update kelas_diampu)
 * DELETE /api/eob5/kelas/assign   — hapus assignment (body: {guru_id, kelas})
 */

import express from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = express.Router()

// GET /list — daftar semua kelas dari data siswa
router.get('/list', requireGuru, async (req, res) => {
  try {
    const { rows: kelasRows } = await pool.query(
      'SELECT DISTINCT kelas FROM students WHERE kelas IS NOT NULL ORDER BY kelas'
    )
    const kelasList = kelasRows.map(r => r.kelas)

    const countRes = await pool.query(
      `SELECT kelas, COUNT(*) AS jumlah_siswa FROM students WHERE kelas IS NOT NULL GROUP BY kelas`
    )
    const siswaCounts = Object.fromEntries(countRes.rows.map(r => [r.kelas, parseInt(r.jumlah_siswa)]))

    res.json(kelasList.map(k => ({
      kelas: k,
      jumlahSiswa: siswaCounts[k] || 0,
    })))
  } catch (err) {
    console.error('[eob5/kelas] list error:', err)
    res.status(500).json({ error: 'Gagal memuat daftar kelas' })
  }
})

// GET /:id/siswa
router.get('/:id/siswa', requireGuru, async (req, res) => {
  try {
    const kelas = decodeURIComponent(req.params.id)
    const { rows } = await pool.query(
      `SELECT id, username, name, kelas, email, whatsapp, jenis_kelamin
       FROM students WHERE kelas = $1 ORDER BY name`,
      [kelas]
    )
    res.json({ kelas, jumlah: rows.length, siswa: rows })
  } catch (err) {
    console.error('[eob5/kelas] siswa error:', err)
    res.status(500).json({ error: 'Gagal memuat siswa kelas' })
  }
})

// GET /:id/guru — guru yang kelas_diampu-nya mencakup kelas ini
router.get('/:id/guru', requireGuru, async (req, res) => {
  try {
    const kelas = decodeURIComponent(req.params.id)
    const { rows } = await pool.query(
      `SELECT id AS guru_id, name AS guru_name, username AS guru_username,
              jabatan, kelas_diampu
       FROM gurus
       WHERE $1 = ANY(kelas_diampu)
       ORDER BY name`,
      [kelas]
    )
    res.json({ kelas, guru: rows })
  } catch (err) {
    console.error('[eob5/kelas] guru error:', err)
    res.status(500).json({ error: 'Gagal memuat guru kelas' })
  }
})

// POST /assign — tambahkan kelas ke kelas_diampu guru
router.post('/assign', requireGuru, async (req, res) => {
  try {
    const { guru_id, kelas } = req.body || {}
    if (!guru_id || !kelas) {
      return res.status(400).json({ error: 'guru_id dan kelas wajib diisi' })
    }

    const guruRes = await pool.query('SELECT id FROM gurus WHERE id = $1', [guru_id])
    if (guruRes.rowCount === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' })

    await pool.query(
      `UPDATE gurus SET kelas_diampu = array_append(kelas_diampu, $2)
       WHERE id = $1 AND NOT ($2 = ANY(kelas_diampu))`,
      [guru_id, kelas]
    )

    res.status(201).json({ ok: true, guru_id, kelas })
  } catch (err) {
    console.error('[eob5/kelas] assign error:', err)
    res.status(500).json({ error: 'Gagal menetapkan guru ke kelas' })
  }
})

// DELETE /assign — hapus kelas dari kelas_diampu guru (body: {guru_id, kelas})
router.delete('/assign', requireGuru, async (req, res) => {
  try {
    const { guru_id, kelas } = req.body || {}
    if (!guru_id || !kelas) {
      return res.status(400).json({ error: 'guru_id dan kelas wajib diisi' })
    }

    await pool.query(
      `UPDATE gurus SET kelas_diampu = array_remove(kelas_diampu, $2) WHERE id = $1`,
      [guru_id, kelas]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[eob5/kelas] hapus assign error:', err)
    res.status(500).json({ error: 'Gagal menghapus assignment' })
  }
})

export default router
