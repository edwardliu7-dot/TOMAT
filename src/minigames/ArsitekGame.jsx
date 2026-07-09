import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const DISTANCES = [3, 4, 5, 8, 10, 12]
const SCALES = [1000, 2000, 5000, 10000]

function genBlueprint() {
  const mapDistance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)]
  const scale = SCALES[Math.floor(Math.random() * SCALES.length)]
  const correct = (mapDistance * scale) / 100
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const factor = [0.5, 2, 0.25, 4, 1.5, 3][Math.floor(Math.random() * 6)]
    const w = Math.round(correct * factor)
    if (w !== correct) wrongs.add(w)
  }
  const arr = [...wrongs, correct]
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]] }
  const options = arr.map(String)
  return { mapDistance, scale, correct: String(correct), options }
}

export default function NakhodaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [bp, setBp] = useState(genBlueprint)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const newBp = useCallback(() => { setBp(genBlueprint()); setSelected(null); setFeedback(null) }, [])

  const select = (opt) => {
    if (feedback !== null) return
    setSelected(opt)
    const correct = opt === bp.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚓ Nakhoda Kapal Penjelajah" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Nautical Map */}
        <div style={{ background: '#0d2240', borderRadius: 20, border: '3px solid #1d4a7a', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>🗺️ PETA LAUT</span>
            <span style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>SKALA 1 : {bp.scale}</span>
          </div>
          <div style={{ background: '#0a1f40', borderRadius: 10, padding: '20px', textAlign: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 20 }}>⚓</div>
              <div style={{ height: 3, width: bp.mapDistance * 10, background: '#67E8F9', borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#67E8F9', fontWeight: 700, whiteSpace: 'nowrap' }}>{bp.mapDistance} cm</div>
              </div>
              <div style={{ fontSize: 20 }}>🏝️</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: '#94A3B8', opacity: 0.7 }}>
              ⚓ Pelabuhan ── jarak di peta ──▶ 🏝️ Pulau Harta
            </div>
          </div>
        </div>

        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PERHITUNGAN JARAK NYATA</div>
          <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>
            Jarak di peta: <strong style={{ color: '#fff' }}>{bp.mapDistance} cm</strong><br />
            Skala peta: <strong style={{ color: '#fff' }}>1 : {bp.scale}</strong>
          </div>
          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Jarak sesungguhnya di lautan?</div>
            <div style={{ fontSize: 16, color: '#67E8F9', fontWeight: 800, marginTop: 4 }}>
              {bp.mapDistance} cm × {bp.scale} ÷ 100 = __ meter
            </div>
          </div>
        </Card>

        <OptionGrid options={bp.options} onSelect={select} correct={feedback !== null ? bp.correct : null} disabled={feedback !== null} />

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Kapal sampai di Pulau Harta!' : `❌ Kapal tersesat! Jarak benar = ${bp.correct} meter.`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newBp} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
