import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const a = 2 + Math.floor(Math.random() * 4)
  const b = 2 + Math.floor(Math.random() * 4)
  const total = 10 + Math.floor(Math.random() * 20)
  const answer = `${a}x + ${b}y = ${total}`
  const distractors = new Set([`${b}x + ${a}y = ${total}`, `${a}x − ${b}y = ${total}`, `${a}x + ${b}y = ${total + 2}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${a}x + ${b}y = ${total + distractors.size + 3}`)
  const options = shuffle([answer, ...distractors])
  return { a, b, total, answer, options }
}

export default function G8TimbanganGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas dan Perak" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDE68A', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            PERCAKAPAN SAUDAGAR KAYA
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            "<strong style={{ color: '#fff' }}>{q.a}</strong> koin emas (x) dan <strong style={{ color: '#fff' }}>{q.b}</strong> koin perak (y) beratnya <strong style={{ color: '#fff' }}>{q.total}</strong> gram."
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Manakah model matematika yang tepat?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Model tepat!` : `❌ Kurang tepat. Model yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
