import { useState } from 'react'

const SL_MIN = -81, SL_MAX = 81

function RobotGrid({ a, b }: { a: number, b: number }) {
  const product = a * b
  const positive = product >= 0
  const count = Math.min(Math.abs(product), 25)
  const emoji = positive ? '🤖' : '💥'

  return (
    <div style={{ textAlign: 'center', padding: '8px 4px' }}>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
        <span style={{ color: a < 0 ? '#f87171' : '#67E8F9' }}>{a}</span>
        <span style={{ color: '#94A3B8', margin: '0 8px', fontSize: 20 }}>×</span>
        <span style={{ color: b < 0 ? '#f87171' : '#f59e0b' }}>{b}</span>
        <span style={{ color: '#94A3B8', margin: '0 8px', fontSize: 20 }}>=</span>
        <span style={{ color: positive ? '#10b981' : '#f87171' }}>?</span>
      </div>
      {/* Robot grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 180, margin: '0 auto', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} style={{ fontSize: 13, lineHeight: 1 }}>{emoji}</span>
        ))}
        {count < Math.abs(product) && (
          <span style={{ fontSize: 10, color: '#475569', alignSelf: 'center' }}>+{Math.abs(product) - count}</span>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: positive ? '#10b981' : '#f87171', fontWeight: 700 }}>
        {positive ? '⬆️ Produksi robot' : '🔻 Robot mati — arah berlawanan'}
      </div>
    </div>
  )
}

export function TournamentMatchPabrikRobot() {
  const [slider, setSlider] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const Q = { a: 5, b: -7, answer: -35 }

  const submit = () => {
    if (submitted) return
    setSubmitted(true)
    setResult(slider === Q.answer ? 'correct' : 'wrong')
  }

  const borderColor = result === 'correct' ? 'rgba(16,185,129,0.5)' : result === 'wrong' ? 'rgba(239,68,68,0.5)' : 'rgba(103,232,249,0.25)'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde 4 Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>🤖 Pabrik Robot • vs Deni F.</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < 3 ? '#10b981' : i === 3 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
        {/* Score bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 2 }}>KAMU</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Andi S.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9' }}>2</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>SOAL</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>4/7</div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Deni F.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>2</div>
          </div>
        </div>

        {/* Game card */}
        <div style={{ background: '#1A1D27', border: `1.5px solid ${borderColor}`, borderRadius: 20, padding: '16px' }}>
          <RobotGrid a={Q.a} b={Q.b} />

          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              Pabrik memproduksi{' '}
              <strong style={{ color: '#67E8F9' }}>{Q.a}</strong> baris, tiap baris{' '}
              <strong style={{ color: '#f87171' }}>{Q.b}</strong> robot.
              <br />Total robot? (negatif = robot rusak)
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: '0 4px' }}>
            <input type="range" min={SL_MIN} max={SL_MAX} step={1} value={slider}
              onChange={e => !submitted && setSlider(parseInt(e.target.value))}
              disabled={submitted}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: submitted ? 0.4 : 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[-81, -40, 0, 40, 81].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ background: `rgba(${slider < 0 ? '248,113,113' : '103,232,249'},0.1)`, border: `1.5px solid rgba(${slider < 0 ? '248,113,113' : '103,232,249'},0.3)`, borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: slider < 0 ? '#f87171' : '#67E8F9' }}>
              {slider}
            </span>
          </div>
        </div>

        {!submitted && (
          <button onClick={submit} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✅ Konfirmasi Jawaban {slider}
          </button>
        )}

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
          🔥 Lawan sedang menggeser…
        </div>

        {result && (
          <div style={{ background: result === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result === 'correct' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: result === 'correct' ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {result === 'correct' ? '✅ Benar! +1 poin' : `❌ Jawaban: ${Q.answer}`}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        )}
      </div>
    </div>
  )
}
