/**
 * server/gameplay-events.js — Centralized Gameplay Event Bus
 *
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  SINGLE SOURCE OF TRUTH untuk semua side-effect gameplay.    ║
 * ║                                                               ║
 * ║  Modul lain DILARANG memanggil incrementMissionProgress()    ║
 * ║  secara langsung. Semua mode permainan harus memanggil       ║
 * ║  fungsi-fungsi di bawah ini.                                 ║
 * ║                                                               ║
 * ║  Menambah misi baru atau event baru?                         ║
 * ║  → Cukup tambahkan fire() di fungsi yang relevan di sini.   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * Fungsi-fungsi ini bersifat fire-and-forget: aman dipanggil tanpa
 * await — error ditangkap dan di-log, tidak pernah dilempar ke pemanggil.
 */

import { incrementMissionProgress } from './event-missions.js'

// ─── Internal helper ──────────────────────────────────────────────────────────
/**
 * Kirim satu increment ke sebuah misi. Fire-and-forget.
 * @param {string} studentId
 * @param {string} missionId
 * @param {number} [delta=1]
 */
function fire(studentId, missionId, delta = 1) {
  if (!studentId) return
  incrementMissionProgress(studentId, missionId, delta).catch(err => {
    console.error(`[gameplay-events] ${missionId} increment error (student=${studentId}):`, err.message)
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * onCorrectAnswer(studentId)
 *
 * Dipanggil setiap kali siswa menjawab SATU soal dengan benar,
 * di mode permainan manapun: minigame (free-play/tugas), duel, atau turnamen.
 *
 * Misi yang diperbarui secara otomatis:
 *   • kemerdekaan_1 — "Lomba 17-an" (+1 per jawaban benar)
 *
 * Untuk menambah misi baru yang bergantung pada jawaban benar,
 * cukup tambahkan fire() di sini — semua mode permainan sudah
 * terhubung dan tidak perlu diubah.
 */
export function onCorrectAnswer(studentId) {
  console.log(`[gameplay-events] onCorrectAnswer → student=${studentId}`)
  fire(studentId, 'kemerdekaan_1')
}

/**
 * onDuelWin(winnerId)
 *
 * Dipanggil ketika seorang siswa memenangkan pertandingan duel 1v1.
 * Tidak dipanggil saat seri (draw).
 *
 * Misi yang diperbarui secara otomatis:
 *   • kemerdekaan_2 — "Pasukan Merah Putih" (+1 per kemenangan)
 *   • kemerdekaan_3 — "Garuda Matematika" (auto-complete via
 *                      _autoCompleteRequires ketika misi 1 & 2 selesai)
 *
 * Untuk menambah misi baru berbasis kemenangan duel, cukup tambahkan
 * fire() di sini.
 */
export function onDuelWin(winnerId) {
  console.log(`[gameplay-events] onDuelWin → winner=${winnerId}`)
  fire(winnerId, 'kemerdekaan_2')
}

/**
 * onTournamentWin(winnerId)
 *
 * Dipanggil ketika seorang siswa memenangkan satu match turnamen.
 * Placeholder — belum ada misi event yang terhubung, tetapi
 * strukturnya siap bila misi turnamen ditambahkan.
 */
export function onTournamentWin(winnerId) {
  // Tambahkan fire() di sini bila ada misi berbasis kemenangan turnamen.
  console.log(`[gameplay-events] onTournamentWin → winner=${winnerId} (no active missions)`)
}
