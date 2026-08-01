/**
 * server/blp/profil.js
 * PUT /api/blp/students/:id/profile       — update foto & bio siswa
 * PUT /api/blp/gurus/:id/profile          — update foto & bio guru
 * GET /api/blp/students/:id/photo         — ambil foto siswa (guru only, on-demand)
 * PUT /api/blp/students/:id/quran-bookmark — simpan penanda bacaan Quran siswa
 */

import express from 'express'
import { pool } from '../db.js'
import {
  requireBlpSiswa,
  requireBlpGuru,
  loadStudent,
  loadGuru,
  normalizeKelas,
} from './helpers.js'

const router = express.Router()

// PUT /api/blp/students/:id/profile
// Siswa mengupdate foto profil dan bio.
router.put('/students/:id/profile', requireBlpSiswa('id'), async (req, res) => {
  try {
    const { id } = req.params
    const { photoUrl, bio } = req.body || {}

    const studentRes = await pool.query('SELECT id FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }
    if (typeof photoUrl === 'string' && photoUrl.length > 1_500_000) {
      return res.status(413).json({ error: 'Ukuran foto terlalu besar (maks ~1MB)' })
    }

    await pool.query(
      'UPDATE students SET photo_url = $2, bio = $3 WHERE id = $1',
      [
        id,
        typeof photoUrl === 'string' ? photoUrl : null,
        typeof bio === 'string' ? bio : null,
      ]
    )

    const updated = await loadStudent(id)
    res.json(updated)
  } catch (err) {
    console.error('[blp/profil] PUT student profile error', err)
    res.status(500).json({ error: 'Gagal menyimpan profil siswa' })
  }
})

// PUT /api/blp/gurus/:id/profile
// Guru mengupdate foto profil dan bio.
router.put('/gurus/:id/profile', requireBlpGuru('id'), async (req, res) => {
  try {
    const { id } = req.params
    const { photoUrl, bio } = req.body || {}

    const guruRes = await pool.query('SELECT id FROM gurus WHERE id = $1', [id])
    if (guruRes.rowCount === 0) {
      return res.status(404).json({ error: 'Guru tidak ditemukan' })
    }
    if (typeof photoUrl === 'string' && photoUrl.length > 1_500_000) {
      return res.status(413).json({ error: 'Ukuran foto terlalu besar (maks ~1MB)' })
    }

    await pool.query(
      'UPDATE gurus SET photo_url = $2, bio = $3 WHERE id = $1',
      [
        id,
        typeof photoUrl === 'string' ? photoUrl : null,
        typeof bio === 'string' ? bio : null,
      ]
    )

    const updated = await loadGuru(id)
    res.json(updated)
  } catch (err) {
    console.error('[blp/profil] PUT guru profile error', err)
    res.status(500).json({ error: 'Gagal menyimpan profil guru' })
  }
})

// GET /api/blp/students/:id/photo
// Guru mengambil foto siswa on-demand (tidak disertakan di /dashboard untuk efisiensi).
router.get('/students/:id/photo', requireBlpGuru(), async (req, res) => {
  try {
    const guru = await loadGuru(req.session.user.id)
    if (!guru) {
      return res.status(403).json({ error: 'Akses ditolak — bukan wali kelas' })
    }

    const result = await pool.query(
      'SELECT photo_url, kelas FROM students WHERE id = $1',
      [req.params.id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const row = result.rows[0]
    if (!guru.kelasWali.includes(normalizeKelas(row.kelas))) {
      return res.status(403).json({ error: 'Akses ditolak — siswa bukan dari kelas Anda' })
    }

    res.json({ photoUrl: row.photo_url || null })
  } catch (err) {
    console.error('[blp/profil] GET student photo error', err)
    res.status(500).json({ error: 'Gagal mengambil foto siswa' })
  }
})

// PUT /api/blp/students/:id/quran-bookmark
// Siswa menyimpan penanda terakhir bacaan Al-Qur'an.
router.put('/students/:id/quran-bookmark', requireBlpSiswa('id'), async (req, res) => {
  try {
    const { id } = req.params
    const { surahNo, surahName, ayat, halaman } = req.body || {}

    if (typeof surahNo !== 'number' || typeof surahName !== 'string' || typeof ayat !== 'number') {
      return res.status(400).json({ error: 'Data penanda tidak valid' })
    }

    const studentRes = await pool.query('SELECT id FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const bookmark = {
      surahNo,
      surahName,
      ayat,
      halaman: typeof halaman === 'number' ? halaman : null,
      updatedAt: new Date().toISOString(),
    }

    await pool.query(
      'UPDATE students SET quran_bookmark = $2::jsonb WHERE id = $1',
      [id, JSON.stringify(bookmark)]
    )

    res.json(bookmark)
  } catch (err) {
    console.error('[blp/profil] PUT quran bookmark error', err)
    res.status(500).json({ error: 'Gagal menyimpan penanda bacaan Quran' })
  }
})

export default router
