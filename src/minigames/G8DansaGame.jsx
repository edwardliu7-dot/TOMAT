import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { nRange, extraRange } = byDifficulty(difficulty, {
    easy: { nRange: [2, 4], extraRange: [1, 1] },
    medium: { nRange: [3, 7], extraRange: [1, 2] },
    hard: { nRange: [6, 12], extraRange: [1, 3] },
  })
  const canMatch = Math.random() < 0.5
  const n = randInt(...nRange)
  const m = canMatch ? n : n + randInt(...extraRange)
  const items = [
    { id: 'y', label: 'Bisa' },
    { id: 'n', label: 'Tidak Bisa' }
  ]
  const slot = { id: 'match', answerId: canMatch ? 'y' : 'n' }
  return { n, m, items, slot }
}

export default function G8DansaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.match === undefined) return
    const correct = placed.match === q.slot.answerId
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
      <TopBar title="💃 Pesta Dansa Kerajaan" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Ada 🤺 {q.n} ksatria dan 👸 {q.m} putri. Bisakah dibentuk korespondensi satu-satu?
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Jawaban Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.match === undefined} color="#c2410c">Konfirmasi!</Btn>
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
