import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

const PAIRS = [
  [12, 8], [18, 12], [24, 16], [36, 24], [20, 15],
  [30, 20], [15, 25], [16, 24], [28, 21], [45, 30],
  [40, 24], [32, 48], [50, 35], [60, 45],
]

function genQ() {
  const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const answer = gcd(a, b)
  return { a, b, answer }
}

export default function GembokRodaGigiGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  const maxN = Math.max(q.a, q.b)
  const candidates = Array.from({ length: maxN }, (_, i) => i + 1)
  const factorsA = new Set(candidates.filter(n => q.a % n === 0))
  const factorsB = new Set(candidates.filter(n => q.b % n === 0))
  const common = candidates.filter(n => factorsA.has(n) && factorsB.has(n))

  const tap = (n) => {
    if (feedback !== null) return
    if (!factorsA.has(n) || !factorsB.has(n)) return // only allow tapping common factors
    setSelected(n)
  }

  const confirm = () => {
    if (feedback !== null || selected === null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const getColor = (n) => {
    const inA = factorsA.has(n)
    const inB = factorsB.has(n)
    if (inA && inB) return { bg: 'rgba(52,211,153,0.15)', border: '1.5px solid rgba(52,211,153,0.5)', color: '#34D399', label: '✓' }
    if (inA) return { bg: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.25)', color: '#67E8F9', label: 'A' }
    if (inB) return { bg: 'rgba(253,186,116,0.08)', border: '1px solid rgba(253,186,116,0.25)', color: '#FDBA74', label: 'B' }
    return { bg: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569', label: '' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Gembok Roda Gigi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SISTEM PENGUNCI PINTU PENJARA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12, lineHeight: 1.7 }}>
            Mesin <strong style={{ color: '#67E8F9' }}>A = {q.a}</strong> dan Mesin <strong style={{ color: '#FDBA74' }}>B = {q.b}</strong>.<br />
            Ketuk faktor persekutuan terbesar (FPB) dari keduanya!
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: '#67E8F9' }}>🔵 Faktor A saja</span>
            <span style={{ color: '#FDBA74' }}>🟠 Faktor B saja</span>
            <span style={{ color: '#34D399' }}>🟢 Faktor keduanya ← ketuk!</span>
          </div>

          {/* Factor grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
            {candidates.slice(0, Math.min(maxN, 60)).map(n => {
              const style = getColor(n)
              const isSel = n === selected
              const isCorrect = feedback !== null && n === q.answer
              const isWrong = feedback !== null && n === selected && selected !== q.answer
              let borderFinal = style.border
              let bgFinal = style.bg
              if (isSel && feedback === null) { borderFinal = '2px solid #f59e0b'; bgFinal = 'rgba(245,158,11,0.2)' }
              if (isCorrect) { borderFinal = '2px solid #34D399'; bgFinal = 'rgba(52,211,153,0.25)' }
              if (isWrong) { borderFinal = '2px solid #ef4444'; bgFinal = 'rgba(239,68,68,0.2)' }
              const isCommon = factorsA.has(n) && factorsB.has(n)
              return (
                <button key={n} onClick={() => tap(n)} disabled={feedback !== null || !isCommon}
                  style={{ padding: '8px 2px', borderRadius: 8, border: borderFinal, background: bgFinal, color: isWrong ? '#ef4444' : isCorrect ? '#34D399' : isSel ? '#f59e0b' : style.color, fontSize: 12, fontWeight: 700, cursor: (!isCommon || feedback !== null) ? 'default' : 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                  {n}
                  {style.label && <span style={{ position: 'absolute', top: -1, right: 1, fontSize: 7, opacity: 0.7 }}>{style.label}</span>}
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(103,232,249,0.06)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            FPB({q.a}, {q.b}) = bilangan hijau terbesar yang kamu pilih
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={selected !== null ? '#0e7490' : '#334155'}>
            {selected !== null ? `✅ FPB = ${selected}, Buka Gembok!` : 'Ketuk angka hijau terbesar...'}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pintu terbuka! FPB(${q.a}, ${q.b}) = ${q.answer}` : `❌ Salah kunci! FPB yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Gembok Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
