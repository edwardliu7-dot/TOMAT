// ── TomiSprite — sprite-sheet Tomi animation ─────────────────────────────────
// Uses /tomi-sprite.png — clean rebuilt sheet, RGBA transparent background
// Grid: 6 cols × 6 rows, each cell 260×175 px, no label column
// Rows: IDLE(0) WALK(1) HAPPY(2) HUNGRY(3) SLEEPING(4) DEAD(5)
// Animation: pure CSS steps() — zero JS per frame, runs on compositor thread
import React, { useMemo } from 'react'

// ── Sprite sheet measurements ────────────────────────────────────────────────
const SHEET_W = 768
const SHEET_H = 768
const CELL_W  = 128    // px per frame column
const CELL_H  = 128    // px per frame row

// ── State config: row index, frame count, playback speed ────────────────────
const STATE_CFG = {
  idle:     { row: 0, frames: 5, fps: 5  },
  walk:     { row: 1, frames: 6, fps: 9  },
  happy:    { row: 2, frames: 6, fps: 9  },
  hungry:   { row: 3, frames: 5, fps: 4  },
  sleeping: { row: 4, frames: 5, fps: 3  },
  dead:     { row: 5, frames: 5, fps: 4  },
}

// ── Skin → sprite sheet mapping ──────────────────────────────────────────────
const SKIN_SPRITE = {
  golden:          '/tomi-sprite.png',
  pet_skin_silver: '/tomi-silver-fluff.png',
  pet_skin_cosmic: '/tomi-cosmic-fluff.png',
  pet_skin_void:   '/tomi-void-emperor.png',
}


// ── Keyframe injection cache ─────────────────────────────────────────────────
// One @keyframes per (state, size) pair — injected once, reused forever.
const _injected = new Set()

function ensureKeyframes(state, size, cfg) {
  const key = `tomi-spr-${state}-${size}`
  if (_injected.has(key) || typeof document === 'undefined') return key

  const scale  = size / CELL_H
  // background-position-x at frame 0: cell 0 starts at x=0, centre at CELL_W/2
  const startX  = -(CELL_W / 2) * scale + size / 2
  const totalW  = cfg.frames * CELL_W * scale   // total horizontal travel

  const css = `@keyframes ${key} {
  from { background-position-x: ${startX.toFixed(2)}px; }
  to   { background-position-x: ${(startX - totalW).toFixed(2)}px; }
}`
  const el = document.createElement('style')
  el.id = key
  el.textContent = css
  document.head.appendChild(el)
  _injected.add(key)
  return key
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TomiSprite({ state = 'idle', skinId = 'golden', size = 100 }) {
  const cfg = STATE_CFG[state] || STATE_CFG.idle

  const animName = useMemo(
    () => ensureKeyframes(state, size, cfg),
    [state, size, cfg],
  )

  const scale    = size / CELL_H
  const bgW      = SHEET_W * scale
  const bgH      = SHEET_H * scale
  const bgY      = -(cfg.row * CELL_H * scale)
  const duration = (cfg.frames / cfg.fps).toFixed(3)
  const sprite   = SKIN_SPRITE[skinId] || SKIN_SPRITE.golden

  return (
    <div data-raw-image="" style={{
      width:               size,
      height:              size,
      flexShrink:          0,
      overflow:            'hidden',
      backgroundImage:     `url(${sprite})`,
      backgroundSize:      `${bgW.toFixed(1)}px ${bgH.toFixed(1)}px`,
      backgroundPositionY: `${bgY.toFixed(2)}px`,
      backgroundRepeat:    'no-repeat',
      animation:           `${animName} ${duration}s steps(${cfg.frames}) infinite`,
      willChange:          'background-position-x',
      imageRendering:      'auto',
    }} />
  )
}

// Re-export animation helpers so FloatingPet / PetSVG callers stay unchanged
export { PET_CSS, STATE_ANIMS } from './TomiSVG'
