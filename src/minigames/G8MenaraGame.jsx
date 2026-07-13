import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { aRange, bRange } = byDifficulty(difficulty, {
    easy: { aRange: [2, 2], bRange: [2, 3] },
    medium: { aRange: [2, 3], bRange: [2, 4] },
    hard: { aRange: [3, 4], bRange: [2, 3] },
  })
  const aCount = randInt(...aRange)
  const bCount = randInt(...bRange)
  const answer = Math.pow(bCount, aCount)
  const { min, max } = randomSliderRange([0, answer], { step: 1, minPad: 5, maxPad: 15 })
  return { aCount, bCount, answer, min, max }
}

export default function G8MenaraGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🗼 Kombinasi Kunci Menara" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Berapa banyak cara memetakan {q.aCount} lantai ke {q.bCount} jenis kristal? (bᵃ)
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
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#c2410c">Buka Kunci</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! ${q.bCount}^${q.aCount} = ${q.answer}` : `❌ Kurang tepat. ${q.bCount}^${q.aCount} = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
