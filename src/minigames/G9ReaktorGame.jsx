import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function fmt(coef, cons) { return `${coef}x ${cons >= 0 ? '+' : '−'} ${Math.abs(cons)}` }

function genQ(difficulty = 'medium') {
  const coefRange = byDifficulty(difficulty, { easy: [1, 5], medium: [1, 8], hard: [3, 12] })
  const consRange = byDifficulty(difficulty, { easy: [-6, 6], medium: [-10, 10], hard: [-15, 15] })
  const a = randInt(...coefRange)
  const b = randInt(...consRange)
  const c = randInt(...coefRange)
  const d = randInt(...consRange)
  const ansCoef = a + c
  const ansCons = b + d
  const items = [
    { id: 'c', label: ansCoef.toString() },
    { id: 'k', label: ansCons.toString() },
    { id: 'd1', label: (ansCoef + 1).toString() },
    { id: 'd2', label: (ansCons - 2).toString() },
  ].sort(() => Math.random() - 0.5)
  return { a, b, c, d, ansCoef, ansCons, items }
}

export default function G9ReaktorGame({ goBack, difficulty = 'medium', survival = false }) {
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
      const isCorrect = parseInt(vC) === q.ansCoef && parseInt(vK) === q.ansCons
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
      <TopBar title="⚡ Transfer Energi Reaktor" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8, fontFamily: 'monospace' }}>
            ({fmt(q.a, q.b)}) + ({fmt(q.c, q.d)})
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#fff' }}>
            Gabungkan daya total reaktor!
          </div>
        </Card>

        <DragMatch
          items={q.items}
          slots={[{ id: 'sC' }, { id: 'sK' }]}
          placed={placed}
          onPlace={handlePlace}
          disabled={feedback !== null}
          accentColor="#67E8F9"
          renderSlot={(s) => <span style={{ color: '#67E8F9', fontSize: 18 }}>?</span>}
          renderChip={(it) => <span style={{ color: '#fff', fontWeight: 800 }}>{it.id === 'sC' || (!Object.values(placed).includes(it.id)) ? `${it.label}x` : it.label}</span>}
        />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Energi tersambung!` : `❌ Salah. Jawaban: ${fmt(q.ansCoef, q.ansCons)}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
