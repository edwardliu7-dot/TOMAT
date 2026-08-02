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
