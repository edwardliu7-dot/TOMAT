import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const QUESTIONS = [
  { expr: '(−3) × 4', answer: -12, min: -20, max: 20, tier: 'easy' },
  { expr: '(−5) × (−3)', answer: 15, min: -20, max: 20, tier: 'easy' },
  { expr: '(−20) ÷ 4', answer: -5, min: -15, max: 5, tier: 'easy' },
  { expr: '(−18) ÷ (−6)', answer: 3, min: -5, max: 10, tier: 'easy' },
  { expr: '6 × (−7)', answer: -42, min: -50, max: 10, tier: 'medium' },
  { expr: '(−8) × (−4)', answer: 32, min: 0, max: 50, tier: 'medium' },
  { expr: '24 ÷ (−8)', answer: -3, min: -10, max: 5, tier: 'medium' },
  { expr: '(−36) ÷ (−9)', answer: 4, min: -5, max: 10, tier: 'medium' },
  { expr: '(−4) × 5 × (−2)', answer: 40, min: -50, max: 50, tier: 'hard' },
  { expr: '(−3) × (−3) × (−1)', answer: -9, min: -20, max: 10, tier: 'hard' },
  { expr: '(−2) × (−3) × 4', answer: 24, min: -10, max: 40, tier: 'hard' },
  { expr: '5 × (−2) × (−3)', answer: 30, min: -10, max: 50, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function PabrikRobotGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelected(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selected === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🤖 Pabrik Pasukan Robot" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            {['🤖', '🤖', '🤖'].map((r, i) => (
              <div key={i} style={{ fontSize: 32, opacity: 0.6 + i * 0.2 }}>{r}</div>
            ))}
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <SliderInput
              value={selected}
              min={q.min}
              max={q.max}
              onChange={setSelected}
              disabled={feedback !== null}
              accentColor="#67E8F9"
            />
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Hasil: {selected}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pabrik berjalan! Hasil: ${q.answer}` : `❌ Error sistem! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Produksi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
