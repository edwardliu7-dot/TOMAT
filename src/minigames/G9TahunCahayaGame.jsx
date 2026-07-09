import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const m1 = 1 + Math.floor(Math.random() * 5)
  const e1 = 4 + Math.floor(Math.random() * 3)
  const m2 = 1 + Math.floor(Math.random() * 5)
  const e2 = 1 + Math.floor(Math.random() * 3)
  let mantissa = m1 * m2
  let exponent = e1 + e2
  if (mantissa >= 10) { mantissa = mantissa / 10; exponent += 1 }
  const answer = `${mantissa} × 10^${exponent}`
  const distractors = new Set([`${mantissa} × 10^${exponent + 1}`, `${mantissa + 1} × 10^${exponent}`, `${mantissa} × 10^${e1 + e2 - 1}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${mantissa} × 10^${exponent + distractors.size + 2}`)
  const options = shuffle([answer, ...distractors])
  return { m1, e1, m2, e2, answer, options }
}

export default function G9TahunCahayaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])

  const choose = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #10071c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌌 Navigasi Tahun Cahaya" onBack={goBack} accentColor="#C4B5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            ({q.m1} × 10^{q.e1}) × ({q.m2} × 10^{q.e2})
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Kalikan dalam notasi ilmiah!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Navigasi tepat!` : `❌ Salah. Jawaban: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
