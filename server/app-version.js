import express from 'express'
const router = express.Router()

// ── Konfigurasi Web Bundle (OTA) ─────────────────────────────────────────────
// Update nilai-nilai ini setiap kali deploy bundle baru.
// Jalankan scripts/deploy-bundle.sh untuk mendapatkan nilai yang benar.
const BUNDLE_CONFIG = {
  bundleVersion: '1.0.0',       // Versi bundle saat ini
  bundleUrl: '',                 // URL download bundle zip (kosong = belum ada bundle OTA)
  bundleSize: 0,                 // Ukuran dalam bytes (untuk progress bar)
  bundleChecksum: '',            // sha256:<hash> untuk verifikasi integritas
  updateNotes: '',               // Catatan update opsional (ditampilkan di banner)
}

// ── GitHub Releases — APK (hard update) ──────────────────────────────────────
const GH_REPO = 'edwardliu7-dot/tomat'
let _ghCache = null
const GH_CACHE_TTL = 10 * 60 * 1000 // 10 menit

function semverToCode(tag) {
  // "v1.2.3" atau "1.2.3" → 123
  // Harus cocok dengan skema versionCode di android/app/build.gradle:
  //   major*100 + minor*10 + patch  (e.g. "1.3.2" → 132)
  const clean = tag.replace(/^v/, '')
  const parts = clean.split('.').map(n => parseInt(n, 10) || 0)
  return (parts[0] || 0) * 100 + (parts[1] || 0) * 10 + (parts[2] || 0)
}

// GET /api/app/version-check
// Dipakai oleh useAppUpdateCheck() di client untuk cek APK dan bundle.
router.get('/version-check', async (req, res) => {
  // Kembalikan cache kalau masih fresh
  if (_ghCache && Date.now() - _ghCache.fetchedAt < GH_CACHE_TTL) {
    return res.json({ ..._ghCache.apkData, ...BUNDLE_CONFIG })
  }

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${GH_REPO}/releases/latest`,
      { headers: { 'User-Agent': 'TOMAT-Server', Accept: 'application/vnd.github+json' } }
    )
    if (!ghRes.ok) throw new Error(`GitHub API ${ghRes.status}`)
    const release = await ghRes.json()

    const minVersionCode = semverToCode(release.tag_name || '0')
    const apkAsset = (release.assets || []).find(a => a.name.endsWith('.apk'))
    const downloadUrl = apkAsset?.browser_download_url || ''

    const apkData = { minVersionCode, downloadUrl }
    _ghCache = { apkData, fetchedAt: Date.now() }
    return res.json({ ...apkData, ...BUNDLE_CONFIG })
  } catch (err) {
    console.warn('[version-check] GitHub fetch gagal, fallback ke env:', err.message)
    const minVersionCode = parseInt(process.env.MIN_APP_VERSION_CODE || '1', 10)
    const downloadUrl = process.env.APP_DOWNLOAD_URL || ''
    return res.json({ minVersionCode, downloadUrl, ...BUNDLE_CONFIG })
  }
})

export default router
