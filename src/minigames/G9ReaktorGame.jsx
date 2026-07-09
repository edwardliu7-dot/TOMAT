import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
function fmt(coef, cons) { return `${coef}x ${cons >= 0 ? '+' : '−'} ${Math.abs(cons)}` }

function genQ() {
  const a = 1 + Math.floor(Math.random() * 5)
  const b = -6 + Math.floor(Math.random() * 13)
  const c = 1 + Math.floor(Math.random() * 5)
  const d = -6 + Math.floor(Math.random() * 13)
  const coef = a + c
  const cons = b + d
  const answer = fmt(coef, cons)
  const distractors = new Set([fmt(coef + 1, cons), fmt(coef, cons + 2), fmt(a - c, cons)])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(fmt(coef, cons + distractors.size + 3))
  const options = shuffle([answer, ...distractors])
  return { a, b, c, d, answer, options }
}

export default function G9ReaktorGame({ goBack }) {
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
      <TopBar title="⚡ Transfer Energi Reaktor" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            GABUNGKAN DAYA REAKTOR
          </div>
          <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8, fontFamily: 'monospace' }}>
            Reaktor Kiri: ({fmt(q.a, q.b)})<br />
            Reaktor Kanan: ({fmt(q.c, q.d)})
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Jumlahkan keduanya untuk total daya meriam plasma!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Energi tersambung!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
