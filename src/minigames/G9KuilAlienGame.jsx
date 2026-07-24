import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Volume limas segi empat = (1/3) × s² × t
// Choose s,t so result is integer: s²×t divisible by 3
const PROBLEMS = [
  { s:3,t:3,v:9 },  { s:6,t:4,v:48 }, { s:9,t:6,v:162},
  { s:3,t:6,v:18 }, { s:6,t:10,v:120},{ s:9,t:3,v:81 },
  { s:12,t:4,v:192},{ s:3,t:12,v:36 },
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,4) : PROBLEMS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([p.s*p.s, p.v], { step:1, minPad:5, maxPad:50 })
  return { ...p, answer:p.v, min, max }
}

export default function G9KuilAlienGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0d0014 0%,#080010 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏛️ Eksplorasi Kuil Alien" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung volume udara dalam kuil berbentuk limas segi empat sebelum mengirim robot!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <polygon points="50,130 165,130 188,112 73,112" fill="rgba(167,139,250,0.1)" stroke="#A78BFA" strokeWidth={2} />
              <line x1="50" y1="130" x2="110" y2="25" stroke="#A78BFA" strokeWidth={2} />
              <line x1="165" y1="130" x2="110" y2="25" stroke="#A78BFA" strokeWidth={2} />
              <line x1="73" y1="112" x2="110" y2="25" stroke="#A78BFA" strokeWidth={1.5} strokeDasharray="4,3" />
              <line x1="188" y1="112" x2="110" y2="25" stroke="#A78BFA" strokeWidth={1.5} strokeDasharray="4,3" />
              <line x1="110" y1="25" x2="110" y2="121" stroke="#A78BFA" strokeWidth={1.5} strokeDasharray="4,3" />
              <circle cx="110" cy="25" r="4" fill="#A78BFA" />
              <text x="118" y="76" fill="#A78BFA" fontSize={10} fontWeight={700}>tinggi</text>
              <text x="110" y="145" textAnchor="middle" fill="#A78BFA" fontSize={10} fontWeight={700}>alas</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:10 }}>
              <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Sisi alas (s)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#A78BFA' }}>{q.s} m</div>
              </div>
              <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Tinggi (t)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#A78BFA' }}>{q.t} m</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Volume = ⅓ × s² × t = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= ⅓ × {q.s}² × {q.t}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume: ${val} m³`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
