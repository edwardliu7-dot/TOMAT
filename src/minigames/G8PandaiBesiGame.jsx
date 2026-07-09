import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔨 Pabrik Senjata Pandai Besi" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            MESIN PENCETAK PEDANG
          </div>
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            f(x) = {q.a}x {q.b >= 0 ? '+' : '−'} {Math.abs(q.b)}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Masukkan <strong style={{ color: '#fff' }}>{q.x}</strong> balok besi (x = {q.x}). Berapa hasil tuas keluaran?
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(253,186,116,0.1)', border: '2px dashed rgba(253,186,116,0.4)', borderRadius: 10, padding: '10px 20px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FDBA74' }}>{numericValue !== null ? numericValue : '?'}</div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={negative} setNegative={setNegative} allowNegative />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={numericValue === null} color="#c2410c">Tempa!</Btn>
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
