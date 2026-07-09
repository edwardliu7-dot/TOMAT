import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Inverse proportion: w1 × d1 = w2 × d2
const SCENARIOS = [
  { w1: 4, d1: 6, w2: 3, answer: 8 },
  { w1: 6, d1: 4, w2: 8, answer: 3 },
  { w1: 2, d1: 9, w2: 6, answer: 3 },
  { w1: 5, d1: 8, w2: 4, answer: 10 },
  { w1: 3, d1: 12, w2: 9, answer: 4 },
  { w1: 8, d1: 3, w2: 4, answer: 6 },
  { w1: 10, d1: 2, w2: 4, answer: 5 },
]

function genQ() {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
}

export default function BentengPertahananGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [days, setDays] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setDays(1); setFeedback(null) }, [])

  const product1 = q.w1 * q.d1
  const product2 = q.w2 * days
  const isBalanced = product2 === product1

  const confirm = () => {
    if (feedback !== null) return
    const correct = days === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const maxDays = q.answer * 3
  const scaleColor = isBalanced ? '#34D399' : days < q.answer ? '#67E8F9' : '#f59e0b'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏰 Pembangun Benteng Pertahanan" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>⚠️ ALARM SERANGAN MUSUH ⚠️</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Benteng harus selesai tepat waktu! Atur jumlah hari agar persamaan seimbang:
          </div>

          {/* Balance equation visual */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{'👷'.repeat(Math.min(q.w1, 5))}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{q.w1} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{q.d1} Hari</div>
              <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.12)', borderRadius: 6, fontSize: 14, fontWeight: 900, color: '#67E8F9' }}>
                = {product1}
              </div>
            </div>

            {/* Scale/equals */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 24 }}>⚖️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: isBalanced ? '#34D399' : '#f59e0b' }}>
                {isBalanced ? '✅ SEIMBANG!' : product2 < product1 ? '< kurang' : '> lebih'}
              </div>
            </div>

            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: `2px solid ${feedback !== null ? (feedback ? '#34D399' : '#ef4444') : isBalanced ? 'rgba(52,211,153,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{'👷'.repeat(Math.min(q.w2, 5))}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{q.w2} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}><strong style={{ color: '#f59e0b', fontSize: 18 }}>{days}</strong> Hari</div>
              <div style={{ marginTop: 8, padding: '4px 8px', background: isBalanced ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)', borderRadius: 6, fontSize: 14, fontWeight: 900, color: isBalanced ? '#34D399' : '#f59e0b' }}>
                = {product2}
              </div>
            </div>
          </div>

          {/* Formula */}
          <div style={{ padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8, textAlign: 'center', fontSize: 14, color: '#94A3B8', fontFamily: 'monospace' }}>
            {q.w1} × {q.d1} = {q.w2} × {days} → {product1} {isBalanced ? '=' : '≠'} {product2}
          </div>
        </Card>

        {/* Day slider */}
        <Card border="rgba(245,158,11,0.2)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Atur jumlah hari untuk {q.w2} pekerja:
          </div>

          {/* +/- stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            <button onClick={() => { if (feedback === null) setDays(d => Math.max(1, d - 1)) }} disabled={days <= 1 || feedback !== null}
              style={{ width: 52, height: 52, borderRadius: 14, border: '2px solid rgba(103,232,249,0.3)', background: 'rgba(103,232,249,0.08)', color: '#67E8F9', fontSize: 24, fontWeight: 900, cursor: (days <= 1 || feedback !== null) ? 'not-allowed' : 'pointer', opacity: days <= 1 ? 0.3 : 1 }}>
              −
            </button>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: isBalanced ? '#34D399' : '#f59e0b', fontFamily: 'monospace' }}>{days}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>hari</div>
            </div>
            <button onClick={() => { if (feedback === null) setDays(d => Math.min(maxDays, d + 1)) }} disabled={days >= maxDays || feedback !== null}
              style={{ width: 52, height: 52, borderRadius: 14, border: '2px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: 24, fontWeight: 900, cursor: (days >= maxDays || feedback !== null) ? 'not-allowed' : 'pointer', opacity: days >= maxDays ? 0.3 : 1 }}>
              +
            </button>
          </div>

          <input type="range" min={1} max={maxDays} step={1} value={days}
            onChange={e => { if (feedback === null) setDays(Number(e.target.value)) }}
            disabled={feedback !== null}
            style={{ width: '100%', accentColor: scaleColor, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}
          />
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#94A3B8' }}>
            {isBalanced ? '✅ Persamaan seimbang! Konfirmasi jawabanmu.' : `${q.w2} × ${days} = ${product2} (target: ${product1})`}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={isBalanced ? '#16a34a' : '#0e7490'}>
            {isBalanced ? `🏰 Benteng selesai dalam ${days} hari!` : `✅ Konfirmasi ${days} Hari`}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Benteng selesai! Waktu = ${q.answer} hari` : `❌ Terlambat! Waktu yang benar = ${q.answer} hari (${q.w2} × ${q.answer} = ${product1})`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
