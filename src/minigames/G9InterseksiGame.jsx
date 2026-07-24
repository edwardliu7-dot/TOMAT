import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// x + y = S, x - y = D → x = (S+D)/2, y = (S-D)/2 (both positive integers)
function genQ(difficulty='medium') {
  const xyMax = byDifficulty(difficulty, { easy:10, medium:20, hard:30 })
  let x, y
  do {
    x = randInt(2, xyMax)
    y = randInt(1, x - 1)
  } while ((x + y) % 2 !== 0)  // ensure both S+D and S-D even for clean solution
  const S = x + y
  const D = x - y
  const { min, max } = randomSliderRange([1, x], { step:1, minPad:2, maxPad:10 })
  return { S, D, answer: x, answerY: y, min, max }
}

export default function G9InterseksiGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000d14 0%,#000a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Interseksi Radar Sinyal" onBack={goBack} accentColor="#22D3EE" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(34,211,238,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Dua sinyal radar berpotongan di satu titik. Tentukan koordinat x kapal induk musuh!</div>
            <svg width={220} height={155} viewBox="0 0 220 155" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              {/* Vertical grid lines */}
              {[30,60,90,120,150,180].map(x => (
                <line key={x} x1={x} y1={10} x2={x} y2={145} stroke="rgba(34,211,238,0.1)" strokeWidth={1} />
              ))}
              {/* Horizontal grid lines */}
              {[30,55,80,105,130].map(y => (
                <line key={y} x1={10} y1={y} x2={210} y2={y} stroke="rgba(34,211,238,0.1)" strokeWidth={1} />
              ))}
              {/* X-axis */}
              <line x1={10} y1={78} x2={207} y2={78} stroke="#22D3EE" strokeWidth={1.5} />
              <polygon points="210,78 203,74 203,82" fill="#22D3EE" />
              {/* Y-axis */}
              <line x1={110} y1={145} x2={110} y2={13} stroke="#22D3EE" strokeWidth={1.5} />
              <polygon points="110,10 106,17 114,17" fill="#22D3EE" />
              {/* Line A (slope -1) */}
              <line x1={20} y1={118} x2={200} y2={38} stroke="#22D3EE" strokeWidth={2.5} />
              {/* Line B (slope +1) */}
              <line x1={20} y1={38} x2={200} y2={118} stroke="#A78BFA" strokeWidth={2.5} />
              {/* Intersection dot */}
              <circle cx={110} cy={78} r={6} fill="#F472B6" />
              {/* Labels */}
              <text x={118} y={72} fill="#F472B6" fontSize={11} fontWeight={700}>x=?</text>
              <text x={25} y={105} fill="#22D3EE" fontSize={9}>A</text>
              <text x={25} y={52} fill="#A78BFA" fontSize={9}>B</text>
            </svg>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
              <div style={{ background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:10, padding:'10px 14px', fontSize:16, fontWeight:800, color:'#22D3EE' }}>
                Radar A: x + y = {q.S}
              </div>
              <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:10, padding:'10px 14px', fontSize:16, fontWeight:800, color:'#A78BFA' }}>
                Radar B: x − y = {q.D}
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Nilai x = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val}`} accentColor="#22D3EE" />
            <Btn onClick={confirm} color="#22D3EE">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
