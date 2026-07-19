import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas = πr², π=22/7, r multiple of 7
const R_VALS = { easy:[7], medium:[7,14], hard:[7,14,21] }

function genQ(difficulty='medium') {
  const pool = R_VALS[difficulty]
  const r = pool[randInt(0, pool.length-1)]
  const answer = 22 * r * r / 7
  const { min, max } = randomSliderRange([r*r, answer], { step:1, minPad:10, maxPad:200 })
  return { r, answer, min, max }
}

export default function G9ShieldGayaGame({ goBack, difficulty='medium', survival=false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty); setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])
  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct); survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#000d20 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Medan Gaya Shield Pelindung" onBack={goBack} accentColor="#38BDF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(56,189,248,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Aktifkan perisai plasma lingkaran! Hitung luas area yang harus dilindungi. (π = 22/7)</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#38BDF8', marginBottom:8 }}>r = {q.r} m</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Luas = πr² = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 22/7 × {q.r}²</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas: ${val} m²`} accentColor="#38BDF8" />
            <Btn onClick={confirm} color="#38BDF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
