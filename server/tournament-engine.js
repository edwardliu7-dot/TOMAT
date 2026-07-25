/**
 * TOMAT Tournament Engine
 * Fungsi-fungsi inti untuk menjalankan turnamen: start match, handle answer,
 * finish match, check round complete, start next round.
 *
 * Async flow: setiap pemain maju ke soal berikutnya secara independen
 * tanpa menunggu lawan menjawab.
 */
import { genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound, getTournamentIo } from './tournament-state.js'

const TOURNAMENT_MAX_ROUNDS  = 7
const WALKOVER_TIMEOUT_MS    = 60_000   // 60 detik jika tidak join
const NEXT_Q_DELAY_MS        = 1200     // jeda sebelum soal berikutnya (per-player, async)
const NEXT_ROUND_DELAY_MS    = 5_000    // jeda sebelum ronde baru

// ─── Send one question to a single player ────────────────────────────────────
function startPlayerTournamentRound(io, tournament, match, userId) {
  match._playerRounds  = match._playerRounds  || {}
  match._playerCurrentQ = match._playerCurrentQ || {}

  match._playerRounds[userId] = (match._playerRounds[userId] || 0) + 1

  const q = genTournamentQ(tournament.gameKey)
  match._playerCurrentQ[userId] = q
  const { answer, ...safeQ } = q

  const playerRound = match._playerRounds[userId]

  // Find socket for this specific player
  const playerInfo = [match.player1, match.player2].find(p => p?.userId === userId)
  const playerSocket = io.sockets.sockets.get(playerInfo?.socketId)

  playerSocket?.emit('tournament:question', {
    question:  safeQ,
    round:     playerRound,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores:    match.scores,
  })

  // Spectator guru (best-effort, sees latest question sent)
  io.to(`match-spectate:${match.id}`).emit('tournament:question', {
    question:  safeQ,
    round:     playerRound,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores:    match.scores,
    matchId:   match.id,
  })
}

// ─── Start one match ──────────────────────────────────────────────────────────
export function startTournamentMatch(io, tournament, match) {
  match.status  = 'in-progress'
  match.scores  = {}
  match._playerRounds   = {}
  match._playerFinished = {}
  match._playerCurrentQ = {}
  if (match.player1) match.scores[match.player1.userId] = 0
  if (match.player2) match.scores[match.player2.userId] = 0

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

  // Async flow: send each player their own first question independently
  if (match.player1) startPlayerTournamentRound(io, tournament, match, match.player1.userId)
  if (match.player2) startPlayerTournamentRound(io, tournament, match, match.player2.userId)
}

// ─── Handle a player's answer ─────────────────────────────────────────────────
export function handleTournamentAnswer(io, tournament, match, userId, value, socket) {
  match._playerRounds   = match._playerRounds   || {}
  match._playerFinished = match._playerFinished || {}
  match._playerCurrentQ = match._playerCurrentQ || {}

  // Jika tidak ada soal aktif untuk player ini (sudah jawab / belum terima soal), abaikan
  const currentQ = match._playerCurrentQ[userId]
  if (!currentQ) return

  const playerRound = match._playerRounds[userId] || 0

  const correct = (value === currentQ.answer)
  if (correct) match.scores[userId] = (match.scores[userId] || 0) + 1

  // Hapus soal aktif untuk mencegah double-submit
  match._playerCurrentQ[userId] = null

  // Kirim hasil ke player ini
  socket.emit('tournament:answer-result', {
    correct,
    correctAnswer: currentQ.answer,
    yourValue:     value,
    scores:        match.scores,
  })

  // Update spectator guru
  io.to(`match-spectate:${match.id}`).emit('tournament:player-answered', {
    userId, correct, value,
    scores:  match.scores,
    matchId: match.id,
  })

  // Beritahu lawan: skor kita terbaru (realtime, lawan mungkin masih bermain atau di leaderboard)
  const opponent = [match.player1, match.player2].find(p => p?.userId !== userId)
  if (opponent?.socketId) {
    const oppSocket = io.sockets.sockets.get(opponent.socketId)
    oppSocket?.emit('tournament:score-update', {
      opponentScore: match.scores[userId],
      opponentRound: playerRound,
    })
  }

  if (playerRound >= TOURNAMENT_MAX_ROUNDS) {
    // Player ini sudah selesai semua soal
    match._playerFinished[userId] = true

    const opponentId = opponent?.userId
    if (!opponentId || match._playerFinished[opponentId]) {
      // Kedua pemain selesai → tentukan pemenang
      finishTournamentMatch(io, tournament, match)
    } else {
      // Lawan masih bermain → masukkan player ini ke leaderboard, tunggu lawan
      socket.emit('tournament:self-finished', {
        scores: match.scores,
      })
    }
  } else {
    // Langsung kirim soal berikutnya ke player ini setelah jeda singkat
    setTimeout(() => {
      if (match.status === 'in-progress') {
        startPlayerTournamentRound(io, tournament, match, userId)
      }
    }, NEXT_Q_DELAY_MS)
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
