/**
 * openExternalUrl.js
 *
 * Di Capacitor (APK Android), window.open('_blank') tidak membuka browser
 * sistem — WebView menanganinya sendiri dan sering gagal untuk URL lintas-asal.
 * Gunakan @capacitor/browser agar URL benar-benar terbuka di browser sistem.
 *
 * Di browser web biasa, cukup window.open seperti biasa.
 *
 * NOTE: @capacitor/browser di-alias ke src/stubs/capacitor-browser.js di vite.config.js
 * agar Vite selalu mem-bundle-nya (import dinamis dengan string concatenation dulu tidak
 * ter-bundle → gagal di APK → catch → tidak ada yang terbuka).
 */
import { Browser } from '@capacitor/browser'

export async function openExternalUrl(url) {
  if (window.Capacitor) {
    try {
      await Browser.open({ url, presentationStyle: 'popover' })
    } catch (err) {
      // Fallback kalau plugin browser gagal
      console.warn('[openExternalUrl] Capacitor Browser failed, fallback window.open', err)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
