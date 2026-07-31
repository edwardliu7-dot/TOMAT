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
 *   mode: 'individual' | 'kelompok',
 *   teams: Team[] | null,  // hanya jika mode === 'kelompok'
 *   champion: Student | null,
 *   runnerUp: Student | null,
 *   semifinalists: Student[],
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
 * Student: { userId, name, kelas, socketId | null, teamId?, teamName? }
 *
 * Team: { id, name, members: Student[] }
 */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Label otomatis untuk tiap ronde berdasarkan jumlah pertandingan.
 * matchCount = jumlah match di ronde tersebut.
 */
export function getRoundLabel(matchCount) {
  if (matchCount <= 1) return 'Final'
  if (matchCount <= 2) return 'Semifinal'
  if (matchCount <= 4) return 'Perempat Final'
  return `Babak ${matchCount * 2} Besar`
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

/**
 * Bagi siswa ke N kelompok secara acak (round-robin setelah shuffle).
 */
export function buildTeams(students, count) {
  const shuffled = shuffle(students)
  const teams = Array.from({ length: count }, (_, i) => ({
    id:      crypto.randomUUID(),
    name:    `Kelompok ${i + 1}`,
    members: [],
  }))
  shuffled.forEach((s, i) => {
    teams[i % count].members.push(s)
  })
  return teams
}

/**
 * Pilih representatif untuk babak tertentu (rotasi per ronde).
 */
export function getTeamRepresentative(team, roundNumber) {
  const idx = (roundNumber - 1) % team.members.length
  return { ...team.members[idx], teamId: team.id, teamName: team.name, socketId: null }
}

/**
 * Buat ronde dari daftar tim — representatif bergilir per ronde.
 */
export function buildFirstRoundFromTeams(teams, roundNumber = 1) {
  const shuffled = shuffle(teams)
  const matches  = []
  for (let i = 0; i < shuffled.length; i += 2) {
    const team1 = shuffled[i]
    const team2 = shuffled[i + 1] || null
    const p1 = getTeamRepresentative(team1, roundNumber)
    const p2 = team2 ? getTeamRepresentative(team2, roundNumber) : null
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

function playerDTO(p) {
  if (!p) return null
  return {
    userId:   p.userId,
    name:     p.name,
    teamId:   p.teamId   || null,
    teamName: p.teamName || null,
  }
}

/** Strip Map → safe DTO untuk dikirim ke client */
export function tournamentToClient(t) {
  if (!t) return null
  return {
    id:           t.id,
    kelas:        t.kelas,
    kelasArr:     t.kelasArr || [t.kelas],
    gameKey:      t.gameKey,
    status:       t.status,
    mode:         t.mode || 'individual',
    teams:        t.teams
                    ? t.teams.map(tm => ({ id: tm.id, name: tm.name, memberCount: tm.members.length }))
                    : null,
    currentRound: t.currentRound,
    rounds: t.rounds.map(round => ({
      label: getRoundLabel(round.matches.length),
      matches: round.matches.map(m => ({
        id:      m.id,
        player1: playerDTO(m.player1),
        player2: playerDTO(m.player2),
        winner:  playerDTO(m.winner),
        status:  m.status,
        roomCode: m.roomCode,
        scores:  m.scores,
      })),
    })),
    champion:      playerDTO(t.champion),
    runnerUp:      playerDTO(t.runnerUp),
    semifinalists: t.semifinalists ? t.semifinalists.map(playerDTO) : [],
  }
}
