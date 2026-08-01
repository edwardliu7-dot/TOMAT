/**
 * capacitorNotify.js — Native local notifications for the Android APK.
 *
 * Uses @capacitor/local-notifications so critical events (duel invite,
 * tournament match) appear as OS banners even when the in-app overlay is
 * obscured or Android suppresses WebView UI during gaming focus modes.
 *
 * All functions are no-ops in a regular browser (window.Capacitor absent),
 * or when the user has denied notification permission.
 *
 * Prerequisites (run before building APK):
 *   npx cap sync android
 */

let _plugin    = null   // @capacitor/local-notifications instance
let _permitted = false  // whether POST_NOTIFICATIONS was granted
let _nextId    = 1000   // local notification IDs start high to avoid clashes

// ── Plugin loader ─────────────────────────────────────────────────────────────
async function getPlugin() {
  if (!window.Capacitor) return null
  if (_plugin) return _plugin
  try {
    const mod = await import(/* @vite-ignore */ '@capacitor/local-notifications')
    _plugin = mod.LocalNotifications
    return _plugin
  } catch {
    return null   // plugin not registered in APK yet (cap sync not run)
  }
}

// ── Permission ────────────────────────────────────────────────────────────────
/**
 * Request POST_NOTIFICATIONS permission from the OS.
 * Call once when the user logs in. Safe to call multiple times.
 */
export async function requestNotificationPermission() {
  const plugin = await getPlugin()
  if (!plugin) return false
  try {
    const { display } = await plugin.checkPermissions()
    if (display === 'granted') {
      _permitted = true
      return true
    }
    const result = await plugin.requestPermissions()
    _permitted = result.display === 'granted'
    return _permitted
  } catch {
    return false
  }
}

// ── Show notification ─────────────────────────────────────────────────────────
/**
 * Show an immediate native OS notification.
 *
 * @param {object} opts
 * @param {string}  opts.title
 * @param {string}  opts.body
 * @param {number}  [opts.id]      — unique notification ID (auto if omitted)
 * @param {string}  [opts.channel] — Android notification channel ID
 */
export async function showLocalNotification({ title, body, id, channel = 'tomat_default' }) {
  const plugin = await getPlugin()
  if (!plugin || !_permitted) return
  try {
    await plugin.schedule({
      notifications: [{
        id:          id ?? (_nextId++),
        title,
        body,
        channelId:   channel,
        smallIcon:   'ic_launcher_round',
        // schedule 200 ms in the future — required by some Android versions
        schedule:    { at: new Date(Date.now() + 200) },
      }],
    })
  } catch (err) {
    console.warn('[capacitorNotify] schedule failed:', err?.message ?? err)
  }
}

// ── Channel setup ─────────────────────────────────────────────────────────────
/**
 * Create Android notification channels. Call once on app init.
 * Channels are ignored on iOS and in the browser.
 */
export async function createNotificationChannels() {
  const plugin = await getPlugin()
  if (!plugin) return
  try {
    await plugin.createChannel({
      id:          'tomat_default',
      name:        'Notifikasi TOMAT',
      description: 'Notifikasi umum dari TOMAT',
      importance:  4,   // HIGH
      sound:       'default',
      vibration:   true,
    })
    await plugin.createChannel({
      id:          'tomat_game',
      name:        'Event Game',
      description: 'Duel, turnamen, dan event game TOMAT',
      importance:  5,   // MAX
      sound:       'default',
      vibration:   true,
    })
  } catch {
    // channels not critical — swallow error
  }
}
