import { useState } from 'react'

const SL_MIN = 1, SL_MAX = 30

function factors(n: number) {
  const f: number[] = []
  for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i)
  return f
}

function GearVis({ a, b }: { a: number, b: number }) {
  const fa = factors(a), fb = factors(b)
  const common = fa.filter(n => fb.includes(n))
  const fpb = Math.max(...common)

  return (
    <div style={{ padding: '6px 4px' }}>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
        {/* Gear A */}
        <div style={{ flex: 1, background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>⚙️</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#67E8F9' }}>Roda A = {a}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginTop: 6 }}>
            {fa.map(f => (
              <span key={f} style={{
                background: common.includes(f) ? 'rgba(16,185,129,0.25)' : 'rgba(103,232,249,0.08)',
                border: `1px solid ${common.includes(f) ? 'rgba(16,185,129,0.5)' : 'rgba(103,232,249,0.15)'}`,
                color: common.includes(f) ? '#10b981' : '#67E8F9',
                borderRadius: 6, padding: '2px 5px', fontSize: 10, fontWeight: 700
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* VS connector */}
        <div style={{ alignSelf: 'center', fontSize: 20, color: '#f59e0b' }}>🔗</div>

        {/* Gear B */}
        <div style={{ flex: 1, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>⚙️</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>Roda B = {b}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginTop: 6 }}>
            {fb.map(f => (
              <span key={f} style={{
                background: common.includes(f) ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${common.includes(f) ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.15)'}`,
                color: common.includes(f) ? '#10b981' : '#f59e0b',
                borderRadius: 6, padding: '2px 5px', fontSize: 10, fontWeight: 700
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Common factors highlight */}
      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '6px 10px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>🟢 Faktor Persekutuan</div>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {common.map(f => (
            <span key={f} style={{ background: f === fpb ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.15)', border: `1.5px solid ${f === fpb ? '#10b981' : 'rgba(16,185,129,0.35)'}`, color: '#10b981', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>
              {f}{f === fpb ? ' ← FPB' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TournamentMatchGembok() {
  const [slider, setSlider] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const Q = { a: 12, b: 18, answer: 6 }

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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde 1 Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>⚙️ Gembok Roda Gigi • vs Eka M.</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
        {/* Score bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 2 }}>KAMU</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Andi S.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9' }}>0</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>SOAL</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>1/7</div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Eka M.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>0</div>
          </div>
        </div>

        {/* Game card */}
        <div style={{ background: '#1A1D27', border: `1.5px solid ${borderColor}`, borderRadius: 20, padding: '16px' }}>
          <GearVis a={Q.a} b={Q.b} />

          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              Dua roda gigi: gigi <strong style={{ color: '#67E8F9' }}>A={Q.a}</strong> dan <strong style={{ color: '#f59e0b' }}>B={Q.b}</strong>.
              <br />Ukuran gigi terbesar yang cocok untuk keduanya?
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: '0 4px' }}>
            <input type="range" min={SL_MIN} max={SL_MAX} step={1} value={slider}
              onChange={e => !submitted && setSlider(parseInt(e.target.value))}
              disabled={submitted}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: submitted ? 0.4 : 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[1, 8, 15, 22, 30].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: '#10b981' }}>
              FPB = {slider}
            </span>
          </div>
        </div>

        {!submitted && (
          <button onClick={submit} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔑 Konfirmasi FPB = {slider}
          </button>
        )}

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
          🔥 Lawan sudah menjawab!
        </div>

        {result && (
          <div style={{ background: result === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result === 'correct' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: result === 'correct' ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {result === 'correct' ? '🔑 Benar! Gembok terbuka!' : `❌ FPB yang benar: ${Q.answer}`}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        )}
      </div>
    </div>
  )
}
