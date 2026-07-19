import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Rotasi 180°: A(-x, -y) → A'(x, y). Tanya: x-koordinat A' = x (positif)
function genQ(difficulty = 'medium') {
  const maxXY = byDifficulty(difficulty, { easy: 8, medium: 14, hard: 20 })
  const x = randInt(2, maxXY)
  const y = randInt(2, maxXY)
  const answer = x
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 12 })
  return { x, y, answer, min, max }
}

export default function G9MikroskopGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#001400 0%,#001a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔬 Mikroskop Sub-Atomik" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Partikel di titik A(-{q.x}, -{q.y}) dirotasikan 180° terhadap O(0,0). Berapa x-koordinat A'?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4ADE80', marginBottom: 4 }}>
              A(-{q.x}, -{q.y}) →<sub>180°</sub> A'(?, {q.y})
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Rumus rotasi 180°: (x, y) → (-x, -y)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>x-koordinat A' = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x' = ${val}`} accentColor="#4ADE80" />
            <Btn onClick={confirm} color="#4ADE80">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
