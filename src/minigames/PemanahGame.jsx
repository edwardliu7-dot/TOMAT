import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const TARGETS = [
  { x: 2, y: 4, m: 2 },
  { x: 3, y: 9, m: 3 },
  { x: 4, y: 4, m: 1 },
  { x: 5, y: 10, m: 2 },
  { x: 3, y: 6, m: 2 },
  { x: 4, y: -8, m: -2 },
  { x: 5, y: -5, m: -1 },
  { x: 6, y: 18, m: 3 },
]

function genTarget() { return TARGETS[Math.floor(Math.random() * TARGETS.length)] }

export default function PemanahGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [target, setTarget] = useState(genTarget)
  const [slope, setSlope] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newTarget = useCallback(() => { setTarget(genTarget()); setSlope(0); setFeedback(null) }, [])

  const shoot = () => {
    const correct = Math.abs(slope - target.m) < 0.1
    setFeedback(correct)
    if (correct) { addCoins(60); addExp(120) }
  }

  // SVG arrow line
  const cx = 120, cy = 120, scale = 20
  const ex = cx + target.x * scale
  const ey = cy - target.y * scale
  const ax = cx + target.x * scale
  const ay = cy - slope * target.x * scale

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #450A0A 0%, #3b0a0a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏹 Pemanah Balista" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(249,115,22,0.3)">
          <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>KOORDINAT TARGET MUSUH</div>
          <div style={{ fontSize: 15, color: '#fff', textAlign: 'center' }}>
            Target berada di titik <strong style={{ color: '#FDBA74' }}>({target.x}, {target.y})</strong>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
            Gradien (kemiringan) = y / x = {target.y}/{target.x}
          </div>
        </Card>

        {/* Grid visualization */}
        <Card border="rgba(249,115,22,0.2)">
          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 12, color: '#94A3B8' }}>Bidang Koordinat</div>
          <svg width="240" height="240" style={{ display: 'block', margin: '0 auto' }}>
            {/* Grid */}
            {[-4,-2,0,2,4].map(v => (
              <g key={v}>
                <line x1={0} y1={cy - v*scale} x2={240} y2={cy - v*scale} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <line x1={cx + v*scale} y1={0} x2={cx + v*scale} y2={240} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              </g>
            ))}
            {/* Axes */}
            <line x1={0} y1={cy} x2={240} y2={cy} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
            <line x1={cx} y1={0} x2={cx} y2={240} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
            {/* Arrow line (player) */}
            <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#FDBA74" strokeWidth={2.5} strokeDasharray="6 3" />
            {/* Target point */}
            <circle cx={ex} cy={ey} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
            <text x={ex+10} y={ey-8} fill="#fff" fontSize={12} fontWeight="bold">({target.x},{target.y})</text>
            {/* Origin */}
            <circle cx={cx} cy={cy} r={4} fill="#FDBA74" />
          </svg>
        </Card>

        <Card border="rgba(249,115,22,0.2)">
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>
            Sesuaikan gradien panah: <strong style={{ color: '#FDBA74' }}>m = {slope.toFixed(1)}</strong>
          </div>
          <input type="range" min={-5} max={5} step={0.5} value={slope}
            onChange={e => { if (feedback === null) setSlope(Number(e.target.value)) }}
            disabled={feedback !== null}
            style={{ accentColor: '#FDBA74' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            <span>−5</span><span>0</span><span>+5</span>
          </div>
        </Card>

        {feedback === null ? (
          <Btn onClick={shoot} color="#b45309">🏹 Lepaskan Anak Panah!</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? '✅ TEPAT SASARAN! Musuh berhasil ditumbangkan.' : `❌ MELENSET! Gradien benar adalah m = ${target.m}.`}
              isCorrect={feedback}
              extras="+60 Koin | +120 EXP"
            />
            <Btn onClick={newTarget} color="#b45309">Target Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
