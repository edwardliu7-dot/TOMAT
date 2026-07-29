import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const aMax = byDifficulty(difficulty, { easy:4, medium:7, hard:10 })
  const xMax = byDifficulty(difficulty, { easy:8, medium:15, hard:25 })
  const bMax = byDifficulty(difficulty, { easy:10, medium:20, hard:30 })
  const a = randInt(2, aMax)
  const x = randInt(1, xMax)
  const b = randInt(1, bMax)
  const c = a * x + b
  const { min, max } = randomSliderRange([0, x], { step:1, minPad:2, maxPad:10 })
  return { a, b, c, answer:x, min, max }
}

export default function G8KatrolGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001a08 0%,#001408 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Katrol Penyeimbang Jembatan" onBack={goBack} accentColor="#34D399" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(52,211,153,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>Jembatan gantung harus seimbang! Beban di kiri dan kanan harus sama.</div>
            <svg width="220" height="110" viewBox="0 0 220 110" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Cliff left */}
              <rect x="0" y="60" width="40" height="50" rx="4" fill="#0a1f0a" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
              {/* Cliff right */}
              <rect x="180" y="60" width="40" height="50" rx="4" fill="#0a1f0a" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
              {/* Bridge planks */}
              {[55,75,95,115,135,155].map((x,i)=>(
                <rect key={i} x={x} y="68" width="16" height="6" rx="2" fill="#0f2a0f" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
              ))}
              {/* Bridge cables */}
              <path d="M40,40 Q110,70 180,40" fill="none" stroke="#34D399" strokeWidth="2" />
              <line x1="40" y1="40" x2="40" y2="72" stroke="#34D399" strokeWidth="1.5" />
              <line x1="180" y1="40" x2="180" y2="72" stroke="#34D399" strokeWidth="1.5" />
              {/* Suspenders */}
              {[65,85,110,135,155].map((x,i)=>{
                const t=(x-40)/140; const cy=40+30*4*t*(1-t)
                return <line key={i} x1={x+8} y1={Math.round(cy)} x2={x+8} y2="70" stroke="rgba(52,211,153,0.4)" strokeWidth="1" />
              })}
              {/* Weight boxes */}
              <rect x="55" y="48" width="28" height="18" rx="3" fill="#001a08" stroke="#34D399" strokeWidth="1.5" />
              <text x="69" y="61" textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="700">ax+b</text>
              <rect x="137" y="48" width="28" height="18" rx="3" fill="#0a1000" stroke="#FBBF24" strokeWidth="1.5" />
              <text x="151" y="61" textAnchor="middle" fill="#FBBF24" fontSize="9" fontWeight="700">c</text>
              {/* Tower */}
              <rect x="106" y="18" width="8" height="52" rx="2" fill="#0f2a0f" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
              <rect x="100" y="14" width="20" height="8" rx="2" fill="#0f2a0f" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
            </svg>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:10 }}>
              <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Kiri</div>
                <div style={{ fontSize:18, fontWeight:800, color:'#34D399' }}>{q.a}x + {q.b}</div>
              </div>
              <div style={{ fontSize:20, color:'#FBBF24', fontWeight:800 }}>=</div>
              <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Kanan</div>
                <div style={{ fontSize:18, fontWeight:800, color:'#FBBF24' }}>{q.c}</div>
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>x = ?</div>
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
