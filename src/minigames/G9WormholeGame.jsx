import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const kRange = byDifficulty(difficulty, { easy: [2, 4], medium: [2, 6], hard: [3, 9] })
  const nonsquarePool = byDifficulty(difficulty, { easy: [2, 3, 5], medium: [2, 3, 5, 6, 7], hard: [2, 3, 5, 6, 7, 10, 11, 12] })
  const k = randInt(...kRange)
  const m = nonsquarePool[Math.floor(Math.random() * nonsquarePool.length)]
  const inside = k * k * m
  const items = [
    { id: 'k', label: k.toString() },
    { id: 'm', label: m.toString() },
    { id: 'd1', label: (k + 1).toString() },
    { id: 'd2', label: (m + 1).toString() },
  ].sort(() => Math.random() - 0.5)
  return { inside, k, m, items }
}

export default function G9WormholeGame({ goBack, difficulty = 'medium', survival = false }) {
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
    if (newPlaced.slotK && newPlaced.slotM) {
      const isCorrect = newPlaced.slotK === 'k' && newPlaced.slotM === 'm'
      setFeedback(isCorrect)
      survivalState.recordResult(isCorrect)
      if (isCorrect) { addCoins(50); addExp(100) }
    }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setPlaced({}); setFeedback(null) }} goBack={goBack} accentColor="#C4B5FD" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #10071c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌀 Generator Lubang Cacing" onBack={goBack} accentColor="#C4B5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            √{q.inside}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan bentuk akar untuk menstabilkan portal!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[
            { id: 'slotK', label: 'k' },
            { id: 'slotM', label: 'm' }
          ]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#C4B5FD"
          renderSlot={(slot) => (
            <div style={{ color: '#C4B5FD', fontSize: 24, fontWeight: 900 }}>
              {slot.id === 'slotK' ? '?' : '√?'}
            </div>
          )}
          renderChip={(item) => (
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{item.label}</div>
          )}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Portal terbuka!` : `❌ Kurang tepat. Jawaban: ${q.k}√${q.m}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
