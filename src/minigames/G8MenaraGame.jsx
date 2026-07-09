import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const aCount = 2 + Math.floor(Math.random() * 2)
  const bCount = 2 + Math.floor(Math.random() * 3)
  const answer = Math.pow(bCount, aCount)
  return { aCount, bCount, answer }
}

export default function G8MenaraGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗼 Kombinasi Kunci Menara" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Berapa banyak cara memetakan {q.aCount} lantai ke {q.bCount} jenis kristal? (bᵃ)
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={30} 
              onChange={setVal} 
              accentColor="#FDBA74"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#c2410c">Buka Kunci</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! ${q.bCount}^${q.aCount} = ${q.answer}` : `❌ Kurang tepat. ${q.bCount}^${q.aCount} = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
