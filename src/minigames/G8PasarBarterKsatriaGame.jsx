import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { psRange, sliderMin, sliderMax } = byDifficulty(difficulty, {
    easy: { psRange: [5, 15], sliderMin: 2, sliderMax: 25 },
    medium: { psRange: [10, 30], sliderMin: 5, sliderMax: 40 },
    hard: { psRange: [20, 50], sliderMin: 10, sliderMax: 70 },
  })
  const p = randInt(...psRange)
  const s = randInt(...psRange)
  const total1 = 2 * p + s
  const total2 = p + 2 * s
  return { total1, total2, answer: p, sliderMin, sliderMax }
}

export default function G8PasarBarterKsatriaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(15)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { const nq = genQ(effectiveDifficulty); setQ(nq); setVal(nq.sliderMin); setFeedback(null) }, [effectiveDifficulty])

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1d00 0%, #1a1200 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛒 Pasar Barter Ksatria" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            2⚔️ + 1🛡️ = {q.total1}🪙<br />
            1⚔️ + 2🛡️ = {q.total2}🪙<br />
            Berapa harga 1⚔️?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.sliderMin} 
              max={q.sliderMax} 
              onChange={setVal} 
              accentColor="#FDE68A"
              unit="🪙"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#b45309">Tawar!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Harga pedang = ${q.answer} koin` : `❌ Kurang tepat. Harga pedang yang benar = ${q.answer} koin`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
