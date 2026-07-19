import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// GET /api/siswa/hafalan — current student's hafalan status per table
router.get('/', async (req, res) => {
  try {
    const studentId = req.session.user.id

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

    const perkalian = {}
    const pembagian = {}
    for (const r of rows) {
      if (r.jenis === 'perkalian') perkalian[r.angka] = r.status
      else pembagian[r.angka] = r.status
    }

    const lulusPerkalian = Object.values(perkalian).filter(s => s === 'lulus').length
    const lulusPembagian = Object.values(pembagian).filter(s => s === 'lulus').length

    res.json({
      perkalian,
      pembagian,
      lulusPerkalian,
      lulusPembagian,
      totalLulus: lulusPerkalian + lulusPembagian,
    })
  } catch (err) {
    console.error('hafalan-siswa error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
