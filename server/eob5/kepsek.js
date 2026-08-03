/**
 * server/eob5/kepsek.js
 * Overview Kepala Sekolah: kinerja jurnal per guru + dokumen administrasi.
 *
 * GET /api/eob5/kepsek/overview  — semua guru + jurnal bulan ini + dokumen
 * GET /api/eob5/kepsek/jurnal    — entri jurnal terbaru semua guru
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireKepsekOrWakasek } from './middleware.js'

const router = Router()

// GET /overview
router.get('/overview', requireKepsekOrWakasek, async (req, res) => {
  try {
    const now = new Date()
    const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Semua guru + jumlah jurnal bulan ini + jumlah dokumen
    const { rows } = await pool.query(`
      SELECT
        g.id              AS username,
        g.name,
        COALESCE(g.mapel, ARRAY[]::text[]) AS mapel,
        COUNT(DISTINCT j.id) FILTER (
          WHERE TO_CHAR(j.tanggal, 'YYYY-MM') = $1
        ) AS jurnal_bulan_ini,
        COUNT(DISTINCT d.id)                     AS dokumen_selesai,
        COUNT(DISTINCT s.id) * 3                 AS dokumen_total
      FROM gurus g
      LEFT JOIN journal_entries j  ON j.teacher_id = g.id
      LEFT JOIN subjects        s  ON s.teacher_id = g.id
      LEFT JOIN documents       d  ON d.subject_id = s.id
      GROUP BY g.id, g.name, g.mapel
      ORDER BY g.name
    `, [bulanIni])

    const teachers = rows.map(r => {
      const jurnalBulanIni   = parseInt(r.jurnal_bulan_ini)  || 0
      const dokumenSelesai   = parseInt(r.dokumen_selesai)   || 0
      const dokumenTotal     = parseInt(r.dokumen_total)     || 0
      const jurnalPct        = Math.min(jurnalBulanIni * 10, 100)
      const dokPct           = dokumenTotal > 0 ? Math.round((dokumenSelesai / dokumenTotal) * 100) : 0
      const kelengkapanPersen = Math.round((jurnalPct + dokPct) / 2)
      return {
        username: r.username,
        name: r.name,
        mapel: r.mapel || [],
        jurnalBulanIni,
        dokumenSelesai,
        dokumenTotal,
        kelengkapanPersen,
      }
    })

    res.json({ teachers })
  } catch (err) {
    console.error('[kepsek/overview]', err)
    res.status(500).json({ error: 'Gagal memuat data kepsek' })
  }
})

// GET /jurnal — 30 entri jurnal terbaru dari semua guru
router.get('/jurnal', requireKepsekOrWakasek, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        j.id,
        j.tanggal,
        j.materi,
        j.catatan,
        g.name  AS "teacherName",
        s.subject_name AS "subjectName",
        s.kelas
      FROM journal_entries j
      JOIN gurus          g ON g.id = j.teacher_id
      LEFT JOIN subjects s ON s.id = j.subject_id
      ORDER BY j.tanggal DESC, j.created_at DESC
      LIMIT 30
    `)
    res.json({ entries: rows })
  } catch (err) {
    console.error('[kepsek/jurnal]', err)
    res.status(500).json({ error: 'Gagal memuat jurnal' })
  }
})

export default router
