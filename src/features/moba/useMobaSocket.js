import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { connectSocket, getSocket } from '../../socket'
import { mobaReducer } from './mobaReducer.js'
import {
  initialMobaState,
  MOBA_ACTIONS,
  MOBA_CONNECTION,
  MOBA_SERVER_EVENTS,
} from './mobaTypes.js'

const ACK_TIMEOUT_MS = 10_000

function createActionId(counterRef, userId = 'player') {
  counterRef.current += 1
  return `${userId}:moba:${counterRef.current}`
}

function isDevLoggingEnabled(debug) {
  return debug === true || (debug === 'auto' && import.meta.env.DEV)
}

/**
 * Connects a MOBA screen to the shared TOMAT Socket.io client.
 *
 * The hook does not mutate UI state optimistically. Every game state change
 * comes from an acknowledgement or a server event/snapshot.
 */
export function useMobaSocket({
  enabled = true,
  userId = null,
  matchId = null,
  debug = false,
  ackTimeoutMs = ACK_TIMEOUT_MS,
} = {}) {
  const [state, dispatch] = useReducer(mobaReducer, initialMobaState)
  const actionCounter = useRef(0)
  const stateRef = useRef(state)
  const socketRef = useRef(null)
  const debugEnabled = useMemo(() => isDevLoggingEnabled(debug), [debug])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    dispatch({ type: MOBA_ACTIONS.SET_SELF_ID, selfId: userId })
  }, [userId])

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: MOBA_ACTIONS.CONNECTION, status: MOBA_CONNECTION.IDLE })
      return undefined
    }

    const socket = getSocket()
    socketRef.current = socket
    const log = (...args) => {
      if (debugEnabled) console.debug('[moba socket]', ...args)
    }
    const onConnect = () => {
      log('connected', socket.id)
      dispatch({ type: MOBA_ACTIONS.CONNECTION, status: MOBA_CONNECTION.CONNECTED })
      // A requested match still needs to be joined first. Requesting a
      // snapshot here races MobaScreen's join effect when the shared socket is
      // already connected (for example, after leaving the lobby).
      const activeMatchId = stateRef.current.matchId
      if (activeMatchId && (!matchId || activeMatchId === matchId)) {
        socket.emit('moba:state_snapshot', { matchId: activeMatchId })
      }
    }
    const onDisconnect = reason => {
      log('disconnected', reason)
      dispatch({
        type: MOBA_ACTIONS.CONNECTION,
        status: MOBA_CONNECTION.DISCONNECTED,
      })
    }
    const onConnectError = error => {
      log('connect_error', error)
      dispatch({
        type: MOBA_ACTIONS.ERROR,
        error: {
          code: 'SOCKET_CONNECT_ERROR',
          message: error?.message || 'Koneksi MOBA gagal.',
          transport: true,
        },
      })
    }
    const onError = error => {
      log('moba:error', error)
      dispatch({ type: MOBA_ACTIONS.ERROR, error })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on('moba:error', onError)

    const eventHandlers = MOBA_SERVER_EVENTS.map(event => {
      const eventName = `moba:${event}`
      const handler = payload => {
        log(eventName, payload)
        if (event === 'state_snapshot') {
          dispatch({ type: MOBA_ACTIONS.SNAPSHOT, payload })
        } else {
          dispatch({ type: MOBA_ACTIONS.SERVER_EVENT, event, payload })
        }
      }
      socket.on(eventName, handler)
      return [eventName, handler]
    })

    if (!socket.connected) {
      dispatch({ type: MOBA_ACTIONS.CONNECTION, status: MOBA_CONNECTION.CONNECTING })
      connectSocket()
    } else {
      onConnect()
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off('moba:error', onError)
      eventHandlers.forEach(([eventName, handler]) => socket.off(eventName, handler))
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [enabled, matchId, debugEnabled])

  const emitAck = useCallback((eventName, payload = {}) => {
    const socket = socketRef.current || getSocket()
    return new Promise((resolve, reject) => {
      let settled = false
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        const error = {
          code: 'ACK_TIMEOUT',
          message: 'Server tidak merespons. Periksa koneksi lalu coba lagi.',
          transport: true,
        }
        dispatch({ type: MOBA_ACTIONS.ERROR, error })
        reject(Object.assign(new Error(error.message), error))
      }, ackTimeoutMs)

      socket.emit(eventName, payload, result => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (result?.ok === false) {
          dispatch({ type: MOBA_ACTIONS.ERROR, error: result.error })
          reject(Object.assign(new Error(result.error?.message || 'Aksi ditolak.'), result.error))
          return
        }
        // create/join/ready and snapshot acknowledgements all contain the
        // authoritative public snapshot. Hydrate it immediately instead of
        // waiting for a room broadcast (the creator is not in the room until
        // after the create request has already emitted its first event).
        if (result?.snapshot?.id) {
          dispatch({
            type: MOBA_ACTIONS.SNAPSHOT,
            payload: {
              matchId: result.matchId || result.snapshot.id,
              serverNow: result.serverNow ?? Date.now(),
              snapshot: result.snapshot,
            },
          })
        }
        resolve(result || { ok: true })
      })
    })
  }, [ackTimeoutMs])

  const action = useCallback((eventName, payload = {}) => emitAck(eventName, payload), [emitAck])
  const withActionId = useCallback((payload = {}) => ({
    ...payload,
    actionId: payload.actionId || createActionId(actionCounter, userId),
  }), [userId])

  return {
    state,
    connected: state.connection === MOBA_CONNECTION.CONNECTED,
    join: useCallback((requestedMatchId = matchId) =>
      action('moba:join', { matchId: requestedMatchId }), [action, matchId]),
    createMatch: useCallback((teamSize = 1, config = {}) =>
      action('moba:create', { teamSize, config }), [action]),
    findMatch: useCallback((teamSize = 1) =>
      action('moba:matchmaking_join', { teamSize }), [action]),
    startSolo: useCallback(() =>
      action('moba:start_solo', {}), [action]),
    cancelMatchmaking: useCallback(() =>
      action('moba:matchmaking_cancel'), [action]),
    ready: useCallback((ready = true) =>
      action('moba:ready', { ready }), [action]),
    move: useCallback((payload = {}) =>
      action('moba:move', withActionId(payload)), [action, withActionId]),
    claimNode: useCallback((payload = {}) =>
      action('moba:claim_node', withActionId(payload)), [action, withActionId]),
    answerQuestion: useCallback((payload = {}) =>
      action('moba:answer_question', withActionId(payload)), [action, withActionId]),
    depositScroll: useCallback((payload = {}) =>
      action('moba:deposit_scroll', withActionId(payload)), [action, withActionId]),
    requestSnapshot: useCallback((requestedMatchId = matchId) =>
      action('moba:state_snapshot', { matchId: requestedMatchId }), [action, matchId]),
    leave: useCallback((requestedMatchId = matchId) =>
      action('moba:leave', { matchId: requestedMatchId }), [action, matchId]),
    clientLoaded: useCallback((requestedMatchId = matchId) =>
      action('moba:client_loaded', { matchId: requestedMatchId }), [action, matchId]),
    clearError: useCallback(() => dispatch({ type: MOBA_ACTIONS.CLEAR_ERROR }), []),
    clearQuestionResult: useCallback(() =>
      dispatch({ type: MOBA_ACTIONS.CLEAR_QUESTION_RESULT }), []),
    reset: useCallback(() => dispatch({ type: MOBA_ACTIONS.RESET }), []),
  }
}

export default useMobaSocket