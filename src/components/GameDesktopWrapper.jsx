import React, { useState, useEffect } from 'react'

function useIsMd() {
  const [md, setMd] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setMd(mq.matches)
    const h = e => setMd(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return md
}

// GameDesktopWrapper — centers minigame content in a 480px column on desktop.
// Mobile (< 768px): no effect, children rendered directly.
// Desktop (≥ 768px): children in a centered max-480px column with a subtle
//   dot-grid backdrop and a top-bar showing [← Keluar] + gameEmoji + gameTitle.
//
// Props: { children, gameTitle, gameEmoji, onExit }
export default function GameDesktopWrapper({ children, gameTitle, gameEmoji, onExit }) {
  const isMd = useIsMd()

  if (!isMd) return children

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0B14',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top mini-bar */}
      <div style={{
        width: '100%',
        maxWidth: 560,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={onExit}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94A3B8', borderRadius: 10,
            padding: '7px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
        >
          ← Keluar
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{gameEmoji}</span>
          <span style={{
            fontSize: 14, fontWeight: 700, color: '#E2E2E6',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{gameTitle}</span>
        </div>
      </div>

      {/* Game content — constrained to 480px */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        minHeight: 'calc(100vh - 58px)',
        background: 'transparent',
        margin: '0 auto',
        position: 'relative',
      }}>
        {children}
      </div>
    </div>
  )
}
