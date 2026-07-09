import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const x = 3 + Math.floor(Math.random() * 5)
  const y = 2 + Math.floor(Math.random() * 5)
  const sum = x + y
  const diff = x - y
  const answer = `x + y = ${sum}; x - y = ${diff}`
  
  const options = [
    answer,
    `x + y = ${sum + 1}; x - y = ${diff}`,
    `x + y = ${sum}; x - y = ${diff + 1}`,
    `x - y = ${sum}; x + y = ${diff}`,
  ]
  
  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'sys', answerId: 0 }
  return { x, y, sum, diff, items, slot }
}

export default function G8PenyelamatanGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.sys === undefined) return
    const correct = placed.sys === q.slot.answerId
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="🆘 Misi Penyelamatan Ganda" onBack={goBack} accentColor="#FDE68A" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Jumlah (x + y) = {q.sum}<br />
            Selisih (x - y) = {q.diff}
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Sistem Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.sys === undefined} color="#b45309">Verifikasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Sandera diselamatkan!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
