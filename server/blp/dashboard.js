/**
 * server/blp/dashboard.js
 * GET /api/blp/dashboard  — data dashboard sesuai role user yang login
 * GET /api/blp/system-data — seluruh data sistem (siswa + guru + blp_periods)
 */

import express from 'express'
import { pool } from '../db.js'
import {
  requireBlpAuth,
  loadStudent,
  loadGuru,
  normalizeKelas,
  blpPeriodKey,
  isWaliKelas,
} from './helpers.js'

const router = express.Router()

// GET /api/blp/dashboard
// Siswa: data diri + blpPeriods kelasnya.
// Guru (wali kelas): data semua siswa di kelasnya + blpPeriods.
router.get('/dashboard', requireBlpAuth, async (req, res) => {
  try {
    const { id, role } = req.session.user

    if (role === 'siswa') {
      const student = await loadStudent(id)
      if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan' })

      const periodsRes = await pool.query(
        'SELECT kelas, year, month, start_day, end_day FROM blp_periods WHERE kelas = $1',
        [student.kelas]
      )
      const blpPeriods = {}
      for (const row of periodsRes.rows) {
        blpPeriods[blpPeriodKey(normalizeKelas(row.kelas), row.year, row.month)] = {
          startDay: row.start_day,
          endDay: row.end_day,
        }
      }
      return res.json({ students: { [student.id]: student }, gurus: {}, blpPeriods })
    }

    // Guru — hanya wali kelas yang bisa akses BLP
    const guru = await loadGuru(id)
    if (!guru) {
      return res.status(403).json({ error: 'Hanya wali kelas yang dapat mengakses BLP' })
    }

    const kelasWali = guru.kelasWali[0]

    // Fetch semua siswa tanpa photo_url (besar, di-load on-demand)
    const studentRes = await pool.query(
      'SELECT id, username, name, kelas, email, whatsapp, bio, quran_bookmark, jenis_kelamin FROM students'
    )

    const classStudentIds = []
    const classStudentRows = []
    for (const row of studentRes.rows) {
      if (normalizeKelas(row.kelas) === kelasWali) {
        classStudentIds.push(row.id)
        classStudentRows.push(row)
      }
    }

    const noRows = { rows: [] }
    const [recordsRes, periodsRes, haidRes] = await Promise.all([
      classStudentIds.length > 0
        ? pool.query(
            'SELECT student_id, record_date, completed_activities, score, submissions FROM daily_records WHERE student_id = ANY($1)',
            [classStudentIds]
          )
        : Promise.resolve(noRows),
      pool.query('SELECT kelas, year, month, start_day, end_day FROM blp_periods'),
      classStudentIds.length > 0
        ? pool.query(
            'SELECT id, student_id, start_date, end_date FROM haid_periods WHERE student_id = ANY($1) ORDER BY start_date DESC',
            [classStudentIds]
          )
        : Promise.resolve(noRows),
    ])

    // Group records per siswa
    const recordsByStudent = {}
    for (const r of recordsRes.rows) {
      const dateKey = r.record_date.toISOString().slice(0, 10)
      if (!recordsByStudent[r.student_id]) recordsByStudent[r.student_id] = {}
      recordsByStudent[r.student_id][dateKey] = {
        date: dateKey,
        completedActivities: r.completed_activities || [],
        score: r.score,
        submissions: r.submissions || {},
      }
    }

    // Group haid per siswa
    const haidByStudent = {}
    for (const r of haidRes.rows) {
      if (!haidByStudent[r.student_id]) haidByStudent[r.student_id] = []
      haidByStudent[r.student_id].push({
        id: r.id,
        startDate: r.start_date.toISOString().slice(0, 10),
        endDate: r.end_date ? r.end_date.toISOString().slice(0, 10) : null,
      })
    }

    // Build students map (photoUrl di-load on-demand via /profil/:id/photo)
    const students = {}
    for (const row of classStudentRows) {
      students[row.id] = {
        id: row.id,
        username: row.username,
        name: row.name,
        kelas: normalizeKelas(row.kelas),
        email: row.email,
        whatsapp: row.whatsapp,
        photoUrl: null,
        bio: row.bio,
        quranBookmark: row.quran_bookmark || null,
        jenisKelamin: row.jenis_kelamin || null,
        haidPeriods: haidByStudent[row.id] || [],
        records: recordsByStudent[row.id] || {},
      }
    }

    // Filter blpPeriods hanya kelas ini
    const blpPeriods = {}
    for (const row of periodsRes.rows) {
      if (normalizeKelas(row.kelas) !== kelasWali) continue
      blpPeriods[blpPeriodKey(normalizeKelas(row.kelas), row.year, row.month)] = {
        startDay: row.start_day,
        endDay: row.end_day,
      }
    }

    return res.json({ students, gurus: { [guru.id]: guru }, blpPeriods })
  } catch (err) {
    console.error('[blp/dashboard] error', err)
    res.status(500).json({ error: 'Gagal memuat data dashboard BLP' })
  }
})

// GET /api/blp/system-data
// Semua data (dipakai untuk sinkronisasi penuh).
router.get('/system-data', requireBlpAuth, async (req, res) => {
  try {
    const [studentRes, recordsRes, guruRes] = await Promise.all([
      pool.query(
        'SELECT id, username, name, kelas, email, whatsapp, photo_url, bio, quran_bookmark FROM students'
      ),
      pool.query(
        'SELECT student_id, record_date, completed_activities, score, submissions FROM daily_records'
      ),
      pool.query(
        'SELECT id, username, name, jabatan, wali_kelas_kelas, photo_url, bio FROM gurus'
      ),
    ])

    const recordsByStudent = {}
    for (const r of recordsRes.rows) {
      const dateKey = r.record_date.toISOString().slice(0, 10)
      if (!recordsByStudent[r.student_id]) recordsByStudent[r.student_id] = {}
      recordsByStudent[r.student_id][dateKey] = {
        date: dateKey,
        completedActivities: r.completed_activities || [],
        score: r.score,
        submissions: r.submissions || {},
      }
    }

    const students = {}
    for (const row of studentRes.rows) {
      students[row.id] = {
        id: row.id,
        username: row.username,
        name: row.name,
        kelas: normalizeKelas(row.kelas),
        email: row.email,
        whatsapp: row.whatsapp,
        photoUrl: row.photo_url,
        bio: row.bio,
        quranBookmark: row.quran_bookmark || null,
        records: recordsByStudent[row.id] || {},
      }
    }

    const gurus = {}
    for (const row of guruRes.rows) {
      if (!isWaliKelas(row)) continue
      gurus[row.id] = {
        id: row.id,
        username: row.username,
        name: row.name,
        kelasWali: [normalizeKelas(row.wali_kelas_kelas)],
        photoUrl: row.photo_url,
        bio: row.bio,
      }
    }

    const periodsRes = await pool.query(
      'SELECT kelas, year, month, start_day, end_day FROM blp_periods'
    )
    const blpPeriods = {}
    for (const row of periodsRes.rows) {
      blpPeriods[blpPeriodKey(normalizeKelas(row.kelas), row.year, row.month)] = {
        startDay: row.start_day,
        endDay: row.end_day,
      }
    }

    res.json({ students, gurus, blpPeriods })
  } catch (err) {
    console.error('[blp/system-data] error', err)
    res.status(500).json({ error: 'Gagal memuat data sistem BLP' })
  }
})

export default router
