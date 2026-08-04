import React, { useState, useEffect, useRef } from 'react'

const GURU_URL = 'https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io'
const BLP_URL  = 'https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io'

// Checks whether a URL allows being embedded in an iframe by probing its
// response headers. Returns 'allowed' | 'blocked' | 'unknown' (on fetch failure).
async function checkIframeAllowed(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
    // no-cors: we can't read headers, but if the fetch didn't throw we assume it's reachable.
    // A server blocking frames via X-Frame-Options / CSP will still respond to HEAD;
    // the browser will silently refuse to render it inside the iframe.
    // We therefore always attempt the iframe first and rely on the timeout/error fallback.
    void res
    return 'allowed'
  } catch {
    return 'unknown'
  }
}

function LoadingBar() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      height: 3,
      background: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #a78bfa, #67e8f9)',
        animation: 'iframeLoadBar 1.8s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes iframeLoadBar {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}

function BlockedState({ src, title, onBack }) {
  const isGuru = src === GURU_URL
  const accent = isGuru ? '#f59e0b' : '#10b981'
  const accentSoft = isGuru ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)'
  const accentBorder = isGuru ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'
  const emoji = isGuru ? '🏫' : '📋'
  const desc = isGuru
    ? 'Aplikasi GURU (EOB5) mengelola absensi, nilai, jadwal, dan soal AI untuk guru.'
    : 'BLP Harian digunakan untuk mengisi dan merekap aktivitas belajar harian siswa.'

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 5,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px',
      background: 'linear-gradient(135deg, #071321, #0d1f3c)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${accentBorder}`,
        borderRadius: 24, padding: '32px 28px',
        textAlign: 'center',
        boxShadow: `0 0 60px ${accentSoft}`,
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{emoji}</div>
        <div style={{ fontSize: 11, color: accent, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
          APLIKASI TERPISAH
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
          {desc}
          <br /><br />
          Aplikasi ini berjalan di server terpisah demi keamanan dan stabilitas.
        </div>
        <button
          onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
          style={{
            width: '100%', border: 'none', borderRadius: 14,
            padding: '14px 20px',
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: isGuru ? '#1c1917' : '#022c22',
            fontSize: 15, fontWeight: 900, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: 0.3,
            boxShadow: `0 4px 20px ${accentSoft}`,
            marginBottom: 12,
          }}
        >
          Buka Aplikasi ↗
        </button>
        <button
          onClick={onBack}
          style={{
            width: '100%', border: 'none', borderRadius: 14,
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.06)',
            color: '#64748b', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← Kembali ke TOMAT
        </button>
      </div>
    </div>
  )
}

function ErrorState({ src, onBack }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 5,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(135deg, #071321, #0d1f3c)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#f87171', marginBottom: 8 }}>
        Gagal Memuat Aplikasi
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
        Aplikasi tidak dapat dimuat. Mungkin server sedang tidak aktif atau koneksimu terputus.
      </div>
      <button
        onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
        style={{
          border: 'none', borderRadius: 12, padding: '12px 24px',
          background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
        }}
      >
        Coba Buka di Tab Baru ↗
      </button>
      <button
        onClick={onBack}
        style={{
          border: 'none', background: 'none', color: '#64748b',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        ← Kembali ke TOMAT
      </button>
    </div>
  )
}

/**
 * IframeAppShell — fullscreen iframe overlay untuk BLP Harian dan GURU (EOB5).
 * Props: { src, title, onBack }
 *
 * Alur:
 * 1. Tampilkan loading bar sambil cek apakah URL reachable
 * 2. Jika URL terblokir iframe (X-Frame-Options) → tampilkan BlockedState
 * 3. Jika iframe berhasil load → sembunyikan loading bar
 * 4. Jika iframe error / timeout 12s → tampilkan ErrorState
 */
export default function IframeAppShell({ src, title, onBack }) {
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [blocked, setBlocked]   = useState(false)
  const iframeRef               = useRef(null)
  const timeoutRef              = useRef(null)
  const loadedRef               = useRef(false)

  // Attempt to detect if the URL will be blocked by X-Frame-Options.
  // Strategy: render the iframe. If the iframe fires onLoad but its
  // contentDocument is inaccessible AND contentWindow.location throws,
  // it loaded a blocked page. However browsers do not reliably expose this.
  // Instead: we set a 12-second timeout — if onLoad never fires, we show
  // the blocked/error intermediate page. This handles both connectivity
  // failures and X-Frame-Options blocks (which silently prevent rendering).
  useEffect(() => {
    loadedRef.current = false
    setLoading(true)
    setError(false)
    setBlocked(false)

    timeoutRef.current = setTimeout(() => {
      if (!loadedRef.current) {
        // iframe didn't load in time → show blocked/intermediate page
        setLoading(false)
        setBlocked(true)
      }
    }, 12000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [src])

  const handleLoad = () => {
    loadedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Try to detect X-Frame-Options block: a blocked iframe typically has
    // contentDocument === null or contentDocument.URL === 'about:blank'
    // while the src is a real URL. This only works same-origin, but we attempt it.
    try {
      const doc = iframeRef.current?.contentDocument
      if (doc && doc.URL === 'about:blank' && src !== 'about:blank') {
        // Likely blocked
        setLoading(false)
        setBlocked(true)
        return
      }
    } catch {
      // Cross-origin — normal case; ignore the error
    }

    setLoading(false)
  }

  const handleError = () => {
    loadedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setLoading(false)
    setError(true)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: '#000',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Back button — always visible above iframe */}
      <div style={{
        position: 'absolute',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        zIndex: 9010,
        padding: 8,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(7,19,33,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '7px 12px',
            color: '#e2e8f0',
            fontSize: 12, fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          ← TOMAT
        </button>
      </div>

      {/* Loading indicator */}
      {loading && <LoadingBar />}

      {/* Blocked state — shown when iframe cannot embed */}
      {blocked && !error && (
        <BlockedState src={src} title={title} onBack={onBack} />
      )}

      {/* Error state */}
      {error && <ErrorState src={src} onBack={onBack} />}

      {/* The iframe itself */}
      {!blocked && !error && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            width: '100%',
            height: '100dvh',
            border: 'none',
            display: 'block',
          }}
          allow="camera; microphone; geolocation; payment"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
