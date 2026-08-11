/**
 * In-memory lifecycle manager for TOMAT MOBA matches.
 *
 * This module deliberately knows nothing about Socket.io, Express, sessions,
 * or the individual-game lobby. A future transport adapter can translate
 * these methods and lifecycle events into socket events without sharing any
 * registry or mutable state with the existing multiplayer module.
 */

import { randomUUID } from 'node:crypto'
import {
  DEPOSIT_ZONES,
  ERROR_CODES,
  DEFAULT_MOBA_CONFIG,
  DEFAULT_POSITION_BY_TEAM,
  MAP_WALLS,
  PHASES,
  TEAM_SIZES,
  isValidTeamSize,
} from './config.js'

function isBlockedByWall(pos, radius = 28) {
  for (const w of MAP_WALLS) {
    const nearX = Math.max(w.x1, Math.min(w.x2, pos.x))
    const nearY = Math.max(w.y1, Math.min(w.y2, pos.y))
    if (Math.hypot(pos.x - nearX, pos.y - nearY) < radius) return true
  }
  return false
}
import {
  createMatchState,
  createPlayerState,
  publicPlayer,
  sanitizeMatchState,
} from './state.js'
import { createQuestionNode, distanceBetween, isInsideArena } from './nodes.js'
import {
  createQuestionSession,
  defaultQuestionGenerator,
  normalizeAnswer,
  publicQuestion,
} from './questions.js'
import {
  canUseWrongAnswerImmunity,
  consumeWrongAnswerImmunity,
  getDepositMultiplier,
  getInitialImmunity,
  getMovementSpeed,
  getScrollCapacity,
} from './pet-effects.js'

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
  [ERROR_CODES.INVALID_DIFFICULTY]: 'Tingkat kesulitan node tidak valid.',
  [ERROR_CODES.INVALID_SPAWN_POSITION]: 'Tidak ada posisi spawn node yang valid.',
  [ERROR_CODES.PLAYER_DISCONNECTED]: 'Pemain sedang tidak terhubung.',
  [ERROR_CODES.PLAYER_STUNNED]: 'Pemain sedang terkena stun.',
  [ERROR_CODES.QUESTION_ALREADY_ACTIVE]: 'Pemain sudah memiliki node soal aktif.',
  [ERROR_CODES.NODE_NOT_AVAILABLE]: 'Titik soal sudah diambil atau sudah kedaluwarsa.',
  [ERROR_CODES.PLAYER_TOO_FAR]: 'Pemain terlalu jauh dari titik soal.',
  [ERROR_CODES.ACTION_ID_REQUIRED]: 'actionId wajib dikirim untuk aksi ini.',
  [ERROR_CODES.QUESTION_EXPIRED]: 'Waktu menjawab soal sudah habis.',
  [ERROR_CODES.QUESTION_NOT_ACTIVE]: 'Sesi soal tidak aktif.',
  [ERROR_CODES.SCROLL_CAPACITY_REACHED]: 'Kapasitas gulungan pemain sudah penuh.',
  [ERROR_CODES.MOVE_INVALID_INPUT]: 'Input gerak tidak valid.',
  [ERROR_CODES.MOVE_RATE_LIMITED]: 'Gerakan terlalu cepat.',
  [ERROR_CODES.MOVE_OUT_OF_BOUNDS]: 'Posisi berada di luar arena.',
  [ERROR_CODES.MOVE_COLLISION]: 'Posisi bertabrakan dengan pemain lain.',
  [ERROR_CODES.TOWER_STILL_ACTIVE]: 'Tower Luar target belum hancur.',
  [ERROR_CODES.INVALID_DEPOSIT_TARGET]: 'Belum ada target setor yang terbuka atau pemain terlalu jauh.',
  [ERROR_CODES.SCROLL_NOT_OWNED]: 'Gulungan bukan milik pemain.',
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
  clearTimer(manager, match, 'wave2')
  // Reserved for the node subsystem added on Day 4.
  clearTimer(manager, match, 'spawn')
  for (const node of match.activeNodes.values()) {
    if (node.expiryTimer !== null && node.expiryTimer !== undefined) {
      manager.clearTimeout(node.expiryTimer)
      node.expiryTimer = null
    }
  }
  for (const timer of match.questionTimers.values()) {
    manager.clearTimeout(timer)
  }
  match.questionTimers.clear()
}

function isRunningPhase(phase) {
  return phase === PHASES.RUNNING_OUTER_TOWER ||
    phase === PHASES.RUNNING_MAIN_BASE
}

function matchResult(match) {
  const teamA = match.teams.teamA
  const teamB = match.teams.teamB
  const winner = teamA.score === teamB.score
    ? 'draw'
    : teamA.score > teamB.score ? 'teamA' : 'teamB'
  return {
    matchId: match.id,
    phase: match.phase,
    winner,
    scores: {
      teamA: teamA.score,
      teamB: teamB.score,
    },
    snapshot: sanitizeMatchState(match),
  }
}

function defaultPlayerInput({
  playerId,
  userId,
  displayName,
  petType,
  petSkinId,
  position,
  connected,
  teamId,
  now,
}) {
  return {
    id: playerId,
    teamId,
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
  random = Math.random,
  questionGenerator = defaultQuestionGenerator,
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

  function rememberAction(player, actionId, result, match) {
    if (!actionId) return
    player.recentActionIds.set(actionId, {
      result,
      expiresAt: now() + match.config.actionIdTtlMs,
    })
  }

  function getRememberedAction(player, actionId, match) {
    if (!actionId) return null
    const remembered = player.recentActionIds.get(actionId)
    if (!remembered) return null
    if (remembered.expiresAt <= now()) {
      player.recentActionIds.delete(actionId)
      return null
    }
    return { ...remembered.result, duplicate: true }
  }

  function clearQuestionSession(match, player, session, {
    reason,
    correct = false,
    timedOut = false,
    immune = false,
    scroll = null,
  } = {}) {
    const timer = match.questionTimers.get(session.id)
    if (timer !== undefined) manager.clearTimeout(timer)
    match.questionTimers.delete(session.id)
    match.questions.delete(session.questionId)
    match.closedQuestionSessions.set(session.id, {
      reason,
      expiresAt: now() + match.config.actionIdTtlMs,
    })

    const node = match.activeNodes.get(session.nodeId)
    if (node) {
      if (node.expiryTimer !== null && node.expiryTimer !== undefined) {
        manager.clearTimeout(node.expiryTimer)
      }
      match.activeNodes.delete(session.nodeId)
    }
    if (player.claimedNodeId === session.nodeId) player.claimedNodeId = null
    player.questionSession = null
    match.eventSeq++

    const result = {
      questionSessionId: session.id,
      questionId: session.questionId,
      playerId: player.id,
      correct,
      timedOut,
      immune,
      stunUntil: player.stunUntil,
      scroll: scroll
        ? {
            id: scroll.id,
            points: scroll.points,
            difficulty: scroll.difficulty,
            questionId: scroll.questionId,
            earnedAt: scroll.earnedAt,
          }
        : null,
      snapshot: sanitizeMatchState(match),
    }
    emit(match, 'question_closed', result)
    return result
  }

  function actionKey(actionType, actionId) {
    return actionId ? `${actionType}:${actionId}` : null
  }

  function getBasePosition(teamId) {
    return DEFAULT_POSITION_BY_TEAM[teamId]
  }

  function normalizeDirection(direction) {
    if (!direction || typeof direction !== 'object') return null
    const x = Number(direction.x)
    const y = Number(direction.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    const length = Math.hypot(x, y)
    if (length === 0 || length > 1.001) return null
    return { x: x / length, y: y / length }
  }

  function movementSpeed(player, match) {
    return getMovementSpeed({ player, config: match.config })
  }

  function movePlayer({
    matchId,
    playerId,
    actionId,
    direction,
    clientPosition = null,
  } = {}) {
    if (!actionId) return fail(ERROR_CODES.ACTION_ID_REQUIRED)
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND, { actionId })
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH, { actionId })
    const duplicate = getRememberedAction(player, actionId, match)
    if (duplicate) return duplicate
    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED, { actionId })
    if (!isRunningPhase(match.phase)) return fail(ERROR_CODES.INVALID_PHASE, { actionId })
    if (!player.connected) return fail(ERROR_CODES.PLAYER_DISCONNECTED, { actionId })
    if (player.stunUntil > now()) return fail(ERROR_CODES.PLAYER_STUNNED, { actionId })
    // Block movement while a question is open so stale client-side intervals
    // (e.g. joystick setInterval that captured a canAct=true closure) cannot
    // cause the player to move away before answering.
    if (player.questionSession) return fail(ERROR_CODES.PLAYER_STUNNED, { actionId })

    const normalized = normalizeDirection(direction)
    if (!normalized) return fail(ERROR_CODES.MOVE_INVALID_INPUT, { actionId })

    const elapsedMs = now() - player.lastInputAt
    if (elapsedMs < match.config.movementMinIntervalMs) {
      return fail(ERROR_CODES.MOVE_RATE_LIMITED, { actionId })
    }

    // clientPosition is intentionally ignored. The authoritative position is
    // derived from the last accepted server position and server elapsed time.
    // A player only moves when an input is received. Do not convert time spent
    // idle in the lobby/countdown (or a delayed network packet) into one huge
    // movement step that can immediately hit the opposite arena boundary.
    const movementDeltaMs = Math.min(
      elapsedMs,
      Number(match.config.movementMaxDeltaMs) > 0
        ? Number(match.config.movementMaxDeltaMs)
        : elapsedMs,
    )
    const maxDistance = movementSpeed(player, match) * movementDeltaMs / 1000
    const candidate = {
      x: player.position.x + normalized.x * maxDistance,
      y: player.position.y + normalized.y * maxDistance,
      lane: player.position.lane,
    }
    if (!isInsideArena(candidate, match.config.arena)) {
      return fail(ERROR_CODES.MOVE_OUT_OF_BOUNDS, { actionId })
    }
    if (isBlockedByWall(candidate, match.config.playerCollisionRadius)) {
      return fail(ERROR_CODES.MOVE_OUT_OF_BOUNDS, { actionId })
    }

    const collision = [...match.players.values()].some(other =>
      other.id !== player.id &&
      distanceBetween(candidate, other.position) < match.config.playerCollisionRadius * 2)
    if (collision) return fail(ERROR_CODES.MOVE_COLLISION, { actionId })

    const arenaHeight = match.config.arena.maxY - match.config.arena.minY
    const laneThird = arenaHeight / 3
    candidate.lane = candidate.y < match.config.arena.minY + laneThird
      ? 'top'
      : candidate.y >= match.config.arena.minY + laneThird * 2
        ? 'bottom'
        : 'middle'
    player.position = candidate
    player.lastInputAt = now()
    match.eventSeq++
    const pub = publicPlayer(player)
    const result = ok({
      actionId,
      playerId,
      position: { ...player.position },
      player: pub,
      // Deliberately no snapshot: movePlayer fires every 40 ms per player.
      // Serialising the full match on every move floods the event loop.
      // Client state stays authoritative via the player_updated broadcast below.
    })
    rememberAction(player, actionId, result, match)
    emit(match, 'player_updated', {
      player: pub,
      actionId,
      // No snapshot: mobaReducer handles player_updated via mergePlayer alone.
    })
    return result
  }

  function depositScroll({
    matchId,
    playerId,
    actionId,
    scrollId,
  } = {}) {
    if (!actionId) return fail(ERROR_CODES.ACTION_ID_REQUIRED)
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND, { actionId })
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH, { actionId })
    const duplicate = getRememberedAction(player, actionId, match)
    if (duplicate) return duplicate
    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED, { actionId })
    if (!isRunningPhase(match.phase)) return fail(ERROR_CODES.INVALID_PHASE, { actionId })
    if (!player.connected) return fail(ERROR_CODES.PLAYER_DISCONNECTED, { actionId })
    if (player.stunUntil > now()) return fail(ERROR_CODES.PLAYER_STUNNED, { actionId })

    // A completed scoring box disappears permanently. Once a team's first box
    // is completed, that team's library becomes an eligible 1.5x deposit target.
    const teamBoxes = [...(match.depositBoxes?.entries() || [])]
      .filter(([zoneId]) => DEPOSIT_ZONES.some(z => z.id === zoneId && z.team === player.teamId))
      .map(([, state]) => state)
    const libraryUnlocked = teamBoxes.some(state => state.completed === true)
    const scoringZones = DEPOSIT_ZONES.filter(z =>
      z.team === player.teamId &&
      !z.isLibrary &&
      !(match.depositBoxes?.get(z.id)?.completed),
    )
    const libraryZones = libraryUnlocked
      ? DEPOSIT_ZONES.filter(z => z.team === player.teamId && z.isLibrary)
      : []
    const eligibleZones = [...scoringZones, ...libraryZones]
    let nearestZone = null
    let nearestDist = Infinity
    for (const zone of eligibleZones) {
      const d = distanceBetween(player.position, zone)
      if (d < nearestDist) { nearestDist = d; nearestZone = zone }
    }
    if (!nearestZone || nearestDist > match.config.depositInteractionRadius) {
      return fail(ERROR_CODES.INVALID_DEPOSIT_TARGET, { actionId, reason: 'too_far' })
    }

    const scrollIndex = player.scrolls.findIndex(scroll => scroll.id === scrollId)
    if (scrollIndex < 0) return fail(ERROR_CODES.SCROLL_NOT_OWNED, { actionId })

    const scroll = player.scrolls[scrollIndex]
    const libraryMultiplier = nearestZone.isLibrary
      ? Number(match.config.libraryDepositMultiplier) || 1.5
      : 1
    const multiplier = Math.round(
      getDepositMultiplier({ player, config: match.config }) * libraryMultiplier * 100,
    ) / 100
    const awardedPoints = Math.round(scroll.points * multiplier)

    player.scrolls.splice(scrollIndex, 1)
    player.score += awardedPoints
    player.deposits++

    const scoringTeam = match.teams[player.teamId]
    scoringTeam.score += awardedPoints

    const depositEntry = {
      id: `deposit-${match.eventSeq + 1}-${player.id}`,
      playerId: player.id,
      displayName: player.displayName,
      teamId: player.teamId,
      awardedPoints,
      depositedAt: now(),
      zoneId: nearestZone.id,
    }
    if (!match.depositHistory) match.depositHistory = []
    match.depositHistory.push(depositEntry)
    if (match.depositHistory.length > 200) {
      match.depositHistory.splice(0, match.depositHistory.length - 200)
    }

    // Box fill: fill this zone's box; once it reaches capacity it disappears.
    const boxCapacity = match.config.boxCapacity || DEFAULT_MOBA_CONFIG.boxCapacity || 100
    const depositBoxes = match.depositBoxes || new Map()
    const zoneState = depositBoxes.get(nearestZone.id) || { fill: 0, completedBoxes: 0, completed: false }
    let boxCompleted = false
    if (!nearestZone.isLibrary) {
      zoneState.fill += awardedPoints
      if (zoneState.fill >= boxCapacity) {
        zoneState.fill = boxCapacity
        zoneState.completed = true
        zoneState.completedBoxes = 1
        boxCompleted = true
      }
      depositBoxes.set(nearestZone.id, zoneState)
      if (!match.depositBoxes) match.depositBoxes = depositBoxes
    }

    const boxBonusPoints = boxCompleted
      ? Number(match.config.boxCompletionBonusPoints) || DEFAULT_MOBA_CONFIG.boxCompletionBonusPoints || 50
      : 0
    // Base points represent points deposited at the team's library/base.
    // Completing a scoring box contributes the separate fixed base bonus.
    if (nearestZone.isLibrary) scoringTeam.base.points += awardedPoints
    if (boxBonusPoints > 0) scoringTeam.base.points += boxBonusPoints

    match.eventSeq++
    const result = ok({
      actionId,
      playerId,
      zoneId: nearestZone.id,
      scrollId,
      awardedPoints,
      boxBonusPoints,
      boxFill: zoneState.fill,
      completedBoxes: zoneState.completedBoxes,
      boxCompleted,
      isLibrary: Boolean(nearestZone.isLibrary),
      depositMultiplier: multiplier,
      teamScore: scoringTeam.score,
      deposit: { ...depositEntry },
      snapshot: sanitizeMatchState(match),
    })
    rememberAction(player, actionId, result, match)
    emit(match, 'scroll_deposited', {
      playerId,
      zoneId: nearestZone.id,
      scrollId,
      awardedPoints,
      boxBonusPoints,
      boxFill: zoneState.fill,
      completedBoxes: zoneState.completedBoxes,
      boxCompleted,
      isLibrary: Boolean(nearestZone.isLibrary),
      depositMultiplier: multiplier,
      teamScore: scoringTeam.score,
      deposit: { ...depositEntry },
      snapshot: result.snapshot,
    })
    if (boxCompleted) {
      emit(match, 'box_completed', {
        zoneId: nearestZone.id,
        teamId: player.teamId,
        completedBoxes: zoneState.completedBoxes,
        snapshot: result.snapshot,
      })
    }
    return result
  }

  function timeoutQuestion(matchId, playerId, questionSessionId) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    const player = match.players.get(playerId)
    const session = player?.questionSession
    if (!player || !session || session.id !== questionSessionId) return null
    player.answeredWrong++
    player.stunUntil = now() + match.config.wrongAnswerStunMs
    return clearQuestionSession(match, player, session, {
      reason: 'timeout',
      timedOut: true,
    })
  }

  function getMatch(matchId) {
    return matches.get(matchId) || null
  }

  function requireMatch(matchId) {
    const match = getMatch(matchId)
    return match || fail(ERROR_CODES.MATCH_NOT_FOUND)
  }

  function createMatch({ matchId, teamSize = 1, config = {}, createdAt = now(), questionGeneratorOverride = null } = {}) {
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
    if (typeof questionGeneratorOverride === 'function') {
      match.questionGeneratorOverride = questionGeneratorOverride
    }
    matches.set(match.id, match)
    emit(match, 'match_created', { snapshot: sanitizeMatchState(match) })
    return ok({ matchId: match.id, snapshot: sanitizeMatchState(match) })
  }

  function findPlayerMatch({ playerId, userId } = {}) {
    for (const match of matches.values()) {
      // Finished matches remain in the registry briefly so the result screen
      // and reconnect grace period can still read their final snapshot. They
      // must not block a player from starting a new matchmaking session.
      if (match.phase === PHASES.FINISHED) continue
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
        teamId: selectedTeamId,
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
    player.maxScrolls = getScrollCapacity({
      player,
      config: match.config,
    })
    player.immunityRemaining = getInitialImmunity({ player })
    player.immunityAvailable = player.immunityRemaining > 0
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

    // Wave 2: increase node density at wave2StartMs (default 5 min into 7-min match)
    if (match.config.wave2StartMs > 0) {
      match.timers.wave2 = manager.setTimeout(() => {
        if (!isRunningPhase(match.phase)) return
        match.config.maxActiveNodes = match.config.wave2MaxActiveNodes || match.config.maxActiveNodes
        match.config.nodeSpawnIntervalMs = match.config.wave2SpawnIntervalMs || match.config.nodeSpawnIntervalMs
        clearTimer(manager, match, 'spawn')
        scheduleNextNodeSpawn(match)
      }, match.config.wave2StartMs)
    }
    scheduleNextNodeSpawn(match)
  }

  function scheduleNextNodeSpawn(match) {
    if (!isRunningPhase(match.phase)) return
    clearTimer(manager, match, 'spawn')
    match.timers.spawn = manager.setTimeout(() => {
      match.timers.spawn = null
      if (!isRunningPhase(match.phase)) return
      spawnNode(match.id)
      scheduleNextNodeSpawn(match)
    }, match.config.nodeSpawnIntervalMs)
  }

  function expireNode(match, nodeId, reason = 'ttl') {
    const node = match.activeNodes.get(nodeId)
    if (!node) return fail(ERROR_CODES.NODE_NOT_AVAILABLE)
    if (node.expiryTimer !== null && node.expiryTimer !== undefined) {
      manager.clearTimeout(node.expiryTimer)
      node.expiryTimer = null
    }
    node.status = 'expired'
    node.claimedBy = null
    match.activeNodes.delete(nodeId)
    match.eventSeq++
    emit(match, 'node_expired', {
      node: {
        id: node.id,
        difficulty: node.difficulty,
        points: node.points,
        position: { ...node.position },
        status: node.status,
        claimedBy: null,
        spawnedAt: node.spawnedAt,
        expiresAt: node.expiresAt,
      },
      reason,
      snapshot: sanitizeMatchState(match),
    })
    return ok({ nodeId, reason, snapshot: sanitizeMatchState(match) })
  }

  function scheduleNodeExpiry(match, node) {
    const delay = Math.max(0, node.expiresAt - now())
    node.expiryTimer = manager.setTimeout(() => {
      if (match.activeNodes.has(node.id)) expireNode(match, node.id, 'ttl')
    }, delay)
  }

  function spawnNode(matchId, {
    difficulty = null,
    position = null,
    nodeNow = now(),
  } = {}) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    if (!isRunningPhase(match.phase)) {
      return match.phase === PHASES.FINISHED
        ? fail(ERROR_CODES.MATCH_FINISHED)
        : fail(ERROR_CODES.INVALID_PHASE)
    }
    if (match.activeNodes.size >= match.config.maxActiveNodes) {
      return fail(ERROR_CODES.NODE_NOT_AVAILABLE, { reason: 'max_active_nodes' })
    }

    const result = createQuestionNode({
      match,
      now: nodeNow,
      difficulty,
      position,
      random,
      idFactory,
    })
    if (!result.ok) return fail(result.code)

    match.activeNodes.set(result.node.id, result.node)
    match.eventSeq++
    scheduleNodeExpiry(match, result.node)
    emit(match, 'node_spawned', {
      node: {
        id: result.node.id,
        difficulty: result.node.difficulty,
        points: result.node.points,
        position: { ...result.node.position },
        status: result.node.status,
        claimedBy: null,
        spawnedAt: result.node.spawnedAt,
        expiresAt: result.node.expiresAt,
      },
      snapshot: sanitizeMatchState(match),
    })
    return ok({
      nodeId: result.node.id,
      node: result.node,
      snapshot: sanitizeMatchState(match),
    })
  }

  function claimNode({
    matchId,
    playerId,
    nodeId,
    actionId = null,
  } = {}) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND, { actionId })
    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED, { actionId })
    if (!isRunningPhase(match.phase)) return fail(ERROR_CODES.INVALID_PHASE, { actionId })

    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH, { actionId })
    const duplicate = getRememberedAction(player, actionId, match)
    if (duplicate) return duplicate
    if (!player.connected) return fail(ERROR_CODES.PLAYER_DISCONNECTED, { actionId })
    if (player.stunUntil > now()) return fail(ERROR_CODES.PLAYER_STUNNED, { actionId })
    if (player.claimedNodeId) return fail(ERROR_CODES.QUESTION_ALREADY_ACTIVE, { actionId })
    if (player.scrolls.length >= player.maxScrolls) {
      return fail(ERROR_CODES.SCROLL_CAPACITY_REACHED, { actionId })
    }

    const node = match.activeNodes.get(nodeId)
    if (!node || node.status !== 'available') {
      return fail(ERROR_CODES.NODE_NOT_AVAILABLE, { actionId })
    }
    if (now() >= node.expiresAt) {
      expireNode(match, node.id, 'ttl')
      return fail(ERROR_CODES.NODE_NOT_AVAILABLE, { actionId })
    }
    if (distanceBetween(player.position, node.position) > match.config.nodeInteractionRadius) {
      return fail(ERROR_CODES.PLAYER_TOO_FAR, { actionId })
    }

    // Node claims are synchronous Map operations: the first handler in the
    // event loop changes available → claimed before another claim can run.
    node.status = 'claimed'
    node.claimedBy = player.id
    player.claimedNodeId = node.id
    if (node.expiryTimer !== null && node.expiryTimer !== undefined) {
      manager.clearTimeout(node.expiryTimer)
      node.expiryTimer = null
    }

    let question
    try {
      const gen = match.questionGeneratorOverride || questionGenerator
      question = gen({
        difficulty: node.difficulty,
        node,
        match,
        player,
        random,
      })
    } catch (error) {
      node.status = 'available'
      node.claimedBy = null
      player.claimedNodeId = null
      return fail(ERROR_CODES.QUESTION_NOT_ACTIVE, { actionId, cause: error.message })
    }
    if (!question || question.answer === undefined || !question.prompt) {
      node.status = 'available'
      node.claimedBy = null
      player.claimedNodeId = null
      return fail(ERROR_CODES.QUESTION_NOT_ACTIVE, { actionId })
    }
    const openedAt = now()
    const session = createQuestionSession({
      question,
      playerId: player.id,
      nodeId: node.id,
      openedAt,
      expiresAt: openedAt + match.config.questionTimeMs,
      questionSessionId: typeof idFactory === 'function'
        ? idFactory('question-session')
        : undefined,
    })
    question.id = session.questionId
    question.difficulty = node.difficulty
    match.questions.set(session.questionId, {
      ...question,
      id: session.questionId,
      answer: question.answer,
      correctAnswer: question.correctAnswer ?? question.answer,
    })
    player.questionSession = session
    const questionTimer = manager.setTimeout(() => {
      timeoutQuestion(match.id, player.id, session.id)
    }, match.config.questionTimeMs)
    match.questionTimers.set(session.id, questionTimer)
    match.eventSeq++
    const openedQuestion = publicQuestion({
      ...question,
      id: session.questionId,
      difficulty: node.difficulty,
    })
    emit(match, 'node_claimed', {
      nodeId: node.id,
      playerId: player.id,
      actionId,
      node: {
        id: node.id,
        difficulty: node.difficulty,
        points: node.points,
        position: { ...node.position },
        status: node.status,
        claimedBy: node.claimedBy,
        spawnedAt: node.spawnedAt,
        expiresAt: node.expiresAt,
      },
      snapshot: sanitizeMatchState(match),
    })
    emit(match, 'question_opened', {
      playerId: player.id,
      questionSessionId: session.id,
      expiresAt: session.expiresAt,
      serverNow: now(),
      question: openedQuestion,
    })
    const result = ok({
      actionId,
      nodeId: node.id,
      playerId: player.id,
      node,
      questionSessionId: session.id,
      question: openedQuestion,
      snapshot: sanitizeMatchState(match),
    })
    rememberAction(player, actionId, result, match)
    return result
  }

  function answerQuestion({
    matchId,
    playerId,
    actionId,
    questionSessionId,
    answer,
  } = {}) {
    if (!actionId) return fail(ERROR_CODES.ACTION_ID_REQUIRED)
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND, { actionId })
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH, { actionId })
    const duplicate = getRememberedAction(player, actionId, match)
    if (duplicate) return duplicate
    if (match.phase === PHASES.FINISHED) return fail(ERROR_CODES.MATCH_FINISHED, { actionId })

    const closed = match.closedQuestionSessions.get(questionSessionId)
    if (closed && closed.expiresAt > now()) {
      return fail(closed.reason === 'timeout'
        ? ERROR_CODES.QUESTION_EXPIRED
        : ERROR_CODES.QUESTION_NOT_ACTIVE, { actionId })
    }
    const session = player.questionSession
    if (!session || session.id !== questionSessionId) {
      return fail(ERROR_CODES.QUESTION_NOT_ACTIVE, { actionId })
    }
    if (now() >= session.expiresAt) {
      const timedOut = timeoutQuestion(match.id, player.id, session.id)
      const result = fail(ERROR_CODES.QUESTION_EXPIRED, { actionId })
      rememberAction(player, actionId, result, match)
      return result
    }

    const question = match.questions.get(session.questionId)
    if (!question) return fail(ERROR_CODES.QUESTION_NOT_ACTIVE, { actionId })
    const correct = normalizeAnswer(answer) === normalizeAnswer(
      question.correctAnswer ?? question.answer)
    const node = match.activeNodes.get(session.nodeId)
    const hardImmunity = canUseWrongAnswerImmunity({
      player,
      difficulty: node?.difficulty,
    })

    if (correct) {
      player.answeredCorrect++
      const scroll = {
        id: typeof idFactory === 'function' ? idFactory('scroll') : `scroll-${randomUUID()}`,
        points: node.points,
        difficulty: node.difficulty,
        questionId: session.questionId,
        earnedAt: now(),
      }
      player.scrolls.push(scroll)
      const resultData = clearQuestionSession(match, player, session, {
        reason: 'correct',
        correct: true,
        scroll,
      })
      const result = ok({
        actionId,
        ...resultData,
      })
      rememberAction(player, actionId, result, match)
      return result
    }

    player.answeredWrong++
    if (hardImmunity) {
      consumeWrongAnswerImmunity(player)
      const resultData = clearQuestionSession(match, player, session, {
        reason: 'immune_wrong',
        immune: true,
      })
      const result = ok({
        actionId,
        ...resultData,
      })
      rememberAction(player, actionId, result, match)
      return result
    }

    player.stunUntil = now() + match.config.wrongAnswerStunMs
    const resultData = clearQuestionSession(match, player, session, {
      reason: 'wrong',
    })
    const result = ok({
      actionId,
      ...resultData,
    })
    rememberAction(player, actionId, result, match)
    return result
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

  function setPlayerConnection({ matchId, playerId, connected } = {}) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)

    player.connected = Boolean(connected)
    match.eventSeq++
    const result = ok({
      matchId,
      player: publicPlayer(player),
      snapshot: sanitizeMatchState(match),
    })
    emit(match, 'player_updated', {
      player: result.player,
      snapshot: result.snapshot,
    })
    return result
  }

  function getPrivateQuestion({ matchId, playerId } = {}) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)
    const session = player.questionSession
    if (!session || session.expiresAt <= now()) return ok({ question: null })
    const question = match.questions.get(session.questionId)
    if (!question) return ok({ question: null })
    return ok({
      question: publicQuestion(question),
      questionSessionId: session.id,
      expiresAt: session.expiresAt,
      serverNow: now(),
    })
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

  /**
   * Marks a player as having loaded their client. Once all players in the
   * match have reported loaded, triggers the countdown automatically.
   */
  function markClientLoaded({ matchId, playerId } = {}) {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    if (match.phase !== PHASES.LOBBY) {
      return ok({ alreadyStarted: true, phase: match.phase })
    }
    const player = match.players.get(playerId)
    if (!player) return fail(ERROR_CODES.PLAYER_NOT_IN_MATCH)

    if (!match.clientLoadedIds) match.clientLoadedIds = new Set()
    match.clientLoadedIds.add(playerId)

    const allLoaded = [...match.players.values()].every(p =>
      match.clientLoadedIds.has(p.id))
    if (!allLoaded) {
      return ok({
        loaded: true,
        allLoaded: false,
        loadedCount: match.clientLoadedIds.size,
        totalCount: match.players.size,
      })
    }

    // All clients loaded — mark everyone ready and trigger countdown.
    for (const p of match.players.values()) {
      p.ready = true
    }
    match.eventSeq++
    const startResult = tryStart(match)
    if (!startResult.ok) return startResult
    return { ...startResult, allLoaded: true }
  }

  manager.getMatch = getMatch
  manager.findPlayerMatch = findPlayerMatch
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
  manager.setPlayerConnection = setPlayerConnection
  manager.getPrivateQuestion = getPrivateQuestion
  manager.leaveMatch = leaveMatch
  manager.spawnNode = spawnNode
  manager.expireNode = (matchId, nodeId, reason) => {
    const match = getMatch(matchId)
    if (!match) return fail(ERROR_CODES.MATCH_NOT_FOUND)
    return expireNode(match, nodeId, reason)
  }
  manager.claimNode = claimNode
  manager.answerQuestion = answerQuestion
  manager.movePlayer = movePlayer
  manager.depositScroll = depositScroll
  manager.markClientLoaded = markClientLoaded
  manager.clearAll = () => {
    for (const match of matches.values()) clearLifecycleTimers(manager, match)
    matches.clear()
  }

  return manager
}
