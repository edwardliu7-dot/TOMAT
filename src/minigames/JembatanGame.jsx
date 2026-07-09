import React, { useState, useCallback, useEffect } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const PATTERNS = [
  [2, 4, 6, 8, 10, 12],
  [3, 6, 9, 12, 15, 18],
  [5, 10, 15, 20, 25, 30],
  [1, 4, 9, 16, 25, 36],
  [2, 5, 8, 11, 14, 17],
  [10, 20, 30, 40, 50, 60],
  [1, 2, 4, 8, 16, 32],
]

function genSequence() {
  const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
  const missingIdx = Math.floor(Math.random() * pattern.length)
  const correct = String(pattern[missingIdx])
  const seq = pattern.map((v, i) => i === missingIdx ? '?' : String(v))
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 10) + 1
    const sign = Math.random() < 0.5 ? 1 : -1
    const w = String(pattern[missingIdx] + sign * offset)
    if (w !== correct && Number(w) > 0) wrongs.add(w)
  }
  const options = [...wrongs, correct].sort(() => Math.random() - 0.5)
  return { seq, correct, options }
}

export default function JembatanGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genSequence)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genSequence()); setFeedback(null) }, [])

  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #450A0A 0%, #3b0a0a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗿 Jembatan Batu Ajaib" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(249,115,22,0.3)">
          <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>BATU PENYEBERANGAN</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
            Temukan nilai batu yang hilang (?) untuk menyeberangi sungai api!
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
            {q.seq.map((v, i) => (
              <div key={i} style={{
                width: 54, height: 54, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: v === '?' ? '#1a0a00' : '#7F1D1D',
                border: `2px solid ${v === '?' ? '#FDBA74' : 'rgba(253,186,116,0.3)'}`,
                fontSize: v === '?' ? 24 : 18, fontWeight: 900,
                color: v === '?' ? '#FDBA74' : '#fff',
              }}>{v}</div>
            ))}
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#FDBA74', fontWeight: 600 }}>Pilih nilai batu yang hilang:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {q.options.map((opt, i) => {
            const isCorrect = feedback !== null && opt === q.correct
            const isWrong = feedback === false && opt !== q.correct
            return (
              <button key={i} onClick={() => select(opt)} disabled={feedback !== null} style={{
                background: isCorrect ? '#16a34a' : '#1E2128',
                border: `2px solid ${isCorrect ? '#22c55e' : 'rgba(253,186,116,0.25)'}`,
                borderRadius: 12, padding: '16px 8px', color: '#fff', fontSize: 22, fontWeight: 900,
                cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>{opt}</button>
            )
          })}
        </div>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Batu ditemukan! Jembatan aman!' : `❌ Meleset! Batu yang benar adalah ${q.correct}.`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#b45309">Jembatan Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
