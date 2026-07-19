import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const aMax = byDifficulty(difficulty, { easy:4, medium:7, hard:10 })
  const xMax = byDifficulty(difficulty, { easy:8, medium:15, hard:25 })
  const bMax = byDifficulty(difficulty, { easy:10, medium:20, hard:30 })
  const a = randInt(2, aMax)
  const x = randInt(1, xMax)
  const b = randInt(1, bMax)
  const c = a * x + b
  const { min, max } = randomSliderRange([0, x], { step:1, minPad:2, maxPad:10 })
  return { a, b, c, answer:x, min, max }
}

export default function G8KatrolGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001a08 0%,#001408 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Katrol Penyeimbang Jembatan" onBack={goBack} accentColor="#34D399" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(52,211,153,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>Jembatan gantung harus seimbang! Beban di kiri dan kanan harus sama.</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:10 }}>
              <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Kiri</div>
                <div style={{ fontSize:18, fontWeight:800, color:'#34D399' }}>{q.a}x + {q.b}</div>
              </div>
              <div style={{ fontSize:20, color:'#FBBF24', fontWeight:800 }}>=</div>
              <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Kanan</div>
                <div style={{ fontSize:18, fontWeight:800, color:'#FBBF24' }}>{q.c}</div>
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>x = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val}`} accentColor="#34D399" />
            <Btn onClick={confirm} color="#34D399">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
