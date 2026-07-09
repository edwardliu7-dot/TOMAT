import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const SCENARIOS = [
  { m1: 2, type: 'sejajar', label: 'Tembok Utara harus SEJAJAR dengan tembok bergradien', answer: '2' },
  { m1: 3, type: 'sejajar', label: 'Tembok Utara harus SEJAJAR dengan tembok bergradien', answer: '3' },
  { m1: -4, type: 'sejajar', label: 'Tembok Utara harus SEJAJAR dengan tembok bergradien', answer: '-4' },
  { m1: 2, type: 'tegak lurus', label: 'Tembok Timur harus TEGAK LURUS dengan tembok bergradien', answer: '-1/2' },
  { m1: 4, type: 'tegak lurus', label: 'Tembok Timur harus TEGAK LURUS dengan tembok bergradien', answer: '-1/4' },
  { m1: -1, type: 'tegak lurus', label: 'Tembok Timur harus TEGAK LURUS dengan tembok bergradien', answer: '1' },
  { m1: 1, type: 'tegak lurus', label: 'Tembok Timur harus TEGAK LURUS dengan tembok bergradien', answer: '-1' },
  { m1: -3, type: 'tegak lurus', label: 'Tembok Timur harus TEGAK LURUS dengan tembok bergradien', answer: '1/3' },
]
const WRONG_POOL = ['2', '-2', '3', '-3', '4', '-4', '1', '-1', '1/2', '-1/2', '1/3', '-1/3', '1/4', '-1/4']

function genQ() {
  const item = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const wrongPool = shuffle(WRONG_POOL.filter(v => v !== item.answer)).slice(0, 3)
  const options = shuffle([item.answer, ...wrongPool])
  return { ...item, options }
}

export default function G8TembokBentengGame({ goBack }) {
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
      <TopBar title="🧱 Rancangan Tembok Benteng" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#93C5FD', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            TEMBOK PERTAHANAN BARU
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Tembok Selatan memiliki gradien m₁ = <strong style={{ color: '#fff' }}>{q.m1}</strong>.<br />
            {q.label}.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa gradien m₂ yang harus digunakan?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tembok berdiri kokoh!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
