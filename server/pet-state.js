// Shared Tomi state calculation used by HTTP auth, pet routes, and multiplayer
// guards. Keeping this in a dependency-free module avoids circular imports.

/**
 * All skin IDs grouped by pet type.
 * Used to scan legacy per-skin hunger_map keys when the canonical petType key
 * is absent (e.g. hunger was stored under 'pet_skin_cosmic' before petType
 * keying was introduced, and user is now wearing a different tomi skin).
 */
const PET_TYPE_SKIN_KEYS = {
  tomi:     ['golden', 'pet_skin_silver', 'pet_skin_cosmic', 'pet_skin_void'],
  kelinsay: ['pet_kelinsay', 'pet_kelinsay_senja', 'pet_kelinsay_malam', 'pet_kelinsay_merahputih'],
  monyang:  ['pet_monyong', 'pet_monyong_raja', 'pet_monyong_kosmik'],
  komodih:  ['pet_komodih'],
  nananaga: ['pet_nananaga', 'pet_nananaga_merah', 'pet_nananaga_es', 'pet_nananaga_champion'],
}

/**
 * Map any skinId to its base pet-type key.
 * All skins of the same animal share a single HP pool in pet_hunger_map.
 *   tomi     → golden, pet_skin_silver, pet_skin_cosmic, pet_skin_void
 *   kelinsay → pet_kelinsay, pet_kelinsay_senja, pet_kelinsay_malam, pet_kelinsay_merahputih
 *   monyang  → pet_monyong, pet_monyong_raja, pet_monyong_kosmik
 *   komodih  → pet_komodih
 *   nananaga → pet_nananaga, pet_nananaga_merah, pet_nananaga_es, pet_nananaga_champion
 */
export function skinToPetType(skinId) {
  if (!skinId || skinId === 'golden' || skinId.startsWith('pet_skin_')) return 'tomi'
  if (skinId.startsWith('pet_kelinsay')) return 'kelinsay'
  if (skinId.startsWith('pet_monyong'))  return 'monyang'
  if (skinId === 'pet_komodih')           return 'komodih'
  if (skinId.startsWith('pet_nananaga')) return 'nananaga'
  return 'tomi'
}

/**
 * Read the hungerUntil timestamp for a given skinId from the stored map.
 * Priority:
 *  1. Canonical petType key ('tomi', 'kelinsay', etc.) — written by all new code.
 *  2. Legacy per-skin keys for the same animal — covers DB rows written before
 *     petType keying was introduced. We scan ALL skin IDs for that pet type so
 *     switching skins (e.g. cosmic fluff → golden, or kelinsay base → merahputih)
 *     still finds the stored hunger value regardless of which skin wrote it.
 */
export function getHungerUntil(hungerMap, skinId) {
  const map = hungerMap || {}
  const petType = skinToPetType(skinId)
  if (map[petType] != null) return map[petType]
  // Legacy fallback: scan every known skin key for this pet type
  for (const key of (PET_TYPE_SKIN_KEYS[petType] || [])) {
    if (map[key] != null) return map[key]
  }
  return null
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