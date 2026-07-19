import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const max = byDifficulty(difficulty, { easy:5, medium:8, hard:12 })
  const l = randInt(2, max), w = randInt(2, max), h = randInt(2, max)
  const answer = l * w * h
  const { min, max: sMax } = randomSliderRange([l*w, answer], { step:1, minPad:5, maxPad:50 })
  return { l, w, h, answer, min, max: sMax }
}

export default function G9BoksBateraiGame({ goBack, difficulty='medium', survival=false }) {
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
      <TopBar title="🔋 Optimalisasi Boks Baterai" onBack={goBack} accentColor="#34D399" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(52,211,153,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung volume kompartemen balok untuk memastikan semua sel baterai muat!</div>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              {[['P',q.l],['L',q.w],['T',q.h]].map(([lbl,v]) => (
                <div key={lbl} style={{ textAlign:'center', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:10, padding:'8px 14px' }}>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>{lbl}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#34D399' }}>{v} m</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Volume = P × L × T = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume: ${val} m³`} accentColor="#34D399" />
            <Btn onClick={confirm} color="#34D399">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
