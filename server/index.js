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
import appVersionRouter from './app-version.js'
import mobaResultsRouter from './moba-results.js'
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

// Purge konten submission yang sudah direview lebih dari 7 hari.
// Konten dihapus tapi metadata (reviewedAt, type, expired: true) tetap ada.
async function purgeExpiredSubmissions() {
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()

    const rows = await pool.query(
      `SELECT student_id, record_date, submissions
       FROM daily_records
       WHERE submissions IS NOT NULL
         AND submissions != '{}'::jsonb`
    )

    let purgedCount = 0
    for (const row of rows.rows) {
      const subs = row.submissions || {}
      let changed = false

      for (const [actId, sub] of Object.entries(subs)) {
        if (
          sub.reviewedAt &&
          sub.reviewedAt < cutoff &&
          !sub.expired &&
          (sub.type === 'audio' || sub.type === 'text') &&
          sub.content
        ) {
          subs[actId] = { ...sub, expired: true }
          delete subs[actId].content
          changed = true
          purgedCount++
        }
      }

      if (changed) {
        await pool.query(
          'UPDATE daily_records SET submissions = $3::jsonb WHERE student_id = $1 AND record_date = $2',
          [row.student_id, row.record_date, JSON.stringify(subs)]
        )
      }
    }

    if (purgedCount > 0) {
      console.log(`[purge] Expired ${purgedCount} submission content(s)`)
    }
  } catch (err) {
    console.error('[purge] Error during submission purge:', err)
  }
}

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
  app.use('/api/guru/moba/results', mobaResultsRouter)
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

  // ── App version & OTA bundles ─────────────────────────────────────────────
  app.use('/api/app', appVersionRouter)

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT, allowedHosts: true, hmr: { clientPort: 443 } },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const path = await import('node:path')
    // Serve OTA bundle zips dari folder bundles/ (dibuat oleh scripts/deploy-bundle.sh)
    app.use('/bundles', express.static(path.resolve(process.cwd(), 'bundles')))
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

  // Purge expired submission content once at startup, then every hour
  purgeExpiredSubmissions()
  setInterval(purgeExpiredSubmissions, 60 * 60 * 1000)
}

createServer()
