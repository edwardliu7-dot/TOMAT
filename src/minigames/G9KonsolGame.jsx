import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Elimination: a1*x + b1*y = c1, a2*x + b2*y = c2
// Build from solution: generate x,y then make two equations
function genQ(difficulty='medium') {
  const xyMax = byDifficulty(difficulty, { easy:8, medium:15, hard:20 })
  const aMax = byDifficulty(difficulty, { easy:3, medium:5, hard:7 })
  const x = randInt(1, xyMax)
  const y = randInt(1, xyMax)
  const a1 = randInt(1, aMax), b1 = randInt(1, aMax)
  const a2 = randInt(1, aMax), b2 = randInt(1, aMax)
  // Avoid parallel lines: a1*b2 != a2*b1
  if (a1 * b2 === a2 * b1) return genQ(difficulty)
  const c1 = a1 * x + b1 * y
  const c2 = a2 * x + b2 * y
  const { min, max } = randomSliderRange([1, x], { step:1, minPad:2, maxPad:10 })
  return { a1, b1, c1, a2, b2, c2, answer:x, answerY:y, min, max }
}

export default function G9KonsolGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001014 0%,#000814 100%)' }}>
      <PlayerHeader />
      <TopBar title="💻 Dekripsi Konsol Komputer" onBack={goBack} accentColor="#34D399" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(52,211,153,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Gunakan eliminasi atau substitusi untuk meretas kode pertahanan musuh. Cari nilai x!</div>
            <div style={{ fontFamily:'monospace', display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
              <div style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:10, padding:'10px 14px', fontSize:16, fontWeight:800, color:'#34D399' }}>
                {q.a1}x + {q.b1}y = {q.c1}
              </div>
              <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10, padding:'10px 14px', fontSize:16, fontWeight:800, color:'#FBBF24' }}>
                {q.a2}x + {q.b2}y = {q.c2}
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>x = ? (y = {q.answerY})</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val}`} accentColor="#34D399" />
            <Btn onClick={confirm} color="#34D399">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
