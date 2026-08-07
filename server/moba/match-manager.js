/**
 * In-memory lifecycle manager for TOMAT MOBA matches.
 *
 * This module deliberately knows nothing about Socket.io, Express, sessions,
 * or the individual-game lobby. A future transport adapter can translate
 * these methods and lifecycle events into socket events without sharing any
 * registry or mutable state with the existing multiplayer module.
 */

import {
  ERROR_CODES,
  PHASES,
  TEAM_SIZES,
  isValidTeamSize,
} from './config.js'
import {
  createMatchState,
  createPlayerState,
  publicPlayer,
  sanitizeMatchState,
} from './state.js'

const TEAM_IDS = Object.freeze(['teamA', 'teamB'])

const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.INVALID_TEAM_SIZE]: 'Format pertandingan hanya 1v1, 2v2, atau 3v3.',
  [ERROR_CODES.INVALID_TEAM]: 'Tim MOBA tidak valid.',
  [ERROR_CODES.MATCH_NOT_FOUND]: 'Pertandingan MOBA tidak ditemukan.',
  [ERROR_CODES.MATCH_ALREADY_EXISTS]: 'ID pertandingan sudah digunakan.',
  [ERROR_CODES.MATCH_FINISHED]: 'Pertandingan sudah selesai.',
  [ERROR_CODES.PLAYER_NOT_IN_MATCH]: 'Pemain tidak terdaftar di pertandingan ini.',
  [ERROR_CODES.PLAYER_ALREADY_IN_MATCH]: 'Siswa sudah berada di pertandingan MOBA lain.',
  [ERROR_CODES.TEAM_FULL]: 'Tim sudah penuh.',
  [ERROR_CODES.TEAMS_UNBALANCED]: 'Jumlah pemain kedua tim harus seimbang.',
  [ERROR_CODES.MATCH_NOT_READY]: 'Pertandingan belum memenuhi jumlah pemain minimum.',
  [ERROR_CODES.PLAYER_NOT_READY]: 'Semua pemain harus siap sebelum pertandingan dimulai.',
  [ERROR_CODES.NOT_LOBBY]: 'Aksi ini hanya dapat dilakukan di lobby.',
  [ERROR_CODES.COUNTDOWN_IN_PROGRESS]: 'Countdown pertandingan sedang berjalan.',
})

function ok(data = {}) {
  return { ok: true, ...data }
}

function fail(code, details = {}) {
  return {
    ok: false,
    error: {
      code,
      message: ERROR_MESSAGES[code] || 'Aksi pertandingan ditolak.',
      ...details,
    },
  }
}

function isTeamId(teamId) {
  return TEAM_IDS.includes(teamId)
}

function playerCount(match, teamId) {
  return match.teams[teamId].playerIds.length
}

function allTeamsFull(match) {
  return TEAM_IDS.every(teamId => playerCount(match, teamId) === match.teamSize)
}

function allPlayersReady(match) {
  return allTeamsFull(match) &&
    [...match.players.values()].every(player => player.ready === true)
}

function teamsAreBalanced(match) {
  return Math.abs(playerCount(match, 'teamA') - playerCount(match, 'teamB')) <= 1
}

function clearTimer(manager, match, timerName) {
  const timer = match.timers[timerName]
  if (timer !== null && timer !== undefined) {
    manager.clearTimeout(timer)
    match.timers[timerName] = null
  }
}

function clearLifecycleTimers(manager, match) {
  clearTimer(manager, match, 'countdown')
  clearTimer(manager, match, 'finish')
  clearTimer(manager, match, 'cleanup')
  // Reserved for the node subsystem added on Day 4.
  clearTimer(manager, match, 'spawn')
}

function matchResult(match) {
  return {
    matchId: match.id,
    phase: match.phase,
    snapshot: sanitizeMatchState(match),
  }
}

function defaultPlayerInput({ playerId, userId, displayName, petType, petSkinId, position, connected, now }) {
  return {
    id: playerId,
    userId: userId || playerId,
    displayName: displayName || 'Pemain',
    petType,
    petSkinId,
    position,
    connected,
    now,
  }
}

/**
 * Creates an isolated in-memory registry.
 *
 * `now`, `setTimeout`, and `clearTimeout` are injectable for deterministic
 * lifecycle tests and for future server shutdown coordination.
 */
export function createMobaMatchManager({
  now = () => Date.now(),
  setTimeout: setTimeoutFn = setTimeout,
  clearTimeout: clearTimeoutFn = clearTimeout,
  onEvent = null,
  idFactory = null,
} = {}) {
  const matches = new Map()
  const manager = {
    matches,
    now,
    setTimeout: setTimeoutFn,
    clearTimeout: clearTimeoutFn,
  }

  function emit(match, event, payload = {}) {
    if (typeof onEvent === 'function') {
      onEvent(event, {
        matchId: match.id,
        ...payload,
      })
    }
  }

  function getMatch(matchId) {
    return matches.get(matchId) || null
  }

  function requireMatch(matchId) {
    const match = getMatch(matchId)
    return match || fail(ERROR_CODES.MATCH_NOT_FOUND)
  }

  function createMatch({ matchId, teamSize = 1, config = {}, createdAt = now() } = {}) {
    if (!isValidTeamSize(teamSize)) {
      return fail(ERROR_CODES.INVALID_TEAM_SIZE, {
        allowedTeamSizes: [...TEAM_SIZES],
      })
    }

    const id = matchId || (typeof idFactory === 'function' ? idFactory() : undefined)
    if (id && matches.has(id)) {
      return fail(ERROR_CODES.MATCH_ALREADY_EXISTS)
    }

    const match = createMatchState({
      id,
      teamSize,
      config,
      now: createdAt,
    })
    matches.set(match.id, match)
    emit(match, 'match_created', { snapshot: sanitizeMatchState(match) })
    return ok({ matchId: match.id, snapshot: sanitizeMatchState(match) })
  }

  function findPlayerMatch({ playerId, userId } = {}) {
    for (const match of matches.values()) {
      if (match.players.has(playerId) ||
          (userId && [...match.players.values()].some(player => player.userId === userId))) {
        return match
      }
    }
    return null
  }

  function joinMatch({
    matchId,
    playerId,
    userId,
    displayName,
    petType,
    petSkinId,
    position,
    connected = true,
    teamId,
  } = {}) {
    const match = requireMatch(matchId)
    if (match?.ok === false) return match

    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED)
    if (match.phase !== PHASES.LOBBY) return fail(ERROR_CODES.NOT_LOBBY)
    if (!playerId) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)
    if (findPlayerMatch({ playerId, userId })) {
      return fail(ERROR_CODES.PLAYER_ALREADY_IN_MATCH)
    }

    let selectedTeamId = teamId
    if (selectedTeamId !== undefined && !isTeamId(selectedTeamId)) {
      return fail(ERROR_CODES.INVALID_TEAM)
    }
    if (!selectedTeamId) {
      selectedTeamId = playerCount(match, 'teamA') <= playerCount(match, 'teamB')
        ? 'teamA'
        : 'teamB'
    }
    if (playerCount(match, selectedTeamId) >= match.teamSize) {
      return fail(ERROR_CODES.TEAM_FULL)
    }

    const projectedCounts = TEAM_IDS.map(id =>
      playerCount(match, id) + (id === selectedTeamId ? 1 : 0))
    if (Math.abs(projectedCounts[0] - projectedCounts[1]) > 1) {
      return fail(ERROR_CODES.TEAMS_UNBALANCED)
    }

    let player
    try {
      player = createPlayerState(defaultPlayerInput({
        playerId,
        userId,
        displayName,
        petType,
        petSkinId,
        position,
        connected,
        now: now(),
      }))
    } catch (error) {
      return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH, { cause: error.message })
    }

    player.teamId = selectedTeamId
    match.players.set(player.id, player)
    match.teams[selectedTeamId].playerIds.push(player.id)
    match.eventSeq++
    emit(match, 'player_joined', {
      player: publicPlayer(player),
      snapshot: sanitizeMatchState(match),
    })

    return ok({
      matchId: match.id,
      teamId: selectedTeamId,
      player: publicPlayer(player),
      snapshot: sanitizeMatchState(match),
    })
  }

  function setReady({ matchId, playerId, ready = true } = {}) {
    const match = requireMatch(matchId)
    if (match?.ok === false) return match
    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED)
    if (match.phase !== PHASES.LOBBY) {
      return match.phase === PHASES.COUNTDOWN
        ? fail(ERROR_CODES.COUNTDOWN_IN_PROGRESS)
        : fail(ERROR_CODES.NOT_LOBBY)
    }

    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)
    player.ready = Boolean(ready)
    match.eventSeq++
    emit(match, 'player_ready', {
      player: publicPlayer(player),
      snapshot: sanitizeMatchState(match),
    })

    const startResult = tryStart(match)
    return ok({
      matchId: match.id,
      player: publicPlayer(player),
      startedCountdown: startResult.ok && startResult.startedCountdown === true,
      snapshot: sanitizeMatchState(match),
    })
  }

  function tryStart(match) {
    if (match.phase !== PHASES.LOBBY) {
      return match.phase === PHASES.COUNTDOWN
        ? fail(ERROR_CODES.COUNTDOWN_IN_PROGRESS)
        : fail(ERROR_CODES.NOT_LOBBY)
    }
    if (!allTeamsFull(match) || !teamsAreBalanced(match)) {
      return fail(ERROR_CODES.MATCH_NOT_READY)
    }
    if (!allPlayersReady(match)) {
      return fail(ERROR_CODES.PLAYER_NOT_READY)
    }

    match.phase = PHASES.COUNTDOWN
    match.eventSeq++
    const countdownStartedAt = now()
    const countdownEndsAt = countdownStartedAt + match.config.countdownMs
    match.countdownStartedAt = countdownStartedAt
    match.countdownEndsAt = countdownEndsAt
    emit(match, 'match_countdown', {
      startedAt: countdownStartedAt,
      endsAt: countdownEndsAt,
      snapshot: sanitizeMatchState(match),
    })

    match.timers.countdown = manager.setTimeout(() => {
      if (match.phase !== PHASES.COUNTDOWN) return
      beginRunning(match)
    }, match.config.countdownMs)

    return ok({
      startedCountdown: true,
      countdownStartedAt,
      countdownEndsAt,
      snapshot: sanitizeMatchState(match),
    })
  }

  function beginRunning(match) {
    clearTimer(manager, match, 'countdown')
    const startedAt = now()
    match.phase = PHASES.RUNNING_OUTER_TOWER
    match.startedAt = startedAt
    match.endsAt = startedAt + match.config.durationMs
    match.countdownStartedAt = null
    match.countdownEndsAt = null
    match.eventSeq++
    emit(match, 'match_started', {
      startedAt: match.startedAt,
      endsAt: match.endsAt,
      snapshot: sanitizeMatchState(match),
    })

    match.timers.finish = manager.setTimeout(() => {
      finishMatch(match.id, { reason: 'time_expired' })
    }, match.config.durationMs)
  }

  function finishMatch(matchId, { reason = 'manual', result = null } = {}) {
    const match = requireMatch(matchId)
    if (match?.ok === false) return match
    if (match.phase === PHASES.FINISHED) {
      return ok({ ...matchResult(match), alreadyFinished: true })
    }

    clearLifecycleTimers(manager, match)
    match.phase = PHASES.FINISHED
    match.eventSeq++
    match.finishedAt = now()
    match.finishReason = reason
    match.result = result
    const finalResult = matchResult(match)
    emit(match, 'match_finished', {
      reason,
      result,
      snapshot: finalResult.snapshot,
    })

    if (match.config.cleanupGraceMs >= 0) {
      match.timers.cleanup = manager.setTimeout(() => {
        cleanupMatch(match.id)
      }, match.config.cleanupGraceMs)
    }

    return ok({ ...finalResult, reason, result })
  }

  function cleanupMatch(matchId) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    clearLifecycleTimers(manager, match)
    matches.delete(matchId)
    emit(match, 'match_cleaned', { snapshot: null })
    return ok({ matchId, cleaned: true })
  }

  function leaveMatch({ matchId, playerId } = {}) {
    const match = requireMatch(matchId)
    if (match?.ok === false) return match
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)
    if (match.phase !== PHASES.LOBBY) {
      return fail(match.phase === PHASES.FINISHED
        ? ERROR_CODES.MATCH_FINISHED
        : ERROR_CODES.NOT_LOBBY)
    }

    match.players.delete(playerId)
    match.teams[player.teamId].playerIds =
      match.teams[player.teamId].playerIds.filter(id => id !== playerId)
    match.eventSeq++
    emit(match, 'player_left', {
      playerId,
      snapshot: sanitizeMatchState(match),
    })
    return ok({ matchId, snapshot: sanitizeMatchState(match) })
  }

  manager.getMatch = getMatch
  manager.listMatches = () => [...matches.values()].map(sanitizeMatchState)
  manager.createMatch = createMatch
  manager.joinMatch = joinMatch
  manager.setReady = setReady
  manager.startMatch = matchId => {
    const match = requireMatch(matchId)
    if (match?.ok === false) return match
    return tryStart(match)
  }
  manager.finishMatch = finishMatch
  manager.cleanupMatch = cleanupMatch
  manager.leaveMatch = leaveMatch
  manager.clearAll = () => {
    for (const match of matches.values()) clearLifecycleTimers(manager, match)
    matches.clear()
  }

  return manager
}
