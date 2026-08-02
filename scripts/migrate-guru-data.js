/**
 * Migrasi data GURU/EOB5 dari tabel lama ke eob5_* tables.
 *
 * Tabel yang dimigrasi:
 *   attendance_records  → eob5_absensi        (via student_accounts mapping)
 *   point_records       → eob5_student_points  (via student_accounts mapping)
 *
 * Jalankan: node scripts/migrate-guru-data.js
 */

import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: false,
})

const FALLBACK_GURU_ID = 'edwardliu7' // dipakai untuk baris tanpa filled_by_teacher_id

async function buildStudentMap(client) {
  // guru_eob5_students UUID → TOMAT students.id (text)
  const { rows } = await client.query(
    `SELECT sa.student_id AS old_id, sa.tomat_student_id AS new_id
     FROM student_accounts sa`
  )
  const map = {}
  for (const r of rows) map[r.old_id] = r.new_id
  return map
}

async function migrateAbsensi(client, studentMap) {
  console.log('\n── Migrasi attendance_records → eob5_absensi ──')

  const { rows: old } = await client.query(
    `SELECT * FROM attendance_records ORDER BY tanggal, student_id`
  )
  console.log(`  Ditemukan ${old.length} baris di attendance_records`)

  let inserted = 0, skipped = 0, unmapped = 0

  for (const r of old) {
    const tomatStudentId = studentMap[r.student_id]
    if (!tomatStudentId) {
      unmapped++
      continue
    }

    const guruId = r.filled_by_teacher_id || FALLBACK_GURU_ID
    const tanggal = r.tanggal instanceof Date
      ? r.tanggal.toISOString().slice(0, 10)
      : String(r.tanggal).slice(0, 10)

    try {
      await client.query(
        `INSERT INTO eob5_absensi (student_id, guru_id, tanggal, status, keterangan, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, tanggal) DO NOTHING`,
        [tomatStudentId, guruId, tanggal, r.status, null, r.created_at]
      )
      inserted++
    } catch (e) {
      console.error(`  ERROR baris ${r.id}:`, e.message)
      skipped++
    }
  }

  console.log(`  ✓ inserted: ${inserted}, skipped(conflict): ${skipped}, unmapped: ${unmapped}`)
}

async function migratePoin(client, studentMap) {
  console.log('\n── Migrasi point_records → eob5_student_points ──')

  const { rows: old } = await client.query(
    `SELECT * FROM point_records ORDER BY tanggal, student_id`
  )
  console.log(`  Ditemukan ${old.length} baris di point_records`)

  let inserted = 0, skipped = 0, unmapped = 0

  for (const r of old) {
    const tomatStudentId = studentMap[r.student_id]
    if (!tomatStudentId) {
      unmapped++
      continue
    }

    const tanggal = r.tanggal instanceof Date
      ? r.tanggal.toISOString().slice(0, 10)
      : String(r.tanggal).slice(0, 10)

    try {
      await client.query(
        `INSERT INTO eob5_student_points (student_id, guru_id, jenis, poin, keterangan, tanggal, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tomatStudentId, null, r.jenis, Math.round(Number(r.poin)), r.keterangan, tanggal, r.created_at]
      )
      inserted++
    } catch (e) {
      console.error(`  ERROR baris ${r.id}:`, e.message)
      skipped++
    }
  }

  console.log(`  ✓ inserted: ${inserted}, skipped: ${skipped}, unmapped: ${unmapped}`)
}

async function main() {
  const client = await pool.connect()
  try {
    console.log('=== GURU Data Migration ===')

    const studentMap = await buildStudentMap(client)
    console.log(`Student map entries: ${Object.keys(studentMap).length}`)

    await client.query('BEGIN')

    await migrateAbsensi(client, studentMap)
    await migratePoin(client, studentMap)

    await client.query('COMMIT')
    console.log('\n✅ Migrasi selesai.')

    // Verifikasi
    const { rows: counts } = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM eob5_absensi)        AS absensi,
        (SELECT COUNT(*) FROM eob5_student_points) AS poin
    `)
    console.log('Verifikasi:', counts[0])
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Migrasi gagal, rollback:', e.message)
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

main()
