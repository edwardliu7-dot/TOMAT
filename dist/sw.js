/* TOMAT Service Worker — caching + push notifications */

const BUILD_VERSION = '75aec9e3ac95'
const CACHE_NAME = `tomat-${BUILD_VERSION}`

// Pola URL yang TIDAK di-cache (selalu network)
const NETWORK_ONLY = ['/api/', '/socket.io/']

function isNetworkOnly(url) {
  const path = new URL(url).pathname
  return NETWORK_ONLY.some(p => path.startsWith(p))
}

function isAsset(url) {
  // File dengan hash di nama (Vite output) → cache agresif
  return /\/assets\/[^/]+\.(js|css|png|webp|jpg|jpeg|gif|svg|woff2?)(\?.*)?$/.test(new URL(url).pathname)
}

// ─── Install: skip waiting agar SW langsung aktif ──────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting()
})

// ─── Activate: hapus cache lama ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('tomat-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch: strategi per tipe request ──────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = request.url

  // API & socket.io → network only, jangan cache
  if (isNetworkOnly(url)) return

  // Aset dengan hash (JS, CSS, gambar) → cache-first
  // File ini tidak pernah berubah namanya kalau kontennya sama,
  // jadi aman di-cache selamanya
  if (isAsset(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML & file lain → network-first, fallback cache
  // Ini yang memastikan update terdeteksi: browser ambil HTML baru dari server,
  // HTML baru referensi asset baru (nama berbeda), asset baru di-fetch & cached
  event.respondWith(networkFirst(request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('Offline — buka TOMAT saat ada koneksi internet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

// ─── Push Notifications (tetap seperti semula) ────────────────────────────
self.addEventListener('push', event => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = {} }
  const title = data.title || 'TOMAT'
  const options = {
    body: data.body || 'Ada informasi baru di TOMAT.',
    tag: data.notificationId ? `tomat-${data.notificationId}` : 'tomat-notification',
    data: { url: data.url || '/' },
    renotify: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => new URL(client.url).origin === self.location.origin)
      if (existing) {
        existing.postMessage({ type: 'tomat-open-route', route: event.notification.data?.url || '/' })
        return existing.focus()
      }
      return self.clients.openWindow(target)
    })
  )
})
