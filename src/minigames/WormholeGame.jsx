import React, { useState, useCallback, useEffect } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

const PAIRS = [
  { a: 3, b: 4, tier: 'easy' }, { a: 4, b: 6, tier: 'easy' }, { a: 5, b: 4, tier: 'easy' }, { a: 3, b: 5, tier: 'easy' },
  { a: 6, b: 8, tier: 'medium' }, { a: 6, b: 10, tier: 'medium' }, { a: 5, b: 6, tier: 'medium' }, { a: 9, b: 6, tier: 'medium' }, { a: 4, b: 10, tier: 'medium' },
  { a: 3, b: 7, tier: 'hard' }, { a: 8, b: 12, tier: 'hard' }, { a: 4, b: 9, tier: 'hard' }, { a: 5, b: 8, tier: 'hard' }, { a: 6, b: 9, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const { a, b } = pickFrom(poolForDifficulty(PAIRS, difficulty))
  const answer = lcm(a, b)
  return { a, b, answer }
}

export default function MercusaarGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const [animStep, setAnimStep] = useState(null)   // null=idle, 1..answer=current second
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

  const animDelay = Math.max(80, Math.min(260, 2400 / q.answer))

  useEffect(() => {
    if (animStep === null) return
    if (animStep >= q.answer) {
      const t = setTimeout(() => setAnimDone(true), 900)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setAnimStep(s => s + 1), animDelay)
    return () => clearTimeout(t)
  }, [animStep, q.answer, animDelay])

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  // During animation: blink based on animStep; after done: static
  const isAnimating = animStep !== null && !animDone
  const displayStep = isAnimating ? animStep : null
  const blinkA = displayStep !== null ? displayStep % q.a === 0 : false
  const blinkB = displayStep !== null ? displayStep % q.b === 0 : false
  const bothBlink = blinkA && blinkB

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏮 Sinyal Mercusuar" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border={bothBlink ? 'rgba(52,211,153,0.7)' : 'rgba(103,232,249,0.3)'}>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Mercusuar <strong style={{ color: '#FFD700' }}>A ({q.a}s)</strong> dan <strong style={{ color: '#67E8F9' }}>B ({q.b}s)</strong>.<br />
            Ketuk detik saat keduanya berkedip bersama!
          </div>

          {/* Lighthouse SVG */}
          <svg width="220" height="80" viewBox="0 0 220 80" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            <rect x="0" y="58" width="220" height="22" rx="3" fill="rgba(14,116,144,0.15)" />
            <path d="M0,62 Q22,56 44,62 Q66,68 88,62 Q110,56 132,62 Q154,68 176,62 Q198,56 220,62" fill="none" stroke="rgba(103,232,249,0.2)" strokeWidth="1.5" />
            {/* Lighthouse A */}
            <polygon points="50,58 58,58 56,14 52,14" fill="#1a1200" stroke="#FFD700" strokeWidth="1.5" />
            <rect x="48" y="10" width="16" height="10" rx="2" fill="#1a1200" stroke="#FFD700" strokeWidth="1.5" />
            <ellipse cx="56" cy="8" rx="10" ry="5" fill={blinkA ? 'rgba(255,215,0,0.9)' : 'rgba(255,215,0,0.2)'} stroke="#FFD700" strokeWidth="1" style={{ transition: 'fill 0.12s' }} />
            {blinkA && <line x1="56" y1="6" x2="20" y2="35" stroke="rgba(255,215,0,0.45)" strokeWidth="2" />}
            {blinkA && <line x1="56" y1="6" x2="56" y2="38" stroke="rgba(255,215,0,0.45)" strokeWidth="2" />}
            {blinkA && <ellipse cx="56" cy="8" rx="18" ry="9" fill="none" stroke="rgba(255,215,0,0.25)" strokeWidth="1.5" />}
            <text x="56" y="72" textAnchor="middle" fill="#FFD700" fontSize="8">A ({q.a}s)</text>
            {/* Lighthouse B */}
            <polygon points="162,58 170,58 168,14 164,14" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            <rect x="160" y="10" width="16" height="10" rx="2" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            <ellipse cx="168" cy="8" rx="10" ry="5" fill={blinkB ? 'rgba(103,232,249,0.9)' : 'rgba(103,232,249,0.15)'} stroke="#67E8F9" strokeWidth="1" style={{ transition: 'fill 0.12s' }} />
            {blinkB && <line x1="168" y1="6" x2="200" y2="35" stroke="rgba(103,232,249,0.45)" strokeWidth="2" />}
            {blinkB && <line x1="168" y1="6" x2="168" y2="38" stroke="rgba(103,232,249,0.45)" strokeWidth="2" />}
            {blinkB && <ellipse cx="168" cy="8" rx="18" ry="9" fill="none" stroke="rgba(103,232,249,0.25)" strokeWidth="1.5" />}
            <text x="168" y="72" textAnchor="middle" fill="#67E8F9" fontSize="8">B ({q.b}s)</text>
            {/* Ship */}
            <text x="112" y="60" textAnchor="middle" fontSize={bothBlink ? '22' : '18'} style={{ transition: 'font-size 0.2s' }}>⛵</text>
            {bothBlink && <ellipse cx="112" cy="56" rx="18" ry="7" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="2" />}
            <text x="112" y="78" textAnchor="middle" fill="rgba(103,232,249,0.4)" fontSize="8">KPK({q.a},{q.b}) = ?</text>
          </svg>

          {/* Lantern icons + animation counter */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, opacity: blinkA ? 1 : 0.25, filter: blinkA ? 'drop-shadow(0 0 12px #FFD700)' : 'none', transition: 'all 0.12s' }}>🏮</div>
              <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>A ({q.a}s)</div>
            </div>

            {/* Centre counter during animation */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {isAnimating ? (
                <div style={{ background: bothBlink ? 'rgba(52,211,153,0.15)' : 'rgba(103,232,249,0.08)', border: `1.5px solid ${bothBlink ? '#34D399' : 'rgba(103,232,249,0.3)'}`, borderRadius: 10, padding: '8px 6px', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Detik</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: bothBlink ? '#34D399' : '#fff', fontFamily: 'monospace' }}>{animStep}</div>
                  <div style={{ fontSize: 9, color: bothBlink ? '#34D399' : '#94A3B8', marginTop: 2 }}>
                    {bothBlink ? '✨ Keduanya!' : blinkA ? 'A berkedip' : blinkB ? 'B berkedip' : '·'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'rgba(103,232,249,0.4)' }}>vs</div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, opacity: blinkB ? 1 : 0.25, filter: blinkB ? 'drop-shadow(0 0 12px #67E8F9)' : 'none', transition: 'all 0.12s' }}>🏮</div>
              <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>B ({q.b}s)</div>
            </div>
          </div>

          <SliderInput
            value={selected}
            min={1}
            max={40}
            onChange={setSelected}
            disabled={feedback !== null}
            accentColor="#67E8F9"
            unit="s"
            markEvery={5}
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">✅ Konfirmasi Detik {selected}</Btn>
        )}

        {animDone && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal diselamatkan! KPK = ${q.answer} detik` : `❌ Sinyal terlewat! KPK yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Mercusuar Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
