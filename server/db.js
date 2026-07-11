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
})
