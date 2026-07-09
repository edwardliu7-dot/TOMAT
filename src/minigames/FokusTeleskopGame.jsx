import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { number: '380.000.000', answer: '3,8 × 10⁸', wrong: ['38 × 10⁷', '3,8 × 10⁷', '0,38 × 10⁹'], hint: 'Geser koma 8 tempat ke kiri' },
  { number: '45.000', answer: '4,5 × 10⁴', wrong: ['45 × 10³', '4,5 × 10⁵', '0,45 × 10⁵'], hint: 'Geser koma 4 tempat ke kiri' },
  { number: '7.200.000', answer: '7,2 × 10⁶', wrong: ['72 × 10⁵', '7,2 × 10⁵', '7,2 × 10⁷'], hint: 'Geser koma 6 tempat ke kiri' },
  { number: '0,0056', answer: '5,6 × 10⁻³', wrong: ['56 × 10⁻⁴', '5,6 × 10⁻²', '5,6 × 10⁻⁴'], hint: 'Geser koma 3 tempat ke kanan' },
  { number: '0,00091', answer: '9,1 × 10⁻⁴', wrong: ['91 × 10⁻⁵', '9,1 × 10⁻³', '0,91 × 10⁻³'], hint: 'Geser koma 4 tempat ke kanan' },
  { number: '150.000.000', answer: '1,5 × 10⁸', wrong: ['15 × 10⁷', '1,5 × 10⁷', '1,5 × 10⁹'], hint: '(Jarak Bumi–Matahari) Geser koma 8 tempat' },
  { number: '3.000', answer: '3 × 10³', wrong: ['30 × 10²', '3 × 10⁴', '0,3 × 10⁴'], hint: 'Geser koma 3 tempat ke kiri' },
  { number: '0,008', answer: '8 × 10⁻³', wrong: ['8 × 10⁻²', '8 × 10⁻⁴', '80 × 10⁻⁴'], hint: 'Geser koma 3 tempat ke kanan' },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong, base.answer])
  return { ...base, opts }
}

export default function FokusTeleskopGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔭 Fokus Teleskop Bintang" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>OBSERVATORIUM BINTANG TOMAT</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 60 }}>🔭</div>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Layar teleskop menampilkan jarak yang sangat besar/kecil.<br />
            Ubah ke <strong style={{ color: '#fff' }}>bentuk baku (notasi ilmiah)</strong> untuk mempertajam fokus!
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Angka di layar:</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{q.number}</div>
            <div style={{ fontSize: 14, color: '#67E8F9', marginTop: 8 }}>= a × 10ⁿ (bentuk baku)?</div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            💡 {q.hint}
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih bentuk baku yang benar:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Teleskop terfokus! ${q.number} = ${q.answer}` : `❌ Fokus meleset! Jawaban: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Bintang Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
