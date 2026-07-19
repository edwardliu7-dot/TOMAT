import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const maxA = byDifficulty(difficulty, { easy: 8, medium: 12, hard: 16 })
  const maxT = byDifficulty(difficulty, { easy: 6, medium: 10, hard: 14 })
  let a, t
  do { a = randInt(2, maxA); t = randInt(2, maxT) } while ((a * t) % 2 !== 0)
  const answer = (a * t) / 2
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 25 })
  return { a, t, answer, min, max }
}

export default function G8MakcomblangGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d1a 0%,#2e1a0d 100%)' }}>
      <PlayerHeader />
      <TopBar title="💘 Makcomblang Desa" onBack={goBack} accentColor="#FB7185" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(251,113,133,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Makcomblang mendekorasi taman cinta berbentuk segitiga. Alas = {q.a} m, tinggi = {q.t} m.</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#FB7185', marginBottom: 4 }}>
              L = ½ × {q.a} × {q.t}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luas taman (m²) = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas = ${val} m²`} accentColor="#FB7185" />
            <Btn onClick={confirm} color="#FB7185">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
