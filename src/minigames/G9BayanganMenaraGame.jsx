import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Peluang gabungan dua kejadian bebas (dadu): n(A∩B) = n(A) × n(B) / 6 × 6
// A = die1 genap (3 outcomes), B = die2 > k (6-k outcomes)
function genQ(difficulty = 'medium') {
  const k = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const nA = 3 // bilangan genap pada dadu 1
  const nB = 6 - k // bilangan > k pada dadu 2
  const answer = nA * nB // n(A∩B) = n(A) × n(B)
  const { min, max } = randomSliderRange([1, 18], { step: 1, minPad: 1, maxPad: 5 })
  return { k, nA, nB, answer, min, max }
}

export default function G9BayanganMenaraGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a1000 0%,#2e1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗽 Bayangan Menara Alien" onBack={goBack} accentColor="#FCD34D" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,211,77,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Dua dadu dilempar. Berapa pasangan (d₁, d₂) dimana d₁ GENAP DAN d₂ &gt; {q.k}?</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FCD34D', marginBottom: 4 }}>
              n(A∩B) = n(A) × n(B) = {q.nA} × {q.nB}
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>n(A)=bilangan genap={q.nA}, n(B)=bilangan&gt;{q.k}={q.nB}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>n(A∩B) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`n(A∩B) = ${val}`} accentColor="#FCD34D" />
            <Btn onClick={confirm} color="#FCD34D">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
