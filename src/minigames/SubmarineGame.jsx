import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ() {
  const start = rand(-8, 8)
  const isForward = Math.random() < 0.5
  const jump = rand(2, 7)
  const answer = isForward ? start + jump : start - jump
  const wrongs = new Set()
  const offsets = [-jump, jump, -2, 2, -jump + 1, jump + 1, -jump - 1, jump - 1]
  for (const o of shuffle(offsets)) {
    if (wrongs.size >= 3) break
    const w = answer + o
    if (w !== answer) wrongs.add(w)
  }
  const opts = shuffle([...wrongs, answer]).map(String)
  return { start, jump, isForward, answer, opts }
}

export default function KatakGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.answer)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  // Number line: positions -10 to 10, map to percentage
  const toPercent = (n) => ((n + 10) / 20) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐸 Katak Pelompat Batu" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>GARIS BILANGAN BATU SUNGAI</div>
          {/* Number Line Visual */}
          <div style={{ position: 'relative', height: 60, marginBottom: 12 }}>
            {/* Line */}
            <div style={{ position: 'absolute', top: 30, left: 0, right: 0, height: 3, background: 'rgba(103,232,249,0.3)', borderRadius: 2 }} />
            {/* Zero mark */}
            <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', width: 2, height: 16, background: '#67E8F9' }} />
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#67E8F9' }}>0</div>
            {/* Frog at start position */}
            <div style={{ position: 'absolute', top: 0, left: `${toPercent(q.start)}%`, transform: 'translateX(-50%)' }}>
              <div style={{ fontSize: 22 }}>🐸</div>
            </div>
            {/* Jump arrow */}
            <div style={{ position: 'absolute', top: 36, left: `${Math.min(toPercent(q.start), toPercent(q.answer))}%`, width: `${Math.abs(toPercent(q.answer) - toPercent(q.start))}%`, height: 2, background: '#f59e0b' }}>
              <div style={{ position: 'absolute', right: q.isForward ? -4 : 'auto', left: q.isForward ? 'auto' : -4, top: -4, fontSize: 10 }}>{q.isForward ? '▶' : '◀'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>
            <span>-10</span><span style={{ color: '#67E8F9' }}>{q.start} (Posisi Awal)</span><span>+10</span>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Katak melompat {q.isForward ? '⮕ ke depan' : '⬅ ke belakang'}:</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#67E8F9' }}>
              {q.start} {q.isForward ? '+' : '−'} {q.jump} = ?
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Di batu nomor berapa katak mendarat?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
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
