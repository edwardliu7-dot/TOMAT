import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function gcdFrac(a, b) { return b === 0 ? a : gcdFrac(b, a % b) }
function simplify(n, d) { const g = gcdFrac(n, d); return [n / g, d / g] }

const QUESTIONS = [
  { total: 8, colored: 3, answer: '3/8' },
  { total: 4, colored: 1, answer: '1/4' },
  { total: 6, colored: 2, answer: '1/3' },
  { total: 8, colored: 6, answer: '3/4' },
  { total: 5, colored: 2, answer: '2/5' },
  { total: 6, colored: 4, answer: '2/3' },
  { total: 10, colored: 3, answer: '3/10' },
  { total: 12, colored: 4, answer: '1/3' },
]

function genQ() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

function toFracStr(n, d) {
  const [sn, sd] = simplify(n, d)
  return sd === 1 ? `${sn}` : `${sn}/${sd}`
}

export default function KokiPizzaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [tapped, setTapped] = useState(0) // how many slices student selected
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setTapped(0); setFeedback(null) }, [])

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

  function sliceMidpoint(i) {
    const midAngle = (i + 0.5) * anglePerSlice - Math.PI / 2
    return { x: cx + (r * 0.6) * Math.cos(midAngle), y: cy + (r * 0.6) * Math.sin(midAngle) }
  }

  const tapSlice = (i) => {
    if (feedback !== null) return
    // Toggle: if i < tapped, reduce; if i >= tapped, set to i+1
    if (i + 1 === tapped) {
      setTapped(i) // deselect last one
    } else {
      setTapped(i + 1) // select up to i
    }
  }

  const confirm = () => {
    if (feedback !== null || tapped === 0) return
    const studentFrac = toFracStr(tapped, q.total)
    const correct = studentFrac === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const studentFrac = tapped > 0 ? toFracStr(tapped, q.total) : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🍕 Koki Pemotong Pizza" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>RESTORAN MONSTER KELAPARAN 🐲</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 4 }}>
            Pizza dipotong menjadi <strong style={{ color: '#fff' }}>{q.total} bagian</strong>.<br />
            Monster minta <strong style={{ color: '#f97316' }}>{q.colored} potong oranye</strong>. Ketuk potongan yang diminta!
          </div>

          {/* Pizza SVG - interactive */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`} style={{ cursor: 'pointer' }}>
              {Array.from({ length: q.total }, (_, i) => {
                const isOrange = i < q.colored  // the target
                const isSelected = i < tapped   // student's selection
                let fill = '#fbbf24' // yellow default
                if (feedback === null) {
                  fill = isSelected ? '#f97316' : '#fbbf24'
                } else {
                  // After feedback: show what's correct
                  if (isOrange && isSelected) fill = '#34D399'       // correct
                  else if (isOrange && !isSelected) fill = '#f97316'  // missed
                  else if (!isOrange && isSelected) fill = '#ef4444'  // wrong
                  else fill = '#fbbf24'
                }
                return (
                  <g key={i} onClick={() => tapSlice(i)} style={{ cursor: feedback !== null ? 'default' : 'pointer' }}>
                    <path d={slicePath(i)} fill={fill} stroke="#0A2647" strokeWidth={2.5} style={{ transition: 'fill 0.2s' }} />
                    {/* Slice number hint */}
                    <text x={sliceMidpoint(i).x} y={sliceMidpoint(i).y + 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10} fontWeight="bold">{i + 1}</text>
                  </g>
                )
              })}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
              {/* Center */}
              <circle cx={cx} cy={cy} r={12} fill="rgba(0,0,0,0.4)" />
            </svg>
          </div>

          {/* Live fraction display */}
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(103,232,249,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Kamu memilih:</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: tapped > 0 ? '#f97316' : '#94A3B8', fontFamily: 'monospace' }}>
              {tapped > 0 ? studentFrac : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              {tapped > 0 ? `${tapped} dari ${q.total} bagian` : 'Ketuk irisan untuk memilih'}
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={tapped > 0 ? '#0e7490' : '#334155'}>
            {tapped > 0 ? `✅ Sajikan ${studentFrac} untuk Monster!` : 'Ketuk irisan pizza...'}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Monster puas! Jawaban: ${q.answer}` : `❌ Monster marah! Seharusnya ${q.colored} potong = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pizza Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
