import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const [bMin, bMax] = byDifficulty(difficulty, { easy: [2, 3], medium: [2, 4], hard: [2, 5] })
  const [eMin, eMax] = byDifficulty(difficulty, { easy: [2, 3], medium: [2, 4], hard: [3, 5] })
  const b = randInt(bMin, bMax)
  const e = randInt(eMin, eMax)
  const answer = Math.pow(b, e)
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 30 })
  return { b, e, answer, min, max }
}

export default function G8SelRamuanGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a1000 0%,#2d1f00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧪 Penggandaan Sel Ramuan" onBack={goBack} accentColor="#FBBF24" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(251,191,36,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Alkemis menetaskan sel ajaib. Sel berkembang {q.b}× setiap tahap selama {q.e} tahap.</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#FBBF24', letterSpacing: 2 }}>{q.b}<sup>{q.e}</sup> = ?</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Berapa total sel ramuan yang dihasilkan?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Jumlah Sel: ${val}`} accentColor="#FBBF24" />
            <Btn onClick={confirm} color="#FBBF24">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
