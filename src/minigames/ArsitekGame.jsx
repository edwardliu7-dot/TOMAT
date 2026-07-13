import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
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
  return { mapDistance, scale, correct }
}

export default function NakhodaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [bp, setBp] = useState(() => genBlueprint(effectiveDifficulty))
  const [selectedVal, setSelectedVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newBp = useCallback(() => { setBp(genBlueprint(effectiveDifficulty)); setSelectedVal(0); setFeedback(null) }, [effectiveDifficulty])

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

  const maxVal = (bp.mapDistance * bp.scale) / 100 * 1.5

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
          <SliderInput
            value={selectedVal}
            min={0}
            max={maxVal}
            step={50}
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
            <Btn onClick={newBp} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
