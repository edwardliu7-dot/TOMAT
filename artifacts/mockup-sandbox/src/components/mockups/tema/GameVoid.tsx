export default function GameVoid() {
  const VoidParticles = () => (
    <>
      {[
        { top: '5%',  left: '18%', s: 3,   o: 0.5 },
        { top: '10%', left: '75%', s: 2,   o: 0.6 },
        { top: '22%', left: '90%', s: 2.5, o: 0.4 },
        { top: '38%', left: '3%',  s: 2,   o: 0.5 },
        { top: '55%', left: '92%', s: 3,   o: 0.4 },
        { top: '68%', left: '10%', s: 2,   o: 0.6 },
        { top: '80%', left: '82%', s: 2.5, o: 0.5 },
        { top: '90%', left: '35%', s: 2,   o: 0.4 },
        { top: '15%', left: '48%', s: 1.5, o: 0.5 },
        { top: '45%', left: '60%', s: 2,   o: 0.3 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: p.top, left: p.left,
          width: p.s, height: p.s, borderRadius: '50%',
          background: '#c084fc', opacity: p.o,
          animation: `voidFloat ${2 + (i % 3) * 0.6}s ease-in-out infinite`,
          animationDelay: `${(i % 5) * 0.4}s`,
        }} />
      ))}
      {/* Void ring */}
      <div style={{
        position: 'absolute', top: '22%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 180, height: 180, borderRadius: '50%',
        border: '1px solid rgba(168,85,247,0.1)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '22%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 260, height: 260, borderRadius: '50%',
        border: '1px solid rgba(168,85,247,0.06)',
        pointerEvents: 'none',
      }} />
      <style>{`
        @keyframes voidFloat {
          0%,100% { transform: translateY(0) scale(1);   opacity: 0.3; }
          50%      { transform: translateY(-4px) scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </>
  )

  return <GameScreen
    themeName="Void"
    bg="linear-gradient(160deg,#030008 0%,#0d0018 40%,#050010 100%)"
    accent="#a855f7"
    accentSoft="rgba(168,85,247,0.12)"
    accentGlow="rgba(168,85,247,0.22)"
    cardBg="rgba(168,85,247,0.04)"
    cardBorder="rgba(168,85,247,0.2)"
    particles={<VoidParticles />}
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
        width: 300, height: 300,
        background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px', position: 'relative', zIndex: 2,
      }}>
        <button style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
          color: '#C084FC', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <div style={{ flex: 1, margin: '0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#3d2060', fontWeight: 600 }}>Soal 3 / 8</span>
            <span style={{ fontSize: 10, color: '#3d2060', fontWeight: 600 }}>+15 🪙</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(168,85,247,0.1)' }}>
            <div style={{
              width: '37%', height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg,#a855f7,#c084fc)',
              boxShadow: '0 0 10px rgba(168,85,247,0.7)',
            }} />
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.15)',
          borderRadius: 20, padding: '5px 10px',
        }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#FDE68A' }}>345</span>
        </div>
      </div>

      <div style={{ padding: '6px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
          🐸 KATAK PELOMPAT
        </div>
        <div style={{ fontSize: 11, color: '#2d1a4a' }}>Persamaan Linear Satu Variabel</div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}>

        <div style={{
          borderRadius: 20, padding: '22px 20px',
          background: cardBg,
          border: `1.5px solid ${cardBorder}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 40px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block',
              background: accentSoft, borderRadius: 14,
              padding: '10px 24px', marginBottom: 12,
              border: `1px solid rgba(168,85,247,0.18)`,
              boxShadow: '0 0 20px rgba(168,85,247,0.12)',
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#c084fc', letterSpacing: 2 }}>3x + 7 = 19</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
            {question}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {choices.map((c) => (
            <button key={c.label} style={{
              borderRadius: 14, padding: '16px 12px',
              background: c.correct ? 'rgba(34,197,94,0.08)' : cardBg,
              border: `1.5px solid ${c.correct ? '#22c55e' : cardBorder}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10,
              backdropFilter: 'blur(4px)',
              boxShadow: c.correct ? '0 0 16px rgba(34,197,94,0.15)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: c.correct ? '#22c55e' : 'rgba(168,85,247,0.15)',
                border: `1px solid ${c.correct ? '#22c55e' : 'rgba(168,85,247,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: c.correct ? '#fff' : '#c084fc',
              }}>{c.label}</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.correct ? '#86EFAC' : '#9CA3AF' }}>
                {c.value}
              </span>
              {c.correct && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>

        <div style={{
          borderRadius: 16, padding: '14px 16px',
          background: 'rgba(34,197,94,0.07)',
          border: '1.5px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#86EFAC' }}>Benar! +15 🪙</div>
            <div style={{ fontSize: 11, color: '#2d1a4a', marginTop: 2 }}>3(4) + 7 = 19 ✓</div>
          </div>
          <button style={{
            background: 'linear-gradient(135deg,#a855f7,#9333ea)',
            border: 'none', borderRadius: 10,
            padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 16px rgba(168,85,247,0.45)',
          }}>Lanjut →</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#1a0a2e', fontWeight: 600, letterSpacing: 1 }}>
            🌑 TEMA: {themeName.toUpperCase()} · LIMITED
          </span>
        </div>
      </div>
    </div>
  )
}
