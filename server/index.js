import express from 'express'
import http from 'node:http'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import authRouter from './auth.js'
import guruRouter from './guru.js'
import siswaRouter from './siswa.js'
import playerRouter from './player.js'
import tokoRouter from './toko.js'
import papanPeringkatRouter from './papan-peringkat.js'
import lencanaRouter from './lencana.js'
import insightRouter from './insight.js'
import hafalanGuruRouter from './hafalan-guru.js'
import hafalanSiswaRouter from './hafalan-siswa.js'
import komunikasiRouter from './komunikasi.js'
import notifikasiRouter from './notifikasi.js'
import petRouter from './pet.js'
import eventMissionsRouter from './event-missions-router.js'
// GuruEOB5
import eob5HealthRouter from './eob5/health.js'
import eob5DashboardRouter from './eob5/dashboard.js'
import eob5GuruRouter from './eob5/guru.js'
import eob5SiswaAkunRouter from './eob5/siswa-akun.js'
import eob5AbsensiRouter from './eob5/absensi.js'
import eob5KelasRouter from './eob5/kelas.js'
import eob5NilaiRouter from './eob5/nilai.js'
import eob5MateriRouter from './eob5/materi.js'
import eob5JadwalRouter from './eob5/jadwal.js'
import eob5ProsemRouter from './eob5/prosem.js'
import eob5SoalOtomatisRouter from './eob5/soal-otomatis.js'
import eob5RekapRouter from './eob5/rekap.js'
import eob5InboxRouter from './eob5/inbox.js'
// BLP Harian
import blpDashboardRouter from './blp/dashboard.js'
import blpAktivitasRouter from './blp/aktivitas.js'
import blpPeriodeRouter from './blp/periode.js'
import blpQuranRouter from './blp/quran.js'
import blpProfilRouter from './blp/profil.js'
import blpHaidRouter from './blp/haid.js'
import blpSiswaAdminRouter from './blp/siswa-admin.js'
import { pool } from './db.js'
import { ensureSchema } from './schema.js'
import { setupMultiplayer } from './multiplayer.js'
import { setIo } from './boss-state.js'
import { setTournamentIo } from './tournament-state.js'

const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 5000

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required.')
}

// Origin yang diizinkan untuk request dari APK (Capacitor WebView)
const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
]

async function createServer() {
  const app = express()

  // CORS — izinkan Capacitor APK dan web dev
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      }
      if (req.method === 'OPTIONS') return res.sendStatus(204)
    }
    next()
  })

  app.use(express.json({ limit: '2mb' }))
  app.set('trust proxy', 1)

  // Capacitor Cookie Patch — ubah SameSite=Lax → SameSite=None; Secure
  // agar session cookie bisa dikirim dari https://localhost (Capacitor) ke
  // domain produksi (cross-site request dengan withCredentials: true).
  app.use((req, res, next) => {
    const origin = req.headers.origin || ''
    const isCapacitor = origin === 'capacitor://localhost' || origin === 'https://localhost'
    if (!isCapacitor) return next()

    const _setHeader = res.setHeader.bind(res)
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === 'set-cookie') {
        const patch = (c) =>
          c
            .replace(/;\s*samesite=[^;,]*/gi, '')  // hapus SameSite lama
            .replace(/;\s*secure/gi, '')             // hapus Secure lama
            + '; SameSite=None; Secure'              // tambah ulang
        value = Array.isArray(value) ? value.map(patch) : patch(String(value))
      }
      return _setHeader(name, value)
    }
    next()
  })

  const PgSession = connectPgSimple(session)
  // Keep a reference so Socket.io can share the same session middleware
  const sessionMiddleware = session({
    store: new PgSession({
      pool,
      tableName: 'tomat_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // 'auto' lets express-session decide per-request from req.secure
      // (which respects X-Forwarded-Proto since trust proxy is enabled
      // above). A hardcoded `isProd` here breaks login entirely whenever
      // the app is reachable over plain HTTP (e.g. no TLS/domain configured
      // yet on the reverse proxy): browsers silently drop secure cookies
      // sent over HTTP, so every request after login looks unauthenticated.
      secure: 'auto',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
  app.use(sessionMiddleware)

  app.use('/api/auth', authRouter)
  app.use('/api/guru', guruRouter)
  app.use('/api/guru/insight', insightRouter)
  app.use('/api/siswa', siswaRouter)
  app.use('/api/siswa/player', playerRouter)
  app.use('/api/siswa/toko', tokoRouter)
  app.use('/api/siswa/event-missions', eventMissionsRouter)
  app.use('/api/siswa/papan-peringkat', papanPeringkatRouter)
  app.use('/api/siswa/lencana', lencanaRouter)
  app.use('/api/guru/hafalan', hafalanGuruRouter)
  app.use('/api/siswa/hafalan', hafalanSiswaRouter)
  app.use('/api/komunikasi', komunikasiRouter)
  app.use('/api/notifikasi', notifikasiRouter)
  app.use('/api/siswa/pet', petRouter)

  // ── GuruEOB5 ──────────────────────────────────────────────────────────────
  app.use('/api/eob5', eob5HealthRouter)
  app.use('/api/eob5/dashboard', eob5DashboardRouter)
  app.use('/api/eob5/guru', eob5GuruRouter)
  app.use('/api/eob5/siswa', eob5SiswaAkunRouter)
  app.use('/api/eob5/absensi', eob5AbsensiRouter)
  app.use('/api/eob5/kelas', eob5KelasRouter)
  app.use('/api/eob5/nilai', eob5NilaiRouter)
  app.use('/api/eob5/materi', eob5MateriRouter)
  app.use('/api/eob5/jadwal', eob5JadwalRouter)
  app.use('/api/eob5/prosem', eob5ProsemRouter)
  app.use('/api/eob5/soal-otomatis', eob5SoalOtomatisRouter)
  app.use('/api/eob5/rekap', eob5RekapRouter)
  app.use('/api/eob5/inbox', eob5InboxRouter)

  // ── BLP Harian ────────────────────────────────────────────────────────────
  app.use('/api/blp', blpDashboardRouter)
  app.use('/api/blp', blpAktivitasRouter)
  app.use('/api/blp', blpPeriodeRouter)
  app.use('/api/blp', blpQuranRouter)
  app.use('/api/blp', blpProfilRouter)
  app.use('/api/blp', blpHaidRouter)
  app.use('/api/blp', blpSiswaAdminRouter)

  // Endpoint publik — cek versi APK, tidak perlu login
  // Auto-detect dari GitHub Releases: https://github.com/edwardliu7-dot/tomat
  const GH_REPO = 'edwardliu7-dot/tomat'
  let _ghCache = null // { minVersionCode, downloadUrl, fetchedAt }
  const GH_CACHE_TTL = 10 * 60 * 1000 // 10 menit

  function semverToCode(tag) {
    // "v1.2.3" atau "1.2.3" → 123
    // Harus cocok dengan skema versionCode di android/app/build.gradle:
    //   major*100 + minor*10 + patch  (e.g. "1.3.2" → 132)
    const clean = tag.replace(/^v/, '')
    const parts = clean.split('.').map(n => parseInt(n, 10) || 0)
    return (parts[0] || 0) * 100 + (parts[1] || 0) * 10 + (parts[2] || 0)
  }

  app.get('/api/app/version-check', async (req, res) => {
    // Kembalikan cache kalau masih fresh
    if (_ghCache && Date.now() - _ghCache.fetchedAt < GH_CACHE_TTL) {
      return res.json({ minVersionCode: _ghCache.minVersionCode, downloadUrl: _ghCache.downloadUrl })
    }

    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${GH_REPO}/releases/latest`,
        { headers: { 'User-Agent': 'TOMAT-Server', Accept: 'application/vnd.github+json' } }
      )
      if (!ghRes.ok) throw new Error(`GitHub API ${ghRes.status}`)
      const release = await ghRes.json()

      const minVersionCode = semverToCode(release.tag_name || '0')
      const apkAsset = (release.assets || []).find(a => a.name.endsWith('.apk'))
      const downloadUrl = apkAsset?.browser_download_url || ''

      _ghCache = { minVersionCode, downloadUrl, fetchedAt: Date.now() }
      return res.json({ minVersionCode, downloadUrl })
    } catch (err) {
      console.warn('[version-check] GitHub fetch gagal, fallback ke env:', err.message)
      // Fallback ke env var jika GitHub tidak bisa dijangkau
      const minVersionCode = parseInt(process.env.MIN_APP_VERSION_CODE || '1', 10)
      const downloadUrl = process.env.APP_DOWNLOAD_URL || ''
      return res.json({ minVersionCode, downloadUrl })
    }
  })

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT, allowedHosts: true, hmr: { clientPort: 443 } },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const path = await import('node:path')
    const distPath = path.resolve(process.cwd(), 'dist')
    app.use(express.static(distPath))
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  // Attach Socket.io to the raw http.Server (required for WebSocket upgrade)
  const httpServer = http.createServer(app)
  const io = setupMultiplayer(httpServer, sessionMiddleware)
  setIo(io)             // share io with boss-state so guru REST endpoints can push socket events
  setTournamentIo(io)   // share io with tournament-state

  // Bind the port immediately so container healthchecks succeed right away,
  // even if the database connection is slow. Schema setup runs in the
  // background afterward; requests that hit the DB before it finishes will
  // simply wait on the pool/queries as usual.
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`TOMAT server running on port ${PORT}`)
  })

  ensureSchema().catch((err) => {
    console.error('Failed to ensure database schema:', err)
  })
}

createServer()
