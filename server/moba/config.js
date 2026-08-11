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
  [DIFFICULTIES.HARD]: 60,
})

// ── Map layout constants (world units: 80 000 × 80 000) ──────────────────────
// Diagonal X map: river (NW→SE, y≈x) crosses lane (NE→SW, y≈80 000−x) at center.
// Team A spawns bottom-left (4 500, 74 000), Team B spawns top-right (74 000, 4 500).
// Team B sees the map flipped 180° (client-side) so both teams feel they spawn at bottom-left.
export const MAP_LAYOUT = Object.freeze({
  // River band: main diagonal, from top-left (0,0) to bottom-right (80 000,80 000)
  // A point (px,py) is in the river if |py - px| < river.halfWidth
  river: Object.freeze({ halfWidth: 7_000 }),
  // Lane band: anti-diagonal, from top-right (80 000,0) to bottom-left (0,80 000)
  // A point (px,py) is in the lane if |py - (80 000 − px)| < lane.halfWidth
  lane:  Object.freeze({ halfWidth: 6_000 }),
  // No horizontal wall gaps needed for diagonal map
  gapRanges: Object.freeze([]),
  // Node spawn bounds: full playable area (forest + river + lane)
  jungleBounds: Object.freeze([
    Object.freeze({ minX: 6_000, maxX: 74_000, minY: 6_000, maxY: 74_000 }),
  ]),
})

// Deposit zones — 3-lane X map layout
// Coordinates use SERVER space: origin top-left, Y increases downward.
// Converted from user Cartesian (origin bottom-left): server_x = x, server_y = 80000 − y
//
// Top lane   A-turret : user (68000,4000)  → server (68000,76000)
// Top lane   B-turret : user (76000,76000) → server (76000,4000)
// Mid lane   A-turret : user (36000,36000) → server (36000,44000)
// Mid lane   B-turret : user (44000,44000) → server (44000,36000)
// Bot lane   A-turret : user (12000,4000)  → server (12000,76000)
// Bot lane   B-turret : user (4000,12000)  → server (4000,68000)
// Base A              : user (4000,4000)   → server (4000,76000)
// Base B              : user (76000,76000) → server (76000,4000)
export const DEPOSIT_ZONES = Object.freeze([
  // Team A scoring zones
  Object.freeze({ id:'az-1',   team:'teamA', lane:'top',    x:  4_000, y: 12_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'az-2',   team:'teamA', lane:'bot',    x: 68_000, y: 76_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'az-ctr', team:'teamA', lane:'mid',    x: 36_000, y: 44_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'al-base',team:'teamA', lane:'base',   x:  4_000, y: 76_000, maxPoints: null, isLibrary: true  }),
  // Team B scoring zones
  Object.freeze({ id:'bz-1',   team:'teamB', lane:'top',    x: 12_000, y:  4_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'bz-2',   team:'teamB', lane:'bot',    x: 76_000, y: 68_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'bz-ctr', team:'teamB', lane:'mid',    x: 44_000, y: 36_000, maxPoints: 100,  isLibrary: false }),
  Object.freeze({ id:'bl-base',team:'teamB', lane:'base',   x: 76_000, y:  4_000, maxPoints: null, isLibrary: true  }),
])

// Wall rectangles for server-side collision (player radius 28 checked against each rect)
// Diagonal X map: only outer boundary walls — river and lane are fully traversable.
export const MAP_WALLS = Object.freeze([
  { x1:      0, y1:      0, x2: 80_000, y2:  2_000 }, // top border
  { x1:      0, y1: 78_000, x2: 80_000, y2: 80_000 }, // bot border
  { x1:      0, y1:  2_000, x2:  2_000, y2: 78_000 }, // left border
  { x1: 78_000, y1:  2_000, x2: 80_000, y2: 78_000 }, // right border
].map(Object.freeze))

export const DEFAULT_MOBA_CONFIG = Object.freeze({
  durationMs: 420_000,
  countdownMs: 3_000,
  cleanupGraceMs: 120_000, // 2 menit — cukup untuk perangkat mid-low-end reconnect
  nodeSpawnIntervalMs: 8_000,
  nodeTtlMs: 20_000,
  questionTimeMs: 15_000,
  actionIdTtlMs: 60_000,
  movementSpeed: 10_000,
  movementMinIntervalMs: 40,
  // Movement is input-driven, not idle-time-driven. Without a cap, the first
  // input after the lobby countdown would spend all elapsed lobby time in one
  // step and often jump straight out of the arena.
  movementMaxDeltaMs: 150,
  maxActiveNodes: 12,
  wave2StartMs: 300_000,
  wave2MaxActiveNodes: 20,
  wave2SpawnIntervalMs: 4_000,
  clientLoadTimeoutMs: 30_000,
  boxCapacity: 100,
  boxCompletionBonusPoints: 50,
  libraryDepositMultiplier: 1.5,
  nodeInteractionRadius: 3000,
  depositInteractionRadius: 2500,
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

// Team A spawns at bottom-left, Team B at top-right.
// user A=(4000,4000) → server (4000,76000); user B=(76000,76000) → server (76000,4000)
// Team B's view is flipped 180° on the client so both feel like they spawn at bottom-left.
export const DEFAULT_POSITION_BY_TEAM = Object.freeze({
  teamA: Object.freeze({ x:  4_000, y: 76_000, lane: 'base' }),
  teamB: Object.freeze({ x: 76_000, y:  4_000, lane: 'base' }),
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