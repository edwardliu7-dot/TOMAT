import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏰 Benteng Pertahanan" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Benteng harus selesai tepat waktu! Atur hari agar seimbang:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{q.w1} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{q.d1} Hari</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: '#67E8F9' }}>= {product1}</div>
            </div>

            <div style={{ fontSize: 24, color: isBalanced ? '#34D399' : '#f59e0b' }}>⚖️</div>

            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: `2px solid ${feedback !== null ? (feedback ? '#34D399' : '#ef4444') : isBalanced ? 'rgba(52,211,153,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{q.w2} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{days} Hari</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: isBalanced ? '#34D399' : '#f59e0b' }}>= {product2}</div>
            </div>
          </div>

          <SliderInput
            value={days}
            min={1}
            max={maxDays}
            onChange={setDays}
            disabled={feedback !== null}
            accentColor={isBalanced ? '#34D399' : '#f59e0b'}
            unit=" Hari"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={isBalanced ? '#16a34a' : '#0e7490'}>
            ✅ Konfirmasi {days} Hari
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Benteng selesai tepat waktu!` : `❌ Terlambat! Jawaban: ${q.answer} hari`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
