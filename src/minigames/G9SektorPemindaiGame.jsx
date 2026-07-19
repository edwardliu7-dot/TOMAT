import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Peluang empirik: dari N percobaan, A muncul m kali. Jika diulang N kali lagi, frekuensi harapan = m
function genQ(difficulty = 'medium') {
  const maxN = byDifficulty(difficulty, { easy: 20, medium: 40, hard: 60 })
  const N = randInt(10, maxN)
  const m = randInt(2, N - 2) // times event occurred
  const answer = m // same relative frequency expected
  const { min, max } = randomSliderRange([1, N], { step: 1, minPad: 2, maxPad: 15 })
  return { N, m, answer, min, max }
}

export default function G9SektorPemindaiGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1a2e 0%,#001429 100%)' }}>
      <PlayerHeader />
      <TopBar title="📡 Sektor Pemindai" onBack={goBack} accentColor="#38BDF8" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(56,189,248,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Pemindai galaksi diaktifkan {q.N} kali. Objek aneh terdeteksi {q.m} kali. Jika diulang {q.N} kali lagi, berapa kali diharapkan terdeteksi?</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>
              P(A) ≈ {q.m}/{q.N} → fh = P(A) × {q.N}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Frekuensi harapan = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`fh = ${val}`} accentColor="#38BDF8" />
            <Btn onClick={confirm} color="#38BDF8">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
