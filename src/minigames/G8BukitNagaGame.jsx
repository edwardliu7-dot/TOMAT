import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
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
  const [digits, setDigits] = useState('')
  const [negative, setNegative] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setDigits(''); setNegative(false); setFeedback(null) }, [])

  const numericValue = digits === '' ? null : (negative ? -parseInt(digits, 10) : parseInt(digits, 10))

  const confirm = () => {
    if (feedback !== null || numericValue === null) return
    const correct = numericValue === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐲 Mendaki Bukit Naga" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#93C5FD', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            KEMIRINGAN TEBING
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Titik kaki tebing ({q.x1}, {q.y1}) dan titik puncak ({q.x2}, {q.y2}).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Hitung gradien (m) tebing tersebut!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={negative} setNegative={setNegative} allowNegative />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={numericValue === null} color="#1d4ed8">Daki!</Btn>
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
