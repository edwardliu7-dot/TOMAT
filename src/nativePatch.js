/**
 * nativePatch.js
 * Dijalankan HANYA di Capacitor (APK) — di browser web tidak berpengaruh.
 *
 * Masalah: setelah server.url dihapus dari capacitor.config.json, semua
 * relative URL (/api/...) mengarah ke capacitor://localhost/... yang salah.
 * Solusi: intercept fetch() dan set window.__TOMAT_API__ agar socket.js
 * bisa membaca URL produksi.
 */

const PROD = 'https://y4e6icv3cej4ax65idvhusde.157.10.161.229.sslip.io'

export function applyNativePatch() {
  if (!window.Capacitor) return // hanya aktif di APK

  // Simpan URL produksi agar socket.js bisa membacanya sebelum io() dipanggil
  window.__TOMAT_API__ = PROD

  // Patch fetch → tambahkan host ke URL relatif /api/ dan /socket.io/
  const _fetch = window.fetch.bind(window)
  window.fetch = function (resource, init) {
    if (typeof resource === 'string' && resource.startsWith('/')) {
      resource = PROD + resource
    } else if (
      resource instanceof Request &&
      new URL(resource.url).hostname === 'localhost'
    ) {
      const u = new URL(resource.url)
      resource = new Request(PROD + u.pathname + u.search, resource)
    }
    return _fetch(resource, init)
  }

  // Patch XMLHttpRequest → same treatment for any library that bypasses fetch
  const _XHR = window.XMLHttpRequest
  window.XMLHttpRequest = class extends _XHR {
    open(method, url, ...rest) {
      if (typeof url === 'string' && url.startsWith('/')) {
        url = PROD + url
      }
      return super.open(method, url, ...rest)
    }
  }
}
