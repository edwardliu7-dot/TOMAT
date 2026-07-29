import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const aMax = byDifficulty(difficulty, { easy:5, medium:8, hard:12 })
  const xMax = byDifficulty(difficulty, { easy:8, medium:15, hard:20 })
  const bMax = byDifficulty(difficulty, { easy:10, medium:20, hard:30 })
  const a = randInt(2, aMax)
  const x = randInt(2, xMax)  // max peti that fits
  const b = randInt(1, bMax)
  const C = a * x + b  // batas kapasitas
  // ax + b ≤ C means ax ≤ C - b, x ≤ (C-b)/a
  // answer = x = floor((C-b)/a)
  const answer = Math.floor((C - b) / a)
  const { min, max } = randomSliderRange([0, answer], { step:1, minPad:1, maxPad:8 })
  return { a, b, C, answer, min, max }
}

export default function G8KeretaKudaGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a1400 0%,#0d1e00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐴 Kapasitas Kereta Kuda" onBack={goBack} accentColor="#A3E635" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(163,230,53,0.3)">
          <div>
            <svg width="220" height="105" viewBox="0 0 220 105" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Ground */}
              <rect x="0" y="90" width="220" height="15" rx="3" fill="#0a1400" />
              {/* Wheels */}
              <circle cx="60" cy="88" r="14" fill="#0a1400" stroke="#A3E635" strokeWidth="2" />
              <circle cx="60" cy="88" r="7" fill="#0a1400" stroke="rgba(163,230,53,0.4)" strokeWidth="1.5" />
              <circle cx="155" cy="88" r="14" fill="#0a1400" stroke="#A3E635" strokeWidth="2" />
              <circle cx="155" cy="88" r="7" fill="#0a1400" stroke="rgba(163,230,53,0.4)" strokeWidth="1.5" />
              {/* Cart body */}
              <rect x="40" y="55" width="130" height="36" rx="5" fill="#0d1e00" stroke="#A3E635" strokeWidth="2" />
              {/* Cargo boxes inside */}
              {[50,74,98,122].map((x,i)=>(
                <rect key={i} x={x} y="62" width="18" height="22" rx="2" fill={i<3?"#142800":"#0a1400"} stroke={i<3?"rgba(163,230,53,0.6)":"rgba(163,230,53,0.2)"} strokeWidth="1.2" />
              ))}
              <text x="59" y="77" textAnchor="middle" fill="rgba(163,230,53,0.7)" fontSize="9">📦</text>
              <text x="83" y="77" textAnchor="middle" fill="rgba(163,230,53,0.7)" fontSize="9">📦</text>
              <text x="107" y="77" textAnchor="middle" fill="rgba(163,230,53,0.7)" fontSize="9">📦</text>
              <text x="131" y="77" textAnchor="middle" fill="rgba(163,230,53,0.15)" fontSize="9">?</text>
              {/* Shaft/tongue */}
              <line x1="40" y1="72" x2="10" y2="68" stroke="rgba(163,230,53,0.5)" strokeWidth="2" />
              {/* Horse */}
              <text x="8" y="80" fontSize="22">🐴</text>
              {/* Weight label */}
              <text x="110" y="102" textAnchor="middle" fill="rgba(163,230,53,0.5)" fontSize="9">ax + b ≤ C</text>
            </svg>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>🛒 Logistik Kerajaan:</div>
            <div style={{ fontSize:14, color:'#fff', lineHeight:1.8, background:'rgba(163,230,53,0.07)', borderRadius:10, padding:12 }}>
              Kapasitas kereta <strong style={{ color:'#A3E635' }}>{q.C} kg</strong>.
              Sudah ada muatan tetap <strong style={{ color:'#A3E635' }}>{q.b} kg</strong>.
              Satu peti kargo beratnya <strong style={{ color:'#A3E635' }}>{q.a} kg</strong>.
              Maksimum berapa peti yang boleh dimuat?
            </div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:8 }}>{q.a}x + {q.b} ≤ {q.C}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Maksimum Peti: ${val}`} accentColor="#A3E635" />
            <Btn onClick={confirm} color="#A3E635">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
