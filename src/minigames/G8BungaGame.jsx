import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const dMax = byDifficulty(difficulty, { easy: 3, medium: 5, hard: 8 })
  const nMax = byDifficulty(difficulty, { easy: 5, medium: 7, hard: 10 })
  const a = randInt(2, 6)
  const d = randInt(1, dMax)
  const n = randInt(3, nMax)
  const un = a + (n - 1) * d
  // ask: find beda (d) given a, un, n
  const answer = d
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 1, maxPad: 8 })
  return { a, n, un, answer, min, max }
}

export default function G8BungaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a0d 0%,#1a2e0d 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌸 Teka-teki Hutan Bunga" onBack={goBack} accentColor="#F472B6" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(244,114,182,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Bunga di hutan tumbuh membentuk pola aritmetika setiap hari. Hari ke-1 ada {q.a} bunga, hari ke-{q.n} ada {q.un} bunga.</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F472B6', marginBottom: 4 }}>
              {q.a} → ... → {q.un}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Berapa beda (d) penambahan bunga setiap hari?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`d = ${val}`} accentColor="#F472B6" />
            <Btn onClick={confirm} color="#F472B6">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
