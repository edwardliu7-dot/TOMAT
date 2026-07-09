import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
function fmtLine(m, c) { return `y = ${m}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}` }

function genQ() {
  const mOptions = [-3, -2, -1, 1, 2, 3, 4]
  const m = mOptions[Math.floor(Math.random() * mOptions.length)]
  const c = -5 + Math.floor(Math.random() * 11)
  const x1 = 0, y1 = c
  const x2 = 1 + Math.floor(Math.random() * 4)
  const y2 = m * x2 + c
  const answer = fmtLine(m, c)
  const distractors = new Set([fmtLine(m + 1, c), fmtLine(m, c + 2), fmtLine(-m, c)])
  const options = shuffle([answer, ...distractors])
  return { x1, y1, x2, y2, answer, options }
}

export default function G8PetaKerajaanGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗺️ Ahli Peta Kerajaan" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#93C5FD', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            DUA TITIK DESA DITEMUKAN
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Titik A ({q.x1}, {q.y1}) dan titik B ({q.x2}, {q.y2}).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Rumuskan persamaan jalur (garis) yang melewati kedua titik!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Jalur benar!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
