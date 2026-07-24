import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Space diagonal of a box: d = √(l²+w²+h²), integer answers
const BOXES = [
  { l:1,w:2,h:2,d:3 }, { l:2,w:3,h:6,d:7 }, { l:2,w:4,h:4,d:6 },
  { l:1,w:4,h:8,d:9 }, { l:2,w:6,h:9,d:11},{ l:6,w:6,h:7,d:11},
  { l:3,w:4,h:12,d:13},{ l:4,w:7,h:4,d:9 },{ l:6,w:2,h:9,d:11},
]

function genQ(difficulty = 'medium') {
  const pool = difficulty === 'easy' ? BOXES.slice(0,4) : BOXES
  const b = pool[randInt(0, pool.length-1)]
  const { min, max } = randomSliderRange([b.l, b.d], { step:1, minPad:2, maxPad:10 })
  return { ...b, answer: b.d, min, max }
}

export default function G8HartaKarunGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0d0a00 0%,#1a1500 100%)' }}>
      <PlayerHeader />
      <TopBar title="💰 Harta Karun di Sudut Ruangan" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Peti harta berbentuk balok. Hitung panjang diagonal ruangnya untuk menemukan slot kunci rahasia!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <polygon points="65,130 155,130 155,72 65,72" fill="rgba(253,230,138,0.1)" stroke="#FDE68A" strokeWidth="2" />
              <polygon points="65,72 155,72 185,45 95,45" fill="rgba(253,230,138,0.18)" stroke="#FDE68A" strokeWidth="2" />
              <polygon points="155,130 185,103 185,45 155,72" fill="rgba(253,230,138,0.08)" stroke="#FDE68A" strokeWidth="2" />
              <line x1="65" y1="130" x2="185" y2="45" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="5,4" />
              <text x="120" y="42" textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="700">P</text>
              <text x="190" y="78" fill="#FDE68A" fontSize="11" fontWeight="700">L</text>
              <text x="50" y="107" fill="#FDE68A" fontSize="11" fontWeight="700">T</text>
              <text x="128" y="82" fill="#F472B6" fontSize="10" fontWeight="700">d=?</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
              {[['P',q.l],['L',q.w],['T',q.h]].map(([lbl,v]) => (
                <div key={lbl} style={{ textAlign:'center', background:'rgba(253,230,138,0.08)', border:'1px solid rgba(253,230,138,0.2)', borderRadius:10, padding:'8px 14px' }}>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>{lbl}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#FDE68A' }}>{v} m</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Diagonal Ruang = ? m</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>d = √(P² + L² + T²)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Diagonal: ${val} m`} accentColor="#FDE68A" />
            <Btn onClick={confirm} color="#FDE68A">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
