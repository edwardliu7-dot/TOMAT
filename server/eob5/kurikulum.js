/**
 * server/eob5/kurikulum.js
 * Supervisi Kurikulum: dokumen administrasi + jurnal per guru.
 *
 * GET /api/eob5/kurikulum/overview — semua guru + subjects + dokumen
 * GET /api/eob5/kurikulum/jurnal   — semua jurnal mengajar
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireKepsekOrWakasek } from './middleware.js'

const router = Router()

// GET /overview
router.get('/overview', requireKepsekOrWakasek, async (req, res) => {
  try {
    // Ambil semua guru
    const { rows: guruRows } = await pool.query(`
      SELECT id, name, COALESCE(mapel, ARRAY[]::text[]) AS mapel
      FROM gurus
      ORDER BY name
    `)

    // Ambil semua subjects + dokumen per subject
    const { rows: subjectRows } = await pool.query(`
      SELECT
        s.id            AS "subjectId",
        s.teacher_id    AS guru_id,
        s.name          AS "subjectName",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', d.id, 'name', d.name, 'description', d.description)
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) AS documents
      FROM subjects  s
      LEFT JOIN documents d ON d.subject_id = s.id
      WHERE s.deleted_at IS NULL
      GROUP BY s.id, s.teacher_id, s.name
    `)

    // Group subjects by guru_id
    const subjectsByGuru = {}
    for (const s of subjectRows) {
      if (!subjectsByGuru[s.guru_id]) subjectsByGuru[s.guru_id] = []
      subjectsByGuru[s.guru_id].push({
        subjectId:   s.subjectId,
        subjectName: s.subjectName,
        kelas:       s.kelas,
        documents:   s.documents || [],
      })
    }

    const teachers = guruRows.map(g => ({
      username: g.id,
      name:     g.name,
      mapel:    g.mapel || [],
      subjects: subjectsByGuru[g.id] || [],
    }))

    res.json({ teachers })
  } catch (err) {
    console.error('[kurikulum/overview]', err)
    res.status(500).json({ error: 'Gagal memuat data kurikulum' })
  }
})

// GET /jurnal — 50 entri jurnal terbaru semua guru
router.get('/jurnal', requireKepsekOrWakasek, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        j.id,
        j.tanggal,
        j.materi,
        j.catatan,
        g.name            AS "teacherName",
        s.name            AS "subjectName",
        j.kelas
      FROM journal_entries j
      JOIN gurus           g ON g.id = j.teacher_id
      LEFT JOIN subjects s ON s.id = j.subject_id
      ORDER BY j.tanggal DESC, j.created_at DESC
      LIMIT 50
    `)
    res.json({ entries: rows })
  } catch (err) {
    console.error('[kurikulum/jurnal]', err)
    res.status(500).json({ error: 'Gagal memuat jurnal kurikulum' })
  }
})

export default router
