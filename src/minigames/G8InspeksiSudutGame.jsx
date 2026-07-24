import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Given a, b of a right triangle, compute a²+b² (which equals c²)
const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25]]

function genQ(difficulty='medium') {
  const scale = byDifficulty(difficulty, { easy:1, medium: randInt(1,2), hard: randInt(1,3) })
  const [a,b,c] = TRIPLES[randInt(0,TRIPLES.length-1)].map(v=>v*scale)
  const answer = a*a + b*b  // = c²
  const { min, max } = randomSliderRange([a*a, answer], { step:1, minPad:5, maxPad:50 })
  return { a, b, c, answer, min, max }
}

export default function G8InspeksiSudutGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#00101e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗼 Inspeksi Sudut Menara" onBack={goBack} accentColor="#7DD3FC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(125,211,252,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Periksa apakah menara berdiri tegak lurus (90°). Hitung jumlah kuadrat dua sisi pendeknya!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <line x1="30" y1="130" x2="30" y2="20" stroke="#FB923C" strokeWidth="2.5" />
              <line x1="30" y1="130" x2="185" y2="130" stroke="#FB923C" strokeWidth="2.5" />
              <line x1="30" y1="20" x2="185" y2="130" stroke="#FB923C" strokeWidth="2.5" />
              <rect x="30" y="120" width="10" height="10" fill="none" stroke="rgba(251,146,60,0.5)" strokeWidth="1" />
              <circle cx="30" cy="20" r="5" fill="none" stroke="#FB923C" strokeWidth="1.5" />
              <circle cx="185" cy="130" r="5" fill="none" stroke="#FB923C" strokeWidth="1.5" />
              <circle cx="30" cy="130" r="5" fill="none" stroke="#FB923C" strokeWidth="1.5" />
              <text x="8" y="78" fill="#FB923C" fontSize="13" fontWeight="700">a</text>
              <text x="108" y="145" textAnchor="middle" fill="#FB923C" fontSize="13" fontWeight="700">b</text>
              <text x="118" y="65" fill="#F472B6" fontSize="12" fontWeight="700" transform="rotate(-34,118,65)">c=?</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:10 }}>
              <div style={{ background:'rgba(125,211,252,0.08)', border:'1px solid rgba(125,211,252,0.2)', borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Sisi a</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#7DD3FC' }}>{q.a} m</div>
              </div>
              <div style={{ background:'rgba(125,211,252,0.08)', border:'1px solid rgba(125,211,252,0.2)', borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Sisi b</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#7DD3FC' }}>{q.b} m</div>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>a² + b² = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>{q.a}² + {q.b}² = {q.a*q.a} + {q.b*q.b}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`a² + b² = ${val}`} accentColor="#7DD3FC" />
            <Btn onClick={confirm} color="#7DD3FC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
