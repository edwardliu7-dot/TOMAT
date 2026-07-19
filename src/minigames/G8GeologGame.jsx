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
