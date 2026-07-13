import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { abRange, totalRange } = byDifficulty(difficulty, {
    easy: { abRange: [1, 3], totalRange: [5, 15] },
    medium: { abRange: [2, 5], totalRange: [10, 30] },
    hard: { abRange: [3, 8], totalRange: [20, 60] },
  })
  const a = randInt(...abRange)
  const b = randInt(...abRange)
  const total = randInt(...totalRange)
  const answer = `${a}x + ${b}y = ${total}`

  const options = [
    answer,
    `${b}x + ${a}y = ${total}`,
    `${a}x - ${b}y = ${total}`,
    `${a}x + ${b}y = ${total + 5}`,
  ]

  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'eq', answerId: 0 }
  return { a, b, total, items, slot }
}

export default function G8TimbanganGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.eq === undefined) return
    const correct = placed.eq === q.slot.answerId
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas dan Perak" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            "{q.a} koin emas (x) dan {q.b} koin perak (y) beratnya {q.total} gram."
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#FDE68A', fontWeight: 700 }}>
            Tarik model matematika yang tepat!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <DragMatch
              items={q.items}
              slots={[q.slot]}
              placed={placed}
              onPlace={(slotId, itemId) => setPlaced({ [slotId]: itemId })}
              accentColor="#FDE68A"
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Model Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.eq === undefined} color="#b45309">Konfirmasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Model tepat!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
