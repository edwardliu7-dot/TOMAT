// ── FloatingPet — Tomi wanders the screen and follows the cursor ─────────────
import React, { useState, useEffect, useRef, useCallback } from 'react'
import TomiSVG, { PET_CSS, STATE_ANIMS } from './TomiSVG'
import { usePet } from '../PetContext'
import { useAuth } from '../AuthContext'

const PET_SIZE   = 76      // px
const TICK_MS    = 40      // ~25 fps
const MAX_SPEED  = 0.022   // max fraction-of-screenWidth per tick
const ACCEL      = 0.0018  // acceleration toward target per tick
const FRICTION   = 0.82    // velocity multiplied each tick when past target
const COAST_FRIC = 0.96    // gentle friction when gliding (not near target)

export default function FloatingPet() {
  const { user } = useAuth()
  const { pet }  = usePet()
  if (!user || user.role !== 'siswa') return null
  return <PetWidget pet={pet} />
}

function PetWidget({ pet }) {
  // ── position state (fraction of screen width, 0–1) ───────────────────────
  const [xFrac,   setXFrac]   = useState(0.15)
  const [dir,     setDir]     = useState(1)        // 1=right, -1=left
  const [petState, setPetState] = useState('walk')
  const [showBubble, setShowBubble] = useState(false)

  // refs that don't need to re-render
  const velRef       = useRef(0)               // current velocity (frac/tick)
  const targetRef    = useRef(0.5)             // target x fraction
  const cursorRef    = useRef(null)            // { x: frac, active: bool }
  const xRef         = useRef(0.15)            // mirror of xFrac for tick closure
  const pauseRef     = useRef(null)            // setTimeout id for pause state
  const wanderRef    = useRef(null)            // setTimeout id for wander retarget
  const overrideRef  = useRef(null)            // interaction state override timer
  const overrideStateRef = useRef(null)        // the override state string
  const tickRef      = useRef(null)

  const MAX_X = () => 1 - (PET_SIZE + 16) / window.innerWidth

  // ── Track cursor / touch position ────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) / window.innerWidth
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) / window.innerHeight
      // Only attract when cursor is in bottom 35% of screen
      cursorRef.current = { x: cx, active: cy > 0.65 }
    }
    const onLeave = () => { cursorRef.current = null }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Random wander target ──────────────────────────────────────────────────
  const scheduleWander = useCallback(() => {
    if (wanderRef.current) clearTimeout(wanderRef.current)
    const delay = 2500 + Math.random() * 5000  // wander every 2.5–7.5s
    wanderRef.current = setTimeout(() => {
      // Pick a new random target, avoiding corners (<5% and >95%)
      const newTarget = 0.05 + Math.random() * 0.88
      targetRef.current = Math.min(newTarget, MAX_X())
      // Occasionally do a pause (idle) before walking again
      if (Math.random() < 0.35) {
        schedulePause()
      }
      scheduleWander()
    }, delay)
  }, [])

  const schedulePause = useCallback(() => {
    if (pauseRef.current) clearTimeout(pauseRef.current)
    if (overrideStateRef.current) return   // don't overwrite interaction override
    overrideStateRef.current = 'idle'
    setPetState('idle')
    velRef.current *= 0.3   // bleed off speed
    const pauseMs = 800 + Math.random() * 2200
    pauseRef.current = setTimeout(() => {
      overrideStateRef.current = null
      pauseRef.current = null
    }, pauseMs)
  }, [])

  useEffect(() => {
    scheduleWander()
    return () => {
      clearTimeout(wanderRef.current)
      clearTimeout(pauseRef.current)
    }
  }, [scheduleWander])

  // ── Main tick loop ────────────────────────────────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const cursor  = cursorRef.current
      const maxX    = MAX_X()
      const pausing = !!overrideStateRef.current

      // Determine effective target x
      let tx = targetRef.current
      let cursorNear = false
      if (cursor?.active) {
        // Cursor attracts with a "gravity well" — stronger when closer
        const dist = Math.abs(cursor.x - xRef.current)
        if (dist < 0.25) {
          cursorNear = true
          // Blend: the closer cursor is, the more it overrides wander target
          const blend = 1 - dist / 0.25
          tx = tx * (1 - blend * 0.85) + cursor.x * (blend * 0.85)
        }
      }

      // Clamp target
      tx = Math.max(0.01, Math.min(maxX, tx))

      if (!pausing) {
        const diff    = tx - xRef.current
        const absDiff = Math.abs(diff)

        if (absDiff > 0.005) {
          // Accelerate toward target
          const accelDir = diff > 0 ? 1 : -1
          velRef.current += accelDir * ACCEL
          // Cap speed
          velRef.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velRef.current))
          // Friction as we near target
          if (absDiff < 0.08) velRef.current *= FRICTION
          else                velRef.current *= COAST_FRIC
        } else {
          // Arrived — stop and choose: idle or keep wandering
          velRef.current *= 0.7
          if (Math.abs(velRef.current) < 0.0008 && Math.random() < 0.04) {
            schedulePause()
          }
        }
      } else {
        // Pause mode — bleed velocity
        velRef.current *= 0.75
      }

      // Jitter: tiny random nudge each tick for organic wobble (reduced when pausing)
      if (!pausing) velRef.current += (Math.random() - 0.5) * 0.0006

      // Apply velocity
      let nextX = xRef.current + velRef.current
      if (nextX >= maxX) { nextX = maxX; velRef.current *= -0.3 }
      if (nextX <= 0)    { nextX = 0;    velRef.current *= -0.3 }

      xRef.current = nextX
      setXFrac(nextX)

      // Update facing direction from velocity (ignore tiny jiggles)
      if (Math.abs(velRef.current) > 0.001) {
        setDir(velRef.current > 0 ? 1 : -1)
      }

      // Update animation state
      if (!overrideStateRef.current) {
        const baseState = pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'walk'
        // If barely moving, show idle
        const effState = (!pausing && Math.abs(velRef.current) < 0.0015) ? 'idle'
          : cursorNear && !pet.isDead && !pet.isStarving ? 'walk'
          : baseState
        setPetState(effState)
      }
    }, TICK_MS)
    return () => clearInterval(tickRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.isDead, pet.isStarving, schedulePause])

  // ── Hunger bubble ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pet.isStarving && !pet.isDead) { setShowBubble(false); return }
    setShowBubble(true)
    const t = setInterval(() => setShowBubble(v => !v), 8000)
    return () => clearInterval(t)
  }, [pet.isStarving, pet.isDead])

  // ── Touch / click interactions ────────────────────────────────────────────
  const longPressRef = useRef(null)

  const triggerInteraction = useCallback((s, ms = 1800) => {
    if (overrideRef.current) clearTimeout(overrideRef.current)
    overrideStateRef.current = s
    setPetState(s)
    velRef.current *= 0.2
    overrideRef.current = setTimeout(() => {
      overrideRef.current = null
      overrideStateRef.current = null
    }, ms)
  }, [])

  const onPointerDown = useCallback((e) => {
    e.stopPropagation()
    longPressRef.current = setTimeout(() => {
      longPressRef.current = null
      triggerInteraction('sleeping', 5000)
    }, 600)
  }, [triggerInteraction])

  const onPointerUp = useCallback((e) => {
    e.stopPropagation()
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
      // Short tap → happy; also nudge toward cursor
      triggerInteraction('happy', 1800)
    }
  }, [triggerInteraction])

  const mirrorX = dir === -1
  const anim    = STATE_ANIMS[petState] || STATE_ANIMS.idle

  return (
    <>
      <style>{PET_CSS}{FLOAT_CSS}</style>
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          position:          'fixed',
          bottom:            16,
          left:              `calc(${xFrac * 100}vw)`,
          width:             PET_SIZE,
          zIndex:            9000,
          cursor:            'pointer',
          userSelect:        'none',
          WebkitUserSelect:  'none',
          touchAction:       'none',
          willChange:        'left',
          // CSS transition removed — JS drives position directly for smooth organic feel
        }}
      >
        {/* Hunger / dead bubble */}
        {showBubble && (
          <div style={{
            position:   'absolute',
            bottom:     PET_SIZE + 6,
            left:       '50%',
            transform:  'translateX(-50%)',
            whiteSpace: 'nowrap',
            background: pet.isDead ? 'rgba(239,68,68,0.92)' : 'rgba(251,191,36,0.92)',
            color:      '#fff',
            fontSize:   11,
            fontWeight: 800,
            padding:    '4px 10px',
            borderRadius: 20,
            boxShadow:  '0 2px 10px rgba(0,0,0,0.5)',
            animation:  'tomi-bubble-pop 0.3s ease-out',
          }}>
            {pet.isDead ? '💀 Tomi mati! Beri makan!' : '🍖 Tomi lapar!'}
          </div>
        )}

        {/* Ground shadow — squishes with speed */}
        <div style={{
          position:     'absolute',
          bottom:       -4,
          left:         '50%',
          transform:    `translateX(-50%) scaleX(${1 + Math.min(Math.abs(velRef.current) / MAX_SPEED, 1) * 0.4})`,
          width:        44,
          height:       9,
          borderRadius: '50%',
          background:   'rgba(0,0,0,0.22)',
          filter:       'blur(3px)',
        }} />

        {/* Tomi */}
        <div style={{
          animation:       anim,
          transformOrigin: 'center bottom',
          transform:       mirrorX ? 'scaleX(-1)' : 'scaleX(1)',
          transition:      'transform 0.12s ease',
          filter:          pet.isDead ? 'saturate(0.3) brightness(0.7)' : 'none',
        }}>
          <TomiSVG state={petState} skinId={pet.skin} size={PET_SIZE} />
        </div>
      </div>
    </>
  )
}

const FLOAT_CSS = `
@keyframes tomi-bubble-pop {
  0%   { transform: translateX(-50%) scale(0.5); opacity: 0; }
  70%  { transform: translateX(-50%) scale(1.1); opacity: 1; }
  100% { transform: translateX(-50%) scale(1);   opacity: 1; }
}
`
