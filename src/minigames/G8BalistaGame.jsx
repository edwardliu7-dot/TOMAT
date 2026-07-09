import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const m = [-4, -3, -2, -1, 1, 2, 3, 4][Math.floor(Math.random() * 8)]
  const c = -5 + Math.floor(Math.random() * 11)
  const x = -3 + Math.floor(Math.random() * 7)
  const answer = m * x + c
  return { m, c, x, answer }
}

export default function G8BalistaGame({ goBack }) {
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
      <TopBar title="🏹 Pemanah Balista" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#93C5FD', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            LINTASAN PANAH BALISTA
          </div>
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            y = {q.m}x {q.c >= 0 ? '+' : '−'} {Math.abs(q.c)}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Target berada pada x = <strong style={{ color: '#fff' }}>{q.x}</strong>. Di ketinggian berapa (y) panah harus melesat agar mengenai target?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={negative} setNegative={setNegative} allowNegative />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={numericValue === null} color="#1d4ed8">TEMBAK 🏹</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sasaran! y = ${q.answer}` : `❌ Meleset. y yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
