import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function fmt(sq, coef, cons) { return `x² ${coef >= 0 ? '+' : '−'} ${Math.abs(coef)}x ${cons >= 0 ? '+' : '−'} ${Math.abs(cons)}` }

function genQ(difficulty = 'medium') {
  const range = byDifficulty(difficulty, { easy: [1, 6], medium: [1, 9], hard: [3, 14] })
  const a = randInt(...range)
  const b = randInt(...range)
  const coef = a + b
  const cons = a * b
  const items = [
    { id: 'c', label: coef.toString() },
    { id: 'k', label: cons.toString() },
    { id: 'd1', label: (coef + 2).toString() },
    { id: 'd2', label: (cons + 5).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a, b, coef, cons, items }
}

export default function G9LambungKapalGame({ goBack, difficulty = 'medium', survival = false }) {
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
    if (newPlaced.sC && newPlaced.sK) {
      const vC = q.items.find(it => it.id === newPlaced.sC).label
      const vK = q.items.find(it => it.id === newPlaced.sK).label
      const isCorrect = parseInt(vC) === q.coef && parseInt(vK) === q.cons
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
      <TopBar title="🚀 Perluasan Lambung Kapal" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 18, color: '#fff', textAlign: 'center', fontWeight: 800 }}>
            (x + {q.a})(x + {q.b})
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
            Tentukan luas total area baru!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'sC' }, { id: 'sK' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={() => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.id === 'sC' || (!Object.values(placed).includes(it.id)) ? `${it.label}x` : it.label}</span>}
        />
        <div style={{ textAlign: 'center', color: '#6B7280', fontSize: 12 }}>x² + [sC] + [sK]</div>

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Area terpasang!` : `❌ Salah. Jawaban: ${fmt(1, q.coef, q.cons)}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
