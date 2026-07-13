import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { m1Range, m2ExtraRange, xTargetRange, c1Range, sliderBound } = byDifficulty(difficulty, {
    easy: { m1Range: [1, 2], m2ExtraRange: [1, 2], xTargetRange: [-2, 2], c1Range: [0, 3], sliderBound: 5 },
    medium: { m1Range: [1, 3], m2ExtraRange: [1, 3], xTargetRange: [-3, 3], c1Range: [0, 4], sliderBound: 10 },
    hard: { m1Range: [1, 5], m2ExtraRange: [2, 5], xTargetRange: [-6, 6], c1Range: [0, 6], sliderBound: 15 },
  })
  const m1 = randInt(...m1Range)
  const m2 = m1 + randInt(...m2ExtraRange)
  const xTarget = randInt(...xTargetRange)
  const c1 = randInt(...c1Range)
  const c2 = c1 + (m1 - m2) * xTarget
  return { m1, c1, m2, c2, answer: xTarget, sliderBound }
}

export default function G8PertahananBerlapisGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Sistem Pertahanan Berlapis" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7, fontFamily: 'monospace' }}>
            y₁ = {q.m1}x {q.c1 >= 0 ? '+' : '−'} {Math.abs(q.c1)}<br />
            y₂ = {q.m2}x {q.c2 >= 0 ? '+' : '−'} {Math.abs(q.c2)}
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan titik x saat y₁ = y₂!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={-q.sliderBound} 
              max={q.sliderBound} 
              onChange={setVal} 
              accentColor="#93C5FD"
              markEvery={1}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Kunci Titik Potong</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! x = ${q.answer}` : `❌ Kurang tepat. x yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
