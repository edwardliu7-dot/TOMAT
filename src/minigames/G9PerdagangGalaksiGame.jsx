import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Dilatasi: cari faktor k, diberikan x dan x' = kx
function genQ(difficulty = 'medium') {
  const kMax = byDifficulty(difficulty, { easy: 3, medium: 5, hard: 6 })
  const xMax = byDifficulty(difficulty, { easy: 5, medium: 7, hard: 10 })
  const k = randInt(2, kMax)
  const x = randInt(2, xMax)
  const y = randInt(2, xMax)
  const xPrime = k * x
  const answer = k
  const { min, max } = randomSliderRange([2, answer], { step: 1, minPad: 1, maxPad: 5 })
  return { x, y, xPrime, answer, min, max }
}

export default function G9PerdagangGalaksiGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#001a2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="👽 Misi Perdagangan Galaksi" onBack={goBack} accentColor="#38BDF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(56,189,248,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Kapal dagang di A({q.x}, {q.y}) terdilasi ke A'({q.xPrime}, ?). Berapa faktor dilatasi k-nya?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>
              x' = k × x → {q.xPrime} = k × {q.x}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Rumus dilatasi: A'(kx, ky)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>Faktor dilatasi k = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`k = ${val}`} accentColor="#38BDF8" />
            <Btn onClick={confirm} color="#38BDF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
