import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { total: 8, colored: 3, answer: '3/8', wrong: ['5/8', '3/5', '1/3'] },
  { total: 4, colored: 1, answer: '1/4', wrong: ['3/4', '1/2', '1/3'] },
  { total: 6, colored: 2, answer: '1/3', wrong: ['1/6', '1/4', '2/3'] },
  { total: 8, colored: 6, answer: '3/4', wrong: ['7/8', '5/8', '2/3'] },
  { total: 5, colored: 2, answer: '2/5', wrong: ['3/5', '1/2', '1/5'] },
  { total: 6, colored: 4, answer: '2/3', wrong: ['1/2', '3/4', '1/3'] },
  { total: 10, colored: 3, answer: '3/10', wrong: ['7/10', '1/3', '3/5'] },
  { total: 12, colored: 4, answer: '1/3', wrong: ['5/12', '1/4', '2/5'] },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong, base.answer])
  return { ...base, opts }
}

export default function KokiPizzaGame({ goBack }) {
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

  const anglePerSlice = (2 * Math.PI) / q.total
  const cx = 80, cy = 80, r = 70

  function slicePath(i) {
    const startAngle = i * anglePerSlice - Math.PI / 2
    const endAngle = (i + 1) * anglePerSlice - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🍕 Koki Pemotong Pizza" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>RESTORAN MONSTER KELAPARAN 🐲</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 16 }}>
            Monster ingin potongan pizza yang tepat. Berapa pecahan bagian yang berwarna <strong style={{ color: '#f97316' }}>oranye</strong>?
          </div>
          {/* Pizza SVG */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
              {Array.from({ length: q.total }, (_, i) => (
                <path key={i} d={slicePath(i)}
                  fill={i < q.colored ? '#f97316' : '#fbbf24'}
                  stroke="#0A2647" strokeWidth={2}
                />
              ))}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
            <span>🟠 {q.colored} bagian oranye</span>
            <span>🟡 {q.total - q.colored} bagian kuning</span>
          </div>
          <div style={{ padding: '10px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#67E8F9', fontWeight: 700 }}>
              {q.colored} dari {q.total} bagian = ?
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih pecahan yang benar:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Monster puas! Jawaban: ${q.answer}` : `❌ Monster marah! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pizza Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
