import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const QUESTIONS = [
  { expr: '2,4 + 1,7', answer: 4.1, display: '2,4 + 1,7' },
  { expr: '5,6 − 2,3', answer: 3.3, display: '5,6 − 2,3' },
  { expr: '0,8 + 0,7', answer: 1.5, display: '0,8 + 0,7' },
  { expr: '3,2 × 2', answer: 6.4, display: '3,2 × 2' },
  { expr: '7,5 ÷ 3', answer: 2.5, display: '7,5 ÷ 3' },
  { expr: '1,25 + 0,75', answer: 2.0, display: '1,25 + 0,75' },
  { expr: '4,8 − 1,3', answer: 3.5, display: '4,8 − 1,3' },
  { expr: '0,6 × 5', answer: 3.0, display: '0,6 × 5' },
  { expr: '9,0 ÷ 4', answer: 2.25, display: '9,0 ÷ 4' },
  { expr: '2,5 + 3,75', answer: 6.25, display: '2,5 + 3,75' },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

export default function TimbanganEmasGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [input, setInput] = useState('')
  const [hasDecimal, setHasDecimal] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setInput(''); setHasDecimal(false); setFeedback(null) }, [])

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') {
      const next = input.slice(0, -1)
      setInput(next)
      setHasDecimal(next.includes(','))
      return
    }
    if (k === ',') {
      if (hasDecimal || input === '') return
      setInput(p => p + ',')
      setHasDecimal(true)
      return
    }
    if (input.length >= 6) return
    // After decimal, limit to 2 digits
    if (hasDecimal) {
      const decPart = input.split(',')[1] || ''
      if (decPart.length >= 2) return
    }
    setInput(p => p + k)
  }

  const inputNum = input === '' ? null : parseFloat(input.replace(',', '.'))
  const answerStr = String(q.answer).replace('.', ',')

  const confirm = () => {
    if (feedback !== null || input === '' || inputNum === null) return
    const correct = Math.abs(inputNum - q.answer) < 0.001
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  // Scale animation: tilt based on input value vs answer
  const tilt = inputNum !== null ? Math.max(-15, Math.min(15, (inputNum - q.answer) * 8)) : 0

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas Digital" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(234,179,8,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>LABORATORIUM EMAS PRESISI TINGGI</div>

          {/* Scale visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, position: 'relative', height: 100 }}>
            {/* Pivot */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 6, height: 60, background: 'rgba(234,179,8,0.6)', borderRadius: 3, transformOrigin: 'top center' }} />
            {/* Balance beam */}
            <div style={{ position: 'absolute', top: 52, left: '15%', right: '15%', height: 4, background: '#EAB308', borderRadius: 2, transformOrigin: 'center center', transform: `rotate(${tilt}deg)`, transition: 'transform 0.3s' }}>
              {/* Left pan: formula */}
              <div style={{ position: 'absolute', left: -10, top: 4, width: 80, textAlign: 'center', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: 8, padding: '6px 4px' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#EAB308', fontFamily: 'monospace' }}>{q.display}</div>
              </div>
              {/* Right pan: student input */}
              <div style={{ position: 'absolute', right: -10, top: 4, width: 80, textAlign: 'center', background: inputNum !== null ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${inputNum !== null ? 'rgba(103,232,249,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '6px 4px' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: inputNum !== null ? '#67E8F9' : '#475569', fontFamily: 'monospace' }}>{input || '?'}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Hitung dengan presisi, lalu ketik jawaban:
          </div>

          {/* Display */}
          <div style={{ background: '#1a1a0d', border: `2px solid ${feedback === null ? '#EAB308' : feedback ? '#34D399' : '#ef4444'}`, borderRadius: 10, padding: '12px 20px', textAlign: 'right', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: '#EAB308', letterSpacing: 2, marginBottom: 2 }}>DIGITAL SCALE</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: feedback === null ? '#EAB308' : feedback ? '#34D399' : '#ef4444', fontFamily: 'monospace', minHeight: 38 }}>
              {input || '0'} gram
            </div>
          </div>
        </Card>

        {/* Numpad */}
        <Card border="rgba(234,179,8,0.2)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {numpadKeys.map((k, idx) => {
              const isDecimal = k === ','
              const isBack = k === '⌫'
              const disabledDecimal = isDecimal && hasDecimal
              return (
                <button key={`${k}-${idx}`} onClick={() => pressKey(k)} disabled={feedback !== null || disabledDecimal}
                  style={{ padding: '14px 8px', borderRadius: 12, border: `1px solid ${isBack ? 'rgba(239,68,68,0.3)' : isDecimal ? 'rgba(234,179,8,0.3)' : 'rgba(234,179,8,0.15)'}`, background: isBack ? 'rgba(239,68,68,0.08)' : isDecimal ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)', color: isBack ? '#ef4444' : isDecimal ? '#EAB308' : '#fff', fontSize: 20, fontWeight: 700, cursor: (feedback !== null || disabledDecimal) ? 'not-allowed' : 'pointer', opacity: disabledDecimal ? 0.3 : 1 }}>
                  {k}
                </button>
              )
            })}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={input !== '' ? '#0e7490' : '#334155'}>
            {input !== '' ? `✅ Kirim: ${input} gram` : 'Ketik jawaban dulu...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Timbangan akurat! Hasil: ${answerStr}` : `❌ Tidak presisi! Jawaban benar: ${answerStr}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pengukuran Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
