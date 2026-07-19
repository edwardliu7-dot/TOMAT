import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const aMax = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 15 })
  const dMax = byDifficulty(difficulty, { easy: 3, medium: 5, hard: 7 })
  const nMax = byDifficulty(difficulty, { easy: 5, medium: 7, hard: 10 })
  // find a (first term), given Un, d, n
  const d = randInt(1, dMax)
  const n = randInt(3, nMax)
  const a = randInt(2, aMax)
  const un = a + (n - 1) * d
  const answer = a
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { d, n, un, answer, min, max }
}

export default function G8DungeonGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d0d1a 0%,#1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗝️ Sandi Pintu Dungeon" onBack={goBack} accentColor="#FCD34D" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,211,77,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pintu dungeon terkunci! Sandi-nya adalah suku pertama dari barisan aritmetika dengan beda {q.d}. Suku ke-{q.n} adalah {q.un}.</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#FCD34D', marginBottom: 4 }}>
              U<sub>{q.n}</sub> = a + ({q.n}−1) × {q.d} = {q.un}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Suku pertama (a) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`a = ${val}`} accentColor="#FCD34D" />
            <Btn onClick={confirm} color="#FCD34D">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
