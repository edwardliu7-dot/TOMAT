import { useState } from 'react'

const NL_MIN = -20, NL_MAX = 20
function toPercent(n: number) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

function NumberLine({ myPos, oppPos, start, answer }: { myPos: number, oppPos: number | null, start: number, answer: number }) {
  return (
    <div style={{ padding: '0 4px' }}>
      <svg width="100%" viewBox="0 0 260 80" style={{ overflow: 'visible', display: 'block' }}>
        <rect x="0" y="50" width="260" height="30" rx="4" fill="rgba(14,116,144,0.12)" />
        {[25,60,95,130,165,200,235].map((x, i) => (
          <ellipse key={i} cx={x} cy="60" rx="13" ry="4" fill="none" stroke="rgba(103,232,249,0.1)" strokeWidth="1" />
        ))}
        {[18,50,80,110,140,170,200,230].map((x, i) => (
          <ellipse key={i} cx={x} cy="52" rx="16" ry="7" fill="#0a1f2e" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
        ))}
        <line x1="15" y1="70" x2="245" y2="70" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
        {[-20,-10,0,10,20].map((n, i) => (
          <text key={i} x={15 + (n - NL_MIN) / (NL_MAX - NL_MIN) * 230} y="78" textAnchor="middle" fill="rgba(103,232,249,0.35)" fontSize="7">{n}</text>
        ))}
        <rect x={15 + toPercent(start) / 100 * 230 - 1.5} y="48" width="3" height="22" fill="#67E8F9" rx="1.5" opacity="0.5" />
        {oppPos !== null && (
          <text x={15 + toPercent(oppPos) / 100 * 230} y="43" textAnchor="middle" fontSize="16" opacity="0.55" style={{ filter: 'saturate(0.4)' }}>🔥</text>
        )}
        <text x={15 + toPercent(myPos) / 100 * 230} y="43" textAnchor="middle" fontSize="18">🐸</text>
      </svg>
    </div>
  )
}

export function TournamentMatch() {
  const [slider, setSlider] = useState(-3)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const question = { start: -3, jump: 5, isForward: true, answer: 2 }

  const submit = () => {
    if (submitted) return
    setSubmitted(true)
    setResult(slider === question.answer ? 'correct' : 'wrong')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde 2 Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Katak Pelompat • vs Budi K.</div>
        </div>
        {/* Round dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({length:7},(_,i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < 1 ? '#10b981' : i === 1 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
        {/* Score bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 2 }}>KAMU</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Andi S.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9' }}>1</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>SOAL</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>2/7</div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Budi K.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>1</div>
          </div>
        </div>

        {/* Game card */}
        <div style={{ background: '#1A1D27', border: `1.5px solid ${result === 'correct' ? 'rgba(16,185,129,0.5)' : result === 'wrong' ? 'rgba(239,68,68,0.5)' : 'rgba(103,232,249,0.25)'}`, borderRadius: 20, padding: '16px' }}>
          <NumberLine myPos={slider} oppPos={-1} start={question.start} answer={question.answer} />

          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              Katak di batu{' '}
              <strong style={{ color: '#67E8F9' }}>{question.start}</strong>, melompat{' '}
              <span>⮕ maju</span>{' '}
              <strong style={{ color: '#f59e0b' }}>{question.jump} batu</strong>. Geser katak ke posisi akhir!
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: '0 4px' }}>
            <input type="range" min={NL_MIN} max={NL_MAX} step={1} value={slider}
              onChange={e => !submitted && setSlider(parseInt(e.target.value))}
              disabled={submitted}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: submitted ? 0.4 : 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[-20,-10,0,10,20].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ background: 'rgba(103,232,249,0.1)', border: '1.5px solid rgba(103,232,249,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: '#67E8F9' }}>{slider}</span>
          </div>
        </div>

        {/* Confirm button */}
        {!submitted && (
          <button onClick={submit} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✅ Konfirmasi Posisi {slider}
          </button>
        )}

        {/* Lawan sudah jawab */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
          🔥 Lawan sudah menjawab! Cepat!
        </div>

        {/* Result banner */}
        {result && (
          <div style={{ background: result === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result === 'correct' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: result === 'correct' ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {result === 'correct' ? '✅ Benar!' : `❌ Salah! Jawaban: ${question.answer}`}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#475569' }}>
          <span>🐸 Kamu</span>
          <span>🔥 Lawan</span>
        </div>
      </div>
    </div>
  )
}
