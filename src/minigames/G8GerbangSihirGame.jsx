import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const FUNCTION_SETS = [
  [['Ana', 'Api'], ['Budi', 'Air'], ['Citra', 'Tanah']],
  [['Dewi', 'Angin'], ['Eko', 'Api'], ['Fira', 'Angin']],
  [['Gita', 'Es'], ['Hadi', 'Batu'], ['Indra', 'Kayu']],
]
const NON_FUNCTION_SETS = [
  [['Ana', 'Api'], ['Ana', 'Air'], ['Budi', 'Tanah']],
  [['Dewi', 'Angin'], ['Dewi', 'Api'], ['Eko', 'Es']],
  [['Gita', 'Es'], ['Gita', 'Kayu'], ['Hadi', 'Batu']],
]

function genQ() {
  const isFunction = Math.random() < 0.5
  const pool = isFunction ? FUNCTION_SETS : NON_FUNCTION_SETS
  const pairs = pool[Math.floor(Math.random() * pool.length)]
  const items = [
    { id: 'f', label: 'Fungsi' },
    { id: 'nf', label: 'Bukan Fungsi' }
  ]
  const slot = { id: 'type', answerId: isFunction ? 'f' : 'nf' }
  return { pairs, items, slot }
}

export default function G8GerbangSihirGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setPlaced({}); setFeedback(null) }, [])

  const confirm = () => {
    if (placed.type === undefined) return
    const correct = placed.type === q.slot.answerId
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚪 Gerbang Seleksi Sihir" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 12 }}>
            Apakah pendaftaran ini termasuk Fungsi?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.pairs.map(([a, b], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{a}</span>
                <span style={{ color: '#FDBA74' }}>→</span>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{b}</span>
              </div>
            ))}
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Jenis Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.type === undefined} color="#c2410c">Verifikasi!</Btn>
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
