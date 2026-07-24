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
            <svg width="220" height="100" viewBox="0 0 220 100" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Scroll rollers */}
              <ellipse cx="28" cy="50" rx="18" ry="38" fill="#2a1f00" stroke="rgba(252,211,77,0.5)" strokeWidth="2" />
              <ellipse cx="192" cy="50" rx="18" ry="38" fill="#2a1f00" stroke="rgba(252,211,77,0.5)" strokeWidth="2" />
              {/* Scroll body */}
              <rect x="26" y="12" width="168" height="76" rx="2" fill="#1a1200" stroke="rgba(252,211,77,0.35)" strokeWidth="1.5" />
              {/* Parchment lines */}
              {[28,40,52,64,76].map((y,i)=>(
                <line key={i} x1="42" y1={y} x2="178" y2={y} stroke="rgba(252,211,77,0.12)" strokeWidth="1" />
              ))}
              {/* Decorative corner marks */}
              <text x="40" y="30" fill="rgba(252,211,77,0.4)" fontSize="8">✦</text>
              <text x="172" y="30" fill="rgba(252,211,77,0.4)" fontSize="8">✦</text>
              <text x="40" y="86" fill="rgba(252,211,77,0.4)" fontSize="8">✦</text>
              <text x="172" y="86" fill="rgba(252,211,77,0.4)" fontSize="8">✦</text>
              {/* Equation text on scroll */}
              <text x="110" y="46" textAnchor="middle" fill="rgba(252,211,77,0.7)" fontSize="11" fontStyle="italic">ax + b = c</text>
              <text x="110" y="64" textAnchor="middle" fill="rgba(252,211,77,0.5)" fontSize="9">x = ?</text>
              {/* Roller detail */}
              <ellipse cx="28" cy="50" rx="10" ry="30" fill="#1a1200" stroke="rgba(252,211,77,0.3)" strokeWidth="1" />
              <ellipse cx="192" cy="50" rx="10" ry="30" fill="#1a1200" stroke="rgba(252,211,77,0.3)" strokeWidth="1" />
            </svg>
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
