import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 2 + Math.floor(Math.random() * 4)
  const b = 2 + Math.floor(Math.random() * 4)
  const total = 10 + Math.floor(Math.random() * 20)
  const answer = `${a}x + ${b}y = ${total}`
  
  const options = [
    answer,
    `${b}x + ${a}y = ${total}`,
    `${a}x - ${b}y = ${total}`,
    `${a}x + ${b}y = ${total + 5}`,
  ]
  
  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'eq', answerId: 0 }
  return { a, b, total, items, slot }
}

export default function G8TimbanganGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.eq === undefined) return
    const correct = placed.eq === q.slot.answerId
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas dan Perak" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            "{q.a} koin emas (x) dan {q.b} koin perak (y) beratnya {q.total} gram."
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#FDE68A', fontWeight: 700 }}>
            Tarik model matematika yang tepat!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <DragMatch
              items={q.items}
              slots={[q.slot]}
              placed={placed}
              onPlace={(slotId, itemId) => setPlaced({ [slotId]: itemId })}
              accentColor="#FDE68A"
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Model Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.eq === undefined} color="#b45309">Konfirmasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Model tepat!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
