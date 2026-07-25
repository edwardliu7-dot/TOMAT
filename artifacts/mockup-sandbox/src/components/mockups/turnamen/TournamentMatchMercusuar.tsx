import { useState } from 'react'

const SL_MIN = 1, SL_MAX = 60

function LighthouseVis({ a, b }: { a: number, b: number }) {
  const maxT = Math.min(a * b, 36)
  const flashA = Array.from({ length: Math.floor(maxT / a) + 1 }, (_, i) => i * a).filter(t => t <= maxT)
  const flashB = Array.from({ length: Math.floor(maxT / b) + 1 }, (_, i) => i * b).filter(t => t <= maxT)
  const common = flashA.filter(t => flashB.includes(t) && t > 0)

  return (
    <div style={{ padding: '6px 4px' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>🏮</span>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9' }}>setiap {a}s</div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 24 }}>🏮</span>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>setiap {b}s</div>
      </div>

      {/* Flash grid header */}
      <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', marginBottom: 4 }}>Pola kedipan (detik ke-)</div>

      {/* Row A */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#67E8F9', width: 16, flexShrink: 0 }}>A:</span>
          {Array.from({ length: maxT + 1 }, (_, t) => {
            const isFlash = flashA.includes(t)
            const isBoth = common.includes(t)
            return (
              <div key={t} style={{
                width: t > 9 ? 16 : 14, height: 14, borderRadius: 3, flexShrink: 0,
                background: isBoth ? '#10b981' : isFlash ? '#67E8F9' : 'rgba(255,255,255,0.04)',
                border: isFlash ? `1px solid ${isBoth ? '#10b981' : 'rgba(103,232,249,0.5)'}` : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 6, color: '#fff', fontWeight: 700,
              }}>
                {isFlash ? t : ''}
              </div>
            )
          })}
        </div>
      </div>

      {/* Row B */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#f59e0b', width: 16, flexShrink: 0 }}>B:</span>
          {Array.from({ length: maxT + 1 }, (_, t) => {
            const isFlash = flashB.includes(t)
            const isBoth = common.includes(t)
            return (
              <div key={t} style={{
                width: t > 9 ? 16 : 14, height: 14, borderRadius: 3, flexShrink: 0,
                background: isBoth ? '#10b981' : isFlash ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                border: isFlash ? `1px solid ${isBoth ? '#10b981' : 'rgba(245,158,11,0.5)'}` : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 6, color: '#fff', fontWeight: 700,
              }}>
                {isFlash ? t : ''}
              </div>
            )
          })}
        </div>
      </div>

      {common.length > 0 && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '5px 8px', textAlign: 'center', fontSize: 10, color: '#10b981', fontWeight: 700 }}>
          🟢 Berkedip bersamaan: detik ke-{common.join(', ')}
        </div>
      )}
    </div>
  )
}

export function TournamentMatchMercusuar() {
  const [slider, setSlider] = useState(4)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const Q = { a: 4, b: 6, answer: 12 }

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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde 2 Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>🏮 Mercusuar • vs Fani L.</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
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
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Fani L.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>0</div>
          </div>
        </div>

        {/* Game card */}
        <div style={{ background: '#1A1D27', border: `1.5px solid ${borderColor}`, borderRadius: 20, padding: '16px' }}>
          <LighthouseVis a={Q.a} b={Q.b} />

          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              Mercusuar A berkedip setiap <strong style={{ color: '#67E8F9' }}>{Q.a} detik</strong>,
              {' '}B setiap <strong style={{ color: '#f59e0b' }}>{Q.b} detik</strong>.
              <br />Kapan mereka berkedip <em>bersamaan</em> pertama kali?
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: '0 4px' }}>
            <input type="range" min={SL_MIN} max={SL_MAX} step={1} value={slider}
              onChange={e => !submitted && setSlider(parseInt(e.target.value))}
              disabled={submitted}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: submitted ? 0.4 : 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[1, 15, 30, 45, 60].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: '#10b981' }}>
              KPK = {slider}s
            </span>
          </div>
        </div>

        {!submitted && (
          <button onClick={submit} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            🏮 Konfirmasi KPK = {slider}
          </button>
        )}

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
          🔥 Lawan sudah menjawab!
        </div>

        {result && (
          <div style={{ background: result === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result === 'correct' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: result === 'correct' ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {result === 'correct' ? '🏮 Benar! Kapal selamat!' : `❌ KPK yang benar: ${Q.answer}`}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        )}
      </div>
    </div>
  )
}
