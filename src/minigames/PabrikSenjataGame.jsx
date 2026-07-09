import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const FORMULAS = [
  { label: 'f(x) = 2x + 3', calc: x => 2*x + 3 },
  { label: 'f(x) = 3x − 1', calc: x => 3*x - 1 },
  { label: 'f(x) = 5x − 2', calc: x => 5*x - 2 },
  { label: 'f(x) = x² + 1', calc: x => x*x + 1 },
  { label: 'f(x) = 4x + 7', calc: x => 4*x + 7 },
]

function genFormula() {
  const f = FORMULAS[Math.floor(Math.random() * FORMULAS.length)]
  const x = Math.floor(Math.random() * 6) + 2
  return { formula: f, x, correct: f.calc(x) }
}

export default function PabrikSenjataGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genFormula)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genFormula()); setInput(''); setFeedback(null) }, [])

  const submit = () => {
    const val = parseInt(input, 10)
    if (isNaN(val)) return
    const correct = val === q.correct
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #450A0A 0%, #3b0a0a 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚒️ Pabrik Senjata Pandai Besi" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(249,115,22,0.35)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            MESIN FORMULA FUNGSI f(x)
          </div>
          <div style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            {q.formula.label}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            <div style={{ background: 'rgba(253,186,116,0.1)', border: '1px solid rgba(253,186,116,0.3)', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>INPUT</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FDBA74' }}>x = {q.x}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#94A3B8' }}>→</div>
            <div style={{ background: 'rgba(253,186,116,0.1)', border: '2px dashed rgba(253,186,116,0.4)', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>OUTPUT</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>f({q.x}) = ?</div>
            </div>
          </div>
        </Card>

        <Card border="rgba(249,115,22,0.2)">
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>Masukkan hasil perhitungan:</div>
          <input type="number" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder={`f(${q.x}) = ...`}
            disabled={feedback !== null}
          />
        </Card>

        {feedback === null ? (
          <Btn onClick={submit} disabled={!input} color="#b45309">🔨 Tempa Senjata!</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Senjata berhasil ditempa!' : `❌ Gagal! Jawaban benar adalah f(${q.x}) = ${q.correct}.`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#b45309">Formula Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
