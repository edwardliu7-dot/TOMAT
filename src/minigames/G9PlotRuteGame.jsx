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
            <svg width={220} height={155} viewBox="0 0 220 155" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              {/* Vertical grid lines */}
              {[30,60,90,120,150,180].map(x => (
                <line key={x} x1={x} y1={10} x2={x} y2={145} stroke="rgba(52,211,153,0.1)" strokeWidth={1} />
              ))}
              {/* Horizontal grid lines */}
              {[30,55,80,105,130].map(y => (
                <line key={y} x1={10} y1={y} x2={210} y2={y} stroke="rgba(52,211,153,0.1)" strokeWidth={1} />
              ))}
              {/* X-axis */}
              <line x1={10} y1={80} x2={207} y2={80} stroke="#34D399" strokeWidth={1.5} />
              <polygon points="210,80 203,76 203,84" fill="#34D399" />
              {/* Y-axis */}
              <line x1={110} y1={150} x2={110} y2={13} stroke="#34D399" strokeWidth={1.5} />
              <polygon points="110,10 106,17 114,17" fill="#34D399" />
              {/* Sample line */}
              <line x1={20} y1={115} x2={200} y2={45} stroke="#34D399" strokeWidth={2.5} />
              {/* Line label */}
              <text x={185} y={42} textAnchor="end" fill="#34D399" fontSize={9}>y={q.m}x{q.b >= 0 ? `+${q.b}` : `${q.b}`}</text>
              {/* Origin label */}
              <text x={115} y={88} fill="rgba(52,211,153,0.5)" fontSize={10}>O</text>
            </svg>
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
