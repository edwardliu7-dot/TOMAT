import React, { useState, useCallback, useEffect } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ(difficulty = 'medium') {
  const jumpRange = byDifficulty(difficulty, { easy: [2, 4], medium: [2, 7], hard: [4, 10] })
  const jump = rand(...jumpRange)
  const bound = 15 - jump
  const start = rand(-bound, bound)
  const isForward = Math.random() < 0.5
  const answer = isForward ? start + jump : start - jump
  return { start, jump, isForward, answer }
}

export default function KatakGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Animation state
  const [animStep, setAnimStep] = useState(0)
  const [animDone, setAnimDone] = useState(false)
  const [frogPos, setFrogPos] = useState(null) // animated frog position

  // Animate frog from start → answer, one jump at a time
  useEffect(() => {
    if (animStep === 0 || animDone) return
    if (frogPos === null) return
    if (frogPos === q.answer) { setAnimDone(true); return }
    const t = setTimeout(() => {
      setFrogPos(prev => {
        if (prev === null) return q.answer
        const delta = q.isForward ? q.jump : -q.jump
        const next = prev + delta
        // Clamp to answer to avoid overshooting
        if (q.isForward) return Math.min(next, q.answer)
        return Math.max(next, q.answer)
      })
    }, 350)
    return () => clearTimeout(t)
  }, [animStep, animDone, frogPos, q.answer, q.isForward, q.jump])

  const newQ = useCallback(() => {
    setQ(genQ(effectiveDifficulty))
    setSelected(null)
    setSubmitted(false)
    setFeedback(null)
    setAnimStep(0)
    setAnimDone(false)
    setFrogPos(null)
  }, [effectiveDifficulty])

  const confirm = () => {
    if (submitted) return
    const currentVal = selected !== null ? selected : q.start
    const correct = currentVal === q.answer
    setSubmitted(true)
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
    setFrogPos(q.start)
    setAnimStep(1)
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const toPercent = (n) => ((n + 15) / 30) * 100
  // Before submit: frog stays at start. After submit: frog animates via frogPos
  const frogVisualPos = submitted ? (frogPos !== null ? frogPos : q.start) : q.start
  const displayVal = selected !== null ? selected : q.start

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐸 Katak Pelompat Batu" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <svg width="220" height="64" viewBox="0 0 220 64" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            <rect x="0" y="42" width="220" height="22" rx="4" fill="rgba(14,116,144,0.15)" />
            {[20,55,90,130,165,200].map((x,i)=>(
              <ellipse key={i} cx={x} cy="50" rx="12" ry="4" fill="none" stroke="rgba(103,232,249,0.15)" strokeWidth="1" />
            ))}
            {[15,45,75,105,135,165,195].map((x,i)=>(
              <ellipse key={i} cx={x} cy="44" rx="14" ry="6" fill="#0a1f2e" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            ))}
            {/* Frog shown at start in SVG overview */}
            <text x={15 + ((q.start+15)/30)*180} y="38" textAnchor="middle" fontSize="18">🐸</text>
            {q.isForward ? (
              <path d={`M ${15 + ((q.start+15)/30)*180} 36 Q ${15 + ((q.start+15)/30)*180 + 30} 14 ${15 + ((q.start+q.jump+15)/30)*180} 36`} fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" strokeDasharray="4,3" />
            ) : (
              <path d={`M ${15 + ((q.start+15)/30)*180} 36 Q ${15 + ((q.start+15)/30)*180 - 30} 14 ${15 + ((q.start-q.jump+15)/30)*180} 36`} fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" strokeDasharray="4,3" />
            )}
            <line x1="10" y1="58" x2="210" y2="58" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            {[-15,-10,-5,0,5,10,15].map((n,i)=>(
              <text key={i} x={15 + (n+15)/30*180} y="63" textAnchor="middle" fill="rgba(103,232,249,0.4)" fontSize="7">{n}</text>
            ))}
          </svg>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Katak di batu <strong style={{ color: '#67E8F9' }}>{q.start}</strong>, melompat {q.isForward ? '⮕ maju' : '⬅ mundur'} <strong style={{ color: '#f59e0b' }}>{q.jump} batu</strong>. Geser katak ke tujuan!
          </div>

          {/* Interactive frog area — frog stays at start until submit */}
          <div style={{ position: 'relative', height: 80, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0 10px' }}>
            <div style={{ position: 'absolute', top: 50, left: 10, right: 10, height: 2, background: 'rgba(103,232,249,0.2)' }} />

            {/* Animated frog */}
            <div style={{
              position: 'absolute', top: 15,
              left: `${toPercent(frogVisualPos)}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.3s ease-out',
              fontSize: 32, zIndex: 2,
            }}>🐸</div>

            {/* Start marker */}
            <div style={{ position: 'absolute', top: 44, left: `${toPercent(q.start)}%`, transform: 'translateX(-50%)', width: 4, height: 14, background: '#67E8F9', borderRadius: 2 }} />

            {/* Destination marker (shown after submit) */}
            {submitted && (
              <div style={{
                position: 'absolute', top: 38,
                left: `${toPercent(q.answer)}%`,
                transform: 'translateX(-50%)',
                fontSize: 16, color: animDone ? (feedback ? '#10b981' : '#ef4444') : '#f59e0b',
                filter: 'drop-shadow(0 0 4px currentColor)',
              }}>
                {animDone ? (feedback ? '✅' : '❌') : '🎯'}
              </div>
            )}

            {/* Jump vector (before submit, shows slider selection) */}
            {!submitted && selected !== null && (
              <div style={{
                position: 'absolute', top: 50, height: 3, background: '#f59e0b',
                left: `${Math.min(toPercent(q.start), toPercent(selected))}%`,
                width: `${Math.abs(toPercent(selected) - toPercent(q.start))}%`,
              }}>
                <div style={{ position: 'absolute', right: selected > q.start ? -6 : 'auto', left: selected > q.start ? 'auto' : -6, top: -6, fontSize: 14, color: '#f59e0b' }}>
                  {selected > q.start ? '▶' : '◀'}
                </div>
              </div>
            )}
          </div>

          <SliderInput
            value={displayVal}
            min={-15}
            max={15}
            onChange={v => { if (!submitted) setSelected(v) }}
            disabled={submitted}
            markEvery={5}
            accentColor="#67E8F9"
          />
        </Card>

        {!submitted && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Posisi {displayVal}
          </Btn>
        )}

        {submitted && !animDone && (
          <div style={{
            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12, padding: '14px', textAlign: 'center', color: '#f59e0b', fontSize: 13, fontWeight: 700,
          }}>
            🐸 Katak melompat…
          </div>
        )}

        {animDone && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Katak selamat! Mendarat di batu ${q.answer}.` : `❌ Katak jatuh! Posisi benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
