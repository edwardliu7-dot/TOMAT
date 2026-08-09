/**
 * guruCache.js
 * Lightweight stale-while-revalidate cache untuk data guru UI.
 * Data disimpan di localStorage dengan TTL 5 menit.
 * Dipakai oleh GuruDashboardScreen untuk mengurangi loading wait.
 */

const CACHE_TTL = 5 * 60 * 1000 // 5 menit

function key(name) {
  return `gc_${name}`
}

/** Baca cache. Return data jika masih fresh, undefined jika tidak ada / expired. */
export function guruCacheGet(name) {
  try {
    const raw = localStorage.getItem(key(name))
    if (!raw) return undefined
    const { d, t } = JSON.parse(raw)
    if (Date.now() - t > CACHE_TTL) {
      localStorage.removeItem(key(name))
      return undefined
    }
    return d
  } catch {
    return undefined
  }
}

/** Simpan data ke cache. */
export function guruCacheSet(name, data) {
  try {
    localStorage.setItem(key(name), JSON.stringify({ d: data, t: Date.now() }))
  } catch {
    // Storage penuh / private mode — abaikan
  }
}

/** Hapus satu cache key (setelah mutasi data). */
export function guruCacheInvalidate(name) {
  try { localStorage.removeItem(key(name)) } catch {}
}
