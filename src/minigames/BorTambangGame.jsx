import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// All answers use string fractions like '-3/4'
const QUESTIONS = [
  { scenario: 'Bor di −1/2 m, turun 1/4 m lagi', expr: '−1/2 − 1/4', answer: '−3/4', wrong: ['−1/4', '3/4', '−1/2'] },
  { scenario: 'Bor di −3/4 m, naik 1/4 m', expr: '−3/4 + 1/4', answer: '−1/2', wrong: ['−1', '1/2', '−1/4'] },
  { scenario: 'Bor di −2/3 m, turun 1/3 m lagi', expr: '−2/3 − 1/3', answer: '−1', wrong: ['−1/3', '1/3', '−2/3'] },
  { scenario: 'Bor di −1/4 m, turun 1/2 m lagi', expr: '−1/4 − 1/2', answer: '−3/4', wrong: ['−1/4', '3/4', '−1'] },
  { scenario: 'Bor di −5/8 m, naik 3/8 m', expr: '−5/8 + 3/8', answer: '−1/4', wrong: ['−3/8', '1/4', '−1/2'] },
  { scenario: 'Bor di −1/3 m, turun 2/3 m lagi', expr: '−1/3 − 2/3', answer: '−1', wrong: ['−2/3', '1/3', '−1/3'] },
  { scenario: 'Bor di −3/5 m, naik 1/5 m', expr: '−3/5 + 1/5', answer: '−2/5', wrong: ['−4/5', '2/5', '−1/5'] },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts = shuffle([...base.wrong, base.answer])
  return { ...base, opts }
}

export default function BorTambangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  // Visual: drill shaft going down
  const depthLevels = ['0', '−1/4', '−1/2', '−3/4', '−1']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⛏️ Bor Tambang Bumi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM BOR MINERAL BAWAH TANAH</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Depth shaft visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              {depthLevels.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', width: 28, textAlign: 'right' }}>{d}m</div>
                  <div style={{ width: 16, height: i < depthLevels.length - 1 ? 32 : 16, background: i === 0 ? 'rgba(103,232,249,0.2)' : 'rgba(139,92,46,0.4)', borderLeft: '2px dashed rgba(103,232,249,0.2)', borderRight: '2px dashed rgba(103,232,249,0.2)' }} />
                </div>
              ))}
              <div style={{ fontSize: 16, marginTop: 4 }}>⛏️</div>
            </div>
            {/* Scenario text */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8, marginBottom: 10 }}>
                {q.scenario}
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Hitung kedalaman akhir:</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>
                  {q.expr} = ?
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                💡 Negatif = di bawah permukaan tanah
              </div>
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih kedalaman akhir bor:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />
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
