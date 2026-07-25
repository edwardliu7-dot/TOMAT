import React, { useState, useCallback, useEffect } from 'react'
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
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Animation state
  // animStep: 0 = idle, 1 = sweeping slider, 2 = robot flash, 3 = done
  const [animStep, setAnimStep] = useState(0)
  const [animDone, setAnimDone] = useState(false)
  const [animSlider, setAnimSlider] = useState(0) // slider value during sweep
  const [robotGlow, setRobotGlow] = useState(false)

  // Step 1: Sweep slider from student answer → correct answer
  useEffect(() => {
    if (animStep !== 1) return
    if (animSlider === q.answer) {
      setAnimStep(2)
      return
    }
    const t = setTimeout(() => {
      setAnimSlider(prev => {
        const next = prev < q.answer ? prev + 1 : prev - 1
        if (prev < q.answer) return Math.min(next, q.answer)
        return Math.max(next, q.answer)
      })
    }, 80)
    return () => clearTimeout(t)
  }, [animStep, animSlider, q.answer])

  // Step 2: Flash robot with glow for ~600ms, then go to step 3
  useEffect(() => {
    if (animStep !== 2) return
    setRobotGlow(true)
    const t = setTimeout(() => {
      setRobotGlow(false)
      setAnimStep(3)
    }, 600)
    return () => clearTimeout(t)
  }, [animStep])

  // Step 3: Reveal feedback
  useEffect(() => {
    if (animStep !== 3) return
    setAnimDone(true)
  }, [animStep])

  const newQ = useCallback(() => {
    setQ(genQ(effectiveDifficulty))
    setSelected(0)
    setSubmitted(false)
    setFeedback(null)
    setAnimStep(0)
    setAnimDone(false)
    setAnimSlider(0)
    setRobotGlow(false)
  }, [effectiveDifficulty])

  const confirm = () => {
    if (submitted) return
    const correct = selected === q.answer
    setSubmitted(true)
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
    setAnimSlider(selected) // start sweep from student's answer
    setAnimStep(1)
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  // Slider display value: before submit = student input, during anim = animSlider
  const sliderDisplay = submitted ? animSlider : selected

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🤖 Pabrik Pasukan Robot" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ position: 'relative' }}>
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
              {/* Robots — with glow effect during animStep 2 */}
              {[42, 110, 178].map((x, i) => (
                <text key={i} x={x} y="62" textAnchor="middle" fontSize="22" style={{
                  filter: robotGlow
                    ? `drop-shadow(0 0 8px ${feedback ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)'})`
                    : `drop-shadow(0 0 ${4 - i}px rgba(103,232,249,${0.6 - i * 0.2}))`,
                  transition: 'filter 0.15s',
                }}>🤖</text>
              ))}
              {/* Result badge above center robot during glow */}
              {robotGlow && (
                <text x="110" y="38" textAnchor="middle" fontSize="20">
                  {feedback ? '✅' : '❌'}
                </text>
              )}
              {/* Number line indicator */}
              <line x1="10" y1="50" x2="210" y2="50" stroke="rgba(103,232,249,0.15)" strokeWidth="1" />
              <text x="18" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">−</text>
              <text x="105" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">0</text>
              <text x="200" y="48" fill="rgba(103,232,249,0.4)" fontSize="8">+</text>
              {[[55,18],[100,12],[160,20]].map(([x,y],i)=>(
                <text key={i} x={x} y={y} fill="rgba(103,232,249,0.5)" fontSize="8">✦</text>
              ))}
            </svg>
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <SliderInput
              value={sliderDisplay}
              min={q.min}
              max={q.max}
              onChange={v => { if (!submitted) setSelected(v) }}
              disabled={submitted}
              accentColor="#67E8F9"
            />
          </div>
        </Card>

        {!submitted && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Hasil: {selected}
          </Btn>
        )}

        {submitted && !animDone && (
          <div style={{
            background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.2)',
            borderRadius: 12, padding: '14px', textAlign: 'center', color: '#67E8F9', fontSize: 13, fontWeight: 700,
          }}>
            🤖 Kalkulasi pabrik…
          </div>
        )}

        {animDone && (
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
