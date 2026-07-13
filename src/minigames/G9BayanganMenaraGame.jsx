import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const kRange = byDifficulty(difficulty, { easy: [2, 5], medium: [2, 8], hard: [4, 12] })
  const s1Range = byDifficulty(difficulty, { easy: [1, 4], medium: [1, 6], hard: [2, 9] })
  const s2Range = byDifficulty(difficulty, { easy: [2, 9], medium: [2, 14], hard: [5, 20] })
  const sliderMax = byDifficulty(difficulty, { easy: 60, medium: 120, hard: 220 })
  const k = randInt(...kRange)
  const s1 = randInt(...s1Range)
  const s2 = randInt(...s2Range)
  const h1 = k * s1
  const answer = k * s2
  return { h1, s1, s2, answer, sliderMax }
}

export default function G9BayanganMenaraGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(1); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setVal(1); setFeedback(null) }} goBack={goBack} accentColor="#86EFAC" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗽 Bayangan Menara Alien" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Pesawat (tinggi {q.h1}m) berbayang {q.s1}m.<br />
            Menara memiliki bayangan sepanjang {q.s2}m.
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa tinggi menara komunikasi alien?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={1} max={q.sliderMax} step={1}
              onChange={setVal}
              accentColor="#86EFAC" unit=" m"
              leftLabel="1m" rightLabel={`${q.sliderMax}m`}
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#16a34a">Ukur!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Tinggi menara = ${q.answer} m` : `❌ Salah. Tinggi yang benar = ${q.answer} m`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
