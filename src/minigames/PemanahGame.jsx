import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

// KABATAKU: each question broken into steps
// Each step: { highlight: what to compute, result: numeric }
const QUESTIONS = [
  {
    expr: '3 + 4 × 2',
    answer: 11,
    tier: 'easy',
    steps: [
      { action: 'Hitung 4 × 2', result: 8, after: '3 + 8' },
      { action: 'Hitung 3 + 8', result: 11, after: '11' },
    ],
    hint: 'Kali dulu, baru tambah',
  },
  {
    expr: '20 ÷ 4 + 3',
    answer: 8,
    tier: 'easy',
    steps: [
      { action: 'Hitung 20 ÷ 4', result: 5, after: '5 + 3' },
      { action: 'Hitung 5 + 3', result: 8, after: '8' },
    ],
    hint: 'Bagi dulu, baru tambah',
  },
  {
    expr: '(5 + 3) × 2',
    answer: 16,
    tier: 'medium',
    steps: [
      { action: 'Hitung (5 + 3)', result: 8, after: '8 × 2' },
      { action: 'Hitung 8 × 2', result: 16, after: '16' },
    ],
    hint: 'Kurung dulu, baru kali',
  },
  {
    expr: '15 − 2 × 4',
    answer: 7,
    tier: 'medium',
    steps: [
      { action: 'Hitung 2 × 4', result: 8, after: '15 − 8' },
      { action: 'Hitung 15 − 8', result: 7, after: '7' },
    ],
    hint: 'Kali dulu, baru kurang',
  },
  {
    expr: '(8 − 3) × 4',
    answer: 20,
    tier: 'medium',
    steps: [
      { action: 'Hitung (8 − 3)', result: 5, after: '5 × 4' },
      { action: 'Hitung 5 × 4', result: 20, after: '20' },
    ],
    hint: 'Kurung dulu, baru kali',
  },
  {
    expr: '24 ÷ (3 + 5)',
    answer: 3,
    tier: 'medium',
    steps: [
      { action: 'Hitung (3 + 5)', result: 8, after: '24 ÷ 8' },
      { action: 'Hitung 24 ÷ 8', result: 3, after: '3' },
    ],
    hint: 'Kurung dulu, baru bagi',
  },
  {
    expr: '6 + 4 × 3 − 2',
    answer: 16,
    tier: 'hard',
    steps: [
      { action: 'Hitung 4 × 3', result: 12, after: '6 + 12 − 2' },
      { action: 'Hitung 6 + 12 − 2', result: 16, after: '16' },
    ],
    hint: 'Kali dulu, baru tambah & kurang',
  },
  {
    expr: '(7 + 3) ÷ 2 + 5',
    answer: 10,
    tier: 'hard',
    steps: [
      { action: 'Hitung (7 + 3)', result: 10, after: '10 ÷ 2 + 5' },
      { action: 'Hitung 10 ÷ 2', result: 5, after: '5 + 5' },
      { action: 'Hitung 5 + 5', result: 10, after: '10' },
    ],
    hint: 'Kurung, lalu bagi, lalu tambah',
  },
  {
    expr: '18 ÷ (2 + 4) × 3',
    answer: 9,
    tier: 'hard',
    steps: [
      { action: 'Hitung (2 + 4)', result: 6, after: '18 ÷ 6 × 3' },
      { action: 'Hitung 18 ÷ 6', result: 3, after: '3 × 3' },
      { action: 'Hitung 3 × 3', result: 9, after: '9' },
    ],
    hint: 'Kurung, lalu bagi, lalu kali',
  },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function KeretaTambangGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [stepIdx, setStepIdx] = useState(0)
  const [input, setInput] = useState('')
  const [stepFeedback, setStepFeedback] = useState(null) // null | true | false
  const [feedback, setFeedback] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setStepIdx(0); setInput(''); setStepFeedback(null); setFeedback(null); setCompletedSteps([]) }, [effectiveDifficulty])

  const currentStep = q.steps[stepIdx]
  const isLastStep = stepIdx === q.steps.length - 1

  const pressKey = (k) => {
    if (stepFeedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 5) return
    setInput(p => p + k)
  }

  const confirmStep = () => {
    if (stepFeedback !== null || input === '') return
    const correct = parseInt(input, 10) === currentStep.result
    setStepFeedback(correct)
    if (correct) {
      setCompletedSteps(prev => [...prev, { ...currentStep, inputOk: true }])
    } else if (survival) {
      // Survival ends immediately on a wrong answer -- no retry.
      survivalState.recordResult(false)
    }
  }

  const nextStep = () => {
    if (!stepFeedback) {
      // retry (only reachable outside survival mode)
      setInput('')
      setStepFeedback(null)
      return
    }
    if (isLastStep) {
      setFeedback(true)
      survivalState.recordResult(true)
      addCoins(50); addExp(100)
    } else {
      setStepIdx(s => s + 1)
      setInput('')
      setStepFeedback(null)
    }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚂 Rute Kereta Tambang" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* KABATAKU rule */}
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SISTEM TUAS REL (KABATAKU)</div>
          <svg width="220" height="70" viewBox="0 0 220 70" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {/* Rails */}
            <line x1="10" y1="56" x2="210" y2="56" stroke="rgba(103,232,249,0.5)" strokeWidth="2.5" />
            <line x1="10" y1="62" x2="210" y2="62" stroke="rgba(103,232,249,0.5)" strokeWidth="2.5" />
            {/* Sleepers */}
            {[14,34,54,74,94,114,134,154,174,194].map((x,i)=>(
              <rect key={i} x={x} y="53" width="12" height="12" rx="1" fill="#0a1428" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
            ))}
            {/* Train */}
            <rect x="68" y="32" width="84" height="24" rx="5" fill="#001428" stroke="#67E8F9" strokeWidth="2" />
            <rect x="74" y="36" width="20" height="14" rx="2" fill="#0a2035" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            <rect x="98" y="36" width="20" height="14" rx="2" fill="#0a2035" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            <rect x="122" y="36" width="24" height="14" rx="2" fill="#0a2035" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            {/* Train wheels */}
            <circle cx="82" cy="58" r="7" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            <circle cx="138" cy="58" r="7" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            {/* Smoke */}
            <circle cx="72" cy="24" r="5" fill="rgba(103,232,249,0.15)" />
            <circle cx="80" cy="18" r="7" fill="rgba(103,232,249,0.10)" />
            <circle cx="90" cy="13" r="5" fill="rgba(103,232,249,0.06)" />
            {/* KABATAKU order labels */}
            <rect x="10" y="4" width="36" height="14" rx="3" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
            <text x="28" y="14" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="700">( )</text>
            <rect x="52" y="4" width="44" height="14" rx="3" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
            <text x="74" y="14" textAnchor="middle" fill="#6366F1" fontSize="8" fontWeight="700">× ÷</text>
            <rect x="102" y="4" width="44" height="14" rx="3" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.4)" strokeWidth="1" />
            <text x="124" y="14" textAnchor="middle" fill="#34D399" fontSize="8" fontWeight="700">+ −</text>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {[{ label: 'Kurung', color: '#f59e0b' }, { label: 'Kali/Bagi', color: '#6366F1' }, { label: 'Tambah/Kurang', color: '#34D399' }].map(r => (
              <div key={r.label} style={{ background: `${r.color}22`, border: `1px solid ${r.color}55`, borderRadius: 8, padding: '4px 10px', fontSize: 12, color: r.color, fontWeight: 700 }}>{r.label}</div>
            ))}
          </div>
          <div style={{ padding: '12px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>💡 {q.hint}</div>
        </Card>

        {/* Completed steps */}
        {completedSteps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {completedSteps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 18 }}>✅</div>
                <div>
                  <div style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>Langkah {i + 1}: {s.action}</div>
                  <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>= {s.result} → ekspresi: <strong>{s.after}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current step */}
        {feedback === null && (
          <Card border="rgba(245,158,11,0.3)">
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LANGKAH {stepIdx + 1} dari {q.steps.length}</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 12 }}>{currentStep.action} = ?</div>

            {/* Display */}
            <div style={{ background: '#0a1628', borderRadius: 10, padding: '10px 16px', textAlign: 'right', marginBottom: 12, border: `2px solid ${stepFeedback === null ? 'rgba(103,232,249,0.3)' : stepFeedback ? '#34D399' : '#ef4444'}` }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: stepFeedback === null ? '#fff' : stepFeedback ? '#34D399' : '#ef4444', fontFamily: 'monospace' }}>{input || '?'}</div>
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {numpadKeys.map((k, idx) => (
                k === '' ? <div key={`empty-${idx}`} /> :
                <button key={`key-${idx}`} onClick={() => pressKey(k)} disabled={stepFeedback !== null}
                  style={{ padding: '13px 8px', borderRadius: 10, border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(103,232,249,0.2)'}`, background: k === '⌫' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)', color: k === '⌫' ? '#ef4444' : '#fff', fontSize: 18, fontWeight: 700, cursor: stepFeedback !== null ? 'not-allowed' : 'pointer' }}>
                  {k}
                </button>
              ))}
            </div>

            {stepFeedback === null ? (
              <div style={{ marginTop: 12 }}>
                <Btn onClick={confirmStep} color={input !== '' ? '#0e7490' : '#334155'}>
                  {input !== '' ? '✅ Konfirmasi' : 'Ketik hasil...'}
                </Btn>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                {stepFeedback ? (
                  <Btn onClick={nextStep} color="#0e7490">{isLastStep ? '🎉 Selesai!' : `Lanjut Langkah ${stepIdx + 2} ▶`}</Btn>
                ) : (
                  <>
                    <div style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, textAlign: 'center', marginBottom: 8, fontSize: 13, color: '#ef4444' }}>
                      ❌ Salah! {currentStep.action} = <strong>{currentStep.result}</strong>
                    </div>
                    <Btn onClick={nextStep} color="#7c3aed">Coba Lagi ↩</Btn>
                  </>
                )}
              </div>
            )}
          </Card>
        )}

        {feedback === true && (
          <>
            <FeedbackBanner
              message={`✅ Kereta aman! ${q.expr} = ${q.answer}`}
              isCorrect={true} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
