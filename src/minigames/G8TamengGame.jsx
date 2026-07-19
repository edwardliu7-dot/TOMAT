import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const aMax = byDifficulty(difficulty, { easy: 4, medium: 6, hard: 8 })
  const dMax = byDifficulty(difficulty, { easy: 3, medium: 5, hard: 7 })
  const nMax = byDifficulty(difficulty, { easy: 5, medium: 8, hard: 10 })
  const a = randInt(1, aMax)
  const d = randInt(1, dMax)
  const n = randInt(2, nMax)
  const answer = a + (n - 1) * d
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 20 })
  return { a, d, n, answer, min, max }
}

export default function G8TamengGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#1a0d2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Formasi Pasukan Tameng" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pasukan tameng berbaris membentuk pola aritmetika. Baris ke-1 ada {q.a} tameng, setiap baris bertambah {q.d} tameng.</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#A78BFA', marginBottom: 6 }}>
              {q.a}, {q.a + q.d}, {q.a + 2 * q.d}, ...
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Baris ke-{q.n} (U<sub>{q.n}</sub>) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`U${q.n} = ${val}`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
