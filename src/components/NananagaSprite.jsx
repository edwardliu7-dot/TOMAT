// ── NananagaSprite — sprite-sheet renderer untuk pet Nananaga ────────────────
// Sprite: /nananaga-sprite.png — 768×768, 6 cols × 6 rows, 128×128 per cell
// Rows: IDLE(0,5f) WALK(1,6f) HAPPY(2,6f) HUNGRY(3,5f) SLEEPING(4,5f) DEAD(5,5f)
import React, { useMemo } from 'react'

const SHEET_W = 768
const SHEET_H = 768
const CELL_W  = 128
const CELL_H  = 128

const STATE_CFG = {
  idle:     { row: 0, frames: 5, fps: 5 },
  walk:     { row: 1, frames: 6, fps: 9 },
  happy:    { row: 2, frames: 6, fps: 9 },
  hungry:   { row: 3, frames: 5, fps: 4 },
  sleeping: { row: 4, frames: 5, fps: 3 },
  dead:     { row: 5, frames: 5, fps: 4 },
}

// CSS filter per variant — base sprite is natural green Nananaga
const SKIN_FILTER = {
  pet_nananaga:       'none',
  pet_nananaga_merah: 'hue-rotate(240deg) saturate(1.5) brightness(1.05)',  // green → red
  pet_nananaga_es:    'hue-rotate(80deg) saturate(0.85) brightness(1.2)',   // green → ice blue
}

const _injected = new Set()

function ensureKeyframes(state, size, cfg) {
  const key = `nananaga-spr-${state}-${size}`
  if (_injected.has(key) || typeof document === 'undefined') return key

  const scale  = size / CELL_H
  const startX = -(CELL_W / 2) * scale + size / 2
  const totalW = cfg.frames * CELL_W * scale

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

export default function NananagaSprite({ state = 'idle', variant = 'pet_nananaga', size = 100 }) {
  const cfg      = STATE_CFG[state] || STATE_CFG.idle
  const animName = useMemo(() => ensureKeyframes(state, size, cfg), [state, size, cfg])

  const scale    = size / CELL_H
  const bgW      = SHEET_W * scale
  const bgH      = SHEET_H * scale
  const bgY      = -(cfg.row * CELL_H * scale)
  const duration = (cfg.frames / cfg.fps).toFixed(3)
  const filter   = SKIN_FILTER[variant] || 'none'

  return (
    <div style={{
      width:               size,
      height:              size,
      flexShrink:          0,
      overflow:            'hidden',
      backgroundImage:     'url(/nananaga-sprite.png)',
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
