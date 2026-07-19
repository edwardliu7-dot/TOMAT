import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Find missing value given mean of 5 numbers
function genQ(difficulty = 'medium') {
  const maxM = byDifficulty(difficulty, { easy: 10, medium: 15, hard: 20 })
  const M = randInt(5, maxM)
  let known, missing
  let tries = 0
  do {
    known = Array.from({ length: 4 }, () => randInt(2, M + 6))
    missing = 5 * M - known.reduce((a, b) => a + b, 0)
    tries++
  } while ((missing < 2 || missing > M + 10) && tries < 200)
  if (missing < 2 || missing > M + 10) { known = [M - 2, M - 1, M + 1, M + 2]; missing = M }
  const answer = missing
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { known, M, answer, min, max }
}

export default function G8TimbanganGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a1000 0%,#2e1a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas dan Perak" onBack={goBack} accentColor="#F59E0B" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(245,158,11,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>5 kantong koin emas memiliki rata-rata {q.M} koin. 4 kantong diketahui: {q.known.join(', ')}. Berapa isi kantong ke-5?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B', marginBottom: 4 }}>
              ({q.known.join(' + ')} + ?) ÷ 5 = {q.M}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Kantong ke-5 = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Kantong ke-5 = ${val}`} accentColor="#F59E0B" />
            <Btn onClick={confirm} color="#F59E0B">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
