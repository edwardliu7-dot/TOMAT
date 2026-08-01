/**
 * server/eob5/info-pekanan.js
 * GET info pekanan: join kalender + jurnal + jadwal untuk satu pekan.
 *
 * GET /api/eob5/info-pekanan?calendar_id=&week_id=
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru } from './middleware.js'

const router = Router()

const HARI_OFFSET = { Senin: 0, Selasa: 1, Rabu: 2, Kamis: 3, Jumat: 4, Sabtu: 5 }

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function hariToDate(hari, weekStart) {
  const offset = HARI_OFFSET[hari]
  if (offset === undefined) return null
  return addDays(weekStart, offset)
}

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

router.get('/', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { calendar_id, week_id } = req.query

    const empty = {
      week_id: null, pekan_ke: null, tanggal_mulai: null, tanggal_selesai: null, jenis: null,
      total_rencana: 0, total_sesuai: 0, total_tertinggal: 0, total_di_depan: 0, items: [],
    }

    if (!calendar_id || !week_id) return res.json(empty)

    // Verifikasi kalender
    const { rows: calRows } = await pool.query(
      `SELECT id FROM eob5_academic_calendars
       WHERE id = $1 AND (guru_id = $2 OR is_shared = true)`,
      [calendar_id, guruId]
    )
    if (!calRows.length) return res.json(empty)

    // Ambil pekan
    const { rows: weekRows } = await pool.query(
      `SELECT * FROM eob5_academic_weeks WHERE id = $1 AND calendar_id = $2`,
      [week_id, calendar_id]
    )
    if (!weekRows.length) return res.json(empty)
    const week = weekRows[0]

    const weekStart = week.tanggal_mulai.toISOString
      ? week.tanggal_mulai.toISOString().slice(0, 10)
      : String(week.tanggal_mulai).slice(0, 10)
    const weekEnd = week.tanggal_selesai.toISOString
      ? week.tanggal_selesai.toISOString().slice(0, 10)
      : String(week.tanggal_selesai).slice(0, 10)

    // Ambil subjects & jadwal guru ini
    const [subjectsRes, jadwalRes, prosemRes] = await Promise.all([
      pool.query('SELECT id, name FROM eob5_subjects WHERE guru_id = $1 AND deleted_at IS NULL', [guruId]),
      pool.query(
        'SELECT subject_id, kelas, hari FROM eob5_jadwal WHERE guru_id = $1', [guruId]
      ),
      pool.query(
        `SELECT pi.id, pi.prosem_id, pi.materi, pi.kd, pi.jp, pi.kelas,
                pi.urutan, p.guru_id
         FROM eob5_prosem_items pi
         JOIN eob5_prosem p ON p.id = pi.prosem_id
         WHERE p.guru_id = $1`,
        [guruId]
      ),
    ])

    const subjectName = new Map(subjectsRes.rows.map(s => [s.id, s.name]))
    const subjectIds = subjectsRes.rows.map(s => s.id)

    if (!subjectIds.length) {
      return res.json({ ...empty, week_id: week.id, pekan_ke: week.pekan_ke,
        tanggal_mulai: weekStart, tanggal_selesai: weekEnd, jenis: week.jenis })
    }

    // Jurnal dalam pekan ini
    const { rows: journals } = await pool.query(
      `SELECT id, subject_id, kelas, materi, tanggal, prosem_item_id
       FROM eob5_journal_entries
       WHERE guru_id = $1 AND tanggal >= $2 AND tanggal <= $3`,
      [guruId, weekStart, weekEnd]
    )

    const today = getJakartaToday()
    const weekStarted = weekStart <= today

    // Bangun schedule lookup: subjectId + normKelas → set hari
    const normKelas = k => k.trim().toLowerCase()
    const scheduleByKey = new Map()
    for (const s of jadwalRes.rows) {
      const key = `${s.subject_id}|||${normKelas(s.kelas)}`
      if (!scheduleByKey.has(key)) scheduleByKey.set(key, new Set())
      scheduleByKey.get(key).add(s.hari)
    }

    const items = []
    const matchedJournalIds = new Set()

    for (const pi of prosemRes.rows) {
      // Cari jurnal yang cocok dengan prosem item ini di pekan ini
      const matches = journals.filter(j =>
        j.subject_id === pi.subject_id || j.prosem_item_id === pi.id
      )

      let status = 'belum'
      let matchedJournal = null

      if (matches.length) {
        matchedJournal = matches[0]
        matchedJournalIds.add(matchedJournal.id)
        status = 'sesuai'
      } else if (weekStarted) {
        // Cek apakah masih ada slot mengajar tersisa pekan ini
        const key = `${pi.subject_id}|||${normKelas(pi.kelas || '')}`
        const hariSet = scheduleByKey.get(key) || new Set()
        const hasUpcomingSlot = [...hariSet].some(h => {
          const slotDate = hariToDate(h, weekStart)
          return slotDate && slotDate >= today && slotDate <= weekEnd
        })
        status = hasUpcomingSlot ? 'belum' : 'tertinggal'
      }

      items.push({
        prosem_item_id: pi.id,
        subject_id: pi.subject_id,
        subject_name: subjectName.get(pi.subject_id) ?? '-',
        kelas: pi.kelas,
        kd: pi.kd ?? null,
        materi: pi.materi,
        jp: pi.jp ?? null,
        status,
        journal_entry_id: matchedJournal ? matchedJournal.id : null,
      })
    }

    // "Di depan" — jurnal minggu ini tanpa prosem item
    if (weekStarted) {
      for (const j of journals) {
        if (matchedJournalIds.has(j.id)) continue
        items.push({
          prosem_item_id: null,
          subject_id: j.subject_id,
          subject_name: subjectName.get(j.subject_id) ?? '-',
          kelas: j.kelas,
          kd: null,
          materi: j.materi,
          jp: null,
          status: 'di_depan',
          journal_entry_id: j.id,
        })
      }
    }

    res.json({
      week_id: week.id,
      pekan_ke: week.pekan_ke,
      tanggal_mulai: weekStart,
      tanggal_selesai: weekEnd,
      jenis: week.jenis,
      total_rencana: items.filter(i => i.prosem_item_id !== null).length,
      total_sesuai: items.filter(i => i.status === 'sesuai').length,
      total_tertinggal: items.filter(i => i.status === 'tertinggal').length,
      total_di_depan: items.filter(i => i.status === 'di_depan').length,
      items,
    })
  } catch (err) {
    console.error('[eob5/info-pekanan] error:', err)
    res.status(500).json({ error: 'Gagal mengambil info pekanan' })
  }
})

export default router
