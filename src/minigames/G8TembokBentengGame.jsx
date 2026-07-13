import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const SCENARIOS = [
  { m1: 2, type: 'sejajar', label: 'SEJAJAR dengan m₁ = 2', answer: '2', tier: 'easy' },
  { m1: 3, type: 'sejajar', label: 'SEJAJAR dengan m₁ = 3', answer: '3', tier: 'easy' },
  { m1: -4, type: 'sejajar', label: 'SEJAJAR dengan m₁ = -4', answer: '-4', tier: 'medium' },
  { m1: 2, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 2', answer: '-1/2', tier: 'medium' },
  { m1: -1, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = -1', answer: '1', tier: 'medium' },
  { m1: 4, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 4', answer: '-1/4', tier: 'hard' },
  { m1: 1, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = 1', answer: '-1', tier: 'hard' },
  { m1: -3, type: 'tegak lurus', label: 'TEGAK LURUS dengan m₁ = -3', answer: '1/3', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const item = pickFrom(poolForDifficulty(SCENARIOS, difficulty))
  const uniqueLabels = [...new Set(SCENARIOS.map(s => s.answer))]
  const finalItems = uniqueLabels.map((l, i) => ({ id: i, label: l }))

  const slot = { id: 'm2', answerLabel: item.answer }
  return { ...item, items: finalItems, slot }
}

export default function G8TembokBentengGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.m2 === undefined) return
    const placedItem = q.items.find(it => it.id === placed.m2)
    const correct = placedItem.label === q.slot.answerLabel
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧱 Rancangan Tembok Benteng" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
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
