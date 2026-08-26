export const CHAMPION_SKIN_ID = 'pet_nananaga_champion'
export const CHAMPION_SKIN_PRICE = 10000

// These are account identifiers supplied by the TOMAT skin competition.
// Compare against all stable identity fields because BLP-created accounts may
// use a different display name and username.
export const FREE_CHAMPION_ACCOUNT_KEYS = new Set([
  'alif',
  'agrenada',
  'rayhan',
  'latifa',
])

function normalizeAccountKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isChampionFreeAccount(user) {
  return [user?.username, user?.name, user?.id]
    .map(normalizeAccountKey)
    .some(key => key && FREE_CHAMPION_ACCOUNT_KEYS.has(key))
}