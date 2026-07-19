import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas trapesium = ½ × (a + b) × t
function genQ(difficulty = 'medium') {
  const maxSide = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 16 })
  const maxT = byDifficulty(difficulty, { easy: 6, medium: 8, hard: 12 })
  let a, b, t
  do {
    a = randInt(2, maxSide)
    b = randInt(2, maxSide)
    t = randInt(2, maxT)
  } while (((a + b) * t) % 2 !== 0)
  const answer = ((a + b) * t) / 2
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 30 })
  return { a, b, t, answer, min, max }
}

export default function G8PandaiBesiGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d00 0%,#2e1a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔨 Pabrik Senjata Pandai Besi" onBack={goBack} accentColor="#FB923C" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(251,146,60,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pandai besi menempa pelat baja berbentuk trapesium. Sisi atas {q.a} cm, sisi bawah {q.b} cm, tinggi {q.t} cm.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#FB923C', marginBottom: 4 }}>
              L = ½ × ({q.a} + {q.b}) × {q.t}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas pelat baja (cm²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} cm²`} accentColor="#FB923C" />
            <Btn onClick={confirm} color="#FB923C">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
