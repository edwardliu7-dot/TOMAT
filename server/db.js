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
  connectionTimeoutMillis: 25000, // Neon cold-start bisa 15-20 detik
  query_timeout: 25000,
  idleTimeoutMillis: 30000,
})

// Prevent idle-client errors from crashing the Node.js process.
// Without this handler, any error on an idle pool connection would throw
// an unhandled 'error' event and kill the server.
pool.on('error', (err) => {
  console.error('[db] Unexpected pool client error:', err.message)
})

// ══════════════════════════════════════════════════════════════════════════════
// ⛔  MIGRATION PREVENTION GUARD — LAPISAN 1 (pool-level)
//
// Tabel-tabel berikut SUDAH DI-DROP karena merupakan DUPLIKAT dari tabel
// app lama GuruEOB5 yang masih aktif sebagai sumber kebenaran utama.
// Query SQL apapun yang mereferensi tabel-tabel ini akan DITOLAK secara
// otomatis di sini — SEBELUM menyentuh database.
//
// JANGAN membuat ulang, memigrasi data ke, atau menulis query ke tabel ini:
//   attendance_records  → gunakan absensi
//   kelas_guru          → gunakan gurus.kelas_diampu (kolom array)
//   nilai_guru          → gunakan grades  (JOIN subjects untuk nama mapel)
//   poin                → gunakan point_records
//   nilai_akademik      → gunakan grades  (JOIN subjects untuk nama mapel)
//   materi              → gunakan bahan_ajar
//   jadwal              → gunakan schedules  (teacher_id, subject_id UUID)
//   kalender_akademik   → gunakan academic_calendars
//   info_pekanan        → dihitung dari prosem_items + journal_entries + schedules
//   feedback_siswa      → (belum ada padanan — fitur belum diimplementasikan)
//   inbox               → (belum ada padanan — fitur belum diimplementasikan)
//
// Mengapa: App lama masih aktif. Dua sumber kebenaran = kehilangan data.
// ══════════════════════════════════════════════════════════════════════════════

export const MIGRATION_FORBIDDEN_TABLES = Object.freeze([
  'attendance_records',
  'kelas_guru',
  'nilai_guru',
  'poin',
  'nilai_akademik',
  'materi',
  'jadwal',
  'kalender_akademik',
  'info_pekanan',
  'feedback_siswa',
  'inbox',
])

// Regex yang hanya mencocokkan nama terlarang dalam KONTEKS TABEL — setelah
// kata kunci SQL yang menunjukkan referensi ke tabel:
//   FROM x, JOIN x, INTO x, UPDATE x, TABLE x (CREATE/DROP/ALTER), REFERENCES x
// Ini mencegah false positive di mana kata seperti "materi" atau "jadwal"
// muncul sebagai nama KOLOM (bukan tabel) di dalam CREATE TABLE atau SELECT.
const _TABLE_KEYWORD_RE = new RegExp(
  `(?:from|join|into|update|table|references)\\s+(?:if\\s+(?:not\\s+)?exists\\s+)?` +
  `(?:"?)` +
  `(${MIGRATION_FORBIDDEN_TABLES.join('|')})` +
  `(?:"?)` +
  `(?:[\\s,(;]|$)`,
  'i'
)

/**
 * Throws synchronously if `sql` references any migration-forbidden table
 * in a table-context position (FROM, JOIN, INTO, UPDATE, TABLE, REFERENCES).
 * Column names and comments that happen to share the word are NOT blocked.
 *
 * Safe to call with pool.query(text|config, values) signatures.
 */
export function assertNoForbiddenTables(sql) {
  const sqlStr = typeof sql === 'string' ? sql : (sql?.text ?? '')
  const match = _TABLE_KEYWORD_RE.exec(sqlStr)
  if (match) {
    const blocked = match[1].toLowerCase()
    const msg =
      `[db-guard] ⛔ QUERY DIBLOKIR — mereferensi tabel terlarang "${blocked}". ` +
      `Tabel ini sudah di-DROP karena menduplikat data lama app GuruEOB5 yang masih aktif. ` +
      `Gunakan tabel penggantinya (lihat komentar di server/db.js § MIGRATION PREVENTION GUARD).`
    console.error(msg)
    console.error('[db-guard] SQL ditolak:', sqlStr.slice(0, 300))
    throw new Error(msg)
  }
}

/**
 * guardedPool — drop-in wrapper di atas pool dengan pemeriksaan migration prevention.
 * Gunakan ini sebagai pengganti pool di file mana pun yang bersentuhan dengan
 * tabel GuruEOB5 / data sensitif migrasi.
 *
 * Di file eob5/*: sudah di-wrap otomatis via server/eob5/lib/db-guard.js.
 * Di file server/*: impor guardedPool dari sini untuk lapisan perlindungan eksplisit.
 */
export const guardedPool = {
  query(text, values) {
    assertNoForbiddenTables(text)
    return pool.query(text, values)
  },
}
