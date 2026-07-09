import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const x = 2 + Math.floor(Math.random() * 6)
  const y = 2 + Math.floor(Math.random() * 6)
  const eq1 = x + y
  const eq2 = x - y
  return { eq1, eq2, answer: x }
}

export default function G8TaktikPerangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(5)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(5); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="♟️ Ahli Taktik Perang" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7, fontFamily: 'monospace' }}>
            x + y = {q.eq1}<br />
            x − y = {q.eq2}
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#FDE68A', fontWeight: 700 }}>
            Berapa jumlah pasukan pemanah (x)?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={15} 
              onChange={setVal} 
              accentColor="#FDE68A"
              markEvery={1}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#b45309">Serang!</Btn>
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
