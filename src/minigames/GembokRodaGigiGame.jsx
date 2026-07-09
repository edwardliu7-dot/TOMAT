import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

const PAIRS = [
  [12, 8], [18, 12], [24, 16], [36, 24], [20, 15],
  [30, 20], [15, 25], [16, 24], [28, 21], [45, 30],
  [40, 24], [32, 48], [50, 35], [60, 45],
]

function genQ() {
  const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const answer = gcd(a, b)
  const wrongs = new Set()
  const candidates = [answer - 1, answer + 1, answer * 2, Math.min(a, b), Math.floor(answer / 2)]
  for (const c of shuffle(candidates)) {
    if (wrongs.size >= 3) break
    if (c !== answer && c > 0) wrongs.add(c)
  }
  const opts = shuffle([...wrongs, answer]).map(String)
  return { a, b, answer, opts }
}

export default function GembokRodaGigiGame({ goBack }) {
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

  const r1 = (q.a / 4) + 10
  const r2 = (q.b / 4) + 10

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Gembok Roda Gigi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM PENGUNCI PINTU PENJARA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            Dua mesin berputar. Temukan <strong style={{ color: '#fff' }}>roda gigi terbesar</strong> yang bisa memutar kedua mesin secara bersamaan!
          </div>
          {/* Gear visual */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width={r1 * 2 + 20} height={r1 * 2 + 20}>
                <circle cx={r1 + 10} cy={r1 + 10} r={r1} fill="rgba(103,232,249,0.1)" stroke="#67E8F9" strokeWidth={2} />
                <circle cx={r1 + 10} cy={r1 + 10} r={r1 / 3} fill="rgba(103,232,249,0.3)" stroke="#67E8F9" strokeWidth={1} />
                <text x={r1 + 10} y={r1 + 14} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold">{q.a}</text>
              </svg>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Mesin A</div>
            </div>
            <div style={{ fontSize: 24, color: '#67E8F9' }}>⚙️</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width={r2 * 2 + 20} height={r2 * 2 + 20}>
                <circle cx={r2 + 10} cy={r2 + 10} r={r2} fill="rgba(253,186,116,0.1)" stroke="#FDBA74" strokeWidth={2} />
                <circle cx={r2 + 10} cy={r2 + 10} r={r2 / 3} fill="rgba(253,186,116,0.3)" stroke="#FDBA74" strokeWidth={1} />
                <text x={r2 + 10} y={r2 + 14} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold">{q.b}</text>
              </svg>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Mesin B</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>FPB dari {q.a} dan {q.b} = ?</div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih ukuran roda gigi terbesar:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pintu terbuka! FPB(${q.a}, ${q.b}) = ${q.answer}` : `❌ Salah kunci! FPB yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Gembok Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
