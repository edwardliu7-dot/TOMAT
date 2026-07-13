import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const RELATIONS = [
  { pairs: [[1, 2], [2, 4], [3, 6]], label: 'dua kali dari', tier: 'easy' },
  { pairs: [[4, 2], [6, 3], [8, 4]], label: 'setengah dari', tier: 'easy' },
  { pairs: [[2, 3], [3, 4], [4, 5]], label: 'satu lebihnya dari', tier: 'medium' },
  { pairs: [[3, 2], [4, 3], [5, 4]], label: 'satu kurangnya dari', tier: 'medium' },
  { pairs: [[2, 4], [3, 9], [4, 16]], label: 'kuadrat dari', tier: 'hard' },
  { pairs: [[2, 8], [3, 27], [4, 64]], label: 'kubik dari', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const item = pickFrom(poolForDifficulty(RELATIONS, difficulty))
  const items = RELATIONS.map((r, i) => ({ id: i, label: r.label }))
  const slot = { id: 'rel', answerId: items.find(it => it.label === item.label).id }
  return { pairs: item.pairs, items, slot }
}

export default function G8MakcomblangGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.rel === undefined) return
    const correct = placed.rel === q.slot.answerId
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="💘 Makcomblang Desa" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 12 }}>
            Tentukan relasi A ke B!
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Geser Relasi Kemari</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.rel === undefined} color="#c2410c">Cocokkan!</Btn>
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
