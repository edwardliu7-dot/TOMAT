import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Rotasi 90° searah jarum jam: (x,y) → (y, -x). Tanya: x-koordinat hasil = y (positif)
function genQ(difficulty = 'medium') {
  const maxXY = byDifficulty(difficulty, { easy: 8, medium: 14, hard: 20 })
  const x = randInt(2, maxXY)
  const y = randInt(2, maxXY)
  const answer = y // new x = y (from CW 90° rotation)
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 12 })
  return { x, y, answer, min, max }
}

export default function G9SinyalAlienGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty); setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])
  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct); survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d001a 0%,#1a002e 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Dekripsi Sinyal Alien" onBack={goBack} accentColor="#C084FC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(192,132,252,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Sinyal alien di titik A({q.x}, {q.y}) dirotasikan 90° searah jarum jam terhadap pusat O(0,0). Berapa x-koordinat A'?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C084FC', marginBottom: 4 }}>
              A({q.x}, {q.y}) →<sub>90° CW</sub> A'(?, -{q.x})
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Rumus rotasi 90° CW: (x, y) → (y, -x)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>x-koordinat A' = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x' = ${val}`} accentColor="#C084FC" />
            <Btn onClick={confirm} color="#C084FC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
