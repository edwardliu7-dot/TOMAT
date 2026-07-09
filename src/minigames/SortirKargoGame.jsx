import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const EXPRESSIONS = [
  { raw: '3a + 2b + 4a − b', correct: '7a + b', opts: ['7a + b', '7a − b', '12ab', '3a + b'] },
  { raw: '2x + 5y + 3x − 2y', correct: '5x + 3y', opts: ['5x + 3y', '5x − 3y', '8x + y', '6x + 3y'] },
  { raw: '4a + 3b − 2a + 4b', correct: '2a + 7b', opts: ['2a + 7b', '6a + 7b', '2a − 7b', '8a + 12b'] },
  { raw: '5p − 2q + p + 6q', correct: '6p + 4q', opts: ['6p + 4q', '5p + 4q', '6p − 4q', '10pq'] },
  { raw: '7m + 4n − 3m − n', correct: '4m + 3n', opts: ['4m + 3n', '10m + 3n', '4m − 3n', '7m − 3n'] },
]

function genExpr() {
  const e = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
  return { ...e, opts: [...e.opts].sort(() => Math.random() - 0.5) }
}

export default function SortirKargoGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genExpr)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genExpr()); setFeedback(null) }, [])

  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Sortir Kargo Pesawat" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(16,185,129,0.35)">
          <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>LABEL VARIABEL ALGEBRA KARGO</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 12 }}>
            Sederhanakan ekspresi aljabar dari daftar muatan pesawat:
          </div>
          <div style={{ background: 'rgba(52,211,153,0.08)', border: '2px dashed rgba(52,211,153,0.3)', borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>MANIFEST KARGO</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{q.raw}</div>
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: '#94A3B8', textAlign: 'center' }}>
            = ?
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#34D399', fontWeight: 600 }}>Pilih bentuk sederhana yang benar:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = feedback !== null && opt === q.correct
            return (
              <button key={i} onClick={() => select(opt)} disabled={feedback !== null} style={{
                background: isCorrect ? '#16a34a' : '#1E2128',
                border: `2px solid ${isCorrect ? '#22c55e' : 'rgba(52,211,153,0.25)'}`,
                borderRadius: 12, padding: '16px 8px', color: '#fff', fontSize: 18, fontWeight: 700,
                cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'monospace',
              }}>{opt}</button>
            )
          })}
        </div>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Kargo berhasil disortir dengan benar!' : `❌ Salah! Bentuk sederhana yang benar: ${q.correct}`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#065f46">Kargo Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
