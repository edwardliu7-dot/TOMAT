import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const x = 3 + Math.floor(Math.random() * 5)
  const y = 2 + Math.floor(Math.random() * 5)
  const sum = x + y
  const diff = x - y
  const answer = `x + y = ${sum} ; x − y = ${diff}`
  const distractors = new Set([
    `x + y = ${sum + 1} ; x − y = ${diff}`,
    `x + y = ${sum} ; x − y = ${diff + 1}`,
    `x − y = ${sum} ; x + y = ${diff}`,
  ])
  const options = shuffle([answer, ...distractors])
  return { x, y, sum, diff, answer, options }
}

export default function G8PenyelamatanGame({ goBack }) {
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
      <TopBar title="🆘 Misi Penyelamatan Ganda" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDE68A', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            DUA SANDERA, DUA PETUNJUK
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Jumlah dua nilai rahasia (x + y) adalah <strong style={{ color: '#fff' }}>{q.sum}</strong>.<br />
            Selisih keduanya (x − y) adalah <strong style={{ color: '#fff' }}>{q.diff}</strong>.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Manakah sistem persamaan yang tepat menggambarkan kedua kondisi ini?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Sandera diselamatkan!` : `❌ Kurang tepat. Sistem yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
