import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Compute b^(p/q) where result is integer: e.g. 8^(2/3)=4, 27^(2/3)=9, 16^(3/4)=8
const PROBLEMS = {
  easy: [
    { expr: '8^(1/3)', b: 8, p: 1, q: 3, answer: 2, label: '8^(1/3)' },
    { expr: '27^(1/3)', b: 27, p: 1, q: 3, answer: 3, label: '27^(1/3)' },
    { expr: '4^(1/2)', b: 4, p: 1, q: 2, answer: 2, label: '4^(1/2)' },
    { expr: '9^(1/2)', b: 9, p: 1, q: 2, answer: 3, label: '9^(1/2)' },
    { expr: '64^(1/3)', b: 64, p: 1, q: 3, answer: 4, label: '64^(1/3)' },
  ],
  medium: [
    { expr: '8^(2/3)', b: 8, p: 2, q: 3, answer: 4, label: '8^(2/3)' },
    { expr: '27^(2/3)', b: 27, p: 2, q: 3, answer: 9, label: '27^(2/3)' },
    { expr: '16^(3/4)', b: 16, p: 3, q: 4, answer: 8, label: '16^(3/4)' },
    { expr: '4^(3/2)', b: 4, p: 3, q: 2, answer: 8, label: '4^(3/2)' },
    { expr: '25^(3/2)', b: 25, p: 3, q: 2, answer: 125, label: '25^(3/2)' },
    { expr: '64^(2/3)', b: 64, p: 2, q: 3, answer: 16, label: '64^(2/3)' },
  ],
  hard: [
    { expr: '32^(3/5)', b: 32, p: 3, q: 5, answer: 8, label: '32^(3/5)' },
    { expr: '64^(5/6)', b: 64, p: 5, q: 6, answer: 32, label: '64^(5/6)' },
    { expr: '243^(2/5)', b: 243, p: 2, q: 5, answer: 9, label: '243^(2/5)' },
    { expr: '125^(4/3)', b: 125, p: 4, q: 3, answer: 625, label: '125^(4/3)' },
    { expr: '16^(5/4)', b: 16, p: 5, q: 4, answer: 32, label: '16^(5/4)' },
  ],
}

function genQ(difficulty = 'medium') {
  const pool = PROBLEMS[difficulty]
  const prob = pool[randInt(0, pool.length - 1)]
  const { min, max } = randomSliderRange([1, prob.answer], { step: 1, minPad: 1, maxPad: 20 })
  return { ...prob, min, max }
}

export default function G8FusiEnergiGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty)
    setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])

  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d00 0%,#2d1500 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚗️ Fusi Energi Alkemis" onBack={goBack} accentColor="#FB923C" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(251,146,60,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Hitung nilai pangkat pecahan berikut agar reaktor tidak meledak:</div>
            <svg width="220" height="110" viewBox="0 0 220 110" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Reactor core */}
              <ellipse cx="110" cy="60" rx="38" ry="38" fill="#1a0d00" stroke="#FB923C" strokeWidth="2" />
              <ellipse cx="110" cy="60" rx="26" ry="26" fill="#2d1500" stroke="rgba(251,146,60,0.5)" strokeWidth="1.5" />
              <ellipse cx="110" cy="60" rx="14" ry="14" fill="#FB923C" opacity="0.25" />
              {/* Energy beams */}
              {[0,60,120,180,240,300].map((deg,i)=>{
                const rad=deg*Math.PI/180
                return <line key={i} x1={110+14*Math.cos(rad)} y1={60+14*Math.sin(rad)} x2={110+36*Math.cos(rad)} y2={60+36*Math.sin(rad)} stroke="#FB923C" strokeWidth="1.5" opacity="0.7" />
              })}
              {/* Pipes */}
              <rect x="15" y="55" width="34" height="10" rx="4" fill="#1a0d00" stroke="rgba(251,146,60,0.5)" strokeWidth="1.5" />
              <rect x="171" y="55" width="34" height="10" rx="4" fill="#1a0d00" stroke="rgba(251,146,60,0.5)" strokeWidth="1.5" />
              <rect x="105" y="6" width="10" height="30" rx="4" fill="#1a0d00" stroke="rgba(251,146,60,0.5)" strokeWidth="1.5" />
              <rect x="105" y="74" width="10" height="30" rx="4" fill="#1a0d00" stroke="rgba(251,146,60,0.5)" strokeWidth="1.5" />
              {/* Power label */}
              <text x="110" y="65" textAnchor="middle" fill="#FB923C" fontSize="11" fontWeight="700">⚡</text>
              {/* Formula hint */}
              <text x="110" y="105" textAnchor="middle" fill="rgba(251,146,60,0.6)" fontSize="9">bᵖ/ᵍ = (ᵍ√b)ᵖ</text>
            </svg>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#FB923C' }}>{q.label} = ?</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>💡 Petunjuk: hitung akarnya dulu, lalu pangkatkan</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Nilai: ${val}`} accentColor="#FB923C" />
            <Btn onClick={confirm} color="#FB923C">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
