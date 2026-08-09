export default function GameDefault() {
  return <GameScreen
    themeName="Default"
    bg="linear-gradient(160deg,#0d1b35 0%,#070e1c 100%)"
    accent="#6366F1"
    accentSoft="rgba(99,102,241,0.18)"
    accentGlow="rgba(99,102,241,0.35)"
    cardBg="rgba(255,255,255,0.04)"
    cardBorder="rgba(99,102,241,0.22)"
    correctBg="rgba(34,197,94,0.12)"
    correctBorder="#22c55e"
    particles={null}
  />
}

function GameScreen({ themeName, bg, accent, accentSoft, accentGlow, cardBg, cardBorder, correctBg, correctBorder, particles }: any) {
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
      {/* Particles */}
      {particles}

      {/* Radial glow behind content */}
      <div style={{
        position: 'absolute', top: '28%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 280, height: 280,
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
          background: 'rgba(255,255,255,0.07)', border: 'none',
          color: '#94A3B8', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        {/* Progress bar */}
        <div style={{ flex: 1, margin: '0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>Soal 3 / 8</span>
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>+15 🪙</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ width: '37%', height: '100%', borderRadius: 99, background: accent }} />
          </div>
        </div>

        {/* Coins */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)',
          borderRadius: 20, padding: '5px 10px',
        }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#FDE68A' }}>345</span>
        </div>
      </div>

      {/* Game header */}
      <div style={{ padding: '6px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, color: accent, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
          🐸 KATAK PELOMPAT
        </div>
        <div style={{ fontSize: 11, color: '#475569' }}>Persamaan Linear Satu Variabel</div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}>

        {/* Question card */}
        <div style={{
          borderRadius: 20, padding: '22px 20px',
          background: cardBg,
          border: `1.5px solid ${cardBorder}`,
          boxShadow: `0 0 32px ${accentGlow}`,
        }}>
          {/* Equation display */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block',
              background: accentSoft, borderRadius: 14,
              padding: '10px 24px', marginBottom: 12,
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: accent, letterSpacing: 2 }}>3x + 7 = 19</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#CBD5E1', textAlign: 'center', lineHeight: 1.5 }}>
            {question}
          </div>
        </div>

        {/* Answer choices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {choices.map((c, i) => (
            <button key={c.label} style={{
              borderRadius: 14, padding: '16px 12px',
              background: c.correct ? correctBg : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${c.correct ? correctBorder : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.15s',
              boxShadow: c.correct ? `0 0 16px rgba(34,197,94,0.2)` : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: c.correct ? '#22c55e' : accentSoft,
                border: `1px solid ${c.correct ? '#22c55e' : cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: c.correct ? '#fff' : accent,
              }}>{c.label}</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.correct ? '#86EFAC' : '#E2E2E6' }}>
                {c.value}
              </span>
              {c.correct && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Feedback banner (correct) */}
        <div style={{
          borderRadius: 16, padding: '14px 16px',
          background: 'rgba(34,197,94,0.1)',
          border: '1.5px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎉</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#86EFAC' }}>Benar! +15 🪙</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>3(4) + 7 = 19 ✓</div>
          </div>
          <button style={{
            background: '#22c55e', border: 'none', borderRadius: 10,
            padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Lanjut →</button>
        </div>

        {/* Theme label */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{
            fontSize: 10, color: '#334155', fontWeight: 600, letterSpacing: 1,
          }}>TEMA: {themeName.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
