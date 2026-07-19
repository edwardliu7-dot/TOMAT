import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Mode: find the most frequent number in a list
function genQ(difficulty = 'medium') {
  const maxV = byDifficulty(difficulty, { easy: 10, medium: 18, hard: 25 })
  const mode = randInt(3, maxV)
  let others
  do {
    others = [randInt(2, maxV), randInt(2, maxV), randInt(2, maxV)]
  } while (others.some(v => v === mode) || new Set(others).size < 3)
  // mode appears 2×, others appear 1× each → [o0, mode, o1, mode, o2]
  const nums = [others[0], mode, others[1], mode, others[2]]
  const answer = mode
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 12 })
  return { nums, answer, min, max }
}

export default function G8PertahananBerlapisGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#001429 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Sistem Pertahanan Berlapis" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Ketebalan lapisan baja (cm) dari {q.nums.length} panel pertahanan. Temukan modus (nilai yang paling sering muncul)!</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#93C5FD', marginBottom: 4, letterSpacing: 2 }}>
              {q.nums.join(' , ')}
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Modus = nilai yang muncul paling banyak</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Modus = ${val}`} accentColor="#93C5FD" />
            <Btn onClick={confirm} color="#93C5FD">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
