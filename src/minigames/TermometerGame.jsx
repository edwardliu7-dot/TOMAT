import React, { useState, useCallback, useEffect } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ(difficulty = 'medium') {
  const startRange = byDifficulty(difficulty, { easy: [-10, 10], medium: [-15, 10], hard: [-30, 25] })
  const changeRange = byDifficulty(difficulty, { easy: [2, 6], medium: [2, 12], hard: [5, 20] })
  const start = rand(...startRange)
  const change = rand(...changeRange)
  const isRise = Math.random() < 0.5
  const answer = isRise ? start + change : start - change
  const { min: tempMin, max: tempMax } = randomSliderRange([start, answer], { step: 5, minPad: 5, maxPad: 25 })
  return { start, change, isRise, answer, tempMin, tempMax }
}

export default function TermometerGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Animation state
  const [animStep, setAnimStep] = useState(0)       // 0 = not started
  const [animDone, setAnimDone] = useState(false)
  const [animTemp, setAnimTemp] = useState(null)    // mercury position during animation

  // Animate mercury toward correct answer one degree at a time
  useEffect(() => {
    if (animStep === 0 || animDone) return
    if (animTemp === null) return
    if (animTemp === q.answer) { setAnimDone(true); return }
    const t = setTimeout(() => {
      setAnimTemp(prev => {
        if (prev === null) return q.answer
        return prev < q.answer ? prev + 1 : prev - 1
      })
    }, 100)
    return () => clearTimeout(t)
  }, [animStep, animDone, animTemp, q.answer])

  const newQ = useCallback(() => {
    setQ(genQ(effectiveDifficulty))
    setSelected(null)
    setSubmitted(false)
    setFeedback(null)
    setAnimStep(0)
    setAnimDone(false)
    setAnimTemp(null)
  }, [effectiveDifficulty])

  const confirm = () => {
    if (submitted) return
    const currentVal = selected !== null ? selected : q.start
    const correct = currentVal === q.answer
    setSubmitted(true)
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
    setAnimTemp(currentVal)
    setAnimStep(1)
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  // Pre-submit: slider position. Post-submit: animated mercury position.
  const displayTemp = submitted ? (animTemp !== null ? animTemp : (selected !== null ? selected : q.start)) : (selected !== null ? selected : q.start)
  const fillPct = (t) => ((t - q.tempMin) / (q.tempMax - q.tempMin)) * 100
  const studentFill = fillPct(displayTemp)
  const startFill = fillPct(q.start)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌡️ Termometer Penyelamat" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <svg width="220" height="80" viewBox="0 0 220 80" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {q.isRise ? (
              <g>
                <circle cx="175" cy="35" r="16" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
                <circle cx="175" cy="35" r="9" fill="rgba(239,68,68,0.3)" />
                {[0,45,90,135,180,225,270,315].map((deg,i)=>{
                  const r=deg*Math.PI/180
                  return <line key={i} x1={175+11*Math.cos(r)} y1={35+11*Math.sin(r)} x2={175+18*Math.cos(r)} y2={35+18*Math.sin(r)} stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
                })}
                <text x="175" y="68" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="9">🔥 +{q.change}°C</text>
              </g>
            ) : (
              <g>
                <circle cx="175" cy="35" r="16" fill="rgba(103,232,249,0.08)" stroke="rgba(103,232,249,0.3)" strokeWidth="1.5" />
                {[0,60,120,180,240,300].map((deg,i)=>{
                  const r=deg*Math.PI/180
                  return <line key={i} x1={175} y1={35} x2={175+15*Math.cos(r)} y2={35+15*Math.sin(r)} stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
                })}
                <circle cx="175" cy="35" r="5" fill="rgba(103,232,249,0.3)" />
                <text x="175" y="68" textAnchor="middle" fill="rgba(103,232,249,0.6)" fontSize="9">❄️ −{q.change}°C</text>
              </g>
            )}
            <rect x="50" y="8" width="18" height="60" rx="9" fill="#001428" stroke="#67E8F9" strokeWidth="2" />
            <circle cx="59" cy="70" r="12" fill="#001428" stroke="#67E8F9" strokeWidth="2" />
            <rect x="54" y={8 + (1 - (q.start - q.tempMin)/(q.tempMax - q.tempMin)) * 56} width="10" height={(q.start - q.tempMin)/(q.tempMax - q.tempMin) * 56} rx="3" fill="rgba(103,232,249,0.7)" />
            <circle cx="59" cy="70" r="9" fill="rgba(103,232,249,0.6)" />
            {[0,0.25,0.5,0.75,1].map((p,i)=>(
              <line key={i} x1="68" y1={8+p*56} x2="74" y2={8+p*56} stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
            ))}
            <line x1="44" y1={8 + (1-(q.start-q.tempMin)/(q.tempMax-q.tempMin))*56} x2="68" y2={8 + (1-(q.start-q.tempMin)/(q.tempMax-q.tempMin))*56} stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="42" y={10 + (1-(q.start-q.tempMin)/(q.tempMax-q.tempMin))*56} textAnchor="end" fill="#67E8F9" fontSize="9">{q.start}°</text>
          </svg>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Suhu awal: <strong style={{ color: '#fff' }}>{q.start}°C</strong>. {q.isRise ? '🔥 Naik' : '❄️ Turun'} <strong style={{ color: '#67E8F9' }}>{q.change}°C</strong>. Geser ke suhu akhir!
          </div>

          {/* Animated mercury column */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 40, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '2px solid rgba(103,232,249,0.4)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: `${startFill}%`, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.3)', zIndex: 2 }} />
              <div style={{
                position: 'absolute', bottom: 0, width: '100%',
                height: `${studentFill}%`,
                background: submitted && animDone
                  ? (feedback ? 'linear-gradient(180deg,#10b981,#059669)' : 'linear-gradient(180deg,#ef4444,#dc2626)')
                  : 'linear-gradient(180deg,#67E8F9,#2563eb)',
                borderRadius: 20,
                transition: submitted ? 'height 0.08s linear' : 'height 0.2s',
              }} />
              {/* Temperature label during animation */}
              {submitted && !animDone && (
                <div style={{ position: 'absolute', top: 4, width: '100%', textAlign: 'center', fontSize: 9, color: '#67E8F9', fontWeight: 800 }}>
                  {displayTemp}°
                </div>
              )}
            </div>
          </div>

          <SliderInput
            value={selected !== null ? selected : q.start}
            min={q.tempMin}
            max={q.tempMax}
            onChange={v => { if (!submitted) setSelected(v) }}
            disabled={submitted}
            unit="°C"
            markEvery={5}
            accentColor="#67E8F9"
          />
        </Card>

        {!submitted && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi {selected !== null ? selected : q.start}°C
          </Btn>
        )}

        {submitted && !animDone && (
          <div style={{
            background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.2)',
            borderRadius: 12, padding: '14px', textAlign: 'center', color: '#67E8F9', fontSize: 13, fontWeight: 700,
          }}>
            🌡️ Mengukur suhu…
          </div>
        )}

        {animDone && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Hewan selamat! Suhu akhir = ${q.answer}°C` : `❌ Gagal! Jawaban benar: ${q.answer}°C`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
