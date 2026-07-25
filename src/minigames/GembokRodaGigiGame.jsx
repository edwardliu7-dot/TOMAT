import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

const PAIRS = [
  { a: 12, b: 8, tier: 'easy' }, { a: 18, b: 12, tier: 'easy' }, { a: 20, b: 15, tier: 'easy' }, { a: 15, b: 25, tier: 'easy' },
  { a: 24, b: 16, tier: 'medium' }, { a: 36, b: 24, tier: 'medium' }, { a: 30, b: 20, tier: 'medium' }, { a: 16, b: 24, tier: 'medium' }, { a: 28, b: 21, tier: 'medium' },
  { a: 45, b: 30, tier: 'hard' }, { a: 40, b: 24, tier: 'hard' }, { a: 32, b: 48, tier: 'hard' }, { a: 50, b: 35, tier: 'hard' }, { a: 60, b: 45, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const { a, b } = pickFrom(poolForDifficulty(PAIRS, difficulty))
  const answer = gcd(a, b)
  return { a, b, answer }
}

export default function GembokRodaGigiGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelected(1); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selected === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Gembok Roda Gigi" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Cari faktor persekutuan terbesar (FPB) dari <strong style={{ color: '#67E8F9' }}>{q.a}</strong> dan <strong style={{ color: '#FDBA74' }}>{q.b}</strong>!
          </div>

          <svg width="220" height="90" viewBox="0 0 220 90" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
            {/* Left large gear */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>{
              const r=deg*Math.PI/180, cx=72, cy=44, ro=30, ri=22
              return <polygon key={i} points={`${cx+ri*Math.cos(r)},${cy+ri*Math.sin(r)} ${cx+ro*Math.cos(r-0.25)},${cy+ro*Math.sin(r-0.25)} ${cx+ro*Math.cos(r+0.25)},${cy+ro*Math.sin(r+0.25)}`} fill="#67E8F9" opacity="0.35" />
            })}
            <circle cx="72" cy="44" r="22" fill="#001a22" stroke="#67E8F9" strokeWidth="2" />
            <circle cx="72" cy="44" r="6" fill="#001a22" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
            <text x="72" y="49" textAnchor="middle" fill="#67E8F9" fontSize="13" fontWeight="800">{q.a}</text>
            {/* Right medium gear */}
            {[0,45,90,135,180,225,270,315].map((deg,i)=>{
              const r=deg*Math.PI/180, cx=148, cy=44, ro=24, ri=17
              return <polygon key={i} points={`${cx+ri*Math.cos(r)},${cy+ri*Math.sin(r)} ${cx+ro*Math.cos(r-0.28)},${cy+ro*Math.sin(r-0.28)} ${cx+ro*Math.cos(r+0.28)},${cy+ro*Math.sin(r+0.28)}`} fill="#FDBA74" opacity="0.35" />
            })}
            <circle cx="148" cy="44" r="17" fill="#1a0d00" stroke="#FDBA74" strokeWidth="2" />
            <circle cx="148" cy="44" r="5" fill="#1a0d00" stroke="rgba(253,186,116,0.5)" strokeWidth="1.5" />
            <text x="148" y="49" textAnchor="middle" fill="#FDBA74" fontSize="13" fontWeight="800">{q.b}</text>
            {/* Connection point */}
            <circle cx="108" cy="44" r="5" fill="#34D399" opacity="0.7" />
            <text x="110" y="84" textAnchor="middle" fill="rgba(103,232,249,0.5)" fontSize="9">FPB = faktor terbesar yang sama</text>
          </svg>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, animation: `spin ${20/selected}s linear infinite` }}>⚙️</div>
              <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>{q.a}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, animation: `spin ${20/selected}s linear infinite reverse` }}>⚙️</div>
              <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 700 }}>{q.b}</div>
            </div>
          </div>

          <SliderInput
            value={selected}
            min={1}
            max={Math.min(q.a, q.b)}
            onChange={setSelected}
            disabled={feedback !== null}
            accentColor="#67E8F9"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi FPB: {selected}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pintu terbuka! FPB(${q.a}, ${q.b}) = ${q.answer}` : `❌ Salah kunci! FPB yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Gembok Berikutnya ▶</Btn>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
