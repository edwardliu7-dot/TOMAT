import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function fmtLine(m, c) { return `y = ${m}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}` }

function genQ(difficulty = 'medium') {
  const { mOptions, cRange, x2Range } = byDifficulty(difficulty, {
    easy: { mOptions: [-2, -1, 1, 2], cRange: [-3, 3], x2Range: [1, 3] },
    medium: { mOptions: [-3, -2, -1, 1, 2, 3, 4], cRange: [-5, 5], x2Range: [1, 4] },
    hard: { mOptions: [-6, -5, -4, -3, 3, 4, 5, 6], cRange: [-8, 8], x2Range: [2, 6] },
  })
  const m = mOptions[Math.floor(Math.random() * mOptions.length)]
  const c = randInt(...cRange)
  const x1 = 0, y1 = c
  const x2 = randInt(...x2Range)
  const y2 = m * x2 + c
  const answer = fmtLine(m, c)

  const options = [
    answer,
    fmtLine(m + 1, c),
    fmtLine(m, c + 2),
    fmtLine(-m, c),
  ]

  const items = options.map((opt, i) => ({ id: i, label: opt }))
  const slot = { id: 'line', answerId: 0 }
  return { x1, y1, x2, y2, items, slot }
}

export default function G8PetaKerajaanGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.line === undefined) return
    const correct = placed.line === q.slot.answerId
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
      <TopBar title="🗺️ Ahli Peta Kerajaan" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Titik A ({q.x1}, {q.y1}) dan titik B ({q.x2}, {q.y2}).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#93C5FD', fontWeight: 700 }}>
            Pilih persamaan jalur yang tepat!
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
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Persamaan Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.line === undefined} color="#1d4ed8">Konfirmasi Jalur</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Jalur benar!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
