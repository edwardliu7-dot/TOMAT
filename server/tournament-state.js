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
 *   lobbyOpen: boolean,           // true = menunggu guru mulai; false = sudah berjalan
 *   lobby: { [userId]: { name, joinedAt } },  // siapa sudah masuk lobby
 *   currentRound: number,
 *   rounds: Round[],              // index 0 = ronde 1
 *   students: Student[],          // semua peserta
 *   mode: 'individual' | 'kelompok',
 *   teams: Team[] | null,         // hanya jika mode === 'kelompok'
 *   champion: Student | null,
 *   runnerUp: Student | null,
 *   semifinalists: Student[],
 *   createdAt: number,
 * }
 *
 * Round: { matches: Match[] }
 *
 * Match (individual):
 * {
 *   id, player1, player2, winner, status, roomCode, scores,
 *   walkoverTimer,
 *   _playerRounds, _playerCurrentQ, _playerFinished  (server-only)
 * }
 *
 * Match (kelompok) extra fields:
 * {
 *   teamJuruJawab: { [teamId]: userId },      // juru jawab per tim
 *   _teamMemberSockets: { [userId]: socketId }, // semua anggota yang join match room
 *   _teamJuruTimer: Timer | null,             // auto-select juru jawab timer
 *   _kelompokRound: number,                    // soal ke-berapa (shared)
 *   _kelompokCurrentQ: object | null,          // soal aktif (shared)
 *   _kelompokAnswers: { [teamId]: bool },      // sudah jawab soal ini?
 *   _kelompokFinishedRounds: number,           // soal yang sudah diselesaikan kedua tim
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
    const p2 = shuffled[i + 1] || null
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
      // Kelompok-specific
      teamJuruJawab:          {},
      _teamMemberSockets:     {},
      _teamJuruTimer:         null,
      _kelompokRound:         0,
      _kelompokCurrentQ:      null,
      _kelompokAnswers:       {},
      _kelompokFinishedRounds: 0,
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
    lobbyOpen:    t.lobbyOpen || false,
    lobby:        t.lobby
                    ? Object.values(t.lobby).map(e => ({ userId: e.userId, name: e.name }))
                    : [],
    teams:        t.teams
                    ? t.teams.map(tm => ({ id: tm.id, name: tm.name, memberCount: tm.members.length, members: tm.members.map(m => ({ userId: m.userId, name: m.name })) }))
                    : null,
    currentRound: t.currentRound,
    rounds: t.rounds.map(round => ({
      label: getRoundLabel(round.matches.length),
      matches: round.matches.map(m => ({
        id:            m.id,
        player1:       playerDTO(m.player1),
        player2:       playerDTO(m.player2),
        winner:        playerDTO(m.winner),
        status:        m.status,
        roomCode:      m.roomCode,
        scores:        m.scores,
        teamJuruJawab: m.teamJuruJawab || null,
      })),
    })),
    champion:      playerDTO(t.champion),
    runnerUp:      playerDTO(t.runnerUp),
    semifinalists: t.semifinalists ? t.semifinalists.map(playerDTO) : [],
  }
}
