import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a1 = 1 + Math.floor(Math.random() * 4)
  const a2 = 1 + Math.floor(Math.random() * 4)
  const c1 = 1 + Math.floor(Math.random() * 5)
  const c2 = 1 + Math.floor(Math.random() * 5)
  const A = a1 + a2
  const B = c1 + c2
  const items = [
    { id: 'sq', label: A.toString() },
    { id: 'lin', label: B.toString() },
    { id: 'd1', label: (A + 1).toString() },
    { id: 'd2', label: (B + 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a1, a2, c1, c2, A, B, items }
}

export default function G9KargoGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const handlePlace = (slotId, itemId) => {
    const newPlaced = { ...placed, [slotId]: itemId }
    setPlaced(newPlaced)
    if (newPlaced.sSq && newPlaced.sLin) {
      const vSq = q.items.find(it => it.id === newPlaced.sSq).label
      const vLin = q.items.find(it => it.id === newPlaced.sLin).label
      const isCorrect = parseInt(vSq) === q.A && parseInt(vLin) === q.B
      setFeedback(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Sortir Kargo Pesawat" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.a1}x² + {q.c1}x + {q.a2}x² + {q.c2}x
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan bentuk aljabar kargo!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'sSq' }, { id: 'sLin' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.id === 'sSq' || (!Object.values(placed).includes(it.id)) ? `${it.label}x²` : `${it.label}x`}</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Kargo tersortir sempurna!` : `❌ Salah. Jawaban: ${q.A}x² + ${q.B}x`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
