import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Precomputed (r, theta) combos where area = theta/360 * 22/7 * r^2 is guaranteed to be an integer.
const COMBOS = [
  { r: 7, theta: 180 },
  { r: 14, theta: 90 }, { r: 14, theta: 180 }, { r: 14, theta: 270 },
  { r: 21, theta: 60 }, { r: 21, theta: 120 }, { r: 21, theta: 240 },
  { r: 28, theta: 90 }, { r: 28, theta: 45 }, { r: 28, theta: 135 },
  { r: 35, theta: 72 }, { r: 42, theta: 60 }, { r: 42, theta: 30 },
]

function genQ() {
  const { r, theta } = COMBOS[Math.floor(Math.random() * COMBOS.length)]
  const area = (theta / 360) * (22 / 7) * r * r
  return { r, theta, answer: area }
}

export default function G9SektorPemindaiGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(0); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1400 0%, #100c00 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Sektor Pemindai" onBack={goBack} accentColor="#4ADE80" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Jari-jari: <strong style={{ color: '#fff' }}>{q.r} m</strong>, Sudut: <strong style={{ color: '#fff' }}>{q.theta}°</strong> (π ≈ 22/7).
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa luas juring pemindaian?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={0} max={2000} step={1}
              onChange={setVal}
              accentColor="#4ADE80" unit=" m²"
              leftLabel="0" rightLabel="2000"
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#15803d">Pindai Area</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Luas juring = ${q.answer} m²` : `❌ Salah. Luas yang benar = ${q.answer} m²`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
