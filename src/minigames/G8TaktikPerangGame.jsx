import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Two coins: HH, HT, TH, TT — find n(A) for various events
const EVENTS = [
  { label: 'tepat 1 gambar (G)', answer: 2, desc: 'dari {GG, GT, TG, TT}' },
  { label: 'minimal 1 gambar (G)', answer: 3, desc: 'dari {GG, GT, TG, TT}' },
  { label: 'keduanya gambar (GG)', answer: 1, desc: 'dari {GG, GT, TG, TT}' },
  { label: 'keduanya angka (AA)', answer: 1, desc: 'dari {GG, GT, TG, TT}' },
]

function genQ(difficulty = 'medium') {
  const idx = byDifficulty(difficulty, { easy: randInt(0, 1), medium: randInt(0, 3), hard: randInt(0, 3) })
  const ev = EVENTS[idx]
  const { min, max } = randomSliderRange([1, 4], { step: 1, minPad: 1, maxPad: 2 })
  return { ...ev, min, max }
}

export default function G8TaktikPerangGame({ goBack, difficulty = 'medium', survival = false }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0d00 0%,#2e1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="♟️ Ahli Taktik Perang" onBack={goBack} accentColor="#FDE68A" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,230,138,0.3)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Dua koin dilempar sekaligus. Ruang sampel: GG, GT, TG, TT (total 4 kemungkinan). Berapa n(A) untuk kejadian {q.label}?</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FDE68A', marginBottom: 4 }}>
              S = {'{'} GG, GT, TG, TT {'}'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>n(A) = banyaknya hasil {q.label} = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`n(A) = ${val}`} accentColor="#FDE68A" />
            <Btn onClick={confirm} color="#FDE68A">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
