export function TournamentWait() {
  const bracket = {
    rounds: [
      {
        label: 'Ronde 1',
        matches: [
          { p1: 'Andi S.', p2: 'Budi K.', winner: 'Andi S.', status: 'finished', score: '5-3' },
          { p1: 'Cika R.', p2: 'Dian P.', winner: 'Cika R.', status: 'finished', score: '4-2' },
          { p1: 'Eka M.', p2: 'Fajar L.', winner: 'Fajar L.', status: 'finished', score: '3-5' },
          { p1: 'Gita N.', p2: 'Hani W.', winner: null, status: 'in-progress', score: '2-3' },
        ]
      },
      {
        label: 'Ronde 2',
        matches: [
          { p1: 'Andi S.', p2: 'Cika R.', winner: null, status: 'waiting', score: null },
          { p1: 'Fajar L.', p2: '?', winner: null, status: 'pending', score: null },
        ]
      }
    ],
    me: 'Andi S.',
  }

  const statusBadge = (status: string) => {
    if (status === 'finished') return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✅ Selesai' }
    if (status === 'in-progress') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⚡ Berlangsung' }
    if (status === 'waiting') return { bg: 'rgba(103,232,249,0.12)', color: '#67E8F9', label: '⏳ Segera Mulai' }
    return { bg: 'rgba(255,255,255,0.06)', color: '#475569', label: '🔒 Menunggu' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>🏆 TURNAMEN AKTIF • KATAK PELOMPAT</div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>Menunggu Ronde 2…</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Ronde berikutnya mulai otomatis setelah semua match selesai</div>
      </div>

      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* My status card */}
        <div style={{ background: 'rgba(103,232,249,0.06)', border: '1.5px solid rgba(103,232,249,0.3)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 10 }}>STATUS KAMU</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐸</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Andi S. <span style={{ fontSize: 11, color: '#67E8F9', background: 'rgba(103,232,249,0.12)', padding: '2px 8px', borderRadius: 20 }}>KAMU</span></div>
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 3 }}>✅ Lolos ke Ronde 2</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Match: vs Cika R. (belum dimulai)</div>
            </div>
          </div>
        </div>

        {/* Bracket */}
        {bracket.rounds.map((round, ri) => (
          <div key={ri}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{round.label.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {round.matches.map((m, mi) => {
                const badge = statusBadge(m.status)
                const isMyMatch = m.p1 === bracket.me || m.p2 === bracket.me
                return (
                  <div key={mi} style={{
                    background: isMyMatch ? 'rgba(103,232,249,0.06)' : '#1A1D27',
                    border: `1.5px solid ${isMyMatch ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Players */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: m.winner === m.p1 ? 800 : 600, color: m.winner === m.p1 ? '#fff' : m.winner && m.winner !== m.p1 ? '#475569' : '#94A3B8' }}>
                            {m.p1 === bracket.me ? '🐸 ' : ''}{m.p1}
                          </span>
                          {m.score && (
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9' }}>{m.score.split('-')[0]}</span>
                          )}
                        </div>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: m.winner === m.p2 ? 800 : 600, color: m.winner === m.p2 ? '#fff' : m.winner && m.winner !== m.p2 ? '#475569' : '#94A3B8' }}>
                            {m.p2 === bracket.me ? '🐸 ' : ''}{m.p2}
                          </span>
                          {m.score && (
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>{m.score.split('-')[1]}</span>
                          )}
                        </div>
                      </div>
                      {/* Status */}
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{badge.label}</span>
                        {m.winner && (
                          <div style={{ fontSize: 10, color: '#10b981', marginTop: 4, fontWeight: 600 }}>🏅 {m.winner}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Waiting animation */}
        <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>Menunggu match Gita vs Hani selesai…</div>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
