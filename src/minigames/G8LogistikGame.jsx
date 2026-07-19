import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Median of 5 sorted distinct numbers
function genQ(difficulty = 'medium') {
  const maxV = byDifficulty(difficulty, { easy: 20, medium: 40, hard: 60 })
  let nums
  do {
    const pool = new Set()
    while (pool.size < 5) pool.add(randInt(2, maxV))
    nums = [...pool].sort((a, b) => a - b)
  } while (false)
  const answer = nums[2]
  const { min, max } = randomSliderRange([nums[0], answer], { step: 1, minPad: 2, maxPad: 15 })
  return { nums, answer, min, max }
}

export default function G8LogistikGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#0d2e1a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚚 Jalur Suplai Logistik" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Jumlah kargo terkirim selama 5 hari (sudah diurutkan). Temukan nilai median!</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#67E8F9', marginBottom: 8, letterSpacing: 2 }}>
              {q.nums.join(' , ')}
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Median = nilai tengah (data ke-3 dari 5)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Median = ${val}`} accentColor="#67E8F9" />
            <Btn onClick={confirm} color="#67E8F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
