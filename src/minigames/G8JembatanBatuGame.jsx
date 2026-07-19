import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const rVals = byDifficulty(difficulty, { easy: [2, 2], medium: [2, 3], hard: [2, 4] })
  const nMax = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const a = randInt(1, 3)
  const r = rVals[randInt(0, rVals.length - 1)]
  const n = randInt(2, nMax)
  const answer = a * Math.pow(r, n - 1)
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 30 })
  return { a, r, n, answer, min, max }
}

export default function G8JembatanBatuGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#0d2e2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌉 Jembatan Batu Ajaib" onBack={goBack} accentColor="#34D399" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(52,211,153,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Setiap batu di jembatan berlipat ganda! Batu ke-1 ada {q.a}, setiap batu berikutnya dikalikan {q.r}.</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#34D399', marginBottom: 6 }}>
              {q.a}, {q.a * q.r}, {q.a * q.r * q.r}, ... (rasio = {q.r})
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Batu ke-{q.n} (U<sub>{q.n}</sub>) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`U${q.n} = ${val}`} accentColor="#34D399" />
            <Btn onClick={confirm} color="#34D399">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
