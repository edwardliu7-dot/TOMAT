// Shared Tomi state calculation used by HTTP auth, pet routes, and multiplayer
// guards. Keeping this in a dependency-free module avoids circular imports.

/**
 * Map any skinId to its base pet-type key.
 * All skins of the same animal share a single HP pool in pet_hunger_map.
 *   tomi     → golden, pet_skin_silver, pet_skin_cosmic, pet_skin_void
 *   kelinsay → pet_kelinsay, pet_kelinsay_senja, pet_kelinsay_malam
 *   monyang  → pet_monyong, pet_monyong_raja, pet_monyong_kosmik
 *   nananaga → pet_nananaga, pet_nananaga_merah, pet_nananaga_es
 */
export function skinToPetType(skinId) {
  if (!skinId || skinId === 'golden' || skinId.startsWith('pet_skin_')) return 'tomi'
  if (skinId.startsWith('pet_kelinsay')) return 'kelinsay'
  if (skinId.startsWith('pet_monyong'))  return 'monyang'
  if (skinId.startsWith('pet_nananaga')) return 'nananaga'
  return 'tomi'
}

/**
 * Read the hungerUntil timestamp for a given skinId from the stored map.
 * Prefers the new pet-type key; falls back to the legacy per-skin key so
 * existing DB entries are not lost on first read.
 */
export function getHungerUntil(hungerMap, skinId) {
  const map = hungerMap || {}
  const petType = skinToPetType(skinId)
  return map[petType] ?? map[skinId] ?? null
}

export function computeHunger(petHungerUntil) {
  if (!petHungerUntil) {
    return { hunger: 100, isDead: false, isStarving: false }
  }

  const now = Date.now()
  const until = new Date(petHungerUntil).getTime()
  const deadAt = until + 24 * 3600 * 1000

  if (now >= deadAt) return { hunger: 0, isDead: true, isStarving: true }
  if (now >= until) return { hunger: 0, isDead: false, isStarving: true }

  return {
    hunger: Math.min(100, Math.round((until - now) / (24 * 3600 * 1000) * 100)),
    isDead: false,
    isStarving: false,
  }
}

export async function isStudentPetDead(pool, studentId) {
  const { rows } = await pool.query(
    'select pet_hunger_map, equipped_pet_skin from students where id = $1',
    [studentId],
  )
  if (!rows[0]) return true
  const { pet_hunger_map, equipped_pet_skin } = rows[0]
  const skinId = equipped_pet_skin || 'golden'
  const hungerUntil = getHungerUntil(pet_hunger_map, skinId)
  return computeHunger(hungerUntil).isDead
}