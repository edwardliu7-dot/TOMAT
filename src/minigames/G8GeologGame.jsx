import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

const CONTEXTS = [
  { who: 'monster', unit: 'ekor', verb: 'berlipat ganda setiap hari' },
  { who: 'kristal tambang', unit: 'butir', verb: 'bertambah tiga kali lipat tiap jam' },
  { who: 'tentara kerajaan', unit: 'orang', verb: 'bertambah dua kali lipat tiap tahun' },
]

function genQ(difficulty = 'medium') {
  const ctx = CONTEXTS[randInt(0, CONTEXTS.length - 1)]
  const base = byDifficulty(difficulty, { easy: [2, 3], medium: [2, 4], hard: [3, 5] })
  const nMin = byDifficulty(difficulty, { easy: 2, medium: 2, hard: 3 })
  const nMax = byDifficulty(difficulty, { easy: 3, medium: 4, hard: 5 })
  const p0 = randInt(1, 3)  // starting count
  const b = randInt(base[0], base[1])
  const n = randInt(nMin, nMax)
  const answer = p0 * Math.pow(b, n)
  const { min, max } = randomSliderRange([p0, answer], { step: 1, minPad: 2, maxPad: 50 })
  return { ctx, p0, b, n, answer, min, max }
}

export default function G8GeologGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty)
    setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])

  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a0a 0%,#0a2010 100%)' }}>
      <PlayerHeader />
      <TopBar title="⛏️ Ekspedisi Geolog Kerajaan" onBack={goBack} accentColor="#4ADE80" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ marginBottom: 12 }}>
            <svg width="220" height="110" viewBox="0 0 220 110" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
              {/* Ground */}
              <rect x="0" y="88" width="220" height="22" rx="4" fill="#0a1f07" />
              {/* Mountains / terrain */}
              <polygon points="10,88 40,55 70,88" fill="#0d2a0a" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
              <polygon points="60,88 100,38 140,88" fill="#0f320d" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
              <polygon points="130,88 165,58 200,88" fill="#0d2a0a" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
              {/* Exponential crystals growing */}
              <rect x="30" y="76" width="8" height="12" rx="2" fill="#4ADE80" opacity="0.5" />
              <rect x="60" y="66" width="10" height="22" rx="2" fill="#4ADE80" opacity="0.65" />
              <rect x="92" y="52" width="13" height="36" rx="2" fill="#4ADE80" opacity="0.75" />
              <rect x="130" y="33" width="16" height="55" rx="2" fill="#4ADE80" opacity="0.9" />
              {/* Arrow trend */}
              <polyline points="26,80 58,70 90,56 128,36" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4,3" />
              <polygon points="128,36 120,42 134,44" fill="#4ADE80" />
              {/* Pickaxe icon */}
              <text x="190" y="80" fontSize="22" textAnchor="middle">⛏️</text>
              {/* Label */}
              <text x="110" y="106" textAnchor="middle" fill="rgba(74,222,128,0.6)" fontSize="9">p₀ × bⁿ = ?</text>
            </svg>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>📜 Laporan Geolog:</div>
            <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, background: 'rgba(74,222,128,0.07)', borderRadius: 10, padding: 12 }}>
              Awalnya ada <strong style={{ color: '#4ADE80' }}>{q.p0} {q.ctx.unit}</strong> {q.ctx.who} di wilayah ini.
              Populasinya <strong style={{ color: '#4ADE80' }}>{q.ctx.verb}</strong>.
              Setelah <strong style={{ color: '#4ADE80' }}>{q.n}</strong> periode, berapa jumlahnya?
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>Formula: {q.p0} × {q.b}<sup>{q.n}</sup></div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Jumlah: ${val} ${q.ctx.unit}`} accentColor="#4ADE80" />
            <Btn onClick={confirm} color="#4ADE80">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
