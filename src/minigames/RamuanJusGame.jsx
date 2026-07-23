import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const QUESTIONS = [
  { f1: 'Apel 🍎', f2: 'Jeruk 🍊', r1: 2, r2: 3, total: 20, a1: 8, a2: 12, tier: 'easy' },
  { f1: 'Mangga 🥭', f2: 'Nanas 🍍', r1: 3, r2: 2, total: 15, a1: 9, a2: 6, tier: 'easy' },
  { f1: 'Stroberi 🍓', f2: 'Anggur 🍇', r1: 1, r2: 4, total: 25, a1: 5, a2: 20, tier: 'medium' },
  { f1: 'Pisang 🍌', f2: 'Semangka 🍉', r1: 2, r2: 5, total: 14, a1: 4, a2: 10, tier: 'medium' },
  { f1: 'Lemon 🍋', f2: 'Kiwi 🥝', r1: 3, r2: 4, total: 21, a1: 9, a2: 12, tier: 'hard' },
  { f1: 'Apel 🍎', f2: 'Pir 🍐', r1: 5, r2: 3, total: 16, a1: 10, a2: 6, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function RamuanJusGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [sel1, setSel1] = useState(0)
  const [sel2, setSel2] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSel1(0); setSel2(0); setFeedback(null) }, [effectiveDifficulty])

  const submit = () => {
    const correct = sel1 === q.a1 && sel2 === q.a2
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧃 Ramuan Jus Buah" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>{q.f1.split(' ')[1]}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#67E8F9' }}>{q.r1}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>bagian</div>
            </div>
            <div style={{ fontSize: 28, color: '#94A3B8', paddingTop: 16 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>{q.f2.split(' ')[1]}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{q.r2}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>bagian</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>
              Perbandingan {q.f1.split(' ')[0]} : {q.f2.split(' ')[0]} = {q.r1} : {q.r2}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Total buah = <strong style={{ color: '#67E8F9' }}>{q.total}</strong> buah
            </div>
          </div>
        </Card>

        <Card border="rgba(103,232,249,0.2)">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 600, marginBottom: 8 }}>Jumlah {q.f1}:</div>
            <SliderInput
              value={sel1}
              min={0}
              max={q.total}
              onChange={setSel1}
              disabled={feedback !== null}
              accentColor="#67E8F9"
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>Jumlah {q.f2}:</div>
            <SliderInput
              value={sel2}
              min={0}
              max={q.total}
              onChange={setSel2}
              disabled={feedback !== null}
              accentColor="#f59e0b"
            />
          </div>
          {sel1 + sel2 !== q.total && sel1 + sel2 > 0 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#ef4444', marginTop: 10 }}>
              Total buah saat ini: {sel1 + sel2} (Harus {q.total})
            </div>
          )}
        </Card>

        {feedback === null ? (
          <Btn onClick={submit} disabled={sel1 + sel2 !== q.total} color="#0e7490">🧃 Buat Jus!</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Jus sempurna! ${q.f1}: ${q.a1}, ${q.f2}: ${q.a2}` : `❌ Rasanya aneh! Benar: ${q.f1} ${q.a1}, ${q.f2} ${q.a2}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Ramuan Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
