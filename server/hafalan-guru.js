import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { notifyUser } from './notifications.js'

const router = express.Router()
router.use(requireAuth, requireRole('guru'))

async function getMyKelasDiampu(req) {
  const { rows } = await pool.query('select kelas_diampu from gurus where id = $1', [req.session.user.id])
  return rows[0]?.kelas_diampu || []
}

// Helper: get latest hafalan status per (jenis, angka) for a student
async function getStudentHafalanStatus(studentId) {
  const { rows } = await pool.query(`
    select jenis, angka, status
    from (
      select jenis, angka, status,
             row_number() over (partition by jenis, angka order by dinilai_at desc) as rn
      from hafalan_setoran
      where student_id = $1
    ) t
    where rn = 1
  `, [studentId])
  // Build a map: { perkalian: { 1: 'lulus', 2: 'diulang', ... }, pembagian: {...} }
  const result = { perkalian: {}, pembagian: {} }
  for (const r of rows) result[r.jenis][r.angka] = r.status
  return result
}

// GET /api/guru/hafalan/students — students in teacher's classes with hafalan summary
router.get('/students', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    if (kelasDiampu.length === 0) return res.json({ students: [] })

    const { rows: students } = await pool.query(
       `select id, name, kelas, photo_url, equipped_bingkai from students where kelas = any($1) order by kelas, name`,
      [kelasDiampu]
    )

    // Batch-load hafalan summary for all students
    const studentIds = students.map(s => s.id)
    const { rows: hafalanRows } = await pool.query(`
      select student_id, jenis, count(*) as lulus_count
      from (
        select student_id, jenis, angka, status,
               row_number() over (partition by student_id, jenis, angka order by dinilai_at desc) as rn
        from hafalan_setoran
        where student_id = any($1)
      ) t
      where rn = 1 and status = 'lulus'
      group by student_id, jenis
    `, [studentIds])

    const hafalanMap = {}
    for (const r of hafalanRows) {
      if (!hafalanMap[r.student_id]) hafalanMap[r.student_id] = { perkalian: 0, pembagian: 0 }
      hafalanMap[r.student_id][r.jenis] = Number(r.lulus_count)
    }

    const result = students.map(s => ({
      ...s,
      hafalanPerkalian: hafalanMap[s.id]?.perkalian || 0,
      hafalanPembagian: hafalanMap[s.id]?.pembagian || 0,
    }))

    res.json({ students: result })
  } catch (err) {
    console.error('hafalan-guru/students error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/guru/hafalan/student/:id — full hafalan status for one student
router.get('/student/:id', async (req, res) => {
  try {
    const kelasDiampu = await getMyKelasDiampu(req)
    // Verify student is in teacher's class
    const { rows: stuRows } = await pool.query(
       `select id, name, kelas, photo_url, equipped_bingkai from students where id = $1 and kelas = any($2)`,
      [req.params.id, kelasDiampu]
    )
    if (stuRows.length === 0) return res.status(403).json({ error: 'Siswa tidak ditemukan di kelas Anda.' })

    const status = await getStudentHafalanStatus(req.params.id)

    // Recent setoran history (last 10)
    const { rows: history } = await pool.query(
      `select jenis, angka, status, dinilai_at from hafalan_setoran
       where student_id = $1 order by dinilai_at desc limit 10`,
      [req.params.id]
    )

    res.json({ student: stuRows[0], status, history })
  } catch (err) {
    console.error('hafalan-guru/student error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/guru/hafalan — record a setoran result
router.post('/', async (req, res) => {
  try {
    const { studentId, jenis, angka, status } = req.body || {}
    if (!studentId || !['perkalian', 'pembagian'].includes(jenis) ||
        !Number.isInteger(angka) || angka < 1 || angka > 10 ||
        !['lulus', 'diulang'].includes(status)) {
      return res.status(400).json({ error: 'Data setoran tidak valid.' })
    }

    const kelasDiampu = await getMyKelasDiampu(req)
    const { rows: stuRows } = await pool.query(
      `select id, kelas from students where id = $1 and kelas = any($2)`,
      [studentId, kelasDiampu]
    )
    if (stuRows.length === 0) return res.status(403).json({ error: 'Siswa tidak ditemukan di kelas Anda.' })

    await pool.query(
      `insert into hafalan_setoran (student_id, guru_id, jenis, angka, status)
       values ($1, $2, $3, $4, $5)`,
      [studentId, req.session.user.id, jenis, angka, status]
    )

    // If lulus, award the corresponding badge (idempotent)
    if (status === 'lulus') {
      const badgeId = jenis === 'perkalian' ? `hafalan_kali_${angka}` : `hafalan_bagi_${angka}`
      await pool.query(
        `insert into student_badges (student_id, badge_id) values ($1, $2) on conflict do nothing`,
        [studentId, badgeId]
      )
    }
    await notifyUser({
      userId: studentId,
      role: 'siswa',
      type: 'hafalan',
      title: status === 'lulus' ? 'Hafalan lulus' : 'Hafalan perlu diulang',
      body: `${jenis === 'perkalian' ? 'Perkalian' : 'Pembagian'} ${angka}: ${status === 'lulus' ? 'lulus' : 'perlu diulang'}.`,
      url: '/',
      metadata: { jenis, angka, status },
    })

    // Return updated status for the student
    const updatedStatus = await getStudentHafalanStatus(studentId)
    const { rows: history } = await pool.query(
      `select jenis, angka, status, dinilai_at from hafalan_setoran
       where student_id = $1 order by dinilai_at desc limit 10`,
      [studentId]
    )

    res.json({ ok: true, status: updatedStatus, history })
  } catch (err) {
    console.error('hafalan-guru/post error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
