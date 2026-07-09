import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
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
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newBp = useCallback(() => { setBp(genBlueprint()); setInput(''); setFeedback(null) }, [])

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 6) return
    setInput(p => p + k)
  }

  const inputNum = input === '' ? null : parseInt(input, 10)

  const confirm = () => {
    if (feedback !== null || inputNum === null) return
    const correct = inputNum === bp.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  // Progress bar: how close is input to correct
  const progress = inputNum !== null ? Math.min(100, (inputNum / (bp.correct * 1.5)) * 100) : 0

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
              <div style={{ height: 4, width: bp.mapDistance * 10, background: '#67E8F9', borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#67E8F9', fontWeight: 700, whiteSpace: 'nowrap' }}>{bp.mapDistance} cm</div>
              </div>
              <div style={{ fontSize: 20 }}>🏝️</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: '#94A3B8', opacity: 0.7 }}>
              ⚓ Pelabuhan ── jarak di peta ──▶ 🏝️ Pulau Harta
            </div>
          </div>
        </div>

        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PERHITUNGAN JARAK NYATA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#67E8F9', color: '#000', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>
                Jarak peta × skala: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{bp.mapDistance} × {bp.scale} = {bp.mapDistance * bp.scale}</strong>
              </div>
            </div>
            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', color: '#000', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>
                Ubah cm → meter (÷ 100): <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{bp.mapDistance * bp.scale} ÷ 100 = ?</strong>
              </div>
            </div>
          </div>

          {/* Distance progress bar */}
          {inputNum !== null && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>Kapal menuju pulau...</div>
              <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(103,232,249,0.2)', position: 'relative' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: feedback === true ? 'linear-gradient(90deg,#34D399,#059669)' : feedback === false ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#67E8F9,#0ea5e9)', borderRadius: 10, transition: 'width 0.2s' }} />
                <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff' }}>🏝️</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Kamu: {inputNum} m {feedback === true ? '✅' : feedback === false ? `❌ (benar: ${bp.correct} m)` : ''}
              </div>
            </div>
          )}
        </Card>

        {/* Numpad */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ background: '#0a1628', borderRadius: 10, padding: '10px 20px', textAlign: 'right', marginBottom: 12, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.3)' : feedback ? '#34D399' : '#ef4444'}` }}>
            <div style={{ fontSize: 11, color: '#94A3B8', letterSpacing: 1 }}>JARAK NYATA</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: feedback === null ? '#fff' : feedback ? '#34D399' : '#ef4444', fontFamily: 'monospace' }}>
              {input || '?'} meter
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {numpadKeys.map((k, idx) => (
              k === '' ? <div key={`empty-${idx}`} /> :
              <button key={`key-${idx}`} onClick={() => pressKey(k)} disabled={feedback !== null}
                style={{ padding: '14px 8px', borderRadius: 12, border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(103,232,249,0.2)'}`, background: k === '⌫' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)', color: k === '⌫' ? '#ef4444' : '#fff', fontSize: 20, fontWeight: 700, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                {k}
              </button>
            ))}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={inputNum !== null ? '#0e7490' : '#334155'}>
            {inputNum !== null ? `⚓ Berlayar sejauh ${input} meter!` : 'Ketik jarak nyata...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal sampai di Pulau Harta! Jarak = ${bp.correct} m` : `❌ Kapal tersesat! Jarak benar = ${bp.correct} m`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newBp} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
