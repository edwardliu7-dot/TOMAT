import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const m1 = 1 + Math.floor(Math.random() * 3)
  const m2 = m1 + 1 + Math.floor(Math.random() * 3)
  const xTarget = -3 + Math.floor(Math.random() * 7)
  const c1 = Math.floor(Math.random() * 5)
  const c2 = c1 + (m1 - m2) * xTarget
  return { m1, c1, m2, c2, answer: xTarget }
}

export default function G8PertahananBerlapisGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Sistem Pertahanan Berlapis" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7, fontFamily: 'monospace' }}>
            y₁ = {q.m1}x {q.c1 >= 0 ? '+' : '−'} {Math.abs(q.c1)}<br />
            y₂ = {q.m2}x {q.c2 >= 0 ? '+' : '−'} {Math.abs(q.c2)}
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan titik x saat y₁ = y₂!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={-10} 
              max={10} 
              onChange={setVal} 
              accentColor="#93C5FD"
              markEvery={1}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Kunci Titik Potong</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! x = ${q.answer}` : `❌ Kurang tepat. x yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
