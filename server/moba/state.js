/**
 * Pure TOMAT MOBA state model.
 *
 * MatchState contains Maps and server-only references. Consumers must use
 * sanitizeMatchState() before sending anything to a client.
 */

import { randomUUID } from 'node:crypto'
import {
  DEFAULT_MOBA_CONFIG,
  DEFAULT_POSITION_BY_TEAM,
  DEPOSIT_ZONES,
  DIFFICULTIES,
  MOBA_MODE,
  PET_TYPES,
  PHASES,
  POINTS_BY_DIFFICULTY,
  TEAM_SIZES,
  isValidDifficulty,
  isValidPetType,
  isValidTeamSize,
} from './config.js'

const DEFAULT_PET_TYPE = PET_TYPES.TOMI
const DEFAULT_DIFFICULTY = DIFFICULTIES.EASY

function createId(prefix) {
  return `${prefix}-${randomUUID()}`
}

function clonePosition(position, fallback) {
  const source = position || fallback
  return {
    x: Number.isFinite(source?.x) ? source.x : fallback.x,
    y: Number.isFinite(source?.y) ? source.y : fallback.y,
    lane: typeof source?.lane === 'string' ? source.lane : fallback.lane,
  }
}

function cloneConfig(config = {}) {
  const arenaOverrides = config.arena || {}
  return {
    ...DEFAULT_MOBA_CONFIG,
    ...config,
    arena: {
      ...DEFAULT_MOBA_CONFIG.arena,
      ...arenaOverrides,
    },
  }
}

function createTeam(id, teamSize, config) {
  return {
    id,
    name: id === 'teamA' ? 'Tim A' : 'Tim B',
    playerIds: [],
    maxPlayers: teamSize,
    tower: {
      points: 0,
      maxPoints: config.towerMaxPoints,
      destroyed: false,
    },
    score: 0,
    base: {
      points: 0,
      maxPoints: config.baseMaxHp,
      hp: config.baseMaxHp,
    },
  }
}

function assertTeamSize(teamSize) {
  if (!isValidTeamSize(teamSize)) {
    throw new RangeError(`teamSize must be one of: ${TEAM_SIZES.join(', ')}`)
  }
}

/**
 * Creates the mutable server-side player state.
 *
 * questionSession and recentActionIds are deliberately private fields. They
 * are useful to future action handlers, but never appear in publicPlayer().
 */
export function createPlayerState({
  id = createId('player'),
  teamId = 'teamA',
  userId = id,
  displayName = 'Pemain',
  petType = DEFAULT_PET_TYPE,
  petSkinId = 'golden',
  position,
  connected = true,
  now = Date.now(),
} = {}) {
  if (!isValidPetType(petType)) {
    throw new RangeError(`Unknown MOBA pet type: ${petType}`)
  }

  const fallbackPosition = DEFAULT_POSITION_BY_TEAM[teamId] || DEFAULT_POSITION_BY_TEAM.teamA

  return {
    id,
    teamId,
    userId,
    displayName,
    petType,
    petSkinId,
    position: clonePosition(position, fallbackPosition),
    connected: Boolean(connected),
    ready: false,
    lastInputAt: now,
    stunUntil: 0,
    claimedNodeId: null,
    questionSession: null,
    scrolls: [],
    maxScrolls: DEFAULT_MOBA_CONFIG.baseScrollCapacity,
    score: 0,
    answeredCorrect: 0,
    answeredWrong: 0,
    deposits: 0,
    immunityAvailable: false,
    immunityRemaining: 0,
    // Server-only idempotency bookkeeping. The lifecycle/action layer owns
    // its retention policy; the state model only provides the container.
    recentActionIds: new Map(),
  }
}

/**
 * Creates the mutable server-side match state.
 */
export function createMatchState({
  id = createId('match'),
  teamSize = 1,
  now = Date.now(),
  config: configOverrides = {},
} = {}) {
  assertTeamSize(teamSize)
  const config = cloneConfig(configOverrides)

  return {
    id,
    mode: MOBA_MODE,
    teamSize,
    phase: PHASES.LOBBY,
    createdAt: now,
    startedAt: null,
    endsAt: null,
    tick: 0,
    config,
    teams: {
      teamA: createTeam('teamA', teamSize, config),
      teamB: createTeam('teamB', teamSize, config),
    },
    players: new Map(),
    activeNodes: new Map(),
    // Server-only question data. Entries can contain answer/correctAnswer.
    questions: new Map(),
    questionTimers: new Map(),
    closedQuestionSessions: new Map(),
    timers: {
      countdown: null,
      spawn: null,
      finish: null,
      cleanup: null,
      wave2: null,
    },
    eventSeq: 0,
    // Loading gate: tracks which players have reported ready-to-play.
    clientLoadedIds: new Set(),
    // Box fill state per deposit zone (scoring zones only).
    depositBoxes: new Map(
      DEPOSIT_ZONES
        .filter(z => !z.isLibrary)
        .map(z => [z.id, { fill: 0, completedBoxes: 0 }]),
    ),
  }
}

function publicPosition(position) {
  return {
    x: position.x,
    y: position.y,
    lane: position.lane,
  }
}

/**
 * Returns the only node shape safe for a client.
 */
export function publicNode(node) {
  if (!node) return null

  return {
    id: node.id,
    difficulty: node.difficulty,
    points: node.points ?? POINTS_BY_DIFFICULTY[node.difficulty] ?? 0,
    position: publicPosition(node.position),
    status: node.status,
    claimedBy: node.claimedBy ?? null,
    spawnedAt: node.spawnedAt,
    expiresAt: node.expiresAt,
  }
}

/**
 * Returns the public player shape. In particular, questionSession is omitted.
 */
export function publicPlayer(player) {
  if (!player) return null

  return {
    id: player.id,
    teamId: player.teamId,
    userId: player.userId,
    displayName: player.displayName,
    petType: player.petType,
    petSkinId: player.petSkinId,
    position: publicPosition(player.position),
    connected: player.connected,
    ready: Boolean(player.ready),
    stunUntil: player.stunUntil,
    claimedNodeId: player.claimedNodeId,
    scrolls: player.scrolls.map(({ id, points, difficulty, questionId, earnedAt }) => ({
      id,
      points,
      difficulty,
      questionId,
      earnedAt,
    })),
    maxScrolls: player.maxScrolls,
    score: player.score,
    answeredCorrect: player.answeredCorrect,
    answeredWrong: player.answeredWrong,
    deposits: player.deposits,
    immunityAvailable: player.immunityAvailable,
    immunityRemaining: player.immunityRemaining ?? 0,
  }
}

function publicTeam(team) {
  return {
    id: team.id,
    name: team.name,
    playerIds: [...team.playerIds],
    maxPlayers: team.maxPlayers,
    score: team.score,
    tower: { ...team.tower },
    base: { ...team.base },
  }
}

/**
 * Creates a detached, client-safe snapshot.
 *
 * It intentionally does not include match.questions, match.timers, or any
 * other server-only bookkeeping. Returned arrays/objects can be mutated by a
 * caller without changing the live MatchState.
 */
export function sanitizeMatchState(match) {
  if (!match || typeof match !== 'object') {
    throw new TypeError('match is required')
  }

  const publicConfig = {
    durationMs: match.config.durationMs,
    countdownMs: match.config.countdownMs,
    cleanupGraceMs: match.config.cleanupGraceMs,
    nodeSpawnIntervalMs: match.config.nodeSpawnIntervalMs,
    nodeTtlMs: match.config.nodeTtlMs,
    questionTimeMs: match.config.questionTimeMs,
    actionIdTtlMs: match.config.actionIdTtlMs,
    movementSpeed: match.config.movementSpeed,
    movementMinIntervalMs: match.config.movementMinIntervalMs,
    movementMaxDeltaMs: match.config.movementMaxDeltaMs,
    maxActiveNodes: match.config.maxActiveNodes,
    nodeInteractionRadius: match.config.nodeInteractionRadius,
    depositInteractionRadius: match.config.depositInteractionRadius,
    playerCollisionRadius: match.config.playerCollisionRadius,
    tomiDepositMultiplier: match.config.tomiDepositMultiplier,
    arena: {
      ...match.config.arena,
      // Keep the grid contract explicit in every snapshot so the renderer
      // does not need to infer tiles from the viewport size.
      tileSize: match.config.arena.tileSize,
      columns: match.config.arena.columns,
      rows: match.config.arena.rows,
    },
    towerMaxPoints: match.config.towerMaxPoints,
    baseMaxHp: match.config.baseMaxHp,
    wrongAnswerStunMs: match.config.wrongAnswerStunMs,
    baseScrollCapacity: match.config.baseScrollCapacity,
    monyangScrollCapacity: match.config.monyangScrollCapacity,
    boxCapacity: match.config.boxCapacity,
    // Static zone positions exposed to client so it can compute auto-deposit proximity.
    depositZones: DEPOSIT_ZONES.filter(z => !z.isLibrary).map(z => ({
      id: z.id,
      team: z.team,
      x: z.x,
      y: z.y,
    })),
  }

  return {
    id: match.id,
    mode: match.mode,
    teamSize: match.teamSize,
    phase: match.phase,
    createdAt: match.createdAt,
    startedAt: match.startedAt,
    endsAt: match.endsAt,
    countdownStartedAt: match.countdownStartedAt ?? null,
    countdownEndsAt: match.countdownEndsAt ?? null,
    tick: match.tick,
    config: publicConfig,
    teams: {
      teamA: publicTeam(match.teams.teamA),
      teamB: publicTeam(match.teams.teamB),
    },
    players: [...match.players.values()].map(publicPlayer),
    activeNodes: [...match.activeNodes.values()].map(publicNode),
    eventSeq: match.eventSeq,
    depositBoxes: [...(match.depositBoxes?.entries() || [])].map(
      ([id, s]) => ({ id, fill: s.fill, completedBoxes: s.completedBoxes }),
    ),
  }
}

export { DIFFICULTIES, PHASES, POINTS_BY_DIFFICULTY }