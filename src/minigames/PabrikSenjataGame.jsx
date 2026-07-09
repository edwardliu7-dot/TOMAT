import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { expr: '(−3) × 4', answer: -12, hint: 'negatif × positif = negatif' },
  { expr: '(−5) × (−3)', answer: 15, hint: 'negatif × negatif = positif' },
  { expr: '6 × (−7)', answer: -42, hint: 'positif × negatif = negatif' },
  { expr: '(−8) × (−4)', answer: 32, hint: 'negatif × negatif = positif' },
  { expr: '(−20) ÷ 4', answer: -5, hint: 'negatif ÷ positif = negatif' },
  { expr: '(−18) ÷ (−6)', answer: 3, hint: 'negatif ÷ negatif = positif' },
  { expr: '24 ÷ (−8)', answer: -3, hint: 'positif ÷ negatif = negatif' },
  { expr: '(−36) ÷ (−9)', answer: 4, hint: 'negatif ÷ negatif = positif' },
  { expr: '(−4) × 5 × (−2)', answer: 40, hint: 'dua tanda negatif = positif' },
  { expr: '(−3) × (−3) × (−1)', answer: -9, hint: 'tiga tanda negatif = negatif' },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

export default function PabrikRobotGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [digits, setDigits] = useState('')
  const [negative, setNegative] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setDigits(''); setNegative(false); setFeedback(null) }, [])

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') { setDigits(p => p.slice(0, -1)); return }
    if (k === '+/−') { setNegative(p => !p); return }
    if (digits.length >= 4) return
    setDigits(p => p + k)
  }

  const displayValue = digits === '' ? '?' : `${negative ? '−' : ''}${digits}`
  const numericValue = digits === '' ? null : (negative ? -parseInt(digits, 10) : parseInt(digits, 10))

  const confirm = () => {
    if (feedback !== null || numericValue === null) return
    const correct = numericValue === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '+/−', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🤖 Pabrik Pasukan Robot" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM PRODUKSI ROBOT</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            {['🤖', '🤖', '🤖'].map((r, i) => (
              <div key={i} style={{ fontSize: 32, opacity: 0.6 + i * 0.2 }}>{r}</div>
            ))}
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            💡 {q.hint}
          </div>
        </Card>

        {/* Calculator display */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, textAlign: 'center' }}>Ketik jawabanmu:</div>
          <div style={{ background: '#0a1628', borderRadius: 12, padding: '14px 20px', textAlign: 'right', marginBottom: 14, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.3)' : feedback ? '#34D399' : '#ef4444'}` }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: feedback === null ? '#fff' : feedback ? '#34D399' : '#ef4444', fontFamily: 'monospace', minHeight: 44 }}>
              {displayValue}
            </div>
          </div>

          {/* Numpad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {numpadKeys.map(k => {
              const isSpecial = k === '+/−' || k === '⌫'
              const isActive = k === '+/−' && negative
              return (
                <button key={k} onClick={() => pressKey(k)} disabled={feedback !== null}
                  style={{ padding: '14px 8px', borderRadius: 12, border: `1px solid ${isActive ? '#67E8F9' : 'rgba(103,232,249,0.2)'}`, background: isActive ? 'rgba(103,232,249,0.2)' : isSpecial ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)', color: isActive ? '#67E8F9' : isSpecial ? '#f59e0b' : '#fff', fontSize: k === '+/−' ? 13 : 20, fontWeight: 700, cursor: feedback !== null ? 'not-allowed' : 'pointer', transition: 'all 0.1s' }}>
                  {k}
                </button>
              )
            })}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={numericValue !== null ? '#0e7490' : '#334155'}>
            {numericValue !== null ? `✅ Kirim Jawaban: ${displayValue}` : 'Ketik jawaban dulu...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pabrik berjalan! Hasil: ${q.answer}` : `❌ Error sistem! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Produksi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
