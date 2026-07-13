import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

// Precomputed (r, theta) combos where area = theta/360 * 22/7 * r^2 is guaranteed to be an integer.
// Tagged with a difficulty tier so easier levels stay with smaller radii / friendlier angles.
const COMBOS = [
  { r: 7, theta: 180, tier: 'easy' },
  { r: 14, theta: 90, tier: 'easy' }, { r: 14, theta: 180, tier: 'easy' },
  { r: 14, theta: 270, tier: 'medium' },
  { r: 21, theta: 60, tier: 'easy' }, { r: 21, theta: 120, tier: 'medium' }, { r: 21, theta: 240, tier: 'medium' },
  { r: 28, theta: 90, tier: 'medium' }, { r: 28, theta: 45, tier: 'medium' }, { r: 28, theta: 135, tier: 'hard' },
  { r: 35, theta: 72, tier: 'hard' }, { r: 42, theta: 60, tier: 'hard' }, { r: 42, theta: 30, tier: 'hard' },
  { r: 49, theta: 90, tier: 'hard' }, { r: 56, theta: 45, tier: 'hard' },
]

const SLIDER_MAX = { easy: 500, medium: 1200, hard: 3200 }

function genQ(difficulty = 'medium') {
  const { r, theta } = pickFrom(poolForDifficulty(COMBOS, difficulty))
  const area = (theta / 360) * (22 / 7) * r * r
  return { r, theta, answer: area, sliderMax: SLIDER_MAX[difficulty] ?? SLIDER_MAX.medium }
}

export default function G9SektorPemindaiGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setVal(0); setFeedback(null) }} goBack={goBack} accentColor="#4ADE80" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1400 0%, #100c00 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Sektor Pemindai" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Jari-jari: <strong style={{ color: '#fff' }}>{q.r} m</strong>, Sudut: <strong style={{ color: '#fff' }}>{q.theta}°</strong> (π ≈ 22/7).
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa luas juring pemindaian?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={0} max={q.sliderMax} step={1}
              onChange={setVal}
              accentColor="#4ADE80" unit=" m²"
              leftLabel="0" rightLabel={`${q.sliderMax}`}
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#15803d">Pindai Area</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Luas juring = ${q.answer} m²` : `❌ Salah. Luas yang benar = ${q.answer} m²`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
