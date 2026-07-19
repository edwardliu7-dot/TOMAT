import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const aMax = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const dMax = byDifficulty(difficulty, { easy: 2, medium: 3, hard: 4 })
  const nMax = byDifficulty(difficulty, { easy: 4, medium: 6, hard: 8 })
  const a = randInt(1, aMax)
  const d = randInt(1, dMax)
  const n = randInt(3, nMax)
  // Sn = n/2 * (2a + (n-1)*d)
  const answer = Math.round(n / 2 * (2 * a + (n - 1) * d))
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 30 })
  return { a, d, n, answer, min, max }
}

export default function G8RamalanGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d2e 0%,#2e0d1a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔮 Ramalan Penyihir Agung" onBack={goBack} accentColor="#C084FC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(192,132,252,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Penyihir meramal jumlah total mantra dalam deret aritmetika. Suku pertama {q.a}, beda {q.d}, sebanyak {q.n} suku.</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C084FC', marginBottom: 4 }}>
              S<sub>{q.n}</sub> = {q.n}/2 × (2×{q.a} + ({q.n}−1)×{q.d})
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total {q.n} suku pertama = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`S${q.n} = ${val}`} accentColor="#C084FC" />
            <Btn onClick={confirm} color="#C084FC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
