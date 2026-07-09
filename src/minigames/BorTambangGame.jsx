import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// All answers use string fractions like '-3/4'
const QUESTIONS = [
  { scenario: 'Bor di −1/2 m, turun 1/4 m lagi', expr: '−1/2 − 1/4', answer: '−3/4', num: -3, den: 4 },
  { scenario: 'Bor di −3/4 m, naik 1/4 m', expr: '−3/4 + 1/4', answer: '−1/2', num: -2, den: 4 },
  { scenario: 'Bor di −2/3 m, turun 1/3 m lagi', expr: '−2/3 − 1/3', answer: '−1', num: -3, den: 3 },
  { scenario: 'Bor di −1/4 m, turun 1/2 m lagi', expr: '−1/4 − 1/2', answer: '−3/4', num: -3, den: 4 },
  { scenario: 'Bor di −5/8 m, naik 3/8 m', expr: '−5/8 + 3/8', answer: '−1/4', num: -2, den: 8 },
  { scenario: 'Bor di −1/3 m, turun 2/3 m lagi', expr: '−1/3 − 2/3', answer: '−1', num: -3, den: 3 },
  { scenario: 'Bor di −3/5 m, naik 1/5 m', expr: '−3/5 + 1/5', answer: '−2/5', num: -2, den: 5 },
]

// Depth marks on the shaft
const DEPTH_MARKS = [
  { label: '0', value: 0 },
  { label: '−1/8', value: -1/8 },
  { label: '−1/5', value: -1/5 },
  { label: '−1/4', value: -1/4 },
  { label: '−1/3', value: -1/3 },
  { label: '−3/8', value: -3/8 },
  { label: '−2/5', value: -2/5 },
  { label: '−1/2', value: -1/2 },
  { label: '−5/8', value: -5/8 },
  { label: '−2/3', value: -2/3 },
  { label: '−3/4', value: -3/4 },
  { label: '−1', value: -1 },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

// Map value 0..-1 to percent 0..100 (top to bottom)
function toPercent(v) { return Math.max(0, Math.min(100, -v * 100)) }

export default function BorTambangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null) // selected depth mark label
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  const tap = (mark) => {
    if (feedback !== null) return
    setSelected(mark.label)
  }

  const confirm = () => {
    if (feedback !== null || selected === null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const selectedMark = DEPTH_MARKS.find(m => m.label === selected)
  const drillPercent = selectedMark ? toPercent(selectedMark.value) : 0
  const answerPercent = toPercent(DEPTH_MARKS.find(m => m.label === q.answer)?.value ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⛏️ Bor Tambang Bumi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM BOR MINERAL BAWAH TANAH</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            {q.scenario}<br />
            <strong style={{ color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</strong>
          </div>

          {/* Vertical depth shaft + tap marks */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
            {/* Shaft visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Permukaan (0m)</div>
              <div style={{ position: 'relative', width: 40, height: 220, background: 'rgba(139,92,46,0.2)', border: '2px solid rgba(139,92,46,0.4)', borderRadius: 4 }}>
                {/* Drill icon at selected depth */}
                {selected !== null && (
                  <div style={{ position: 'absolute', left: '50%', top: `${drillPercent}%`, transform: 'translate(-50%, -50%)', fontSize: 18, transition: 'top 0.3s', zIndex: 2 }}>⛏️</div>
                )}
                {/* Answer marker (after feedback) */}
                {feedback !== null && (
                  <div style={{ position: 'absolute', left: -24, top: `${answerPercent}%`, transform: 'translateY(-50%)', fontSize: 11, color: '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>← {q.answer}m</div>
                )}
                {/* Depth lines */}
                {DEPTH_MARKS.map((m, i) => (
                  <div key={m.label} style={{ position: 'absolute', top: `${toPercent(m.value)}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Dalam (−1m)</div>
            </div>

            {/* Depth buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 20 }}>
              {DEPTH_MARKS.map(m => {
                const isSel = selected === m.label
                const isAnswer = feedback !== null && m.label === q.answer
                const isWrong = feedback !== null && m.label === selected && selected !== q.answer
                let bg = 'rgba(255,255,255,0.04)'
                let border = '1px solid rgba(255,255,255,0.1)'
                let color = '#94A3B8'
                if (isSel && feedback === null) { bg = 'rgba(245,158,11,0.15)'; border = '2px solid #f59e0b'; color = '#f59e0b' }
                if (isAnswer) { bg = 'rgba(52,211,153,0.15)'; border = '2px solid #34D399'; color = '#34D399' }
                if (isWrong) { bg = 'rgba(239,68,68,0.15)'; border = '2px solid #ef4444'; color = '#ef4444' }
                return (
                  <button key={m.label} onClick={() => tap(m)} disabled={feedback !== null}
                    style={{ padding: '8px 16px', borderRadius: 8, border, background: bg, color, fontSize: 13, fontWeight: 700, cursor: feedback !== null ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'monospace' }}>
                    {m.label} m {isAnswer ? '✅' : isWrong ? '❌' : isSel ? '◀' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={selected !== null ? '#0e7490' : '#334155'}>
            {selected !== null ? `✅ Bor ke kedalaman ${selected} m` : 'Ketuk kedalaman tujuan...'}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Mineral ditemukan! Kedalaman: ${q.answer} m` : `❌ Salah jalur! Kedalaman benar: ${q.answer} m`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pengeboran Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
