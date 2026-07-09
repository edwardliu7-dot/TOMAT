import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// All answers use string fractions like '-3/4'
const QUESTIONS = [
  { scenario: 'Bor di −1/2 m, turun 1/4 m lagi', expr: '−1/2 − 1/4', answer: '−3/4', val: -0.75 },
  { scenario: 'Bor di −3/4 m, naik 1/4 m', expr: '−3/4 + 1/4', answer: '−1/2', val: -0.5 },
  { scenario: 'Bor di −2/3 m, turun 1/3 m lagi', expr: '−2/3 − 1/3', answer: '−1', val: -1 },
  { scenario: 'Bor di −1/4 m, turun 1/2 m lagi', expr: '−1/4 − 1/2', answer: '−3/4', val: -0.75 },
  { scenario: 'Bor di −5/8 m, naik 3/8 m', expr: '−5/8 + 3/8', answer: '−1/4', val: -0.25 },
  { scenario: 'Bor di −1/3 m, turun 2/3 m lagi', expr: '−1/3 − 2/3', answer: '−1', val: -1 },
  { scenario: 'Bor di −3/5 m, naik 1/5 m', expr: '−3/5 + 1/5', answer: '−2/5', val: -0.4 },
]

const MARKS = [
  { label: '0', val: 0 },
  { label: '-1/4', val: -0.25 },
  { label: '-1/2', val: -0.5 },
  { label: '-3/4', val: -0.75 },
  { label: '-1', val: -1 },
]

export default function BorTambangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
  const [selectedVal, setSelectedVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    setQ(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
    setSelectedVal(0)
    setFeedback(null)
  }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = Math.abs(selectedVal - q.val) < 0.05
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const drillPercent = Math.max(0, Math.min(100, -selectedVal * 100))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⛏️ Bor Tambang Bumi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            {q.scenario}<br />
            <strong style={{ color: '#67E8F9', fontFamily: 'monospace' }}>{q.expr} = ?</strong>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 40, height: 200, background: 'rgba(139,92,46,0.2)', border: '2px solid rgba(139,92,46,0.4)', borderRadius: 4 }}>
              <div style={{ position: 'absolute', left: '50%', top: `${drillPercent}%`, transform: 'translate(-50%, -50%)', fontSize: 24, transition: 'top 0.2s', zIndex: 2 }}>⛏️</div>
              {MARKS.map(m => (
                <div key={m.label} style={{ position: 'absolute', top: `${-m.val * 100}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            
            <div style={{ flex: 1 }}>
              <SliderInput
                value={selectedVal}
                min={-1}
                max={0}
                step={0.05}
                onChange={setSelectedVal}
                disabled={feedback !== null}
                accentColor="#f59e0b"
                leftLabel="-1m"
                rightLabel="0m"
              />
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Kedalaman: {selectedVal.toFixed(2)} m
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
