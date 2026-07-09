import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { expr: '2,4 + 1,7', answer: 4.1, wrong: [3.1, 4.0, 4.2], display: '2,4 + 1,7' },
  { expr: '5,6 − 2,3', answer: 3.3, wrong: [3.2, 3.4, 7.9], display: '5,6 − 2,3' },
  { expr: '0,8 + 0,7', answer: 1.5, wrong: [0.15, 1.4, 1.6], display: '0,8 + 0,7' },
  { expr: '3,2 × 2', answer: 6.4, wrong: [5.2, 6.2, 6.6], display: '3,2 × 2' },
  { expr: '7,5 ÷ 3', answer: 2.5, wrong: [2.0, 3.0, 4.5], display: '7,5 ÷ 3' },
  { expr: '1,25 + 0,75', answer: 2.0, wrong: [1.0, 1.5, 2.5], display: '1,25 + 0,75' },
  { expr: '4,8 − 1,3', answer: 3.5, wrong: [3.3, 3.8, 6.1], display: '4,8 − 1,3' },
  { expr: '0,6 × 5', answer: 3.0, wrong: [0.11, 2.5, 3.5], display: '0,6 × 5' },
  { expr: '9,0 ÷ 4', answer: 2.25, wrong: [2.0, 2.5, 3.25], display: '9,0 ÷ 4' },
  { expr: '2,5 + 3,75', answer: 6.25, wrong: [5.25, 6.0, 7.25], display: '2,5 + 3,75' },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(n => String(n).replace('.', ','))
  return { ...base, answerStr: String(base.answer).replace('.', ','), opts }
}

export default function TimbanganEmasGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answerStr
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas Digital" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>LABORATORIUM EMAS PRESISI TINGGI</div>
          {/* Scale visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>⚖️</div>
              <div style={{ background: '#1a2a1a', border: '2px solid #EAB308', borderRadius: 10, padding: '8px 24px', marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', letterSpacing: 2 }}>DIGITAL SCALE</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#EAB308', fontFamily: 'monospace' }}>??? gram</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Hitung berat serbuk emas dengan presisi tinggi:
          </div>
          <div style={{ padding: '14px', background: 'rgba(234,179,8,0.08)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#EAB308', fontFamily: 'monospace' }}>{q.display} = ?</div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih hasil yang tepat:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? q.answerStr : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Timbangan akurat! Hasil: ${q.answerStr}` : `❌ Tidak presisi! Jawaban benar: ${q.answerStr}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pengukuran Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
