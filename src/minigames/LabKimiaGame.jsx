import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Pipe segments with fraction lengths
const PIPES = [
  { id: 'p1', label: '1/4 m', value: 0.25 },
  { id: 'p2', label: '1/2 m', value: 0.50 },
  { id: 'p3', label: '3/4 m', value: 0.75 },
  { id: 'p4', label: '1/3 m', value: 1 / 3 },
  { id: 'p5', label: '2/3 m', value: 2 / 3 },
  { id: 'p6', label: '1/8 m', value: 0.125 },
]

const QUESTIONS = [
  { target: 1.0, label: '1 meter', slots: [
    { id: 's1', accepts: ['p2', 'p2'] }, // 1/2 + 1/2
    { id: 's2', accepts: ['p2', 'p2'] }
  ]},
  { target: 0.75, label: '3/4 meter', slots: [
    { id: 's1', accepts: ['p2'] },
    { id: 's2', accepts: ['p1'] }
  ]},
  { target: 1.25, label: '5/4 meter', slots: [
    { id: 's1', accepts: ['p3'] },
    { id: 's2', accepts: ['p2'] }
  ]},
  { target: 1.5, label: '3/2 meter', slots: [
    { id: 's1', accepts: ['p3'] },
    { id: 's2', accepts: ['p3'] }
  ]},
]

export default function PipaAirGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    setQ(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
    setPlaced({})
    setFeedback(null)
  }, [])

  const handlePlace = (slotId, pipeId) => {
    const newPlaced = { ...placed, [slotId]: pipeId }
    setPlaced(newPlaced)
    
    if (Object.keys(newPlaced).length === q.slots.length) {
      let totalValue = 0
      Object.values(newPlaced).forEach(pid => {
        totalValue += PIPES.find(p => p.id === pid).value
      })
      
      const correct = Math.abs(totalValue - q.target) < 0.01
      setFeedback(correct)
      if (correct) { addCoins(50); addExp(100) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔧 Teknisi Pipa Air" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Sambungkan pipa hingga mencapai:</div>
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#fff' }}>{q.label}</div>
        </Card>

        <Card border="rgba(103,232,249,0.2)">
          <DragMatch
            items={PIPES}
            slots={q.slots}
            placed={placed}
            onPlace={handlePlace}
            disabled={feedback !== null}
            accentColor="#67E8F9"
            renderChip={(it) => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🔩</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#67E8F9' }}>{it.label}</div>
              </div>
            )}
            renderSlot={() => <div style={{ fontSize: 12, color: '#6B7280' }}>Geser Pipa</div>}
          />
        </Card>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Saluran tersambung! Air mengalir lancar!' : '❌ Pipa tidak pas! Air masih bocor.'}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Saluran Berikutnya ▶</Btn>
          </>
        )}
        
        {feedback === false && (
          <Btn onClick={() => { setPlaced({}); setFeedback(null) }} color="#334155">Coba Lagi</Btn>
        )}
      </div>
    </div>
  )
}
