/**
 * TOMAT Tournament — shared in-memory state
 * Pola sama dengan boss-state.js: module-level Map + setIo pattern.
 */

export const tournaments = new Map()  // tournamentId → Tournament

let _io = null
export function setTournamentIo(io) { _io = io }
export function getTournamentIo()   { return _io }

/**
 * Struktur Tournament:
 * {
 *   id: string (uuid),
 *   kelas: string,
 *   guruId: number,
 *   gameKey: string,
 *   status: 'in-progress' | 'finished',
 *   currentRound: number,
 *   rounds: Round[],       // index 0 = ronde 1
 *   students: Student[],   // semua peserta
 *   champion: Student | null,
 *   createdAt: number,
 * }
 *
 * Round: { matches: Match[] }
 *
 * Match: {
 *   id: string,
 *   player1: Student | null,  // null = tidak pernah terjadi (defensive)
 *   player2: Student | null,  // null = bye
 *   winner: Student | null,
 *   status: 'bye' | 'waiting-join' | 'in-progress' | 'finished' | 'walkover',
 *   roomCode: string | null,
 *   scores: { [userId]: number },
 *   walkoverTimer: NodeJS timer | null,
 *   _round: number,        // soal ke-berapa (server-only)
 *   _answers: object,      // jawaban ronde soal ini (server-only)
 *   _currentQ: object,     // soal aktif (server-only)
 * }
 *
 * Student: { userId, name, kelas, socketId | null }
 */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildFirstRound(students) {
  const shuffled = shuffle(students)
  const matches  = []
  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i]
    const p2 = shuffled[i + 1] || null  // null = bye
    matches.push({
      id:            crypto.randomUUID(),
      player1:       p1,
      player2:       p2,
      winner:        null,
      status:        p2 === null ? 'bye' : 'pending',
      roomCode:      null,
      scores:        {},
      walkoverTimer: null,
      _round:        0,
      _answers:      {},
      _currentQ:     null,
    })
  }
  return { matches }
}

/** Strip Map → safe DTO untuk dikirim ke client */
export function tournamentToClient(t) {
  if (!t) return null
  return {
    id:           t.id,
    kelas:        t.kelas,
    gameKey:      t.gameKey,
    status:       t.status,
    currentRound: t.currentRound,
    rounds: t.rounds.map(round => ({
      matches: round.matches.map(m => ({
        id:      m.id,
        player1: m.player1 ? { userId: m.player1.userId, name: m.player1.name } : null,
        player2: m.player2 ? { userId: m.player2.userId, name: m.player2.name } : null,
        winner:  m.winner  ? { userId: m.winner.userId,  name: m.winner.name  } : null,
        status:  m.status,
        roomCode: m.roomCode,
        scores:  m.scores,
      })),
    })),
    champion: t.champion ? { userId: t.champion.userId, name: t.champion.name } : null,
  }
}
