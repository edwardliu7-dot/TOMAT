/**
 * Server-authoritative Pet effects for TOMAT MOBA.
 *
 * The manager passes the already-joined PlayerState to these helpers. They do
 * not read client payloads, so a retry or forged loadout cannot change an
 * effect during an active match.
 */

import { getPetBonus } from '../pet-bonuses.js'

function isPet(player, petType) {
  return player?.petType === petType
}

export function getMovementSpeed({ player, config } = {}) {
  const baseSpeed = config?.movementSpeed ?? 0
  const emptyScrollMultiplier = config?.kelinsayEmptyScrollSpeedMultiplier ?? 1
  const hasKelinsayBonus = isPet(player, 'kelinsay') &&
    (player.scrolls?.length ?? 0) === 0

  return hasKelinsayBonus
    ? baseSpeed * emptyScrollMultiplier
    : baseSpeed
}

export function getScrollCapacity({ player, config } = {}) {
  if (isPet(player, 'monyang')) {
    return config?.monyangScrollCapacity ?? config?.baseScrollCapacity ?? 1
  }
  return config?.baseScrollCapacity ?? 1
}

export function getDepositMultiplier({ player, config } = {}) {
  if (!isPet(player, 'tomi')) return 1
  return config?.tomiDepositMultiplier ?? 1
}

export function canUseWrongAnswerImmunity({
  player,
  difficulty,
} = {}) {
  return isPet(player, 'nananaga') &&
    difficulty === 'hard' &&
    (player.immunityRemaining ?? 0) > 0
}

export function getInitialImmunity({ player } = {}) {
  if (!isPet(player, 'nananaga')) return 0
  return getPetBonus(player.petSkinId).wrongImmunity || 0
}

export function consumeWrongAnswerImmunity(player) {
  if (!player || (player.immunityRemaining ?? 0) <= 0) return false
  player.immunityRemaining--
  player.immunityAvailable = player.immunityRemaining > 0
  return true
}