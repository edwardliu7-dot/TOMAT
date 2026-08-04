/**
 * openExternalUrl.js
 *
 * Di Capacitor (APK Android), window.open('_blank') tidak membuka browser
 * sistem — WebView menanganinya sendiri dan sering gagal untuk URL lintas-asal.
 * Gunakan @capacitor/browser agar URL benar-benar terbuka di browser sistem.
 *
 * Di browser web biasa, cukup window.open seperti biasa.
 */

export async function openExternalUrl(url) {
  if (window.Capacitor) {
    try {
      const { Browser } = await import('@capacitor/browser')
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
