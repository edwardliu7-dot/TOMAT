import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ(difficulty = 'medium') {
  const basePool = byDifficulty(difficulty, { easy: [2, 3], medium: [2, 3, 4, 5], hard: [2, 3, 4, 5, 6, 7] })
  const nRange = byDifficulty(difficulty, { easy: [1, 2], medium: [1, 3], hard: [2, 4] })
  const base = basePool[Math.floor(Math.random() * basePool.length)]
  const n = nRange[0] + Math.floor(Math.random() * (nRange[1] - nRange[0] + 1))
  const answer = `1/${Math.pow(base, n)}`
  const distractors = new Set([`1/${Math.pow(base, n + 1)}`, `${Math.pow(base, n)}`, `-1/${Math.pow(base, n)}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`1/${Math.pow(base, n) + distractors.size + 2}`)
  const options = shuffle([answer, ...distractors])
  return { base, n, answer, options }
}

export default function G9MikroskopGame({ goBack, difficulty = 'medium', survival = false }) {
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
      <TopBar title="🔬 Mikroskop Sub-Atomik" onBack={goBack} accentColor="#C4B5FD" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(196,181,253,0.3)">
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {q.base}<sup>−{q.n}</sup>
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Ubah pangkat negatif menjadi bentuk pecahan!
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Zoom berhasil dikalibrasi!` : `❌ Salah. Jawaban: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
