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

  const dx = q.x2-q.x1, dy = q.y2-q.y1

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000d1a 0%,#000a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Peta Radar Pengintai" onBack={goBack} accentColor="#38BDF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(56,189,248,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Ksatria dan benteng musuh ada di koordinat berbeda. Hitung jarak lurus terpendek!</div>
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
