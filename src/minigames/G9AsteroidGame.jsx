import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Tali busur: given r and half-chord (c/2), find distance d from center: d=√(r²-(c/2)²)
// Using Pythagorean triples: s² = r² - (c/2)²
const CHORD_PROBS = [
  { r:5,  halfC:3, d:4 },   // 5²-3²=4²
  { r:13, halfC:5, d:12 },  // 13²-5²=12²
  { r:10, halfC:6, d:8 },   // 10²-6²=8²
  { r:17, halfC:8, d:15 },  // 17²-8²=15²
  { r:25, halfC:7, d:24 },  // 25²-7²=24²
  { r:13, halfC:12,d:5  },  // 13²-12²=5²
]

function genQ(difficulty='medium') {
  const pool = difficulty==='easy' ? CHORD_PROBS.slice(0,3) : CHORD_PROBS
  const p = pool[randInt(0,pool.length-1)]
  const chord = p.halfC * 2
  const { min, max } = randomSliderRange([1, p.d], { step:1, minPad:2, maxPad:10 })
  return { r:p.r, chord, halfC:p.halfC, answer:p.d, min, max }
}

export default function G9AsteroidGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a001a 0%,#080012 100%)' }}>
      <PlayerHeader />
      <TopBar title="☄️ Jalur Pintas Sabuk Asteroid" onBack={goBack} accentColor="#F472B6" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(244,114,182,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Tali busur memotong lingkaran asteroid. Hitung jarak dari pusat ke tali busur!</div>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:10 }}>
              <div style={{ background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Jari-jari (r)</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#F472B6' }}>{q.r} AU</div>
              </div>
              <div style={{ background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Tali Busur</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#F472B6' }}>{q.chord} AU</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Jarak pusat ke tali = ? AU</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>d = √(r² − (tali/2)²)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Jarak: ${val} AU`} accentColor="#F472B6" />
            <Btn onClick={confirm} color="#F472B6">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
