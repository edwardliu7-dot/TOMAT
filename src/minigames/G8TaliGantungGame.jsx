import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[9,40,41]]
const CONTEXTS = [
  { story:'tangga bersandar ke tembok', legA:'tinggi dinding', legB:'jarak dari dinding', hyp:'panjang tangga' },
  { story:'tali ditarik dari menara ke tanah', legA:'tinggi menara', legB:'jarak horisontal', hyp:'panjang tali' },
  { story:'jembatan tali menyeberangi jurang', legA:'dalam jurang', legB:'lebar jurang', hyp:'panjang tali jembatan' },
]

function genQ(difficulty='medium') {
  const scale = byDifficulty(difficulty, { easy:1, medium: randInt(1,2), hard: randInt(1,3) })
  const [a,b,c] = TRIPLES[randInt(0,TRIPLES.length-1)].map(v=>v*scale)
  const ctx = CONTEXTS[randInt(0,CONTEXTS.length-1)]
  const { min, max } = randomSliderRange([a,c], { step:1, minPad:2, maxPad:15 })
  return { a, b, c, ctx, answer:c, min, max }
}

export default function G8TaliGantungGame({ goBack, difficulty='medium', survival=false }) {
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a1400 0%,#0d1a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🪢 Misi Penyelamatan Tali Gantung" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ marginBottom:8 }}>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <line x1="20" y1="130" x2="190" y2="130" stroke="#86EFAC" strokeWidth="2.5" />
              <line x1="20" y1="20" x2="20" y2="130" stroke="#86EFAC" strokeWidth="2.5" />
              <rect x="5" y="20" width="15" height="8" fill="rgba(134,239,172,0.15)" stroke="rgba(134,239,172,0.3)" strokeWidth="0.5" />
              <rect x="5" y="36" width="15" height="8" fill="rgba(134,239,172,0.15)" stroke="rgba(134,239,172,0.3)" strokeWidth="0.5" />
              <rect x="5" y="52" width="15" height="8" fill="rgba(134,239,172,0.15)" stroke="rgba(134,239,172,0.3)" strokeWidth="0.5" />
              <line x1="20" y1="20" x2="190" y2="130" stroke="#F472B6" strokeWidth="2.5" strokeDasharray="6,3" />
              <rect x="20" y="120" width="10" height="10" fill="none" stroke="rgba(134,239,172,0.5)" strokeWidth="1" />
              <text x="5" y="78" fill="#86EFAC" fontSize="11" fontWeight="700">a</text>
              <text x="105" y="144" textAnchor="middle" fill="#86EFAC" fontSize="11" fontWeight="700">b</text>
              <text x="125" y="62" fill="#F472B6" fontSize="11" fontWeight="700" transform="rotate(33,125,62)">tali=?</text>
            </svg>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>📜 Misi Penyelamatan:</div>
            <div style={{ fontSize:14, color:'#fff', lineHeight:1.7, background:'rgba(134,239,172,0.07)', borderRadius:10, padding:12 }}>
              Sebuah <strong style={{ color:'#86EFAC' }}>{q.ctx.story}</strong>.
              {' '}<strong style={{ color:'#86EFAC' }}>{q.ctx.legA}</strong> = {q.a} m,
              {' '}<strong style={{ color:'#86EFAC' }}>{q.ctx.legB}</strong> = {q.b} m.
              {' '}Berapa <strong style={{ color:'#86EFAC' }}>{q.ctx.hyp}</strong>?
            </div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:8 }}>c = √({q.a}² + {q.b}²) = √{q.a*q.a+q.b*q.b}</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`${q.ctx.hyp}: ${val} m`} accentColor="#86EFAC" />
            <Btn onClick={confirm} color="#86EFAC">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
