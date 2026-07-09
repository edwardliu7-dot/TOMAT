import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 1 + Math.floor(Math.random() * 6)
  const b = 1 + Math.floor(Math.random() * 6)
  const sum = a + b
  const items = [
    { id: 'ans', label: sum.toString() },
    { id: 'd1', label: (sum + 1).toString() },
    { id: 'd2', label: (a - b).toString() },
    { id: 'd3', label: (sum + 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a, b, sum, items }
}

export default function G9PipaOksigenGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const handlePlace = (slotId, itemId) => {
    const it = q.items.find(i => i.id === itemId)
    setPlaced({ [slotId]: itemId })
    const isCorrect = parseInt(it.label) === q.sum
    setFeedback(isCorrect)
    if (isCorrect) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="🫁 Kalibrasi Pipa Oksigen" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.a}/x + {q.b}/x
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan pecahan aljabar untuk mengalirkan udara!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'num' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 20 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.label}/x</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Oksigen mengalir lancar!` : `❌ Salah. Jawaban: ${q.sum}/x`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
