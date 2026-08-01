/**
 * server/eob5/kelas.js
 * Manajemen kelas dan pengajar.
 *
 * GET /api/eob5/kelas/list        — daftar semua kelas (dari data siswa + eob5_kelas_guru)
 * GET /api/eob5/kelas/:id/siswa   — siswa di kelas tertentu
 * GET /api/eob5/kelas/:id/guru    — guru yang mengajar kelas ini
 * POST /api/eob5/kelas/assign     — assign guru ke kelas + mapel
 * DELETE /api/eob5/kelas/assign/:id — hapus assignment
 */

import express from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = express.Router()

// GET /list — daftar semua kelas yang ada (dari students + kelas_guru)
router.get('/list', requireGuru, async (req, res) => {
  try {
    const [kelasStudentsRes, kelasGuruRes] = await Promise.all([
      pool.query('SELECT DISTINCT kelas FROM students WHERE kelas IS NOT NULL ORDER BY kelas'),
      pool.query('SELECT DISTINCT kelas FROM eob5_kelas_guru ORDER BY kelas'),
    ])

    const kelasSet = new Set()
    for (const r of kelasStudentsRes.rows) kelasSet.add(r.kelas)
    for (const r of kelasGuruRes.rows) kelasSet.add(r.kelas)

    const kelasList = [...kelasSet].sort()

    // Hitung jumlah siswa per kelas
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

// GET /:id/siswa — siswa di kelas tertentu
// :id adalah nama kelas (URL-encoded), mis. "VIII%20Ibnu%20Sina"
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

// GET /:id/guru — guru yang mengajar kelas ini
router.get('/:id/guru', requireGuru, async (req, res) => {
  try {
    const kelas = decodeURIComponent(req.params.id)
    const { rows } = await pool.query(
      `SELECT kg.id, kg.guru_id, kg.kelas, kg.mata_pelajaran, kg.tahun_ajaran,
              g.name AS guru_name, g.username AS guru_username, g.jabatan
       FROM eob5_kelas_guru kg
       JOIN gurus g ON g.id = kg.guru_id
       WHERE kg.kelas = $1
       ORDER BY kg.mata_pelajaran`,
      [kelas]
    )
    res.json({ kelas, guru: rows })
  } catch (err) {
    console.error('[eob5/kelas] guru error:', err)
    res.status(500).json({ error: 'Gagal memuat guru kelas' })
  }
})

// POST /assign — assign guru ke kelas + mata pelajaran
router.post('/assign', requireGuru, async (req, res) => {
  try {
    const { guru_id, kelas, mata_pelajaran, tahun_ajaran } = req.body || {}
    if (!guru_id || !kelas) {
      return res.status(400).json({ error: 'guru_id dan kelas wajib diisi' })
    }

    // Validasi guru ada
    const guruRes = await pool.query('SELECT id FROM gurus WHERE id = $1', [guru_id])
    if (guruRes.rowCount === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' })

    const { rows } = await pool.query(
      `INSERT INTO eob5_kelas_guru (guru_id, kelas, mata_pelajaran, tahun_ajaran)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (guru_id, kelas, mata_pelajaran)
       DO UPDATE SET tahun_ajaran = EXCLUDED.tahun_ajaran
       RETURNING *`,
      [guru_id, kelas, mata_pelajaran || null, tahun_ajaran || null]
    )

    // Sync: tambahkan kelas ke kelas_diampu guru jika belum ada
    await pool.query(
      `UPDATE gurus SET kelas_diampu = array_append(kelas_diampu, $2)
       WHERE id = $1 AND NOT ($2 = ANY(kelas_diampu))`,
      [guru_id, kelas]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/kelas] assign error:', err)
    res.status(500).json({ error: 'Gagal menetapkan guru ke kelas' })
  }
})

// DELETE /assign/:id — hapus assignment guru-kelas
router.delete('/assign/:id', requireGuru, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM eob5_kelas_guru WHERE id = $1 RETURNING *',
      [req.params.id]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Assignment tidak ditemukan' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[eob5/kelas] hapus assign error:', err)
    res.status(500).json({ error: 'Gagal menghapus assignment' })
  }
})

export default router
