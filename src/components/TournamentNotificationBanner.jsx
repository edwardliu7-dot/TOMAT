import React, { useState, useEffect, useRef } from 'react'

const GAME_LABELS = {
  katak:           '🐸 Katak Pelompat',
  termometer:      '🌡️ Termometer',
  pabrikrobot:     '🤖 Pabrik Robot',
  gembok:          '⚙️ Gembok Roda Gigi',
  mercusuar:       '🏮 Mercusuar',
  sporajamur:      '🍄 Spora Jamur',
  scanner:         '💎 Scanner Permata',
  // Grade 8 BAB I — Bilangan Berpangkat
  g8selramuan:     '🧪 Penggandaan Sel Ramuan',
  g8racunminiatur: '☠️ Ekstraksi Racun Miniatur',
  g8kristal:       '💎 Pemisahan Elemen Kristal',
  g8fusienergi:    '⚗️ Fusi Energi Alkemis',
  g8mantraakar:    '✨ Penyederhanaan Mantra Akar',
  g8geolog:        '⛏️ Ekspedisi Geolog Kerajaan',
}

/**
 * Overlay banner muncul saat siswa menerima notifikasi 'tournament:your-match'.
 * Props:
 *   matchData  = { tournamentId, matchId, opponent, gameKey, round }
 *   onAccept(matchData)  — siswa klik "Masuk Arena!"
 *   onDismiss()          — siswa pilih lewati / countdown habis
 */
export default function TournamentNotificationBanner({ matchData, onAccept, onDismiss }) {
  const TOTAL = 60
  const [countdown, setCountdown] = useState(TOTAL)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          onDismiss?.()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [onDismiss])

  const pct = (countdown / TOTAL) * 100
  const urgent = countdown <= 15

  const handleAccept = () => {
    clearInterval(timerRef.current)
    onAccept?.(matchData)
  }

  const handleDismiss = () => {
    clearInterval(timerRef.current)
    onDismiss?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', padding: '0 0 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: 'linear-gradient(135deg,#1e1b12,#2a1f08)',
        border: `2px solid ${urgent ? 'rgba(239,68,68,0.7)' : 'rgba(245,158,11,0.6)'}`,
        borderRadius: 24, padding: '24px 20px 20px',
        boxShadow: `0 0 60px ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.25)'}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow pulse */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'radial-gradient(circle at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 36 }}>⚔️</div>
          <div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5 }}>TURNAMEN MATEMATIKA</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Giliran kamu bertanding!</div>
          </div>
        </div>

        {/* Match info */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8, fontWeight: 600 }}>
            RONDE {matchData.round} • {GAME_LABELS[matchData.gameKey] || matchData.gameKey}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Me */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2.5px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 6px' }}>🐸</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Kamu</div>
            </div>
            {/* VS */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>VS</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>7 soal</div>
            </div>
            {/* Opponent */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#b45309,#d97706)', border: '2.5px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 6px' }}>🔥</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{matchData.opponent?.name || 'Lawan'}</div>
            </div>
          </div>
        </div>

        {/* Countdown bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>Waktu bergabung</span>
            <span style={{ color: urgent ? '#f87171' : '#fbbf24', fontWeight: 800, fontSize: 16 }}>{countdown}s</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: urgent ? '#ef4444' : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
              borderRadius: 6,
              transition: 'width 1s linear, background 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#6B7280', marginTop: 5 }}>
            Jika tidak bergabung, lawan menang walkover otomatis
          </div>
        </div>

        {/* Accept CTA */}
        <button onClick={handleAccept} style={{
          width: '100%',
          background: urgent ? '#ef4444' : 'linear-gradient(90deg,#f59e0b,#ef4444)',
          border: 'none', borderRadius: 14, padding: '16px',
          color: '#fff', fontSize: 16, fontWeight: 900,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5,
          boxShadow: `0 4px 24px ${urgent ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.4)'}`,
          transition: 'all 0.3s',
        }}>
          ⚔️ Masuk Arena!
        </button>
        <button onClick={handleDismiss} style={{
          width: '100%', background: 'transparent', border: 'none',
          color: '#475569', fontSize: 12, marginTop: 10,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Lewati (walkover)
        </button>
      </div>
    </div>
  )
}
