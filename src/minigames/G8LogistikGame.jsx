import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const c = Math.floor(Math.random() * 5)
  const v = 2 + Math.floor(Math.random() * 5)
  const t = 2 + Math.floor(Math.random() * 6)
  const answer = c + v * t
  return { c, v, t, answer }
}

export default function G8LogistikGame({ goBack }) {
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
      <TopBar title="🚚 Jalur Suplai Logistik" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Awal: {q.c} km, Kecepatan: {q.v} km/jam. Dimana posisinya setelah {q.t} jam?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={50} 
              onChange={setVal} 
              accentColor="#93C5FD"
              unit=" km"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Prediksi Posisi</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Posisi = ${q.answer} km` : `❌ Kurang tepat. Posisi yang benar = ${q.answer} km`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
