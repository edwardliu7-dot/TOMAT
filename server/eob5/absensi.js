/**
 * server/eob5/absensi.js
 * Manajemen absensi harian siswa.
 *
 * GET  /api/eob5/absensi           — daftar absensi (filter: kelas, tanggal, bulan)
 * POST /api/eob5/absensi           — input/update absensi satu siswa
 * POST /api/eob5/absensi/bulk      — input absensi satu kelas sekaligus
 * GET  /api/eob5/absensi/hari-ini  — absensi hari ini
 * GET  /api/eob5/absensi/rekap     — rekap absensi per siswa/kelas
 */

import express from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = express.Router()

const STATUS_VALID = ['hadir', 'sakit', 'izin', 'alpha']

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// GET /hari-ini — absensi hari ini per kelas yang diampu guru
router.get('/hari-ini', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.query
    const today = getJakartaToday()

    const params = [guruId, today]
    let kelasFilter = ''
    if (kelas) {
      params.push(kelas)
      kelasFilter = `AND s.kelas = $${params.length}`
    }

    const { rows } = await pool.query(
      `SELECT a.id, a.student_id, a.tanggal, a.status, a.keterangan,
              s.name AS siswa_name, s.kelas, s.username
       FROM eob5_absensi a
       JOIN students s ON s.id = a.student_id
       WHERE a.guru_id = $1 AND a.tanggal = $2 ${kelasFilter}
       ORDER BY s.kelas, s.name`,
      params
    )

    res.json({ tanggal: today, absensi: rows })
  } catch (err) {
    console.error('[eob5/absensi] hari-ini error:', err)
    res.status(500).json({ error: 'Gagal memuat absensi hari ini' })
  }
})

// GET /rekap — rekap absensi per siswa/kelas
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const { kelas, bulan, tahun } = req.query

    const params = []
    const conditions = []

    if (kelas) {
      params.push(kelas)
      conditions.push(`s.kelas = $${params.length}`)
    }

    if (tahun && bulan) {
      params.push(parseInt(tahun))
      params.push(parseInt(bulan))
      conditions.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length - 1}`)
      conditions.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.kelas, s.username,
              COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
              COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
              COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
              COUNT(*) FILTER (WHERE a.status = 'alpha') AS alpha,
              COUNT(a.id) AS total_tercatat
       FROM students s
       LEFT JOIN eob5_absensi a ON a.student_id = s.id
       ${where}
       GROUP BY s.id, s.name, s.kelas, s.username
       ORDER BY s.kelas, s.name`,
      params
    )

    res.json(rows)
  } catch (err) {
    console.error('[eob5/absensi] rekap error:', err)
    res.status(500).json({ error: 'Gagal memuat rekap absensi' })
  }
})

// GET / — daftar absensi dengan filter
router.get('/', requireGuru, async (req, res) => {
  try {
    const { kelas, tanggal, bulan, tahun, student_id } = req.query

    const params = []
    const conditions = []

    if (kelas) {
      params.push(kelas)
      conditions.push(`s.kelas = $${params.length}`)
    }
    if (tanggal) {
      params.push(tanggal)
      conditions.push(`a.tanggal = $${params.length}`)
    }
    if (tahun && bulan) {
      params.push(parseInt(tahun))
      params.push(parseInt(bulan))
      conditions.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length - 1}`)
      conditions.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
    }
    if (student_id) {
      params.push(student_id)
      conditions.push(`a.student_id = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT a.id, a.student_id, a.tanggal, a.status, a.keterangan,
              a.guru_id, a.created_at,
              s.name AS siswa_name, s.kelas
       FROM eob5_absensi a
       JOIN students s ON s.id = a.student_id
       ${where}
       ORDER BY a.tanggal DESC, s.name
       LIMIT 500`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/absensi] list error:', err)
    res.status(500).json({ error: 'Gagal memuat data absensi' })
  }
})

// POST / — input/update absensi satu siswa (upsert by student+tanggal)
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, tanggal, status, keterangan } = req.body || {}

    if (!student_id || !tanggal || !status) {
      return res.status(400).json({ error: 'student_id, tanggal, dan status wajib diisi' })
    }
    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid. Gunakan: ${STATUS_VALID.join(', ')}` })
    }

    // Validasi siswa ada
    const siswaRes = await pool.query('SELECT id FROM students WHERE id = $1', [student_id])
    if (siswaRes.rowCount === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' })

    const { rows } = await pool.query(
      `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, tanggal)
       DO UPDATE SET
         status      = EXCLUDED.status,
         keterangan  = EXCLUDED.keterangan,
         guru_id     = EXCLUDED.guru_id
       RETURNING *`,
      [student_id, guruId, tanggal, status, keterangan || null]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/absensi] input error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi' })
  }
})

// POST /bulk — input absensi satu kelas sekaligus
// Body: { tanggal, kelas, absensi: [{ student_id, status, keterangan }] }
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, kelas, absensi } = req.body || {}

    if (!tanggal || !Array.isArray(absensi) || absensi.length === 0) {
      return res.status(400).json({ error: 'tanggal dan array absensi wajib diisi' })
    }

    const invalid = absensi.find(a => !STATUS_VALID.includes(a.status))
    if (invalid) {
      return res.status(400).json({ error: `Status tidak valid: ${invalid.status}` })
    }

    // Upsert semua sekaligus dalam satu transaksi
    const client = await pool.connect()
    const saved = []
    try {
      await client.query('BEGIN')
      for (const item of absensi) {
        const { rows } = await client.query(
          `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, tanggal)
           DO UPDATE SET
             status     = EXCLUDED.status,
             keterangan = EXCLUDED.keterangan,
             guru_id    = EXCLUDED.guru_id
           RETURNING id, student_id, tanggal, status`,
          [item.student_id, guruId, tanggal, item.status, item.keterangan || null]
        )
        saved.push(rows[0])
      }
      await client.query('COMMIT')
    } catch (innerErr) {
      await client.query('ROLLBACK')
      throw innerErr
    } finally {
      client.release()
    }

    res.json({ ok: true, tanggal, kelas: kelas || null, jumlah: saved.length, absensi: saved })
  } catch (err) {
    console.error('[eob5/absensi] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi massal' })
  }
})

export default router
