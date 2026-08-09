/**
 * Pure node spawning and geometry helpers for TOMAT MOBA.
 *
 * Node objects intentionally contain only public gameplay metadata. Question
 * prompts and answers are attached by the Day 5 question subsystem, never by
 * this module.
 */

import { randomUUID } from 'node:crypto'
import {
  DEFAULT_POSITION_BY_TEAM,
  DIFFICULTIES,
  POINTS_BY_DIFFICULTY,
  MAP_WALLS,
  MAP_LAYOUT,
  isValidDifficulty,
} from './config.js'

function isInsideAnyJungle(position) {
  return MAP_LAYOUT.jungleBounds.some(b =>
    position.x >= b.minX && position.x <= b.maxX &&
    position.y >= b.minY && position.y <= b.maxY
  )
}

function isOnWall(position, radius = 44) {
  for (const w of MAP_WALLS) {
    const nearX = Math.max(w.x1, Math.min(w.x2, position.x))
    const nearY = Math.max(w.y1, Math.min(w.y2, position.y))
    if (Math.hypot(position.x - nearX, position.y - nearY) < radius) return true
  }
  return false
}

const LANES = Object.freeze(['top', 'middle', 'bottom'])

function createId(prefix) {
  return `${prefix}-${randomUUID()}`
}

function clampRandom(randomValue) {
  if (!Number.isFinite(randomValue)) return 0
  return Math.min(0.999999999, Math.max(0, randomValue))
}

export function distanceBetween(left, right) {
  return Math.hypot((left?.x || 0) - (right?.x || 0), (left?.y || 0) - (right?.y || 0))
}

export function isInsideArena(position, arena) {
  return Boolean(position) &&
    Number.isFinite(position.x) &&
    Number.isFinite(position.y) &&
    position.x >= arena.minX &&
    position.x <= arena.maxX &&
    position.y >= arena.minY &&
    position.y <= arena.maxY
}

function basePositions() {
  return Object.values(DEFAULT_POSITION_BY_TEAM)
}

export function isValidNodeSpawnPosition({
  position,
  match,
  nodeId = null,
} = {}) {
  if (!match || !isInsideArena(position, match.config.arena)) return false

  const { arena } = match.config

  // Must spawn in an allowed jungle/lane zone, not on walls or base areas
  if (!isInsideAnyJungle(position)) return false
  if (isOnWall(position, arena.nodeSafeRadius)) return false

  if (basePositions().some(base =>
    distanceBetween(position, base) < arena.baseSafeRadius)) {
    return false
  }

  for (const player of match.players.values()) {
    if (distanceBetween(position, player.position) < arena.playerSafeRadius) {
      return false
    }
  }

  for (const node of match.activeNodes.values()) {
    if (node.id !== nodeId &&
        distanceBetween(position, node.position) < arena.nodeSafeRadius) {
      return false
    }
  }

  return true
}

function laneForY(y, arena) {
  const third = (arena.maxY - arena.minY) / 3
  if (y < arena.minY + third) return LANES[0]
  if (y < arena.minY + third * 2) return LANES[1]
  return LANES[2]
}

export function chooseDifficulty(random = Math.random) {
  const roll = clampRandom(random())
  if (roll < 0.5) return DIFFICULTIES.EASY
  if (roll < 0.85) return DIFFICULTIES.MEDIUM
  return DIFFICULTIES.HARD
}

export function randomValidSpawn({
  match,
  random = Math.random,
  idFactory = null,
} = {}) {
  const arena = match.config.arena
  const attempts = Math.max(1, arena.maxSpawnAttempts)

  for (let attempt = 0; attempt < attempts; attempt++) {
    const position = {
      x: arena.minX + clampRandom(random()) * (arena.maxX - arena.minX),
      y: arena.minY + clampRandom(random()) * (arena.maxY - arena.minY),
    }
    if (isValidNodeSpawnPosition({ position, match })) {
      return {
        ...position,
        lane: laneForY(position.y, arena),
      }
    }
  }

  return null
}

export function createQuestionNode({
  match,
  now,
  difficulty = null,
  position = null,
  random = Math.random,
  idFactory = null,
} = {}) {
  const selectedDifficulty = difficulty || chooseDifficulty(random)
  if (!isValidDifficulty(selectedDifficulty)) {
    return { ok: false, code: 'INVALID_DIFFICULTY' }
  }

  const selectedPosition = position
    ? {
        x: position.x,
        y: position.y,
        lane: position.lane || laneForY(position.y, match.config.arena),
      }
    : randomValidSpawn({ match, random, idFactory })

  if (!selectedPosition ||
      !isValidNodeSpawnPosition({ position: selectedPosition, match })) {
    return { ok: false, code: 'INVALID_SPAWN_POSITION' }
  }

  const id = typeof idFactory === 'function' ? idFactory('node') : createId('node')
  const spawnedAt = now
  const node = {
    id,
    difficulty: selectedDifficulty,
    points: POINTS_BY_DIFFICULTY[selectedDifficulty],
    position: selectedPosition,
    status: 'available',
    claimedBy: null,
    spawnedAt,
    expiresAt: spawnedAt + match.config.nodeTtlMs,
  }

  return { ok: true, node }
}