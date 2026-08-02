# Prompt 08 — OTA Bundle Update (Update Dalam Aplikasi)

## Prasyarat
- Bisa dikerjakan kapan saja, **tidak harus menunggu Prompt 07**.
- Bisa diterapkan di TOMAT saat ini, dan otomatis berlaku juga setelah merger Pilihan C selesai.

---

## Latar Belakang & Konsep

APK TOMAT terdiri dari dua lapisan:

```
APK TOMAT
├── Shell native (Capacitor + Android runtime)
│   └── Jarang berubah — hanya jika plugin baru, izin baru, upgrade Capacitor
│   └── Ukuran: ~8–12 MB
└── Web bundle (output dist/ dari Vite build = semua kode React)
    └── Sering berubah — setiap update fitur/bug fix
    └── Ukuran: ~3–6 MB (bisa lebih besar setelah merger)
```

**Masalah sekarang:** setiap update (sekecil apapun), user harus download ulang seluruh APK.

**Solusi OTA (Over-the-Air) Update:** hanya perbarui web bundle tanpa reinstall APK.

```
Update normal sekarang:       Update setelah OTA:
User download APK 15 MB       User download bundle ~3 MB
+ install ulang               + download di dalam app
+ kadang minta izin install   + auto-apply saat restart app
```

### Dua jenis update:

| Jenis | Kapan | Ukuran | Cara |
|-------|-------|--------|------|
| **Hard update** | Capacitor upgrade, plugin baru, izin Android baru | ~15 MB full APK | Seperti sekarang: buka browser download APK |
| **Soft update (OTA)** | React code berubah, screen baru, bug fix | ~2–5 MB bundle zip | **Baru:** download dalam app, apply saat restart |

---

## Alur Update (seperti MLBB patch)

```
App dibuka
    ↓
Cek server: apakah ada bundle versi baru?
    ↓ Ya                              ↓ Tidak
Download bundle di background         Lanjut main seperti biasa
(user bisa main sambil tunggu)
    ↓
Progress bar kecil di pojok layar
"Mengunduh update 2.1 MB..."
    ↓
Download selesai
"✅ Update siap! Restart untuk terapkan" (tombol kecil, tidak paksa)
    ↓
User tap Restart (atau tutup-buka app)
    ↓
App load dari bundle baru ✓
```

---

## Implementasi

### Pilihan Teknis: Capgo Plugin (direkomendasikan)

`@capgo/capacitor-updater` adalah plugin open-source khusus untuk OTA updates di Capacitor. Sudah dipakai oleh ribuan app. Bisa self-hosted (gratis).

```bash
npm install @capgo/capacitor-updater
npx cap sync android
```

Plugin ini menangani:
- Download bundle zip
- Verifikasi integritas (checksum)
- Atomic rollback (kalau update gagal, balik ke versi sebelumnya)
- Notifikasi progress

### Jika tidak mau dependency tambahan: Custom dengan `@capacitor/filesystem`

Bisa juga diimplementasikan manual tanpa Capgo, menggunakan `@capacitor/filesystem` untuk download + simpan bundle, dan `CapacitorWebView.setServerAssetPath()` untuk load bundle baru. Lebih kompleks tapi 100% dalam kontrol kita.

---

## File yang Dibuat/Diubah

### `server/app-version.js` (file baru)

Route `/api/app/version-check` yang sudah ada di `server/` perlu diperluas untuk mengembalikan info bundle juga.

Cari file yang saat ini handle `/api/app/version-check` (kemungkinan ada di `server/index.js` atau file tersendiri). Update response-nya:

```javascript
// server/app-version.js
import express from 'express'
const router = express.Router()

// Versi saat ini — update setiap kali deploy
const CURRENT_CONFIG = {
  // APK
  minVersionCode: 10,        // APK dengan versionCode < ini dipaksa update APK
  downloadUrl: 'https://linktomat.app/download/tomat-latest.apk',
  
  // Web bundle (OTA)
  bundleVersion: '2.1.0',    // Versi bundle saat ini
  bundleUrl: 'https://linktomat.app/bundles/tomat-2.1.0.zip',
  bundleSize: 3145728,       // Ukuran dalam bytes (untuk tampilan progress)
  bundleChecksum: 'sha256:abc123...', // Checksum untuk verifikasi
  
  // Pesan update opsional
  updateNotes: 'Perbaikan bug duel, tambah materi BLP',
}

router.get('/version-check', (req, res) => {
  res.json(CURRENT_CONFIG)
})

export default router
```

Mount di `server/index.js`:
```javascript
import appVersionRouter from './app-version.js'
app.use('/api/app', appVersionRouter)
```

---

### `src/hooks/useAppUpdateCheck.js` (update yang sudah ada)

Perluas hook yang sudah ada untuk handle dua jenis update:

```javascript
import { useEffect, useState } from 'react'

export function useAppUpdateCheck() {
  const [state, setState] = useState({
    checking: true,
    // Hard update (APK)
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
      const isNative = window.Capacitor?.isNativePlatform?.() === true
      if (!isNative) {
        setState(s => ({ ...s, checking: false }))
        return
      }

      try {
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo()
        const installedVersionCode = parseInt(info.build, 10)

        const res = await fetch('/api/app/version-check')
        const data = await res.json()
        const minVersionCode = parseInt(data.minVersionCode, 10)

        if (!cancelled) {
          const updateRequired = installedVersionCode < minVersionCode
          
          // Cek apakah ada bundle baru
          // Simpan versi bundle terinstall di localStorage
          const installedBundleVersion = localStorage.getItem('installed_bundle_version') || '0.0.0'
          const bundleUpdateAvailable = !updateRequired && data.bundleVersion && data.bundleVersion !== installedBundleVersion

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
        if (!cancelled) setState(s => ({ ...s, checking: false }))
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  return state
}
```

---

### `src/components/OtaUpdateBanner.jsx` (file baru)

Banner kecil non-blocking yang muncul di bawah layar saat bundle update tersedia. User bisa tetap main sambil download berjalan.

```jsx
import { useState, useEffect, useRef } from 'react'

export default function OtaUpdateBanner({ bundleVersion, bundleUrl, bundleSize, bundleNotes, onApplied }) {
  const [phase, setPhase] = useState('idle') // idle | downloading | ready | applying
  const [progress, setProgress] = useState(0)  // 0–100
  const [dismissed, setDismissed] = useState(false)
  const bundleDataRef = useRef(null)

  if (dismissed) return null

  const formatSize = (bytes) => {
    if (!bytes) return ''
    return bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
  }

  const startDownload = async () => {
    setPhase('downloading')
    setProgress(0)

    try {
      // Gunakan Capgo updater jika tersedia, fallback ke fetch manual
      if (window.CapacitorUpdater) {
        // Capgo plugin path
        const result = await window.CapacitorUpdater.download({
          url: bundleUrl,
          version: bundleVersion,
        })
        bundleDataRef.current = result
        setProgress(100)
        setPhase('ready')
      } else {
        // Fallback: download manual via fetch dengan progress tracking
        const response = await fetch(bundleUrl)
        const total = parseInt(response.headers.get('Content-Length') || bundleSize, 10)
        const reader = response.body.getReader()
        const chunks = []
        let loaded = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          loaded += value.length
          if (total) setProgress(Math.round((loaded / total) * 100))
        }

        // Simpan di localStorage (hanya untuk bundle kecil — gunakan Filesystem plugin untuk produksi)
        const blob = new Blob(chunks)
        bundleDataRef.current = blob
        setPhase('ready')
      }
    } catch (err) {
      console.error('OTA download error:', err)
      setPhase('idle')
    }
  }

  const applyUpdate = async () => {
    setPhase('applying')
    try {
      if (window.CapacitorUpdater && bundleDataRef.current) {
        await window.CapacitorUpdater.set(bundleDataRef.current)
        // Tandai versi terinstall
        localStorage.setItem('installed_bundle_version', bundleVersion)
        // Restart app
        window.CapacitorUpdater.reload()
      } else {
        // Fallback: tandai versi dan hard reload
        localStorage.setItem('installed_bundle_version', bundleVersion)
        window.location.reload()
      }
      onApplied?.()
    } catch {
      setPhase('ready')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const BG = 'linear-gradient(135deg, #0f172a, #1e1b4b)'
  const BORDER = 'rgba(99,102,241,0.4)'

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 0, right: 0, zIndex: 8000,
      display: 'flex', justifyContent: 'center', padding: '0 16px',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: BG, border: `1px solid ${BORDER}`,
        borderRadius: 16, padding: '12px 16px',
        maxWidth: 400, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'all',
      }}>
        {/* Idle: tawaran download */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🆕</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>
                Update tersedia (v{bundleVersion})
              </div>
              {bundleNotes && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bundleNotes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setDismissed(true)} style={{
                background: 'transparent', border: 'none', color: '#475569',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
              }}>
                Nanti
              </button>
              <button onClick={startDownload} style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', borderRadius: 10, padding: '6px 14px',
                color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Unduh {formatSize(bundleSize)}
              </button>
            </div>
          </div>
        )}

        {/* Downloading: progress bar */}
        {phase === 'downloading' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#c4b5fd', fontWeight: 700 }}>⬇️  Mengunduh update...</span>
              <span style={{ color: '#818cf8', fontWeight: 800 }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg,#6366f1,#818cf8)',
                borderRadius: 6, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
              Kamu bisa tetap main selagi menunggu 👾
            </div>
          </div>
        )}

        {/* Ready: tawarkan restart */}
        {phase === 'ready' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>
                Update siap diterapkan!
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                App akan restart sebentar
              </div>
            </div>
            <button onClick={applyUpdate} style={{
              background: 'linear-gradient(135deg,#10b981,#059669)',
              border: 'none', borderRadius: 10, padding: '8px 16px',
              color: '#fff', fontSize: 12, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}>
              Restart
            </button>
          </div>
        )}

        {/* Applying */}
        {phase === 'applying' && (
          <div style={{ textAlign: 'center', padding: '4px 0', color: '#818cf8', fontSize: 13, fontWeight: 700 }}>
            ✨ Menerapkan update...
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### `src/App.jsx` (update)

Tambahkan `OtaUpdateBanner` di dalam render, setelah banner-banner lain yang sudah ada:

```jsx
import OtaUpdateBanner from './components/OtaUpdateBanner'

// Di dalam AppContent, ambil data dari useAppUpdateCheck:
const { bundleUpdateAvailable, bundleVersion, bundleUrl, bundleSize, bundleNotes } = updateCheckResult

// Di dalam JSX render (dalam div root, setelah DuelInviteBanner):
{bundleUpdateAvailable && (
  <OtaUpdateBanner
    bundleVersion={bundleVersion}
    bundleUrl={bundleUrl}
    bundleSize={bundleSize}
    bundleNotes={bundleNotes}
    onApplied={() => {/* state cleanup jika perlu */}}
  />
)}
```

---

### `scripts/deploy-bundle.sh` (file baru)

Script untuk dijalankan oleh developer setelah `npm run build` untuk:
1. Zip isi `dist/`
2. Hitung checksum
3. Upload ke server
4. Update config di `server/app-version.js`

```bash
#!/bin/bash
# scripts/deploy-bundle.sh
# Jalankan setelah: npm run build

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: bash scripts/deploy-bundle.sh 2.1.0"
  exit 1
fi

BUNDLE_NAME="tomat-${VERSION}.zip"
DIST_DIR="dist"
BUNDLE_DIR="bundles"

mkdir -p $BUNDLE_DIR

# Zip bundle
echo "📦 Zipping bundle..."
cd $DIST_DIR && zip -r "../${BUNDLE_DIR}/${BUNDLE_NAME}" . && cd ..

# Hitung checksum
CHECKSUM=$(sha256sum "${BUNDLE_DIR}/${BUNDLE_NAME}" | awk '{print $1}')
SIZE=$(stat -c%s "${BUNDLE_DIR}/${BUNDLE_NAME}")

echo "✅ Bundle: ${BUNDLE_NAME}"
echo "   Size: ${SIZE} bytes"
echo "   SHA256: ${CHECKSUM}"
echo ""
echo "📋 Update server/app-version.js:"
echo "   bundleVersion: '${VERSION}',"
echo "   bundleUrl: 'https://your-server/bundles/${BUNDLE_NAME}',"
echo "   bundleSize: ${SIZE},"
echo "   bundleChecksum: 'sha256:${CHECKSUM}',"
```

Server TOMAT perlu serve folder `bundles/` sebagai static files. Tambahkan di `server/index.js`:
```javascript
import path from 'path'
app.use('/bundles', express.static(path.join(process.cwd(), 'bundles')))
```

---

### `android/app/src/main/AndroidManifest.xml` (cek apakah sudah ada)

Pastikan ada permission `INTERNET` (sudah ada di hampir semua Capacitor app):
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Tidak ada permission tambahan yang dibutuhkan — download file via HTTPS tidak butuh `WRITE_EXTERNAL_STORAGE` di Android 10+.

---

## Install Capgo Plugin (opsional tapi direkomendasikan)

Jika memilih Capgo (lebih robust, ada rollback otomatis):

```bash
npm install @capgo/capacitor-updater
npx cap sync android
```

Di `android/app/src/main/res/raw/capacitor.config.json` atau `capacitor.config.json`:
```json
{
  "plugins": {
    "CapacitorUpdater": {
      "statsUrl": "",
      "channelUrl": "",
      "autoDeleteFailed": true,
      "autoDeletePrevious": false,
      "autoUpdate": false
    }
  }
}
```

`autoUpdate: false` agar kita kontrol sendiri kapan download dan apply (sesuai flow di `OtaUpdateBanner`).

---

## Kapan Harus Hard Update vs OTA?

| Perubahan | Jenis Update |
|-----------|-------------|
| Bug fix React/UI | ✅ OTA bundle |
| Layar baru | ✅ OTA bundle |
| Fitur game baru | ✅ OTA bundle |
| Merge BLP/EOB5 selesai | ✅ OTA bundle (bundle lebih besar, tapi sekali saja) |
| Upgrade Capacitor versi | ❌ Hard APK update |
| Plugin Capacitor baru | ❌ Hard APK update |
| Perubahan izin Android | ❌ Hard APK update |
| Target SDK Android berubah | ❌ Hard APK update |

Setelah merger selesai: hard update APK **satu kali** (bundle lebih besar), lalu semua update selanjutnya cukup OTA.

---

## Aturan Wajib

- **Baca RULES.md sebelum mulai.**
- Komponen `OtaUpdateBanner` menggunakan inline styles (tidak ada Tailwind).
- Banner tidak boleh memblokir layar — user bisa tetap pakai app saat download.
- Jika Capgo plugin tidak diinstall, fallback ke custom fetch (kode sudah handle keduanya).
- `localStorage.getItem('installed_bundle_version')` adalah satu-satunya cara tracking versi bundle yang terinstall.

---

## Kriteria Selesai

- [ ] `server/app-version.js` ada dengan response `bundleVersion` + `bundleUrl` + `bundleSize`
- [ ] `src/hooks/useAppUpdateCheck.js` diupdate untuk detect bundle update
- [ ] `src/components/OtaUpdateBanner.jsx` ada dengan 4 phase (idle, downloading, ready, applying)
- [ ] `OtaUpdateBanner` muncul di `App.jsx` ketika `bundleUpdateAvailable = true`
- [ ] Di emulator/APK: banner muncul jika server punya bundleVersion lebih baru dari `installed_bundle_version`
- [ ] Download berjalan di background (user bisa main sambil download)
- [ ] Setelah download selesai, tombol Restart muncul
- [ ] Setelah Restart, app memuat bundle baru
- [ ] `scripts/deploy-bundle.sh` ada dan bisa dijalankan
- [ ] `UpdateRequiredScreen` (hard update) masih berfungsi seperti sebelumnya — tidak rusak
