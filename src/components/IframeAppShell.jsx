import React, { useState, useEffect, useRef } from 'react'
import { openExternalUrl } from '../openExternalUrl'

const GURU_URL = 'https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io'
const BLP_URL  = 'https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io'

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
          onClick={() => openExternalUrl(src)}
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
        onClick={() => openExternalUrl(src)}
        style={{
          border: 'none', borderRadius: 12, padding: '12px 24px',
          background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
        }}
      >
        Coba Buka di Browser ↗
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
 * CapacitorDirectOpen — di Capacitor (APK), iframe lintas-asal tidak bisa
 * digunakan karena X-Frame-Options memblokir embedding dari capacitor://localhost.
 * Tampilkan layar konfirmasi lalu buka via @capacitor/browser (browser sistem).
 */
function CapacitorDirectOpen({ src, title, onBack }) {
  const isGuru = src === GURU_URL
  const accent = isGuru ? '#f59e0b' : '#10b981'
  const accentSoft = isGuru ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)'
  const accentBorder = isGuru ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'
  const emoji = isGuru ? '🏫' : '📋'
  const [opening, setOpening] = useState(false)

  const handleOpen = async () => {
    setOpening(true)
    await openExternalUrl(src)
    // Setelah browser terbuka, kembali ke layar TOMAT
    setTimeout(() => {
      setOpening(false)
      onBack()
    }, 800)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px',
      background: 'linear-gradient(135deg, #071321, #0d1f3c)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Back button */}
      <div style={{
        position: 'absolute',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0, zIndex: 10, padding: 8,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(7,19,33,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '7px 12px',
            color: '#e2e8f0', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          ← TOMAT
        </button>
      </div>

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
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
          {isGuru
            ? 'Aplikasi GURU (EOB5) mengelola absensi, nilai, jadwal, dan soal AI untuk guru.'
            : 'BLP Harian digunakan untuk mengisi dan merekap aktivitas belajar harian siswa.'
          }
          <br /><br />
          Akan dibuka di browser agar bisa terhubung ke server dengan benar.
        </div>
        <button
          onClick={handleOpen}
          disabled={opening}
          style={{
            width: '100%', border: 'none', borderRadius: 14,
            padding: '14px 20px',
            background: opening
              ? 'rgba(255,255,255,0.08)'
              : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: opening ? '#64748b' : (isGuru ? '#1c1917' : '#022c22'),
            fontSize: 15, fontWeight: 900, cursor: opening ? 'default' : 'pointer',
            fontFamily: 'inherit', letterSpacing: 0.3,
            boxShadow: opening ? 'none' : `0 4px 20px ${accentSoft}`,
            marginBottom: 12,
            transition: 'all 0.2s',
          }}
        >
          {opening ? 'Membuka...' : 'Buka di Browser ↗'}
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

/**
 * IframeAppShell — fullscreen overlay untuk BLP Harian dan GURU (EOB5).
 * Props: { src, title, onBack }
 *
 * - Di Capacitor (APK): langsung tampilkan CapacitorDirectOpen karena iframe
 *   lintas-asal diblokir oleh X-Frame-Options dari capacitor://localhost.
 * - Di browser web: coba iframe; jika timeout/error tampilkan BlockedState/ErrorState.
 */
export default function IframeAppShell({ src, title, onBack }) {
  // Di APK Capacitor — skip iframe, langsung buka di browser sistem
  if (window.Capacitor) {
    return <CapacitorDirectOpen src={src} title={title} onBack={onBack} />
  }

  return <WebIframeShell src={src} title={title} onBack={onBack} />
}

function WebIframeShell({ src, title, onBack }) {
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [blocked, setBlocked]   = useState(false)
  const iframeRef               = useRef(null)
  const timeoutRef              = useRef(null)
  const loadedRef               = useRef(false)

  useEffect(() => {
    loadedRef.current = false
    setLoading(true)
    setError(false)
    setBlocked(false)

    timeoutRef.current = setTimeout(() => {
      if (!loadedRef.current) {
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

    try {
      const doc = iframeRef.current?.contentDocument
      if (doc && doc.URL === 'about:blank' && src !== 'about:blank') {
        setLoading(false)
        setBlocked(true)
        return
      }
    } catch {
      // Cross-origin — normal case
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
      {/* Back button */}
      <div style={{
        position: 'absolute',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0, zIndex: 9010, padding: 8,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(7,19,33,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '7px 12px',
            color: '#e2e8f0', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          ← TOMAT
        </button>
      </div>

      {loading && <LoadingBar />}

      {blocked && !error && (
        <BlockedState src={src} title={title} onBack={onBack} />
      )}

      {error && <ErrorState src={src} onBack={onBack} />}

      {!blocked && !error && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{ width: '100%', height: '100dvh', border: 'none', display: 'block' }}
          allow="camera; microphone; geolocation; payment"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
