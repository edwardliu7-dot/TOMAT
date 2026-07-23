import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

const PAIRS = [
  { a: 3, b: 4, tier: 'easy' }, { a: 4, b: 6, tier: 'easy' }, { a: 5, b: 4, tier: 'easy' }, { a: 3, b: 5, tier: 'easy' },
  { a: 6, b: 8, tier: 'medium' }, { a: 6, b: 10, tier: 'medium' }, { a: 5, b: 6, tier: 'medium' }, { a: 9, b: 6, tier: 'medium' }, { a: 4, b: 10, tier: 'medium' },
  { a: 3, b: 7, tier: 'hard' }, { a: 8, b: 12, tier: 'hard' }, { a: 4, b: 9, tier: 'hard' }, { a: 5, b: 8, tier: 'hard' }, { a: 6, b: 9, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const { a, b } = pickFrom(poolForDifficulty(PAIRS, difficulty))
  const answer = lcm(a, b)
  return { a, b, answer }
}

export default function MercusaarGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selected, setSelected] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelected(1); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selected === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const blinkA = selected % q.a === 0
  const blinkB = selected % q.b === 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏮 Sinyal Mercusuar" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Mercusuar <strong style={{ color: '#FFD700' }}>A ({q.a}s)</strong> dan <strong style={{ color: '#67E8F9' }}>B ({q.b}s)</strong>.<br />
            Ketuk detik saat keduanya berkedip bersama!
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, opacity: blinkA ? 1 : 0.2, filter: blinkA ? 'drop-shadow(0 0 10px #FFD700)' : 'none', transition: 'all 0.1s' }}>🏮</div>
              <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700 }}>A ({q.a}s)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, opacity: blinkB ? 1 : 0.2, filter: blinkB ? 'drop-shadow(0 0 10px #67E8F9)' : 'none', transition: 'all 0.1s' }}>🏮</div>
              <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700 }}>B ({q.b}s)</div>
            </div>
          </div>

          <SliderInput
            value={selected}
            min={1}
            max={40}
            onChange={setSelected}
            disabled={feedback !== null}
            accentColor={blinkA && blinkB ? '#34D399' : '#67E8F9'}
            unit="s"
            markEvery={5}
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Detik {selected}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal diselamatkan! KPK = ${q.answer} detik` : `❌ Sinyal terlewat! KPK yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Mercusuar Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
