import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
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
  const [digits, setDigits] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setDigits(''); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null || digits === '') return
    const correct = parseInt(digits, 10) === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1400 0%, #100c00 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Sektor Pemindai" onBack={goBack} accentColor="#4ADE80" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#4ADE80', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            PEMINDAIAN DEPOSIT MINERAL
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Radar memindai juring dengan jari-jari <strong style={{ color: '#fff' }}>{q.r} m</strong> dan sudut pusat <strong style={{ color: '#fff' }}>{q.theta}°</strong> (gunakan π ≈ 22/7).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa luas juring pemindaian tersebut?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#15803d">Pindai Area</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Luas juring = ${q.answer} m²` : `❌ Kurang tepat. Luas yang benar = ${q.answer} m²`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
