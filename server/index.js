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

async function createServer() {
  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.set('trust proxy', 1)

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
  app.use('/api/siswa/papan-peringkat', papanPeringkatRouter)
  app.use('/api/siswa/lencana', lencanaRouter)
  app.use('/api/guru/hafalan', hafalanGuruRouter)
  app.use('/api/siswa/hafalan', hafalanSiswaRouter)
  app.use('/api/komunikasi', komunikasiRouter)
  app.use('/api/notifikasi', notifikasiRouter)
  app.use('/api/siswa/pet', petRouter)

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
