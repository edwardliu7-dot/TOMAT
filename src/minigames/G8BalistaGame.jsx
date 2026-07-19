import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas belah ketupat = ½ × d1 × d2
function genQ(difficulty = 'medium') {
  const dMax = byDifficulty(difficulty, { easy: 10, medium: 14, hard: 18 })
  let d1, d2
  do {
    d1 = randInt(2, dMax)
    d2 = randInt(2, dMax)
  } while ((d1 * d2) % 2 !== 0)
  const answer = (d1 * d2) / 2
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 40 })
  return { d1, d2, answer, min, max }
}

export default function G8BalistaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0000 0%,#2e0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏹 Pemanah Balista" onBack={goBack} accentColor="#FCA5A5" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Target berbentuk belah ketupat. Diagonal pertama {q.d1} cm, diagonal kedua {q.d2} cm. Hitung luas target!</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#FCA5A5', marginBottom: 4 }}>
              L = ½ × {q.d1} × {q.d2}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas target (cm²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} cm²`} accentColor="#FCA5A5" />
            <Btn onClick={confirm} color="#FCA5A5">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
