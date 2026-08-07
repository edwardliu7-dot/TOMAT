import {
  initialMobaState,
  MOBA_ACTIONS,
  MOBA_CONNECTION,
} from './mobaTypes.js'

const MAX_EVENT_FEED = 30

function cloneRecord(items = [], key = 'id') {
  return items.reduce((record, item) => {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      record[item[key]] = item
    }
    return record
  }, {})
}

function playersFromMatch(match) {
  return cloneRecord(match?.players, 'id')
}

function nodesFromMatch(match) {
  return cloneRecord(match?.activeNodes || match?.nodes, 'id')
}

function selfFromPlayers(players, selfId) {
  if (!selfId) return null
  return Object.values(players).find(player =>
    player.id === selfId || player.userId === selfId) || null
}

function withMatch(state, match, extra = {}) {
  if (!match) return state
  const players = playersFromMatch(match)
  const nodes = nodesFromMatch(match)
  return {
    ...state,
    ...extra,
    match,
    matchId: match.id ?? state.matchId,
    players,
    nodes,
    self: selfFromPlayers(players, state.selfId),
    lastEventSeq: Number.isFinite(match.eventSeq)
      ? match.eventSeq
      : state.lastEventSeq,
  }
}

function snapshotPayload(payload) {
  if (payload?.snapshot) {
    return {
      match: payload.snapshot,
      serverNow: payload.serverNow ?? null,
      matchId: payload.matchId ?? payload.snapshot.id ?? null,
    }
  }
  if (payload?.match?.id) {
    return {
      match: payload.match,
      serverNow: payload.serverNow ?? null,
      matchId: payload.matchId ?? payload.match.id,
    }
  }
  if (payload?.id && payload?.phase) {
    return { match: payload, serverNow: payload.serverNow ?? null, matchId: payload.id }
  }
  return null
}

function addFeed(state, event, payload) {
  const important = new Set([
    'match_countdown',
    'match_started',
    'question_closed',
    'scroll_deposited',
    'tower_destroyed',
    'match_finished',
  ])
  if (!important.has(event)) return state.eventFeed
  return [
    ...state.eventFeed,
    { id: `${event}:${state.lastEventSeq + 1}`, event, payload },
  ].slice(-MAX_EVENT_FEED)
}

function mergePlayer(state, player) {
  if (!player?.id) return state
  const players = { ...state.players, [player.id]: player }
  return {
    ...state,
    players,
    self: selfFromPlayers(players, state.selfId),
  }
}

function mergeNode(state, node) {
  if (!node?.id) return state
  return {
    ...state,
    nodes: { ...state.nodes, [node.id]: node },
  }
}

function setPetVisualState(state, playerId, visualState, durationMs) {
  if (!playerId) return state
  return {
    ...state,
    petStates: {
      ...state.petStates,
      [playerId]: {
        state: visualState,
        until: Date.now() + durationMs,
      },
    },
  }
}

function applyServerEvent(state, event, payload = {}) {
  const snapshot = snapshotPayload(payload)
  let next = snapshot
    ? withMatch(state, snapshot.match, {
        serverNow: snapshot.serverNow,
        matchId: snapshot.matchId,
      })
    : state

  if (event === 'state_snapshot') {
    return {
      ...next,
      connection: MOBA_CONNECTION.CONNECTED,
      activeQuestion: null,
      questionResult: null,
      lastError: null,
      lastEvent: event,
    }
  }

  if (event === 'question_opened') {
    const isSelfQuestion = !payload.playerId ||
      payload.playerId === state.selfId ||
      payload.playerId === state.self?.id ||
      payload.playerId === state.self?.userId
    if (!isSelfQuestion) return next
    return {
      ...next,
      activeQuestion: {
        ...payload,
        question: payload.question || null,
      },
      questionResult: null,
      lastEvent: event,
    }
  }

  if (event === 'question_closed') {
    const isSelfResult = !payload.playerId ||
      payload.playerId === state.selfId ||
      payload.playerId === state.self?.id ||
      payload.playerId === state.self?.userId
    let result = {
      ...next,
      activeQuestion: null,
      questionResult: isSelfResult ? payload : next.questionResult,
      lastEvent: event,
      eventFeed: addFeed(next, event, payload),
    }
    if (payload.correct === true) {
      result = setPetVisualState(result, payload.playerId, 'happy', 1300)
    } else if (payload.correct === false || payload.timedOut === true) {
      result = setPetVisualState(result, payload.playerId, 'hungry', 3200)
    }
    return result
  }

  if (event === 'node_expired') {
    const node = payload.node
    const nodes = { ...next.nodes }
    if (node?.id) nodes[node.id] = node
    return { ...next, nodes, lastEvent: event }
  }

  if (event === 'node_spawned' || event === 'node_claimed') {
    const node = payload.node || payload
    next = mergeNode(next, node)
    return { ...next, lastEvent: event }
  }

  if (event === 'player_updated' || event === 'player_joined' || event === 'player_ready') {
    const merged = mergePlayer(next, payload.player)
    if (event !== 'player_updated' || !payload.actionId) {
      return { ...merged, lastEvent: event }
    }
    return {
      ...setPetVisualState(merged, payload.player?.id, 'walk', 240),
      lastEvent: event,
    }
  }

  if (event === 'player_left') {
    const players = { ...next.players }
    if (payload.playerId) delete players[payload.playerId]
    return {
      ...next,
      players,
      self: selfFromPlayers(players, next.selfId),
      lastEvent: event,
    }
  }

  if (event === 'matchmaking_status') {
    return {
      ...next,
      matchmaking: {
        ...next.matchmaking,
        ...payload,
        status: payload.status || 'queued',
      },
      lastEvent: event,
    }
  }

  if (event === 'matchmaking_found') {
    return {
      ...next,
      matchmaking: {
        ...next.matchmaking,
        ...payload,
        status: 'matched',
        matchId: payload.matchId || payload.snapshot?.id || null,
      },
      lastEvent: event,
    }
  }

  if (event === 'matchmaking_error') {
    return {
      ...next,
      matchmaking: {
        ...next.matchmaking,
        status: 'error',
      },
      lastError: payload,
      lastEvent: event,
    }
  }

  if (event === 'match_cleaned') {
    return {
      ...initialMobaState,
      selfId: state.selfId,
      connection: state.connection,
      lastEvent: event,
    }
  }

  if (event === 'match_finished') {
    return {
      ...next,
      activeQuestion: null,
      lastEvent: event,
      eventFeed: addFeed(next, event, payload),
    }
  }

  return {
    ...next,
    lastEvent: event,
    eventFeed: addFeed(next, event, payload),
  }
}

export function mobaReducer(state = initialMobaState, action = {}) {
  switch (action.type) {
    case MOBA_ACTIONS.SET_SELF_ID: {
      const selfId = action.selfId || null
      return {
        ...state,
        selfId,
        self: selfFromPlayers(state.players, selfId),
      }
    }
    case MOBA_ACTIONS.CONNECTION:
      return {
        ...state,
        connection: action.status || MOBA_CONNECTION.IDLE,
        lastError: action.status === MOBA_CONNECTION.CONNECTED
          ? null
          : state.lastError,
      }
    case MOBA_ACTIONS.SNAPSHOT:
      return applyServerEvent(state, 'state_snapshot', action.payload)
    case MOBA_ACTIONS.SERVER_EVENT:
      return applyServerEvent(state, action.event, action.payload)
    case MOBA_ACTIONS.ERROR:
      return {
        ...state,
        connection: action.error?.transport
          ? MOBA_CONNECTION.ERROR
          : state.connection,
        lastError: action.error || { code: 'UNKNOWN', message: 'Aksi ditolak.' },
      }
    case MOBA_ACTIONS.CLEAR_ERROR:
      return { ...state, lastError: null }
    case MOBA_ACTIONS.CLEAR_QUESTION_RESULT:
      return { ...state, questionResult: null }
    case MOBA_ACTIONS.RESET:
      return { ...initialMobaState, selfId: state.selfId }
    default:
      return state
  }
}

export const selectMobaPlayers = state => Object.values(state?.players || {}).map(player => ({
  ...player,
  mobaPetState: state?.petStates?.[player.id] || null,
}))
export const selectMobaNodes = state => Object.values(state?.nodes || {})