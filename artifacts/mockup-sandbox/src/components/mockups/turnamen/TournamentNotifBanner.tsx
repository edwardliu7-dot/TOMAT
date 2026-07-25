import { useState, useEffect } from 'react'

export function TournamentNotifBanner() {
  const [countdown, setCountdown] = useState(60)
  const [dismissed, setDismissed] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (dismissed || entered) return
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [dismissed, entered])

  const pct = (countdown / 60) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A2647 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Dim overlay */}
      {!dismissed && !entered && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 50, display: 'flex', alignItems: 'flex-end', padding: '0 0 24px' }}>
          {/* Banner */}
          <div style={{
            width: '100%', maxWidth: 480, margin: '0 auto',
            background: 'linear-gradient(135deg,#1e1b12,#2a1f08)',
            border: '2px solid rgba(245,158,11,0.6)',
            borderRadius: 24, padding: '24px 20px 20px',
            boxShadow: '0 0 60px rgba(245,158,11,0.25)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow pulse */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'radial-gradient(circle at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 36 }}>⚔️</div>
              <div>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5 }}>TURNAMEN MATEMATIKA</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>Giliran kamu bertanding!</div>
              </div>
            </div>

            {/* Match info */}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8, fontWeight: 600 }}>RONDE 2 • KATAK PELOMPAT</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2.5px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 6px' }}>🐸</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Kamu</div>
                  <div style={{ fontSize: 10, color: '#67E8F9' }}>Andi S.</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>VS</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>7 soal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#b45309,#d97706)', border: '2.5px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 6px' }}>🔥</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Lawan</div>
                  <div style={{ fontSize: 10, color: '#f59e0b' }}>Budi K.</div>
                </div>
              </div>
            </div>

            {/* Countdown bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Waktu bergabung</span>
                <span style={{ color: countdown <= 10 ? '#f87171' : '#fbbf24', fontWeight: 800, fontSize: 14 }}>{countdown}s</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: countdown <= 10 ? '#ef4444' : 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 6, transition: 'width 1s linear' }} />
              </div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 5 }}>Jika tidak bergabung, lawan menang walkover otomatis</div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setEntered(true)}
              style={{ width: '100%', background: 'linear-gradient(90deg,#f59e0b,#ef4444)', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5, boxShadow: '0 4px 24px rgba(245,158,11,0.4)' }}
            >
              ⚔️ Masuk Arena!
            </button>
            <button
              onClick={() => setDismissed(true)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#475569', fontSize: 12, marginTop: 10, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Lewati (walkover)
            </button>
          </div>
        </div>
      )}

      {/* App behind overlay */}
      <div style={{ padding: 20, opacity: 0.3, filter: 'blur(1px)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>🏠 Beranda TOMAT</div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🐸 Katak Pelompat</div>
          <div style={{ height: 8, background: 'rgba(103,232,249,0.2)', borderRadius: 4 }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🌡️ Termometer</div>
          <div style={{ height: 8, background: 'rgba(103,232,249,0.1)', borderRadius: 4 }} />
        </div>
      </div>

      {/* Entered state */}
      {entered && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ fontSize: 64 }}>⚔️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>Memasuki Arena…</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>Menunggu lawan siap</div>
        </div>
      )}
    </div>
  )
}
