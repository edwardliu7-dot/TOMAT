import { useEffect, useState } from 'react'

/**
 * Cek versi APK dan bundle web (OTA).
 * Hanya aktif saat berjalan sebagai APK native (Capacitor).
 *
 * Return: {
 *   checking,
 *   // Hard update (APK)
 *   updateRequired, downloadUrl,
 *   // Soft update (OTA bundle)
 *   bundleUpdateAvailable, bundleVersion, bundleUrl, bundleSize, bundleNotes,
 * }
 */
export function useAppUpdateCheck() {
  const [state, setState] = useState({
    checking: true,
    // Hard update
    updateRequired: false,
    downloadUrl: '',
    // Soft update (OTA bundle)
    bundleUpdateAvailable: false,
    bundleVersion: '',
    bundleUrl: '',
    bundleSize: 0,
    bundleNotes: '',
  })

  useEffect(() => {
    let cancelled = false

    async function check() {
      // Hanya jalankan di Capacitor native (APK), bukan di browser biasa
      const isNative = window.Capacitor?.isNativePlatform?.() === true
      if (!isNative) {
        setState(s => ({ ...s, checking: false }))
        return
      }

      try {
        // Ambil versi APK yang terpasang dari plugin @capacitor/app
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo()
        const installedVersionCode = parseInt(info.build, 10) // build = versionCode Android

        // Tanya server berapa versi minimum yang dibutuhkan dan info bundle
        const res = await fetch('/api/app/version-check')
        const data = await res.json()
        const minVersionCode = parseInt(data.minVersionCode, 10)

        if (!cancelled) {
          const updateRequired = installedVersionCode < minVersionCode

          // Cek apakah ada bundle baru (hanya relevan jika APK tidak perlu diupdate)
          // Versi bundle terinstall disimpan di localStorage setelah OTA apply
          const installedBundleVersion = localStorage.getItem('installed_bundle_version') || '0.0.0'
          const bundleUpdateAvailable =
            !updateRequired &&
            !!data.bundleUrl &&
            !!data.bundleVersion &&
            data.bundleVersion !== installedBundleVersion

          setState({
            checking: false,
            updateRequired,
            downloadUrl: data.downloadUrl || '',
            bundleUpdateAvailable,
            bundleVersion: data.bundleVersion || '',
            bundleUrl: data.bundleUrl || '',
            bundleSize: data.bundleSize || 0,
            bundleNotes: data.updateNotes || '',
          })
        }
      } catch {
        // Kalau gagal cek (offline/error), biarkan app jalan normal
        if (!cancelled) setState(s => ({ ...s, checking: false }))
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  return state
}
