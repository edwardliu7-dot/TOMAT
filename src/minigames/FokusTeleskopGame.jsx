import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const QUESTIONS = [
  { number: '380.000.000', answer: '3,8 × 10⁸', coef: '3,8', exp: 8, hint: 'Geser koma 8 tempat ke kiri' },
  { number: '45.000', answer: '4,5 × 10⁴', coef: '4,5', exp: 4, hint: 'Geser koma 4 tempat ke kiri' },
  { number: '7.200.000', answer: '7,2 × 10⁶', coef: '7,2', exp: 6, hint: 'Geser koma 6 tempat ke kiri' },
  { number: '0,0056', answer: '5,6 × 10⁻³', coef: '5,6', exp: -3, hint: 'Geser koma 3 tempat ke kanan' },
  { number: '0,00091', answer: '9,1 × 10⁻⁴', coef: '9,1', exp: -4, hint: 'Geser koma 4 tempat ke kanan' },
  { number: '150.000.000', answer: '1,5 × 10⁸', coef: '1,5', exp: 8, hint: 'Geser koma 8 tempat ke kiri' },
  { number: '3.000', answer: '3 × 10³', coef: '3', exp: 3, hint: 'Geser koma 3 tempat ke kiri' },
  { number: '0,008', answer: '8 × 10⁻³', coef: '8', exp: -3, hint: 'Geser koma 3 tempat ke kanan' },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

const COEF_OPTIONS = ['1', '1,5', '2', '2,5', '3', '3,5', '4', '4,5', '5', '5,6', '6', '6,5', '7', '7,2', '7,5', '8', '8,5', '9', '9,1', '9,5']
const EXP_OPTIONS = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function formatExp(e) {
  const sups = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(e).split('').map(c => sups[c] || c).join('')
}

export default function FokusTeleskopGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selCoef, setSelCoef] = useState(null)
  const [selExp, setSelExp] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelCoef(null); setSelExp(null); setFeedback(null) }, [])

  const builtAnswer = selCoef !== null && selExp !== null
    ? `${selCoef} × 10${formatExp(selExp)}`
    : null

  const confirm = () => {
    if (feedback !== null || builtAnswer === null) return
    const correct = builtAnswer === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔭 Fokus Teleskop Bintang" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>OBSERVATORIUM BINTANG TOMAT</div>
          <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 10 }}>🔭</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Ubah angka di layar ke <strong style={{ color: '#fff' }}>bentuk baku</strong> (a × 10ⁿ, dengan 1 ≤ a &lt; 10)
          </div>
          <div style={{ padding: '14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Angka di layar:</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{q.number}</div>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>💡 {q.hint}</div>
        </Card>

        {/* Builder */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Rakit Bentuk Baku:</div>

          {/* Live preview */}
          <div style={{ padding: '12px', background: '#0a1628', borderRadius: 10, textAlign: 'center', marginBottom: 16, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.3)' : feedback ? '#34D399' : '#ef4444'}` }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: feedback === null ? '#67E8F9' : feedback ? '#34D399' : '#ef4444', fontFamily: 'monospace' }}>
              <span style={{ color: selCoef ? '#fff' : '#475569', border: selCoef ? 'none' : '1px dashed #475569', padding: selCoef ? '0' : '2px 8px', borderRadius: 6 }}>{selCoef || 'a'}</span>
              {' × 10'}
              <span style={{ color: selExp !== null ? '#f59e0b' : '#475569', border: selExp !== null ? 'none' : '1px dashed #475569', padding: selExp !== null ? '0' : '2px 4px', borderRadius: 6 }}>
                {selExp !== null ? formatExp(selExp) : 'ⁿ'}
              </span>
            </div>
          </div>

          {/* Coefficient selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>① Pilih koefisien <strong style={{ color: '#fff' }}>a</strong> (1 ≤ a &lt; 10):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {COEF_OPTIONS.map(c => {
                const isSel = selCoef === c
                const isCorrect = feedback !== null && c === q.coef
                const isWrong = feedback !== null && c === selCoef && selCoef !== q.coef
                return (
                  <button key={c} onClick={() => { if (feedback === null) setSelCoef(c) }} disabled={feedback !== null}
                    style={{ padding: '6px 10px', borderRadius: 8, border: isCorrect ? '2px solid #34D399' : isWrong ? '2px solid #ef4444' : isSel ? '2px solid #67E8F9' : '1px solid rgba(103,232,249,0.2)', background: isCorrect ? 'rgba(52,211,153,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : isSel ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.04)', color: isCorrect ? '#34D399' : isWrong ? '#ef4444' : isSel ? '#67E8F9' : '#94A3B8', fontSize: 13, fontWeight: isSel ? 700 : 400, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Exponent selector */}
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>② Pilih pangkat <strong style={{ color: '#fff' }}>n</strong> dari 10:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXP_OPTIONS.map(e => {
                const isSel = selExp === e
                const isCorrect = feedback !== null && e === q.exp
                const isWrong = feedback !== null && e === selExp && selExp !== q.exp
                return (
                  <button key={e} onClick={() => { if (feedback === null) setSelExp(e) }} disabled={feedback !== null}
                    style={{ padding: '6px 12px', borderRadius: 8, border: isCorrect ? '2px solid #34D399' : isWrong ? '2px solid #ef4444' : isSel ? '2px solid #f59e0b' : '1px solid rgba(245,158,11,0.2)', background: isCorrect ? 'rgba(52,211,153,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : isSel ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: isCorrect ? '#34D399' : isWrong ? '#ef4444' : isSel ? '#f59e0b' : '#94A3B8', fontSize: 13, fontWeight: isSel ? 700 : 400, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                    10{formatExp(e)}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={builtAnswer !== null ? '#0e7490' : '#334155'}>
            {builtAnswer !== null ? `✅ Fokuskan: ${builtAnswer}` : 'Pilih koefisien dan pangkat...'}
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
