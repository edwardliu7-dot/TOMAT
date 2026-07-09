import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const canMatch = Math.random() < 0.5
  const n = 3 + Math.floor(Math.random() * 4)
  const m = canMatch ? n : n + 1 + Math.floor(Math.random() * 2)
  const items = [
    { id: 'y', label: 'Bisa' },
    { id: 'n', label: 'Tidak Bisa' }
  ]
  const slot = { id: 'match', answerId: canMatch ? 'y' : 'n' }
  return { n, m, items, slot }
}

export default function G8DansaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.match === undefined) return
    const correct = placed.match === q.slot.answerId
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="💃 Pesta Dansa Kerajaan" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Ada 🤺 {q.n} ksatria dan 👸 {q.m} putri. Bisakah dibentuk korespondensi satu-satu?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <DragMatch
              items={q.items}
              slots={[q.slot]}
              placed={placed}
              onPlace={(slotId, itemId) => setPlaced({ [slotId]: itemId })}
              accentColor="#FDBA74"
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Jawaban Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.match === undefined} color="#c2410c">Konfirmasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sekali!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
