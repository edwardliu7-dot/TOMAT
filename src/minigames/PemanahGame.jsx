import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// KABATAKU: each question broken into steps
// Each step: { highlight: what to compute, result: numeric }
const QUESTIONS = [
  {
    expr: '3 + 4 × 2',
    answer: 11,
    steps: [
      { action: 'Hitung 4 × 2', result: 8, after: '3 + 8' },
      { action: 'Hitung 3 + 8', result: 11, after: '11' },
    ],
    hint: 'Kali dulu, baru tambah',
  },
  {
    expr: '(5 + 3) × 2',
    answer: 16,
    steps: [
      { action: 'Hitung (5 + 3)', result: 8, after: '8 × 2' },
      { action: 'Hitung 8 × 2', result: 16, after: '16' },
    ],
    hint: 'Kurung dulu, baru kali',
  },
  {
    expr: '20 ÷ 4 + 3',
    answer: 8,
    steps: [
      { action: 'Hitung 20 ÷ 4', result: 5, after: '5 + 3' },
      { action: 'Hitung 5 + 3', result: 8, after: '8' },
    ],
    hint: 'Bagi dulu, baru tambah',
  },
  {
    expr: '15 − 2 × 4',
    answer: 7,
    steps: [
      { action: 'Hitung 2 × 4', result: 8, after: '15 − 8' },
      { action: 'Hitung 15 − 8', result: 7, after: '7' },
    ],
    hint: 'Kali dulu, baru kurang',
  },
  {
    expr: '(8 − 3) × 4',
    answer: 20,
    steps: [
      { action: 'Hitung (8 − 3)', result: 5, after: '5 × 4' },
      { action: 'Hitung 5 × 4', result: 20, after: '20' },
    ],
    hint: 'Kurung dulu, baru kali',
  },
  {
    expr: '24 ÷ (3 + 5)',
    answer: 3,
    steps: [
      { action: 'Hitung (3 + 5)', result: 8, after: '24 ÷ 8' },
      { action: 'Hitung 24 ÷ 8', result: 3, after: '3' },
    ],
    hint: 'Kurung dulu, baru bagi',
  },
  {
    expr: '6 + 4 × 3 − 2',
    answer: 16,
    steps: [
      { action: 'Hitung 4 × 3', result: 12, after: '6 + 12 − 2' },
      { action: 'Hitung 6 + 12 − 2', result: 16, after: '16' },
    ],
    hint: 'Kali dulu, baru tambah & kurang',
  },
  {
    expr: '(7 + 3) ÷ 2 + 5',
    answer: 10,
    steps: [
      { action: 'Hitung (7 + 3)', result: 10, after: '10 ÷ 2 + 5' },
      { action: 'Hitung 10 ÷ 2', result: 5, after: '5 + 5' },
      { action: 'Hitung 5 + 5', result: 10, after: '10' },
    ],
    hint: 'Kurung, lalu bagi, lalu tambah',
  },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

export default function KeretaTambangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [stepIdx, setStepIdx] = useState(0)
  const [input, setInput] = useState('')
  const [stepFeedback, setStepFeedback] = useState(null) // null | true | false
  const [feedback, setFeedback] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const newQ = useCallback(() => { setQ(genQ()); setStepIdx(0); setInput(''); setStepFeedback(null); setFeedback(null); setCompletedSteps([]) }, [])

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
    }
  }

  const nextStep = () => {
    if (!stepFeedback) {
      // retry
      setInput('')
      setStepFeedback(null)
      return
    }
    if (isLastStep) {
      setFeedback(true)
      addCoins(50); addExp(100)
    } else {
      setStepIdx(s => s + 1)
      setInput('')
      setStepFeedback(null)
    }
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚂 Rute Kereta Tambang" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* KABATAKU rule */}
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SISTEM TUAS REL (KABATAKU)</div>
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
            <Btn onClick={newQ} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
