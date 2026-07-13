import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ(difficulty = 'medium') {
  const mRange = byDifficulty(difficulty, { easy: [1, 5], medium: [1, 9], hard: [3, 9] })
  const e1Range = byDifficulty(difficulty, { easy: [4, 6], medium: [4, 8], hard: [6, 10] })
  const e2Range = byDifficulty(difficulty, { easy: [1, 3], medium: [1, 5], hard: [3, 7] })
  const m1 = randInt(...mRange)
  const e1 = randInt(...e1Range)
  const m2 = randInt(...mRange)
  const e2 = randInt(...e2Range)
  let mantissa = m1 * m2
  let exponent = e1 + e2
  if (mantissa >= 10) { mantissa = mantissa / 10; exponent += 1 }
  const answer = `${mantissa} × 10^${exponent}`
  const distractors = new Set([`${mantissa} × 10^${exponent + 1}`, `${mantissa + 1} × 10^${exponent}`, `${mantissa} × 10^${e1 + e2 - 1}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${mantissa} × 10^${exponent + distractors.size + 2}`)
  const options = shuffle([answer, ...distractors])
  return { m1, e1, m2, e2, answer, options }
}

export default function G9TahunCahayaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setFeedback(null) }, [effectiveDifficulty])

  const choose = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setFeedback(null) }} goBack={goBack} accentColor="#C4B5FD" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #10071c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌌 Navigasi Tahun Cahaya" onBack={goBack} accentColor="#C4B5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            ({q.m1} × 10^{q.e1}) × ({q.m2} × 10^{q.e2})
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Kalikan dalam notasi ilmiah!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Navigasi tepat!` : `❌ Salah. Jawaban: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
