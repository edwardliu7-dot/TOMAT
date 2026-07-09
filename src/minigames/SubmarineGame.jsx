import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
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

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  const confirm = () => {
    const currentVal = selected !== null ? selected : q.start
    if (feedback !== null) return
    const correct = currentVal === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const toPercent = (n) => ((n + 15) / 30) * 100
  const displayVal = selected !== null ? selected : q.start

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐸 Katak Pelompat Batu" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Katak di batu <strong style={{ color: '#67E8F9' }}>{q.start}</strong>, melompat {q.isForward ? '⮕ maju' : '⬅ mundur'} <strong style={{ color: '#f59e0b' }}>{q.jump} batu</strong>. Geser katak ke tujuan!
          </div>

          <div style={{ position: 'relative', height: 80, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0 10px' }}>
            <div style={{ position: 'absolute', top: 50, left: 10, right: 10, height: 2, background: 'rgba(103,232,249,0.2)' }} />
            
            <div style={{ position: 'absolute', top: 15, left: `${toPercent(displayVal)}%`, transform: 'translateX(-50%)', transition: 'left 0.2s', fontSize: 32, zIndex: 2 }}>🐸</div>
            
            <div style={{ position: 'absolute', top: 44, left: `${toPercent(q.start)}%`, transform: 'translateX(-50%)', width: 4, height: 14, background: '#67E8F9', borderRadius: 2 }} />
            
            {selected !== null && (
              <div style={{
                position: 'absolute', top: 50, height: 3, background: '#f59e0b',
                left: `${Math.min(toPercent(q.start), toPercent(selected))}%`,
                width: `${Math.abs(toPercent(selected) - toPercent(q.start))}%`,
              }}>
                <div style={{ position: 'absolute', right: selected > q.start ? -6 : 'auto', left: selected > q.start ? 'auto' : -6, top: -6, fontSize: 14, color: '#f59e0b' }}>
                  {selected > q.start ? '▶' : '◀'}
                </div>
              </div>
            )}
          </div>

          <SliderInput
            value={displayVal}
            min={-15}
            max={15}
            onChange={setSelected}
            disabled={feedback !== null}
            markEvery={5}
            accentColor="#67E8F9"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Posisi {displayVal}
          </Btn>
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
