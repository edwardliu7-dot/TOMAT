import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Find lebar (l) given keliling K = 2(p+l) and panjang p
function genQ(difficulty = 'medium') {
  const pMax = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 16 })
  const lMax = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 14 })
  const p = randInt(3, pMax)
  const l = randInt(2, lMax)
  const K = 2 * (p + l)
  const answer = l
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { p, K, answer, min, max }
}

export default function G8GerbangSihirGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a0d 0%,#001400 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚪 Gerbang Seleksi Sihir" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Gerbang sihir berbentuk persegi panjang. Kelilingnya {q.K} m, panjangnya {q.p} m. Berapa lebarnya?</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#4ADE80', marginBottom: 4 }}>
              K = 2(p + l) → {q.K} = 2({q.p} + l)
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Lebar gerbang (l) = ? m</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`l = ${val} m`} accentColor="#4ADE80" />
            <Btn onClick={confirm} color="#4ADE80">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
