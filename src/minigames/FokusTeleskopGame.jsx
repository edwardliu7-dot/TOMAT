import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const QUESTIONS = [
  { number: '45.000', answer: '4,5 × 10⁴', coef: 4.5, exp: 4, hint: 'Geser koma 4 tempat ke kiri', tier: 'easy' },
  { number: '3.000', answer: '3 × 10³', coef: 3.0, exp: 3, hint: 'Geser koma 3 tempat ke kiri', tier: 'easy' },
  { number: '380.000.000', answer: '3,8 × 10⁸', coef: 3.8, exp: 8, hint: 'Geser koma 8 tempat ke kiri', tier: 'medium' },
  { number: '7.200.000', answer: '7,2 × 10⁶', coef: 7.2, exp: 6, hint: 'Geser koma 6 tempat ke kiri', tier: 'medium' },
  { number: '150.000.000', answer: '1,5 × 10⁸', coef: 1.5, exp: 8, hint: 'Geser koma 8 tempat ke kiri', tier: 'medium' },
  { number: '0,0056', answer: '5,6 × 10⁻³', coef: 5.6, exp: -3, hint: 'Geser koma 3 tempat ke kanan', tier: 'hard' },
  { number: '0,00091', answer: '9,1 × 10⁻⁴', coef: 9.1, exp: -4, hint: 'Geser koma 4 tempat ke kanan', tier: 'hard' },
  { number: '0,008', answer: '8 × 10⁻³', coef: 8.0, exp: -3, hint: 'Geser koma 3 tempat ke kanan', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

function formatExp(e) {
  const sups = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(e).split('').map(c => sups[c] || c).join('')
}

export default function FokusTeleskopGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selCoef, setSelCoef] = useState(1.0)
  const [selExp, setSelExp] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelCoef(1.0); setSelExp(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = Math.abs(selCoef - q.coef) < 0.1 && selExp === q.exp
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
      <TopBar title="🔭 Fokus Teleskop Bintang" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Ubah <strong style={{ color: '#fff' }}>{q.number}</strong> ke bentuk baku (a × 10ⁿ)
          </div>

          <div style={{ padding: '12px', background: '#0a1628', borderRadius: 10, textAlign: 'center', marginBottom: 16, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.3)' : feedback ? '#34D399' : '#ef4444'}` }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
              {selCoef.toFixed(1)} × 10{formatExp(selExp)}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>Geser Koefisien (a):</div>
            <SliderInput
              value={selCoef}
              min={1}
              max={9.9}
              step={0.1}
              onChange={setSelCoef}
              disabled={feedback !== null}
              accentColor="#67E8F9"
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>Geser Pangkat (n):</div>
            <SliderInput
              value={selExp}
              min={-9}
              max={9}
              onChange={setSelExp}
              disabled={feedback !== null}
              accentColor="#f59e0b"
              markEvery={1}
            />
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Fokuskan Teleskop
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Teleskop terfokus! ${q.number} = ${q.answer}` : `❌ Fokus meleset! Jawaban: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Bintang Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
