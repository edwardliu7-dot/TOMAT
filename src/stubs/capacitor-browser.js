// Stub for @capacitor/browser — dipakai oleh Vite alias di web/dev build.
// Di APK, Capacitor mengekspos plugin native via window.Capacitor.Plugins.Browser;
// stub ini mendelegasikan ke native bridge jika tersedia, fallback window.open jika tidak.
//
// Kenapa alias?  Dynamic import('@capacitor' + '/browser') tidak di-bundle oleh Vite
// sehingga gagal di APK → catch → onBack() → layar berkedip.
// Dengan alias, Vite selalu bundle file ini; di APK, getPlugin() menemukan bridge native.

function getPlugin() {
  // window.Capacitor.Plugins.Browser tersedia saat APK berjalan
  return window.Capacitor?.Plugins?.Browser ?? null
}

export const Browser = {
  async open(options) {
    const p = getPlugin()
    if (p) return p.open(options)
    // Fallback web: buka di tab baru
    window.open(options.url, '_blank', 'noopener,noreferrer')
  },

  async addListener(event, handler) {
    const p = getPlugin()
    if (p) return p.addListener(event, handler)
    // Di web tidak ada event 'browserFinished' — kembalikan handle no-op
    return { remove: () => {} }
  },

  async removeAllListeners() {
    const p = getPlugin()
    if (p) return p.removeAllListeners()
  },
}
