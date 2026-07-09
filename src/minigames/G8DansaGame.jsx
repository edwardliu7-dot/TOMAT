import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const canMatch = Math.random() < 0.5
  const n = 3 + Math.floor(Math.random() * 4)
  const m = canMatch ? n : n + 1 + Math.floor(Math.random() * 2)
  return { n, m, answer: canMatch ? 'Bisa' : 'Tidak Bisa', options: ['Bisa', 'Tidak Bisa'] }
}

export default function G8DansaGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="💃 Pesta Dansa Kerajaan" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            PASANGAN DANSA KERAJAAN
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Ada <strong style={{ color: '#fff' }}>🤺 {q.n} ksatria</strong> dan <strong style={{ color: '#fff' }}>👸 {q.m} putri</strong>.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Bisakah dibentuk korespondensi satu-satu (setiap ksatria dapat tepat satu pasangan, tanpa sisa)?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sekali!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
