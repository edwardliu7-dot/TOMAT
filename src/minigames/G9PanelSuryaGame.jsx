import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Komplemen: n(A') = n(S) - n(A), n(S) = 10 marbles
function genQ(difficulty = 'medium') {
  const nS = 10
  const nA = byDifficulty(difficulty, { easy: randInt(2, 4), medium: randInt(2, 7), hard: randInt(1, 8) })
  const answer = nS - nA
  const { min, max } = randomSliderRange([1, nS], { step: 1, minPad: 1, maxPad: 3 })
  return { nA, nS, answer, min, max }
}

export default function G9PanelSuryaGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a1000 0%,#0d1a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛰️ Perakitan Panel Surya Satelit" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Kotak komponen berisi {q.nS} bagian panel surya. {q.nA} di antaranya adalah panel aktif (A). Berapa panel cadangan (A')?</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FDE68A', marginBottom: 4 }}>
              n(A') = n(S) − n(A) = {q.nS} − {q.nA}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>n(A') = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`n(A') = ${val}`} accentColor="#FDE68A" />
            <Btn onClick={confirm} color="#FDE68A">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
