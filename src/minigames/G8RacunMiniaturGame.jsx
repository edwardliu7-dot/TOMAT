import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const bases = byDifficulty(difficulty, { easy: [2, 3, 10], medium: [2, 3, 5, 10], hard: [2, 3, 4, 5, 10] })
  const expMax = byDifficulty(difficulty, { easy: 2, medium: 3, hard: 4 })
  const b = bases[randInt(0, bases.length - 1)]
  const e = randInt(1, expMax)
  const answer = Math.pow(b, e) // denominator of b^(-e) = 1/b^e
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 1, maxPad: 20 })
  return { b, e, answer, min, max }
}

export default function G8RacunMiniaturGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a0d 0%,#0a1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="☠️ Ekstraksi Racun Miniatur" onBack={goBack} accentColor="#A3E635" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(163,230,53,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Racun diminiaturkan menggunakan pangkat negatif. Ubah ke bentuk pecahan:</div>
            <svg width="220" height="100" viewBox="0 0 220 100" style={{ display: 'block', margin: '8px auto 4px', overflow: 'visible' }}>
              <circle cx="32" cy="55" r="16" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5" />
              <text x="32" y="60" fill="rgba(52,211,153,0.4)" fontSize="18" textAnchor="middle">☠</text>
              <text x="110" y="40" fill="#34D399" fontSize="30" fontWeight="900" textAnchor="middle">1</text>
              <line x1="65" y1="52" x2="155" y2="52" stroke="#34D399" strokeWidth="2.5" />
              <text x="100" y="80" fill="#34D399" fontSize="22" fontWeight="800" textAnchor="middle">{q.b}</text>
              <text x="122" y="67" fill="#34D399" fontSize="14" textAnchor="middle">{q.e}</text>
              <text x="175" y="60" fill="#34D399" fontSize="20" fontWeight="700">= ?</text>
            </svg>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#A3E635' }}>{q.b}<sup>−{q.e}</sup> = 1 / ?</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Isi penyebut pecahan tersebut</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Penyebut: ${val}`} accentColor="#A3E635" />
            <Btn onClick={confirm} color="#A3E635">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
