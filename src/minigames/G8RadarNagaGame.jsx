import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

const QUADRANTS = [
  { label: 'Kuadran I (kanan atas)', sx: 1, sy: 1 },
  { label: 'Kuadran II (kiri atas)', sx: -1, sy: 1 },
  { label: 'Kuadran III (kiri bawah)', sx: -1, sy: -1 },
  { label: 'Kuadran IV (kanan bawah)', sx: 1, sy: -1 },
]

function genQ(difficulty = 'medium') {
  const { coordRange, sliderBound } = byDifficulty(difficulty, {
    easy: { coordRange: [1, 3], sliderBound: 5 },
    medium: { coordRange: [1, 6], sliderBound: 7 },
    hard: { coordRange: [1, 10], sliderBound: 12 },
  })
  const x = randInt(...coordRange)
  const y = randInt(...coordRange)
  const quad = QUADRANTS[Math.floor(Math.random() * 4)]
  return { x, y, quad, ansX: quad.sx * x, ansY: quad.sy * y, sliderBound }
}

export default function G8RadarNagaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [valX, setValX] = useState(0)
  const [valY, setValY] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setValX(0); setValY(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = valX === q.ansX && valY === q.ansY
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐉 Radar Naga Pengintai" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan koordinat ({q.x}, {q.y}) di {q.quad.label}!
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#FDBA74' }}>
            ({valX}, {valY})
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, textAlign: 'center' }}>KOORDINAT X</div>
              <SliderInput value={valX} min={-q.sliderBound} max={q.sliderBound} onChange={setValX} accentColor="#FDBA74" markEvery={1} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, textAlign: 'center' }}>KOORDINAT Y</div>
              <SliderInput value={valY} min={-q.sliderBound} max={q.sliderBound} onChange={setValY} accentColor="#FDBA74" markEvery={1} />
            </div>
            <Btn onClick={confirm} color="#c2410c">Luncurkan Suar!</Btn>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Naga menjatuhkan suar tepat sasaran!` : `❌ Meleset. Titik yang benar: (${q.ansX}, ${q.ansY})`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
