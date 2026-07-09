import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Cross-multiplication: x/a = b/c → x = (a × b) / c
const SCENARIOS = [
  { a: 4, b: 3, c: 6, answer: 2, wrong: [3, 4, 8], display: 'x/4 = 3/6' },
  { a: 6, b: 4, c: 8, answer: 3, wrong: [2, 4, 6], display: 'x/6 = 4/8' },
  { a: 5, b: 2, c: 4, answer: 2.5, wrong: [2, 3, 4], display: 'x/5 = 2/4' },
  { a: 8, b: 3, c: 4, answer: 6, wrong: [3, 4, 12], display: 'x/8 = 3/4' },
  { a: 9, b: 2, c: 6, answer: 3, wrong: [2, 4, 6], display: 'x/9 = 2/6' },
  { a: 10, b: 3, c: 5, answer: 6, wrong: [2, 3, 8], display: 'x/10 = 3/5' },
  { a: 6, b: 5, c: 10, answer: 3, wrong: [2, 4, 5], display: 'x/6 = 5/10' },
  { a: 12, b: 1, c: 4, answer: 3, wrong: [2, 4, 6], display: 'x/12 = 1/4' },
]

function genQ() {
  const base = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(String)
  return { ...base, opts }
}

export default function BrankasSandiGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.answer)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔐 Peretas Brankas Sandi" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SISTEM KEAMANAN ALJABAR</div>
          {/* Vault visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#1a1a2e', border: '4px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: 40 }}>🔐</div>
              <div style={{ position: 'absolute', top: -12, right: -12, width: 36, height: 36, borderRadius: '50%', background: '#EAB308', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#000' }}>x=?</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            Brankas terkunci oleh sistem persamaan rasio.<br />
            Temukan nilai <strong style={{ color: '#67E8F9' }}>x</strong> untuk membukanya!
          </div>
          <div style={{ padding: '16px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>{q.display}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
              Cara: perkalian silang → x × {q.c} = {q.a} × {q.b}
            </div>
            <div style={{ fontSize: 14, color: '#fff', marginTop: 4, fontFamily: 'monospace' }}>
              x × {q.c} = {q.a * q.b} → x = {q.a * q.b} ÷ {q.c}
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Masukkan kode: nilai x = ?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
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
