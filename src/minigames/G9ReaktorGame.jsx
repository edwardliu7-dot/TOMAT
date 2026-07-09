import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function fmt(coef, cons) { return `${coef}x ${cons >= 0 ? '+' : '−'} ${Math.abs(cons)}` }

function genQ() {
  const a = 1 + Math.floor(Math.random() * 5)
  const b = -6 + Math.floor(Math.random() * 13)
  const c = 1 + Math.floor(Math.random() * 5)
  const d = -6 + Math.floor(Math.random() * 13)
  const ansCoef = a + c
  const ansCons = b + d
  const items = [
    { id: 'c', label: ansCoef.toString() },
    { id: 'k', label: ansCons.toString() },
    { id: 'd1', label: (ansCoef + 1).toString() },
    { id: 'd2', label: (ansCons - 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a, b, c, d, ansCoef, ansCons, items }
}

export default function G9ReaktorGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const handlePlace = (slotId, itemId) => {
    const newPlaced = { ...placed, [slotId]: itemId }
    setPlaced(newPlaced)
    if (newPlaced.sC && newPlaced.sK) {
      const vC = q.items.find(it => it.id === newPlaced.sC).label
      const vK = q.items.find(it => it.id === newPlaced.sK).label
      const isCorrect = parseInt(vC) === q.ansCoef && parseInt(vK) === q.ansCons
      setFeedback(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚡ Transfer Energi Reaktor" onBack={goBack} accentColor="#67E8F9" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8, fontFamily: 'monospace' }}>
            ({fmt(q.a, q.b)}) + ({fmt(q.c, q.d)})
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#fff' }}>
            Gabungkan daya total reaktor!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'sC' }, { id: 'sK' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={(s) => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.id === 'sC' || (!Object.values(placed).includes(it.id)) ? `${it.label}x` : it.label}</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Energi tersambung!` : `❌ Salah. Jawaban: ${fmt(q.ansCoef, q.ansCons)}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
