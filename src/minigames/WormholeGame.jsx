import React, { useState, useCallback, useRef } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

const PAIRS = [
  [3, 4], [4, 6], [6, 8], [5, 4], [6, 10],
  [8, 12], [3, 7], [4, 9], [5, 6], [9, 6],
  [4, 10], [3, 5], [5, 8], [6, 9],
]

function genQ() {
  const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const answer = lcm(a, b)
  return { a, b, answer }
}

export default function MercusaarGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const scrollRef = useRef(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  // Show timeline from t=1 to max(answer+a, answer+b, 36)
  const maxT = Math.min(q.answer + Math.max(q.a, q.b), 40)
  const timeline = Array.from({ length: maxT }, (_, i) => i + 1)

  const tap = (t) => {
    if (feedback !== null) return
    setSelected(t)
  }

  const confirm = () => {
    if (feedback !== null || selected === null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏮 Sinyal Mercusuar" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>STASIUN KOORDINASI KAPAL</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            Mercusuar <strong style={{ color: '#FFD700' }}>A</strong> berkedip setiap <strong style={{ color: '#FFD700' }}>{q.a} detik</strong>.<br />
            Mercusuar <strong style={{ color: '#67E8F9' }}>B</strong> berkedip setiap <strong style={{ color: '#67E8F9' }}>{q.b} detik</strong>.<br />
            <strong style={{ color: '#fff' }}>Ketuk detik saat keduanya berkedip bersama!</strong>
          </div>

          {/* Scrollable timeline */}
          <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', gap: 5, minWidth: 'max-content' }}>
              {timeline.map(t => {
                const blinkA = t % q.a === 0
                const blinkB = t % q.b === 0
                const both = blinkA && blinkB
                const isSel = t === selected
                const isAnswer = feedback !== null && t === q.answer
                const isWrong = feedback !== null && t === selected && !both

                let borderColor = 'rgba(255,255,255,0.08)'
                if (both) borderColor = 'rgba(255,255,255,0.2)'
                if (isSel && feedback === null) borderColor = '#f59e0b'
                if (isAnswer) borderColor = '#34D399'
                if (isWrong) borderColor = '#ef4444'

                return (
                  <button key={t} onClick={() => tap(t)} disabled={feedback !== null}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px', background: isSel && feedback === null ? 'rgba(245,158,11,0.12)' : isAnswer ? 'rgba(52,211,153,0.12)' : isWrong ? 'rgba(239,68,68,0.1)' : both ? 'rgba(255,255,255,0.04)' : 'transparent', border: `1.5px solid ${borderColor}`, borderRadius: 8, cursor: feedback !== null ? 'default' : 'pointer', transition: 'all 0.15s', minWidth: 34 }}>
                    <div style={{ fontSize: 9, color: '#94A3B8' }}>{t}s</div>
                    {/* Lighthouse A */}
                    <div style={{ width: 22, height: 14, borderRadius: 4, background: blinkA ? '#FFD700' : 'rgba(255,215,0,0.08)', border: `1px solid ${blinkA ? '#FFD700' : 'rgba(255,215,0,0.15)'}`, transition: 'background 0.1s' }} />
                    {/* Lighthouse B */}
                    <div style={{ width: 22, height: 14, borderRadius: 4, background: blinkB ? '#67E8F9' : 'rgba(103,232,249,0.08)', border: `1px solid ${blinkB ? '#67E8F9' : 'rgba(103,232,249,0.15)'}`, transition: 'background 0.1s' }} />
                    {both && <div style={{ fontSize: 8, color: '#fff' }}>✨</div>}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11 }}>
            <span style={{ color: '#FFD700' }}>■ Mercusuar A (setiap {q.a}s)</span>
            <span style={{ color: '#67E8F9' }}>■ Mercusuar B (setiap {q.b}s)</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>
            💡 Geser timeline ke kanan untuk melihat lebih banyak detik. Cari kolom ✨ pertama!
          </div>
        </Card>

        {selected !== null && (
          <Card border="rgba(245,158,11,0.3)">
            <div style={{ textAlign: 'center', fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>
              Kamu memilih detik ke-<strong style={{ color: '#fff' }}>{selected}</strong>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              A berkedip: {selected % q.a === 0 ? '✅' : '❌'} | B berkedip: {selected % q.b === 0 ? '✅' : '❌'}
            </div>
          </Card>
        )}

        {feedback === null && (
          <Btn onClick={confirm} color={selected !== null ? '#0e7490' : '#334155'}>
            {selected !== null ? `✅ Konfirmasi Detik ${selected}` : 'Ketuk detik di timeline...'}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal diselamatkan! KPK = ${q.answer} detik` : `❌ Sinyal terlewat! KPK yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Mercusuar Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
