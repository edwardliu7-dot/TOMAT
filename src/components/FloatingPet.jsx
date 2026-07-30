// ── FloatingPet — Pet wanders the full screen in 2D, follows cursor when happy ──
import React, { useState, useEffect, useRef, useCallback } from 'react'
import PetSVG, { PET_CSS, STATE_ANIMS, getPetName } from './PetSVG'
import { usePet } from '../PetContext'
import { useAuth } from '../AuthContext'
import { playSfx, skinToSfxKey } from '../sfx'

const PET_SIZE        = 76
const TICK_MS         = 40      // ~25 fps
const MAX_SPEED       = 0.016   // normal max fraction/tick
const HAPPY_SPEED     = 0.060   // fast chase when happy
const HUNGRY_MULT     = 0.38    // speed multiplier when starving
const ACCEL           = 0.0014
const HAPPY_ACCEL     = 0.0070
const FRICTION        = 0.80
const COAST_FRIC      = 0.95
const POS_KEY         = 'tomat_pet_home_pos'  // localStorage — persists dead/sleeping pos

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function loadSavedPos() {
  try { const p = JSON.parse(localStorage.getItem(POS_KEY)); if (p?.x != null) return p } catch {}
  return null
}
function savePos(x, y) {
  try { localStorage.setItem(POS_KEY, JSON.stringify({ x, y })) } catch {}
}

export default function FloatingPet({ onHungryClick }) {
  const { user } = useAuth()
  const { pet }  = usePet()
  if (!user || user.role !== 'siswa') return null
  return <PetWidget pet={pet} onHungryClick={onHungryClick} />
}

function PetWidget({ pet, onHungryClick }) {
  // ── Compute safe bounds ───────────────────────────────────────────────────
  const maxX = () => clamp(1 - (PET_SIZE + 8)  / window.innerWidth,  0.5, 0.97)
  const maxY = () => clamp(1 - (PET_SIZE + 16) / window.innerHeight, 0.5, 0.94)
  const minY = 0.04

  // ── Position state ────────────────────────────────────────────────────────
  const initPos = loadSavedPos()
  const [xFrac,     setXFrac]     = useState(initPos?.x ?? 0.15)
  const [yFrac,     setYFrac]     = useState(initPos?.y ?? 0.72)
  const [dir,       setDir]       = useState(1)
  const [petState,  setPetState]  = useState('walk')
  const [showBubble,setShowBubble]= useState(false)

  const xRef    = useRef(initPos?.x ?? 0.15)
  const yRef    = useRef(initPos?.y ?? 0.72)
  const velX    = useRef(0)
  const velY    = useRef(0)
  const tgtX    = useRef(0.50)
  const tgtY    = useRef(0.70)

  const cursorRef        = useRef(null)   // { x, y } normalised to screen
  const pauseRef         = useRef(null)
  const wanderRef        = useRef(null)
  const overrideRef      = useRef(null)
  const overrideStateRef = useRef(null)
  const lockedRef        = useRef(!!pet.isDead)  // no movement when true
  const petIsDeadRef     = useRef(pet.isDead)
  const tickRef          = useRef(null)

  // Keep dead-flag ref current
  useEffect(() => {
    petIsDeadRef.current = pet.isDead
    if (pet.isDead) {
      lockedRef.current = true
      velX.current = 0
      velY.current = 0
      savePos(xRef.current, yRef.current)
    } else if (!overrideStateRef.current) {
      lockedRef.current = false
    }
  }, [pet.isDead])

  // ── Track cursor / touch (anywhere on screen) ─────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) / window.innerWidth
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) / window.innerHeight
      cursorRef.current = { x: cx, y: cy }
    }
    const onLeave = () => { cursorRef.current = null }
    window.addEventListener('mousemove',  onMove,  { passive: true })
    window.addEventListener('touchmove',  onMove,  { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Pause helper ──────────────────────────────────────────────────────────
  const schedulePause = useCallback(() => {
    if (pauseRef.current) clearTimeout(pauseRef.current)
    if (overrideStateRef.current) return
    overrideStateRef.current = 'idle'
    setPetState('idle')
    velX.current *= 0.3
    velY.current *= 0.3
    pauseRef.current = setTimeout(() => {
      overrideStateRef.current = null
      pauseRef.current = null
    }, 800 + Math.random() * 2200)
  }, [])

  // ── Random wander scheduler ───────────────────────────────────────────────
  const scheduleWander = useCallback(() => {
    if (wanderRef.current) clearTimeout(wanderRef.current)
    wanderRef.current = setTimeout(() => {
      if (!lockedRef.current) {
        tgtX.current = clamp(0.05 + Math.random() * 0.88, 0.01, maxX())
        tgtY.current = clamp(0.10 + Math.random() * 0.78, minY, maxY())
        if (Math.random() < 0.35) schedulePause()
      }
      scheduleWander()
    }, 2500 + Math.random() * 5000)
  }, [schedulePause]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scheduleWander()
    return () => { clearTimeout(wanderRef.current); clearTimeout(pauseRef.current) }
  }, [scheduleWander])

  // ── Main tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      // Locked (dead / sleeping) — bleed velocity, no move
      if (lockedRef.current) {
        velX.current *= 0.5
        velY.current *= 0.5
        return
      }

      const cursor    = cursorRef.current
      const isHappy   = overrideStateRef.current === 'happy'
      const isSleeping= overrideStateRef.current === 'sleeping'
      const pausing   = !!overrideStateRef.current && !isHappy

      if (isSleeping) {
        velX.current *= 0.6
        velY.current *= 0.6
        return
      }

      const mxX = maxX()
      const mxY = maxY()
      const hungry = pet.isStarving

      // ── Target selection ────────────────────────────────────────────────
      let tx = tgtX.current
      let ty = tgtY.current
      let cursorActive = false

      if (isHappy && cursor) {
        // Happy: chase cursor instantly & directly across full screen
        tx = cursor.x
        ty = cursor.y
        cursorActive = true
      } else if (cursor && !pausing) {
        // Normal: soft gravity toward cursor within radius
        const dx = cursor.x - xRef.current
        const dy = cursor.y - yRef.current
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.30) {
          cursorActive = true
          const blend = (1 - dist / 0.30) * 0.65
          tx = tx * (1 - blend) + cursor.x * blend
          ty = ty * (1 - blend) + cursor.y * blend
        }
      }

      tx = clamp(tx, 0.01, mxX)
      ty = clamp(ty, minY, mxY)

      const maxSpd = isHappy ? HAPPY_SPEED : MAX_SPEED * (hungry ? HUNGRY_MULT : 1)
      const acc    = isHappy ? HAPPY_ACCEL : ACCEL     * (hungry ? HUNGRY_MULT : 1)

      if (!pausing) {
        // ── X axis ────────────────────────────────────────────────────────
        const dxA = tx - xRef.current
        const adxA = Math.abs(dxA)
        if (adxA > 0.005) {
          velX.current += (dxA > 0 ? 1 : -1) * acc
          velX.current  = clamp(velX.current, -maxSpd, maxSpd)
          velX.current *= adxA < 0.08 ? FRICTION : COAST_FRIC
        } else {
          velX.current *= 0.70
          if (Math.abs(velX.current) < 0.0008 && Math.random() < 0.04) schedulePause()
        }

        // ── Y axis ────────────────────────────────────────────────────────
        const dyA = ty - yRef.current
        const adyA = Math.abs(dyA)
        if (adyA > 0.005) {
          velY.current += (dyA > 0 ? 1 : -1) * acc
          velY.current  = clamp(velY.current, -maxSpd, maxSpd)
          velY.current *= adyA < 0.08 ? FRICTION : COAST_FRIC
        } else {
          velY.current *= 0.70
        }

        // Tiny organic jitter
        velX.current += (Math.random() - 0.5) * 0.0005
        velY.current += (Math.random() - 0.5) * 0.0004
      } else {
        velX.current *= 0.75
        velY.current *= 0.75
      }

      // ── Apply ─────────────────────────────────────────────────────────────
      let nx = xRef.current + velX.current
      let ny = yRef.current + velY.current
      if (nx >= mxX) { nx = mxX; velX.current *= -0.3 }
      if (nx <= 0)   { nx = 0;   velX.current *= -0.3 }
      if (ny >= mxY) { ny = mxY; velY.current *= -0.3 }
      if (ny <= minY){ ny = minY; velY.current *= -0.3 }

      xRef.current = nx
      yRef.current = ny
      setXFrac(nx)
      setYFrac(ny)

      // ── Facing: determined by horizontal velocity ─────────────────────────
      if (Math.abs(velX.current) > 0.0008) {
        setDir(velX.current > 0 ? 1 : -1)
      }

      // ── Animation state ───────────────────────────────────────────────────
      if (!overrideStateRef.current) {
        const baseState = pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'walk'
        const moving    = Math.abs(velX.current) > 0.0015 || Math.abs(velY.current) > 0.0015
        const effState  = !moving ? 'idle'
          : cursorActive && !pet.isDead && !pet.isStarving ? 'walk'
          : baseState
        setPetState(effState)
      }
    }, TICK_MS)
    return () => clearInterval(tickRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.isDead, pet.isStarving, schedulePause])

  // ── Hunger / dead bubble ──────────────────────────────────────────────────
  useEffect(() => {
    if (!pet.isStarving && !pet.isDead) { setShowBubble(false); return }
    setShowBubble(true)
    const t = setInterval(() => setShowBubble(v => !v), 8000)
    return () => clearInterval(t)
  }, [pet.isStarving, pet.isDead])

  // ── Tap / long-press interactions ─────────────────────────────────────────
  const longPressRef = useRef(null)

  const triggerInteraction = useCallback((s, ms = 1800) => {
    if (overrideRef.current) clearTimeout(overrideRef.current)
    overrideStateRef.current = s
    setPetState(s)
    velX.current *= 0.2
    velY.current *= 0.2

    if (s === 'sleeping') {
      lockedRef.current = true
      savePos(xRef.current, yRef.current)
    }

    overrideRef.current = setTimeout(() => {
      overrideRef.current = null
      overrideStateRef.current = null
      // After sleeping expires, only re-enable movement if still alive
      if (s === 'sleeping') lockedRef.current = petIsDeadRef.current
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
      playSfx('happy_' + skinToSfxKey(pet.skin))
      triggerInteraction('happy', 1800)
    }
  }, [triggerInteraction, pet.skin])

  const mirrorX = dir === -1
  const anim    = STATE_ANIMS[petState] || STATE_ANIMS.idle
  const speed   = Math.abs(velX.current)

  return (
    <>
      <style>{PET_CSS}{FLOAT_CSS}</style>
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          position:         'fixed',
          left:             `calc(${xFrac * 100}vw)`,
          top:              `calc(${yFrac * 100}vh)`,
          width:            PET_SIZE,
          height:           PET_SIZE,
          zIndex:           9000,
          cursor:           'pointer',
          userSelect:       'none',
          WebkitUserSelect: 'none',
          touchAction:      'none',
          willChange:       'left, top',
        }}
      >
        {/* Hunger / dead bubble */}
        {showBubble && (
          <div
            onClick={onHungryClick ? (e) => { e.stopPropagation(); onHungryClick() } : undefined}
            style={{
              position:    'absolute',
              bottom:      PET_SIZE + 6,
              left:        '50%',
              transform:   'translateX(-50%)',
              whiteSpace:  'nowrap',
              background:  pet.isDead ? 'rgba(239,68,68,0.92)' : 'rgba(251,191,36,0.92)',
              color:       '#fff',
              fontSize:    11,
              fontWeight:  800,
              padding:     '4px 10px',
              borderRadius: 20,
              boxShadow:   '0 2px 10px rgba(0,0,0,0.5)',
              animation:   'tomi-bubble-pop 0.3s ease-out',
              cursor:      onHungryClick ? 'pointer' : 'default',
            }}>
            {pet.isDead ? `💀 ${getPetName(pet.skin)} mati!` : `🍖 ${getPetName(pet.skin)} lapar!`}
          </div>
        )}

        {/* Ground shadow — squishes with speed */}
        <div style={{
          position:     'absolute',
          bottom:       -4,
          left:         '50%',
          transform:    `translateX(-50%) scaleX(${1 + Math.min(speed / MAX_SPEED, 1) * 0.4})`,
          width:        44,
          height:       9,
          borderRadius: '50%',
          background:   'rgba(0,0,0,0.22)',
          filter:       'blur(3px)',
          pointerEvents:'none',
        }} />

        {/* Pet sprite */}
        <div style={{
          animation:       anim,
          transformOrigin: 'center bottom',
          // Facing: mirror horizontally when moving left
          transform:       mirrorX ? 'scaleX(-1)' : 'scaleX(1)',
          transition:      'transform 0.10s ease',
          filter:          pet.isDead ? 'saturate(0.3) brightness(0.7)' : 'none',
        }}>
          <PetSVG state={petState} skinId={pet.skin} size={PET_SIZE} />
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
