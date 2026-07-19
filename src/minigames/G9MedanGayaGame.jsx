import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Frekuensi harapan = P(A) × n, n = multiple of 10, P = nA/10
function genQ(difficulty = 'medium') {
  const nA = byDifficulty(difficulty, { easy: randInt(2, 4), medium: randInt(2, 7), hard: randInt(1, 8) })
  const mult = byDifficulty(difficulty, { easy: randInt(1, 3), medium: randInt(2, 5), hard: randInt(3, 8) })
  const n = 10 * mult
  const answer = nA * mult // fh = (nA/10) × n
  const { min, max } = randomSliderRange([1, answer], { step: 1, minPad: 2, maxPad: 20 })
  return { nA, n, answer, min, max }
}

export default function G9MedanGayaGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🛡️ Medan Gaya Pelindung" onBack={goBack} accentColor="#C084FC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(192,132,252,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Perisai aktif dengan peluang {q.nA}/10. Jika diuji {q.n} kali, berapa kali diharapkan perisai aktif?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C084FC', marginBottom: 4 }}>
              fh = P(A) × n = {q.nA}/10 × {q.n}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Frekuensi harapan = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`fh = ${val}`} accentColor="#C084FC" />
            <Btn onClick={confirm} color="#C084FC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
