/**
 * server/eob5/attendance.js
 * Manajemen absensi harian — versi lengkap dengan bulk-mixed & bulk-delete.
 * Menggantikan absensi.js (router lama dialihkan ke sini via alias di index.js).
 *
 * GET  /api/eob5/attendance              — daftar (filter: kelas, date, bulan, tahun)
 * POST /api/eob5/attendance              — upsert satu siswa
 * POST /api/eob5/attendance/bulk         — bulk upsert satu status untuk banyak siswa
 * POST /api/eob5/attendance/bulk-mixed   — bulk upsert satu kelas, status berbeda per siswa
 * PATCH /api/eob5/attendance/:id         — update satu record
 * GET  /api/eob5/attendance/rekap        — rekap per siswa/kelas
 * DELETE /api/eob5/attendance/bulk-kelas — hapus semua absensi kelas + tanggal tertentu
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()
const STATUS_VALID = ['hadir', 'sakit', 'izin', 'alpha', 'alpa']

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// Ambil IDs siswa dari kelas yang diampu guru ini
async function getStudentIds(guruId, kelas) {
  const { rows: guruRow } = await pool.query(
    'SELECT kelas_diampu FROM gurus WHERE id = $1', [guruId]
  )
  if (!guruRow.length) return []
  const diampu = guruRow[0].kelas_diampu || []
  if (kelas) {
    if (!diampu.includes(kelas)) return []
    const { rows } = await pool.query('SELECT id FROM students WHERE kelas = $1', [kelas])
    return rows.map(r => r.id)
  }
  if (!diampu.length) return []
  const { rows } = await pool.query(
    'SELECT id FROM students WHERE kelas = ANY($1::text[])', [diampu]
  )
  return rows.map(r => r.id)
}

// GET /rekap — harus sebelum GET /:id
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const { kelas, bulan, tahun } = req.query
    const params = []
    const conditions = []

    if (kelas) { params.push(kelas); conditions.push(`s.kelas = $${params.length}`) }
    if (tahun && bulan) {
      params.push(parseInt(tahun)); params.push(parseInt(bulan))
      conditions.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length - 1}`)
      conditions.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.kelas, s.username,
              COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
              COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
              COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
              COUNT(*) FILTER (WHERE a.status IN ('alpha','alpa')) AS alpha,
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
    console.error('[eob5/attendance] rekap error:', err)
    res.status(500).json({ error: 'Gagal memuat rekap absensi' })
  }
})

// GET / — daftar absensi
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, date, tanggal, bulan, tahun, student_id } = req.query
    const actualDate = date || tanggal

    const params = [guruId]
    const conditions = ['a.guru_id = $1']

    if (kelas) { params.push(kelas); conditions.push(`s.kelas = $${params.length}`) }
    if (actualDate) { params.push(actualDate); conditions.push(`a.tanggal = $${params.length}`) }
    if (tahun && bulan) {
      params.push(parseInt(tahun)); params.push(parseInt(bulan))
      conditions.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length - 1}`)
      conditions.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
    }
    if (student_id) { params.push(student_id); conditions.push(`a.student_id = $${params.length}`) }

    const { rows } = await pool.query(
      `SELECT a.id, a.student_id, a.tanggal, a.status, a.keterangan,
              s.name AS siswa_name, s.kelas, s.username
       FROM eob5_absensi a
       JOIN students s ON s.id = a.student_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.tanggal DESC, s.kelas, s.name`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/attendance] list error:', err)
    res.status(500).json({ error: 'Gagal memuat absensi' })
  }
})

// POST / — upsert satu siswa
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, tanggal, status, keterangan } = req.body || {}

    if (!student_id || !tanggal || !status) {
      return res.status(400).json({ error: 'student_id, tanggal, dan status wajib diisi' })
    }
    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid: ${status}` })
    }

    const { rows } = await pool.query(
      `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, tanggal)
       DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan,
                     guru_id = EXCLUDED.guru_id
       RETURNING id, student_id, tanggal, status, keterangan`,
      [student_id, guruId, tanggal, status, keterangan || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/attendance] upsert error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi' })
  }
})

// POST /bulk — satu status, banyak siswa
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, student_ids, status, keterangan } = req.body || {}

    if (!tanggal || !Array.isArray(student_ids) || !student_ids.length || !status) {
      return res.status(400).json({ error: 'tanggal, student_ids[], dan status wajib diisi' })
    }
    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid: ${status}` })
    }

    const client = await pool.connect()
    const saved = []
    try {
      await client.query('BEGIN')
      for (const sid of student_ids) {
        const { rows } = await client.query(
          `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (student_id, tanggal) DO UPDATE
             SET status=$4, keterangan=$5, guru_id=$2
           RETURNING id, student_id, tanggal, status`,
          [sid, guruId, tanggal, status, keterangan || null]
        )
        saved.push(rows[0])
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ ok: true, jumlah: saved.length, absensi: saved })
  } catch (err) {
    console.error('[eob5/attendance] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi massal' })
  }
})

// POST /bulk-mixed — satu kelas, status berbeda per siswa (termasuk yang tidak hadir)
router.post('/bulk-mixed', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, kelas, absensi } = req.body || {}

    if (!tanggal || !Array.isArray(absensi) || !absensi.length) {
      return res.status(400).json({ error: 'tanggal dan array absensi wajib diisi' })
    }
    const invalid = absensi.find(a => !STATUS_VALID.includes(a.status))
    if (invalid) {
      return res.status(400).json({ error: `Status tidak valid: ${invalid.status}` })
    }

    const client = await pool.connect()
    const saved = []
    try {
      await client.query('BEGIN')
      for (const item of absensi) {
        const { rows } = await client.query(
          `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (student_id, tanggal) DO UPDATE
             SET status=EXCLUDED.status, keterangan=EXCLUDED.keterangan, guru_id=EXCLUDED.guru_id
           RETURNING id, student_id, tanggal, status`,
          [item.student_id, guruId, tanggal, item.status, item.keterangan || null]
        )
        saved.push(rows[0])
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
    res.json({ ok: true, tanggal, kelas: kelas || null, jumlah: saved.length, absensi: saved })
  } catch (err) {
    console.error('[eob5/attendance] bulk-mixed error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi' })
  }
})

// PATCH /:id — update satu record
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { status, keterangan } = req.body || {}

    if (status && !STATUS_VALID.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid: ${status}` })
    }

    const { rows } = await pool.query(
      `UPDATE eob5_absensi
       SET status     = COALESCE($1, status),
           keterangan = COALESCE($2, keterangan)
       WHERE id = $3 AND guru_id = $4
       RETURNING id, student_id, tanggal, status, keterangan`,
      [status || null, keterangan !== undefined ? keterangan : null, id, guruId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Record absensi tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/attendance] patch error:', err)
    res.status(500).json({ error: 'Gagal mengupdate absensi' })
  }
})

// DELETE /bulk-kelas — hapus semua absensi kelas + tanggal
router.delete('/bulk-kelas', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, tanggal } = req.body || {}

    if (!kelas || !tanggal) {
      return res.status(400).json({ error: 'kelas dan tanggal wajib diisi' })
    }

    const studentIds = await getStudentIds(guruId, kelas)
    if (!studentIds.length) {
      return res.json({ count: 0 })
    }

    const { rowCount } = await pool.query(
      `DELETE FROM eob5_absensi
       WHERE student_id = ANY($1::text[]) AND tanggal = $2`,
      [studentIds, tanggal]
    )
    res.json({ count: rowCount })
  } catch (err) {
    console.error('[eob5/attendance] bulk-kelas delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus absensi kelas' })
  }
})

export default router
