import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.NEON_DATABASE_URL

// Only enable SSL when the connection string explicitly asks for it
// (e.g. Neon requires SSL). Self-hosted Postgres instances (e.g. Coolify)
// typically don't support SSL connections at all, so default to plain TCP.
const wantsSsl = /sslmode=require|ssl=true/i.test(connectionString || '')

export const pool = new Pool({
  connectionString,
  ssl: wantsSsl ? { rejectUnauthorized: false } : false,
  // Database outages must fail requests and allow the UI to recover instead
  // of leaving session/auth requests pending indefinitely.
  connectionTimeoutMillis: 10000,
  query_timeout: 15000,
  idleTimeoutMillis: 30000,
})

// Prevent idle-client errors from crashing the Node.js process.
// Without this handler, any error on an idle pool connection would throw
// an unhandled 'error' event and kill the server.
pool.on('error', (err) => {
  console.error('[db] Unexpected pool client error:', err.message)
})
