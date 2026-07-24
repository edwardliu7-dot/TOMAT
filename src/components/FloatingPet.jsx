// ── FloatingPet — Tomi walks around the bottom of the screen ─────────────────
// Fixed-position, always visible for students. Reacts to touch: tap = happy,
// long-press = sleeping. Warns with a bubble when hungry. Shows dead state.
import React, { useState, useEffect, useRef, useCallback } from 'react'
import TomiSVG, { PET_CSS, STATE_ANIMS } from './TomiSVG'
import { usePet } from '../PetContext'
import { useAuth } from '../AuthContext'

const PET_SIZE = 76        // px
const WALK_SPEED = 0.012   // fraction of screen width per tick
const TICK_MS = 50

export default function FloatingPet() {
  const { user } = useAuth()
  const { pet } = usePet()

  // Only show for students
  if (!user || user.role !== 'siswa') return null

  return <PetWidget pet={pet} />
}

function PetWidget({ pet }) {
  const [xFrac, setXFrac] = useState(0.15)   // 0–1 fraction of screen width
  const [dir, setDir] = useState(1)           // 1 = right, -1 = left
  const [state, setState] = useState('walk')  // current animation state
  const [showBubble, setShowBubble] = useState(false)
  const stateOverrideRef = useRef(null)
  const longPressRef = useRef(null)
  const tickRef = useRef(null)

  const MAX_X = 1 - (PET_SIZE + 16) / window.innerWidth

  // Walking loop
  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (stateOverrideRef.current) return // paused while interaction override active
      setXFrac(prev => {
        let next = prev + dir * WALK_SPEED
        if (next >= MAX_X) { next = MAX_X; setDir(-1) }
        if (next <= 0)     { next = 0;     setDir(1)  }
        return next
      })
    }, TICK_MS)
    return () => clearInterval(tickRef.current)
  }, [dir, MAX_X])

  // Hunger bubble — show for 4s every 2 min when starving
  useEffect(() => {
    if (!pet.isStarving && !pet.isDead) { setShowBubble(false); return }
    setShowBubble(true)
    const t = setInterval(() => setShowBubble(v => !v), 8000)
    return () => clearInterval(t)
  }, [pet.isStarving, pet.isDead])

  // Decide state from pet.isDead / isStarving (baseline, overridable by touch)
  const baseState = pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'walk'

  const triggerOverride = useCallback((s, ms = 1800) => {
    setState(s)
    if (stateOverrideRef.current) clearTimeout(stateOverrideRef.current)
    stateOverrideRef.current = setTimeout(() => {
      stateOverrideRef.current = null
      setState(null) // revert to computed
    }, ms)
  }, [])

  const currentState = state ?? baseState

  // Touch handlers
  const onTouchStart = useCallback((e) => {
    e.stopPropagation()
    longPressRef.current = setTimeout(() => {
      triggerOverride('sleeping', 5000)
    }, 600)
  }, [triggerOverride])

  const onTouchEnd = useCallback((e) => {
    e.stopPropagation()
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      if (!stateOverrideRef.current) {
        // Short tap → happy
        triggerOverride('happy', 1800)
      }
    }
  }, [triggerOverride])

  // Mirror when walking left
  const mirrorX = dir === -1

  const anim = STATE_ANIMS[currentState] || STATE_ANIMS.idle

  return (
    <>
      <style>{PET_CSS}{FLOAT_CSS}</style>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        style={{
          position: 'fixed',
          bottom: 16,
          left: `${xFrac * 100}vw`,
          width: PET_SIZE,
          zIndex: 9000,
          cursor: 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          transition: 'left 50ms linear',
        }}
      >
        {/* Hunger / dead bubble */}
        {showBubble && (
          <div style={{
            position: 'absolute',
            bottom: PET_SIZE + 4,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            background: pet.isDead ? 'rgba(239,68,68,0.92)' : 'rgba(251,191,36,0.92)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 20,
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            animation: 'tomi-bubble-pop 0.3s ease-out',
          }}>
            {pet.isDead ? '💀 Tomi mati! Beri makan!' : '🍖 Tomi lapar!'}
          </div>
        )}

        {/* Shadow under pet */}
        <div style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
          filter: 'blur(3px)',
        }} />

        {/* The marmut itself */}
        <div style={{
          animation: anim,
          transformOrigin: 'center bottom',
          transform: mirrorX ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.15s ease',
          filter: pet.isDead ? 'saturate(0.3) brightness(0.7)' : 'none',
        }}>
          <TomiSVG state={currentState} skinId={pet.skin} size={PET_SIZE} />
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
