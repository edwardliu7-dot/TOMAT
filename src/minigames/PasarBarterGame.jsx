import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Simultaneous equations: ax + by = c, dx + ey = f
// We define x and y first, then derive the equations
const SCENARIOS = [
  { x: 5, y: 3, a: 2, b: 1, d: 1, e: 3, xLabel: 'Pedang', yLabel: 'Perisai', xOpts: [2,3,5,7], yOpts: [1,2,3,5] },
  { x: 4, y: 6, a: 3, b: 2, d: 1, e: 1, xLabel: 'Busur', yLabel: 'Anak Panah (pak)', xOpts: [2,4,6,8], yOpts: [3,5,6,8] },
  { x: 7, y: 2, a: 2, b: 3, d: 3, e: 1, xLabel: 'Helm', yLabel: 'Sepatu Zirah', xOpts: [3,5,7,9], yOpts: [1,2,3,4] },
  { x: 3, y: 5, a: 4, b: 1, d: 2, e: 3, xLabel: 'Baju Besi', yLabel: 'Sarung Tangan', xOpts: [1,2,3,4], yOpts: [3,4,5,6] },
]

function genScenario() {
  const s = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const eq1 = s.a * s.x + s.b * s.y
  const eq2 = s.d * s.x + s.e * s.y
  return { ...s, eq1, eq2 }
}

export default function PasarBarterGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [sc, setSc] = useState(genScenario)
  const [selX, setSelX] = useState(null)
  const [selY, setSelY] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const newSc = useCallback(() => { setSc(genScenario()); setSelX(null); setSelY(null); setFeedback(null) }, [])

  const submit = () => {
    const correct = selX === sc.x && selY === sc.y
    setFeedback(correct)
    if (correct) { addCoins(60); addExp(120) }
  }

  const coin = '#EAB308'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #450A0A 0%, #3b0a0a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛒 Pasar Barter Kerajaan" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(249,115,22,0.35)">
          <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>DAFTAR HARGA BARANG</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, background: 'rgba(253,186,116,0.08)', border: '1px solid rgba(253,186,116,0.2)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>⚔️ {sc.xLabel}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>x koin</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(253,186,116,0.08)', border: '1px solid rgba(253,186,116,0.2)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>🛡️ {sc.yLabel}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>y koin</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 15, color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
              {sc.a}{sc.xLabel[0].toLowerCase()} + {sc.b}{sc.yLabel[0].toLowerCase()} = 🪙 {sc.eq1}
            </div>
            <div style={{ fontSize: 15, color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
              {sc.d}{sc.xLabel[0].toLowerCase()} + {sc.e}{sc.yLabel[0].toLowerCase()} = 🪙 {sc.eq2}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
            x = harga {sc.xLabel}, y = harga {sc.yLabel}
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#FDBA74', fontWeight: 600 }}>Pilih harga {sc.xLabel} (x):</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {sc.xOpts.map(v => (
            <button key={v} onClick={() => { if (feedback === null) setSelX(v) }} style={{
              background: selX === v ? '#b45309' : '#1E2128',
              border: `2px solid ${selX === v ? '#FDBA74' : 'rgba(253,186,116,0.2)'}`,
              borderRadius: 10, padding: '12px 4px', color: '#fff', fontSize: 18, fontWeight: 800,
              cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{v}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#FDBA74', fontWeight: 600 }}>Pilih harga {sc.yLabel} (y):</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {sc.yOpts.map(v => (
            <button key={v} onClick={() => { if (feedback === null) setSelY(v) }} style={{
              background: selY === v ? '#b45309' : '#1E2128',
              border: `2px solid ${selY === v ? '#FDBA74' : 'rgba(253,186,116,0.2)'}`,
              borderRadius: 10, padding: '12px 4px', color: '#fff', fontSize: 18, fontWeight: 800,
              cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{v}</button>
          ))}
        </div>

        {feedback === null ? (
          <Btn onClick={submit} disabled={selX === null || selY === null} color="#b45309">🤝 Proposal Barter</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? '✅ BERHASIL! Barter berhasil, kamu hemat koin!' : `❌ GAGAL! Pedagang curang terungkap. Jawaban: x=${sc.x}, y=${sc.y}`}
              isCorrect={feedback}
              extras="+60 Koin | +120 EXP"
            />
            <Btn onClick={newSc} color="#b45309">Transaksi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
