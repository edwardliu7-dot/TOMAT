import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Volume tabung = πr²t, π=22/7, r kelipatan 7 → hasil bilangan bulat
// r=7,  t=10: 22/7×49×10  = 22×7×10  = 1540
// r=7,  t=15: 22/7×49×15  = 22×7×15  = 2310
// r=14, t=10: 22/7×196×10 = 22×28×10 = 6160
const PROBLEMS = [
  { r:7,  t:10, v:1540 },
  { r:7,  t:15, v:2310 },
  { r:14, t:10, v:6160 },
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,1) : difficulty==='medium' ? PROBLEMS.slice(0,2) : PROBLEMS
  const p = pool[randInt(0, pool.length-1)]
  const { min, max } = randomSliderRange([p.r*p.r, p.v], { step:1, minPad:50, maxPad:500 })
  return { ...p, answer: p.v, min, max }
}

export default function G9ReaktorBahanGame({ goBack, difficulty='medium', survival=false }) {
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
      <TopBar title="⚛️ Pengisian Reaktor Bahan Bakar" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung volume cairan hidrogen dalam tangki tabung silinder agar muatan kapal tidak berlebih! (π = 22/7)</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#86EFAC', marginBottom:8 }}>r = {q.r} m &nbsp;|&nbsp; t = {q.t} m</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Volume Tabung = πr²t = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 22/7 × {q.r}² × {q.t}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume: ${val} m³`} accentColor="#86EFAC" />
            <Btn onClick={confirm} color="#86EFAC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
