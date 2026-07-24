import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const xMax = byDifficulty(difficulty, { easy:10, medium:20, hard:30 })
  const x = randInt(2, xMax)
  const y = randInt(2, xMax)
  const sum = x + y
  const diff = Math.abs(x - y)
  // Two pieces of info: x+y=sum AND x-y=diff (or x=2y, etc)
  const useType = randInt(0, 1)
  let prompt, eq1, eq2, answer
  if (useType === 0) {
    // x + y = sum, x - y = diff → x = (sum+diff)/2
    answer = Math.max(x, y)
    prompt = `Dua kontainer: kontainer Tabung berisi ${answer} ton, kontainer Kotak berisi ${Math.min(x,y)} ton.`
    eq1 = `Jumlah keduanya: x + y = ${sum}`
    eq2 = `Selisihnya: x − y = ${diff}`
  } else {
    // ax + b*y = total, x + y = sum → solve
    answer = x
    eq1 = `Total kargo: x + y = ${sum} ton`
    eq2 = `Kontainer Tabung (x) lebih berat dari Kotak (y)`
    prompt = `Ada ${sum} ton kargo. Kontainer Tabung berisi x ton, Kotak berisi y ton.`
  }
  const { min, max } = randomSliderRange([1, answer], { step:1, minPad:2, maxPad:15 })
  return { prompt, eq1, eq2, sum, diff, answer, min, max }
}

export default function G9ManifestGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#000d1a 0%,#000a14 100%)' }}>
      <PlayerHeader />
      <TopBar title="📦 Manifest Kargo Alien" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>🛸 Deklarasi Bea Cukai Alien:</div>
            <svg width={220} height={110} viewBox="0 0 220 110" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              {/* Cylinder left container */}
              <ellipse cx={62} cy={48} rx={28} ry={8} fill="rgba(103,232,249,0.2)" stroke="#67E8F9" strokeWidth={2} />
              <line x1={34} y1={48} x2={34} y2={90} stroke="#67E8F9" strokeWidth={2} />
              <line x1={90} y1={48} x2={90} y2={90} stroke="#67E8F9" strokeWidth={2} />
              <ellipse cx={62} cy={90} rx={28} ry={8} stroke="#67E8F9" strokeWidth={1.5} fill="rgba(103,232,249,0.1)" />
              <text x={62} y={74} fill="#67E8F9" fontSize={14} fontWeight={800} textAnchor="middle">x ton</text>
              {/* Box right container */}
              <rect x={130} y={58} width={58} height={38} rx={4} fill="rgba(167,139,250,0.12)" stroke="#A78BFA" strokeWidth={2} />
              <text x={159} y={82} fill="#A78BFA" fontSize={14} fontWeight={800} textAnchor="middle">y ton</text>
              {/* Plus sign */}
              <text x={107} y={78} fill="#fff" fontSize={20} textAnchor="middle">+</text>
              {/* Sum label */}
              <text x={110} y={108} fill="#67E8F9" fontSize={12} fontWeight={700} textAnchor="middle">= {q.sum} ton</text>
            </svg>
            <div style={{ fontSize:14, color:'#fff', lineHeight:1.7, background:'rgba(103,232,249,0.07)', borderRadius:10, padding:12 }}>
              {q.prompt}
            </div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontSize:13, color:'#67E8F9', fontWeight:700 }}>Persamaan 1: {q.eq1}</div>
              <div style={{ fontSize:13, color:'#A78BFA', fontWeight:700 }}>Persamaan 2: {q.eq2}</div>
            </div>
            <div style={{ fontSize:13, color:'#94A3B8', marginTop:10 }}>Berapa isi kontainer Tabung (x)?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val} ton`} accentColor="#67E8F9" />
            <Btn onClick={confirm} color="#67E8F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
