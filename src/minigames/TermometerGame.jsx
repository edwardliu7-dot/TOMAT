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
  const start = rand(-15, 10)
  const change = rand(2, 12)
  const isRise = Math.random() < 0.5
  const answer = isRise ? start + change : start - change
  const wrongs = new Set()
  const offsets = [-change, change, -change + 1, change + 1, -2, 2, -change - 1]
  for (const o of shuffle(offsets)) {
    if (wrongs.size >= 3) break
    const w = answer + o
    if (w !== answer) wrongs.add(w)
  }
  const opts = shuffle([...wrongs, answer]).map(String)
  return { start, change, isRise, answer, opts }
}

export default function TermometerGame({ goBack }) {
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

  // Thermometer display: map temp -20..20 to 0..100%
  const tempMin = -20, tempMax = 20
  const fillPct = ((q.start - tempMin) / (tempMax - tempMin)) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌡️ Termometer Penyelamat" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>STASIUN CUACA DARURAT</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
            {/* Thermometer Visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 11, color: '#67E8F9' }}>+20°C</div>
              <div style={{ width: 36, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: 18, border: '2px solid rgba(103,232,249,0.4)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${fillPct}%`, background: 'linear-gradient(180deg,#ef4444,#f97316)', borderRadius: 18, transition: 'height 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#67E8F9' }}>-20°C</div>
              <div style={{ marginTop: 6, width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: '3px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{q.start}°</span>
              </div>
            </div>
            {/* Scenario */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, lineHeight: 1.7 }}>
                Seekor hewan peliharaan dalam bahaya!<br />
                Suhu saat ini: <strong style={{ color: '#fff' }}>{q.start}°C</strong>
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Perubahan cuaca:</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#67E8F9' }}>
                  {q.start}°C {q.isRise ? '+' : '−'} {q.change}°C = ?
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
                {q.isRise ? '🔥 Suhu naik — geser cairan ke atas!' : '❄️ Suhu turun — geser cairan ke bawah!'}
              </div>
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Berapa suhu akhirnya (°C)?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Hewan selamat! Suhu akhir = ${q.answer}°C` : `❌ Gagal! Jawaban benar: ${q.answer}°C`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
