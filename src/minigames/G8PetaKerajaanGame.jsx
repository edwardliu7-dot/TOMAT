import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function fmtLine(m, c) { return `y = ${m}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}` }

function genQ() {
  const mOptions = [-3, -2, -1, 1, 2, 3, 4]
  const m = mOptions[Math.floor(Math.random() * mOptions.length)]
  const c = -5 + Math.floor(Math.random() * 11)
  const x1 = 0, y1 = c
  const x2 = 1 + Math.floor(Math.random() * 4)
  const y2 = m * x2 + c
  const answer = fmtLine(m, c)
  
  const options = [
    answer,
    fmtLine(m + 1, c),
    fmtLine(m, c + 2),
    fmtLine(-m, c),
  ]
  
  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'line', answerId: 0 }
  return { x1, y1, x2, y2, items, slot }
}

export default function G8PetaKerajaanGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.line === undefined) return
    const correct = placed.line === q.slot.answerId
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗺️ Ahli Peta Kerajaan" onBack={goBack} accentColor="#93C5FD" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Titik A ({q.x1}, {q.y1}) dan titik B ({q.x2}, {q.y2}).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#93C5FD', fontWeight: 700 }}>
            Pilih persamaan jalur yang tepat!
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Persamaan Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.line === undefined} color="#1d4ed8">Konfirmasi Jalur</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Jalur benar!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
