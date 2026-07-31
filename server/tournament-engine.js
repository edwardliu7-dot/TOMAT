/**
 * TOMAT Tournament Engine
 * Fungsi-fungsi inti untuk menjalankan turnamen: start match, handle answer,
 * finish match, check round complete, start next round.
 *
 * Async flow: setiap pemain maju ke soal berikutnya secara independen
 * tanpa menunggu lawan menjawab.
 */
import { genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound, buildFirstRoundFromTeams, getTournamentIo } from './tournament-state.js'
import { pool } from './db.js'
import { onCorrectAnswer, onTournamentWin } from './gameplay-events.js'

async function saveTournamentHistory(tournament, status) {
  try {
    const totalParticipants = tournament.rounds?.[0]?.matches?.reduce(
      (a, m) => a + (m.player1 ? 1 : 0) + (m.player2 ? 1 : 0), 0
    ) ?? 0
    await pool.query(
      `insert into tournament_history
         (id, kelas, guru_id, game_key, status, champion_name, champion_id,
          total_participants, total_rounds, finished_at,
          kelas_arr, runner_up_name, runner_up_id, third_place_names)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10,$11,$12,$13)
       on conflict (id) do nothing`,
      [
        tournament.id,
        tournament.kelas,
        tournament.guruId,
        tournament.gameKey,
        status,
        tournament.champion?.name ?? null,
        tournament.champion?.userId ?? null,
        totalParticipants,
        tournament.rounds?.length ?? 0,
        tournament.kelasArr ?? [tournament.kelas],
        tournament.runnerUp?.name ?? null,
        tournament.runnerUp?.userId ?? null,
        tournament.semifinalists?.map(s => s.name) ?? null,
      ]
    )
  } catch (err) {
    console.error('saveTournamentHistory error', err)
  }
}

const TOURNAMENT_MAX_ROUNDS  = 7
const WALKOVER_TIMEOUT_MS    = 60_000   // 60 detik jika tidak join
const NEXT_Q_DELAY_MS        = 1200     // jeda sebelum soal berikutnya (per-player, async)
const NEXT_ROUND_DELAY_MS    = 5_000    // jeda sebelum ronde baru

function emitToUser(io, userId, event, payload) {
  for (const socket of io.sockets.sockets.values()) {
    if (String(socket.data?.userId) === String(userId)) {
      socket.emit(event, payload)
    }
  }
}

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

  // Delegate correct-answer side-effects to the centralized gameplay event bus.
  if (correct) onCorrectAnswer(userId)

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

// ─── Award coins to podium players ───────────────────────────────────────────
const TOURNAMENT_REWARDS = { 1: 500, 2: 250, 3: 100 }

async function grantTournamentRewards(io, tournament) {
  const recipients = [
    { player: tournament.champion,  rank: 1 },
    { player: tournament.runnerUp,  rank: 2 },
    ...(tournament.semifinalists || []).map(s => ({ player: s, rank: 3 })),
  ].filter(r => r.player?.userId)

  for (const { player, rank } of recipients) {
    const amount = TOURNAMENT_REWARDS[rank]
    try {
      const { rows } = await pool.query(
        `update students
           set coins              = coins              + $1,
               total_coins_earned = total_coins_earned + $1
         where id = $2
         returning coins`,
        [amount, player.userId]
      )
      const newCoins = rows[0]?.coins
      emitToUser(io, player.userId, 'tournament:reward', { amount, rank, newCoins })
    } catch (err) {
      console.error(`grantTournamentRewards rank ${rank} error:`, err)
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

  // Delegate tournament-win side-effects to the centralized gameplay event bus.
  onTournamentWin(match.winner.userId)

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

    // ── Podium: runner-up & semifinalists ─────────────────────────────────
    // Runner-up = loser of the final match
    const finalMatch = round.matches.find(
      m => m.player1 && m.player2 && ['finished','walkover'].includes(m.status)
    )
    if (finalMatch?.winner) {
      const loser = finalMatch.winner.userId === finalMatch.player1.userId
        ? finalMatch.player2 : finalMatch.player1
      if (loser) tournament.runnerUp = loser
    }
    // Semifinalists = losers from second-to-last round (if it had ≥2 real matches)
    if (tournament.rounds.length >= 2) {
      const semiFinalRound = tournament.rounds[tournament.rounds.length - 2]
      const sfLosers = semiFinalRound.matches
        .filter(m => m.winner && m.player1 && m.player2)
        .map(m => m.winner.userId === m.player1.userId ? m.player2 : m.player1)
        .filter(Boolean)
      if (sfLosers.length > 0) tournament.semifinalists = sfLosers
    }

    const finishedState = tournamentToClient(tournament)
    io.to(`tournament:${tournament.id}`).emit('tournament:finished', {
      champion: { userId: winners[0].userId, name: winners[0].name },
      state:    finishedState,
    })
    // Emit to all kelas rooms
    const allKelas = tournament.kelasArr || [tournament.kelas]
    allKelas.forEach(k => {
      io.to(`kelas:${k}`).emit('tournament:finished', {
        champion: { userId: winners[0].userId, name: winners[0].name },
      })
    })
    saveTournamentHistory(tournament, 'finished')
    grantTournamentRewards(io, tournament)
    return
  }

  // Lanjut ke ronde berikutnya
  tournament.currentRound++
  let nextRound
  if (tournament.mode === 'kelompok' && tournament.teams) {
    const winningTeams = [...new Map(
      winners
        .filter(w => w.teamId)
        .map(w => [w.teamId, tournament.teams.find(t => t.id === w.teamId)])
        .filter(([, t]) => t)
    ).values()]
    nextRound = buildFirstRoundFromTeams(winningTeams, tournament.currentRound)
  } else {
    nextRound = buildFirstRound(winners)
  }
  tournament.rounds.push(nextRound)

  setTimeout(() => {
    startTournamentRound_all(io, tournament)
  }, NEXT_ROUND_DELAY_MS)
}

// ─── Kick off all matches in current round ────────────────────────────────────
export function startTournamentRound_all(io, tournament) {
  const round = tournament.rounds[tournament.currentRound - 1]

  // Notify semua peserta di semua kelas
  const allKelasForRound = tournament.kelasArr || [tournament.kelas]
  allKelasForRound.forEach(k => {
    io.to(`kelas:${k}`).emit('tournament:round-start', {
      round: tournament.currentRound,
      state: tournamentToClient(tournament),
    })
  })

  round.matches.forEach(match => {
    // Bye: langsung lolos
    if (match.status === 'bye') {
      match.winner = match.player1
      return
    }

    match.status   = 'waiting-join'
    match.roomCode = `t-${tournament.id}-${match.id}`.slice(0, 24)

    // Notify players by authenticated user id. At the beginning of a round
    // socketId can still be null because the player has not opened the match.
    const p1Payload = {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     match.player2
        ? { userId: match.player2.userId, name: match.player2.name }
        : null,
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    }
    emitToUser(io, match.player1?.userId, 'tournament:your-match', p1Payload)

    const p2Payload = {
      matchId:      match.id,
      tournamentId: tournament.id,
      opponent:     { userId: match.player1.userId, name: match.player1.name },
      gameKey:      tournament.gameKey,
      round:        tournament.currentRound,
    }
    if (match.player2) {
      emitToUser(io, match.player2.userId, 'tournament:your-match', p2Payload)
    }

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
