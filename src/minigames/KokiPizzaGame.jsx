import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

function gcdFrac(a, b) { return b === 0 ? a : gcdFrac(b, a % b) }
function simplify(n, d) { const g = gcdFrac(n, d); return [n / g, d / g] }

const QUESTIONS = [
  { total: 4, colored: 1, answer: '1/4', tier: 'easy' },
  { total: 6, colored: 2, answer: '1/3', tier: 'easy' },
  { total: 5, colored: 2, answer: '2/5', tier: 'easy' },
  { total: 8, colored: 3, answer: '3/8', tier: 'medium' },
  { total: 8, colored: 6, answer: '3/4', tier: 'medium' },
  { total: 6, colored: 4, answer: '2/3', tier: 'medium' },
  { total: 10, colored: 3, answer: '3/10', tier: 'hard' },
  { total: 12, colored: 4, answer: '1/3', tier: 'hard' },
  { total: 16, colored: 6, answer: '3/8', tier: 'hard' },
  { total: 14, colored: 4, answer: '2/7', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

function toFracStr(n, d) {
  const [sn, sd] = simplify(n, d)
  return sd === 1 ? `${sn}` : `${sn}/${sd}`
}

export default function KokiPizzaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [tapped, setTapped] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setTapped(0); setFeedback(null) }, [effectiveDifficulty])

  const anglePerSlice = (2 * Math.PI) / q.total
  const cx = 100, cy = 100, r = 88

  function slicePath(i) {
    const startAngle = i * anglePerSlice - Math.PI / 2
    const endAngle = (i + 1) * anglePerSlice - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
  }

  const tapSlice = (i) => {
    if (feedback !== null) return
    if (i + 1 === tapped) setTapped(i)
    else setTapped(i + 1)
  }

  const confirm = () => {
    if (feedback !== null || tapped === 0) return
    const studentFrac = toFracStr(tapped, q.total)
    const correct = studentFrac === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const studentFrac = tapped > 0 ? toFracStr(tapped, q.total) : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🍕 Koki Pemotong Pizza" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Monster minta <strong style={{ color: '#f97316' }}>{q.colored} dari {q.total} bagian</strong>. Ketuk potongan pizza!
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`} style={{ cursor: 'pointer' }}>
              {Array.from({ length: q.total }, (_, i) => {
                const isSelected = i < tapped
                let fill = isSelected ? '#f97316' : '#fbbf24'
                if (feedback !== null) {
                  const isOrange = i < q.colored
                  if (isOrange && isSelected) fill = '#34D399'
                  else if (isOrange && !isSelected) fill = '#f97316'
                  else if (!isOrange && isSelected) fill = '#ef4444'
                  else fill = '#fbbf24'
                }
                return (
                  <path key={i} d={slicePath(i)} onClick={() => tapSlice(i)} fill={fill} stroke="#0A2647" strokeWidth={2.5} style={{ transition: 'fill 0.2s', cursor: feedback !== null ? 'default' : 'pointer' }} />
                )
              })}
              <circle cx={cx} cy={cy} r={12} fill="rgba(0,0,0,0.4)" />
            </svg>
          </div>

          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(103,232,249,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: tapped > 0 ? '#f97316' : '#94A3B8', fontFamily: 'monospace' }}>
              {tapped > 0 ? studentFrac : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              {tapped > 0 ? `${tapped} dari ${q.total} bagian` : 'Pilih porsi pizza'}
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={tapped > 0 ? '#0e7490' : '#334155'}>
            ✅ Sajikan {studentFrac || 'Pizza'}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Monster puas! Jawaban: ${q.answer}` : `❌ Monster marah! Seharusnya ${q.colored} potong = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Pizza Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
