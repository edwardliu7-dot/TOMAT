import React, { useState, useEffect, useRef } from 'react'

// ── src/assets imports (Vite resolves these at build time) ──────────────────
import assetLogo        from '../assets/logo.png'
import assetTomi        from '../assets/tomi.svg'
import assetNeonCyber   from '../assets/neon cyber.png'
import assetIceCrystal  from '../assets/ice crystal.png'
import assetApiAbadi    from '../assets/api abadi.png'
import assetSakuraPetal from '../assets/sakura petal.png'
import assetGoldenHalo  from '../assets/golden halo.png'
import assetAurum       from '../assets/aurum sovereign.png'
import assetVoidKing    from '../assets/void king.png'
import assetVoidMonarch from '../assets/void monarch.png'
import assetDekrit      from '../assets/dekrit mahaguru.svg'
import assetCelestia    from '../assets/celestia relic.svg'

// ── All assets to preload ───────────────────────────────────────────────────
// public/ assets are referenced by absolute URL string (served as-is by Vite).
// src/assets/ are the imported module URLs above.
const ALL_ASSETS = [
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
  // ── src/assets ──
  assetLogo,
  assetTomi,
  assetNeonCyber,
  assetIceCrystal,
  assetApiAbadi,
  assetSakuraPetal,
  assetGoldenHalo,
  assetAurum,
  assetVoidKing,
  assetVoidMonarch,
  assetDekrit,
  assetCelestia,
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
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'linear-gradient(135deg, #facc15 0%, #ef4444 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52, marginBottom: 24,
        boxShadow: '0 0 48px rgba(250,204,21,0.25), 0 8px 32px rgba(0,0,0,0.5)',
        animation: 'tomPulse 2s ease-in-out infinite',
      }}>
        🍅
      </div>

      {/* Title */}
      <div style={{
        fontSize: 36, fontWeight: 900, letterSpacing: 8,
        color: '#fff', textTransform: 'uppercase', marginBottom: 4,
        textShadow: '0 0 24px rgba(99,102,241,0.5)',
      }}>TOMAT</div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 4,
        color: '#6366F1', textTransform: 'uppercase', marginBottom: 40,
      }}>TANTANGAN OTAK MATEMATIKA</div>

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

// ── Main preloader wrapper ──────────────────────────────────────────────────
export default function AssetPreloader({ children }) {
  const [loaded, setLoaded]   = useState(false)
  const [pct,    setPct]      = useState(0)
  const countRef              = useRef(0)

  useEffect(() => {
    // Hide the static HTML splash immediately — we're taking over
    const splash = document.getElementById('splash')
    if (splash) {
      splash.style.transition = 'none'
      splash.remove()
    }

    let cancelled = false

    function onOne() {
      if (cancelled) return
      countRef.current += 1
      const p = Math.round((countRef.current / TOTAL) * 100)
      setPct(p)
      if (countRef.current >= TOTAL) {
        // Brief pause so the user sees 100% before the app appears
        setTimeout(() => {
          if (!cancelled) setLoaded(true)
        }, 300)
      }
    }

    ALL_ASSETS.forEach(src => loadAsset(src).then(onOne))

    return () => { cancelled = true }
  }, [])

  if (!loaded) return <LoadingScreen pct={pct} />
  return children
}
