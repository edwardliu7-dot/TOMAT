/**
 * Shared frontend vocabulary for TOMAT MOBA.
 *
 * The project uses JavaScript, so these constants and JSDoc shapes keep the
 * reducer and socket hook aligned without adding a second type toolchain.
 */

export const MOBA_CONNECTION = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
})

export const MOBA_ACTIONS = Object.freeze({
  SET_SELF_ID: 'moba/set_self_id',
  CONNECTION: 'moba/connection',
  SNAPSHOT: 'moba/snapshot',
  SERVER_EVENT: 'moba/server_event',
  ERROR: 'moba/error',
  CLEAR_ERROR: 'moba/clear_error',
  CLEAR_QUESTION_RESULT: 'moba/clear_question_result',
  RESET: 'moba/reset',
})

export const MOBA_SERVER_EVENTS = Object.freeze([
  'state_snapshot',
  'match_created',
  'match_countdown',
  'match_started',
  'node_spawned',
  'node_claimed',
  'node_expired',
  'question_opened',
  'question_closed',
  'player_joined',
  'player_ready',
  'player_updated',
  'player_left',
  'scroll_deposited',
  'tower_destroyed',
  'match_finished',
  'match_cleaned',
])

/**
 * @typedef {{
 *   connection: string,
 *   match: object|null,
 *   matchId: string|null,
 *   self: object|null,
 *   selfId: string|null,
 *   players: Record<string, object>,
 *   nodes: Record<string, object>,
 *   activeQuestion: object|null,
 *   questionResult: object|null,
 *   lastError: object|null,
 *   eventFeed: Array<object>,
 *   serverNow: number|null,
 *   lastEvent: string|null,
 *   lastEventSeq: number,
 * }} MobaState
 */

export const initialMobaState = Object.freeze({
  connection: MOBA_CONNECTION.IDLE,
  match: null,
  matchId: null,
  self: null,
  selfId: null,
  players: {},
  nodes: {},
  activeQuestion: null,
  questionResult: null,
  lastError: null,
  eventFeed: [],
  serverNow: null,
  lastEvent: null,
  lastEventSeq: 0,
})