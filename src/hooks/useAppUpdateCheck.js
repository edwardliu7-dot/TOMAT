import { useEffect, useState } from 'react'

/**
 * Cek apakah APK yang terpasang sudah versi terbaru.
 * Hanya aktif saat berjalan sebagai APK native (Capacitor).
 *
 * Return: { checking, updateRequired, downloadUrl }
 */
export function useAppUpdateCheck() {
  const [state, setState] = useState({ checking: true, updateRequired: false, downloadUrl: '' })

  useEffect(() => {
    let cancelled = false

    async function check() {
      // Hanya jalankan di Capacitor native (APK), bukan di browser biasa
      const isNative = window.Capacitor?.isNativePlatform?.() === true
      if (!isNative) {
        setState({ checking: false, updateRequired: false, downloadUrl: '' })
        return
      }

      try {
        // Ambil versi APK yang terpasang dari plugin @capacitor/app
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo()
        const installedVersionCode = parseInt(info.build, 10) // build = versionCode Android

        // Tanya server berapa versi minimum yang dibutuhkan
        const res = await fetch('/api/app/version-check')
        const data = await res.json()
        const minVersionCode = parseInt(data.minVersionCode, 10)

        if (!cancelled) {
          const updateRequired = installedVersionCode < minVersionCode
          setState({ checking: false, updateRequired, downloadUrl: data.downloadUrl || '' })
        }
      } catch {
        // Kalau gagal cek (offline/error), biarkan app jalan normal
        if (!cancelled) setState({ checking: false, updateRequired: false, downloadUrl: '' })
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  return state
}
