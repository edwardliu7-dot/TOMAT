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
 * Used to cancel the global filter on image/sprite elements so they
 * keep their original colours while UI backgrounds stay themed.
 *
 * Inversion rules:
 *   hue-rotate(Xdeg)  → hue-rotate(-Xdeg)
 *   saturate(S)       → saturate(1/S)
 *   brightness(B)     → brightness(1/B)
 *   contrast(C)       → contrast(1/C)
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

// Static deterministic particle positions (seed-based, no random() at render time)
function seededPositions(count, salt = 0) {
  return Array.from({ length: count }, (_, i) => ({
    x: ((i * 137.508 + salt) % 100).toFixed(2),
    y: ((i * 97.31  + salt) % 100).toFixed(2),
    s: (0.8 + (i % 5) * 0.5).toFixed(1),
    o: (0.15 + (i % 6) * 0.08).toFixed(2),
  }))
}

const STAR_POSITIONS  = seededPositions(70, 0)
const LEAF_POSITIONS  = seededPositions(16, 11)
const EMBER_POSITIONS = seededPositions(22, 23)
const SNOW_POSITIONS  = seededPositions(28, 37)
const VOID_POSITIONS  = seededPositions(30, 53)

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
