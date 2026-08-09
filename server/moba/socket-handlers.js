/**
 * Socket.io adapter for the transport-agnostic TOMAT MOBA manager.
 *
 * The adapter owns rooms, authenticated socket identity, acknowledgements, and
 * reconnect grace periods. Match rules and mutations remain in match-manager.
 */

import { createMobaMatchManager } from './match-manager.js'
import { DEFAULT_MOBA_CONFIG, ERROR_CODES, PHASES, PET_TYPES, TEAM_SIZES } from './config.js'
import { canStudentUseMoba } from './access.js'
import { createMobaResultStore } from './results.js'
import { computeHunger, getHungerUntil, skinToPetType } from '../pet-state.js'
import { createCurriculumQuestionGenerator } from './questions.js'
import { SUPPORTED_TOURNAMENT_GAMES } from '../tournament-questions.js'

const ROOM_PREFIX = 'moba:match:'
const DEFAULT_RECONNECT_GRACE_MS = 30_000

function roomFor(matchId) {
  return `${ROOM_PREFIX}${matchId}`
}

function actionIdFor(socket, actionId) {
  if (typeof actionId === 'string' && actionId.trim()) return actionId.trim()
  socket.data.mobaActionSeq = (socket.data.mobaActionSeq || 0) + 1
  return `${socket.data.userId || socket.id}:moba:${socket.data.mobaActionSeq}`
}

function safeAck(ack, result) {
  if (typeof ack === 'function') ack(result)
  return result
}

function emitError(socket, result, ack) {
  if (result?.ok === false) socket.emit('moba:error', result.error)
  return safeAck(ack, result)
}

function defaultProfile() {
  return {
    petType: PET_TYPES.TOMI,
    petSkinId: 'golden',
    isDead: false,
  }
}

/**
 * Creates and wires one MOBA adapter. A manager may be injected by tests or
 * by a host that wants to configure its clock/question generator.
 */
export function createMobaSocketAdapter({
  io,
  manager: suppliedManager = null,
  pool = null,
  getPlayerProfile = null,
  reconnectGraceMs = DEFAULT_RECONNECT_GRACE_MS,
  resultStore: suppliedResultStore = null,
  mobaEnv = process.env,
} = {}) {
  if (!io || typeof io.to !== 'function') {
    throw new TypeError('io is required')
  }

  const reconnectTimers = new Map()
  const matchmakingQueues = new Map(TEAM_SIZES.map(teamSize => [teamSize, []]))
  /** Per-match timers for the client-load timeout fallback. */
  const loadTimeouts = new Map()
  let adapter
  const resultStore = suppliedResultStore || (pool
    ? createMobaResultStore({ pool })
    : null)

  const loadProfile = getPlayerProfile || (async userId => {
    if (!pool) return defaultProfile()
    const { rows } = await pool.query(
      'select equipped_pet_skin, pet_hunger_map from students where id = $1',
      [userId],
    )
    const row = rows[0]
    if (!row) return { ...defaultProfile(), isDead: true }
    const petSkinId = row.equipped_pet_skin || 'golden'
    return {
      petType: skinToPetType(petSkinId),
      petSkinId,
      isDead: computeHunger(getHungerUntil(row.pet_hunger_map, petSkinId)).isDead,
    }
  })

  function emitManagerEvent(event, payload = {}) {
    const eventName = `moba:${event}`
    const matchId = payload.matchId
    if (!matchId) return
    const matchRoom = roomFor(matchId)

    if (event === 'question_opened') {
      const match = adapter.manager.getMatch(matchId)
      const player = match?.players.get(payload.playerId)
      const targetSocketId = player
        ? adapter.playerSockets.get(player.userId)
        : null
      const targetSocket = targetSocketId
        ? io.sockets.sockets.get(targetSocketId)
        : null
      targetSocket?.emit(eventName, payload)
      return
    }

    if (event === 'question_closed') {
      const match = adapter.manager.getMatch(matchId)
      const player = match?.players.get(payload.playerId)
      const targetSocketId = player
        ? adapter.playerSockets.get(player.userId)
        : null
      const targetSocket = targetSocketId
        ? io.sockets.sockets.get(targetSocketId)
        : null

      // Opponents receive the authoritative snapshot, but not the result of
      // another player's private question.
      const { correct, timedOut, immune, scroll, stunUntil, ...publicResult } = payload
      const room = io.to(matchRoom)
      if (targetSocketId && typeof room.except === 'function') {
        room.except(targetSocketId).emit(eventName, publicResult)
      } else {
        // The fallback keeps lightweight test doubles and older adapters
        // functional; real Socket.io uses room.except above.
        room.emit(eventName, publicResult)
      }
      // Emit after the public event so the claiming player keeps the private
      // result when both events arrive through the same socket.
      targetSocket?.emit(eventName, payload)
      return
    }

    io.to(matchRoom).emit(eventName, payload)
  }

  function handleManagerEvent(event, payload = {}) {
    emitManagerEvent(event, payload)
    if (event === 'match_finished' && resultStore) {
      void resultStore.settleMatch(payload).catch(error => {
        console.error('[moba-results] settlement error:', error)
      })
    }
  }

  const manager = suppliedManager || createMobaMatchManager({
    onEvent: handleManagerEvent,
  })

  adapter = {
    io,
    manager,
    playerSockets: new Map(),
    attach,
  }

  function currentPlayer(socket, matchId = socket.data.mobaMatchId) {
    if (!matchId || !socket.data.userId) return null
    const match = manager.getMatch(matchId)
    if (!match) return null
    return [...match.players.values()].find(player =>
      player.userId === socket.data.userId)
  }

  function requireStudent(socket, ack) {
    if (socket.data.role !== 'siswa' || !socket.data.userId) {
      emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Hanya siswa yang dapat bermain MOBA.',
        },
      }, ack)
      return false
    }
    if (!canStudentUseMoba({
      id: socket.data.userId,
      username: socket.data.username,
    }, mobaEnv)) {
      const disabled = ['0', 'false', 'off', 'no'].includes(
        String(mobaEnv.MOBA_ENABLED ?? 'true').trim().toLowerCase(),
      )
      emitError(socket, {
        ok: false,
        error: {
          code: disabled ? ERROR_CODES.MOBA_DISABLED : ERROR_CODES.MOBA_ACCESS_RESTRICTED,
          message: disabled
            ? 'Arena MOBA sedang dimatikan sementara.'
            : 'Akses Arena MOBA belum dibuka untuk akun ini.',
        },
      }, ack)
      return false
    }
    return true
  }

  function sendSnapshot(socket, matchId, playerId, ack = null) {
    const match = manager.getMatch(matchId)
    if (!match) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.MATCH_NOT_FOUND,
          message: 'Pertandingan MOBA tidak ditemukan.',
        },
      }, ack)
    }
    const player = match.players.get(playerId)
    if (!player || player.userId !== socket.data.userId) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Pemain tidak terdaftar di pertandingan ini.',
        },
      }, ack)
    }

    socket.join(roomFor(matchId))
    socket.data.mobaMatchId = matchId
    socket.data.mobaPlayerId = player.id
    adapter.playerSockets.set(socket.data.userId, socket.id)
    socket.emit('moba:state_snapshot', {
      matchId,
      serverNow: Date.now(),
      snapshot: manager.listMatches().find(item => item.id === matchId) || null,
    })
    const privateQuestion = manager.getPrivateQuestion({ matchId, playerId })
    if (privateQuestion.ok && privateQuestion.question) {
      socket.emit('moba:question_opened', {
        matchId,
        playerId,
        ...privateQuestion,
      })
    }
    return safeAck(ack, {
      ok: true,
      matchId,
      player: match.players.get(playerId)
        ? {
            id: player.id,
            teamId: player.teamId,
            userId: player.userId,
          }
        : null,
      snapshot: manager.listMatches().find(item => item.id === matchId) || null,
    })
  }

  async function joinOrReconnect(socket, matchId, ack) {
    if (!requireStudent(socket, ack)) return
    if (typeof matchId !== 'string' || !matchId.trim()) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.MATCH_NOT_FOUND,
          message: 'matchId wajib diisi.',
        },
      }, ack)
    }

    const existing = manager.findPlayerMatch({ userId: socket.data.userId })
    if (existing && existing.id !== matchId) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_ALREADY_IN_MATCH,
          message: 'Siswa sudah berada di pertandingan MOBA lain.',
        },
      }, ack)
    }
    if (existing) {
      const player = [...existing.players.values()].find(item =>
        item.userId === socket.data.userId)
      const timerKey = `${existing.id}:${player.id}`
      const timer = reconnectTimers.get(timerKey)
      if (timer) clearTimeout(timer)
      reconnectTimers.delete(timerKey)
      manager.setPlayerConnection({
        matchId: existing.id,
        playerId: player.id,
        connected: true,
      })
      return sendSnapshot(socket, existing.id, player.id, ack)
    }

    let profile
    try {
      profile = await loadProfile(socket.data.userId)
    } catch (error) {
      console.error('MOBA profile load error:', error)
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Profil Pet belum dapat diperiksa. Coba lagi.',
        },
      }, ack)
    }
    if (profile?.isDead) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Tomi sedang mati. Hidupkan Tomi kembali sebelum bermain MOBA.',
        },
      }, ack)
    }

    const result = manager.joinMatch({
      matchId,
      playerId: `moba-player:${socket.data.userId}`,
      userId: socket.data.userId,
      displayName: socket.data.displayName || socket.data.userName || 'Siswa',
      petType: profile?.petType || PET_TYPES.TOMI,
      petSkinId: profile?.petSkinId || 'golden',
    })
    if (!result.ok) return emitError(socket, result, ack)
    return sendSnapshot(socket, matchId, result.player.id, ack)
  }

  function queueFor(teamSize) {
    return matchmakingQueues.get(teamSize) || null
  }

  function queueStatus(teamSize, entry, status = 'queued') {
    const queue = queueFor(teamSize) || []
    const index = entry ? queue.indexOf(entry) : -1
    return {
      ok: true,
      status,
      teamSize,
      position: index >= 0 ? index + 1 : null,
      playersInQueue: queue.length,
      playersNeeded: teamSize * 2,
    }
  }

  function emitQueueStatus(teamSize) {
    const queue = queueFor(teamSize) || []
    queue.forEach(entry => {
      entry.socket.emit('moba:matchmaking_status', queueStatus(teamSize, entry))
    })
  }

  function removeFromMatchmaking(socket) {
    let removed = false
    matchmakingQueues.forEach((queue, teamSize) => {
      const next = queue.filter(entry => {
        const matches = entry.socket === socket ||
          String(entry.userId) === String(socket.data.userId)
        if (matches) removed = true
        return !matches
      })
      matchmakingQueues.set(teamSize, next)
      if (next.length !== queue.length) emitQueueStatus(teamSize)
    })
    return removed
  }

  function matchSnapshot(matchId) {
    return manager.listMatches().find(item => item.id === matchId) || null
  }

  /** Maps a grade number to the tournament game keys appropriate for that grade. */
  function getGameKeysForGrade(grade) {
    const g8Keys = SUPPORTED_TOURNAMENT_GAMES.filter(k => k.startsWith('g8'))
    const g9Keys = SUPPORTED_TOURNAMENT_GAMES.filter(k => k.startsWith('g9'))
    const g7Keys = SUPPORTED_TOURNAMENT_GAMES.filter(k => !k.startsWith('g8') && !k.startsWith('g9'))
    if (grade >= 9) return [...g9Keys, ...g8Keys, ...g7Keys].filter(Boolean)
    if (grade >= 8) return [...g8Keys, ...g7Keys].filter(Boolean)
    const keys = g7Keys.filter(Boolean)
    return keys.length > 0 ? keys : SUPPORTED_TOURNAMENT_GAMES
  }

  async function formMatchmakingGroup(teamSize, group) {
    // ── 1. Detect each player's grade from the DB ─────────────────────────────
    let lowestGrade = 7
    if (pool) {
      try {
        const userIds = group.map(e => String(e.userId))
        const { rows } = await pool.query(
          'SELECT kelas FROM students WHERE id = ANY($1::text[])',
          [userIds],
        )
        const grades = rows.map(r => {
          const k = String(r.kelas || '').trim()
          if (k.startsWith('IX')) return 9
          if (k.startsWith('VIII')) return 8
          return 7
        })
        if (grades.length > 0) lowestGrade = Math.min(...grades)
      } catch (err) {
        console.error('[moba] grade detection error:', err.message)
      }
    }

    // ── 2. Build curriculum question generator for the lowest grade ───────────
    let questionGeneratorOverride = null
    try {
      const gameKeys = getGameKeysForGrade(lowestGrade)
      if (gameKeys.length > 0) {
        questionGeneratorOverride = createCurriculumQuestionGenerator(gameKeys)
      }
    } catch (err) {
      console.error('[moba] curriculum build error:', err.message)
    }

    // ── 3. Create match ───────────────────────────────────────────────────────
    const created = manager.createMatch({ teamSize, questionGeneratorOverride })
    if (!created.ok) {
      group.forEach(entry => entry.socket.emit('moba:matchmaking_error', {
        code: created.error?.code || 'MATCH_CREATE_FAILED',
        message: created.error?.message || 'Pertandingan belum dapat dibuat. Coba lagi.',
      }))
      return null
    }

    // ── 4. Join all players ───────────────────────────────────────────────────
    const joinedPlayers = []
    for (const entry of group) {
      const result = manager.joinMatch({
        matchId: created.matchId,
        playerId: `moba-player:${entry.userId}`,
        userId: entry.userId,
        displayName: entry.socket.data.displayName || entry.socket.data.userName || 'Siswa',
        petType: entry.profile?.petType || PET_TYPES.TOMI,
        petSkinId: entry.profile?.petSkinId || 'golden',
      })
      if (!result.ok) {
        manager.cleanupMatch(created.matchId)
        group.forEach(item => item.socket.emit('moba:matchmaking_error', {
          code: result.error?.code || 'MATCH_JOIN_FAILED',
          message: result.error?.message || 'Pemain belum dapat dimasukkan ke arena. Coba lagi.',
        }))
        return null
      }
      joinedPlayers.push({ entry, player: result.player })
    }

    // ── 5. Put every socket in the room before events flow ────────────────────
    for (const { entry, player } of joinedPlayers) {
      await sendSnapshot(entry.socket, created.matchId, player.id)
    }

    // ── 6. Emit matchmaking_found WITHOUT auto-readying ───────────────────────
    // Players emit moba:client_loaded when their client is ready; that triggers
    // the countdown instead of immediate auto-ready here.
    const snapshot = matchSnapshot(created.matchId)
    joinedPlayers.forEach(({ entry, player }) => {
      entry.socket.emit('moba:matchmaking_found', {
        matchId: created.matchId,
        teamSize,
        playerId: player.id,
        snapshot,
      })
    })

    // ── 7. Safety timeout: auto-ready if clients take too long to load ────────
    const timeoutMs = DEFAULT_MOBA_CONFIG.clientLoadTimeoutMs || 30_000
    const timeoutId = setTimeout(() => {
      loadTimeouts.delete(created.matchId)
      const match = manager.getMatch(created.matchId)
      if (!match || match.phase !== PHASES.LOBBY) return
      console.log(`[moba] client load timeout for ${created.matchId}, auto-readying all`)
      for (const p of match.players.values()) {
        if (!p.ready) {
          manager.setReady({ matchId: created.matchId, playerId: p.id, ready: true })
        }
      }
    }, timeoutMs)
    loadTimeouts.set(created.matchId, timeoutId)

    return { matchId: created.matchId, snapshot }
  }

  async function tryMatchmaking(teamSize) {
    const queue = queueFor(teamSize)
    if (!queue) return null
    const groupSize = teamSize * 2
    let lastMatch = null
    while (queue.length >= groupSize) {
      const group = queue.splice(0, groupSize)
      lastMatch = await formMatchmakingGroup(teamSize, group)
      emitQueueStatus(teamSize)
    }
    return lastMatch
  }

  async function enterMatchmaking(socket, teamSize, ack) {
    if (!requireStudent(socket, ack)) return
    const numericTeamSize = Number(teamSize)
    const queue = queueFor(numericTeamSize)
    if (!queue) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.INVALID_TEAM_SIZE,
          message: 'Format pertandingan hanya 1v1, 2v2, atau 3v3.',
        },
      }, ack)
    }

    const existingMatch = manager.findPlayerMatch({ userId: socket.data.userId })
    if (existingMatch) {
      const player = [...existingMatch.players.values()]
        .find(item => item.userId === socket.data.userId)
      const result = await sendSnapshot(socket, existingMatch.id, player.id)
      return safeAck(ack, {
        ...(result || {}),
        status: 'matched',
        matchId: existingMatch.id,
      })
    }

    const alreadyQueued = [...matchmakingQueues.values()]
      .flat()
      .find(entry => String(entry.userId) === String(socket.data.userId))
    if (alreadyQueued) {
      return safeAck(ack, queueStatus(alreadyQueued.teamSize, alreadyQueued))
    }

    let profile
    try {
      profile = await loadProfile(socket.data.userId)
    } catch (error) {
      console.error('MOBA matchmaking profile load error:', error)
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Profil Pet belum dapat diperiksa. Coba lagi.',
        },
      }, ack)
    }
    if (profile?.isDead) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Tomi sedang mati. Hidupkan Tomi kembali sebelum bermain MOBA.',
        },
      }, ack)
    }

    const entry = {
      socket,
      userId: socket.data.userId,
      teamSize: numericTeamSize,
      profile,
      queuedAt: Date.now(),
    }
    queue.push(entry)
    const status = queueStatus(numericTeamSize, entry)
    safeAck(ack, status)
    emitQueueStatus(numericTeamSize)
    await tryMatchmaking(numericTeamSize)
    return status
  }

  function handleAction(socket, eventName, payload, ack, action) {
    if (!requireStudent(socket, ack)) return
    const player = currentPlayer(socket)
    if (!player) {
      return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Gabung ke pertandingan MOBA terlebih dahulu.',
        },
      }, ack)
    }
    const result = action({
      matchId: socket.data.mobaMatchId,
      playerId: player.id,
      ...payload,
      actionId: actionIdFor(socket, payload?.actionId),
    })
    if (!result.ok) return emitError(socket, result, ack)
    return safeAck(ack, result)
  }

  function attach(socket) {
    socket.on('moba:matchmaking_join', (payload = {}, ack) =>
      enterMatchmaking(socket, payload.teamSize, ack))

    socket.on('moba:matchmaking_cancel', (payload = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const removed = removeFromMatchmaking(socket)
      return safeAck(ack, {
        ok: true,
        status: removed ? 'cancelled' : 'idle',
      })
    })

    socket.on('moba:create', async ({ teamSize = 1, config = {} } = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const result = manager.createMatch({ teamSize, config })
      if (!result.ok) return emitError(socket, result, ack)
      const joined = await joinOrReconnect(socket, result.matchId, ack)
      // Creating the registry entry and joining it are one user action. If
      // profile/access validation fails after createMatch succeeds, do not
      // leave an unreachable empty match in the in-memory registry.
      if (joined?.ok === false) {
        manager.cleanupMatch(result.matchId)
      }
    })

    socket.on('moba:join', (payload = {}, ack) =>
      joinOrReconnect(socket, payload.matchId, ack))

    socket.on('moba:state_snapshot', (payload = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const matchId = payload.matchId || socket.data.mobaMatchId
      const player = currentPlayer(socket, matchId)
      if (!player) {
        return emitError(socket, {
          ok: false,
          error: {
            code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
            message: 'Gabung ke pertandingan MOBA terlebih dahulu.',
          },
        }, ack)
      }
      return sendSnapshot(socket, matchId, player.id, ack)
    })

    socket.on('moba:ready', (payload = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const player = currentPlayer(socket)
      if (!player) return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Gabung ke pertandingan MOBA terlebih dahulu.',
        },
      }, ack)
      const result = manager.setReady({
        matchId: socket.data.mobaMatchId,
        playerId: player.id,
        ready: payload.ready !== false,
      })
      if (!result.ok) return emitError(socket, result, ack)
      return safeAck(ack, result)
    })

    socket.on('moba:client_loaded', (payload = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const player = currentPlayer(socket)
      if (!player) {
        return emitError(socket, {
          ok: false,
          error: {
            code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
            message: 'Gabung ke pertandingan MOBA terlebih dahulu.',
          },
        }, ack)
      }
      const matchId = socket.data.mobaMatchId
      const result = manager.markClientLoaded({ matchId, playerId: player.id })
      if (result?.ok === false) return emitError(socket, result, ack)
      // When all players have loaded, the countdown starts automatically.
      // Clear the safety auto-ready timeout since it's no longer needed.
      if (result?.allLoaded === true || result?.startedCountdown === true) {
        const tid = loadTimeouts.get(matchId)
        if (tid) { clearTimeout(tid); loadTimeouts.delete(matchId) }
      }
      return safeAck(ack, result)
    })

    socket.on('moba:move', (payload = {}, ack) =>
      handleAction(socket, 'moba:move', payload, ack, data =>
        manager.movePlayer(data)))
    socket.on('moba:claim_node', (payload = {}, ack) =>
      handleAction(socket, 'moba:claim_node', payload, ack, data =>
        manager.claimNode(data)))
    socket.on('moba:answer_question', (payload = {}, ack) =>
      handleAction(socket, 'moba:answer_question', payload, ack, data =>
        manager.answerQuestion(data)))
    socket.on('moba:deposit_scroll', (payload = {}, ack) =>
      handleAction(socket, 'moba:deposit_scroll', payload, ack, data =>
        manager.depositScroll(data)))

    socket.on('moba:leave', (payload = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const player = currentPlayer(socket, payload.matchId)
      if (!player) return emitError(socket, {
        ok: false,
        error: {
          code: ERROR_CODES.PLAYER_NOT_IN_MATCH,
          message: 'Gabung ke pertandingan MOBA terlebih dahulu.',
        },
      }, ack)
      const result = manager.leaveMatch({
        matchId: payload.matchId || socket.data.mobaMatchId,
        playerId: player.id,
      })
      if (!result.ok) return emitError(socket, result, ack)
      socket.leave(roomFor(result.matchId))
      socket.data.mobaMatchId = null
      socket.data.mobaPlayerId = null
      adapter.playerSockets.delete(socket.data.userId)
      return safeAck(ack, result)
    })

    socket.on('disconnect', () => {
      removeFromMatchmaking(socket)
      const matchId = socket.data.mobaMatchId
      const playerId = socket.data.mobaPlayerId
      const userId = socket.data.userId
      if (!matchId || !playerId || !userId) return
      const player = currentPlayer(socket, matchId)
      if (!player) return
      if (adapter.playerSockets.get(userId) === socket.id) {
        adapter.playerSockets.delete(userId)
      }
      manager.setPlayerConnection({ matchId, playerId, connected: false })
      const timerKey = `${matchId}:${playerId}`
      const timer = setTimeout(() => {
        reconnectTimers.delete(timerKey)
        const match = manager.getMatch(matchId)
        const current = match?.players.get(playerId)
        if (current && !current.connected) {
          // Keep the player in the match until the match manager's own finish
          // and cleanup timers run; the disconnected flag blocks all actions.
        }
      }, reconnectGraceMs)
      reconnectTimers.set(timerKey, timer)
    })
  }

  return adapter
}

export { roomFor }