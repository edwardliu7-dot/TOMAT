/**
 * server/eob5/middleware.js
 * Middleware auth bersama untuk semua router EOB5.
 * Menggunakan session TOMAT (req.session.user) — tidak butuh login ulang.
 */

export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Belum login' })
  }
  next()
}

export function requireGuru(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Belum login' })
  }
  if (req.session.user.role !== 'guru') {
    return res.status(403).json({ error: 'Akses hanya untuk guru' })
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'guru') {
    return res.status(403).json({ error: 'Akses hanya untuk guru' })
  }
  const jabatan = req.session.user.jabatan || []
  const isAdmin = jabatan.includes('kepala_sekolah') || jabatan.includes('admin')
  if (!isAdmin) {
    return res.status(403).json({ error: 'Akses hanya untuk kepala sekolah atau admin' })
  }
  next()
}

// Kepala Sekolah, Wakasek, atau Admin — untuk fitur supervisi (kepsek, kurikulum)
export function requireKepsekOrWakasek(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Belum login' })
  if (req.session.user.role !== 'guru') return res.status(403).json({ error: 'Akses hanya untuk guru' })
  const jabatan = req.session.user.jabatan || []
  const allowed = jabatan.some(j => ['kepala_sekolah', 'wakasek', 'admin'].includes(j))
  if (!allowed) return res.status(403).json({ error: 'Akses hanya untuk Kepala Sekolah atau Wakasek' })
  next()
}

// Wali Kelas ke atas — untuk fitur kesiswaan, manajemen siswa
export function requireWaliKelasOrAbove(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Belum login' })
  if (req.session.user.role !== 'guru') return res.status(403).json({ error: 'Akses hanya untuk guru' })
  const jabatan = req.session.user.jabatan || []
  const allowed = jabatan.some(j => ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'].includes(j))
  if (!allowed) return res.status(403).json({ error: 'Akses hanya untuk Wali Kelas, Wakasek, atau Kepala Sekolah' })
  next()
}
