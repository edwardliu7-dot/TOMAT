import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// C = 2πr, use π=22/7, so r must be multiple of 7 for integer answer
const R_VALS = { easy:[7,14], medium:[7,14,21], hard:[7,14,21,28] }

function genQ(difficulty='medium') {
  const pool = R_VALS[difficulty]
  const r = pool[randInt(0, pool.length-1)]
  const answer = 2 * 22 * r / 7  // = 44r/7
  const { min, max } = randomSliderRange([r, answer], { step:1, minPad:5, maxPad:50 })
  return { r, answer, min, max }
}

export default function G9KalibrasiRadaGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a0020 0%,#080018 100%)' }}>
      <PlayerHeader />
      <TopBar title="🎯 Kalibrasi Jangkauan Radar" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Atur jari-jari lingkaran sensor pemindai dan hitung kelilingnya! (π = 22/7)</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#A78BFA', marginBottom:8 }}>r = {q.r} satuan</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Keliling = 2πr = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= 2 × 22/7 × {q.r}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Keliling: ${val} satuan`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
