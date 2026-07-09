import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const k = [2, 3][Math.floor(Math.random() * 2)]
  const area = (2 + Math.floor(Math.random() * 6)) * 5
  const answer = area * k * k
  return { area, k, answer }
}

export default function G9PanelSuryaGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛰️ Perakitan Panel Surya Satelit" onBack={goBack} accentColor="#86EFAC" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#86EFAC', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            PEMBESARAN SKALA STASIUN
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Panel surya lama luasnya <strong style={{ color: '#fff' }}>{q.area} m²</strong>.<br />
            Stasiun diperbesar skalanya sebesar <strong style={{ color: '#fff' }}>{q.k}</strong> kali lipat.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa luas panel surya yang baru?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#16a34a">Pasang Panel</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Luas baru = ${q.answer} m²` : `❌ Kurang tepat. Luas yang benar = ${q.answer} m²`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
