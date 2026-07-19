import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas persegi = s², lantai dansa berbentuk persegi
function genQ(difficulty = 'medium') {
  const sMax = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 15 })
  const s = randInt(3, sMax)
  const answer = s * s
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 50 })
  return { s, answer, min, max }
}

export default function G8DansaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d2e 0%,#2e0d2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="💃 Pesta Dansa Kerajaan" onBack={goBack} accentColor="#E879F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(232,121,249,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Lantai dansa kerajaan berbentuk persegi dengan sisi {q.s} m. Berapa luas lantai yang harus dihias?</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#E879F9', marginBottom: 4 }}>
              L = s² = {q.s}²
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas lantai (m²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} m²`} accentColor="#E879F9" />
            <Btn onClick={confirm} color="#E879F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
