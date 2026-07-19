import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas jajargenjang = alas × tinggi
function genQ(difficulty = 'medium') {
  const aMax = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 16 })
  const tMax = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 14 })
  const a = randInt(2, aMax)
  const t = randInt(2, tMax)
  const answer = a * t
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 3, maxPad: 40 })
  return { a, t, answer, min, max }
}

export default function G8PetaKerajaanGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a0d 0%,#1a2e00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗺️ Ahli Peta Kerajaan" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Ahli peta harus menghitung luas wilayah jajargenjang di peta kerajaan. Alas = {q.a} km, tinggi = {q.t} km.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#86EFAC', marginBottom: 4 }}>
              L = alas × tinggi = {q.a} × {q.t}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas wilayah (km²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} km²`} accentColor="#86EFAC" />
            <Btn onClick={confirm} color="#86EFAC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
