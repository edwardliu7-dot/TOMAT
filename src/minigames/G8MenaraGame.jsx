import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas persegi panjang = p × l
function genQ(difficulty = 'medium') {
  const pMax = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 16 })
  const lMax = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 14 })
  const p = randInt(2, pMax)
  const l = randInt(2, lMax)
  const answer = p * l
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 40 })
  return { p, l, answer, min, max }
}

export default function G8MenaraGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#0d002e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗼 Kombinasi Kunci Menara" onBack={goBack} accentColor="#818CF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(129,140,248,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pintu menara memiliki laci rahasia berbentuk persegi panjang. Panjang = {q.p} m, lebar = {q.l} m.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#818CF8', marginBottom: 4 }}>
              L = {q.p} × {q.l}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas laci (m²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} m²`} accentColor="#818CF8" />
            <Btn onClick={confirm} color="#818CF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
