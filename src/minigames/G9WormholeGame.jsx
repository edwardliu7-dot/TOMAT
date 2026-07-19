import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Mean of 5 numbers (integer guaranteed)
function genQ(difficulty = 'medium') {
  const maxM = byDifficulty(difficulty, { easy: 12, medium: 18, hard: 25 })
  const M = randInt(5, maxM)
  let nums
  let tries = 0
  do {
    const xs = [randInt(2, M + 6), randInt(2, M + 6), randInt(2, M + 6), randInt(2, M + 6)]
    const last = 5 * M - xs.reduce((a, b) => a + b, 0)
    if (last >= 2 && last <= M + 10) { nums = [...xs, last]; break }
    tries++
  } while (tries < 200)
  if (!nums) nums = [M - 2, M - 1, M, M + 1, M + 2]
  const answer = M
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 12 })
  return { nums, answer, min, max }
}

export default function G9WormholeGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d001a 0%,#1a002e 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌀 Generator Lubang Cacing" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Kecepatan masuk lubang cacing dalam 5 pengukuran (ribu km/s). Hitung rata-ratanya!</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#A78BFA', marginBottom: 6, letterSpacing: 1 }}>
              {q.nums.join(' + ')} = {q.nums.reduce((a, b) => a + b, 0)}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Rata-rata = {q.nums.reduce((a, b) => a + b, 0)} ÷ {q.nums.length} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Rata-rata = ${val}`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
