/**
 * server/blp/siswa-admin.js
 * DELETE /api/blp/students/:id — guru (wali kelas) hapus akun siswa dari kelasnya
 *
 * Catatan: operasi ini menghapus data siswa dari tabel shared (students, daily_records,
 * haid_periods, nilai). Hanya bisa dilakukan oleh wali kelas yang bertanggung jawab
 * atas kelas siswa tersebut.
 */

import express from 'express'
import { pool } from '../db.js'
import { requireBlpGuru, loadGuru, normalizeKelas } from './helpers.js'

const router = express.Router()

// DELETE /api/blp/students/:id
// Hapus akun siswa secara permanen. Hanya wali kelas yang bisa menghapus siswa
// dari kelasnya sendiri.
router.delete('/students/:id', requireBlpGuru(), async (req, res) => {
  try {
    const { id } = req.params

    const guru = await loadGuru(req.session.user.id)
    if (!guru) {
      return res.status(404).json({ error: 'Akun guru tidak ditemukan atau bukan wali kelas' })
    }

    const studentRes = await pool.query('SELECT id, kelas FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' })
    }

    const studentKelas = normalizeKelas(studentRes.rows[0].kelas)
    if (!guru.kelasWali.includes(studentKelas)) {
      return res.status(403).json({
        error: 'Anda tidak memiliki akses untuk menghapus siswa dari kelas ini',
      })
    }

    // Hapus semua tabel yang mereferensikan students(id) secara eksplisit,
    // lalu hapus baris siswa (FK CASCADE akan menangani sisanya).
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM daily_records WHERE student_id = $1', [id])
      await client.query('DELETE FROM haid_periods WHERE student_id = $1', [id])
      await client.query('DELETE FROM nilai WHERE student_id = $1', [id])
      await client.query('DELETE FROM students WHERE id = $1', [id])
      await client.query('COMMIT')
    } catch (innerErr) {
      await client.query('ROLLBACK')
      throw innerErr
    } finally {
      client.release()
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('[blp/siswa-admin] DELETE student error', err)
    const detail = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: `Gagal menghapus akun siswa: ${detail}` })
  }
})

export default router
