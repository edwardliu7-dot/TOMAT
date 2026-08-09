/**
 * Pure configuration and enums for TOMAT's 2D educational MOBA mode.
 *
 * This module intentionally has no Socket.io, database, timer, or Express
 * dependency. Match lifecycle code can import these values without coupling
 * the state model to a transport or persistence layer.
 */

export const MOBA_MODE = 'tomat-moba'

export const TEAM_SIZES = Object.freeze([1, 2, 3])
export const MOBA_ARENA_SIZE = 80_000
// The arena keeps continuous server-authoritative movement, while this grid
// gives tileset/rendering a stable world scale.
export const MOBA_TILE_SIZE = 16
export const MOBA_ARENA_TILES = MOBA_ARENA_SIZE / MOBA_TILE_SIZE

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

// ── Map layout constants (world units: 80 000 × 80 000) ──────────────────────
// Lane bands (shared, symmetrical L↔R)
export const MAP_LAYOUT = Object.freeze({
  // top lane  y = 2 000 – 13 000
  // upper jungle y = 15 000 – 33 000
  // mid lane  y = 35 000 – 45 000
  // lower jungle y = 47 000 – 65 000
  // bot lane  y = 67 000 – 78 000
  topLane:      Object.freeze({ minY:  2_000, maxY: 13_000 }),
  upperJungle:  Object.freeze({ minY: 15_000, maxY: 33_000 }),
  midLane:      Object.freeze({ minY: 35_000, maxY: 45_000 }),
  lowerJungle:  Object.freeze({ minY: 47_000, maxY: 65_000 }),
  botLane:      Object.freeze({ minY: 67_000, maxY: 78_000 }),
  // Gap X positions in every divider wall (3 gaps per divider)
  gapRanges: Object.freeze([
    Object.freeze({ minX: 18_000, maxX: 22_000 }),
    Object.freeze({ minX: 38_000, maxX: 42_000 }),
    Object.freeze({ minX: 58_000, maxX: 62_000 }),
  ]),
  // Jungle node spawn areas (combines both jungles + lane corridors)
  jungleBounds: Object.freeze([
    Object.freeze({ minX:  2_000, maxX: 78_000, minY: 15_000, maxY: 33_000 }),
    Object.freeze({ minX:  2_000, maxX: 78_000, minY: 47_000, maxY: 65_000 }),
    Object.freeze({ minX: 22_000, maxX: 58_000, minY:  2_000, maxY: 13_000 }), // mid top lane
    Object.freeze({ minX: 22_000, maxX: 58_000, minY: 67_000, maxY: 78_000 }), // mid bot lane
    Object.freeze({ minX: 22_000, maxX: 58_000, minY: 35_000, maxY: 45_000 }), // mid lane center
  ]),
})

// Deposit zones — team A deposits at right side boxes + own left library
// team B deposits at left side boxes + own right library
export const DEPOSIT_ZONES = Object.freeze([
  Object.freeze({ id:'az-top',  team:'teamA', lane:'top',    x: 73_500, y:  7_500, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'az-mid',  team:'teamA', lane:'middle', x: 73_500, y: 40_000, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'az-bot',  team:'teamA', lane:'bottom', x: 73_500, y: 72_500, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'al-base', team:'teamA', lane:'base',   x:  5_500, y: 40_000, maxPoints: null, isLibrary: true }),
  Object.freeze({ id:'bz-top',  team:'teamB', lane:'top',    x:  6_500, y:  7_500, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'bz-mid',  team:'teamB', lane:'middle', x:  6_500, y: 40_000, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'bz-bot',  team:'teamB', lane:'bottom', x:  6_500, y: 72_500, maxPoints: 100, isLibrary: false }),
  Object.freeze({ id:'bl-base', team:'teamB', lane:'base',   x: 74_500, y: 40_000, maxPoints: null, isLibrary: true }),
])

// Wall rectangles for server-side collision (player radius 28 checked against each rect)
export const MAP_WALLS = Object.freeze([
  // Outer boundary
  { x1:      0, y1:      0, x2: 80_000, y2:  2_000 }, // top
  { x1:      0, y1: 78_000, x2: 80_000, y2: 80_000 }, // bot
  { x1:      0, y1:  2_000, x2:  2_000, y2: 78_000 }, // left
  { x1: 78_000, y1:  2_000, x2: 80_000, y2: 78_000 }, // right
  // Top divider (y=13000-15000) — 4 segs with gaps at 18k-22k, 38k-42k, 58k-62k
  { x1:  2_000, y1: 13_000, x2: 18_000, y2: 15_000 },
  { x1: 22_000, y1: 13_000, x2: 38_000, y2: 15_000 },
  { x1: 42_000, y1: 13_000, x2: 58_000, y2: 15_000 },
  { x1: 62_000, y1: 13_000, x2: 78_000, y2: 15_000 },
  // Mid-top divider (y=33000-35000)
  { x1:  2_000, y1: 33_000, x2: 18_000, y2: 35_000 },
  { x1: 22_000, y1: 33_000, x2: 38_000, y2: 35_000 },
  { x1: 42_000, y1: 33_000, x2: 58_000, y2: 35_000 },
  { x1: 62_000, y1: 33_000, x2: 78_000, y2: 35_000 },
  // Mid-bot divider (y=45000-47000)
  { x1:  2_000, y1: 45_000, x2: 18_000, y2: 47_000 },
  { x1: 22_000, y1: 45_000, x2: 38_000, y2: 47_000 },
  { x1: 42_000, y1: 45_000, x2: 58_000, y2: 47_000 },
  { x1: 62_000, y1: 45_000, x2: 78_000, y2: 47_000 },
  // Bot divider (y=65000-67000)
  { x1:  2_000, y1: 65_000, x2: 18_000, y2: 67_000 },
  { x1: 22_000, y1: 65_000, x2: 38_000, y2: 67_000 },
  { x1: 42_000, y1: 65_000, x2: 58_000, y2: 67_000 },
  { x1: 62_000, y1: 65_000, x2: 78_000, y2: 67_000 },
].map(Object.freeze))

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
    // The gameplay world uses a square 80,000 × 80,000 coordinate space.
    // The client maps these coordinates into its responsive viewport, so
    // pixel-art assets keep their intended visual scale instead of stretching
    // to fill an arbitrarily large DOM canvas.
    minX: 0,
    maxX: MOBA_ARENA_SIZE,
    minY: 0,
    maxY: MOBA_ARENA_SIZE,
    // One tileset cell represents 16 world units: 5,000 × 5,000 cells.
    tileSize: MOBA_TILE_SIZE,
    columns: MOBA_ARENA_TILES,
    rows: MOBA_ARENA_TILES,
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
  teamA: Object.freeze({ x:  4_000, y: 40_000, lane: 'middle' }),
  teamB: Object.freeze({ x: 76_000, y: 40_000, lane: 'middle' }),
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