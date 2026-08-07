/**
 * Socket.io adapter for the transport-agnostic TOMAT MOBA manager.
 *
 * The adapter owns rooms, authenticated socket identity, acknowledgements, and
 * reconnect grace periods. Match rules and mutations remain in match-manager.
 */

import { createMobaMatchManager } from './match-manager.js'
import { ERROR_CODES, PET_TYPES } from './config.js'
import { computeHunger, getHungerUntil, skinToPetType } from '../pet-state.js'

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
} = {}) {
  if (!io || typeof io.to !== 'function') {
    throw new TypeError('io is required')
  }

  const reconnectTimers = new Map()
  let adapter

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

    io.to(matchRoom).emit(eventName, payload)
  }

  const manager = suppliedManager || createMobaMatchManager({
    onEvent: emitManagerEvent,
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
    socket.on('moba:create', async ({ teamSize = 1, config = {} } = {}, ack) => {
      if (!requireStudent(socket, ack)) return
      const result = manager.createMatch({ teamSize, config })
      if (!result.ok) return emitError(socket, result, ack)
      await joinOrReconnect(socket, result.matchId, ack)
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