import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const range = byDifficulty(difficulty, { easy: [1, 6], medium: [2, 10], hard: [5, 15] })
  const a = randInt(...range)
  const b = randInt(...range)
  const sum = a + b
  const items = [
    { id: 'ans', label: sum.toString() },
    { id: 'd1', label: (sum + 1).toString() },
    { id: 'd2', label: (a - b).toString() },
    { id: 'd3', label: (sum + 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a, b, sum, items }
}

export default function G9PipaOksigenGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const handlePlace = (slotId, itemId) => {
    const it = q.items.find(i => i.id === itemId)
    setPlaced({ [slotId]: itemId })
    const isCorrect = parseInt(it.label) === q.sum
    setFeedback(isCorrect)
    survivalState.recordResult(isCorrect)
    if (isCorrect) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setPlaced({}); setFeedback(null) }} goBack={goBack} accentColor="#67E8F9" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="🫁 Kalibrasi Pipa Oksigen" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.a}/x + {q.b}/x
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Sederhanakan pecahan aljabar untuk mengalirkan udara!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'num' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 20 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.label}/x</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Oksigen mengalir lancar!` : `❌ Salah. Jawaban: ${q.sum}/x`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
