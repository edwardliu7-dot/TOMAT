import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function genQ() {
  const bases = [2, 3, 4, 5]
  const exps = [2, 3, 4]
  const base = bases[Math.floor(Math.random() * bases.length)]
  const exp = exps[Math.floor(Math.random() * exps.length)]
  const answer = Math.pow(base, exp)
  const wrongs = new Set()
  const candidates = [base * exp, answer + base, answer - base, answer * 2, Math.pow(base, exp - 1), Math.pow(base + 1, exp)]
  for (const c of shuffle(candidates)) {
    if (wrongs.size >= 3) break
    if (c !== answer && c > 0) wrongs.add(c)
  }
  const opts = shuffle([...wrongs, answer]).map(String)
  return { base, exp, answer, opts }
}

export default function SporaJamurGame({ goBack }) {
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

  // Show mushroom splitting visual
  const stages = Array.from({ length: q.exp + 1 }, (_, i) => ({ detik: i, jumlah: Math.pow(q.base, i) }))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🍄 Serangan Spora Jamur" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>MONITOR PENYEBARAN JAMUR HAMA</div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Setiap detik, 1 jamur membelah menjadi <strong style={{ color: '#fff' }}>{q.base} jamur</strong>.
          </div>
          {/* Growth table */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, overflowX: 'auto' }}>
            {stages.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 52 }}>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Detik {s.detik}</div>
                <div style={{ background: i === stages.length - 1 ? 'rgba(103,232,249,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i === stages.length - 1 ? 'rgba(103,232,249,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: i < stages.length - 1 ? 13 : 11, fontWeight: 800, color: i === stages.length - 1 ? '#67E8F9' : '#fff' }}>
                    {i < stages.length - 1 ? s.jumlah : '❓'}
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <div style={{ fontSize: 18, color: '#34D399', marginTop: 2 }}>
                    {i === 0 ? '🍄' : '🍄'.repeat(Math.min(s.jumlah, 4))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Berapa jamur pada detik ke-{q.exp}?</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>
              {q.base}<sup style={{ fontSize: 14 }}>{q.exp}</sup> = ?
            </div>
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Tembak jawaban yang benar sebelum jamur menyebar!</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Tembakan tepat! ${q.base}^${q.exp} = ${q.answer} jamur.` : `❌ Meleset! ${q.base}^${q.exp} = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Gelombang Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
