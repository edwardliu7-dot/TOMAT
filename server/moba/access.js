/**
 * Release gate for TOMAT MOBA.
 *
 * MOBA can be disabled without changing the individual multiplayer handlers.
 * An optional comma-separated allowlist provides a small, controlled rollout.
 */

export function isMobaEnabled(env = process.env) {
  return !['0', 'false', 'off', 'no'].includes(
    String(env.MOBA_ENABLED ?? 'false').trim().toLowerCase(),
  )
}

export function getMobaAllowlist(env = process.env) {
  return String(env.MOBA_ALLOWED_STUDENT_IDS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
}

export function isMobaStudentAllowed(userId, env = process.env) {
  const allowlist = getMobaAllowlist(env)
  return allowlist.length === 0 || allowlist.includes(String(userId))
}

export function canStudentUseMoba(userId, env = process.env) {
  return isMobaEnabled(env) && isMobaStudentAllowed(userId, env)
}