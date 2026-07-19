import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Probability: dice roll, how many outcomes satisfy condition
// Dadu 1-6: bilangan > k? → answer = 6-k
function genQ(difficulty = 'medium') {
  // easy: > k with k in {1,2,3}; hard: <= k
  const type = byDifficulty(difficulty, { easy: 'gt', medium: 'gt', hard: 'lt' })
  const k = byDifficulty(difficulty, { easy: randInt(1, 3), medium: randInt(2, 4), hard: randInt(2, 4) })
  const answer = type === 'gt' ? 6 - k : k - 1
  const label = type === 'gt' ? `lebih dari ${k}` : `kurang dari ${k}`
  const { min, max } = randomSliderRange([1, 6], { step: 1, minPad: 1, maxPad: 3 })
  return { k, label, answer, min, max }
}

export default function G8PedagangMisteriusGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d0d1a 0%,#1a0d2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧪 Pedagang Misterius" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pedagang misterius melempar dadu (angka 1–6). Berapa banyak hasil yang {q.label}?</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#A78BFA', marginBottom: 4 }}>🎲 1, 2, 3, 4, 5, 6</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>n(A) = banyaknya angka {q.label} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`n(A) = ${val}`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
