import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const kPool = byDifficulty(difficulty, { easy: [2, 3], medium: [2, 3, 4], hard: [3, 4, 5] })
  const areaRange = byDifficulty(difficulty, { easy: [2, 7], medium: [2, 10], hard: [4, 14] })
  const sliderMax = byDifficulty(difficulty, { easy: 200, medium: 500, hard: 1200 })
  const k = kPool[Math.floor(Math.random() * kPool.length)]
  const area = randInt(...areaRange) * 5
  const answer = area * k * k
  return { area, k, answer, sliderMax }
}

export default function G9PanelSuryaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(10)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(10); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setVal(10); setFeedback(null) }} goBack={goBack} accentColor="#86EFAC" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛰️ Perakitan Panel Surya Satelit" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Panel lama: {q.area}m². Skala diperbesar {q.k}x.
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa luas panel surya yang baru?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={10} max={q.sliderMax} step={5}
              onChange={setVal}
              accentColor="#86EFAC" unit=" m²"
              leftLabel="10" rightLabel={`${q.sliderMax}`}
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#16a34a">Pasang Panel</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Luas baru = ${q.answer} m²` : `❌ Salah. Luas yang benar = ${q.answer} m²`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
