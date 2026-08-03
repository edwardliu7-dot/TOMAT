/**
 * server/eob5/rekap.js
 * Endpoint rekap — nilai + absensi, per kelas/siswa/guru/periode.
 */

import { Router } from 'express'
import { guardedPool as pool } from './lib/db-guard.js'
import { requireGuru } from './middleware.js'

const router = Router()

// GET /api/eob5/rekap/kelas/:kelas — rekap lengkap satu kelas (nilai + absensi)
router.get('/kelas/:kelas', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { kelas } = req.params
    const { semester, tahun_ajaran } = req.query

    // Rekap nilai
    // Nilai dari tabel grades (app lama gurueob5)
    const nilaiConditions = ['g.guru_id = $1', 's.kelas = $2']
    const nilaiParams = [guruId, kelas]

    const { rows: nilaiRows } = await pool.query(`
      SELECT
        s.id AS student_id,
        s.name AS nama_siswa,
        COALESCE(sub.name, g.jenis) AS mata_pelajaran,
        g.jenis AS jenis_nilai,
        AVG(g.nilai) AS rata_rata,
        COUNT(*) AS jumlah_penilaian
      FROM grades g
      JOIN students s ON s.id = g.student_id::text
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE ${nilaiConditions.join(' AND ')}
      GROUP BY s.id, s.name, sub.name, g.jenis
      ORDER BY s.name, sub.name
    `, nilaiParams)

    // Absensi dari tabel absensi (app lama gurueob5); status 'alpha' = 'alpa'
    const { rows: absensiRows } = await pool.query(`
      SELECT
        s.id AS student_id,
        s.name AS nama_siswa,
        COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
        COUNT(*) FILTER (WHERE a.status IN ('alpha','alpa')) AS alpa,
        COUNT(a.id) AS total_pertemuan
      FROM students s
      LEFT JOIN absensi a ON a.student_id = s.id
      WHERE s.kelas = $1
      GROUP BY s.id, s.name
      ORDER BY s.name
    `, [kelas])

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

    // Nilai dari tabel grades (app lama gurueob5)
    const { rows: nilaiRows } = await pool.query(`
      SELECT
        COALESCE(sub.name, g.jenis) AS mata_pelajaran,
        g.jenis AS jenis_nilai,
        g.nilai, g.keterangan, g.created_at
      FROM grades g
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE g.student_id::text = $1 AND g.guru_id = $2
      ORDER BY g.created_at DESC
    `, [studentId, guruId])

    // Absensi dari tabel absensi (app lama gurueob5)
    const { rows: absensiRows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE status = 'izin')  AS izin,
        COUNT(*) FILTER (WHERE status IN ('alpha','alpa')) AS alpa,
        COUNT(*) AS total
      FROM absensi
      WHERE student_id = $1
    `, [studentId])

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
      // Nilai dari tabel grades (app lama gurueob5), bukan nilai_akademik (kosong)
      pool.query(
        'SELECT COUNT(*) AS total_nilai FROM grades WHERE guru_id = $1',
        [guruId]
      ),
      pool.query(
        'SELECT COUNT(*) AS total_sesi FROM absensi WHERE guru_id = $1',
        [guruId]
      ),
      // Materi: gunakan bahan_ajar (tabel yang ada) — materi sudah di-DROP
      pool.query(
        'SELECT COUNT(*) AS total_materi FROM bahan_ajar WHERE created_by = $1',
        [guruId]
      ),
      // Jadwal: hanya dari schedules (tabel lama, teacher_id) — jadwal sudah di-DROP
      pool.query(
        'SELECT COUNT(*) AS total_jadwal FROM schedules WHERE teacher_id = $1',
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

    // Gunakan grades (tabel lama app GuruEOB5) — JOIN subjects untuk nama mapel
    // nilai_akademik sudah di-DROP (duplikat tabel lama)
    const { rows } = await pool.query(`
      SELECT
        NULL::text             AS semester,
        NULL::text             AS tahun_ajaran,
        COALESCE(sub.name, '') AS mata_pelajaran,
        COUNT(DISTINCT g.student_id) AS jumlah_siswa,
        COUNT(*)               AS jumlah_penilaian,
        AVG(g.nilai)           AS rata_rata_kelas
      FROM grades g
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY sub.name
      ORDER BY sub.name
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
        COUNT(*) FILTER (WHERE a.status IN ('alpha','alpa')) AS alpa,
        COUNT(*)                                    AS total
      FROM absensi a
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
        COALESCE(sub.name, g.jenis) AS "subjectName",
        s.kelas,
        ROUND(AVG(g.nilai)::numeric, 2)   AS "rataRata",
        MIN(g.nilai)                       AS "nilaiMin",
        MAX(g.nilai)                       AS "nilaiMax",
        COUNT(*)                           AS "jumlahNilai",
        JSON_AGG(JSON_BUILD_OBJECT('range', CONCAT(FLOOR(g.nilai/10)*10,'-',FLOOR(g.nilai/10)*10+9), 'jumlah', 1) ORDER BY g.nilai) AS raw
      FROM grades g
      JOIN students s ON s.id = g.student_id::text
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      GROUP BY COALESCE(sub.name, g.jenis), s.kelas
      ORDER BY s.kelas, COALESCE(sub.name, g.jenis)
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
