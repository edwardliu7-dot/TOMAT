// Shared Tomi state calculation used by HTTP auth, pet routes, and multiplayer
// guards. Keeping this in a dependency-free module avoids circular imports.

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
    'select pet_hunger_until from students where id = $1',
    [studentId],
  )
  if (!rows[0]) return true
  return computeHunger(rows[0].pet_hunger_until).isDead
}