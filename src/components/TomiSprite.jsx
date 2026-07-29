// ── TomiSprite — sprite-sheet Tomi animation ─────────────────────────────────
// Uses /tomi-sprite.png (RGBA, transparent background)
// Rows: IDLE(0) WALK(1) HAPPY(2) HUNGRY(3) SLEEPING(4) DEAD(5)
// Animation: pure CSS steps() — no JS per-frame, runs on compositor thread
import React, { useMemo, useEffect } from 'react'

// ── Sprite sheet measurements ────────────────────────────────────────────────
const SHEET_W      = 1536
const SHEET_H      = 1024
const LABEL_OFFSET = 112   // px: left-side label column width
const FRAME_W      = 237   // px: one frame width
const FRAME_H      = 171   // px: one frame height (SHEET_H / 6 rows)

// ── State config: row index, frame count, playback speed ────────────────────
const STATE_CFG = {
  idle:     { row: 0, frames: 5, fps: 5  },
  walk:     { row: 1, frames: 6, fps: 9  },
  happy:    { row: 2, frames: 6, fps: 9  },
  hungry:   { row: 3, frames: 5, fps: 4  },
  sleeping: { row: 4, frames: 5, fps: 3  },
  dead:     { row: 5, frames: 5, fps: 4  },
}

// ── Skin CSS filters ─────────────────────────────────────────────────────────
const SKIN_FILTER = {
  golden:          'none',
  pet_skin_silver: 'grayscale(0.75) brightness(1.25) sepia(0.15)',
  pet_skin_cosmic: 'hue-rotate(200deg) saturate(2.2) brightness(1.15)',
  pet_skin_void:   'hue-rotate(285deg) saturate(1.4) brightness(0.55) contrast(1.3)',
}

// ── Keyframe cache: injected once per (state, size) pair ─────────────────────
const _injected = new Set()

function ensureKeyframes(state, size, cfg) {
  const key = `tomi-sprite-${state}-${size}`
  if (_injected.has(key)) return key

  const scale    = size / FRAME_H
  // background-position-x at frame 0: centre the first frame in the container
  const startX   = -(LABEL_OFFSET + FRAME_W / 2) * scale + size / 2
  // total horizontal travel across all frames
  const totalW   = cfg.frames * FRAME_W * scale

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

  // Inject keyframes if not already done (SSR-safe: runs in useEffect on server)
  const animName = useMemo(() => {
    if (typeof document !== 'undefined') return ensureKeyframes(state, size, cfg)
    return `tomi-sprite-${state}-${size}`
  }, [state, size, cfg])

  const scale    = size / FRAME_H
  const bgW      = SHEET_W * scale
  const bgH      = SHEET_H * scale
  const bgY      = -(cfg.row * FRAME_H * scale)
  const duration = (cfg.frames / cfg.fps).toFixed(3)
  const filter   = SKIN_FILTER[skinId] || 'none'

  return (
    <div style={{
      width:               size,
      height:              size,
      flexShrink:          0,
      overflow:            'hidden',
      backgroundImage:     'url(/tomi-sprite.png)',
      backgroundSize:      `${bgW.toFixed(1)}px ${bgH.toFixed(1)}px`,
      backgroundPositionY: `${bgY.toFixed(2)}px`,
      backgroundRepeat:    'no-repeat',
      animation:           `${animName} ${duration}s steps(${cfg.frames}) infinite`,
      willChange:          'background-position-x',
      imageRendering:      'auto',
      filter,
    }} />
  )
}

// Re-export animation helpers so FloatingPet / PetSVG callers stay unchanged
export { PET_CSS, STATE_ANIMS } from './TomiSVG'
