import React, { useState, useEffect, useRef } from 'react'

// ── src/assets imports ──────────────────────────────────────────────────────
import assetLogo from '../assets/logo.png'

// ── All assets to preload ───────────────────────────────────────────────────
const ALL_ASSETS = [
  // ── logo (src/assets — gets content-hashed URL) ──
  assetLogo,
  // ── sprites & pets ──
  '/tomi-sprite.png',
  '/tomi-silver-fluff.png',
  '/tomi-cosmic-fluff.png',
  '/tomi-void-emperor.png',
  '/monyang-sprite.png',
  '/monyang-raja.png',
  '/nananaga-sprite.png',
  '/kelinsay-sprite.png',
  '/kelinsay-malam.png',
  '/kelinsay-senja.png',
  // ── guru default frame ──
  '/guru.png',
  // ── bingkai / frames ──
  '/bingkai-neon.png',
  '/bingkai-api.png',
  '/bingkai-es.png',
  '/bingkai-sakura.png',
  '/bingkai-emas.png',
  '/bingkai-aurum-sovereign.png',
  '/bingkai-void-king.png',
  '/bingkai-void-monarch.png',
  // ── misc public ──
  '/petal-rose.png',
  '/garuda.gif',
  '/celestia-relic.svg',
  '/dekrit-mahaguru.svg',
  '/icon-192.png',
]

const TOTAL = ALL_ASSETS.length

function loadAsset(src) {
  return new Promise((resolve) => {
    // SVG & GIF also go through Image()
    const img = new window.Image()
    img.onload  = resolve
    img.onerror = resolve   // never block on a failed asset
    img.src = src
  })
}

// ── Loading screen UI ───────────────────────────────────────────────────────
function LoadingScreen({ pct }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'radial-gradient(ellipse at 50% 40%, #0d1b35 0%, #070d1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 0, fontFamily: "'Inter', sans-serif",
      userSelect: 'none',
    }}>
      {/* Subtle radial glow behind logo */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <img
        src={assetLogo}
        alt="SMARTISA"
        style={{
          width: 108, height: 108, borderRadius: 28,
          objectFit: 'cover', marginBottom: 24,
          boxShadow: '0 0 48px rgba(250,204,21,0.30), 0 8px 32px rgba(0,0,0,0.55)',
          animation: 'tomPulse 2s ease-in-out infinite',
        }}
      />

      {/* Title */}
      <div style={{
        fontSize: 36, fontWeight: 900, letterSpacing: 8,
        color: '#fff', textTransform: 'uppercase', marginBottom: 4,
        textShadow: '0 0 24px rgba(99,102,241,0.5)',
      }}>SMARTISA</div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 4,
        color: '#6366F1', textTransform: 'uppercase', marginBottom: 40,
      }}>PLATFORM PEMBELAJARAN TISA</div>

      {/* Progress bar container */}
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Track */}
        <div style={{
          width: '100%', height: 6, borderRadius: 99,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
        }}>
          {/* Fill */}
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
            transition: 'width 0.25s ease-out',
            boxShadow: '0 0 12px rgba(99,102,241,0.6)',
          }} />
        </div>

        {/* Percentage label */}
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: pct >= 100 ? '#86EFAC' : '#A5B4FC',
          letterSpacing: 1,
          transition: 'color 0.3s',
        }}>
          {pct >= 100 ? '✓ Siap!' : `${pct}%`}
        </div>
      </div>

      {/* Dots animation at bottom */}
      <div style={{ position: 'absolute', bottom: 48, display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#4F5DDD',
            animation: 'tomDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes tomPulse {
          0%, 100% { transform: scale(1);     box-shadow: 0 0 48px rgba(250,204,21,0.25), 0 8px 32px rgba(0,0,0,0.5); }
          50%       { transform: scale(1.06); box-shadow: 0 0 64px rgba(250,204,21,0.45), 0 8px 32px rgba(0,0,0,0.5); }
        }
        @keyframes tomDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}

const CACHE_KEY = 'tomat_assets_cached_v1'

// ── Main preloader wrapper ──────────────────────────────────────────────────
export default function AssetPreloader({ children }) {
  // If assets were already preloaded in a previous session, skip immediately.
  const alreadyCached = typeof localStorage !== 'undefined'
    && localStorage.getItem(CACHE_KEY) === '1'

  const [loaded, setLoaded]   = useState(alreadyCached)
  const [pct,    setPct]      = useState(0)
  const countRef              = useRef(0)

  useEffect(() => {
    // Assets already in cache — nothing to do, hide HTML splash and go.
    if (alreadyCached) {
      const splash = document.getElementById('splash')
      if (splash) { splash.style.transition = 'none'; splash.remove() }
      return
    }

    // First-ever visit: hide HTML splash and run the preload sequence.
    const splash = document.getElementById('splash')
    if (splash) { splash.style.transition = 'none'; splash.remove() }

    let cancelled = false

    function onOne() {
      if (cancelled) return
      countRef.current += 1
      const p = Math.round((countRef.current / TOTAL) * 100)
      setPct(p)
      if (countRef.current >= TOTAL) {
        // Mark as cached so future sessions skip this screen entirely.
        try { localStorage.setItem(CACHE_KEY, '1') } catch (_) {}
        // Brief pause so the user sees 100 % / "✓ Siap!" before the app appears.
        setTimeout(() => { if (!cancelled) setLoaded(true) }, 350)
      }
    }

    ALL_ASSETS.forEach(src => loadAsset(src).then(onOne))

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) return <LoadingScreen pct={pct} />
  return children
}
