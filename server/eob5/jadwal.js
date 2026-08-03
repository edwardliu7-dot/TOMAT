/**
 * server/eob5/jadwal.js
 * Jadwal pelajaran dan kalender akademik.
 * - Jadwal: hanya baca dari `schedules` (tabel lama app GuruEOB5). Tabel `jadwal` sudah di-DROP.
 * - Kalender: tabel `kalender_akademik` sudah di-DROP. Endpoint kalender-akademik dikembalikan kosong.
 * - Info pekanan: ditangani oleh server/eob5/info-pekanan.js
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/jadwal — hanya dari schedules (tabel lama)
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.query

    const params = [guruId]
    let kelasFilter = ''
    if (kelas) {
      params.push(kelas)
      kelasFilter = `AND sc.kelas = $${params.length}`
    }

    const { rows } = await pool.query(`
      SELECT
        sc.id::text            AS id,
        sc.teacher_id          AS guru_id,
        sc.kelas,
        COALESCE(sub.name, '') AS mata_pelajaran,
        sc.hari,
        sc.jam_mulai::text     AS jam_mulai,
        sc.jam_selesai::text   AS jam_selesai,
        NULL                   AS ruangan,
        NULL                   AS tahun_ajaran,
        sc.subject_id::text    AS subject_id,
        'schedules'            AS source_table
      FROM schedules sc
      LEFT JOIN subjects sub ON sub.id = sc.subject_id
      WHERE sc.teacher_id = $1 ${kelasFilter}
      ORDER BY sc.hari, sc.jam_mulai
    `, params)

    res.json(rows)
  } catch (err) {
    console.error('[eob5/jadwal] get error:', err)
    res.status(500).json({ error: 'Gagal mengambil data jadwal' })
  }
})

// POST /api/eob5/jadwal — jadwal baru diinput langsung ke schedules
// schedules.subject_id adalah UUID — cari dari subjects berdasarkan nama mapel
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, hari, jam_mulai, jam_selesai } = req.body

    if (!kelas || !mata_pelajaran || !hari || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ error: 'kelas, mata_pelajaran, hari, jam_mulai, jam_selesai wajib diisi' })
    }

    // Cari subject_id dari subjects milik guru ini
    const subRes = await pool.query(
      `SELECT id FROM subjects WHERE teacher_id = $1 AND name ILIKE $2 AND deleted_at IS NULL LIMIT 1`,
      [guruId, mata_pelajaran]
    )
    if (!subRes.rows.length) {
      return res.status(400).json({ error: `Mata pelajaran "${mata_pelajaran}" tidak ditemukan di daftar subjects Anda. Tambahkan dulu di menu Mata Pelajaran.` })
    }
    const subjectId = subRes.rows[0].id

    const { rows } = await pool.query(`
      INSERT INTO schedules (teacher_id, subject_id, kelas, hari, jam_mulai, jam_selesai)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id::text, teacher_id AS guru_id, kelas, hari, jam_mulai::text, jam_selesai::text
    `, [guruId, subjectId, kelas, hari, jam_mulai, jam_selesai])

    res.status(201).json({ ...rows[0], mata_pelajaran, source_table: 'schedules' })
  } catch (err) {
    console.error('[eob5/jadwal] post error:', err)
    res.status(500).json({ error: 'Gagal menyimpan jadwal' })
  }
})

// DELETE /api/eob5/jadwal/:id — hapus dari schedules
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { rowCount } = await pool.query(
      `DELETE FROM schedules WHERE id = $1::uuid AND teacher_id = $2`,
      [req.params.id, guruId]
    )
    if (!rowCount) return res.status(404).json({ error: 'Jadwal tidak ditemukan' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[eob5/jadwal] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus jadwal' })
  }
})

// GET /api/eob5/kalender-akademik — kalender_akademik sudah di-DROP, kembalikan kosong
router.get('/kalender-akademik', requireGuru, async (req, res) => {
  res.json([])
})

// POST /api/eob5/kalender-akademik — belum tersedia
router.post('/kalender-akademik', requireGuru, async (req, res) => {
  res.status(503).json({ error: 'Fitur kalender akademik belum tersedia di versi ini' })
})

// GET /api/eob5/info-pekanan — ditangani oleh info-pekanan.js, tapi jaga compat di sini
router.get('/info-pekanan', requireGuru, async (req, res) => {
  res.json([])
})

export default router
