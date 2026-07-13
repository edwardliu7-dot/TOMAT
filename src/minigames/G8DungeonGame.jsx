import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { a0Range, multiplier } = byDifficulty(difficulty, {
    easy: { a0Range: [1, 2], multiplier: 2 },
    medium: { a0Range: [1, 3], multiplier: 2 },
    hard: { a0Range: [2, 4], multiplier: 3 },
  })
  const a0 = randInt(...a0Range)
  const terms = [a0]
  for (let i = 1; i < 4; i++) terms.push(terms[i - 1] * multiplier)
  const answer = terms[3] * multiplier
  const { min, max } = randomSliderRange([terms[0], answer], { step: 1, minPad: 5, maxPad: 20 })
  return { terms, answer, multiplier, min, max }
}

export default function G8DungeonGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { 
    const nq = genQ(effectiveDifficulty)
    setQ(nq)
    setVal(nq.terms[3])
    setFeedback(null) 
  }, [effectiveDifficulty])

  React.useEffect(() => {
    setVal(q.terms[3])
  }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2d0a00 0%, #1a0a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗝️ Sandi Pintu Dungeon" onBack={goBack} accentColor="#FCA5A5" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
            Temukan angka berikutnya dalam pola!
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.terms.map((t, i) => (
              <React.Fragment key={i}>
                <div style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.25)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{t}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>→</div>
              </React.Fragment>
            ))}
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid #FCA5A5', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FCA5A5' }}>{val}</div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.min} 
              max={q.max} 
              onChange={setVal} 
              accentColor="#FCA5A5"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#dc2626">Putar Sandi</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Jawabannya ${q.answer}` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
