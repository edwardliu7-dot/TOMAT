/**
 * server/eob5/teachers.js
 * CRUD profil guru + progres jurnal (untuk kepala sekolah / admin).
 *
 * GET  /api/eob5/teachers/progress — progres jurnal & dokumen semua guru (admin only)
 * GET  /api/eob5/teachers          — daftar semua guru (admin only)
 * GET  /api/eob5/teachers/:id      — detail satu guru
 * PATCH /api/eob5/teachers/:id     — update profil guru (diri sendiri atau admin)
 * DELETE /api/eob5/teachers/:id    — hapus guru (diri sendiri atau admin)
 */

import { Router } from 'express'
import { pool } from '../db.js'
import { requireGuru, requireAdmin } from './middleware.js'

const router = Router()

const DOCS_PER_SUBJECT = 5

function safeGuru(row) {
  // jangan bocorkan password ke client
  const { password, ...rest } = row
  return rest
}

// GET /progress — admin only
router.get('/progress', requireAdmin, async (req, res) => {
  try {
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().slice(0, 10)

    const { rows: gurus } = await pool.query(
      `SELECT id, name FROM gurus ORDER BY name`
    )
    if (!gurus.length) return res.json([])

    const guruIds = gurus.map(g => g.id)

    const [subjectsRes, docsRes, journalsRes] = await Promise.all([
      pool.query(
        'SELECT id, teacher_id AS guru_id FROM subjects WHERE teacher_id = ANY($1::text[]) AND deleted_at IS NULL',
        [guruIds]
      ),
      pool.query(
        `SELECT d.subject_id FROM documents d
         JOIN subjects s ON s.id = d.subject_id
         WHERE s.teacher_id = ANY($1::text[])`,
        [guruIds]
      ),
      pool.query(
        `SELECT teacher_id AS guru_id FROM journal_entries
         WHERE tanggal >= $1 AND teacher_id = ANY($2::text[])`,
        [monthStartStr, guruIds]
      ),
    ])

    const docsBySubject = new Map()
    for (const d of docsRes.rows) {
      docsBySubject.set(d.subject_id, (docsBySubject.get(d.subject_id) ?? 0) + 1)
    }

    const journalsByGuru = new Map()
    for (const j of journalsRes.rows) {
      journalsByGuru.set(j.guru_id, (journalsByGuru.get(j.guru_id) ?? 0) + 1)
    }

    const result = gurus.map(g => {
      const guruSubjects = subjectsRes.rows.filter(s => s.guru_id === g.id)
      const dokumenSelesai = guruSubjects.reduce((sum, s) => sum + (docsBySubject.get(s.id) ?? 0), 0)
      const dokumenTotal = guruSubjects.length * DOCS_PER_SUBJECT
      const jurnalBulanIni = journalsByGuru.get(g.id) ?? 0
      const kelengkapanPersen = dokumenTotal > 0
        ? Math.min(100, Math.round((dokumenSelesai / dokumenTotal) * 100))
        : 0
      return {
        teacher_id: g.id,
        name: g.name,
        jurnal_bulan_ini: jurnalBulanIni,
        dokumen_total: dokumenTotal,
        dokumen_selesai: dokumenSelesai,
        kelengkapan_persen: kelengkapanPersen,
      }
    })

    res.json(result)
  } catch (err) {
    console.error('[eob5/teachers] progress error:', err)
    res.status(500).json({ error: 'Gagal mengambil progres guru' })
  }
})

// GET / — daftar semua guru (semua guru bisa lihat direktori)
router.get('/', requireGuru, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, email, whatsapp, kelas_diampu,
              jabatan, wali_kelas_kelas, mapel, photo_url, bio, school, created_at
       FROM gurus ORDER BY name`
    )
    res.json(rows)
  } catch (err) {
    console.error('[eob5/teachers] list error:', err)
    res.status(500).json({ error: 'Gagal mengambil daftar guru' })
  }
})

// GET /:id — detail guru
router.get('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    // Guru hanya boleh lihat dirinya sendiri kecuali admin
    const jabatan = req.session.user.jabatan || []
    const isAdmin = jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
    if (id !== guruId && !isAdmin) {
      return res.status(403).json({ error: 'Akses ditolak' })
    }

    const { rows } = await pool.query(
      `SELECT id, username, name, email, whatsapp, kelas_diampu,
              jabatan, wali_kelas_kelas, mapel, photo_url, bio, school, created_at
       FROM gurus WHERE id = $1`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Guru tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/teachers] detail error:', err)
    res.status(500).json({ error: 'Gagal mengambil data guru' })
  }
})

// PATCH /:id — update profil guru
router.patch('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const jabatan = req.session.user.jabatan || []
    const isAdmin = jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
    const isSelf = id === guruId

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Hanya boleh mengubah profil sendiri' })
    }

    const { name, email, whatsapp, bio, photo_url, mapel,
            kelas_diampu, jabatan: newJabatan, wali_kelas_kelas, school } = req.body || {}

    const updates = []
    const params = []
    let idx = 1

    const addField = (col, val) => {
      if (val !== undefined) {
        updates.push(`${col} = $${idx++}`)
        params.push(val === '' && col === 'photo_url' ? null : val)
      }
    }

    addField('name', name)
    addField('email', email)
    addField('whatsapp', whatsapp)
    addField('bio', bio)
    addField('photo_url', photo_url)
    addField('mapel', mapel)

    // Hanya admin yang boleh ubah kelas_diampu, jabatan, school
    if (isAdmin) {
      addField('kelas_diampu', kelas_diampu)
      addField('jabatan', newJabatan)
      addField('wali_kelas_kelas', wali_kelas_kelas)
      addField('school', school)
    }

    if (!updates.length) return res.status(400).json({ error: 'Tidak ada field yang diupdate' })

    params.push(id)
    const { rows } = await pool.query(
      `UPDATE gurus SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, username, name, email, whatsapp, kelas_diampu,
                 jabatan, wali_kelas_kelas, mapel, photo_url, bio, school, created_at`,
      params
    )
    if (!rows.length) return res.status(404).json({ error: 'Guru tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    console.error('[eob5/teachers] update error:', err)
    res.status(500).json({ error: 'Gagal mengupdate profil guru' })
  }
})

// DELETE /:id — hapus guru
router.delete('/:id', requireGuru, async (req, res) => {
  try {
    const guruId = req.session.user.id
    const { id } = req.params
    const jabatan = req.session.user.jabatan || []
    const isAdmin = jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
    const isSelf = id === guruId

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Hanya boleh menghapus akun sendiri' })
    }

    const { rows } = await pool.query(
      'DELETE FROM gurus WHERE id = $1 RETURNING id', [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Guru tidak ditemukan' })
    res.json({ success: true })
  } catch (err) {
    console.error('[eob5/teachers] delete error:', err)
    res.status(500).json({ error: 'Gagal menghapus guru' })
  }
})

export default router
