import React, { useState, useCallback, useEffect } from 'react'
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
  const [animStep, setAnimStep] = useState(null)   // 1..answer: current factor being tested
  const [animDone, setAnimDone] = useState(false)

  const newQ = useCallback(() => {
    setQ(genQ(effectiveDifficulty)); setSelected(1); setFeedback(null)
    setAnimStep(null); setAnimDone(false)
  }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selected === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
    setAnimStep(1)
  }

  useEffect(() => {
    if (animStep === null) return
    if (animStep >= q.answer) {
      const t = setTimeout(() => setAnimDone(true), 1000)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setAnimStep(s => s + 1), 340)
    return () => clearTimeout(t)
  }, [animStep, q.answer])

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const isAnimating = animStep !== null && !animDone
  const animIsA = isAnimating ? q.a % animStep === 0 : false
  const animIsB = isAnimating ? q.b % animStep === 0 : false
  const animBoth = animIsA && animIsB

  // Gear spin speed: faster when both match
  const spinDuration = isAnimating ? (animBoth ? 0.6 : 1.2) : 20 / selected

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚙️ Gembok Roda Gigi" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border={animBoth ? 'rgba(52,211,153,0.7)' : 'rgba(103,232,249,0.3)'}>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Cari faktor persekutuan terbesar (FPB) dari <strong style={{ color: '#67E8F9' }}>{q.a}</strong> dan <strong style={{ color: '#FDBA74' }}>{q.b}</strong>!
          </div>

          <svg width="220" height="90" viewBox="0 0 220 90" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
            {/* Left gear */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>{
              const r=deg*Math.PI/180, cx=72, cy=44, ro=30, ri=22
              return <polygon key={i} points={`${cx+ri*Math.cos(r)},${cy+ri*Math.sin(r)} ${cx+ro*Math.cos(r-0.25)},${cy+ro*Math.sin(r-0.25)} ${cx+ro*Math.cos(r+0.25)},${cy+ro*Math.sin(r+0.25)}`} fill={animIsA ? '#34D399' : '#67E8F9'} opacity={animIsA ? 0.7 : 0.35} style={{ transition: 'all 0.15s' }} />
            })}
            <circle cx="72" cy="44" r="22" fill="#001a22" stroke={animIsA ? '#34D399' : '#67E8F9'} strokeWidth={animIsA ? 3 : 2} style={{ transition: 'all 0.15s' }} />
            <circle cx="72" cy="44" r="6" fill="#001a22" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
            <text x="72" y="49" textAnchor="middle" fill={animIsA ? '#34D399' : '#67E8F9'} fontSize="13" fontWeight="800" style={{ transition: 'fill 0.15s' }}>{q.a}</text>
            {/* Right gear */}
            {[0,45,90,135,180,225,270,315].map((deg,i)=>{
              const r=deg*Math.PI/180, cx=148, cy=44, ro=24, ri=17
              return <polygon key={i} points={`${cx+ri*Math.cos(r)},${cy+ri*Math.sin(r)} ${cx+ro*Math.cos(r-0.28)},${cy+ro*Math.sin(r-0.28)} ${cx+ro*Math.cos(r+0.28)},${cy+ro*Math.sin(r+0.28)}`} fill={animIsB ? '#34D399' : '#FDBA74'} opacity={animIsB ? 0.7 : 0.35} style={{ transition: 'all 0.15s' }} />
            })}
            <circle cx="148" cy="44" r="17" fill="#1a0d00" stroke={animIsB ? '#34D399' : '#FDBA74'} strokeWidth={animIsB ? 3 : 2} style={{ transition: 'all 0.15s' }} />
            <circle cx="148" cy="44" r="5" fill="#1a0d00" stroke="rgba(253,186,116,0.5)" strokeWidth="1.5" />
            <text x="148" y="49" textAnchor="middle" fill={animIsB ? '#34D399' : '#FDBA74'} fontSize="13" fontWeight="800" style={{ transition: 'fill 0.15s' }}>{q.b}</text>
            {/* Connection point */}
            <circle cx="108" cy="44" r={animBoth ? 9 : 5} fill={animBoth ? '#34D399' : 'rgba(52,211,153,0.5)'} opacity={animBoth ? 1 : 0.7} style={{ transition: 'all 0.2s' }} />
            {animBoth && <circle cx="108" cy="44" r="15" fill="none" stroke="rgba(52,211,153,0.35)" strokeWidth="2" />}
            <text x="110" y="84" textAnchor="middle" fill="rgba(103,232,249,0.5)" fontSize="9">FPB = faktor terbesar yang sama</text>
          </svg>

          {/* Gear icons + animation panel */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, animation: `spin ${spinDuration}s linear infinite`, filter: animIsA ? 'drop-shadow(0 0 10px #34D399)' : 'none', transition: 'filter 0.15s' }}>⚙️</div>
              <div style={{ fontSize: 11, color: animIsA ? '#34D399' : '#67E8F9', fontWeight: 700, transition: 'color 0.15s' }}>{q.a}</div>
              {isAnimating && <div style={{ fontSize: 9, color: animIsA ? '#34D399' : '#ef4444', fontWeight: 700 }}>{animIsA ? '✓' : '✗'}</div>}
            </div>

            {/* Centre animation panel */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {isAnimating ? (
                <div style={{ background: animBoth ? 'rgba(52,211,153,0.15)' : 'rgba(103,232,249,0.06)', border: `1.5px solid ${animBoth ? '#34D399' : 'rgba(103,232,249,0.25)'}`, borderRadius: 10, padding: '6px 4px', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 2 }}>Menguji faktor</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: animBoth ? '#34D399' : '#fff', fontFamily: 'monospace' }}>{animStep}</div>
                  <div style={{ fontSize: 9, color: animBoth ? '#34D399' : '#94A3B8', marginTop: 1 }}>
                    {animBoth ? '🔓 Cocok!' : 'mencari…'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 18, color: 'rgba(103,232,249,0.3)' }}>🔗</div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, animation: `spin ${spinDuration}s linear infinite reverse`, filter: animIsB ? 'drop-shadow(0 0 10px #34D399)' : 'none', transition: 'filter 0.15s' }}>⚙️</div>
              <div style={{ fontSize: 11, color: animIsB ? '#34D399' : '#FDBA74', fontWeight: 700, transition: 'color 0.15s' }}>{q.b}</div>
              {isAnimating && <div style={{ fontSize: 9, color: animIsB ? '#34D399' : '#ef4444', fontWeight: 700 }}>{animIsB ? '✓' : '✗'}</div>}
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
          <Btn onClick={confirm} color="#0e7490">✅ Konfirmasi FPB: {selected}</Btn>
        )}

        {animDone && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pintu terbuka! FPB(${q.a}, ${q.b}) = ${q.answer}` : `❌ Salah kunci! FPB yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Gembok Berikutnya ▶</Btn>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
