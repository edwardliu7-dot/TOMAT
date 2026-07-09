import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { expr: '(−3) × 4', answer: -12, hint: 'negatif × positif = negatif' },
  { expr: '(−5) × (−3)', answer: 15, hint: 'negatif × negatif = positif' },
  { expr: '6 × (−7)', answer: -42, hint: 'positif × negatif = negatif' },
  { expr: '(−8) × (−4)', answer: 32, hint: 'negatif × negatif = positif' },
  { expr: '(−20) ÷ 4', answer: -5, hint: 'negatif ÷ positif = negatif' },
  { expr: '(−18) ÷ (−6)', answer: 3, hint: 'negatif ÷ negatif = positif' },
  { expr: '24 ÷ (−8)', answer: -3, hint: 'positif ÷ negatif = negatif' },
  { expr: '(−36) ÷ (−9)', answer: 4, hint: 'negatif ÷ negatif = positif' },
  { expr: '(−4) × 5 × (−2)', answer: 40, hint: 'dua tanda negatif = positif' },
  { expr: '(−3) × (−3) × (−1)', answer: -9, hint: 'tiga tanda negatif = negatif' },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const wrongs = new Set()
  const offsets = [-base.answer * 0.5, base.answer * 0.5, -base.answer, Math.abs(base.answer), -Math.abs(base.answer)]
  for (const o of shuffle(offsets.map(x => Math.round(x)))) {
    if (wrongs.size >= 3) break
    if (o !== base.answer) wrongs.add(o)
  }
  if (wrongs.size < 3) { wrongs.add(base.answer + 2); wrongs.add(base.answer - 2) }
  const opts = shuffle([...wrongs].slice(0, 3).concat(base.answer)).map(String)
  return { ...base, opts }
}

export default function PabrikRobotGame({ goBack }) {
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
      <TopBar title="🤖 Pabrik Pasukan Robot" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM PRODUKSI ROBOT</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            {['🤖', '🤖', '🤖'].map((r, i) => (
              <div key={i} style={{ fontSize: 32, opacity: 0.6 + i * 0.2 }}>{r}</div>
            ))}
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 8 }}>
            Perkalian/Pembagian bilangan bulat:
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            💡 Ingat: {q.hint}
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Berapa jumlah pasukan robot yang dihasilkan?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pabrik berjalan! Hasil: ${q.answer}` : `❌ Error sistem! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Produksi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
