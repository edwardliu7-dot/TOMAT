import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { pct: 75, base: 80, answer: 60, wrong: [40, 75, 50] },
  { pct: 25, base: 120, answer: 30, wrong: [25, 60, 40] },
  { pct: 50, base: 60, answer: 30, wrong: [50, 20, 35] },
  { pct: 20, base: 150, answer: 30, wrong: [20, 50, 60] },
  { pct: 40, base: 50, answer: 20, wrong: [40, 25, 30] },
  { pct: 10, base: 200, answer: 20, wrong: [10, 30, 50] },
  { pct: 30, base: 90, answer: 27, wrong: [30, 18, 45] },
  { pct: 60, base: 70, answer: 42, wrong: [60, 35, 50] },
  { pct: 80, base: 40, answer: 32, wrong: [80, 20, 28] },
  { pct: 15, base: 200, answer: 30, wrong: [15, 60, 45] },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(String)
  return { ...base, opts }
}

export default function BateraiGame({ goBack }) {
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

  const batteryPct = q.pct

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Baterai Pesawat Luar Angkasa" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PANEL ENERGI PESAWAT</div>
          {/* Battery visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '2px solid rgba(103,232,249,0.4)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${batteryPct}%`, background: batteryPct > 60 ? 'linear-gradient(180deg,#34D399,#16a34a)' : batteryPct > 30 ? 'linear-gradient(180deg,#f59e0b,#d97706)' : 'linear-gradient(180deg,#ef4444,#dc2626)', transition: 'height 0.5s' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{batteryPct}%</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 12, lineHeight: 1.7 }}>
            Sistem membutuhkan <strong style={{ color: '#67E8F9' }}>{q.pct}%</strong> dari kapasitas penuh.<br />
            Kapasitas baterai total: <strong style={{ color: '#fff' }}>{q.base} unit energi</strong>
          </div>
          <div style={{ padding: '12px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: '#67E8F9', fontFamily: 'monospace', fontWeight: 700 }}>
              {q.pct}% × {q.base} = ?
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>({q.pct}/100 × {q.base})</div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Berapa unit energi yang dibutuhkan?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pesawat siap terbang! Energi = ${q.answer} unit` : `❌ Energi kurang! Jawaban benar: ${q.answer} unit`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
