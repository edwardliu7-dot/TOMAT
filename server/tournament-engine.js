/**
 * TOMAT Tournament Engine
 * Fungsi-fungsi inti untuk menjalankan turnamen: start match, handle answer,
 * finish match, check round complete, start next round.
 *
 * Individual mode: setiap pemain maju ke soal berikutnya secara independen.
 * Kelompok mode: semua anggota tim melihat soal yang sama; hanya juru jawab yang submit.
 */
import { genTournamentQ } from './tournament-questions.js'
import { tournaments, tournamentToClient, buildFirstRound, buildFirstRoundFromTeams, getTournamentIo } from './tournament-state.js'
import { pool } from './db.js'
import { onCorrectAnswer, onTournamentWin, onCorrectAnswerWithResult } from './gameplay-events.js'

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

export const TOURNAMENT_MAX_ROUNDS  = 7
const WALKOVER_TIMEOUT_MS    = 60_000   // 60 detik jika tidak join
const JURU_SELECT_TIMEOUT_MS = 30_000  // 30 detik pilih juru jawab, lalu auto
const NEXT_Q_DELAY_MS        = 1200    // jeda sebelum soal berikutnya
const NEXT_ROUND_DELAY_MS    = 5_000   // jeda sebelum ronde baru

export function emitToUser(io, userId, event, payload) {
  for (const socket of io.sockets.sockets.values()) {
    if (String(socket.data?.userId) === String(userId)) {
      socket.emit(event, payload)
    }
  }
}

// ─── Helpers for kelompok ─────────────────────────────────────────────────────
/** Kirim soal yang sama ke SEMUA anggota yang sudah join match room (kelompok) */
function sendQuestionToAllTeamMembers(io, tournament, match) {
  match._kelompokRound++
  const q = genTournamentQ(tournament.gameKey)
  match._kelompokCurrentQ  = q
  match._kelompokAnswers   = {}

  const { answer, ...safeQ } = q
  const payload = {
    question:        safeQ,
    round:           match._kelompokRound,
    maxRounds:       TOURNAMENT_MAX_ROUNDS,
    scores:          match.scores,
    isKelompok:      true,
    teamJuruJawab:   match.teamJuruJawab,
  }

  // Kirim ke semua anggota yang sudah join (tertrack di _teamMemberSockets)
  for (const [userId, socketId] of Object.entries(match._teamMemberSockets || {})) {
    const sock = io.sockets.sockets.get(socketId)
    sock?.emit('tournament:question', payload)
  }

  // Guru spectator
  io.to(`match-spectate:${match.id}`).emit('tournament:question', {
    ...payload,
    matchId: match.id,
  })
}

/** Cari teamId dari userId berdasarkan tournament.teams */
export function getTeamIdForUser(tournament, userId) {
  if (!tournament.teams) return null
  for (const team of tournament.teams) {
    if (team.members.some(m => String(m.userId) === String(userId))) {
      return team.id
    }
  }
  return null
}

/** Dapatkan teamRepUserId (player1 atau player2) untuk sebuah teamId */
function getTeamRepUserId(match, teamId) {
  if (match.player1?.teamId === teamId) return match.player1.userId
  if (match.player2?.teamId === teamId) return match.player2.userId
  return null
}

// ─── Send one question to a single player (individual mode) ──────────────────
function startPlayerTournamentRound(io, tournament, match, userId) {
  match._playerRounds   = match._playerRounds   || {}
  match._playerCurrentQ = match._playerCurrentQ || {}

  match._playerRounds[userId] = (match._playerRounds[userId] || 0) + 1

  const q = genTournamentQ(tournament.gameKey)
  match._playerCurrentQ[userId] = q
  const { answer, ...safeQ } = q

  const playerRound = match._playerRounds[userId]
  const playerInfo  = [match.player1, match.player2].find(p => p?.userId === userId)
  const playerSocket = io.sockets.sockets.get(playerInfo?.socketId)

  playerSocket?.emit('tournament:question', {
    question:  safeQ,
    round:     playerRound,
    maxRounds: TOURNAMENT_MAX_ROUNDS,
    scores:    match.scores,
  })

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
  match.status = 'in-progress'
  match.scores = {}
  if (match.player1) match.scores[match.player1.userId] = 0
  if (match.player2) match.scores[match.player2.userId] = 0

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

  if (tournament.mode === 'kelompok') {
    // Kelompok: inisialisasi dan kirim soal ke semua anggota
    match._kelompokRound          = 0
    match._kelompokCurrentQ       = null
    match._kelompokAnswers        = {}
    match._kelompokFinishedRounds = 0
    sendQuestionToAllTeamMembers(io, tournament, match)
  } else {
    // Individual: soal terpisah per pemain
    match._playerRounds   = {}
    match._playerFinished = {}
    match._playerCurrentQ = {}
    if (match.player1) startPlayerTournamentRound(io, tournament, match, match.player1.userId)
    if (match.player2) startPlayerTournamentRound(io, tournament, match, match.player2.userId)
  }
}

// ─── Auto-select juru jawab jika waktu habis (kelompok) ──────────────────────
export function autoSelectJuruJawab(io, tournament, match) {
  const { player1, player2 } = match
  // Team1
  if (player1?.teamId && !match.teamJuruJawab[player1.teamId]) {
    // Pakai representative, atau anggota pertama yang join
    const fallbackId = player1.userId
    match.teamJuruJawab[player1.teamId] = fallbackId
    io.to(match.roomCode).emit('tournament:juru-jawab-set', {
      teamId:   player1.teamId,
      userId:   fallbackId,
      name:     player1.name,
      autoSelected: true,
    })
  }
  // Team2
  if (player2?.teamId && !match.teamJuruJawab[player2.teamId]) {
    const fallbackId = player2.userId
    match.teamJuruJawab[player2.teamId] = fallbackId
    io.to(match.roomCode).emit('tournament:juru-jawab-set', {
      teamId:   player2.teamId,
      userId:   fallbackId,
      name:     player2.name,
      autoSelected: true,
    })
  }
  match._teamJuruTimer = null
  startTournamentMatch(io, tournament, match)
}

// ─── Check if juru jawab selected for both teams → start match ───────────────
export function checkAndStartKelompokMatch(io, tournament, match) {
  const { player1, player2 } = match
  if (!player1 || !player2) return // bye — handled separately
  const team1Ready = !!match.teamJuruJawab[player1.teamId]
  const team2Ready = !!match.teamJuruJawab[player2.teamId]
  if (team1Ready && team2Ready) {
    if (match._teamJuruTimer) { clearTimeout(match._teamJuruTimer); match._teamJuruTimer = null }
    startTournamentMatch(io, tournament, match)
  }
}

// ─── Handle a player's answer (individual mode) ───────────────────────────────
async function handleIndividualAnswer(io, tournament, match, userId, value, socket) {
  match._playerRounds   = match._playerRounds   || {}
  match._playerFinished = match._playerFinished || {}
  match._playerCurrentQ = match._playerCurrentQ || {}

  const currentQ = match._playerCurrentQ[userId]
  if (!currentQ) return

  const playerRound = match._playerRounds[userId] || 0
  const correct = (value === currentQ.answer)
  if (correct) match.scores[userId] = (match.scores[userId] || 0) + 1

  if (correct) {
    const deltas = await onCorrectAnswerWithResult(userId)
    for (const delta of deltas) emitToUser(io, userId, 'mission:progress', delta)
  }

  match._playerCurrentQ[userId] = null

  socket.emit('tournament:answer-result', {
    correct,
    correctAnswer: currentQ.answer,
    yourValue:     value,
    scores:        match.scores,
  })

  const playerInfo = [match.player1, match.player2].find(p => p?.userId === userId)
  io.to(`match-spectate:${match.id}`).emit('tournament:player-answered', {
    userId, correct, value,
    scores:     match.scores,
    matchId:    match.id,
    playerName: playerInfo?.name ?? null,
    round:      playerRound,
  })

  const opponent = [match.player1, match.player2].find(p => p?.userId !== userId)
  if (opponent?.socketId) {
    const oppSocket = io.sockets.sockets.get(opponent.socketId)
    oppSocket?.emit('tournament:score-update', {
      opponentScore: match.scores[userId],
      opponentRound: playerRound,
    })
  }

  if (playerRound >= TOURNAMENT_MAX_ROUNDS) {
    match._playerFinished[userId] = true

    const finishedPlayerInfo = [match.player1, match.player2].find(p => p?.userId === userId)
    io.to(`match-spectate:${match.id}`).emit('tournament:player-finished', {
      userId,
      playerName: finishedPlayerInfo?.name ?? null,
      score:      match.scores[userId] ?? 0,
      matchId:    match.id,
    })

    const opponentId = opponent?.userId
    if (!opponentId || match._playerFinished[opponentId]) {
      finishTournamentMatch(io, tournament, match)
    } else {
      socket.emit('tournament:self-finished', { scores: match.scores })
    }
  } else {
    setTimeout(() => {
      if (match.status === 'in-progress') {
        startPlayerTournamentRound(io, tournament, match, userId)
      }
    }, NEXT_Q_DELAY_MS)
  }
}

// ─── Handle a juru jawab's answer (kelompok mode) ─────────────────────────────
async function handleKelompokAnswer(io, tournament, match, userId, value, socket, teamId) {
  const currentQ = match._kelompokCurrentQ
  if (!currentQ) return
  if (match._kelompokAnswers[teamId]) return // sudah jawab soal ini

  match._kelompokAnswers[teamId] = true

  const correct = (value === currentQ.answer)
  const teamRepId = getTeamRepUserId(match, teamId)
  if (correct && teamRepId) {
    match.scores[teamRepId] = (match.scores[teamRepId] || 0) + 1
  }

  if (correct) {
    const deltas = await onCorrectAnswerWithResult(userId)
    for (const delta of deltas) emitToUser(io, userId, 'mission:progress', delta)
  }

  // Broadcast hasil jawaban tim ke seluruh anggota di match room
  io.to(match.roomCode).emit('tournament:team-answer-result', {
    teamId,
    correct,
    correctAnswer: currentQ.answer,
    yourValue:     value,
    scores:        match.scores,
    answeredBy:    userId,
  })

  // Guru spectator
  io.to(`match-spectate:${match.id}`).emit('tournament:player-answered', {
    userId, correct, value,
    scores:     match.scores,
    matchId:    match.id,
    playerName: `[${match.player1?.teamId === teamId ? match.player1.teamName : match.player2?.teamName}] ${(tournament.teams?.find(t => t.id === teamId)?.members.find(m => String(m.userId) === String(userId))?.name ?? String(userId))}`,
    round:      match._kelompokRound,
  })

  // Cek apakah KEDUA tim sudah menjawab
  const team1Id = match.player1?.teamId
  const team2Id = match.player2?.teamId
  const team1Done = !team1Id || match._kelompokAnswers[team1Id]
  const team2Done = !team2Id || match._kelompokAnswers[team2Id]

  if (team1Done && team2Done) {
    match._kelompokFinishedRounds = (match._kelompokFinishedRounds || 0) + 1
    match._kelompokCurrentQ = null // clear soal aktif

    if (match._kelompokFinishedRounds >= TOURNAMENT_MAX_ROUNDS) {
      // Semua soal selesai
      setTimeout(() => {
        if (match.status === 'in-progress') finishTournamentMatch(io, tournament, match)
      }, NEXT_Q_DELAY_MS)
    } else {
      setTimeout(() => {
        if (match.status === 'in-progress') sendQuestionToAllTeamMembers(io, tournament, match)
      }, NEXT_Q_DELAY_MS)
    }
  } else {
    // Satu tim sudah jawab, tunggu tim lain
    io.to(match.roomCode).emit('tournament:waiting-other-team', {
      answeredTeamId: teamId,
      scores:         match.scores,
    })
  }
}

// ─── Public: handle tournament answer (dispatches to mode-specific handler) ──
export async function handleTournamentAnswer(io, tournament, match, userId, value, socket) {
  if (match.status !== 'in-progress') return

  if (tournament.mode === 'kelompok') {
    // Hanya juru jawab yang boleh menjawab
    const teamId = getTeamIdForUser(tournament, userId)
    if (!teamId) return
    const juruJawabId = match.teamJuruJawab?.[teamId]
    if (!juruJawabId || String(juruJawabId) !== String(userId)) {
      socket.emit('tournament:error', { message: 'Hanya juru jawab yang boleh menjawab.' })
      return
    }
    await handleKelompokAnswer(io, tournament, match, userId, value, socket, teamId)
  } else {
    await handleIndividualAnswer(io, tournament, match, userId, value, socket)
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
      // For kelompok: reward ALL members of winning team
      if (tournament.mode === 'kelompok' && player.teamId) {
        const team = tournament.teams?.find(t => t.id === player.teamId)
        const members = team?.members || [player]
        for (const member of members) {
          const { rows } = await pool.query(
            `update students set coins = coins + $1, total_coins_earned = total_coins_earned + $1 where id = $2 returning coins`,
            [amount, member.userId]
          )
          const newCoins = rows[0]?.coins
          emitToUser(io, member.userId, 'tournament:reward', { amount, rank, newCoins })
        }
      } else {
        const { rows } = await pool.query(
          `update students set coins = coins + $1, total_coins_earned = total_coins_earned + $1 where id = $2 returning coins`,
          [amount, player.userId]
        )
        const newCoins = rows[0]?.coins
        emitToUser(io, player.userId, 'tournament:reward', { amount, rank, newCoins })
      }
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
    match.winner = Math.random() < 0.5 ? p1 : p2
  }

  io.to(match.roomCode).emit('tournament:match-over', {
    winner: { userId: match.winner.userId, name: match.winner.name, teamName: match.winner.teamName || null },
    scores: match.scores,
    matchId: match.id,
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))

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
    tournament.status   = 'finished'
    tournament.champion = winners[0]

    const finalMatch = round.matches.find(
      m => m.player1 && m.player2 && ['finished','walkover'].includes(m.status)
    )
    if (finalMatch?.winner) {
      const loser = finalMatch.winner.userId === finalMatch.player1.userId
        ? finalMatch.player2 : finalMatch.player1
      if (loser) tournament.runnerUp = loser
    }
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
      champion: { userId: winners[0].userId, name: winners[0].name, teamName: winners[0].teamName || null },
      state:    finishedState,
    })
    const allKelas = tournament.kelasArr || [tournament.kelas]
    allKelas.forEach(k => {
      io.to(`kelas:${k}`).emit('tournament:finished', {
        champion: { userId: winners[0].userId, name: winners[0].name, teamName: winners[0].teamName || null },
      })
    })
    saveTournamentHistory(tournament, 'finished')
    grantTournamentRewards(io, tournament)
    return
  }

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

  const allKelasForRound = tournament.kelasArr || [tournament.kelas]
  allKelasForRound.forEach(k => {
    io.to(`kelas:${k}`).emit('tournament:round-start', {
      round: tournament.currentRound,
      state: tournamentToClient(tournament),
    })
  })

  round.matches.forEach(match => {
    if (match.status === 'bye') {
      match.winner = match.player1
      return
    }

    match.status   = 'waiting-join'
    match.roomCode = `t-${tournament.id}-${match.id}`.slice(0, 24)

    // Untuk kelompok, init tracking fields
    if (tournament.mode === 'kelompok') {
      match.teamJuruJawab      = match.teamJuruJawab      || {}
      match._teamMemberSockets = match._teamMemberSockets || {}
      match._teamJuruTimer     = null
    }

    if (tournament.mode === 'kelompok' && tournament.teams) {
      // Notifikasi SEMUA anggota kedua tim
      const team1 = tournament.teams.find(t => t.id === match.player1?.teamId)
      const team2 = match.player2 ? tournament.teams.find(t => t.id === match.player2.teamId) : null

      const makePayload = (myTeam, oppTeam, myPlayerRep) => ({
        matchId:        match.id,
        tournamentId:   tournament.id,
        opponent:       oppTeam ? { teamId: oppTeam.id, teamName: oppTeam.name, name: oppTeam.name } : null,
        gameKey:        tournament.gameKey,
        round:          tournament.currentRound,
        isKelompok:     true,
        teamId:         myTeam.id,
        teamName:       myTeam.name,
        teamRepUserId:  myPlayerRep.userId,
        myTeamMembers:  myTeam.members.map(m => ({ userId: m.userId, name: m.name })),
      })

      if (team1) {
        const payload = makePayload(team1, team2, match.player1)
        for (const member of team1.members) {
          emitToUser(io, member.userId, 'tournament:your-match', payload)
        }
      }
      if (team2) {
        const payload = makePayload(team2, team1, match.player2)
        for (const member of team2.members) {
          emitToUser(io, member.userId, 'tournament:your-match', payload)
        }
      }
    } else {
      // Individual
      const p1Payload = {
        matchId:      match.id,
        tournamentId: tournament.id,
        opponent:     match.player2
          ? { userId: match.player2.userId, name: match.player2.name }
          : null,
        gameKey:      tournament.gameKey,
        round:        tournament.currentRound,
        isKelompok:   false,
      }
      emitToUser(io, match.player1?.userId, 'tournament:your-match', p1Payload)

      const p2Payload = {
        matchId:      match.id,
        tournamentId: tournament.id,
        opponent:     { userId: match.player1.userId, name: match.player1.name },
        gameKey:      tournament.gameKey,
        round:        tournament.currentRound,
        isKelompok:   false,
      }
      if (match.player2) {
        emitToUser(io, match.player2.userId, 'tournament:your-match', p2Payload)
      }
    }

    // Walkover timer
    match.walkoverTimer = setTimeout(() => {
      if (match.status !== 'waiting-join') return

      if (tournament.mode === 'kelompok') {
        // Kelompok: cek apakah ada anggota yang join
        const team1MembersJoined = tournament.teams
          ?.find(t => t.id === match.player1?.teamId)
          ?.members.some(m => match._teamMemberSockets?.[m.userId])
        const team2MembersJoined = match.player2 ? tournament.teams
          ?.find(t => t.id === match.player2.teamId)
          ?.members.some(m => match._teamMemberSockets?.[m.userId]) : false

        if (!team1MembersJoined && team2MembersJoined) {
          match.winner = match.player2
        } else if (team1MembersJoined && !team2MembersJoined) {
          match.winner = match.player1
        } else {
          match.winner = Math.random() < 0.5 ? match.player1 : match.player2
        }
        if (match._teamJuruTimer) { clearTimeout(match._teamJuruTimer); match._teamJuruTimer = null }
      } else {
        const p1Joined = !!match.player1?.socketId
        const p2Joined = !!match.player2?.socketId
        if (!p1Joined && p2Joined)        match.winner = match.player2
        else if (p1Joined && !p2Joined)   match.winner = match.player1
        else match.winner = Math.random() < 0.5 ? match.player1 : match.player2
      }

      match.status = 'walkover'
      io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
      checkRoundComplete(io, tournament)
    }, WALKOVER_TIMEOUT_MS)
  })

  io.to(`tournament:${tournament.id}`).emit('tournament:state', tournamentToClient(tournament))
}
