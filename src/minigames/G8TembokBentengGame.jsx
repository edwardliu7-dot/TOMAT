import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Mean of 4 numbers (integer result guaranteed)
function genQ(difficulty = 'medium') {
  const maxM = byDifficulty(difficulty, { easy: 10, medium: 15, hard: 20 })
  const M = randInt(4, maxM)
  let nums
  let tries = 0
  do {
    const xs = [randInt(2, M + 5), randInt(2, M + 5), randInt(2, M + 5)]
    const last = 4 * M - xs.reduce((a, b) => a + b, 0)
    if (last >= 2 && last <= M + 8) { nums = [xs[0], xs[1], xs[2], last]; break }
    tries++
  } while (tries < 200)
  if (!nums) nums = [M - 1, M - 1, M + 1, M + 1]
  const answer = M
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 10 })
  return { nums, answer, min, max }
}

export default function G8TembokBentengGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#1a1000 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧱 Rancangan Tembok Benteng" onBack={goBack} accentColor="#FBBF24" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(251,191,36,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Arsitek mencatat tebal {q.nums.length} lapisan tembok (dalam meter). Hitung rata-rata ketebalan!</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FBBF24', marginBottom: 4 }}>
              {q.nums.join(' + ')} = {q.nums.reduce((a, b) => a + b, 0)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8' }}>Rata-rata = total ÷ {q.nums.length} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Rata-rata = ${val} m`} accentColor="#FBBF24" />
            <Btn onClick={confirm} color="#FBBF24">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
