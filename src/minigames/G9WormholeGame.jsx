import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const NONSQUARES = [2, 3, 5, 6, 7]

function genQ() {
  const k = 2 + Math.floor(Math.random() * 4)
  const m = NONSQUARES[Math.floor(Math.random() * NONSQUARES.length)]
  const inside = k * k * m
  const answer = `${k}√${m}`
  const distractors = new Set([`${k + 1}√${m}`, `${k}√${m + 1}`, `√${inside}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${k}√${m + distractors.size + 5}`)
  const options = shuffle([answer, ...distractors])
  return { inside, answer, options }
}

export default function G9WormholeGame({ goBack }) {
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
      <TopBar title="🌀 Generator Lubang Cacing" onBack={goBack} accentColor="#C4B5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#C4B5FD', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            STABILKAN INTI ENERGI PORTAL
          </div>
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            √{q.inside}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Sederhanakan bentuk akar ini agar selaras dengan frekuensi portal hyperspace!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Portal terbuka!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
