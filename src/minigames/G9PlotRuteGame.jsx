import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const mMax = byDifficulty(difficulty, { easy:3, medium:5, hard:8 })
  const bRange = byDifficulty(difficulty, { easy:[-5,5], medium:[-10,10], hard:[-15,15] })
  const xMax = byDifficulty(difficulty, { easy:5, medium:8, hard:12 })
  const m = randInt(1, mMax) * (randInt(0,1) ? 1 : -1)
  const b = randInt(bRange[0], bRange[1])
  const x = randInt(1, xMax)
  const answer = m * x + b
  const ansAbs = Math.abs(answer)
  const { min, max } = randomSliderRange([answer - 10, answer], { step:1, minPad:5, maxPad:5 })
  return { m, b, x, answer, min, max }
}

export default function G9PlotRuteGame({ goBack, difficulty='medium', survival=false }) {
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

  const bStr = q.b >= 0 ? `+ ${q.b}` : `− ${Math.abs(q.b)}`

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000a1a 0%,#00081a 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗺️ Plotting Rute Grafik" onBack={goBack} accentColor="#818CF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(129,140,248,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>Layar navigasi menampilkan rute linear. Temukan koordinat y kapal pada titik x!</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#818CF8', marginBottom:8 }}>y = {q.m}x {bStr}</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Jika x = {q.x}, y = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>y = {q.m}×{q.x} {bStr}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`y = ${val}`} accentColor="#818CF8" />
            <Btn onClick={confirm} color="#818CF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
