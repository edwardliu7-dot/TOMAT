import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// C = πd, π=22/7, d multiple of 7
const D_VALS = { easy:[7,14], medium:[7,14,21,28], hard:[7,14,21,28,35] }

function genQ(difficulty='medium') {
  const pool = D_VALS[difficulty]
  const d = pool[randInt(0, pool.length-1)]
  const answer = 22 * d / 7
  const { min, max } = randomSliderRange([d, answer], { step:1, minPad:5, maxPad:40 })
  return { d, answer, min, max }
}

export default function G9OrbitGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#00001a 0%,#000010 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛰️ Kalkulasi Orbit Satelit" onBack={goBack} accentColor="#60A5FA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(96,165,250,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung panjang lintasan orbit satelit agar tidak menabrak atmosfer planet! (π = 22/7)</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#60A5FA', marginBottom:8 }}>Diameter = {q.d} km</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Keliling Orbit = πd = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 22/7 × {q.d}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Keliling: ${val} km`} accentColor="#60A5FA" />
            <Btn onClick={confirm} color="#60A5FA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
