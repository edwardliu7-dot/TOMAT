import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const kMax = byDifficulty(difficulty, { easy:2, medium:3, hard:4 })
  const k = randInt(2, kMax)
  const v0Max = byDifficulty(difficulty, { easy:5, medium:10, hard:15 })
  const v0 = randInt(2, v0Max)
  const answer = Math.pow(k, 3) * v0
  const { min, max } = randomSliderRange([v0, answer], { step:1, minPad:5, maxPad:100 })
  return { k, v0, answer, min, max }
}

export default function G9UpgradeKapalGame({ goBack, difficulty='medium', survival=false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
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
    if (correct) { addCoins(50); addExp(100) } else { recordWrongAnswer() }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#000d20 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Upgrade Kapal Induk" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Kontainer kargo diupgrade! Semua dimensinya dilipatkan {q.k}×. Berapa volume barunya?</div>
            <svg width="220" height="140" viewBox="0 0 220 140" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <polygon points="15,125 60,125 60,90 15,90" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" strokeWidth={1.8} />
              <polygon points="15,90 60,90 73,77 28,77" fill="rgba(74,222,128,0.18)" stroke="#4ADE80" strokeWidth={1.8} />
              <polygon points="60,125 73,112 73,77 60,90" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" strokeWidth={1.8} />
              <text x="37" y="140" textAnchor="middle" fill="#4ADE80" fontSize={9}>V0</text>
              <line x1="80" y1="107" x2="130" y2="107" stroke="#FBBF24" strokeWidth={2} />
              <polygon points="130,107 120,103 120,111" fill="#FBBF24" />
              <text x="109" y="102" textAnchor="middle" fill="#FBBF24" fontSize={12} fontWeight={800}>x{q.k}³</text>
              <polygon points="138,128 198,128 198,75 138,75" fill="rgba(74,222,128,0.15)" stroke="#4ADE80" strokeWidth={2.5} />
              <polygon points="138,75 198,75 218,55 158,55" fill="rgba(74,222,128,0.22)" stroke="#4ADE80" strokeWidth={2.5} />
              <polygon points="198,128 218,108 218,55 198,75" fill="rgba(74,222,128,0.15)" stroke="#4ADE80" strokeWidth={2.5} />
              <text x="168" y="143" textAnchor="middle" fill="#4ADE80" fontSize={9}>V baru=?</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:12 }}>
              <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Volume Awal</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#4ADE80' }}>{q.v0} m³</div>
              </div>
              <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Faktor Skala</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#FBBF24' }}>{q.k}×</div>
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Volume Baru = {q.k}³ × {q.v0} = ?</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>= {Math.pow(q.k,3)} × {q.v0}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Volume Baru: ${val} m³`} accentColor="#4ADE80" />
            <Btn onClick={confirm} color="#4ADE80">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
