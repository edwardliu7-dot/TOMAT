import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { mOptions, cRange, xRange } = byDifficulty(difficulty, {
    easy: { mOptions: [-2, -1, 1, 2], cRange: [-3, 3], xRange: [-2, 2] },
    medium: { mOptions: [-4, -3, -2, -1, 1, 2, 3, 4], cRange: [-5, 5], xRange: [-3, 3] },
    hard: { mOptions: [-7, -6, -5, 5, 6, 7], cRange: [-8, 8], xRange: [-5, 5] },
  })
  const m = mOptions[Math.floor(Math.random() * mOptions.length)]
  const c = randInt(...cRange)
  const x = randInt(...xRange)
  const answer = m * x + c
  const { min, max } = randomSliderRange([c, answer], { step: 1, minPad: 8, maxPad: 20 })
  return { m, c, x, answer, min, max }
}

export default function G8BalistaGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🏹 Pemanah Balista" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            y = {q.m}x {q.c >= 0 ? '+' : '−'} {Math.abs(q.c)}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Tentukan ketinggian y pada x = {q.x}!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.min} 
              max={q.max} 
              onChange={setVal} 
              accentColor="#93C5FD"
              markEvery={10}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">TEMBAK 🏹</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sasaran! y = ${q.answer}` : `❌ Meleset. y yang benar = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
