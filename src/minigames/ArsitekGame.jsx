import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function genBlueprint(difficulty = 'medium') {
  const { distances, scales } = byDifficulty(difficulty, {
    easy: { distances: [2, 3, 4, 5], scales: [1000, 2000] },
    medium: { distances: [3, 4, 5, 8, 10, 12], scales: [1000, 2000, 5000, 10000] },
    hard: { distances: [6, 9, 11, 14, 15, 18], scales: [5000, 10000, 25000, 50000] },
  })
  const mapDistance = distances[Math.floor(Math.random() * distances.length)]
  const scale = scales[Math.floor(Math.random() * scales.length)]
  const correct = (mapDistance * scale) / 100
  // step must divide the correct answer evenly so the slider thumb can land on it
  const step = scale / 100
  const { min, max } = randomSliderRange([correct], { step, minPad: 3, maxPad: 15 })
  return { mapDistance, scale, correct, step, min, max }
}

export default function NakhodaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [bp, setBp] = useState(() => genBlueprint(effectiveDifficulty))
  const [selectedVal, setSelectedVal] = useState(() => genBlueprint(effectiveDifficulty).min)
  const [feedback, setFeedback] = useState(null)

  const newBp = useCallback(() => {
    const nb = genBlueprint(effectiveDifficulty)
    setBp(nb); setSelectedVal(nb.min); setFeedback(null)
  }, [effectiveDifficulty])

  React.useEffect(() => { setSelectedVal(bp.min) }, [bp])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selectedVal === bp.correct
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newBp() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚓ Nakhoda Kapal Penjelajah" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>🗺️ PETA (1 : {bp.scale})</span>
            <span style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>{bp.mapDistance} cm</span>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 16 }}>
            Berapa meter jarak nyatanya?
          </div>
          <svg width="220" height="128" style={{ display: 'block', margin: '8px auto 4px', overflow: 'visible' }}>
            {/* Outer floor plan rect */}
            <rect x="28" y="12" width="164" height="100" rx="3" fill="none" stroke="#67E8F9" strokeWidth="2" />
            {/* Interior walls */}
            <line x1="28" y1="62" x2="118" y2="62" stroke="#67E8F9" strokeWidth="1.5" />
            <line x1="118" y1="12" x2="118" y2="62" stroke="#67E8F9" strokeWidth="1.5" />
            {/* Bottom room divider */}
            <line x1="28" y1="88" x2="192" y2="88" stroke="#67E8F9" strokeWidth="1" />
            {/* Scale bar */}
            <line x1="48" y1="120" x2="172" y2="120" stroke="#67E8F9" strokeWidth="3" />
            <line x1="48" y1="115" x2="48" y2="125" stroke="#67E8F9" strokeWidth="2" />
            <line x1="172" y1="115" x2="172" y2="125" stroke="#67E8F9" strokeWidth="2" />
            <text x="110" y="128" textAnchor="middle" fill="#67E8F9" fontSize="8" fontWeight="700">Skala 1:{bp.scale}</text>
            {/* Compass rose */}
            <text x="182" y="28" fill="#67E8F9" fontSize="11" fontWeight="700">N↑</text>
          </svg>
          <SliderInput
            value={selectedVal}
            min={bp.min}
            max={bp.max}
            step={bp.step}
            onChange={setSelectedVal}
            disabled={feedback !== null}
            accentColor="#67E8F9"
            unit=" m"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Berlayar {selectedVal} meter
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal sampai di Pulau Harta!` : `❌ Kapal tersesat! Jarak: ${bp.correct} m`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newBp() }} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
