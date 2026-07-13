import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { mOptions, x1Range, y1Range, dxRange, sliderBound } = byDifficulty(difficulty, {
    easy: { mOptions: [-2, -1, 1, 2], x1Range: [-1, 1], y1Range: [-2, 2], dxRange: [1, 2], sliderBound: 3 },
    medium: { mOptions: [-4, -3, -2, -1, 1, 2, 3, 4], x1Range: [-2, 0], y1Range: [-3, 3], dxRange: [1, 3], sliderBound: 5 },
    hard: { mOptions: [-7, -6, -5, 5, 6, 7], x1Range: [-3, 1], y1Range: [-5, 5], dxRange: [1, 4], sliderBound: 8 },
  })
  const m = mOptions[Math.floor(Math.random() * mOptions.length)]
  const x1 = randInt(...x1Range)
  const y1 = randInt(...y1Range)
  const dx = randInt(...dxRange)
  const x2 = x1 + dx
  const y2 = y1 + m * dx
  return { x1, y1, x2, y2, answer: m, sliderBound }
}

export default function G8BukitNagaGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🐲 Mendaki Bukit Naga" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan gradien dari titik ({q.x1}, {q.y1}) ke ({q.x2}, {q.y2})!
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
              leftLabel="Curam Turun"
              rightLabel="Curam Naik"
              markEvery={1}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Daki!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Gradien = ${q.answer}` : `❌ Kurang tepat. Gradien yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
