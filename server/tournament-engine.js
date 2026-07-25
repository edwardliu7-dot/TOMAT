/**
 * TOMAT Tournament Engine
 * Fungsi-fungsi inti untuk menjalankan turnamen: start match, handle answer,
 * finish match, check round complete, start next round.
 */
import { genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound, getTournamentIo } from './tournament-state.js'

const TOURNAMENT_MAX_ROUNDS  = 7
const WALKOVER_TIMEOUT_MS    = 60_000   // 60 detik jika tidak join
const NEXT_Q_DELAY_MS        = 2500     // jeda sebelum soal berikutnya
const NEXT_ROUND_DELAY_MS    = 5_000    // jeda sebelum ronde baru

// ─── Start one match ──────────────────────────────────────────────────────────
export function startTournamentMatch(io, tournament, match) {
  match.status  = 'in-progress'
  match.scores  = {}
  match._round  = 0
  match._answers = {}
  if (match.player1) match.scores[match.player1.userId] = 0
  if (match.player2) match.scores[match.player2.userId] = 0

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
  startTournamentRound(io, tournament, match)
}

// ─── Send one question to the match room ─────────────────────────────────────
function startTournamentRound(io, tournament, match) {
  match._round++
  const q = genTournamentQ(tournament.gameKey)
  match._currentQ = q
  match._answers  = {}  // reset jawaban untuk soal baru

  // Kirim ke client TANPA answer
  const { answer, ...safeQ } = q
  io.to(match.roomCode).emit('tournament:question', {
    question:  safeQ,
    round:     match._round,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores:    match.scores,
  })

  // Spectator guru juga terima soal (tanpa answer)
  io.to(`match-spectate:${match.id}`).emit('tournament:question', {
    question:  safeQ,
    round:     match._round,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores:    match.scores,
    matchId:   match.id,
  })
}

// ─── Handle a player's answer ─────────────────────────────────────────────────
export function handleTournamentAnswer(io, tournament, match, userId, value, socket) {
  if (match._answers[userId] !== undefined) return  // sudah jawab, abaikan
  match._answers[userId] = value

  const correct = (value === match._currentQ.answer)
  if (correct) match.scores[userId] = (match.scores[userId] || 0) + 1

  socket.emit('tournament:answer-result', {
    correct,
    correctAnswer: match._currentQ.answer,
    yourValue:     value,
    scores:        match.scores,
  })

  // Update spectator guru
  io.to(`match-spectate:${match.id}`).emit('tournament:player-answered', {
    userId, correct, value,
    scores:  match.scores,
    matchId: match.id,
  })

  // Cek apakah kedua pemain sudah jawab
  const playerIds = [match.player1?.userId, match.player2?.userId].filter(Boolean)
  const allAnswered = playerIds.every(id => match._answers[id] !== undefined)

  if (allAnswered) {
    if (match._round >= TOURNAMENT_MAX_ROUNDS) {
      setTimeout(() => finishTournamentMatch(io, tournament, match), NEXT_Q_DELAY_MS)
    } else {
      setTimeout(() => startTournamentRound(io, tournament, match), NEXT_Q_DELAY_MS)
    }
  }
}

// ─── Finish a match and determine winner ─────────────────────────────────────
function finishTournamentMatch(io, tournament, match) {
  if (match.status === 'finished' || match.status === 'walkover') return
  match.status = 'finished'

  const p1 = match.player1
  const p2 = match.player2
  const s1 = match.scores[p1?.userId] || 0
  const s2 = match.scores[p2?.userId] || 0

  if (!p2) {
    match.winner = p1
  } else if (s1 > s2) {
    match.winner = p1
  } else if (s2 > s1) {
    match.winner = p2
  } else {
    // Seri → random
    match.winner = Math.random() < 0.5 ? p1 : p2
  }

  io.to(match.roomCode).emit('tournament:match-over', {
    winner: { userId: match.winner.userId, name: match.winner.name },
    scores: match.scores,
    matchId: match.id,
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

  checkRoundComplete(io, tournament)
}

// ─── Check if ALL matches in current round are done ──────────────────────────
function checkRoundComplete(io, tournament) {
  const round = tournament.rounds[tournament.currentRound - 1]
  const allDone = round.matches.every(m =>
    ['finished', 'walkover', 'bye'].includes(m.status)
  )
  if (!allDone) return

  const winners = round.matches.map(m => m.winner).filter(Boolean)

  if (winners.length === 1) {
    // Turnamen selesai!
    tournament.status   = 'finished'
    tournament.champion = winners[0]
    io.to(`tournament:${tournament.id}`).emit('tournament:finished', {
      champion: { userId: winners[0].userId, name: winners[0].name },
      state:    tournamentToClient(tournament),
    })
    io.to(`kelas:${tournament.kelas}`).emit('tournament:finished', {
      champion: { userId: winners[0].userId, name: winners[0].name },
    })
    return
  }

  // Lanjut ke ronde berikutnya
  tournament.currentRound++
  const nextRound = buildFirstRound(winners)
  tournament.rounds.push(nextRound)

  setTimeout(() => {
    startTournamentRound_all(io, tournament)
  }, NEXT_ROUND_DELAY_MS)
}

// ─── Kick off all matches in current round ────────────────────────────────────
export function startTournamentRound_all(io, tournament) {
  const round = tournament.rounds[tournament.currentRound - 1]

  // Notify semua peserta
  io.to(`kelas:${tournament.kelas}`).emit('tournament:round-start', {
    round: tournament.currentRound,
    state: tournamentToClient(tournament),
  })

  round.matches.forEach(match => {
    // Bye: langsung lolos
    if (match.status === 'bye') {
      match.winner = match.player1
      return
    }

    match.status   = 'waiting-join'
    match.roomCode = `t-${tournament.id}-${match.id}`.slice(0, 24)

    // Notify player 1
    const p1Socket = io.sockets.sockets.get(match.player1?.socketId)
    p1Socket?.emit('tournament:your-match', {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     match.player2
        ? { userId: match.player2.userId, name: match.player2.name }
        : null,
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    })

    // Notify player 2
    const p2Socket = match.player2 && io.sockets.sockets.get(match.player2?.socketId)
    p2Socket?.emit('tournament:your-match', {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     { userId: match.player1.userId, name: match.player1.name },
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    })

    // Walkover timer: 60 detik jika tidak join
    match.walkoverTimer = setTimeout(() => {
      if (match.status !== 'waiting-join') return

      const p1Joined = !!match.player1?.socketId
      const p2Joined = !!match.player2?.socketId

      if (!p1Joined && p2Joined) {
        match.winner = match.player2
      } else if (p1Joined && !p2Joined) {
        match.winner = match.player1
      } else {
        match.winner = Math.random() < 0.5 ? match.player1 : match.player2
      }

      match.status = 'walkover'
      io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
      checkRoundComplete(io, tournament)
    }, WALKOVER_TIMEOUT_MS)
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
}
