import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { aRange, bRange, n } = byDifficulty(difficulty, {
    easy: { aRange: [2, 4], bRange: [2, 3], n: 10 },
    medium: { aRange: [2, 6], bRange: [2, 5], n: 12 },
    hard: { aRange: [3, 8], bRange: [4, 7], n: 15 },
  })
  const a = randInt(...aRange)
  const b = randInt(...bRange)
  const answer = a + (n - 1) * b
  const { min, max } = randomSliderRange([a, answer], { step: 1, minPad: 5, maxPad: 15 })
  return { a, b, n, answer, min, max }
}

export default function G8RamalanGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(30)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty)
    setQ(nq)
    setVal(nq.a)
    setFeedback(null)
  }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2d0a00 0%, #1a0a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔮 Ramalan Penyihir Agung" onBack={goBack} accentColor="#FCA5A5" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Awal: {q.a} monster. Gelombang berikutnya bertambah {q.b}.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 15, color: '#FCA5A5', fontWeight: 800 }}>
            Berapa jumlah monster pada gelombang ke-{q.n}?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.min} 
              max={q.max} 
              onChange={setVal} 
              accentColor="#FCA5A5"
              markEvery={10}
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#dc2626">Ramalkan!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Jawabannya ${q.answer}` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
