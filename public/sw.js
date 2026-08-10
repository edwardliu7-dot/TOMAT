/* TOMAT Service Worker — caching + push notifications */

const BUILD_VERSION = '__BUILD_VERSION__'
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

function isStaticFile(url) {
  // Semua gambar, font, svg, gif, weba di public/ → cache-first
  return /\.(png|jpg|jpeg|webp|gif|svg|woff2?|mp3|weba|ico)(\?.*)?$/.test(new URL(url).pathname)
}

// Aset yang di-precache saat install — tersedia offline tanpa harus dikunjungi dulu
// Mencakup SEMUA asset di public/ agar APK tidak perlu unduh apapun dari server.
const PRECACHE_ASSETS = [
  // PWA icons & manifest
  '/icon-192.png',
  '/icon-512.png',
  // Dashboard wallpaper
  '/wallpaper-dashboard.png',
  // Logo & UI umum
  '/logo-smartisa.png',
  '/arena.png',
  '/toko.png',
  '/lencana.png',
  '/rank.png',
  '/nilai.png',
  '/notif.png',
  '/komodih.png',
  '/blp.png',
  '/guru.png',
  // Pet sprites (core gameplay)
  '/tomi-sprite.png',
  '/kelinsay-sprite.png',
  '/monyang-sprite.png',
  '/nananaga-sprite.png',
  // Pet skin sheets
  '/tomi-silver-fluff.png',
  '/tomi-cosmic-fluff.png',
  '/tomi-void-emperor.png',
  '/kelinsay-malam.png',
  '/kelinsay-senja.png',
  '/monyang-raja.png',
  '/monyang-kosmik.png',
  '/nananaga-api.png',
  '/nananaga-es.png',
  // Bingkai profil
  '/bingkai-emas.png',
  '/bingkai-neon.png',
  '/bingkai-sakura.png',
  '/bingkai-api.png',
  '/bingkai-es.png',
  '/bingkai-void-king.png',
  '/bingkai-void-monarch.png',
  '/bingkai-aurum-sovereign.png',
  // Event kemerdekaan
  '/banner event 81.png',
  '/81.png',
  '/hutri81.png',
  '/81spanduk.png',
  // MOBA arena sprites
  '/rumput.png',
  '/pohon.png',
  '/box.png',
  // MOBA arena assets
  '/moba-arena/FG_Crystal_Blue_1.png',
  '/moba-arena/FG_Crystal_Gold_1.png',
  '/moba-arena/FG_Grasslands_Spring.png',
  '/moba-arena/FG_Grass_Spring.png',
  '/moba-arena/FG_Grass_Summer.png',
  '/moba-arena/FG_Grounds.png',
  '/moba-arena/FG_Treasure_Big.png',
  '/moba-arena/FG_Treasure_Small_1.png',
  '/moba-arena/moba-grass-tile-spring.png',
  '/moba-arena/moba-tree-spring-alt.png',
  '/moba-arena/moba-tree-spring.png',
  // Dekorasi umum
  '/garuda.gif',
  '/petal-rose.png',
  '/celestia-relic.svg',
  '/dekrit-mahaguru.svg',
]

// ─── Install: precache aset + skip waiting ─────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE_ASSETS.map(url =>
          fetch(url, { cache: 'reload' })
            .then(res => { if (res.ok) cache.put(url, res) })
            .catch(() => { /* abaikan jika gagal fetch satu file */ })
        )
      )
    ).then(() => self.skipWaiting())
  )
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

  // Aset Vite dengan hash (JS, CSS) → cache-first selamanya
  if (isAsset(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Semua file gambar/font/media di public/ → cache-first.
  // Di APK (Capacitor) ini dilayani dari bundle lokal, tanpa internet.
  // Di browser pertama kali → diambil dari server, lalu cache untuk offline.
  if (isStaticFile(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML & file lain → network-first, fallback cache.
  // Memastikan app shell selalu up-to-date saat ada koneksi.
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
