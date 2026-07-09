import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const a1 = 1 + Math.floor(Math.random() * 4)
  const a2 = 1 + Math.floor(Math.random() * 4)
  const c1 = 1 + Math.floor(Math.random() * 5)
  const c2 = 1 + Math.floor(Math.random() * 5)
  const A = a1 + a2
  const B = c1 + c2
  const answer = `${A}x² + ${B}x`
  const distractors = new Set([`${A + 1}x² + ${B}x`, `${A}x² + ${B + 1}x`, `${B}x² + ${A}x`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${A + distractors.size + 2}x² + ${B}x`)
  const options = shuffle([answer, ...distractors])
  return { a1, a2, c1, c2, answer, options }
}

export default function G9KargoGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Sortir Kargo Pesawat" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            RUANG PENYIMPANAN KARGO
          </div>
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            {q.a1}x² + {q.c1}x + {q.a2}x² + {q.c2}x
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Kelompokkan peti sejenis (variabel sama) agar pesawat seimbang. Sederhanakan bentuk aljabar di atas!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Kargo tersortir sempurna!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
