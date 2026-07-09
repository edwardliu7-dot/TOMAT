import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
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
  const [selected, setSelected] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(1); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const factorsA = Array.from({ length: q.a }, (_, i) => i + 1).filter(n => q.a % n === 0)
  const factorsB = Array.from({ length: q.b }, (_, i) => i + 1).filter(n => q.b % n === 0)
  const isA = q.a % selected === 0
  const isB = q.b % selected === 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Gembok Roda Gigi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 16 }}>
            Cari faktor persekutuan terbesar (FPB) dari <strong style={{ color: '#67E8F9' }}>{q.a}</strong> dan <strong style={{ color: '#FDBA74' }}>{q.b}</strong>!
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, animation: `spin ${20/selected}s linear infinite` }}>⚙️</div>
              <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>{q.a}</div>
              <div style={{ fontSize: 10, color: isA ? '#34D399' : '#ef4444' }}>{isA ? 'OK' : 'X'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, animation: `spin ${20/selected}s linear infinite reverse` }}>⚙️</div>
              <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 700 }}>{q.b}</div>
              <div style={{ fontSize: 10, color: isB ? '#34D399' : '#ef4444' }}>{isB ? 'OK' : 'X'}</div>
            </div>
          </div>

          <SliderInput
            value={selected}
            min={1}
            max={Math.min(q.a, q.b)}
            onChange={setSelected}
            disabled={feedback !== null}
            accentColor={isA && isB ? '#34D399' : '#67E8F9'}
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi FPB: {selected}
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
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
