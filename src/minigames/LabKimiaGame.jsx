import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Pipe segments with fraction lengths
const PIPES = [
  { label: '1/4 m', value: 0.25 },
  { label: '1/2 m', value: 0.50 },
  { label: '3/4 m', value: 0.75 },
  { label: '1/3 m', value: 1 / 3 },
  { label: '2/3 m', value: 2 / 3 },
  { label: '1/8 m', value: 0.125 },
]

const TARGETS = [
  { value: 1.0, label: '1 meter (4/4)' },
  { value: 0.75, label: '3/4 meter' },
  { value: 1.25, label: '5/4 meter' },
  { value: 1.5, label: '3/2 meter' },
  { value: 0.5, label: '1/2 meter' },
]

export default function PipaAirGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [target, setTarget] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)])
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState([])
  const [feedback, setFeedback] = useState(null)

  const newTarget = useCallback(() => {
    setTarget(TARGETS[Math.floor(Math.random() * TARGETS.length)])
    setTotal(0); setHistory([]); setFeedback(null)
  }, [])

  const addPipe = (pipe) => {
    if (feedback !== null) return
    const newTotal = Math.round((total + pipe.value) * 1000) / 1000
    setTotal(newTotal)
    setHistory(h => [...h, pipe.label])
    if (Math.abs(newTotal - target.value) < 0.01) {
      setFeedback(true); addCoins(50); addExp(100)
    } else if (newTotal > target.value + 0.01) {
      setFeedback(false)
    }
  }

  const reset = () => { setTotal(0); setHistory([]); setFeedback(null) }
  const fillPct = Math.min((total / target.value) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔧 Teknisi Pipa Air" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PERBAIKAN SALURAN BOCOR</div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Sambungkan pipa hingga mencapai:</div>
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>{target.label}</div>
        </Card>

        {/* Pipe progress */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>Panjang pipa terpasang:</div>
          {/* Pipe visual */}
          <div style={{ position: 'relative', height: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 14, border: '2px solid rgba(103,232,249,0.3)', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${fillPct}%`, background: 'linear-gradient(90deg,#0284c7,#06b6d4)', borderRadius: 14, transition: 'width 0.3s', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              {fillPct > 20 && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>💧</span>}
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 16, color: '#67E8F9', fontWeight: 700 }}>
            {total.toFixed(3)} m / {target.value.toFixed(3)} m
          </div>
          {history.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              Potongan: {history.join(' + ')}
            </div>
          )}
        </Card>

        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>Pilih potongan pipa yang akan disambung:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {PIPES.map((p, i) => (
            <button key={i} onClick={() => addPipe(p)} disabled={feedback !== null} style={{
              background: '#1E2128', border: '1px solid rgba(103,232,249,0.25)', borderRadius: 12,
              padding: '12px 4px', cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{ fontSize: 18 }}>🔩</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#67E8F9' }}>{p.label}</span>
            </button>
          ))}
        </div>

        {feedback === null && total > 0 && (
          <button onClick={reset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 10, padding: '10px', fontFamily: 'inherit', cursor: 'pointer', fontSize: 13 }}>
            🔄 Lepas Semua Pipa
          </button>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Saluran tersambung! Air mengalir lancar!' : '❌ Pipa kelebihan! Saluran bocor lagi.'}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newTarget} color="#0e7490">Saluran Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
