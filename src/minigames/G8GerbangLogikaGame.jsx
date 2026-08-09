import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const aMax = byDifficulty(difficulty, { easy:5, medium:9, hard:12 })
  const xMax = byDifficulty(difficulty, { easy:8, medium:15, hard:20 })
  const a = randInt(2, aMax)
  const x = randInt(1, xMax)
  const c = a * x
  const { min, max } = randomSliderRange([1, x], { step:1, minPad:2, maxPad:10 })
  return { a, c, answer:x, min, max }
}

export default function G8GerbangLogikaGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001400 0%,#001a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚪 Teka-Teki Gerbang Logika" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Inskripsi kuno di pintu gerbang. Temukan nilai kebenaran x untuk membuka pintu!</div>
            <svg width="220" height="120" viewBox="0 0 220 120" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Gate pillars */}
              <rect x="22" y="18" width="28" height="88" rx="4" fill="#0a1a00" stroke="rgba(74,222,128,0.4)" strokeWidth="2" />
              <rect x="170" y="18" width="28" height="88" rx="4" fill="#0a1a00" stroke="rgba(74,222,128,0.4)" strokeWidth="2" />
              {/* Arch top */}
              <path d="M50,28 Q110,0 170,28" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2.5" />
              {/* Gate doors */}
              <rect x="52" y="30" width="54" height="76" rx="3" fill="#0d2200" stroke="rgba(74,222,128,0.35)" strokeWidth="1.5" />
              <rect x="114" y="30" width="54" height="76" rx="3" fill="#0d2200" stroke="rgba(74,222,128,0.35)" strokeWidth="1.5" />
              {/* Door crack/lock */}
              <line x1="110" y1="30" x2="110" y2="106" stroke="rgba(74,222,128,0.2)" strokeWidth="1" strokeDasharray="4,3" />
              <circle cx="110" cy="68" r="8" fill="#001400" stroke="#4ADE80" strokeWidth="1.5" />
              <text x="110" y="73" textAnchor="middle" fill="#4ADE80" fontSize="10" fontWeight="700">🔒</text>
              {/* Runes on door */}
              <text x="79" y="52" textAnchor="middle" fill="rgba(74,222,128,0.5)" fontSize="9">⟨ ax ⟩</text>
              <text x="137" y="52" textAnchor="middle" fill="rgba(74,222,128,0.5)" fontSize="9">⟨ c ⟩</text>
              {/* Ground */}
              <rect x="0" y="106" width="220" height="14" rx="3" fill="#081200" />
              <line x1="22" y1="106" x2="198" y2="106" stroke="rgba(74,222,128,0.2)" strokeWidth="1" />
            </svg>
            <div style={{ fontSize:30, fontWeight:900, color:'#4ADE80', letterSpacing:2 }}>{q.a}x = {q.c}</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginTop:8 }}>x = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val}`} accentColor="#4ADE80" />
            <Btn onClick={confirm} color="#4ADE80">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
