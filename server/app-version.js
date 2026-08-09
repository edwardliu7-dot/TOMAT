import express from 'express'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const router = express.Router()

// ── Baca bundle config dari manifest yang dibuat saat build ───────────────────
// File bundles/manifest.json dibuat otomatis oleh scripts/postbuild.js
// setiap kali `npm run build` dijalankan (termasuk saat Coolify deploy).
function getBundleConfig() {
  try {
    const manifestPath = resolve(process.cwd(), 'bundles/manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return {
      bundleVersion:  manifest.bundleVersion  || '',
      bundleUrl:      manifest.bundleUrl       || '',
      bundleSize:     manifest.bundleSize      || 0,
      bundleChecksum: manifest.bundleChecksum  || '',
      updateNotes:    manifest.updateNotes     || '',
    }
  } catch {
    // manifest.json belum ada (build pertama / dev lokal) — OTA tidak aktif
    return { bundleVersion: '', bundleUrl: '', bundleSize: 0, bundleChecksum: '', updateNotes: '' }
  }
}

// ── GitHub Releases — APK hard update ────────────────────────────────────────
const GH_REPO = 'edwardliu7-dot/tomat'
let _ghCache = null
const GH_CACHE_TTL = 10 * 60 * 1000 // 10 menit

function semverToCode(tag) {
  // "v1.2.3" atau "1.2.3" → 123
  const clean = tag.replace(/^v/, '')
  const parts = clean.split('.').map(n => parseInt(n, 10) || 0)
  return (parts[0] || 0) * 100 + (parts[1] || 0) * 10 + (parts[2] || 0)
}

// GET /api/app/version-check
// Dipakai oleh useAppUpdateCheck() di client untuk cek APK dan bundle OTA.
router.get('/version-check', async (req, res) => {
  // Kembalikan cache APK kalau masih fresh
  if (_ghCache && Date.now() - _ghCache.fetchedAt < GH_CACHE_TTL) {
    return res.json({ ..._ghCache.apkData, ...getBundleConfig() })
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
    return res.json({ ...apkData, ...getBundleConfig() })
  } catch (err) {
    console.warn('[version-check] GitHub fetch gagal, fallback ke env:', err.message)
    const minVersionCode = parseInt(process.env.MIN_APP_VERSION_CODE || '1', 10)
    const downloadUrl = process.env.APP_DOWNLOAD_URL || ''
    return res.json({ minVersionCode, downloadUrl, ...getBundleConfig() })
  }
})

export default router
