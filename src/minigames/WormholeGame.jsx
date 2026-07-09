import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

const PAIRS = [
  [3, 4], [4, 6], [6, 8], [5, 4], [6, 10],
  [8, 12], [3, 7], [4, 9], [5, 6], [9, 6],
  [4, 10], [6, 14], [3, 5],
]

function genQ() {
  const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const answer = lcm(a, b)
  const wrongs = new Set()
  const candidates = [a * b, answer + a, answer - b, answer + b, a + b]
  for (const c of shuffle(candidates)) {
    if (wrongs.size >= 3) break
    if (c !== answer && c > 0) wrongs.add(c)
  }
  const opts = shuffle([...wrongs, answer]).map(String)
  return { a, b, answer, opts }
}

export default function MercusaarGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const [time, setTime] = useState(0)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null); setTime(0) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.answer)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  // Show blink pattern preview for first 12 seconds
  const preview = Array.from({ length: 13 }, (_, t) => ({
    t, a: t % q.a === 0, b: t % q.b === 0,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏮 Sinyal Mercusuar" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>STASIUN KOORDINASI KAPAL</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.7 }}>
            Mercusuar <strong style={{ color: '#FFD700' }}>A</strong> berkedip setiap <strong style={{ color: '#FFD700' }}>{q.a} detik</strong>.<br />
            Mercusuar <strong style={{ color: '#67E8F9' }}>B</strong> berkedip setiap <strong style={{ color: '#67E8F9' }}>{q.b} detik</strong>.<br />
            Kapan keduanya berkedip <strong style={{ color: '#fff' }}>bersamaan</strong> pertama kali?
          </div>
          {/* Blink timeline */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 4, minWidth: 'max-content', marginBottom: 4 }}>
              {preview.map(({ t, a, b }) => (
                <div key={t} style={{ textAlign: 'center', minWidth: 28 }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 2 }}>{t}</div>
                  <div style={{ width: 24, height: 16, borderRadius: 4, background: a ? '#FFD700' : 'rgba(255,215,0,0.08)', border: `1px solid ${a ? '#FFD700' : 'rgba(255,215,0,0.15)'}`, marginBottom: 2 }} />
                  <div style={{ width: 24, height: 16, borderRadius: 4, background: b ? '#67E8F9' : 'rgba(103,232,249,0.08)', border: `1px solid ${b ? '#67E8F9' : 'rgba(103,232,249,0.15)'}` }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11 }}>
              <span style={{ color: '#FFD700' }}>■ Mercusuar A (setiap {q.a}s)</span>
              <span style={{ color: '#67E8F9' }}>■ Mercusuar B (setiap {q.b}s)</span>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>KPK dari {q.a} dan {q.b} = ?</div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih detik saat kedua mercusuar berkedip bersama:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Kapal berhasil diselamatkan! KPK = ${q.answer} detik` : `❌ Sinyal terlewat! KPK yang benar = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Mercusuar Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
