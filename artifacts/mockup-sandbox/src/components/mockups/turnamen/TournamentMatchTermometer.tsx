import { useState } from 'react'

const SL_MIN = -25, SL_MAX = 25

function ThermometerVis({ value }: { value: number }) {
  const fillPct = ((value + 25) / 50)
  const maxH = 90
  const fillH = Math.max(4, fillPct * maxH)
  const fillY = 12 + maxH - fillH
  const cold = value <= 0
  const fillColor = cold ? '#60a5fa' : '#f87171'
  const markerY = 12 + (1 - fillPct) * maxH

  return (
    <svg width="80" height="140" viewBox="0 0 80 140" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {/* Tube bg */}
      <rect x="30" y="12" width="12" height={maxH} rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(103,232,249,0.2)" strokeWidth="1.5" />
      {/* Tick marks */}
      {[-25, -15, -5, 0, 5, 15, 25].map(t => {
        const ty = 12 + (1 - ((t + 25) / 50)) * maxH
        const isMajor = t % 25 === 0 || t === 0
        return (
          <g key={t}>
            <line x1={isMajor ? 42 : 43} y1={ty} x2={50} y2={ty} stroke={t === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(103,232,249,0.25)'} strokeWidth={isMajor ? 1.2 : 0.8} />
            {isMajor && <text x="53" y={ty + 3} fontSize="7" fill="rgba(103,232,249,0.55)" textAnchor="start">{t}°</text>}
          </g>
        )
      })}
      {/* Fill */}
      <clipPath id="tc">
        <rect x="30" y="12" width="12" height={maxH} rx="6" />
      </clipPath>
      <rect x="30" y={fillY} width="12" height={fillH} fill={fillColor} clipPath="url(#tc)" opacity="0.85" />
      {/* Current marker */}
      <line x1="24" y1={markerY} x2="30" y2={markerY} stroke="#fff" strokeWidth="2" />
      <text x="3" y={markerY + 4} fontSize="9" fill="#fff" fontWeight="bold" textAnchor="start">{value}°</text>
      {/* Bulb */}
      <circle cx="36" cy="110" r="11" fill={fillColor} stroke={fillColor} strokeWidth="2" opacity="0.9" />
      <circle cx="36" cy="110" r="6" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}

export function TournamentMatchTermometer() {
  const [slider, setSlider] = useState(-5)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const Q = { start: -5, delta: 8, answer: 3, label: 'naik 8°' }

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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde 3 Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>🌡️ Termometer • vs Cika R.</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < 2 ? '#10b981' : i === 2 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
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
            <div style={{ fontSize: 16, fontWeight: 900 }}>3/7</div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Cika R.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>1</div>
          </div>
        </div>

        {/* Game card */}
        <div style={{ background: '#1A1D27', border: `1.5px solid ${borderColor}`, borderRadius: 20, padding: '16px' }}>
          {/* Thermometer + question side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThermometerVis value={slider} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.65 }}>
                Suhu awal{' '}
                <strong style={{ color: '#60a5fa', fontSize: 15 }}>{Q.start}°C</strong>,{' '}
                lalu <span style={{ color: '#f87171', fontWeight: 700 }}>{Q.label}</span>.
                <br />Suhu akhir?
              </div>
              {/* Equation display */}
              <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#60a5fa' }}>{Q.start}</span>
                <span style={{ fontSize: 14, color: '#94A3B8', margin: '0 4px' }}>+</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#f87171' }}>8</span>
                <span style={{ fontSize: 14, color: '#94A3B8', margin: '0 4px' }}>=</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#67E8F9' }}>{slider}</span>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: '8px 4px 0' }}>
            <input type="range" min={SL_MIN} max={SL_MAX} step={1} value={slider}
              onChange={e => !submitted && setSlider(parseInt(e.target.value))}
              disabled={submitted}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: submitted ? 0.4 : 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[-25, -12, 0, 12, 25].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ background: 'rgba(103,232,249,0.1)', border: '1.5px solid rgba(103,232,249,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: '#67E8F9' }}>
              {slider}°C
            </span>
          </div>
        </div>

        {!submitted && (
          <button onClick={submit} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✅ Konfirmasi {slider}°C
          </button>
        )}

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
          🔥 Lawan sudah menjawab!
        </div>

        {result && (
          <div style={{ background: result === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result === 'correct' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: result === 'correct' ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {result === 'correct' ? '✅ Benar! +1 poin' : `❌ Jawaban: ${Q.answer}°C`}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#475569' }}>
          <span>🌡️ Suhu akhir = posisi slider</span>
        </div>
      </div>
    </div>
  )
}
