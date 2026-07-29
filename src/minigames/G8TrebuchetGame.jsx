import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Pythagorean triples (a, b, c)
const TRIPLES = [
  [3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],
  [9,12,15],[12,16,20],[15,20,25],[5,12,13],[9,40,41],
]

function genQ(difficulty = 'medium') {
  const scale = byDifficulty(difficulty, { easy: 1, medium: randInt(1, 2), hard: randInt(1, 3) })
  const triple = TRIPLES[randInt(0, TRIPLES.length - 1)]
  const [a, b, c] = triple.map(v => v * scale)
  const answer = c
  const { min, max } = randomSliderRange([a, answer], { step: 1, minPad: 2, maxPad: 15 })
  return { a, b, c, answer, min, max }
}

export default function G8TrebuchetGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty)
    setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])

  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) } else { recordWrongAnswer() }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a0d1a 0%,#0a1428 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚔️ Bidikan Tepat Trebuchet" onBack={goBack} accentColor="#93C5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(147,197,253,0.3)">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>Hitung panjang tali pelontar trebuchet (sisi miring) agar batu tepat sasaran!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <line x1="30" y1="130" x2="30" y2="20" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="30" y1="130" x2="185" y2="130" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="30" y1="20" x2="185" y2="130" stroke="#93C5FD" strokeWidth="2.5" />
              <rect x="30" y="120" width="10" height="10" fill="none" stroke="rgba(147,197,253,0.5)" strokeWidth="1" />
              <text x="8" y="78" fill="#93C5FD" fontSize="13" fontWeight="700">a</text>
              <text x="108" y="145" textAnchor="middle" fill="#93C5FD" fontSize="13" fontWeight="700">b</text>
              <text x="118" y="65" fill="#F472B6" fontSize="12" fontWeight="700" transform="rotate(-34,118,65)">c=?</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
              <div style={{ textAlign: 'center', background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Tinggi (a)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#93C5FD' }}>{q.a} m</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Jarak (b)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#93C5FD' }}>{q.b} m</div>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Panjang tali (c) = ?</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>c² = a² + b²</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Panjang Tali: ${val} m`} accentColor="#93C5FD" />
            <Btn onClick={confirm} color="#93C5FD">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
