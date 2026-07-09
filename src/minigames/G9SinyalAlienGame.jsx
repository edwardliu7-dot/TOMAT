import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const p = 1 + Math.floor(Math.random() * 6)
  const q2 = 1 + Math.floor(Math.random() * 6)
  const b = p + q2
  const c = p * q2
  const items = [
    { id: 'p', label: p.toString() },
    { id: 'q2', label: q2.toString() },
    { id: 'd1', label: (p + 1).toString() },
    { id: 'd2', label: (q2 + 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { b, c, p, q2, items }
}

export default function G9SinyalAlienGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const handlePlace = (slotId, itemId) => {
    const newPlaced = { ...placed, [slotId]: itemId }
    setPlaced(newPlaced)
    if (newPlaced.s1 && newPlaced.s2) {
      const v1 = q.items.find(it => it.id === newPlaced.s1).label
      const v2 = q.items.find(it => it.id === newPlaced.s2).label
      const isCorrect = (parseInt(v1) === q.p && parseInt(v2) === q.q2) || (parseInt(v1) === q.q2 && parseInt(v2) === q.p)
      setFeedback(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Dekripsi Sinyal Alien" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            x² + {q.b}x + {q.c}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Faktorkan persamaan untuk menerjemahkan sinyal!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 's1' }, { id: 's2' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>(x + {it.label})</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Pesan diterjemahkan!` : `❌ Salah. Jawaban: (x + ${q.p})(x + ${q.q2})`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
