import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUADRANTS = [
  { label: 'Kuadran I (kanan atas)', sx: 1, sy: 1 },
  { label: 'Kuadran II (kiri atas)', sx: -1, sy: 1 },
  { label: 'Kuadran III (kiri bawah)', sx: -1, sy: -1 },
  { label: 'Kuadran IV (kanan bawah)', sx: 1, sy: -1 },
]

function genQ() {
  const x = 1 + Math.floor(Math.random() * 6)
  const y = 1 + Math.floor(Math.random() * 6)
  const quad = QUADRANTS[Math.floor(Math.random() * 4)]
  const answer = `(${quad.sx * x}, ${quad.sy * y})`
  const distractors = new Set()
  distractors.add(`(${-quad.sx * x}, ${quad.sy * y})`)
  distractors.add(`(${quad.sx * x}, ${-quad.sy * y})`)
  distractors.add(`(${-quad.sx * x}, ${-quad.sy * y})`)
  const options = shuffle([answer, ...distractors])
  return { x, y, quad, answer, options }
}

export default function G8RadarNagaGame({ goBack }) {
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
      <TopBar title="🐉 Radar Naga Pengintai" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            TEMUKAN TENDA MUSUH
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Tenda musuh berjarak <strong style={{ color: '#fff' }}>{q.x}</strong> satuan mendatar dan <strong style={{ color: '#fff' }}>{q.y}</strong> satuan tegak dari pusat peta, di <strong style={{ color: '#FDBA74' }}>{q.quad.label}</strong>.
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>Titik koordinat manakah yang tepat?</div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Naga menjatuhkan suar tepat sasaran!` : `❌ Meleset. Titik yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
