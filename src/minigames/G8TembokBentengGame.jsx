import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const SCENARIOS = [
  { m1: 2, type: 'sejajar', label: 'SEJAJAR dengan m₁ = 2', answer: '2' },
  { m1: 3, type: 'sejajar', label: 'SEJAJAR dengan m₁ = 3', answer: '3' },
  { m1: -4, type: 'sejajar', label: 'SEJAJAR dengan m₁ = -4', answer: '-4' },
  { m1: 2, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 2', answer: '-1/2' },
  { m1: 4, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 4', answer: '-1/4' },
  { m1: -1, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = -1', answer: '1' },
  { m1: 1, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 1', answer: '-1' },
  { m1: -3, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = -3', answer: '1/3' },
]

function genQ() {
  const item = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const items = SCENARIOS.map((s, i) => ({ id: i, label: s.answer }))
    // Remove duplicates from items if any, though here they might have different IDs but same label.
    // Let's just use the scenario list and keep only unique labels for chips.
  const uniqueLabels = [...new Set(SCENARIOS.map(s => s.answer))]
  const finalItems = uniqueLabels.map((l, i) => ({ id: i, label: l }))
  
  const slot = { id: 'm2', answerLabel: item.answer }
  return { ...item, items: finalItems, slot }
}

export default function G8TembokBentengGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.m2 === undefined) return
    const placedItem = q.items.find(it => it.id === placed.m2)
    const correct = placedItem.label === q.slot.answerLabel
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧱 Rancangan Tembok Benteng" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Tembok baru harus {q.label}.
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#93C5FD', fontWeight: 700 }}>
            Tarik gradien m₂ yang tepat!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <DragMatch
              items={q.items}
              slots={[q.slot]}
              placed={placed}
              onPlace={(slotId, itemId) => setPlaced({ [slotId]: itemId })}
              accentColor="#93C5FD"
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik m₂ Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.m2 === undefined} color="#1d4ed8">Konfirmasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tembok berdiri kokoh!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
