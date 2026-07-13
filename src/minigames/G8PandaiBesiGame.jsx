import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { aRange, bRange, xRange } = byDifficulty(difficulty, {
    easy: { aRange: [1, 3], bRange: [-2, 2], xRange: [1, 4] },
    medium: { aRange: [2, 5], bRange: [-3, 3], xRange: [1, 6] },
    hard: { aRange: [3, 8], bRange: [-6, 6], xRange: [2, 9] },
  })
  const a = randInt(...aRange)
  const b = randInt(...bRange)
  const x = randInt(...xRange)
  const answer = a * x + b
  const { min, max } = randomSliderRange([b, answer], { step: 1, minPad: 5, maxPad: 15 })
  return { a, b, x, answer, min, max }
}

export default function G8PandaiBesiGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔨 Pabrik Senjata Pandai Besi" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace', marginBottom: 10 }}>
            f(x) = {q.a}x {q.b >= 0 ? '+' : '−'} {Math.abs(q.b)}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
            Berapa hasil keluaran jika x = {q.x}?
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(253,186,116,0.1)', border: '2px dashed rgba(253,186,116,0.4)', borderRadius: 10, padding: '10px 20px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FDBA74' }}>{val}</div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.min} 
              max={q.max} 
              onChange={setVal} 
              accentColor="#FDBA74"
              markEvery={10}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#c2410c">Tempa!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! f(${q.x}) = ${q.answer}` : `❌ Kurang tepat. f(${q.x}) = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
