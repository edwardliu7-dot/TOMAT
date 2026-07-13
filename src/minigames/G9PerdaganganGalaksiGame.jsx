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
  const coefRange = byDifficulty(difficulty, { easy: [2, 5], medium: [2, 8], hard: [5, 12] })
  const totalRange = byDifficulty(difficulty, { easy: [2, 9], medium: [4, 16], hard: [10, 30] })
  const a = randInt(...coefRange)
  const b = randInt(...coefRange)
  const total = 100 * randInt(...totalRange)
  const answer = `${a}x + ${b}y = ${total}`
  const distractors = new Set([`${b}x + ${a}y = ${total}`, `${a}x − ${b}y = ${total}`, `${a}x + ${b}y = ${total + 100}`])
  distractors.delete(answer)
  while (distractors.size < 3) distractors.add(`${a}x + ${b}y = ${total + distractors.size * 100 + 200}`)
  const options = shuffle([answer, ...distractors])
  return { a, b, total, answer, options }
}

export default function G9PerdagangGalaksiGame({ goBack, difficulty = 'medium', survival = false }) {
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
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setFeedback(null) }} goBack={goBack} accentColor="#67E8F9" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a2e 0%, #060d18 100%)' }}>
      <PlayerHeader />
      <TopBar title="👽 Misi Perdagangan Galaksi" onBack={goBack} accentColor="#67E8F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            "<strong style={{ color: '#fff' }}>{q.a}</strong> kristal (x) dan <strong style={{ color: '#fff' }}>{q.b}</strong> modul (y) = <strong style={{ color: '#fff' }}>{q.total}</strong> koin."
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Manakah model aljabar yang tepat?
          </div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={1} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Negosiasi berhasil!` : `❌ Salah. Jawaban: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
