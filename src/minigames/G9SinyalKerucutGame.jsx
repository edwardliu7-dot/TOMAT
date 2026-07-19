import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Volume kerucut = (1/3)πr²h, π=22/7, choose r,h for integer result
// (1/3)×22/7×r²×h = 22r²h/21 → need 21 | 22r²h → since gcd(22,21)=1 → need 21|r²h
// Simplest: h multiple of 3 and r multiple of 7
// r=7, h=3: (1/3)×22/7×49×3 = 22×7 = 154
// r=7, h=6: 308; r=7, h=9: 462; r=14, h=3: 616
const PROBLEMS = [
  { r:7, h:3, v:154 }, { r:7, h:6, v:308 }, { r:7, h:9, v:462 },
  { r:14,h:3, v:616 }, { r:7,h:12,v:616 }, { r:14,h:6,v:1232},
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,3) : PROBLEMS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([p.r*p.r, p.v], { step:1, minPad:20, maxPad:150 })
  return { ...p, answer:p.v, min, max }
}

export default function G9SinyalKerucutGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#000d1a 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Zona Pancaran Sinyal" onBack={goBack} accentColor="#22D3EE" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(34,211,238,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Antena memancarkan sinyal berbentuk kerucut. Hitung volume jangkauan pancaran! (π = 22/7)</div>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:10 }}>
              <div style={{ background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Jari-jari (r)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#22D3EE' }}>{q.r} km</div>
              </div>
              <div style={{ background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Tinggi (h)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#22D3EE' }}>{q.h} km</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Volume = ⅓πr²h = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= ⅓ × 22/7 × {q.r}² × {q.h}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume: ${val} km³`} accentColor="#22D3EE" />
            <Btn onClick={confirm} color="#22D3EE">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
