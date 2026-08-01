import { useState, useRef } from 'react'

/**
 * Banner non-blocking di bawah layar untuk OTA (web bundle) update.
 * User bisa tetap bermain sambil download berjalan di background.
 *
 * Phase:
 *   idle        → tawarkan download
 *   downloading → progress bar
 *   ready       → tawarkan restart
 *   applying    → animasi "menerapkan..."
 */
export default function OtaUpdateBanner({ bundleVersion, bundleUrl, bundleSize, bundleNotes, onApplied }) {
  const [phase, setPhase] = useState('idle') // idle | downloading | ready | applying
  const [progress, setProgress] = useState(0)  // 0–100
  const [dismissed, setDismissed] = useState(false)
  const bundleDataRef = useRef(null)

  if (dismissed) return null

  const formatSize = (bytes) => {
    if (!bytes) return ''
    return bytes > 1048576
      ? `${(bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`
  }

  const startDownload = async () => {
    setPhase('downloading')
    setProgress(0)

    try {
      // Gunakan Capgo updater jika tersedia, fallback ke fetch manual
      if (window.CapacitorUpdater) {
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
        const total = parseInt(response.headers.get('Content-Length') || String(bundleSize), 10)
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

        bundleDataRef.current = new Blob(chunks)
        setPhase('ready')
      }
    } catch (err) {
      console.error('[OTA] Download error:', err)
      setPhase('idle')
    }
  }

  const applyUpdate = async () => {
    setPhase('applying')
    try {
      if (window.CapacitorUpdater && bundleDataRef.current) {
        await window.CapacitorUpdater.set(bundleDataRef.current)
        localStorage.setItem('installed_bundle_version', bundleVersion)
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

  // ── Styles ────────────────────────────────────────────────────────────────
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

        {/* ── Idle: tawarkan download ── */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🆕</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>
                Update tersedia (v{bundleVersion})
              </div>
              {bundleNotes && (
                <div style={{
                  fontSize: 11, color: '#64748b', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {bundleNotes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setDismissed(true)}
                style={{
                  background: 'transparent', border: 'none', color: '#475569',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
                }}
              >
                Nanti
              </button>
              <button
                onClick={startDownload}
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', borderRadius: 10, padding: '6px 14px',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Unduh {formatSize(bundleSize)}
              </button>
            </div>
          </div>
        )}

        {/* ── Downloading: progress bar ── */}
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

        {/* ── Ready: tawarkan restart ── */}
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
            <button
              onClick={applyUpdate}
              style={{
                background: 'linear-gradient(135deg,#10b981,#059669)',
                border: 'none', borderRadius: 10, padding: '8px 16px',
                color: '#fff', fontSize: 12, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              Restart
            </button>
          </div>
        )}

        {/* ── Applying ── */}
        {phase === 'applying' && (
          <div style={{
            textAlign: 'center', padding: '4px 0',
            color: '#818cf8', fontSize: 13, fontWeight: 700,
          }}>
            ✨ Menerapkan update...
          </div>
        )}

      </div>
    </div>
  )
}
