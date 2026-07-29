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
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
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
    if (correct) { addCoins(50); addExp(100) } else { recordWrongAnswer() }
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
            <svg width="220" height="100" viewBox="0 0 220 100" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Monitor frame */}
              <rect x="15" y="8" width="190" height="78" rx="8" fill="#011018" stroke="#34D399" strokeWidth="2" />
              <rect x="21" y="14" width="178" height="66" rx="5" fill="#001014" />
              {/* Screen scanlines */}
              {[0,1,2,3,4,5,6].map(i=>(
                <line key={i} x1="22" y1={20+i*9} x2="198" y2={20+i*9} stroke="rgba(52,211,153,0.05)" strokeWidth="1" />
              ))}
              {/* Circuit traces */}
              <polyline points="30,30 50,30 50,50 80,50" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
              <polyline points="170,30 150,30 150,50 120,50" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
              <circle cx="50" cy="30" r="3" fill="rgba(52,211,153,0.4)" />
              <circle cx="150" cy="30" r="3" fill="rgba(251,191,36,0.4)" />
              {/* Cursor blink */}
              <rect x="28" y="22" width="6" height="10" rx="1" fill="#34D399" opacity="0.8" />
              {/* Code text */}
              <text x="40" y="32" fill="rgba(52,211,153,0.7)" fontSize="9" fontFamily="monospace">$ decrypt --mode=elim</text>
              <text x="30" y="48" fill="rgba(52,211,153,0.5)" fontSize="9" fontFamily="monospace">ax + by = c</text>
              <text x="30" y="62" fill="rgba(251,191,36,0.5)" fontSize="9" fontFamily="monospace">dx + ey = f</text>
              <text x="140" y="75" fill="rgba(52,211,153,0.8)" fontSize="9" fontFamily="monospace">x = ?</text>
              {/* Stand */}
              <rect x="90" y="86" width="40" height="6" rx="3" fill="#011018" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
              <rect x="80" y="92" width="60" height="5" rx="2" fill="#011018" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
            </svg>
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
