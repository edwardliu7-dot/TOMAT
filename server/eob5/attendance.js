/**
 * server/eob5/attendance.js
 * Manajemen absensi harian — membaca dan menulis ke tabel `absensi` (tabel lama app GuruEOB5).
 * JANGAN pakai attendance_records — tabel itu sudah di-DROP karena duplikat data.
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
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()
const STATUS_VALID = ['hadir', 'sakit', 'izin', 'alpa', 'alpha']

// Normalize status: simpan 'alpha' sebagai ejaan lama (backward compat)
function normalizeStatus(s) {
  if (s === 'alpa') return 'alpha'
  return s
}

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

async function getKelasDiampu(guruId, kelas) {
  const { rows } = await pool.query('SELECT kelas_diampu FROM gurus WHERE id = $1', [guruId])
  if (!rows.length) return []
  const diampu = rows[0].kelas_diampu || []
  if (!kelas) return diampu
  return diampu.includes(kelas) ? [kelas] : []
}

async function getStudentIds(guruId, kelas) {
  const kelasList = await getKelasDiampu(guruId, kelas)
  if (!kelasList.length) return []
  const { rows } = await pool.query(
    'SELECT id FROM students WHERE kelas = ANY($1::text[])', [kelasList]
  )
  return rows.map(r => r.id)
}

// GET /rekap
router.get('/rekap', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, bulan, tahun } = req.query

    const kelasList = await getKelasDiampu(guruId, kelas)
    if (!kelasList.length) return res.json([])

    const params = [kelasList]
    const extraConds = []

    if (tahun && bulan) {
      params.push(parseInt(tahun)); params.push(parseInt(bulan))
      extraConds.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length - 1}`)
      extraConds.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
    }
    const extraWhere = extraConds.length ? `AND ${extraConds.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.kelas, s.username,
              COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
              COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
              COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
              COUNT(*) FILTER (WHERE a.status IN ('alpha','alpa')) AS alpa,
              COUNT(a.id) AS total_tercatat
       FROM students s
       LEFT JOIN absensi a ON a.student_id = s.id ${extraWhere}
       WHERE s.kelas = ANY($1::text[])
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

// GET /
router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, date, tanggal, bulan, tahun, student_id } = req.query
    const actualDate = date || tanggal

    const kelasList = await getKelasDiampu(guruId, kelas)
    if (!kelasList.length) return res.json([])

    const params = [kelasList]
    const conditions = ['s.kelas = ANY($1::text[])']

    if (actualDate) {
      params.push(actualDate)
      conditions.push(`a.tanggal = $${params.length}`)
    } else {
      if (tahun) {
        params.push(parseInt(tahun))
        conditions.push(`EXTRACT(YEAR FROM a.tanggal) = $${params.length}`)
      }
      if (bulan) {
        params.push(parseInt(bulan))
        conditions.push(`EXTRACT(MONTH FROM a.tanggal) = $${params.length}`)
      }
    }
    if (student_id) {
      params.push(student_id)
      conditions.push(`s.id = $${params.length}`)
    }

    const { rows } = await pool.query(
      `SELECT a.id, a.student_id, a.tanggal, a.status, a.keterangan, a.created_at,
              a.guru_id AS filled_by_teacher_id,
              g.name    AS filled_by_teacher_name,
              s.name AS nama_siswa, s.kelas, s.username
       FROM absensi a
       JOIN students s ON s.id = a.student_id
       LEFT JOIN gurus g ON g.id = a.guru_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.tanggal DESC, s.name`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/attendance] get error:', err)
    res.status(500).json({ error: 'Gagal memuat data absensi' })
  }
})

// POST / — upsert satu siswa
router.post('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_id, tanggal, status, keterangan } = req.body

    if (!student_id || !status) {
      return res.status(400).json({ error: 'student_id dan status wajib diisi' })
    }
    const statusNorm = normalizeStatus(status)
    if (!STATUS_VALID.includes(statusNorm)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }

    const tanggalFinal = tanggal || getJakartaToday()
    const kelasList = await getKelasDiampu(guruId)
    const { rows: siswaRows } = await pool.query(
      'SELECT id FROM students WHERE id = $1 AND kelas = ANY($2::text[])',
      [student_id, kelasList]
    )
    if (!siswaRows.length) return res.status(403).json({ error: 'Siswa tidak dalam kelas Anda' })

    const { rows } = await pool.query(
      `INSERT INTO absensi (student_id, guru_id, tanggal, status, keterangan)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, tanggal)
       DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, guru_id = EXCLUDED.guru_id
       RETURNING id, student_id, tanggal, status, keterangan, created_at, guru_id AS filled_by_teacher_id`,
      [student_id, guruId, tanggalFinal, statusNorm, keterangan || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[eob5/attendance] post error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi' })
  }
})

// POST /bulk — satu status untuk banyak siswa
router.post('/bulk', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { student_ids, tanggal, status, keterangan } = req.body

    if (!Array.isArray(student_ids) || !student_ids.length || !status) {
      return res.status(400).json({ error: 'student_ids (array) dan status wajib diisi' })
    }
    const statusNorm = normalizeStatus(status)
    if (!STATUS_VALID.includes(statusNorm)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }

    const tanggalFinal = tanggal || getJakartaToday()
    const kelasList = await getKelasDiampu(guruId)
    const { rows: valid } = await pool.query(
      'SELECT id FROM students WHERE id = ANY($1::text[]) AND kelas = ANY($2::text[])',
      [student_ids, kelasList]
    )
    const validIds = valid.map(r => r.id)
    if (!validIds.length) return res.status(403).json({ error: 'Tidak ada siswa valid' })

    let inserted = 0
    for (const sid of validIds) {
      await pool.query(
        `INSERT INTO absensi (student_id, guru_id, tanggal, status, keterangan)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, tanggal)
         DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, guru_id = EXCLUDED.guru_id`,
        [sid, guruId, tanggalFinal, statusNorm, keterangan || null]
      )
      inserted++
    }
    res.status(201).json({ count: inserted })
  } catch (err) {
    console.error('[eob5/attendance] bulk error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi bulk' })
  }
})

// POST /bulk-mixed — status berbeda per siswa
router.post('/bulk-mixed', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { tanggal, records } = req.body // records: [{student_id, status, keterangan}]

    if (!Array.isArray(records) || !records.length) {
      return res.status(400).json({ error: 'records (array) wajib diisi' })
    }

    const tanggalFinal = tanggal || getJakartaToday()
    const kelasList = await getKelasDiampu(guruId)
    const studentIds = records.map(r => r.student_id)
    const { rows: valid } = await pool.query(
      'SELECT id FROM students WHERE id = ANY($1::text[]) AND kelas = ANY($2::text[])',
      [studentIds, kelasList]
    )
    const validSet = new Set(valid.map(r => r.id))

    let inserted = 0
    for (const rec of records) {
      if (!validSet.has(rec.student_id)) continue
      const statusNorm = normalizeStatus(rec.status)
      if (!STATUS_VALID.includes(statusNorm)) continue
      await pool.query(
        `INSERT INTO absensi (student_id, guru_id, tanggal, status, keterangan)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, tanggal)
         DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, guru_id = EXCLUDED.guru_id`,
        [rec.student_id, guruId, tanggalFinal, statusNorm, rec.keterangan || null]
      )
      inserted++
    }
    res.status(201).json({ count: inserted })
  } catch (err) {
    console.error('[eob5/attendance] bulk-mixed error:', err)
    res.status(500).json({ error: 'Gagal menyimpan absensi bulk-mixed' })
  }
})

// PATCH /:id
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const { status, keterangan } = req.body

    const kelasList = await getKelasDiampu(guruId)
    if (!kelasList.length) return res.status(404).json({ error: 'Record absensi tidak ditemukan' })

    const statusNorm = status ? normalizeStatus(status) : null

    const { rows } = await pool.query(
      `UPDATE absensi a
       SET status     = COALESCE($1, a.status),
           keterangan = COALESCE($2, a.keterangan),
           guru_id    = $3
       FROM students s
       WHERE a.id = $4
         AND a.student_id = s.id
         AND s.kelas = ANY($5::text[])
       RETURNING a.id, a.student_id, a.tanggal, a.status, a.keterangan`,
      [statusNorm, keterangan !== undefined ? keterangan : null, guruId, id, kelasList]
    )
    if (!rows.length) return res.status(404).json({ error: 'Record absensi tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/attendance] patch error:', err)
    res.status(500).json({ error: 'Gagal mengupdate absensi' })
  }
})

// DELETE /bulk-kelas
router.delete('/bulk-kelas', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas, tanggal } = req.body || {}

    if (!kelas || !tanggal) {
      return res.status(400).json({ error: 'kelas dan tanggal wajib diisi' })
    }

    const studentIds = await getStudentIds(guruId, kelas)
    if (!studentIds.length) return res.json({ count: 0 })

    const { rowCount } = await pool.query(
      `DELETE FROM absensi
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
