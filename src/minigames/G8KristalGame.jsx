import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

const ROOTS = {
  easy:   [{ n: 2, vals: [4,9,16,25,36,49] }],
  medium: [{ n: 2, vals: [4,9,16,25,36,49,64,81,100] }, { n: 3, vals: [8,27,64,125] }],
  hard:   [{ n: 2, vals: [4,9,16,25,36,49,64,81,100,121,144] }, { n: 3, vals: [8,27,64,125,216,343] }, { n: 4, vals: [16,81,256,625] }],
}

function genQ(difficulty = 'medium') {
  const sets = ROOTS[difficulty]
  const set = sets[randInt(0, sets.length - 1)]
  const val = set.vals[randInt(0, set.vals.length - 1)]
  const answer = Math.round(Math.pow(val, 1 / set.n))
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 1, maxPad: 8 })
  return { n: set.n, val, answer, min, max }
}

function rootSymbol(n) { return n === 2 ? '√' : n === 3 ? '∛' : '∜' }

export default function G8KristalGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a0d1a 0%,#0d0a2d 100%)' }}>
      <PlayerHeader />
      <TopBar title="💎 Pemisahan Elemen Kristal" onBack={goBack} accentColor="#C4B5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Kristal besar dipecah menjadi pecahan daya yang stabil. Hitung akar berikut:</div>
            <svg width="220" height="100" viewBox="0 0 220 100" style={{ display: 'block', margin: '8px auto 4px', overflow: 'visible' }}>
              <path d="M30,75 L50,90 L72,18 L190,18 L190,22 L76,22 L54,90 Z" fill="#A78BFA" />
              <text x="130" y="58" fill="#fff" fontSize="26" fontWeight="900" textAnchor="middle">{q.val}</text>
              <text x="52" y="35" fill="#A78BFA" fontSize="14" fontWeight="700">{q.r !== undefined ? q.r : q.n}</text>
              <polygon points="196,45 206,55 196,65 186,55" fill="rgba(167,139,250,0.35)" stroke="#A78BFA" strokeWidth="1" />
            </svg>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#C4B5FD' }}>
              {rootSymbol(q.n)}{q.val} = ?
            </div>
            {q.n > 2 && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Pangkat pecahan: {q.val}<sup>1/{q.n}</sup></div>}
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Nilai Akar: ${val}`} accentColor="#C4B5FD" />
            <Btn onClick={confirm} color="#C4B5FD">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
