import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const aRange = byDifficulty(difficulty, { easy: [1, 4], medium: [1, 7], hard: [3, 12] })
  const cRange = byDifficulty(difficulty, { easy: [1, 5], medium: [2, 9], hard: [5, 15] })
  const a1 = randInt(...aRange)
  const a2 = randInt(...aRange)
  const c1 = randInt(...cRange)
  const c2 = randInt(...cRange)
  const A = a1 + a2
  const B = c1 + c2
  const items = [
    { id: 'sq', label: A.toString() },
    { id: 'lin', label: B.toString() },
    { id: 'd1', label: (A + 1).toString() },
    { id: 'd2', label: (B + 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a1, a2, c1, c2, A, B, items }
}

export default function G9KargoGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const handlePlace = (slotId, itemId) => {
    const newPlaced = { ...placed, [slotId]: itemId }
    setPlaced(newPlaced)
    if (newPlaced.sSq && newPlaced.sLin) {
      const vSq = q.items.find(it => it.id === newPlaced.sSq).label
      const vLin = q.items.find(it => it.id === newPlaced.sLin).label
      const isCorrect = parseInt(vSq) === q.A && parseInt(vLin) === q.B
      setFeedback(isCorrect)
      survivalState.recordResult(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setPlaced({}); setFeedback(null) }} goBack={goBack} accentColor="#67E8F9" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Sortir Kargo Pesawat" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.a1}x² + {q.c1}x + {q.a2}x² + {q.c2}x
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan bentuk aljabar kargo!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'sSq' }, { id: 'sLin' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.id === 'sSq' || (!Object.values(placed).includes(it.id)) ? `${it.label}x²` : `${it.label}x`}</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Kargo tersortir sempurna!` : `❌ Salah. Jawaban: ${q.A}x² + ${q.B}x`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
