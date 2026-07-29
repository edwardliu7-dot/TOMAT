// ── TomiSprite — sprite-sheet Tomi animation ─────────────────────────────────
// Uses the 1536×1024 sprite sheet at /tomi-sprite.png
// Rows: IDLE(0) WALK(1) HAPPY(2) HUNGRY(3) SLEEPING(4) DEAD(5)
import React, { useState, useEffect, useRef } from 'react'

// ── Sprite sheet measurements ────────────────────────────────────────────────
const SHEET_W      = 1536
const SHEET_H      = 1024
const LABEL_OFFSET = 112   // px: left-side label column width
const FRAME_W      = 237   // px: one frame width
const FRAME_H      = 171   // px: one frame height  (SHEET_H / 6)

// ── State config: row index, frame count, playback speed ────────────────────
const STATE_CFG = {
  idle:     { row: 0, frames: 5, fps: 5  },
  walk:     { row: 1, frames: 6, fps: 9  },
  happy:    { row: 2, frames: 6, fps: 9  },
  hungry:   { row: 3, frames: 5, fps: 4  },
  sleeping: { row: 4, frames: 5, fps: 3  },
  dead:     { row: 5, frames: 5, fps: 4  },
}

// ── Skin filters (golden is the base art, others tinted) ─────────────────────
const SKIN_FILTER = {
  golden:          'none',
  pet_skin_silver: 'grayscale(0.75) brightness(1.25) sepia(0.15)',
  pet_skin_cosmic: 'hue-rotate(200deg) saturate(2.2) brightness(1.15)',
  pet_skin_void:   'hue-rotate(285deg) saturate(1.4) brightness(0.55) contrast(1.3)',
}

export default function TomiSprite({ state = 'idle', skinId = 'golden', size = 100 }) {
  const cfg      = STATE_CFG[state] || STATE_CFG.idle
  const frameRef = useRef(0)
  const [frame, setFrame] = useState(0)

  // Reset to frame 0 on state change
  useEffect(() => {
    frameRef.current = 0
    setFrame(0)
  }, [state])

  // Cycle frames at cfg.fps
  useEffect(() => {
    const ms = Math.round(1000 / cfg.fps)
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % cfg.frames
      setFrame(frameRef.current)
    }, ms)
    return () => clearInterval(id)
  }, [cfg.fps, cfg.frames])

  // ── Background-position math ─────────────────────────────────────────────
  // Scale so frame height == size (square crop, frame centered horizontally)
  const scale  = size / FRAME_H
  const bgW    = SHEET_W * scale
  const bgH    = SHEET_H * scale

  // Center each frame horizontally inside the square container
  const bgX = -(LABEL_OFFSET + frame * FRAME_W + FRAME_W / 2) * scale + size / 2
  const bgY = -(cfg.row * FRAME_H * scale)   // = -(cfg.row * size)

  const filter = SKIN_FILTER[skinId] || 'none'

  return (
    <div style={{
      width:              size,
      height:             size,
      overflow:           'hidden',
      backgroundImage:    'url(/tomi-sprite.png)',
      backgroundSize:     `${bgW}px ${bgH}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundRepeat:   'no-repeat',
      imageRendering:     'auto',
      filter,
    }} />
  )
}

// Re-export animation helpers so FloatingPet / PetSVG callers stay unchanged
export { PET_CSS, STATE_ANIMS } from './TomiSVG'
