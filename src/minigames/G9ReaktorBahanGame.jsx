import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Volume tabung = πr²h, π=22/7, r multiple of 7
const PROBLEMS = [
  { r:7, h:5,  v:770  }, { r:7, h:10, v:1540 }, { r:7, h:3,  v:462  },
  { r:14,h:5,  v:3080 }, { r:7, h:1,  v:154  }, { r:14,h:3,  v:1848 },
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PROBLEMS.slice(0,3) : PROBLEMS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([p.r*p.r, p.v], { step:1, minPad:20, maxPad:200 })
  return { ...p, answer:p.v, min, max }
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#001020 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚛️ Pengisian Reaktor Bahan Bakar" onBack={goBack} accentColor="#FB923C" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(251,146,60,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung kapasitas tangki tabung hidrogen agar muatan kapal tidak berlebih! (π = 22/7)</div>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:10 }}>
              <div style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Jari-jari (r)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#FB923C' }}>{q.r} dm</div>
              </div>
              <div style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Tinggi (h)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#FB923C' }}>{q.h} dm</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Volume = πr²h = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 22/7 × {q.r}² × {q.h}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume: ${val} dm³`} accentColor="#FB923C" />
            <Btn onClick={confirm} color="#FB923C">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
