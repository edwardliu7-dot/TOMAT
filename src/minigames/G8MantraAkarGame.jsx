import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Simplify √n: find coeff a in a√b, then add two surds: a√b + c√b = (a+c)√b
const SINGLES = [
  { n: 8,  a: 2, b: 2 },  // 2√2
  { n: 12, a: 2, b: 3 },  // 2√3
  { n: 18, a: 3, b: 2 },  // 3√2
  { n: 20, a: 2, b: 5 },  // 2√5
  { n: 27, a: 3, b: 3 },  // 3√3
  { n: 32, a: 4, b: 2 },  // 4√2
  { n: 45, a: 3, b: 5 },  // 3√5
  { n: 50, a: 5, b: 2 },  // 5√2
  { n: 48, a: 4, b: 3 },  // 4√3
  { n: 75, a: 5, b: 3 },  // 5√3
  { n: 98, a: 7, b: 2 },  // 7√2
]

// Pairs where both simplify to same surd for addition
const PAIRS = [
  { na: 8,  nb: 18, base: 2, coeff: 2, ccoeff: 3, answer: 5  },  // 2√2+3√2
  { na: 50, nb: 18, base: 2, coeff: 5, ccoeff: 3, answer: 8  },  // 5√2+3√2
  { na: 12, nb: 27, base: 3, coeff: 2, ccoeff: 3, answer: 5  },  // 2√3+3√3
  { na: 48, nb: 75, base: 3, coeff: 4, ccoeff: 5, answer: 9  },  // 4√3+5√3
  { na: 20, nb: 45, base: 5, coeff: 2, ccoeff: 3, answer: 5  },  // 2√5+3√5
  { na: 32, nb: 8,  base: 2, coeff: 4, ccoeff: 2, answer: 6  },  // 4√2+2√2
]

function genQ(difficulty = 'medium') {
  if (difficulty === 'easy') {
    const s = SINGLES[randInt(0, SINGLES.length - 1)]
    const answer = s.a
    const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 1, maxPad: 6 })
    return { mode: 'single', ...s, answer, min, max }
  } else {
    const p = PAIRS[randInt(0, PAIRS.length - 1)]
    const answer = p.answer
    const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 1, maxPad: 8 })
    return { mode: 'pair', ...p, answer, min, max }
  }
}

export default function G8MantraAkarGame({ goBack, difficulty = 'medium', survival = false }) {
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

  const question = q.mode === 'single'
    ? `Sederhanakan √${q.n} = ?√${q.b}`
    : `√${q.na} + √${q.nb} = ?√${q.base}`

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a001a 0%,#0d0020 100%)' }}>
      <PlayerHeader />
      <TopBar title="✨ Penyederhanaan Mantra Akar" onBack={goBack} accentColor="#E879F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(232,121,249,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Mantra pertahanan kastil harus disederhanakan. Temukan koefisien yang tepat!</div>
            <svg width="220" height="110" viewBox="0 0 220 110" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Castle base */}
              <rect x="40" y="60" width="140" height="44" rx="3" fill="#0a001a" stroke="rgba(232,121,249,0.35)" strokeWidth="1.5" />
              {/* Castle towers */}
              <rect x="36" y="32" width="34" height="60" rx="3" fill="#0a001a" stroke="rgba(232,121,249,0.45)" strokeWidth="1.5" />
              <rect x="150" y="32" width="34" height="60" rx="3" fill="#0a001a" stroke="rgba(232,121,249,0.45)" strokeWidth="1.5" />
              {/* Center tower */}
              <rect x="83" y="18" width="54" height="72" rx="3" fill="#0d0020" stroke="#E879F9" strokeWidth="2" />
              {/* Battlements */}
              {[36,46,56,62].map((x,i)=>(<rect key={i} x={x} y="22" width="10" height="12" rx="2" fill="#0a001a" stroke="rgba(232,121,249,0.4)" strokeWidth="1" />))}
              {[150,160,170,180].map((x,i)=>(<rect key={i} x={x} y="22" width="10" height="12" rx="2" fill="#0a001a" stroke="rgba(232,121,249,0.4)" strokeWidth="1" />))}
              {[83,94,105,116,127].map((x,i)=>(<rect key={i} x={x} y="8" width="10" height="12" rx="2" fill="#0d0020" stroke="#E879F9" strokeWidth="1.2" />))}
              {/* Magic symbol */}
              <text x="110" y="52" textAnchor="middle" fill="#E879F9" fontSize="20">√</text>
              {/* Stars/sparkles */}
              {[[28,25],[192,28],[15,70],[205,68]].map(([x,y],i)=>(
                <text key={i} x={x} y={y} fill="rgba(232,121,249,0.5)" fontSize="10">✦</text>
              ))}
              {/* Gate */}
              <path d="M96,90 Q110,76 124,90 L124,104 L96,104 Z" fill="#0a001a" stroke="rgba(232,121,249,0.3)" strokeWidth="1" />
              {/* Formula label */}
              <text x="110" y="107" textAnchor="middle" fill="rgba(232,121,249,0.5)" fontSize="9">√n = a√b</text>
            </svg>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#E879F9' }}>{question}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>💡 Temukan koefisien (angka di depan √)</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Koefisien: ${val}`} accentColor="#E879F9" />
            <Btn onClick={confirm} color="#E879F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
