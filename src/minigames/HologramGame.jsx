import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Cross-multiplication: x/a = b/c → x × c = a × b → x = (a × b) / c
const SCENARIOS = [
  { a: 4, b: 3, c: 6, answer: 2, display: 'x/4 = 3/6' },
  { a: 6, b: 4, c: 8, answer: 3, display: 'x/6 = 4/8' },
  { a: 5, b: 2, c: 4, answer: 2.5, display: 'x/5 = 2/4' },
  { a: 8, b: 3, c: 4, answer: 6, display: 'x/8 = 3/4' },
  { a: 9, b: 2, c: 6, answer: 3, display: 'x/9 = 2/6' },
  { a: 10, b: 3, c: 5, answer: 6, display: 'x/10 = 3/5' },
  { a: 6, b: 5, c: 10, answer: 3, display: 'x/6 = 5/10' },
  { a: 12, b: 1, c: 4, answer: 3, display: 'x/12 = 1/4' },
]

function genQ() {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
}

// Steps: 
// 1. Cross-multiply: student sees x × c = a × b, confirms a×b product
// 2. Divide: student sees a×b ÷ c = ?, inputs x

export default function BrankasSandiGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [step, setStep] = useState(1) // 1 = cross-multiply, 2 = divide
  const [input, setInput] = useState('')
  const [stepFeedback, setStepFeedback] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setStep(1); setInput(''); setStepFeedback(null); setFeedback(null) }, [])

  const product = q.a * q.b

  const pressKey = (k) => {
    if (stepFeedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 5) return
    // Allow decimal for step 2
    if (k === ',' && (step !== 2 || input.includes(','))) return
    setInput(p => p + k)
  }

  const confirmStep = () => {
    if (stepFeedback !== null || input === '') return
    if (step === 1) {
      const val = parseInt(input, 10)
      const correct = val === product
      setStepFeedback(correct)
    } else {
      const val = parseFloat(input.replace(',', '.'))
      const correct = Math.abs(val - q.answer) < 0.01
      setStepFeedback(correct)
      if (correct) {
        setFeedback(true)
        addCoins(50); addExp(100)
      } else {
        setFeedback(false)
      }
    }
  }

  const nextStep = () => {
    if (!stepFeedback) {
      setInput(''); setStepFeedback(null); return
    }
    if (step === 1) {
      setStep(2); setInput(''); setStepFeedback(null)
    }
  }

  const numpadKeys = step === 2
    ? ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫']
    : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔐 Peretas Brankas Sandi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Vault + equation */}
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SISTEM KEAMANAN ALJABAR</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a1a2e', border: `3px solid ${feedback === true ? '#34D399' : '#67E8F9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {feedback === true ? '🔓' : '🔐'}
            </div>
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.display}</div>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, padding: '8px', borderRadius: 8, background: step === s ? 'rgba(103,232,249,0.1)' : s < step ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${step === s ? 'rgba(103,232,249,0.4)' : s < step ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: step === s ? '#67E8F9' : s < step ? '#34D399' : '#475569', fontWeight: 700 }}>
                  {s < step ? '✅' : step === s ? '🔑' : '🔒'} Langkah {s}
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                  {s === 1 ? 'Perkalian Silang' : 'Bagi → Temukan x'}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Current step */}
        {feedback === null && (
          <Card border="rgba(245,158,11,0.3)">
            {step === 1 ? (
              <>
                <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>LANGKAH 1: PERKALIAN SILANG</div>
                <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 12 }}>
                  Dari <strong style={{ color: '#67E8F9', fontFamily: 'monospace' }}>{q.display}</strong><br />
                  Kalikan silang: <strong style={{ color: '#fff' }}>x × {q.c} = {q.a} × {q.b}</strong><br />
                  Berapa hasil <strong style={{ color: '#f59e0b' }}>{q.a} × {q.b}</strong> = ?
                </div>
                {/* Cross multiply visual */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>x</div>
                    <div style={{ width: 50, height: 2, background: '#67E8F9', margin: '4px 0' }} />
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.a}</div>
                  </div>
                  <div style={{ fontSize: 20, color: '#94A3B8', alignSelf: 'center' }}>=</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>{q.b}</div>
                    <div style={{ width: 50, height: 2, background: '#f59e0b', margin: '4px 0' }} />
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>{q.c}</div>
                  </div>
                </div>
                {/* Arrows */}
                <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
                  ↙ × ↗ silang → x × {q.c} = <strong style={{ color: '#f59e0b' }}>{q.a} × {q.b}</strong>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>LANGKAH 2: TEMUKAN x</div>
                <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 12 }}>
                  Sekarang: <strong style={{ color: '#67E8F9', fontFamily: 'monospace' }}>x × {q.c} = {product}</strong><br />
                  Maka: <strong style={{ color: '#fff' }}>x = {product} ÷ {q.c}</strong> = ?
                </div>
                <div style={{ padding: '10px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, textAlign: 'center', marginBottom: 12, fontSize: 14, color: '#34D399', fontFamily: 'monospace', fontWeight: 700 }}>
                  x = {product} ÷ {q.c} = ?
                </div>
              </>
            )}

            {/* Display */}
            <div style={{ background: '#0a1628', borderRadius: 10, padding: '10px 16px', textAlign: 'right', marginBottom: 12, border: `2px solid ${stepFeedback === null ? 'rgba(103,232,249,0.3)' : stepFeedback ? '#34D399' : '#ef4444'}` }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: stepFeedback === null ? '#fff' : stepFeedback ? '#34D399' : '#ef4444', fontFamily: 'monospace' }}>{input || '?'}</div>
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {numpadKeys.map((k, idx) => (
                k === '' ? <div key={idx} /> :
                <button key={`${k}-${idx}`} onClick={() => pressKey(k)} disabled={stepFeedback !== null}
                  style={{ padding: '13px 8px', borderRadius: 10, border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(103,232,249,0.2)'}`, background: k === '⌫' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)', color: k === '⌫' ? '#ef4444' : '#fff', fontSize: 18, fontWeight: 700, cursor: stepFeedback !== null ? 'not-allowed' : 'pointer' }}>
                  {k}
                </button>
              ))}
            </div>

            {stepFeedback === null ? (
              <Btn onClick={confirmStep} color={input !== '' ? '#0e7490' : '#334155'}>
                {input !== '' ? '✅ Konfirmasi' : 'Ketik jawaban...'}
              </Btn>
            ) : stepFeedback ? (
              step === 1 ? (
                <Btn onClick={nextStep} color="#0e7490">Lanjut Langkah 2: Bagi ▶</Btn>
              ) : null
            ) : (
              <>
                <div style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, textAlign: 'center', marginBottom: 8, fontSize: 13, color: '#ef4444' }}>
                  ❌ Salah! {step === 1 ? `${q.a} × ${q.b} = ${product}` : `${product} ÷ ${q.c} = ${q.answer}`}
                </div>
                <Btn onClick={nextStep} color="#7c3aed">Coba Lagi ↩</Btn>
              </>
            )}
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Brankas terbuka! x = ${q.answer}` : `❌ Kode salah! Nilai x yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Brankas Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
