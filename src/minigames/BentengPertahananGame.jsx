import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Inverse proportion: w1 workers take d1 days, w2 workers take ? days
// w1 × d1 = w2 × d2
const SCENARIOS = [
  { w1: 4, d1: 6, w2: 3, answer: 8, wrong: [4, 6, 12] },
  { w1: 6, d1: 4, w2: 8, answer: 3, wrong: [2, 6, 4] },
  { w1: 2, d1: 9, w2: 6, answer: 3, wrong: [2, 4, 27] },
  { w1: 5, d1: 8, w2: 4, answer: 10, wrong: [6, 12, 8] },
  { w1: 3, d1: 12, w2: 9, answer: 4, wrong: [3, 6, 36] },
  { w1: 8, d1: 3, w2: 4, answer: 6, wrong: [4, 12, 2] },
  { w1: 10, d1: 2, w2: 4, answer: 5, wrong: [20, 4, 8] },
]

function genQ() {
  const base = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(String)
  return { ...base, opts }
}

export default function BentengPertahananGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.answer)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏰 Pembangun Benteng Pertahanan" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>⚠️ ALARM SERANGAN MUSUH ⚠️</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            Musuh akan menyerang! Kita butuh lebih banyak pekerja untuk <strong style={{ color: '#fff' }}>mempercepat</strong> pembangunan benteng.
          </div>
          {/* Scenario display */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{'👷'.repeat(Math.min(q.w1, 5))}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Sebelumnya</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{q.w1} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{q.d1} Hari</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: '#94A3B8' }}>→</div>
            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{'👷'.repeat(Math.min(q.w2, 5))}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Sekarang</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>{q.w2} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>? Hari</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Rumus Perbandingan Berbalik Nilai:</div>
            <div style={{ fontSize: 15, color: '#67E8F9', fontFamily: 'monospace', fontWeight: 700 }}>
              {q.w1} × {q.d1} = {q.w2} × ❓
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Berapa hari benteng selesai dengan {q.w2} pekerja?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Benteng selesai! Waktu = ${q.answer} hari` : `❌ Terlambat! Waktu yang benar = ${q.answer} hari`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
