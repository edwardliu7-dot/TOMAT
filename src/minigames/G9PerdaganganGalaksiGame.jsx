import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const a = 2 + Math.floor(Math.random() * 4)
  const b = 2 + Math.floor(Math.random() * 4)
  const total = 100 * (2 + Math.floor(Math.random() * 8))
  const answer = `${a}x + ${b}y = ${total}`
  const distractors = new Set([`${b}x + ${a}y = ${total}`, `${a}x − ${b}y = ${total}`, `${a}x + ${b}y = ${total + 100}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${a}x + ${b}y = ${total + distractors.size * 100 + 200}`)
  const options = shuffle([answer, ...distractors])
  return { a, b, total, answer, options }
}

export default function G9PerdagangGalaksiGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])

  const choose = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="👽 Misi Perdagangan Galaksi" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            TAWARAN BARTER ALIEN
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            "<strong style={{ color: '#fff' }}>{q.a}</strong> kristal energi (x) dan <strong style={{ color: '#fff' }}>{q.b}</strong> modul mesin (y) setara dengan <strong style={{ color: '#fff' }}>{q.total}</strong> koin bintang."
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Manakah model aljabar yang tepat?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Negosiasi berhasil!` : `❌ Kurang tepat. Model yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
