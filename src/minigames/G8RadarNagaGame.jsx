import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const rOpts = byDifficulty(difficulty, { easy: [2], medium: [2, 3], hard: [2, 3, 4] })
  const nMax = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const a = randInt(1, 3)
  const r = rOpts[randInt(0, rOpts.length - 1)]
  const n = randInt(2, nMax)
  const answer = a * Math.pow(r, n - 1)
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 40 })
  return { a, r, n, answer, min, max }
}

export default function G8RadarNagaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0000 0%,#2e0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐉 Radar Naga Pengintai" onBack={goBack} accentColor="#F87171" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(248,113,113,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Radar mendeteksi kawanan naga dalam barisan geometri. Hari pertama {q.a} naga, setiap hari jumlahnya dikali {q.r}.</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#F87171', marginBottom: 6 }}>
              {q.a}, {q.a * q.r}, {q.a * q.r * q.r}, ... (r = {q.r})
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Hari ke-{q.n} (U<sub>{q.n}</sub>) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`U${q.n} = ${val}`} accentColor="#F87171" />
            <Btn onClick={confirm} color="#F87171">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
