import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Translasi: A(x,y) digeser (a,b) → A'(x+a, y+b). Tanya: x-koordinat A'
function genQ(difficulty = 'medium') {
  const maxXY = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 14 })
  const maxAB = byDifficulty(difficulty, { easy: 4, medium: 8, hard: 12 })
  const x = randInt(1, maxXY)
  const y = randInt(1, maxXY)
  const a = randInt(1, maxAB)
  const b = randInt(1, maxAB)
  const answer = x + a
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { x, y, a, b, answer, min, max }
}

export default function G9KargoGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#0d002e 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Sortir Kargo Pesawat" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Kargo di titik A({q.x}, {q.y}) dipindahkan sejauh ({q.a}, {q.b}) oleh robot. Ke titik A' manakah ia tiba?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#67E8F9', marginBottom: 4 }}>
              A({q.x}, {q.y}) + ({q.a}, {q.b}) → A'(?, ?)
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>x-koordinat A' = {q.x} + {q.a} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x' = ${val}`} accentColor="#67E8F9" />
            <Btn onClick={confirm} color="#67E8F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
