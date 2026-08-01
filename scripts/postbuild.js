/**
 * scripts/postbuild.js
 * Dijalankan otomatis setelah `npm run build` (via "postbuild" hook di package.json).
 *
 * Yang dilakukan:
 *   1. Zip seluruh isi dist/ → bundles/tomat-<version>.zip
 *   2. Hitung SHA256 dan ukuran file
 *   3. Tulis bundles/manifest.json (dibaca oleh server/app-version.js saat runtime)
 *
 * Env var opsional:
 *   APP_PUBLIC_URL  — URL publik server, contoh: https://linktomat.app
 *                     Diset di Coolify environment variables.
 *                     Jika tidak diset, bundleUrl akan kosong (OTA tidak aktif).
 */

import { execSync } from 'child_process'
import { createHash } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'fs'

// ── Baca versi dari src/version.js ───────────────────────────────────────────
const versionSrc = readFileSync('src/version.js', 'utf8')
const version = versionSrc.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1]
if (!version) {
  console.error('❌ Tidak bisa baca APP_VERSION dari src/version.js')
  process.exit(1)
}

const bundleName  = `tomat-${version}.zip`
const bundleDir   = 'bundles'
const bundlePath  = `${bundleDir}/${bundleName}`
const publicUrl   = (process.env.APP_PUBLIC_URL || '').replace(/\/$/, '')

// ── Buat folder bundles/ ──────────────────────────────────────────────────────
mkdirSync(bundleDir, { recursive: true })

// ── Zip dist/ ─────────────────────────────────────────────────────────────────
if (!existsSync('dist')) {
  console.error('❌ Folder dist/ tidak ditemukan. Pastikan vite build berhasil dulu.')
  process.exit(1)
}

console.log(`📦 Membuat bundle ${bundleName}...`)
try {
  execSync(`cd dist && zip -r "../${bundlePath}" . --quiet`, { stdio: 'pipe' })
} catch (err) {
  // zip mungkin tidak tersedia (Windows lokal) — skip, tidak error
  console.warn('⚠️  Perintah zip tidak tersedia di sistem ini. Bundle tidak dibuat.')
  console.warn('   (Normal jika kamu build di Windows lokal. Bundle dibuat otomatis di Coolify.)')
  process.exit(0)
}

// ── Hitung checksum & ukuran ──────────────────────────────────────────────────
const fileBuffer = readFileSync(bundlePath)
const checksum   = createHash('sha256').update(fileBuffer).digest('hex')
const size       = statSync(bundlePath).size

// ── Tulis manifest.json ───────────────────────────────────────────────────────
const manifest = {
  bundleVersion:   version,
  bundleUrl:       publicUrl ? `${publicUrl}/bundles/${bundleName}` : '',
  bundleSize:      size,
  bundleChecksum:  `sha256:${checksum}`,
  updateNotes:     '',
  builtAt:         new Date().toISOString(),
}

writeFileSync(`${bundleDir}/manifest.json`, JSON.stringify(manifest, null, 2))

// ── Log hasil ─────────────────────────────────────────────────────────────────
console.log(`✅ Bundle selesai!`)
console.log(`   File    : ${bundlePath}`)
console.log(`   Versi   : ${version}`)
console.log(`   Ukuran  : ${(size / 1024 / 1024).toFixed(2)} MB (${size} bytes)`)
console.log(`   SHA256  : ${checksum}`)
if (manifest.bundleUrl) {
  console.log(`   URL     : ${manifest.bundleUrl}`)
} else {
  console.log(`   URL     : (set APP_PUBLIC_URL di Coolify untuk mengaktifkan OTA)`)
}
