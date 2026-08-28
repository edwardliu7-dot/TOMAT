import React, { useEffect } from 'react'
import useMobilePortrait from '../hooks/useMobilePortrait'

export default function PortraitOrientationGuard({ enabled }) {
  const isMobilePortrait = useMobilePortrait()
  const visible = enabled && isMobilePortrait

  useEffect(() => {
    if (!visible) return undefined

    const previousOverflow = document.body.style.overflow
    const activeElement = document.activeElement
    const preventInteraction = event => {
      event.preventDefault()
      event.stopPropagation()
    }
    const touchOptions = { capture: true, passive: false }

    document.body.style.overflow = 'hidden'
    activeElement?.blur?.()
    window.addEventListener('keydown', preventInteraction, true)
    window.addEventListener('wheel', preventInteraction, touchOptions)
    window.addEventListener('touchmove', preventInteraction, touchOptions)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', preventInteraction, true)
      window.removeEventListener('wheel', preventInteraction, touchOptions)
      window.removeEventListener('touchmove', preventInteraction, touchOptions)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Miringkan layar"
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      onTouchMove={e => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(145deg,#071321 0%,#101a35 55%,#17112d 100%)',
        color: '#F8FAFC',
        textAlign: 'center',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div
          aria-hidden="true"
          style={{
            width: 112,
            height: 76,
            margin: '0 auto 28px',
            border: '4px solid #67E8F9',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#67E8F9',
            fontSize: 38,
            lineHeight: 1,
            transform: 'rotate(90deg)',
            boxShadow: '0 0 30px rgba(103,232,249,0.25)',
          }}
        >
          ↻
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 10px',
          borderRadius: 999,
          background: 'rgba(103,232,249,0.1)',
          border: '1px solid rgba(103,232,249,0.25)',
          color: '#67E8F9',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.8,
        }}>
          SMARTISA · TOMAT
        </div>
        <h1 style={{
          margin: '16px 0 10px',
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 900,
          letterSpacing: 0.2,
        }}>
          Miringkan layar
        </h1>
        <p style={{
          margin: 0,
          color: '#CBD5E1',
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          Putar perangkatmu ke posisi lanskap untuk menggunakan TOMAT.
        </p>
        <div style={{
          margin: '24px auto 0',
          padding: '10px 14px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          color: '#94A3B8',
          fontSize: 11,
          lineHeight: 1.45,
        }}>
          Layar ini akan tertutup otomatis setelah posisi lanskap terdeteksi.
        </div>
      </div>
    </div>
  )
}