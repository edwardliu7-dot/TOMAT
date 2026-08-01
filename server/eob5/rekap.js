/**
 * server/eob5/rekap.js
 * Endpoint rekap — nilai + absensi, per kelas/siswa/guru/periode.
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/rekap/kelas/:kelas — rekap lengkap satu kelas (nilai + absensi)
router.get('/kelas/:kelas', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.params
    const { semester, tahun_ajaran } = req.query

    // Rekap nilai
    const nilaiConditions = ['n.guru_id = $1', 's.kelas = $2']
    const nilaiParams = [guruId, kelas]
    let idx = 3

    if (semester) {
      nilaiConditions.push(`n.semester = $${idx++}`)
      nilaiParams.push(semester)
    }
    if (tahun_ajaran) {
      nilaiConditions.push(`n.tahun_ajaran = $${idx++}`)
      nilaiParams.push(tahun_ajaran)
    }

    const { rows: nilaiRows } = await pool.query(`
      SELECT
        s.id AS student_id,
        s.name AS nama_siswa,
        n.mata_pelajaran,
        n.jenis_nilai,
        AVG(n.nilai) AS rata_rata,
        COUNT(*) AS jumlah_penilaian
      FROM eob5_nilai_akademik n
      JOIN students s ON s.id = n.student_id
      WHERE ${nilaiConditions.join(' AND ')}
      GROUP BY s.id, s.name, n.mata_pelajaran, n.jenis_nilai
      ORDER BY s.name, n.mata_pelajaran
    `, nilaiParams)

    // Rekap absensi
    const absensiConditions = ['a.guru_id = $1', 'a.kelas = $2']
    const absensiParams = [guruId, kelas]

    const { rows: absensiRows } = await pool.query(`
      SELECT
        a.student_id,
        s.name AS nama_siswa,
        COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE a.status = 'izin') AS izin,
        COUNT(*) FILTER (WHERE a.status = 'alpha') AS alpha,
        COUNT(*) AS total_pertemuan
      FROM eob5_absensi a
      JOIN students s ON s.id = a.student_id
      WHERE ${absensiConditions.join(' AND ')}
      GROUP BY a.student_id, s.name
      ORDER BY s.name
    `, absensiParams)

    res.json({ kelas, nilai: nilaiRows, absensi: absensiRows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap kelas' })
  }
})

// GET /api/eob5/rekap/siswa/:id — rekap lengkap satu siswa
router.get('/siswa/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id: studentId } = req.params

    // Info siswa
    const { rows: siswaRows } = await pool.query(
      'SELECT id, name, kelas FROM students WHERE id = $1',
      [studentId]
    )
    if (siswaRows.length === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    // Nilai
    const { rows: nilaiRows } = await pool.query(`
      SELECT mata_pelajaran, jenis_nilai, nilai, semester, tahun_ajaran, keterangan, created_at
      FROM eob5_nilai_akademik
      WHERE student_id = $1 AND guru_id = $2
      ORDER BY created_at DESC
    `, [studentId, guruId])

    // Absensi
    const { rows: absensiRows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE status = 'izin') AS izin,
        COUNT(*) FILTER (WHERE status = 'alpha') AS alpha,
        COUNT(*) AS total
      FROM eob5_absensi
      WHERE student_id = $1 AND guru_id = $2
    `, [studentId, guruId])

    res.json({
      siswa: siswaRows[0],
      nilai: nilaiRows,
      absensi: absensiRows[0],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap siswa' })
  }
})

// GET /api/eob5/rekap/guru/:id — rekap aktivitas guru
router.get('/guru/:id', requireGuru, async (req, res) => {
  try {
    const { id: targetGuruId } = req.params
    // Guru hanya bisa lihat rekap dirinya sendiri
    const guruId = req.session.user.id
    if (targetGuruId !== guruId) {
      return res.status(403).json({ error: 'Tidak dapat melihat rekap guru lain' })
    }

    const [nilaiRes, absensiRes, materiRes, jadwalRes] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) AS total_nilai FROM eob5_nilai_akademik WHERE guru_id = $1',
        [guruId]
      ),
      pool.query(
        'SELECT COUNT(*) AS total_sesi FROM eob5_absensi WHERE guru_id = $1',
        [guruId]
      ),
      pool.query(
        'SELECT COUNT(*) AS total_materi FROM eob5_materi WHERE guru_id = $1',
        [guruId]
      ),
      pool.query(
        'SELECT COUNT(*) AS total_jadwal FROM eob5_jadwal WHERE guru_id = $1',
        [guruId]
      ),
    ])

    res.json({
      guru_id: guruId,
      total_nilai: parseInt(nilaiRes.rows[0].total_nilai),
      total_sesi_absensi: parseInt(absensiRes.rows[0].total_sesi),
      total_materi: parseInt(materiRes.rows[0].total_materi),
      total_jadwal: parseInt(jadwalRes.rows[0].total_jadwal),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap guru' })
  }
})

// GET /api/eob5/rekap/periode — rekap per periode/semester
router.get('/periode', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { semester, tahun_ajaran } = req.query

    const conditions = ['guru_id = $1']
    const params = [guruId]
    let idx = 2

    if (semester) {
      conditions.push(`semester = $${idx++}`)
      params.push(semester)
    }
    if (tahun_ajaran) {
      conditions.push(`tahun_ajaran = $${idx++}`)
      params.push(tahun_ajaran)
    }

    const { rows } = await pool.query(`
      SELECT
        semester,
        tahun_ajaran,
        mata_pelajaran,
        COUNT(DISTINCT student_id) AS jumlah_siswa,
        COUNT(*) AS jumlah_penilaian,
        AVG(nilai) AS rata_rata_kelas
      FROM eob5_nilai_akademik
      WHERE ${conditions.join(' AND ')}
      GROUP BY semester, tahun_ajaran, mata_pelajaran
      ORDER BY tahun_ajaran DESC, semester, mata_pelajaran
    `, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil rekap periode' })
  }
})

// GET /api/eob5/rekap/absensi-chart — data absensi bulanan per kelas (untuk chart)
router.get('/absensi-chart', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(a.tanggal, 'YYYY-MM') AS bulan,
        s.kelas,
        COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
        COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE a.status = 'alpha') AS alpa,
        COUNT(*)                                    AS total
      FROM eob5_absensi a
      JOIN students s ON s.id = a.student_id
      GROUP BY bulan, s.kelas
      ORDER BY bulan, s.kelas
    `)

    const data = rows.map(r => ({
      bulan:  r.bulan,
      kelas:  r.kelas,
      hadir:  parseInt(r.hadir)  || 0,
      izin:   parseInt(r.izin)   || 0,
      sakit:  parseInt(r.sakit)  || 0,
      alpa:   parseInt(r.alpa)   || 0,
      total:  parseInt(r.total)  || 0,
    }))

    const kelasOptions = [...new Set(data.map(d => d.kelas))].sort((a,b) => a.localeCompare(b,'id'))

    res.json({ data, kelasOptions })
  } catch (err) {
    console.error('[rekap/absensi-chart]', err)
    res.status(500).json({ error: 'Gagal memuat data absensi chart' })
  }
})

// GET /api/eob5/rekap/nilai-chart — nilai per mapel per kelas (untuk chart cards)
router.get('/nilai-chart', requireGuru, async (req, res) => {
  try {
    // Aggregate per subject + kelas
    const { rows } = await pool.query(`
      SELECT
        n.mata_pelajaran   AS "subjectName",
        s.kelas,
        ROUND(AVG(n.nilai)::numeric, 2)   AS "rataRata",
        MIN(n.nilai)                       AS "nilaiMin",
        MAX(n.nilai)                       AS "nilaiMax",
        COUNT(*)                           AS "jumlahNilai",
        -- simplified distribusi: bucket by 10s
        JSON_AGG(JSON_BUILD_OBJECT('range', CONCAT(FLOOR(n.nilai/10)*10,'-',FLOOR(n.nilai/10)*10+9), 'jumlah', 1) ORDER BY n.nilai) AS raw
      FROM eob5_nilai_akademik n
      JOIN students s ON s.id = n.student_id
      GROUP BY n.mata_pelajaran, s.kelas
      ORDER BY s.kelas, n.mata_pelajaran
    `)

    const subjects = rows.map((r, idx) => {
      // Build distribusi buckets
      const buckets = {}
      for (const item of (r.raw || [])) {
        const range = item.range
        if (!buckets[range]) buckets[range] = { range, jumlah: 0 }
        buckets[range].jumlah++
      }
      const distribusi = Object.values(buckets).sort((a,b) => {
        const aNum = parseInt(a.range)
        const bNum = parseInt(b.range)
        return aNum - bNum
      })
      return {
        subjectId:   idx + 1,
        subjectName: r.subjectName,
        kelas:       r.kelas,
        rataRata:    r.rataRata != null ? parseFloat(r.rataRata) : null,
        nilaiMin:    r.nilaiMin != null ? parseFloat(r.nilaiMin) : null,
        nilaiMax:    r.nilaiMax != null ? parseFloat(r.nilaiMax) : null,
        jumlahNilai: parseInt(r.jumlahNilai) || 0,
        distribusi,
      }
    })

    const kelasOptions = [...new Set(subjects.map(s => s.kelas))].sort((a,b) => a.localeCompare(b,'id'))
    res.json({ subjects, kelasOptions })
  } catch (err) {
    console.error('[rekap/nilai-chart]', err)
    res.status(500).json({ error: 'Gagal memuat data nilai chart' })
  }
})

export default router
