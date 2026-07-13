import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { aRange, bRange, xRange, yRange, sliderMax } = byDifficulty(difficulty, {
    easy: { aRange: [1, 3], bRange: [1, 2], xRange: [1, 3], yRange: [1, 3], sliderMax: 8 },
    medium: { aRange: [2, 5], bRange: [2, 4], xRange: [1, 4], yRange: [1, 5], sliderMax: 10 },
    hard: { aRange: [4, 8], bRange: [3, 6], xRange: [2, 6], yRange: [2, 8], sliderMax: 15 },
  })
  const a = randInt(...aRange)
  const b = randInt(...bRange)
  const x = randInt(...xRange)
  const y = randInt(...yRange)
  const total = a * x + b * y
  return { a, b, x, total, answer: y, sliderMax }
}

export default function G8PedagangMisteriusGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧪 Pedagang Misterius" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            {q.a}x + {q.b}y = {q.total}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Jika x = {q.x}, tentukan nilai y!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={q.sliderMax} 
              onChange={setVal} 
              accentColor="#FDE68A"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#b45309">Beli!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! y = ${q.answer}` : `❌ Kurang tepat. y yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
