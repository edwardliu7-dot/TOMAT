import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Dilatasi faktor k: A(x,y) → A'(kx,ky). Tanya: x-koordinat A' = kx
function genQ(difficulty = 'medium') {
  const kMax = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const xMax = byDifficulty(difficulty, { easy: 5, medium: 7, hard: 9 })
  const k = randInt(2, kMax)
  const x = randInt(2, xMax)
  const y = randInt(1, xMax)
  const answer = k * x
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 20 })
  return { k, x, y, answer, min, max }
}

export default function G9LambungKapalGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#001429 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Perluasan Lambung Kapal" onBack={goBack} accentColor="#818CF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(129,140,248,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Lambung kapal diperbesar dengan faktor dilatasi k = {q.k}. Titik referensi A({q.x}, {q.y}) dipindahkan ke A'.</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#818CF8', marginBottom: 4 }}>
              A({q.x}, {q.y}) ×{q.k} → A'(?, ?)
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Rumus: (x, y) → (kx, ky)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>x-koordinat A' = {q.k} × {q.x} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x' = ${val}`} accentColor="#818CF8" />
            <Btn onClick={confirm} color="#818CF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
