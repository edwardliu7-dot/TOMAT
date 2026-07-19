import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

const TEMPLATES = [
  (a,b,c,x) => ({ q:`"Umur kuda raja ${a} kali umur kudaku ditambah ${b}. Umur kuda raja ${c}. Berapa umur kudaku?"`, eq:`${a}x + ${b} = ${c}` }),
  (a,b,c,x) => ({ q:`"Harga ${a} pedang lebih ${b} koin dari harga total ${c} koin. Berapa harga 1 pedang?"`, eq:`${a}x + ${b} = ${c}` }),
  (a,b,c,x) => ({ q:`"Ada ${a} kantong koin, masing-masing berisi x koin. Ditambah ${b} koin lepas, totalnya ${c} koin. Isi tiap kantong?"`, eq:`${a}x + ${b} = ${c}` }),
]

function genQ(difficulty='medium') {
  const aMax = byDifficulty(difficulty, { easy:3, medium:5, hard:8 })
  const xMax = byDifficulty(difficulty, { easy:8, medium:12, hard:20 })
  const bMax = byDifficulty(difficulty, { easy:8, medium:15, hard:25 })
  const a = randInt(2, aMax)
  const x = randInt(1, xMax)
  const b = randInt(1, bMax)
  const c = a * x + b
  const tmpl = TEMPLATES[randInt(0, TEMPLATES.length-1)]
  const { q: prompt, eq } = tmpl(a, b, c, x)
  const { min, max } = randomSliderRange([1, x], { step:1, minPad:2, maxPad:10 })
  return { prompt, eq, answer:x, min, max }
}

export default function G8GulunganGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0d0a00 0%,#1a1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="📜 Penerjemah Gulungan Kuno" onBack={goBack} accentColor="#FCD34D" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(252,211,77,0.3)">
          <div>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>📜 Teka-teki dari Warga Desa:</div>
            <div style={{ fontSize:14, color:'#FCD34D', lineHeight:1.8, fontStyle:'italic', background:'rgba(252,211,77,0.07)', borderRadius:10, padding:12 }}>
              {q.prompt}
            </div>
            <div style={{ fontSize:13, color:'#94A3B8', marginTop:10 }}>Model: <span style={{ color:'#fff', fontWeight:700 }}>{q.eq}</span></div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`x = ${val}`} accentColor="#FCD34D" />
            <Btn onClick={confirm} color="#FCD34D">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
