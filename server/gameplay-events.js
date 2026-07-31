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

import { incrementMissionProgress, EVENT_MISSIONS } from './event-missions.js'

// ─── Internal helpers ─────────────────────────────────────────────────────────
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

/**
 * Sama seperti fire(), tapi awaitable dan mengembalikan hasil dari
 * incrementMissionProgress (atau null jika error / misi sudah selesai).
 * @param {string} studentId
 * @param {string} missionId
 * @param {number} [delta=1]
 * @returns {Promise<{progress, goal, justCompleted, autoCompleted, delta}|null>}
 */
async function fireAndReturn(studentId, missionId, delta = 1) {
  if (!studentId) return null
  try {
    return await incrementMissionProgress(studentId, missionId, delta)
  } catch (err) {
    console.error(`[gameplay-events] ${missionId} increment error (student=${studentId}):`, err.message)
    return null
  }
}

/**
 * Format raw incrementMissionProgress result + its auto-completed chain into
 * an array of toast-ready payload objects.
 * Returns [] when there is nothing to show (no progress, already complete, event inactive).
 *
 * ─── SHAPE ───────────────────────────────────────────────────────────────────
 * Array<{ missionId, nama, emoji, delta, newProgress, goal, completed }>
 *
 * Callers (player.js, multiplayer.js, tournament-engine.js) receive this array
 * directly and do NOT need to import EVENT_MISSIONS — keeping this file as the
 * single source of truth per RULES.md §16.
 */
function _formatDeltas(missionId, result) {
  if (!result || result.delta <= 0) return []
  const mission = EVENT_MISSIONS.find(m => m.id === missionId)
  const out = [{
    missionId,
    nama:        mission?.nama  ?? missionId,
    emoji:       mission?.emoji ?? '🎯',
    delta:       result.delta,
    newProgress: result.progress,
    goal:        result.goal,
    completed:   result.justCompleted,
  }]
  for (const autoId of (result.autoCompleted || [])) {
    const am = EVENT_MISSIONS.find(m => m.id === autoId)
    if (!am) continue
    out.push({
      missionId:   autoId,
      nama:        am.nama,
      emoji:       am.emoji ?? '🦅',
      delta:       0,
      newProgress: am.goal,
      goal:        am.goal,
      completed:   true,
    })
  }
  return out
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
 * Versi awaitable dari onCorrectAnswer.
 * Mengembalikan Array<MissionDelta> siap pakai — caller tidak perlu tahu
 * tentang EVENT_MISSIONS atau format payload (sesuai RULES.md §16).
 * Array kosong berarti tidak ada progress baru yang perlu ditampilkan.
 */
export async function onCorrectAnswerWithResult(studentId) {
  console.log(`[gameplay-events] onCorrectAnswerWithResult → student=${studentId}`)
  return _formatDeltas('kemerdekaan_1', await fireAndReturn(studentId, 'kemerdekaan_1'))
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
 * Versi awaitable dari onDuelWin.
 * Mengembalikan Array<MissionDelta> siap pakai — caller tidak perlu tahu
 * tentang EVENT_MISSIONS atau format payload (sesuai RULES.md §16).
 * Array kosong berarti tidak ada progress baru yang perlu ditampilkan.
 */
export async function onDuelWinWithResult(winnerId) {
  console.log(`[gameplay-events] onDuelWinWithResult → winner=${winnerId}`)
  return _formatDeltas('kemerdekaan_2', await fireAndReturn(winnerId, 'kemerdekaan_2'))
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
