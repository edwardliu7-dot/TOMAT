import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const m = [-4, -3, -2, -1, 1, 2, 3, 4][Math.floor(Math.random() * 8)]
  const x1 = -2 + Math.floor(Math.random() * 3)
  const y1 = -3 + Math.floor(Math.random() * 7)
  const dx = 1 + Math.floor(Math.random() * 3)
  const x2 = x1 + dx
  const y2 = y1 + m * dx
  return { x1, y1, x2, y2, answer: m }
}

export default function G8BukitNagaGame({ goBack }) {
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
      <TopBar title="🐲 Mendaki Bukit Naga" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan gradien dari titik ({q.x1}, {q.y1}) ke ({q.x2}, {q.y2})!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={-5} 
              max={5} 
              onChange={setVal} 
              accentColor="#93C5FD"
              leftLabel="Curam Turun"
              rightLabel="Curam Naik"
              markEvery={1}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Daki!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Gradien = ${q.answer}` : `❌ Kurang tepat. Gradien yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
