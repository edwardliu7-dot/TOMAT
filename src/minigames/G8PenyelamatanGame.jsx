import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { xRange, yRange } = byDifficulty(difficulty, {
    easy: { xRange: [2, 4], yRange: [1, 3] },
    medium: { xRange: [3, 7], yRange: [2, 6] },
    hard: { xRange: [6, 12], yRange: [4, 10] },
  })
  const x = randInt(...xRange)
  const y = randInt(...yRange)
  const sum = x + y
  const diff = x - y
  const answer = `x + y = ${sum}; x - y = ${diff}`

  const options = [
    answer,
    `x + y = ${sum + 1}; x - y = ${diff}`,
    `x + y = ${sum}; x - y = ${diff + 1}`,
    `x - y = ${sum}; x + y = ${diff}`,
  ]

  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'sys', answerId: 0 }
  return { x, y, sum, diff, items, slot }
}

export default function G8PenyelamatanGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.sys === undefined) return
    const correct = placed.sys === q.slot.answerId
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
      <TopBar title="🆘 Misi Penyelamatan Ganda" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Jumlah (x + y) = {q.sum}<br />
            Selisih (x - y) = {q.diff}
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Sistem Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.sys === undefined} color="#b45309">Verifikasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Sandera diselamatkan!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
