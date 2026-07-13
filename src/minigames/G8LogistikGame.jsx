import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { cRange, vRange, tRange, sliderMax } = byDifficulty(difficulty, {
    easy: { cRange: [0, 2], vRange: [2, 4], tRange: [2, 4], sliderMax: 30 },
    medium: { cRange: [0, 4], vRange: [2, 6], tRange: [2, 7], sliderMax: 50 },
    hard: { cRange: [2, 6], vRange: [4, 9], tRange: [5, 10], sliderMax: 100 },
  })
  const c = randInt(...cRange)
  const v = randInt(...vRange)
  const t = randInt(...tRange)
  const answer = c + v * t
  return { c, v, t, answer, sliderMax }
}

export default function G8LogistikGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(0); setFeedback(null) }, [effectiveDifficulty])

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #050a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚚 Jalur Suplai Logistik" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.7 }}>
            Awal: {q.c} km, Kecepatan: {q.v} km/jam. Dimana posisinya setelah {q.t} jam?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={0} 
              max={q.sliderMax} 
              onChange={setVal} 
              accentColor="#93C5FD"
              unit=" km"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#1d4ed8">Prediksi Posisi</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Posisi = ${q.answer} km` : `❌ Kurang tepat. Posisi yang benar = ${q.answer} km`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
