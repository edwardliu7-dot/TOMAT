// ── KomodihSprite — sprite-sheet renderer untuk pet KomoDIH ─────────────────
// Sheet: 768×768, 6 cols × 6 rows, 128×128 per cell.
// Rows: IDLE(0,5f) WALK(1,6f) HAPPY(2,6f) HUNGRY(3,5f) SLEEPING(4,5f) DEAD(5,5f)
import React, { useMemo } from 'react'

const SHEET_W = 768
const SHEET_H = 768
const CELL_W = 128
const CELL_H = 128

const STATE_CFG = {
  idle: { row: 0, frames: 5, fps: 5 },
  walk: { row: 1, frames: 6, fps: 9 },
  happy: { row: 2, frames: 6, fps: 9 },
  hungry: { row: 3, frames: 5, fps: 4 },
  sleeping: { row: 4, frames: 5, fps: 3 },
  dead: { row: 5, frames: 5, fps: 4 },
}

const _injected = new Set()

function ensureKeyframes(state, size, cfg) {
  const key = `komodih-spr-${state}-${size}`
  if (_injected.has(key) || typeof document === 'undefined') return key

  const scale = size / CELL_H
  const startX = -(CELL_W / 2) * scale + size / 2
  const totalW = cfg.frames * CELL_W * scale
  const style = document.createElement('style')
  style.id = key
  style.textContent = `@keyframes ${key} {
    from { background-position-x: ${startX.toFixed(2)}px; }
    to { background-position-x: ${(startX - totalW).toFixed(2)}px; }
  }`
  document.head.appendChild(style)
  _injected.add(key)
  return key
}

export default function KomodihSprite({ state = 'idle', size = 100 }) {
  const cfg = STATE_CFG[state] || STATE_CFG.idle
  const animName = useMemo(() => ensureKeyframes(state, size, cfg), [state, size, cfg])
  const scale = size / CELL_H
  const duration = (cfg.frames / cfg.fps).toFixed(3)

  return (
    <div
      data-raw-image=""
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        backgroundImage: 'url(/komodih.png)',
        backgroundSize: `${(SHEET_W * scale).toFixed(1)}px ${(SHEET_H * scale).toFixed(1)}px`,
        backgroundPositionY: `${-(cfg.row * CELL_H * scale).toFixed(2)}px`,
        backgroundRepeat: 'no-repeat',
        animation: `${animName} ${duration}s steps(${cfg.frames}) infinite`,
        willChange: 'background-position-x',
        imageRendering: 'auto',
      }}
    />
  )
}