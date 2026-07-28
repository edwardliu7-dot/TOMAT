import React, { useState, useEffect, useRef } from 'react'
import { usePet } from '../PetContext'

const GAME_LABELS = {
  katak:       { emoji: '🐸', name: 'Katak Pelompat' },
  termometer:  { emoji: '🌡️', name: 'Termometer' },
  pabrikrobot: { emoji: '🤖', name: 'Pabrik Robot' },
  gembok:      { emoji: '⚙️', name: 'Gembok FPB' },
  mercusuar:   { emoji: '🏮', name: 'Mercusuar KPK' },
  scanner:     { emoji: '💎', name: 'Scanner Prima' },
}

/**
 * Overlay banner when a siswa receives a 'duel:incoming-invite' socket event.
 * Props:
 *   invite   = { code, from: { userId, name } }
 *   onAccept(invite)  — navigate to duel lobby & auto-join
 *   onDecline()       — dismiss (emits duel:invite-decline)
 */
export default function DuelInviteBanner({ invite, onAccept, onDecline }) {
  const TOTAL = 60
  const [countdown, setCountdown] = useState(TOTAL)
  const timerRef = useRef(null)
  const { pet } = usePet()
  const petDead = pet?.isDead === true

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          onDecline?.()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [onDecline])

  const pct = (countdown / TOTAL) * 100
  const urgent = countdown <= 15

  const handleAccept = () => {
    clearInterval(timerRef.current)
    onAccept?.(invite)
  }

  const handleDecline = () => {
    clearInterval(timerRef.current)
    onDecline?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', padding: '0 0 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: 'linear-gradient(135deg,#0e1a2e,#0d1f3c)',
        border: `2px solid ${urgent ? 'rgba(239,68,68,0.7)' : 'rgba(99,102,241,0.6)'}`,
        borderRadius: 24, padding: '24px 20px 20px',
        boxShadow: `0 0 60px ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.25)'}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow pulse */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
          <div style={{ fontSize: 36 }}>⚔️</div>
          <div>
            <div style={{ fontSize: 11, color: '#818CF8', fontWeight: 800, letterSpacing: 1.5 }}>TANTANGAN DUEL</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Kamu ditantang duel!</div>
          </div>
        </div>

        {/* Invite info */}
        <div style={{
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 16, position: 'relative',
        }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10, fontWeight: 600 }}>
            UNDANGAN DARI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Challenger */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg,#b45309,#d97706)',
                border: '2.5px solid #fbbf24',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, margin: '0 auto 6px',
              }}>🔥</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{invite.from?.name || 'Siswa'}</div>
            </div>
            {/* VS */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#6366F1' }}>VS</div>
              {(() => {
                const g = GAME_LABELS[invite.gameKey] || GAME_LABELS.katak
                return <div style={{ fontSize: 10, color: '#818CF8', marginTop: 2, fontWeight: 700 }}>{g.emoji} {g.name}</div>
              })()}
            </div>
            {/* Me */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg,#0e7490,#0284c7)',
                border: '2.5px solid #67E8F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, margin: '0 auto 6px',
              }}>🐸</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Kamu</div>
            </div>
          </div>
        </div>

        {/* Countdown bar */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>Waktu menerima</span>
            <span style={{ color: urgent ? '#f87171' : '#818CF8', fontWeight: 800, fontSize: 16 }}>{countdown}s</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: urgent ? '#ef4444' : 'linear-gradient(90deg,#6366F1,#818CF8)',
              borderRadius: 6,
              transition: 'width 1s linear, background 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#6B7280', marginTop: 5 }}>
            Undangan otomatis dibatalkan jika tidak diterima
          </div>
        </div>

        {/* Buttons */}
        {petDead ? (
          <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>💀</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 14 }}>
              Tomi sedang mati — kamu tidak bisa berduel.<br />
              Hidupkan Tomi di Toko dulu ya!
            </div>
            <button onClick={handleDecline} style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '13px', color: '#6B7280', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Tutup
            </button>
          </div>
        ) : (
          <>
            <button onClick={handleAccept} style={{
              width: '100%',
              background: urgent ? '#ef4444' : 'linear-gradient(90deg,#6366F1,#8B5CF6)',
              border: 'none', borderRadius: 14, padding: '16px',
              color: '#fff', fontSize: 16, fontWeight: 900,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5,
              boxShadow: `0 4px 24px ${urgent ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.4)'}`,
              transition: 'all 0.3s', position: 'relative',
            }}>
              ⚔️ Terima Tantangan!
            </button>
            <button onClick={handleDecline} style={{
              width: '100%', background: 'transparent', border: 'none',
              color: '#475569', fontSize: 12, marginTop: 10,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Tolak undangan
            </button>
          </>
        )}
      </div>
    </div>
  )
}
