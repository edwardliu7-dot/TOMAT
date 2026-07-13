import React, { useState, useCallback, useRef } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const QUESTIONS = [
  { pct: 50, base: 60, answer: 30, tier: 'easy' },
  { pct: 25, base: 120, answer: 30, tier: 'easy' },
  { pct: 10, base: 200, answer: 20, tier: 'easy' },
  { pct: 75, base: 80, answer: 60, tier: 'medium' },
  { pct: 20, base: 150, answer: 30, tier: 'medium' },
  { pct: 40, base: 50, answer: 20, tier: 'medium' },
  { pct: 60, base: 70, answer: 42, tier: 'medium' },
  { pct: 80, base: 40, answer: 32, tier: 'medium' },
  { pct: 30, base: 90, answer: 27, tier: 'hard' },
  { pct: 15, base: 200, answer: 30, tier: 'hard' },
  { pct: 35, base: 80, answer: 28, tier: 'hard' },
  { pct: 45, base: 120, answer: 54, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function BateraiGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [sliderVal, setSliderVal] = useState(0) // 0..base
  const [confirmed, setConfirmed] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSliderVal(0); setConfirmed(false); setFeedback(null) }, [effectiveDifficulty])

  const fillPct = (q.base > 0) ? (sliderVal / q.base) * 100 : 0
  const batteryColor = fillPct > 60 ? 'linear-gradient(180deg,#34D399,#16a34a)' : fillPct > 30 ? 'linear-gradient(180deg,#f59e0b,#d97706)' : 'linear-gradient(180deg,#ef4444,#dc2626)'

  const confirm = () => {
    if (feedback !== null) return
    const correct = sliderVal === q.answer
    setFeedback(correct)
    setConfirmed(true)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const snapStep = 1

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Baterai Pesawat Luar Angkasa" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PANEL ENERGI PESAWAT</div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {/* Battery visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative', width: 60, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.4)' : feedback ? '#34D399' : '#ef4444'}`, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${fillPct}%`, background: batteryColor, transition: 'height 0.1s' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{sliderVal}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>unit energi</div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8, marginBottom: 8 }}>
                Sistem butuh <strong style={{ color: '#67E8F9' }}>{q.pct}%</strong> dari kapasitas.<br />
                Total kapasitas: <strong style={{ color: '#fff' }}>{q.base} unit</strong>
              </div>
              <div style={{ padding: '10px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#67E8F9', fontFamily: 'monospace', fontWeight: 700 }}>
                  {q.pct}% × {q.base} = ?
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>({q.pct}/100 × {q.base})</div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>
              <span>0</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>kamu: {sliderVal} unit</span>
              <span>{q.base}</span>
            </div>
            <input type="range" min={0} max={q.base} step={snapStep} value={sliderVal}
              onChange={e => { if (feedback === null) setSliderVal(Number(e.target.value)) }}
              disabled={feedback !== null}
              style={{ width: '100%', height: 8, accentColor: '#67E8F9', cursor: feedback !== null ? 'not-allowed' : 'pointer' }}
            />
            {/* Percentage ticks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginTop: 4 }}>
              {[0, 25, 50, 75, 100].map(p => <span key={p}>{p}%</span>)}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
            Kamu memilih: <strong style={{ color: '#fff' }}>{sliderVal} unit</strong> ({q.base > 0 ? Math.round(fillPct) : 0}% dari kapasitas)
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">✅ Isi Baterai {sliderVal} Unit</Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Pesawat siap! ${q.pct}% × ${q.base} = ${q.answer} unit` : `❌ Energi salah! Seharusnya ${q.answer} unit (${q.pct}% × ${q.base})`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
