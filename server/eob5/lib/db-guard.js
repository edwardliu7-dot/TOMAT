/**
 * server/eob5/lib/db-guard.js
 *
 * ⛔ MIGRATION PREVENTION GUARD — LAPISAN 3 (eob5 query-level)
 *
 * Semua file server/eob5/ WAJIB mengimpor `guardedPool` dari sini,
 * BUKAN mengimpor `pool` langsung dari '../../db.js'.
 *
 * guardedPool.query() identik dengan pool.query() kecuali satu hal:
 * jika SQL mereferensi tabel-tabel yang SUDAH DI-DROP karena menduplikat
 * data lama app GuruEOB5, query langsung DITOLAK dengan error yang jelas.
 *
 * Logika guard (daftar tabel terlarang + regex check) dikelola secara
 * sentral di server/db.js — file ini hanya meneruskannya.
 *
 * Tujuan: mencegah developer (atau agent) secara tidak sengaja membuat
 * ulang tabel-tabel tersebut atau menulis query yang bergantung padanya.
 *
 * Tabel terlarang lengkap dan penggantinya: lihat server/db.js
 * § MIGRATION PREVENTION GUARD.
 */

export {
  MIGRATION_FORBIDDEN_TABLES as FORBIDDEN_TABLES,
  guardedPool,
  assertNoForbiddenTables,
} from '../../db.js'
