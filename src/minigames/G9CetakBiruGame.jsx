import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const aRange = byDifficulty(difficulty, { easy: [2, 4], medium: [2, 6], hard: [4, 9] })
  const bRange = byDifficulty(difficulty, { easy: [2, 5], medium: [2, 8], hard: [4, 12] })
  const kRange = byDifficulty(difficulty, { easy: [2, 4], medium: [2, 6], hard: [3, 8] })
  const sliderMax = byDifficulty(difficulty, { easy: 30, medium: 60, hard: 100 })
  const a = randInt(...aRange)
  const b = randInt(...bRange)
  const k = randInt(...kRange)
  const bigA = a * k
  const answer = b * k
  return { a, b, k, bigA, answer, sliderMax }
}

export default function G9CetakBiruGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setVal(1); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); setQ(genQ('easy')); setVal(1); setFeedback(null) }} goBack={goBack} accentColor="#86EFAC" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧊 Cetak Biru Hologram" onBack={goBack} accentColor="#86EFAC" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Hologram: {q.a}cm × {q.b}cm.<br />
            Suku cadang asli: Sisi {q.bigA}cm sebangun dengan sisi {q.a}cm.
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa panjang sisi lainnya pada suku cadang asli?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={1} max={q.sliderMax} step={1}
              onChange={setVal}
              accentColor="#86EFAC" unit=" cm"
              leftLabel="1cm" rightLabel={`${q.sliderMax}cm`}
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#16a34a">Bangun Suku Cadang</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! ${q.answer} cm` : `❌ Salah. Jawaban: ${q.answer} cm`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
