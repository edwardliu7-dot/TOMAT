import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 2 + Math.floor(Math.random() * 4)
  const b = -3 + Math.floor(Math.random() * 7)
  const x = 1 + Math.floor(Math.random() * 6)
  const answer = a * x + b
  return { a, b, x, answer }
}

export default function G8PandaiBesiGame({ goBack }) {
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
      <TopBar title="🔨 Pabrik Senjata Pandai Besi" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            f(x) = {q.a}x {q.b >= 0 ? '+' : '−'} {Math.abs(q.b)}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Berapa hasil keluaran jika x = {q.x}?
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(253,186,116,0.1)', border: '2px dashed rgba(253,186,116,0.4)', borderRadius: 10, padding: '10px 20px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FDBA74' }}>{val}</div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={-10} 
              max={30} 
              onChange={setVal} 
              accentColor="#FDBA74"
              markEvery={10}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#c2410c">Tempa!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! f(${q.x}) = ${q.answer}` : `❌ Kurang tepat. f(${q.x}) = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
