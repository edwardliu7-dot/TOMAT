import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Rhombus: s=side, d1=one diagonal. d2/2 = √(s²-(d1/2)²), d2 = full other diagonal
const RHOMBUS = [
  { s: 5,  d1: 6,  d2: 8  },  // √(25-9)=4
  { s: 13, d1: 10, d2: 24 },  // √(169-25)=12
  { s: 17, d1: 16, d2: 30 },  // √(289-64)=15
  { s: 10, d1: 12, d2: 16 },  // √(100-36)=8
  { s: 25, d1: 14, d2: 48 },  // √(625-49)=24
  { s: 5,  d1: 8,  d2: 6  },  // √(25-16)=3
]

function genQ(difficulty = 'medium') {
  const pool = difficulty === 'easy' ? RHOMBUS.slice(0, 3) : RHOMBUS
  const r = pool[randInt(0, pool.length - 1)]
  const answer = r.d2
  const { min, max } = randomSliderRange([r.d1, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { ...r, answer, min, max }
}

export default function G8PerisaiGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
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
    if (correct) { addCoins(50); addExp(100) } else { recordWrongAnswer() }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#001a1a 0%,#001428 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Restorasi Perisai Kerajaan" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>Perisai berbentuk belah ketupat retak. Cari panjang diagonal yang hilang!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <line x1="110" y1="12" x2="193" y2="75" stroke="#67E8F9" strokeWidth="2.5" />
              <line x1="193" y1="75" x2="110" y2="138" stroke="#67E8F9" strokeWidth="2.5" />
              <line x1="110" y1="138" x2="27" y2="75" stroke="#67E8F9" strokeWidth="2.5" />
              <line x1="27" y1="75" x2="110" y2="12" stroke="#67E8F9" strokeWidth="2.5" />
              <line x1="27" y1="75" x2="193" y2="75" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="6,4" />
              <line x1="110" y1="12" x2="110" y2="138" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="6,4" />
              <rect x="110" y="75" width="9" height="9" fill="none" stroke="rgba(103,232,249,0.5)" strokeWidth="1" />
              <text x="152" y="38" fill="#67E8F9" fontSize="12" fontWeight="700">s</text>
              <text x="138" y="71" fill="#67E8F9" fontSize="10">d1</text>
              <text x="114" y="50" fill="#F472B6" fontSize="10" fontWeight="700">d2=?</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
              <div style={{ textAlign: 'center', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Sisi (s)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#67E8F9' }}>{q.s} cm</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Diagonal d1</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#67E8F9' }}>{q.d1} cm</div>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Diagonal d2 = ? cm</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>d2 = 2 × √(s² − (d1/2)²)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Diagonal d2: ${val} cm`} accentColor="#67E8F9" />
            <Btn onClick={confirm} color="#67E8F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
