/* TOMAT Web Push service worker */
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
