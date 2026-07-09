import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const k = 2 + Math.floor(Math.random() * 4)
  const s1 = 1 + Math.floor(Math.random() * 4)
  const s2 = 2 + Math.floor(Math.random() * 8)
  const h1 = k * s1
  const answer = k * s2
  return { h1, s1, s2, answer }
}

export default function G9BayanganMenaraGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(1); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗽 Bayangan Menara Alien" onBack={goBack} accentColor="#86EFAC" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Pesawat (tinggi {q.h1}m) berbayang {q.s1}m.<br />
            Menara memiliki bayangan sepanjang {q.s2}m.
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa tinggi menara komunikasi alien?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={1} max={60} step={1}
              onChange={setVal}
              accentColor="#86EFAC" unit=" m"
              leftLabel="1m" rightLabel="60m"
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#16a34a">Ukur!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Tinggi menara = ${q.answer} m` : `❌ Salah. Tinggi yang benar = ${q.answer} m`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
