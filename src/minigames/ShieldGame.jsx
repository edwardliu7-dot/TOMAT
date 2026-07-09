import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const PI = 3.14

function genMission() {
  const isArea = Math.random() < 0.5
  const radii = isArea ? [5, 10, 15] : [5, 10, 20]
  const r = radii[Math.floor(Math.random() * radii.length)]
  const value = isArea ? Math.round(PI * r * r) : Math.round(2 * PI * r)
  const targetR = Math.round(r)
  return { isArea, value, targetR, r }
}

export default function ShieldGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [mission, setMission] = useState(genMission)
  const [radius, setRadius] = useState(5)
  const [feedback, setFeedback] = useState(null)
  const [animating, setAnimating] = useState(false)

  const newMission = useCallback(() => { setMission(genMission()); setRadius(5); setFeedback(null); setAnimating(false) }, [])

  const activate = () => {
    setAnimating(true)
    setTimeout(() => {
      const correct = Math.abs(radius - mission.targetR) < 0.5
      setFeedback(correct)
      setAnimating(false)
      if (correct) { addCoins(60); addExp(120) }
    }, 800)
  }

  const maxR = 100
  const displayRadius = (radius / maxR) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Medan Gaya (Shield)" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(16,185,129,0.35)">
          <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textAlign: 'center' }}>
            {mission.isArea ? 'MODUL LUAS PERMUKAAN' : 'MODUL KELILING ENERGI'}
          </div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginBottom: 8 }}>
            Sebuah meteor mendekat! Aktifkan perisai dengan:
          </div>
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#34D399' }}>
            {mission.isArea ? `L = ${mission.value} satuan²` : `K = ${mission.value} satuan`}
          </div>
          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(52,211,153,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              {mission.isArea
                ? `L = π × r²  →  ${mission.value} = 3.14 × r²  →  r = ?`
                : `K = 2 × π × r  →  ${mission.value} = 2 × 3.14 × r  →  r = ?`}
            </div>
          </div>
        </Card>

        {/* Shield Visual */}
        <Card border="rgba(16,185,129,0.2)">
          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 12, color: '#94A3B8' }}>Visualisasi Perisai</div>
          <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
            <svg width="200" height="200" style={{ position: 'absolute', inset: 0 }}>
              {/* Outer reference */}
              <circle cx={100} cy={100} r={90} fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth={1} strokeDasharray="4 4" />
              {/* Dynamic shield */}
              <circle cx={100} cy={100} r={(radius / 25) * 90} fill="rgba(52,211,153,0.08)"
                stroke={animating ? '#f59e0b' : (feedback === true ? '#22c55e' : '#34D399')}
                strokeWidth={3}
                style={{ transition: 'r 0.2s, stroke 0.3s' }}
              />
              {animating && <circle cx={100} cy={100} r={(radius / 25) * 90} fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth={8} style={{ animation: 'pulse 0.8s ease-out' }} />}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#34D399' }}>r={radius}</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>satuan</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, textAlign: 'center' }}>
              Sesuaikan radius perisai (1–25):
            </div>
            <input type="range" min={1} max={25} step={1} value={radius}
              onChange={e => { if (feedback === null && !animating) setRadius(Number(e.target.value)) }}
              disabled={feedback !== null || animating}
              style={{ accentColor: '#34D399' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              <span>1</span><span>13</span><span>25</span>
            </div>
          </div>
        </Card>

        {feedback === null ? (
          <Btn onClick={activate} disabled={animating} color="#065f46">
            {animating ? '⚡ Mengaktifkan...' : '🛡️ Aktifkan Medan Gaya Pelindung!'}
          </Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? '✅ PERISAI SOLID! Meteor hancur berkeping-keping!' : `❌ PERISAI JEBOL! Radius benar adalah r = ${mission.targetR}.`}
              isCorrect={feedback}
              extras="+60 Koin | +120 EXP"
            />
            <Btn onClick={newMission} color="#065f46">Meteor Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
