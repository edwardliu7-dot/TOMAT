import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 2 + Math.floor(Math.random() * 4)
  const b = 2 + Math.floor(Math.random() * 3)
  const x = 1 + Math.floor(Math.random() * 4)
  const y = 1 + Math.floor(Math.random() * 5)
  const total = a * x + b * y
  return { a, b, x, total, answer: y }
}

export default function G8PedagangMisteriusGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧪 Pedagang Misterius" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            {q.a}x + {q.b}y = {q.total}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Jika x = {q.x}, tentukan nilai y!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={10} 
              onChange={setVal} 
              accentColor="#FDE68A"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#b45309">Beli!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! y = ${q.answer}` : `❌ Kurang tepat. y yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
