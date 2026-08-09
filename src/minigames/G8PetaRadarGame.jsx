import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Distance between points with integer results: √((Δx)²+(Δy)²)
const PAIRS = [
  { x1:0,y1:0,x2:3,y2:4,d:5 }, { x1:0,y1:0,x2:5,y2:12,d:13 },
  { x1:1,y1:1,x2:4,y2:5,d:5 }, { x1:2,y1:3,x2:7,y2:15,d:13 },
  { x1:0,y1:0,x2:8,y2:15,d:17},{ x1:1,y1:2,x2:7,y2:10,d:10},
  { x1:0,y1:0,x2:6,y2:8,d:10},{ x1:3,y1:0,x2:3,y2:12,d:12},
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? PAIRS.slice(0,4) : PAIRS
  const p = pool[randInt(0,pool.length-1)]
  const { min, max } = randomSliderRange([1,p.d], { step:1, minPad:2, maxPad:12 })
  return { ...p, answer:p.d, min, max }
}

export default function G8PetaRadarGame({ goBack, difficulty='medium', survival=false }) {
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

  const dx = q.x2-q.x1, dy = q.y2-q.y1

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000d1a 0%,#000a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Peta Radar Pengintai" onBack={goBack} accentColor="#38BDF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(56,189,248,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Ksatria dan benteng musuh ada di koordinat berbeda. Hitung jarak lurus terpendek!</div>
            <svg width="220" height="155" viewBox="0 0 220 155" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              {[30,60,90,120,150,180].map(x => (
                <line key={x} x1={x} y1="10" x2={x} y2="145" stroke="rgba(52,211,153,0.12)" strokeWidth="1" />
              ))}
              {[30,55,80,105,130].map(y => (
                <line key={y} x1="10" y1={y} x2="210" y2={y} stroke="rgba(52,211,153,0.12)" strokeWidth="1" />
              ))}
              <line x1="10" y1="80" x2="210" y2="80" stroke="#34D399" strokeWidth="1.5" />
              <line x1="110" y1="10" x2="110" y2="145" stroke="#34D399" strokeWidth="1.5" />
              <line x1="75" y1="50" x2="155" y2="115" stroke="#F472B6" strokeWidth="2" strokeDasharray="5,4" />
              <circle cx="75" cy="50" r="5" fill="#34D399" />
              <circle cx="155" cy="115" r="5" fill="#34D399" />
              <text x="55" y="45" fill="#34D399" fontSize="9">(x1,y1)</text>
              <text x="158" y="112" fill="#34D399" fontSize="9">(x2,y2)</text>
              <text x="122" y="78" fill="#F472B6" fontSize="10" fontWeight="700">d=?</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:10 }}>
              <div style={{ background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Posisimu</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#38BDF8' }}>({q.x1}, {q.y1})</div>
              </div>
              <div style={{ fontSize:20, color:'#6B7280', display:'flex', alignItems:'center' }}>→</div>
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Benteng Musuh</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#F87171' }}>({q.x2}, {q.y2})</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Jarak = ? satuan</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>d = √({dx}² + {dy}²) = √({dx*dx}+{dy*dy})</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Jarak: ${val} satuan`} accentColor="#38BDF8" />
            <Btn onClick={confirm} color="#38BDF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
