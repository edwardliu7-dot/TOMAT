import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const NONSQUARES = [2, 3, 5, 6, 7]

function genQ() {
  const k = 2 + Math.floor(Math.random() * 4)
  const m = NONSQUARES[Math.floor(Math.random() * NONSQUARES.length)]
  const inside = k * k * m
  const items = [
    { id: 'k', label: k.toString() },
    { id: 'm', label: m.toString() },
    { id: 'd1', label: (k + 1).toString() },
    { id: 'd2', label: (m + 1).toString() },
  ].sort(() => Math.random() - 0.5)
  return { inside, k, m, items }
}

export default function G9WormholeGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const handlePlace = (slotId, itemId) => {
    const newPlaced = { ...placed, [slotId]: itemId }
    setPlaced(newPlaced)
    if (newPlaced.slotK && newPlaced.slotM) {
      const isCorrect = newPlaced.slotK === 'k' && newPlaced.slotM === 'm'
      setFeedback(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #10071c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌀 Generator Lubang Cacing" onBack={goBack} accentColor="#C4B5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            √{q.inside}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan bentuk akar untuk menstabilkan portal!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[
            { id: 'slotK', label: 'k' },
            { id: 'slotM', label: 'm' }
          ]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#C4B5FD"
          renderSlot={(slot) => (
            <div style={{ color: '#C4B5FD', fontSize: 24, fontWeight: 900 }}>
              {slot.id === 'slotK' ? '?' : '√?'}
            </div>
          )}
          renderChip={(item) => (
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{item.label}</div>
          )}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Portal terbuka!` : `❌ Kurang tepat. Jawaban: ${q.k}√${q.m}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
