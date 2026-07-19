import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Median of 7 sorted distinct numbers
function genQ(difficulty = 'medium') {
  const maxV = byDifficulty(difficulty, { easy: 20, medium: 50, hard: 80 })
  let nums
  do {
    const pool = new Set()
    while (pool.size < 7) pool.add(randInt(2, maxV))
    nums = [...pool].sort((a, b) => a - b)
  } while (false)
  const answer = nums[3] // 4th element = median of 7
  const { min, max } = randomSliderRange([nums[0], answer], { step: 1, minPad: 2, maxPad: 20 })
  return { nums, answer, min, max }
}

export default function G9TahunCahayaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d0d1a 0%,#001429 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌌 Navigasi Tahun Cahaya" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Jarak 7 bintang terdekat (sudah diurutkan, dalam tahun cahaya). Temukan median-nya!</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#93C5FD', marginBottom: 8, letterSpacing: 1 }}>
              {q.nums.join(' , ')}
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Median = data ke-4 (tengah dari 7 data)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Median = ${val}`} accentColor="#93C5FD" />
            <Btn onClick={confirm} color="#93C5FD">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
