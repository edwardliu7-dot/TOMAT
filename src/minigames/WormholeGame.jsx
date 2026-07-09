import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const SURDS = [
  { expr: '√18', correct: '3√2', opts: ['3√2', '2√3', '9√2', '2√9'] },
  { expr: '√50', correct: '5√2', opts: ['5√2', '2√5', '25√2', '5√5'] },
  { expr: '√27', correct: '3√3', opts: ['3√3', '9√3', '3√9', '2√3'] },
  { expr: '√75', correct: '5√3', opts: ['5√3', '3√5', '25√3', '15√5'] },
  { expr: '√32', correct: '4√2', opts: ['4√2', '2√4', '16√2', '2√8'] },
  { expr: '√12', correct: '2√3', opts: ['2√3', '3√2', '4√3', '2√6'] },
  { expr: '√45', correct: '3√5', opts: ['3√5', '5√3', '9√5', '3√9'] },
]

function genSurd() {
  const s = SURDS[Math.floor(Math.random() * SURDS.length)]
  return { ...s, opts: [...s.opts].sort(() => Math.random() - 0.5) }
}

export default function WormholeGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genSurd)
  const [feedback, setFeedback] = useState(null)
  const [spinning, setSpinning] = useState(false)

  const newQ = useCallback(() => { setQ(genSurd()); setFeedback(null); setSpinning(false) }, [])

  const select = (opt) => {
    if (feedback !== null) return
    setSpinning(true)
    setTimeout(() => {
      const correct = opt === q.correct
      setFeedback(correct)
      setSpinning(false)
      if (correct) { addCoins(50); addExp(100) }
    }, 600)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌀 Generator Lubang Cacing" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(16,185,129,0.35)">
          <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 12, textAlign: 'center' }}>INTI ENERGI GENERATOR</div>
          {/* Wormhole visual */}
          <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
            <div style={{
              display: 'inline-block', width: 120, height: 120, borderRadius: '50%',
              background: 'radial-gradient(circle, #6366F1 0%, #0f172a 60%)',
              border: '3px solid #34D399', boxShadow: '0 0 30px rgba(52,211,153,0.3)',
              animation: spinning ? 'spin 0.6s linear infinite' : 'none',
              alignItems: 'center', justifyContent: 'center',
            }}
              className="wormhole"
            >
              <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{q.expr}</span>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .wormhole { display: flex; }`}</style>
          </div>
          <div style={{ textAlign: 'center', fontSize: 15, color: '#94A3B8' }}>
            Sederhanakan bentuk akar ini untuk membuka portal!
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#34D399', fontWeight: 600 }}>Pilih bentuk akar yang disederhanakan:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = feedback !== null && opt === q.correct
            return (
              <button key={i} onClick={() => select(opt)} disabled={feedback !== null || spinning} style={{
                background: isCorrect ? '#16a34a' : '#1E2128',
                border: `2px solid ${isCorrect ? '#22c55e' : 'rgba(52,211,153,0.25)'}`,
                borderRadius: 12, padding: '16px 8px', color: '#fff', fontSize: 20, fontWeight: 700,
                cursor: (feedback !== null || spinning) ? 'default' : 'pointer', fontFamily: 'monospace',
              }}>{opt}</button>
            )
          })}
        </div>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Portal terbuka! Lubang cacing berhasil dibuat!' : `❌ Energi tidak stabil! Jawaban benar: ${q.correct}`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#065f46">Generator Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
