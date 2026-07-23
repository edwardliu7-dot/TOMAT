import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const QUESTIONS = [
  { expr: '0,8 + 0,7', answer: 1.5, display: '0,8 + 0,7', tier: 'easy' },
  { expr: '1,25 + 0,75', answer: 2.0, display: '1,25 + 0,75', tier: 'easy' },
  { expr: '0,6 × 5', answer: 3.0, display: '0,6 × 5', tier: 'easy' },
  { expr: '2,4 + 1,7', answer: 4.1, display: '2,4 + 1,7', tier: 'medium' },
  { expr: '5,6 − 2,3', answer: 3.3, display: '5,6 − 2,3', tier: 'medium' },
  { expr: '4,8 − 1,3', answer: 3.5, display: '4,8 − 1,3', tier: 'medium' },
  { expr: '3,2 × 2', answer: 6.4, display: '3,2 × 2', tier: 'medium' },
  { expr: '7,5 ÷ 3', answer: 2.5, display: '7,5 ÷ 3', tier: 'hard' },
  { expr: '9,0 ÷ 4', answer: 2.25, display: '9,0 ÷ 4', tier: 'hard' },
  { expr: '2,5 + 3,75', answer: 6.25, display: '2,5 + 3,75', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function TimbanganEmasGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selectedVal, setSelectedVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelectedVal(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = Math.abs(selectedVal - q.answer) < 0.01
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const tilt = Math.max(-15, Math.min(15, (selectedVal - q.answer) * 8))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚖️ Timbangan Emas Digital" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(234,179,8,0.3)">
          {/* Scale visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, position: 'relative', height: 100 }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 6, height: 60, background: 'rgba(234,179,8,0.6)', borderRadius: 3, transformOrigin: 'top center' }} />
            <div style={{ position: 'absolute', top: 52, left: '15%', right: '15%', height: 4, background: '#EAB308', borderRadius: 2, transformOrigin: 'center center', transform: `rotate(${tilt}deg)`, transition: 'transform 0.3s' }}>
              <div style={{ position: 'absolute', left: -10, top: 4, width: 80, textAlign: 'center', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: 8, padding: '6px 4px' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#EAB308', fontFamily: 'monospace' }}>{q.display}</div>
              </div>
              <div style={{ position: 'absolute', right: -10, top: 4, width: 80, textAlign: 'center', background: 'rgba(103,232,249,0.12)', border: '1px solid rgba(103,232,249,0.4)', borderRadius: 8, padding: '6px 4px' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{selectedVal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 16 }}>
            Sesuaikan timbangan agar seimbang:
          </div>

          <SliderInput
            value={selectedVal}
            min={0}
            max={10}
            step={0.05}
            onChange={setSelectedVal}
            disabled={feedback !== null}
            accentColor="#EAB308"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi: {selectedVal.toFixed(2)} gram
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Timbangan akurat!` : `❌ Tidak presisi! Jawaban: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Pengukuran Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
