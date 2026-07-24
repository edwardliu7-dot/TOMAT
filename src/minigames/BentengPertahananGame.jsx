import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

// Inverse proportion: w1 × d1 = w2 × d2
const SCENARIOS = [
  { w1: 4, d1: 6, w2: 3, answer: 8, tier: 'easy' },
  { w1: 6, d1: 4, w2: 8, answer: 3, tier: 'easy' },
  { w1: 2, d1: 9, w2: 6, answer: 3, tier: 'medium' },
  { w1: 5, d1: 8, w2: 4, answer: 10, tier: 'medium' },
  { w1: 3, d1: 12, w2: 9, answer: 4, tier: 'medium' },
  { w1: 8, d1: 3, w2: 4, answer: 6, tier: 'hard' },
  { w1: 10, d1: 2, w2: 4, answer: 5, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(SCENARIOS, difficulty))
}

export default function BentengPertahananGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [days, setDays] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setDays(1); setFeedback(null) }, [effectiveDifficulty])

  const product1 = q.w1 * q.d1
  const product2 = q.w2 * days
  const isBalanced = product2 === product1

  const confirm = () => {
    if (feedback !== null) return
    const correct = days === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const maxDays = q.answer * 3

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏰 Pembangun Benteng Pertahanan" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Benteng harus selesai tepat waktu! Atur hari agar seimbang:
          </div>
          <svg width="220" height="150" style={{ display: 'block', margin: '8px auto 4px', overflow: 'visible' }}>
            {/* Isometric 3D box */}
            {/* Front face */}
            <polygon points="60,90 140,90 140,130 60,130" fill="rgba(103,232,249,0.12)" stroke="#67E8F9" strokeWidth="2" />
            {/* Top face */}
            <polygon points="60,90 100,65 180,65 140,90" fill="rgba(103,232,249,0.18)" stroke="#67E8F9" strokeWidth="2" />
            {/* Right face */}
            <polygon points="140,90 180,65 180,105 140,130" fill="rgba(103,232,249,0.08)" stroke="#67E8F9" strokeWidth="2" />
            {/* W1 label */}
            <text x="100" y="115" textAnchor="middle" fill="#67E8F9" fontSize="12" fontWeight="700">{q.w1}×{q.d1}</text>
            {/* W2 label */}
            <text x="160" y="88" textAnchor="middle" fill="#67E8F9" fontSize="11" fontWeight="700">{q.w2}</text>
            {/* Divider hint */}
            <line x1="60" y1="110" x2="140" y2="110" stroke="rgba(103,232,249,0.3)" strokeWidth="1" strokeDasharray="4,3" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{q.w1} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{q.d1} Hari</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: '#67E8F9' }}>= {product1}</div>
            </div>

            <div style={{ fontSize: 24, color: isBalanced ? '#34D399' : '#f59e0b' }}>⚖️</div>

            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: `2px solid ${feedback !== null ? (feedback ? '#34D399' : '#ef4444') : isBalanced ? 'rgba(52,211,153,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{q.w2} Pekerja</div>
              <div style={{ fontSize: 13, color: '#67E8F9' }}>{days} Hari</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: isBalanced ? '#34D399' : '#f59e0b' }}>= {product2}</div>
            </div>
          </div>

          <SliderInput
            value={days}
            min={1}
            max={maxDays}
            onChange={setDays}
            disabled={feedback !== null}
            accentColor={isBalanced ? '#34D399' : '#f59e0b'}
            unit=" Hari"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={isBalanced ? '#16a34a' : '#0e7490'}>
            ✅ Konfirmasi {days} Hari
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Benteng selesai tepat waktu!` : `❌ Terlambat! Jawaban: ${q.answer} hari`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
