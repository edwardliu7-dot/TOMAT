import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const p = 10 + Math.floor(Math.random() * 20)
  const s = 10 + Math.floor(Math.random() * 20)
  const total1 = 2 * p + s
  const total2 = p + 2 * s
  return { total1, total2, answer: p }
}

export default function G8PasarBarterKsatriaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(15)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(15); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛒 Pasar Barter Ksatria" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            2⚔️ + 1🛡️ = {q.total1}🪙<br />
            1⚔️ + 2🛡️ = {q.total2}🪙<br />
            Berapa harga 1⚔️?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={5} 
              max={40} 
              onChange={setVal} 
              accentColor="#FDE68A"
              unit="🪙"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#b45309">Tawar!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Harga pedang = ${q.answer} koin` : `❌ Kurang tepat. Harga pedang yang benar = ${q.answer} koin`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
