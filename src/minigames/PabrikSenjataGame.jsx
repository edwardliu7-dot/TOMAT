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
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
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
          <svg width="220" height="90" viewBox="0 0 220 90" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {/* Conveyor belt */}
            <rect x="10" y="65" width="200" height="14" rx="5" fill="#0a1428" stroke="rgba(103,232,249,0.3)" strokeWidth="1.5" />
            {[20,44,68,92,116,140,164,188].map((x,i)=>(
              <circle key={i} cx={x} cy="72" r="5" fill="#001014" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
            ))}
            {/* Factory wall */}
            <rect x="0" y="0" width="220" height="62" rx="4" fill="#080e18" stroke="rgba(103,232,249,0.15)" strokeWidth="1" />
            {/* Factory windows */}
            {[18,70,122,172].map((x,i)=>(
              <rect key={i} x={x} y="8" width="28" height="20" rx="3" fill="#001428" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
            ))}
            {/* Robots on conveyor */}
            <text x="42" y="62" textAnchor="middle" fontSize="22" style={{filter:'drop-shadow(0 0 4px rgba(103,232,249,0.6))'}}>🤖</text>
            <text x="110" y="62" textAnchor="middle" fontSize="22" style={{filter:'drop-shadow(0 0 4px rgba(103,232,249,0.4))'}}>🤖</text>
            <text x="178" y="62" textAnchor="middle" fontSize="22" style={{filter:'drop-shadow(0 0 4px rgba(103,232,249,0.2))'}}>🤖</text>
            {/* Number line indicator */}
            <line x1="10" y1="50" x2="210" y2="50" stroke="rgba(103,232,249,0.15)" strokeWidth="1" />
            <text x="18" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">−</text>
            <text x="105" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">0</text>
            <text x="200" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">+</text>
            {/* Sparks */}
            {[[55,18],[100,12],[160,20]].map(([x,y],i)=>(
              <text key={i} x={x} y={y} fill="rgba(103,232,249,0.5)" fontSize="8">✦</text>
            ))}
          </svg>
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
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Produksi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
