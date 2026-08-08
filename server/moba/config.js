/**
 * Pure configuration and enums for TOMAT's 2D educational MOBA mode.
 *
 * This module intentionally has no Socket.io, database, timer, or Express
 * dependency. Match lifecycle code can import these values without coupling
 * the state model to a transport or persistence layer.
 */

export const MOBA_MODE = 'tomat-moba'

export const TEAM_SIZES = Object.freeze([1, 2, 3])

export const PHASES = Object.freeze({
  LOBBY: 'lobby',
  COUNTDOWN: 'countdown',
  RUNNING_OUTER_TOWER: 'running_outer_tower',
  RUNNING_MAIN_BASE: 'running_main_base',
  FINISHED: 'finished',
})

export const DIFFICULTIES = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
})

export const PET_TYPES = Object.freeze({
  TOMI: 'tomi',
  KELINSAY: 'kelinsay',
  MONYANG: 'monyang',
  KOMODIH: 'komodih',
  NANANAGA: 'nananaga',
})

export const ERROR_CODES = Object.freeze({
  INVALID_TEAM_SIZE: 'INVALID_TEAM_SIZE',
  INVALID_TEAM: 'INVALID_TEAM',
  INVALID_PHASE: 'INVALID_PHASE',
  MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
  MATCH_FINISHED: 'MATCH_FINISHED',
  MATCH_ALREADY_EXISTS: 'MATCH_ALREADY_EXISTS',
  PLAYER_NOT_IN_MATCH: 'PLAYER_NOT_IN_MATCH',
  PLAYER_ALREADY_IN_MATCH: 'PLAYER_ALREADY_IN_MATCH',
  PLAYER_NOT_IN_TEAM: 'PLAYER_NOT_IN_TEAM',
  TEAM_FULL: 'TEAM_FULL',
  TEAMS_UNBALANCED: 'TEAMS_UNBALANCED',
  MATCH_NOT_READY: 'MATCH_NOT_READY',
  PLAYER_NOT_READY: 'PLAYER_NOT_READY',
  NOT_LOBBY: 'NOT_LOBBY',
  COUNTDOWN_IN_PROGRESS: 'COUNTDOWN_IN_PROGRESS',
  INVALID_SPAWN_POSITION: 'INVALID_SPAWN_POSITION',
  INVALID_DIFFICULTY: 'INVALID_DIFFICULTY',
  ACTION_ID_REQUIRED: 'ACTION_ID_REQUIRED',
  PLAYER_STUNNED: 'PLAYER_STUNNED',
  PLAYER_DISCONNECTED: 'PLAYER_DISCONNECTED',
  QUESTION_ALREADY_ACTIVE: 'QUESTION_ALREADY_ACTIVE',
  NODE_NOT_AVAILABLE: 'NODE_NOT_AVAILABLE',
  PLAYER_TOO_FAR: 'PLAYER_TOO_FAR',
  QUESTION_EXPIRED: 'QUESTION_EXPIRED',
  QUESTION_NOT_ACTIVE: 'QUESTION_NOT_ACTIVE',
  SCROLL_CAPACITY_REACHED: 'SCROLL_CAPACITY_REACHED',
  TOWER_STILL_ACTIVE: 'TOWER_STILL_ACTIVE',
  INVALID_DEPOSIT_TARGET: 'INVALID_DEPOSIT_TARGET',
  SCROLL_NOT_OWNED: 'SCROLL_NOT_OWNED',
  DUPLICATE_ACTION: 'DUPLICATE_ACTION',
  MOVE_INVALID_INPUT: 'MOVE_INVALID_INPUT',
  MOVE_RATE_LIMITED: 'MOVE_RATE_LIMITED',
  MOVE_OUT_OF_BOUNDS: 'MOVE_OUT_OF_BOUNDS',
  MOVE_COLLISION: 'MOVE_COLLISION',
  MOBA_DISABLED: 'MOBA_DISABLED',
  MOBA_ACCESS_RESTRICTED: 'MOBA_ACCESS_RESTRICTED',
})

export const POINTS_BY_DIFFICULTY = Object.freeze({
  [DIFFICULTIES.EASY]: 10,
  [DIFFICULTIES.MEDIUM]: 25,
  [DIFFICULTIES.HARD]: 50,
})

export const DEFAULT_MOBA_CONFIG = Object.freeze({
  durationMs: 600_000,
  countdownMs: 3_000,
  cleanupGraceMs: 30_000,
  nodeSpawnIntervalMs: 8_000,
  nodeTtlMs: 20_000,
  questionTimeMs: 15_000,
  actionIdTtlMs: 60_000,
  movementSpeed: 240,
  movementMinIntervalMs: 40,
  // Movement is input-driven, not idle-time-driven. Without a cap, the first
  // input after the lobby countdown would spend all elapsed lobby time in one
  // step and often jump straight out of the arena.
  movementMaxDeltaMs: 120,
  maxActiveNodes: 12,
  nodeInteractionRadius: 72,
  depositInteractionRadius: 110,
  playerCollisionRadius: 28,
  arena: Object.freeze({
    minX: 80,
    maxX: 920,
    minY: 80,
    maxY: 520,
    nodeSafeRadius: 44,
    playerSafeRadius: 56,
    baseSafeRadius: 100,
    maxSpawnAttempts: 100,
  }),
  towerMaxPoints: 100,
  baseMaxHp: 100,
  wrongAnswerStunMs: 3_000,
  tomiDepositMultiplier: 1.2,
  kelinsayEmptyScrollSpeedMultiplier: 1.15,
  baseScrollCapacity: 1,
  monyangScrollCapacity: 2,
})

export const DEFAULT_POSITION_BY_TEAM = Object.freeze({
  teamA: Object.freeze({ x: 120, y: 300, lane: 'middle' }),
  teamB: Object.freeze({ x: 880, y: 300, lane: 'middle' }),
})

export function isValidTeamSize(teamSize) {
  return TEAM_SIZES.includes(teamSize)
}

export function isValidPhase(phase) {
  return Object.values(PHASES).includes(phase)
}

export function isValidDifficulty(difficulty) {
  return Object.values(DIFFICULTIES).includes(difficulty)
}

export function isValidPetType(petType) {
  return Object.values(PET_TYPES).includes(petType)
}