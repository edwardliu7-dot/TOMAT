export default function GameSpace() {
  const Stars = () => (
    <>
      {[
        { top: '8%',  left: '12%', s: 2.5 }, { top: '4%',  left: '60%', s: 1.5 },
        { top: '14%', left: '80%', s: 2 },   { top: '20%', left: '30%', s: 1.5 },
        { top: '35%', left: '92%', s: 2 },   { top: '50%', left: '5%',  s: 1.5 },
        { top: '60%', left: '25%', s: 1 },   { top: '72%', left: '88%', s: 2 },
        { top: '85%', left: '15%', s: 1.5 }, { top: '90%', left: '55%', s: 2 },
        { top: '12%', left: '45%', s: 1 },   { top: '43%', left: '70%', s: 1 },
        { top: '28%', left: '8%',  s: 1.5 }, { top: '66%', left: '48%', s: 1 },
        { top: '78%', left: '72%', s: 2 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.s, height: s.s, borderRadius: '50%',
          background: '#fff', opacity: 0.6 + (i % 3) * 0.15,
          animation: `twinkle ${1.5 + (i % 4) * 0.4}s ease-in-out infinite`,
          animationDelay: `${(i % 5) * 0.3}s`,
        }} />
      ))}
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: 0.4; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </>
  )

  return <GameScreen
    themeName="Luar Angkasa"
    bg="linear-gradient(160deg,#050818 0%,#060d25 40%,#040c1e 100%)"
    accent="#22d3ee"
    accentSoft="rgba(34,211,238,0.12)"
    accentGlow="rgba(34,211,238,0.22)"
    cardBg="rgba(34,211,238,0.04)"
    cardBorder="rgba(34,211,238,0.2)"
    particles={<Stars />}
  />
}

function GameScreen({ themeName, bg, accent, accentSoft, accentGlow, cardBg, cardBorder, particles }: any) {
  const question = "Jika 3x + 7 = 19, maka nilai x adalah…"
  const choices = [
    { label: 'A', value: '2', correct: false },
    { label: 'B', value: '4', correct: true },
    { label: 'C', value: '5', correct: false },
    { label: 'D', value: '6', correct: false },
  ]

  return (
    <div style={{
      width: 390, height: 860, background: bg,
      fontFamily: "'Inter', sans-serif", color: '#E2E2E6',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {particles}

      <div style={{
        position: 'absolute', top: '28%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 280, height: 280,
        background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Nebula hint */}
      <div style={{
        position: 'absolute', bottom: '15%', right: '-10%',
        width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px', position: 'relative', zIndex: 2,
      }}>
        <button style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)',
          color: '#67E8F9', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <div style={{ flex: 1, margin: '0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>Soal 3 / 8</span>
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>+15 🪙</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(34,211,238,0.1)' }}>
            <div style={{
              width: '37%', height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg,#22d3ee,#67e8f9)',
              boxShadow: '0 0 8px rgba(34,211,238,0.6)',
            }} />
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.18)',
          borderRadius: 20, padding: '5px 10px',
        }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#FDE68A' }}>345</span>
        </div>
      </div>

      <div style={{ padding: '6px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, color: '#22d3ee', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
          🐸 KATAK PELOMPAT
        </div>
        <div style={{ fontSize: 11, color: '#334155' }}>Persamaan Linear Satu Variabel</div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}>

        <div style={{
          borderRadius: 20, padding: '22px 20px',
          background: cardBg,
          border: `1.5px solid ${cardBorder}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 32px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block',
              background: accentSoft, borderRadius: 14,
              padding: '10px 24px', marginBottom: 12,
              border: `1px solid rgba(34,211,238,0.15)`,
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#22d3ee', letterSpacing: 2 }}>3x + 7 = 19</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 }}>
            {question}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {choices.map((c) => (
            <button key={c.label} style={{
              borderRadius: 14, padding: '16px 12px',
              background: c.correct ? 'rgba(34,197,94,0.1)' : cardBg,
              border: `1.5px solid ${c.correct ? '#22c55e' : cardBorder}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10,
              backdropFilter: 'blur(4px)',
              boxShadow: c.correct ? '0 0 16px rgba(34,197,94,0.18)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: c.correct ? '#22c55e' : accentSoft,
                border: `1px solid ${c.correct ? '#22c55e' : cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: c.correct ? '#fff' : '#22d3ee',
              }}>{c.label}</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.correct ? '#86EFAC' : '#CBD5E1' }}>
                {c.value}
              </span>
              {c.correct && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>

        <div style={{
          borderRadius: 16, padding: '14px 16px',
          background: 'rgba(34,197,94,0.08)',
          border: '1.5px solid rgba(34,197,94,0.25)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🚀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#86EFAC' }}>Benar! +15 🪙</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>3(4) + 7 = 19 ✓</div>
          </div>
          <button style={{
            background: 'linear-gradient(135deg,#22d3ee,#06b6d4)',
            border: 'none', borderRadius: 10,
            padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 12px rgba(34,211,238,0.4)',
          }}>Lanjut →</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#1e3a4a', fontWeight: 600, letterSpacing: 1 }}>
            🌌 TEMA: {themeName.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
