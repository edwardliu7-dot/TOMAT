import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ() {
  const start = rand(-8, 8)
  const isForward = Math.random() < 0.5
  const jump = rand(2, 7)
  const answer = isForward ? start + jump : start - jump
  return { start, jump, isForward, answer }
}

export default function KatakGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [animating, setAnimating] = useState(false)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null); setAnimating(false) }, [])

  const stones = Array.from({ length: 21 }, (_, i) => i - 10)

  const tapStone = (n) => {
    if (feedback !== null || animating) return
    setAnimating(true)
    setSelected(n)
    setTimeout(() => {
      setAnimating(false)
    }, 400)
  }

  const confirm = () => {
    if (feedback !== null || selected === null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const toPercent = (n) => ((n + 10) / 20) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐸 Katak Pelompat Batu" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>GARIS BILANGAN BATU SUNGAI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Katak di batu <strong style={{ color: '#67E8F9' }}>{q.start}</strong>, melompat {q.isForward ? '⮕ maju' : '⬅ mundur'} <strong style={{ color: '#f59e0b' }}>{q.jump} batu</strong>.<br />
            <span style={{ color: '#fff' }}>Ketuk batu tempat katak mendarat!</span>
          </div>

          {/* Number line */}
          <div style={{ position: 'relative', height: 60, marginBottom: 8 }}>
            <div style={{ position: 'absolute', top: 30, left: 10, right: 10, height: 2, background: 'rgba(103,232,249,0.2)', borderRadius: 2 }} />
            {/* Frog */}
            <div style={{ position: 'absolute', top: 2, left: `${toPercent(selected ?? q.start)}%`, transform: 'translateX(-50%)', transition: 'left 0.3s', fontSize: 20, pointerEvents: 'none' }}>🐸</div>
            {/* Jump arrow */}
            {selected !== null && (
              <div style={{
                position: 'absolute', top: 36, height: 2, background: '#f59e0b',
                left: `${Math.min(toPercent(q.start), toPercent(selected))}%`,
                width: `${Math.abs(toPercent(selected) - toPercent(q.start))}%`,
              }}>
                <div style={{ position: 'absolute', right: q.isForward ? -6 : 'auto', left: q.isForward ? 'auto' : -6, top: -5, fontSize: 12 }}>{q.isForward ? '▶' : '◀'}</div>
              </div>
            )}
            {/* Start marker */}
            <div style={{ position: 'absolute', top: 24, left: `${toPercent(q.start)}%`, transform: 'translateX(-50%)', width: 3, height: 12, background: '#67E8F9', borderRadius: 2 }} />
          </div>
        </Card>

        {/* Stone grid */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 600, textAlign: 'center', marginBottom: 10 }}>Ketuk batu tujuan katak:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {stones.map(n => {
              const isStart = n === q.start
              const isSel = n === selected
              const isAnswer = feedback !== null && n === q.answer
              let bg = 'rgba(255,255,255,0.04)'
              let border = '1px solid rgba(255,255,255,0.1)'
              let color = '#94A3B8'
              if (isStart) { bg = 'rgba(103,232,249,0.12)'; border = '1px solid #67E8F9'; color = '#67E8F9' }
              if (isSel && feedback === null) { bg = 'rgba(245,158,11,0.2)'; border = '2px solid #f59e0b'; color = '#f59e0b' }
              if (isAnswer && feedback === true) { bg = 'rgba(52,211,153,0.2)'; border = '2px solid #34D399'; color = '#34D399' }
              if (isAnswer && feedback === false) { bg = 'rgba(52,211,153,0.2)'; border = '2px solid #34D399'; color = '#34D399' }
              if (isSel && feedback === false) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid #ef4444'; color = '#ef4444' }
              return (
                <button key={n} onClick={() => tapStone(n)} disabled={feedback !== null}
                  style={{ padding: '10px 4px', borderRadius: 10, border, background: bg, color, fontSize: 13, fontWeight: 700, cursor: feedback !== null ? 'not-allowed' : 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                  {isStart && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#67E8F9' }} />}
                  {n}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
            <span>🔵 Posisi awal ({q.start})</span>
            {selected !== null && <span>🟡 Pilihanmu ({selected})</span>}
          </div>
        </Card>

        {feedback === null && selected !== null && (
          <Btn onClick={confirm} color="#0e7490">✅ Konfirmasi Batu {selected}</Btn>
        )}
        {feedback === null && selected === null && (
          <div style={{ textAlign: 'center', padding: 14, border: '1px dashed rgba(103,232,249,0.2)', borderRadius: 12, color: '#94A3B8', fontSize: 13 }}>
            👆 Ketuk batu di atas untuk memilih posisi katak
          </div>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Katak selamat! Mendarat di batu ${q.answer}.` : `❌ Katak jatuh! Posisi benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
