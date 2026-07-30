/**
 * Game visual theme configs — maps equipped_tema → CSS filter + background applied
 * to the game component wrapper. The filter shifts the entire color palette of the
 * game screen without touching individual game files.
 *
 * Design anchors (default game palette):
 *   Background  ~#071321 (hue 220°)
 *   Cyan accent ~#22d3ee (hue 195°)
 *   Violet      ~#818cf8 (hue 240°)
 *   Success grn ~#22c55e (hue 142°)
 */
export const GAME_THEMES = {
  // ── Seasonal event theme — auto-applied Jul 15–Aug 31, overrides equippedTema ──
  tema_merahputih: {
    label: 'Merah Putih',
    // hue-rotate(165deg) = -195deg: shifts default cyan (195°) → 0°/360° red
    filter: 'hue-rotate(165deg) saturate(1.4) brightness(0.88)',
    particles: 'merahputih',
    accent: '#DC2626',
    seasonal: true,   // flag so shop UI can hide / label it differently
  },
  tema_space: {
    label: 'Luar Angkasa',
    // Cyan stays cyan; slight contrast boost + slight darkening for "deep space" feel
    filter: 'saturate(1.12) brightness(0.92) contrast(1.06)',
    // Dot-star particles shown as a fixed underlay via GameThemeOverlay
    particles: 'stars',
    accent: '#22d3ee',
  },
  tema_hutan: {
    label: 'Hutan Mistis',
    // hue-rotate(-55°) shifts 195° cyan → ~140° green
    filter: 'hue-rotate(-55deg) saturate(1.2) brightness(0.88)',
    particles: 'leaves',
    accent: '#4ade80',
  },
  tema_api: {
    label: 'Api Merah',
    // hue-rotate(-155°) shifts 195° cyan → ~40° amber/orange
    filter: 'hue-rotate(-155deg) saturate(1.28) brightness(0.9)',
    particles: 'embers',
    accent: '#f59e0b',
  },
  tema_salju: {
    label: 'Salju',
    // slight hue push cooler + desaturate + brighten for icy feel
    filter: 'hue-rotate(12deg) saturate(0.82) brightness(1.07)',
    particles: 'snow',
    accent: '#7dd3fc',
  },
  tema_void: {
    label: 'Void',
    // hue-rotate(+78°) shifts 195° cyan → ~273° purple; darken + desaturate
    filter: 'hue-rotate(78deg) saturate(0.88) brightness(0.78)',
    particles: 'void',
    accent: '#a855f7',
  },
}

/**
 * Returns the theme config for a given equipped_tema ID, or null for default.
 */
export function getGameTheme(temaId) {
  return (temaId && GAME_THEMES[temaId]) || null
}

/**
 * Returns the approximate inverse of a theme's CSS filter string.
 * Kept for backwards compatibility but no longer used by the main app.
 */
export function getInverseFilter(temaId) {
  const theme = getGameTheme(temaId)
  if (!theme) return null
  return theme.filter
    .replace(/hue-rotate\((-?[\d.]+)deg\)/g,  (_, v) => `hue-rotate(${-parseFloat(v)}deg)`)
    .replace(/saturate\(([\d.]+)\)/g,          (_, v) => `saturate(${(1 / parseFloat(v)).toFixed(4)})`)
    .replace(/brightness\(([\d.]+)\)/g,        (_, v) => `brightness(${(1 / parseFloat(v)).toFixed(4)})`)
    .replace(/contrast\(([\d.]+)\)/g,          (_, v) => `contrast(${(1 / parseFloat(v)).toFixed(4)})`)
}

/**
 * Injects targeted CSS that applies the theme filter ONLY to structural navigation
 * and chrome elements (nav bar, top bar, player header, sidebar).
 *
 * Approach: set data-tema="<id>" on <html>, then target structural elements via CSS
 * class selectors.  Inside those containers, any <img>, <canvas>, <svg> or element
 * marked [data-raw-image] receives the inverse filter to counteract the parent —
 * so profile photos, avatar frames, and pet sprites stay true-colour even inside
 * a filtered nav bar.
 *
 * tema_merahputih is a special case: near-black backgrounds have near-zero
 * saturation so hue-rotate does nothing visible. We use direct colour overrides
 * (with !important to beat React inline styles) instead.
 */
export function GameThemeStyles({ temaId }) {
  const theme = getGameTheme(temaId)
  if (!theme) return null

  // ── Special-case: Merah Putih seasonal theme ──────────────────────────────
  if (temaId === 'tema_merahputih') {
    // Build umbul-umbul SVG tile — 3 baris bendera, repeat-x saja.
    // Named/rgb colors only — no '#' in data URL.
    const flagW = 18, flagH = 22, step = 40
    const ropeYs = [10, 38, 66]   // Y posisi tali per baris
    const rowCount = 11            // bendera per baris
    const rows = ropeYs.map((ry, ri) =>
      Array.from({ length: rowCount }, (_, i) => {
        const cx   = i * step + step / 2
        const even = (i + ri) % 2 === 0
        const fill = even ? 'crimson' : 'rgb(248,250,252)'
        const op   = even ? 0.88 : 0.72
        return `<polygon points="${cx - flagW/2},${ry} ${cx + flagW/2},${ry} ${cx},${ry + flagH}" fill="${fill}" opacity="${op}"/>`
      }).join('')
    )
    const svgH = ropeYs[ropeYs.length - 1] + flagH + 10   // 98
    const svgTile = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="${svgH}">`
      + ropeYs.map(ry =>
          `<line x1="0" y1="${ry}" x2="440" y2="${ry}" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`
        ).join('')
      + rows.join('')
      + `</svg>`
    const encodedSvg = encodeURIComponent(svgTile)

    const css = `
      /* ── Page / root background ───────────────────────────────── */
      html[data-tema="tema_merahputih"] body,
      html[data-tema="tema_merahputih"] #root {
        background: linear-gradient(180deg,#050814 0%,#080d1f 40%,#0d1130 65%,#110018 100%) !important;
      }

      /* ── Umbul-umbul — fixed full-screen tiling background ──────
         Mengisi seluruh area; nav bar atas/bawah punya background
         sendiri yang menutupinya, sehingga hanya terlihat di bagian
         tengah konten (tidak terhalang header).               ── */
      html[data-tema="tema_merahputih"] body::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image: url("data:image/svg+xml,${encodedSvg}");
        background-repeat: repeat-x;
        background-size: 440px ${svgH}px;
        background-position: center center;
      }
      html[data-tema="tema_merahputih"] .home-screen,
      html[data-tema="tema_merahputih"] .zone-screen,
      html[data-tema="tema_merahputih"] .shop-screen,
      html[data-tema="tema_merahputih"] .grades-screen,
      html[data-tema="tema_merahputih"] .profile-screen,
      html[data-tema="tema_merahputih"] .leaderboard-screen,
      html[data-tema="tema_merahputih"] .badges-screen,
      html[data-tema="tema_merahputih"] .communication-screen,
      html[data-tema="tema_merahputih"] .hafalan-screen,
      html[data-tema="tema_merahputih"] .latihan-ujian-screen {
        background: transparent !important;
      }

      /* ── Top bar ──────────────────────────────────────────────── */
      html[data-tema="tema_merahputih"] .tomat-topbar {
        background: rgba(5,8,20,0.82) !important;
        border-bottom-color: rgba(220,38,38,0.30) !important;
        box-shadow: 0 2px 24px rgba(220,38,38,0.08) !important;
      }
      /* accent dots / text inside topbar */
      html[data-tema="tema_merahputih"] .tomat-topbar .accent-text,
      html[data-tema="tema_merahputih"] .tomat-topbar .level-badge {
        color: #fca5a5 !important;
      }

      /* ── Player header (coin / XP bar) ────────────────────────── */
      html[data-tema="tema_merahputih"] .tomat-player-header {
        background: rgba(5,8,20,0.65) !important;
        border-bottom-color: rgba(220,38,38,0.14) !important;
      }

      /* ── Bottom nav ───────────────────────────────────────────── */
      html[data-tema="tema_merahputih"] .appshell-bottom-nav {
        background: rgba(5,8,20,0.97) !important;
        border-top: 1.5px solid rgba(220,38,38,0.28) !important;
        box-shadow: 0 -4px 32px rgba(220,38,38,0.12) !important;
      }
      /* active tab indicator */
      html[data-tema="tema_merahputih"] .appshell-bottom-nav .nav-active,
      html[data-tema="tema_merahputih"] .appshell-bottom-nav [data-active="true"] {
        color: #ef4444 !important;
      }

      /* ── Sidebar (desktop) ────────────────────────────────────── */
      html[data-tema="tema_merahputih"] .tomat-sidebar {
        background: #070410 !important;
        border-right-color: rgba(220,38,38,0.20) !important;
      }

      /* ── Card / panel surfaces — shift to deep crimson-navy ───── */
      html[data-tema="tema_merahputih"] .game-card,
      html[data-tema="tema_merahputih"] .stat-card,
      html[data-tema="tema_merahputih"] .info-card {
        border-color: rgba(220,38,38,0.22) !important;
      }

      /* ── Protect images / sprites inside chrome from tinting ──── */
      html[data-tema="tema_merahputih"] .tomat-topbar img,
      html[data-tema="tema_merahputih"] .tomat-topbar canvas,
      html[data-tema="tema_merahputih"] .tomat-topbar [data-raw-image],
      html[data-tema="tema_merahputih"] .appshell-bottom-nav img,
      html[data-tema="tema_merahputih"] .appshell-bottom-nav canvas,
      html[data-tema="tema_merahputih"] .tomat-sidebar img,
      html[data-tema="tema_merahputih"] .tomat-sidebar canvas {
        filter: none !important;
      }
    `
    return <style>{css}</style>
  }

  // ── Generic themes — filter-based ────────────────────────────────────────
  const f  = theme.filter
  const iv = getInverseFilter(temaId)   // counteract filter for images inside bars

  const bars = [
    `html[data-tema="${temaId}"] .tomat-topbar`,
    `html[data-tema="${temaId}"] .tomat-player-header`,
    `html[data-tema="${temaId}"] .appshell-bottom-nav`,
    `html[data-tema="${temaId}"] .tomat-sidebar`,
  ]

  // Child selectors that should NOT be colour-shifted (photos, frames, sprites)
  const protectedChildren = bars.flatMap(sel => [
    `${sel} img`,
    `${sel} canvas`,
    `${sel} svg`,
    `${sel} [data-raw-image]`,
  ])

  const css = `
    /* Structural nav / chrome — background and border get theme tint */
    ${bars.join(',\n    ')} {
      filter: ${f};
    }

    /* Photos, avatars, sprites inside nav bars — counteract parent filter */
    ${protectedChildren.join(',\n    ')} {
      filter: ${iv} !important;
    }
  `
  return <style>{css}</style>
}

// Static deterministic particle positions (seed-based, no random() at render time)
function seededPositions(count, salt = 0) {
  return Array.from({ length: count }, (_, i) => ({
    x: ((i * 137.508 + salt) % 100).toFixed(2),
    y: ((i * 97.31  + salt) % 100).toFixed(2),
    s: (0.8 + (i % 5) * 0.5).toFixed(1),
    o: (0.15 + (i % 6) * 0.08).toFixed(2),
  }))
}

const STAR_POSITIONS        = seededPositions(70, 0)
const LEAF_POSITIONS        = seededPositions(16, 11)
const EMBER_POSITIONS       = seededPositions(22, 23)
const SNOW_POSITIONS        = seededPositions(28, 37)
const VOID_POSITIONS        = seededPositions(30, 53)
const MERAHPUTIH_POSITIONS  = seededPositions(50, 79)

// Umbul-umbul (triangle flag buntings) along two ropes
const _MP_FLAG_COLS = 11
const _MP_FLAGS_ROW1 = Array.from({ length: _MP_FLAG_COLS }, (_, i) => ({
  x: (i / (_MP_FLAG_COLS - 1)) * 100,
  y: 2 + Math.sin((i / (_MP_FLAG_COLS - 1)) * Math.PI) * 2.5,
  isRed: i % 2 === 0,
}))
const _MP_FLAGS_ROW2 = Array.from({ length: _MP_FLAG_COLS }, (_, i) => ({
  x: (i / (_MP_FLAG_COLS - 1)) * 100,
  y: 7 + Math.sin((i / (_MP_FLAG_COLS - 1)) * Math.PI) * 2,
  isRed: i % 2 !== 0,
}))

import React from 'react'

/**
 * Fixed full-screen particle overlay rendered ABOVE the game (pointer-events:none).
 * Uses mix-blend-mode:screen so particles add light without blocking game content.
 */
export function GameThemeOverlay({ temaId }) {
  const theme = getGameTheme(temaId)
  if (!theme) return null

  const base = {
    position: 'fixed', inset: 0, zIndex: 9998,
    pointerEvents: 'none', overflow: 'hidden',
  }

  if (theme.particles === 'stars') {
    return (
      <div style={base}>
        {STAR_POSITIONS.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.s}px`, height: `${p.s}px`,
            borderRadius: '50%', background: '#fff',
            opacity: p.o,
            mixBlendMode: 'screen',
          }} />
        ))}
        {/* Shooting star */}
        <div style={{ position: 'absolute', top: '18%', left: '55%', width: 80, height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.6),transparent)', transform: 'rotate(-35deg)', opacity: 0.4, mixBlendMode: 'screen' }} />
      </div>
    )
  }

  if (theme.particles === 'leaves') {
    const EMOJIS = ['🍃', '🌿', '🍂']
    return (
      <div style={base}>
        {LEAF_POSITIONS.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: `${10 + (i % 4) * 5}px`,
            opacity: 0.08 + (i % 4) * 0.03,
            transform: `rotate(${(i * 47) % 360}deg)`,
            mixBlendMode: 'screen',
          }}>
            {EMOJIS[i % 3]}
          </div>
        ))}
        {/* Firefly dots */}
        {[12, 34, 56, 71, 85].map((x, i) => (
          <div key={`ff${i}`} style={{
            position: 'absolute', left: `${x}%`, top: `${30 + i * 10}%`,
            width: 3, height: 3, borderRadius: '50%',
            background: '#4ade80', boxShadow: '0 0 6px #4ade80',
            opacity: 0.35, mixBlendMode: 'screen',
          }} />
        ))}
      </div>
    )
  }

  if (theme.particles === 'embers') {
    return (
      <div style={base}>
        {EMBER_POSITIONS.map((p, i) => {
          const colors = ['#f59e0b', '#ef4444', '#f97316']
          const c = colors[i % 3]
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${1.5 + (i % 3)}px`, height: `${1.5 + (i % 3)}px`,
              borderRadius: '50%', background: c,
              boxShadow: `0 0 ${2 + (i % 3) * 2}px ${c}`,
              opacity: +p.o + 0.05,
              mixBlendMode: 'screen',
            }} />
          )
        })}
      </div>
    )
  }

  if (theme.particles === 'snow') {
    return (
      <div style={base}>
        {SNOW_POSITIONS.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: `${8 + (i % 4) * 4}px`,
            opacity: 0.05 + (i % 5) * 0.025,
            color: '#e0f2fe',
            mixBlendMode: 'screen',
          }}>❄</div>
        ))}
        {/* Aurora bands */}
        {[15, 35].map((t, i) => (
          <div key={`ab${i}`} style={{
            position: 'absolute', left: 0, right: 0, top: `${t}%`,
            height: 1, opacity: 0.06,
            background: 'linear-gradient(90deg,transparent 5%,#7dd3fc 40%,#e0f2fe 55%,#7dd3fc 75%,transparent 95%)',
            mixBlendMode: 'screen',
          }} />
        ))}
      </div>
    )
  }

  if (theme.particles === 'merahputih') {
    const red   = '#DC2626'
    const redGlow = 'rgba(220,38,38,0.7)'
    // z-index 1 — sits behind all navigation chrome (topbar z-30, bottom-nav z-50, etc.)
    const mpBase = { ...base, zIndex: 1 }
    return (
      <div style={mpBase}>

        {/* Full-screen background tint — shifts dark navy toward midnight crimson */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(12,2,2,0.18) 0%,rgba(6,0,10,0.10) 60%,rgba(20,0,4,0.20) 100%)',
        }} />

        {/* Night stars — straight opacity, no blendMode so they're visible */}
        {MERAHPUTIH_POSITIONS.slice(0, 30).map((p, i) => (
          <div key={`mp-star-${i}`} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.s}px`, height: `${p.s}px`,
            borderRadius: '50%', background: '#fff',
            opacity: +p.o * 0.6,
          }} />
        ))}

        {/* Firework glow halos — blurred red/white light blooms */}
        {[
          { x: 14, y: 10, r: 80,  c: '#DC2626', op: 0.22 },
          { x: 76, y:  7, r: 100, c: '#fff',     op: 0.10 },
          { x: 48, y: 18, r: 70,  c: '#DC2626', op: 0.18 },
          { x: 89, y: 24, r: 60,  c: '#fff',     op: 0.08 },
          { x: 30, y: 28, r: 50,  c: '#DC2626', op: 0.14 },
        ].map((b, i) => (
          <div key={`mp-halo-${i}`} style={{
            position: 'absolute',
            left: `${b.x}%`, top: `${b.y}%`,
            width: `${b.r}px`, height: `${b.r}px`,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            background: b.c,
            filter: 'blur(28px)',
            opacity: b.op,
          }} />
        ))}

        {/* Firework burst dots — red & white, with glow */}
        {MERAHPUTIH_POSITIONS.slice(30).map((p, i) => {
          const isRed = i % 2 === 0
          const c     = isRed ? red : '#F8FAFC'
          const glow  = isRed ? redGlow : 'rgba(248,250,252,0.55)'
          return (
            <div key={`mp-dot-${i}`} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.s}px`, height: `${p.s}px`,
              borderRadius: '50%', background: c,
              boxShadow: `0 0 ${+p.s * 4}px ${glow}`,
              opacity: +p.o * 0.7,
            }} />
          )
        })}

        {/* Confetti slivers — red & white */}
        {Array.from({ length: 24 }, (_, i) => ({
          left:  ((i * 121.1 + 9) % 100).toFixed(1),
          top:   ((i * 77.3  + 5) % 100).toFixed(1),
          w: 5 + (i % 3) * 2,
          h: 2 + (i % 2),
          rot: ((i * 41) % 180 - 90),
          color: i % 2 === 0 ? red : 'rgba(248,250,252,0.75)',
        })).map((c, i) => (
          <div key={`mp-conf-${i}`} style={{
            position: 'absolute',
            left: `${c.left}%`, top: `${c.top}%`,
            width: `${c.w}px`, height: `${c.h}px`,
            background: c.color, borderRadius: 1,
            transform: `rotate(${c.rot}deg)`,
            opacity: 0.12 + (i % 5) * 0.04,
          }} />
        ))}

        {/* Red glow line along top — like a celebration banner highlight */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent 5%,rgba(220,38,38,0.6) 30%,rgba(248,250,252,0.4) 50%,rgba(220,38,38,0.6) 70%,transparent 95%)',
        }} />

        {/* Horizon ambient glow — celebration lights from below */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '12%',
          background: 'linear-gradient(0deg,rgba(127,29,29,0.18) 0%,transparent 100%)',
        }} />
      </div>
    )
  }

  if (theme.particles === 'void') {
    return (
      <div style={base}>
        {VOID_POSITIONS.map((p, i) => {
          const colors = ['#a855f7', '#ec4899', 'rgba(255,255,255,0.5)']
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.s}px`, height: `${p.s}px`,
              borderRadius: '50%', background: colors[i % 3],
              opacity: +p.o * 0.6,
              mixBlendMode: 'screen',
            }} />
          )
        })}
        {/* Void scanlines */}
        {[10, 28, 46, 64, 82].map((t, i) => (
          <div key={`sl${i}`} style={{
            position: 'absolute', left: 0, right: 0, top: `${t}%`,
            height: 1, background: '#fff', opacity: 0.012,
          }} />
        ))}
      </div>
    )
  }

  return null
}
