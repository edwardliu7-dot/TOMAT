/**
 * TOMAT Boss Raid — shared in-memory state
 * Imported by both multiplayer.js (socket) and guru.js (REST).
 */

export const bossRaids = new Map() // kelas → BossRaid

let _io = null
export function setIo(io) { _io = io }

export function getBossRaid(kelas) {
  return bossRaids.get(kelas) || null
}

export function createBossRaid({ kelas, guruId, guruName, maxHp = 1000, bossName = 'Boss Matematika', bossEmoji = '👹' }) {
  // Replace any existing raid for this kelas
  if (bossRaids.has(kelas)) {
    const existing = bossRaids.get(kelas)
    existing.status = 'ended'
    _io?.to(`boss:${kelas}`).emit('boss:ended', { message: 'Guru memulai Boss Raid baru.' })
  }
  const raid = {
    kelas,
    guruId,
    guruName,
    bossName,
    bossEmoji,
    maxHp,
    hp: maxHp,
    status: 'active',             // active | defeated | ended
    participants: new Map(),       // userId → { userId, name, hits, damage, lastAttackAt }
    createdAt: Date.now(),
  }
  bossRaids.set(kelas, raid)
  return raid
}

export function endBossRaid(kelas, broadcast = true) {
  const raid = bossRaids.get(kelas)
  if (!raid) return
  raid.status = 'ended'
  if (broadcast) {
    _io?.to(`boss:${kelas}`).emit('boss:ended', { message: 'Guru mengakhiri Boss Raid.' })
  }
  bossRaids.delete(kelas)
}

/** Strip Map → Array and drop server-only fields for client emission */
export function raidToClient(raid) {
  if (!raid) return null
  return {
    kelas:       raid.kelas,
    bossName:    raid.bossName,
    bossEmoji:   raid.bossEmoji,
    maxHp:       raid.maxHp,
    hp:          raid.hp,
    status:      raid.status,
    participants: Array.from(raid.participants.values())
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 20),
    createdAt:   raid.createdAt,
  }
}
