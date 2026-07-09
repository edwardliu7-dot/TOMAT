import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 2 + Math.floor(Math.random() * 5)
  const b = 2 + Math.floor(Math.random() * 4)
  const n = 15
  const answer = a + (n - 1) * b
  return { a, b, n, answer }
}

export default function G8RamalanGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2d0a00 0%, #1a0a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔮 Ramalan Penyihir Agung" onBack={goBack} accentColor="#FCA5A5" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FCA5A5', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            BOLA KRISTAL RAMALAN
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Gelombang pertama monster berjumlah <strong style={{ color: '#fff' }}>{q.a}</strong>.<br />
            Setiap gelombang berikutnya bertambah <strong style={{ color: '#fff' }}>{q.b}</strong> monster (Uₙ = a + (n−1)b).
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 15, color: '#FCA5A5', fontWeight: 800 }}>
            Berapa jumlah monster pada gelombang ke-{q.n}?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#dc2626">Ramalkan!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Jawabannya ${q.answer}` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
