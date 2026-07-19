import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas permukaan bola = 4πr², π=22/7, r multiple of 7 → SA = 4×22/7×r² = 88r²/7
// r=7: 88×7=616; r=14: 88×28=2464; r=21: 88×63=5544
const PROBLEMS = [
  { r:7,  sa:616  },
  { r:14, sa:2464 },
  { r:21, sa:5544 },
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,1) : difficulty==='medium' ? PROBLEMS.slice(0,2) : PROBLEMS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([p.r*p.r, p.sa], { step:1, minPad:50, maxPad:500 })
  return { ...p, answer:p.sa, min, max }
}

export default function G9BintangGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000028 0%,#000014 100%)' }}>
      <PlayerHeader />
      <TopBar title="⭐ Kompresi Inti Bintang" onBack={goBack} accentColor="#FBBF24" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(251,191,36,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung luas permukaan mini-planet bola sempurna sebelum pemadatan energi bintang! (π = 22/7)</div>
            <div style={{ fontSize:28, fontWeight:900, color:'#FBBF24', marginBottom:8 }}>r = {q.r} juta km</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Luas Permukaan = 4πr² = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 4 × 22/7 × {q.r}²</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas: ${val} juta km²`} accentColor="#FBBF24" />
            <Btn onClick={confirm} color="#FBBF24">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
