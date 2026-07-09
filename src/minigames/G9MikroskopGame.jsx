import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const base = [2, 3, 4, 5][Math.floor(Math.random() * 4)]
  const n = 1 + Math.floor(Math.random() * 3)
  const answer = `1/${Math.pow(base, n)}`
  const distractors = new Set([`1/${Math.pow(base, n + 1)}`, `${Math.pow(base, n)}`, `-1/${Math.pow(base, n)}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`1/${Math.pow(base, n) + distractors.size + 2}`)
  const options = shuffle([answer, ...distractors])
  return { base, n, answer, options }
}

export default function G9MikroskopGame({ goBack }) {
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
      <TopBar title="🔬 Mikroskop Sub-Atomik" onBack={goBack} accentColor="#C4B5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.base}<sup>−{q.n}</sup>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Ubah pangkat negatif menjadi bentuk pecahan!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Zoom berhasil dikalibrasi!` : `❌ Salah. Jawaban: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
