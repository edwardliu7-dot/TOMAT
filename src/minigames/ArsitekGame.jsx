import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const DISTANCES = [3, 4, 5, 8, 10, 12]
const SCALES = [1000, 2000, 5000, 10000]

function genBlueprint() {
  const mapDistance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)]
  const scale = SCALES[Math.floor(Math.random() * SCALES.length)]
  const correct = (mapDistance * scale) / 100
  return { mapDistance, scale, correct }
}

export default function NakhodaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [bp, setBp] = useState(genBlueprint)
  const [selectedVal, setSelectedVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newBp = useCallback(() => { setBp(genBlueprint()); setSelectedVal(0); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selectedVal === bp.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const maxVal = (bp.mapDistance * bp.scale) / 100 * 1.5

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚓ Nakhoda Kapal Penjelajah" onBack={goBack} />
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
