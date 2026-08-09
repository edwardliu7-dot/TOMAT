/**
 * MobaBattleLoader — full-screen loading gate shown between matchmaking_found
 * and match_countdown. Simulates loading steps, then emits moba:client_loaded
 * so the server knows this client is ready. The countdown only starts once ALL
 * matched players have emitted their loaded signal.
 */

import React, { useEffect, useRef, useState } from 'react'

const LOADING_STEPS = [
  'Memuat arena...',
  'Mengambil soal dari kurikulum...',
  'Menghubungkan ke lawan...',
  'Siap tempur!',
]

const STEP_DELAYS = [500, 900, 700, 500] // ms per step

const PET_EMOJI = {
  tomi: '🐱',
  kelinsay: '🐰',
  monyang: '🐒',
  nananaga: '🐉',
  komodih: '🦎',
}

function PetCard({ player, label, color }) {
  const emoji = PET_EMOJI[player?.petType] || '❓'
  const name = player?.displayName || label
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: `${color}22`,
        border: `2px solid ${color}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        boxShadow: `0 0 16px ${color}44`,
      }}>
        {emoji}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, textAlign: 'center', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
    </div>
  )
}

export default function MobaBattleLoader({ matchmaking, userId, clientLoaded }) {
  const [step, setStep] = useState(0)
  const [selfLoaded, setSelfLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const loadedRef = useRef(false)

  // Get player info from snapshot
  const snapshot = matchmaking?.snapshot
  const myPlayerId = matchmaking?.playerId
  const players = snapshot?.players || []
  const myPlayer = players.find(p =>
    p.userId === String(userId) || p.userId === userId || p.id === myPlayerId,
  )
  const opponentPlayer = players.find(p => p !== myPlayer)

  // Step through loading animation, then emit client_loaded
  useEffect(() => {
    if (loadedRef.current) return
    let totalDelay = 0
    const timers = STEP_DELAYS.map((delay, index) => {
      totalDelay += delay
      return setTimeout(() => {
        setStep(index + 1)
        if (index === LOADING_STEPS.length - 1 && !loadedRef.current) {
          loadedRef.current = true
          setSelfLoaded(true)
          Promise.resolve(clientLoaded?.()).catch(err => {
            setLoadError(err?.message || 'Gagal menghubungi server.')
          })
        }
      }, totalDelay)
    })
    return () => timers.forEach(clearTimeout)
  }, [clientLoaded])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(160deg, #060b18 0%, #0e1a2e 50%, #060b18 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: 28,
      color: '#fff',
      fontFamily: 'inherit',
      padding: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.15em',
          color: '#f59e0b',
          marginBottom: 4,
          textTransform: 'uppercase',
        }}>
          ⚔️ Pertandingan Ditemukan!
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>
          Bersiap Masuk Arena
        </h1>
      </div>

      {/* Players VS panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        width: '100%',
        maxWidth: 360,
      }}>
        <PetCard player={myPlayer} label="Tim Kamu" color="#60a5fa" />

        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 900,
          flexShrink: 0,
          boxShadow: '0 0 24px rgba(220,38,38,0.35)',
          letterSpacing: '-0.03em',
        }}>
          VS
        </div>

        <PetCard player={opponentPlayer} label="Lawan" color="#f87171" />
      </div>

      {/* Loading steps */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 320,
      }}>
        {LOADING_STEPS.map((label, index) => {
          const done = index + 1 <= step
          const active = index + 1 === step && !selfLoaded

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: done ? 1 : 0.3,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: done ? '#22c55e' : 'transparent',
                border: done ? 'none' : '2px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flexShrink: 0,
                transition: 'all 0.3s ease',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: 13,
                color: done ? '#e2e8f0' : '#475569',
                fontWeight: done ? 600 : 400,
                flex: 1,
              }}>
                {label}
              </span>
              {active && (
                <span style={{
                  fontSize: 11,
                  color: '#f59e0b',
                  animation: 'moba-pulse 1s ease-in-out infinite',
                }}>
                  •••
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 320,
        height: 4,
        background: '#1e293b',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${(step / LOADING_STEPS.length) * 100}%`,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Status message */}
      <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
        {loadError
          ? <span style={{ color: '#f87171' }}>❌ {loadError}</span>
          : selfLoaded
            ? <span>⌛ Menunggu semua pemain siap...</span>
            : <span>🔄 Mempersiapkan pertandingan...</span>}
      </div>

      {/* Game info chip */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 18px',
        fontSize: 12,
        color: '#475569',
        textAlign: 'center',
      }}>
        ⏱️ Durasi 7 menit · Soal matematika dari kurikulum
      </div>

      <style>{`
        @keyframes moba-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
