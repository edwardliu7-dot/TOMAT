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

function getIdentityValues(identity) {
  if (identity && typeof identity === 'object') {
    return [identity.id, identity.userId, identity.username]
      .filter(value => value !== null && value !== undefined && String(value).trim())
      .map(value => String(value).trim())
  }
  if (identity === null || identity === undefined) return []
  return [String(identity).trim()].filter(Boolean)
}

export function isMobaStudentAllowed(identity, env = process.env) {
  const allowlist = getMobaAllowlist(env)
  const identityValues = getIdentityValues(identity)
  return allowlist.length === 0 || identityValues.some(value => allowlist.includes(value))
}

export function canStudentUseMoba(identity, env = process.env) {
  return isMobaEnabled(env) && isMobaStudentAllowed(identity, env)
}