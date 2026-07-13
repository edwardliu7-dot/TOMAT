import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const startRange = byDifficulty(difficulty, { easy: [1, 2], medium: [1, 4], hard: [3, 6] })
  const start = randInt(...startRange)
  const terms = [0, 1, 2, 3].map(i => (start + i) * (start + i))
  const answer = (start + 4) * (start + 4)
  const { min, max } = randomSliderRange([terms[0], answer], { step: 1, minPad: 5, maxPad: 20 })
  return { start, terms, answer, min, max }
}

export default function G8TamengGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🛡️ Formasi Pasukan Tameng" onBack={goBack} accentColor="#FCA5A5" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
            Berapa jumlah tameng pada formasi ke-{q.start + 4}? (Pola persegi)
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.terms.map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.25)', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                  <div style={{ fontSize: 14 }}>🛡️</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{t}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid #FCA5A5', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                <div style={{ fontSize: 14 }}>❓</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FCA5A5' }}>{val}</div>
              </div>
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
              <Btn onClick={confirm} color="#dc2626">Kunci Formasi</Btn>
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
