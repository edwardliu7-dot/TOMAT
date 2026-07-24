import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas juring = (θ/360) × πr², choose θ and r such that result is integer
// r=14, θ=90: (1/4)×22/7×196 = (1/4)×22×28 = 154
// r=14, θ=180: (1/2)×22/7×196 = 308
// r=21, θ=60: (1/6)×22/7×441 = (1/6)×22×63 = 231
// r=21, θ=120: (1/3)×22/7×441 = 462
// r=7,  θ=180: (1/2)×22/7×49 = 77
// r=7,  θ=90: (1/4)×22/7×49 = 38.5 ✗
// r=14, θ=45: (1/8)×22/7×196 = (1/8)×616 = 77
const PROBLEMS = [
  { r:14, theta:90,  label:'90°',  answer:154 },
  { r:14, theta:180, label:'180°', answer:308 },
  { r:21, theta:60,  label:'60°',  answer:231 },
  { r:21, theta:120, label:'120°', answer:462 },
  { r:7,  theta:180, label:'180°', answer:77  },
  { r:14, theta:45,  label:'45°',  answer:77  },
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,3) : PROBLEMS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([1, p.answer], { step:1, minPad:10, maxPad:100 })
  return { ...p, min, max }
}

export default function G9LaserJuringGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a0028 0%,#100020 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚡ Tembakan Laser Sektor" onBack={goBack} accentColor="#C084FC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(192,132,252,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Laser hanya menembak dalam juring tertentu. Hitung luas area tembakan! (π = 22/7)</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <circle cx="110" cy="80" r="58" stroke="#C084FC" strokeWidth="2" fill="rgba(192,132,252,0.05)" />
              <path d="M110,80 L168,80 A58,58 0 0,0 110,22 Z" fill="rgba(192,132,252,0.4)" stroke="#C084FC" strokeWidth="1.5" />
              <line x1="110" y1="80" x2="168" y2="80" stroke="#C084FC" strokeWidth="1.5" />
              <line x1="110" y1="80" x2="110" y2="22" stroke="#C084FC" strokeWidth="1.5" />
              <path d="M130,80 A20,20 0 0,0 110,60" stroke="#C084FC" strokeWidth="1.5" fill="none" />
              <text x="140" y="66" fill="#C084FC" fontSize="12" fontWeight="700">θ={q.label}</text>
              <text x="140" y="85" fill="#C084FC" fontSize="11">r={q.r}</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:10 }}>
              <div style={{ background:'rgba(192,132,252,0.08)', border:'1px solid rgba(192,132,252,0.2)', borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Sudut (θ)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#C084FC' }}>{q.label}</div>
              </div>
              <div style={{ background:'rgba(192,132,252,0.08)', border:'1px solid rgba(192,132,252,0.2)', borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Jari-jari (r)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#C084FC' }}>{q.r} m</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Luas Juring = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= (θ/360) × πr²</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas: ${val} m²`} accentColor="#C084FC" />
            <Btn onClick={confirm} color="#C084FC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
