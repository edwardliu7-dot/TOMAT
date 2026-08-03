/**
 * server/eob5/jadwal.js
 * CRUD jadwal pelajaran dan kalender akademik.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/jadwal — jadwal pelajaran
// Membaca dari dua sumber:
//   1. schedules  — tabel app lama gurueob5 (teacher_id, subject_id UUID)
//   2. jadwal     — tabel SMARTISA untuk entri baru (guru_id, mata_pelajaran text)
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.query

    let kelasFilter = ''
    const params = [guruId]
    if (kelas) {
      params.push(kelas)
      kelasFilter = `AND kelas = $${params.length}`
    }

    const { rows } = await pool.query(`
      -- Data lama dari schedules (app gurueob5)
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

      UNION ALL

      -- Entri baru dari SMARTISA
      SELECT
        id::text,
        guru_id,
        kelas,
        mata_pelajaran,
        hari,
        jam_mulai::text,
        jam_selesai::text,
        ruangan,
        tahun_ajaran,
        NULL AS subject_id,
        'jadwal' AS source_table
      FROM jadwal
      WHERE guru_id = $1 ${kelasFilter}

      ORDER BY hari, jam_mulai
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data jadwal' })
  }
})

// POST /api/eob5/jadwal — input jadwal
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, tahun_ajaran } = req.body

    if (!kelas || !mata_pelajaran || !hari || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ error: 'Data tidak lengkap: kelas, mata_pelajaran, hari, jam_mulai, jam_selesai wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO jadwal (guru_id, kelas, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, tahun_ajaran)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [guruId, kelas, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, tahun_ajaran])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan jadwal' })
  }
})

// PUT /api/eob5/jadwal/:id — update jadwal
router.put('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { kelas, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, tahun_ajaran } = req.body

    const { rows } = await pool.query(`
      UPDATE jadwal
      SET kelas          = COALESCE($1, kelas),
          mata_pelajaran = COALESCE($2, mata_pelajaran),
          hari           = COALESCE($3, hari),
          jam_mulai      = COALESCE($4, jam_mulai),
          jam_selesai    = COALESCE($5, jam_selesai),
          ruangan        = COALESCE($6, ruangan),
          tahun_ajaran   = COALESCE($7, tahun_ajaran)
      WHERE id = $8 AND guru_id = $9
      RETURNING *
    `, [kelas, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, tahun_ajaran, id, guruId])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengupdate jadwal' })
  }
})

// GET /api/eob5/kalender-akademik — kalender akademik
router.get('/kalender-akademik', requireGuru, async (req, res) => {
  try {
    const { tahun_ajaran } = req.query
    const conditions = []
    const params = []
    let idx = 1

    if (tahun_ajaran) {
      conditions.push(`tahun_ajaran = $${idx++}`)
      params.push(tahun_ajaran)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const { rows } = await pool.query(`
      SELECT * FROM kalender_akademik
      ${where}
      ORDER BY tanggal_mulai
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil kalender akademik' })
  }
})

// POST /api/eob5/kalender-akademik — tambah event kalender
router.post('/kalender-akademik', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { judul, deskripsi, tanggal_mulai, tanggal_selesai, tipe, tahun_ajaran } = req.body

    if (!judul || !tanggal_mulai) {
      return res.status(400).json({ error: 'Judul dan tanggal mulai wajib diisi' })
    }

    const { rows } = await pool.query(`
      INSERT INTO kalender_akademik (guru_id, judul, deskripsi, tanggal_mulai, tanggal_selesai, tipe, tahun_ajaran)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [guruId, judul, deskripsi, tanggal_mulai, tanggal_selesai, tipe, tahun_ajaran])

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menyimpan event kalender' })
  }
})

// GET /api/eob5/info-pekanan — info mingguan
router.get('/info-pekanan', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.query

    const conditions = ['guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (kelas) {
      conditions.push(`kelas = $${idx++}`)
      params.push(kelas)
    }

    const { rows } = await pool.query(`
      SELECT * FROM info_pekanan
      WHERE ${conditions.join(' AND ')}
      ORDER BY minggu_ke DESC
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil info pekanan' })
  }
})

export default router
