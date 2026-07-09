import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// KABATAKU: Kurung, Kali/Bagi, Tambah/Kurang
const QUESTIONS = [
  { expr: '3 + 4 × 2', answer: 11, wrong: [14, 10, 7], hint: 'Kali dulu, baru tambah' },
  { expr: '(5 + 3) × 2', answer: 16, wrong: [11, 10, 13], hint: 'Kurung dulu, baru kali' },
  { expr: '20 ÷ 4 + 3', answer: 8, wrong: [7, 12, 5], hint: 'Bagi dulu, baru tambah' },
  { expr: '15 − 2 × 4', answer: 7, wrong: [52, 11, 3], hint: 'Kali dulu, baru kurang' },
  { expr: '(8 − 3) × 4', answer: 20, wrong: [29, 24, 16], hint: 'Kurung dulu, baru kali' },
  { expr: '24 ÷ (3 + 5)', answer: 3, wrong: [13, 8, 6], hint: 'Kurung dulu, baru bagi' },
  { expr: '6 + 4 × 3 − 2', answer: 16, wrong: [30, 12, 22], hint: 'Kali dulu, baru tambah & kurang' },
  { expr: '(7 + 3) ÷ 2 + 5', answer: 10, wrong: [9, 8, 12], hint: 'Kurung, lalu bagi, lalu tambah' },
  { expr: '5 × (12 − 8) ÷ 2', answer: 10, wrong: [4, 20, 8], hint: 'Kurung dulu, kali, lalu bagi' },
  { expr: '18 ÷ 3 + 4 × 2', answer: 14, wrong: [20, 12, 16], hint: 'Bagi dan kali dulu, baru tambah' },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong.slice(0, 3), base.answer]).map(String)
  return { ...base, opts }
}

export default function KeretaTambangGame({ goBack }) {
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
      <TopBar title="🚂 Rute Kereta Tambang" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SISTEM TUAS REL (KABATAKU)</div>
          {/* KABATAKU rule card */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'KA', color: '#f59e0b', desc: 'kurung' },
              { label: 'BA', color: '#6366F1', desc: 'kali/bagi' },
              { label: 'TA', color: '#34D399', desc: 'tambah/kurang' },
              { label: 'KU', color: '#34D399', desc: '' },
            ].map((r, i) => (
              <div key={i} style={{ background: `${r.color}22`, border: `1px solid ${r.color}55`, borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: r.color }}>{r.label}</div>
                {r.desc && <div style={{ fontSize: 10, color: '#94A3B8' }}>{r.desc}</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Selesaikan dengan urutan operasi yang benar:
          </div>
          <div style={{ padding: '16px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            💡 {q.hint}
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih posisi tuas yang benar:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kereta aman! Hasil: ${q.answer}` : `❌ Kereta terguling! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
