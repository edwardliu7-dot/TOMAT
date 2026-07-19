import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Complement: n(A') = n(S) - n(A), where n(S) = 6 (dice)
function genQ(difficulty = 'medium') {
  const nA = byDifficulty(difficulty, { easy: randInt(1, 3), medium: randInt(1, 5), hard: randInt(1, 5) })
  const nS = 6
  const answer = nS - nA
  const { min, max } = randomSliderRange([1, nS], { step: 1, minPad: 1, maxPad: 3 })
  return { nA, nS, answer, min, max }
}

export default function G8PenyelamatanGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#001a1a 0%,#002e2e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🆘 Misi Penyelamatan Ganda" onBack={goBack} accentColor="#2DD4BF" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(45,212,191,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Dadu dilempar. Ada {q.nA} kemungkinan misi berhasil (kejadian A). Berapa kemungkinan misi GAGAL (kejadian A')?</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#2DD4BF', marginBottom: 4 }}>
              n(A') = n(S) − n(A) = {q.nS} − {q.nA}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>n(A') = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`n(A') = ${val}`} accentColor="#2DD4BF" />
            <Btn onClick={confirm} color="#2DD4BF">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
