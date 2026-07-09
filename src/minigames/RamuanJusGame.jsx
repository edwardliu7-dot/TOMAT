import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const QUESTIONS = [
  { f1: 'Apel 🍎', f2: 'Jeruk 🍊', r1: 2, r2: 3, total: 20, a1: 8, a2: 12, wrong1: [10, 6, 4], wrong2: [10, 8, 14] },
  { f1: 'Mangga 🥭', f2: 'Nanas 🍍', r1: 3, r2: 2, total: 15, a1: 9, a2: 6, wrong1: [6, 5, 12], wrong2: [9, 10, 4] },
  { f1: 'Stroberi 🍓', f2: 'Anggur 🍇', r1: 1, r2: 4, total: 25, a1: 5, a2: 20, wrong1: [4, 6, 10], wrong2: [15, 24, 16] },
  { f1: 'Pisang 🍌', f2: 'Semangka 🍉', r1: 2, r2: 5, total: 14, a1: 4, a2: 10, wrong1: [6, 2, 8], wrong2: [12, 8, 6] },
  { f1: 'Lemon 🍋', f2: 'Kiwi 🥝', r1: 3, r2: 4, total: 21, a1: 9, a2: 12, wrong1: [6, 12, 7], wrong2: [16, 9, 8] },
  { f1: 'Apel 🍎', f2: 'Pir 🍐', r1: 5, r2: 3, total: 16, a1: 10, a2: 6, wrong1: [8, 12, 6], wrong2: [10, 4, 8] },
]

function genQ() {
  const base = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const opts1 = shuffle([...base.wrong1.slice(0, 3), base.a1]).map(String)
  const opts2 = shuffle([...base.wrong2.slice(0, 3), base.a2]).map(String)
  return { ...base, opts1, opts2 }
}

export default function RamuanJusGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [sel1, setSel1] = useState(null)
  const [sel2, setSel2] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setSel1(null); setSel2(null); setFeedback(null) }, [])

  const submit = () => {
    const correct = sel1 === String(q.a1) && sel2 === String(q.a2)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧃 Ramuan Jus Buah" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>MESIN JUS AJAIB</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>{q.f1.split(' ')[1]}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#67E8F9' }}>{q.r1}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>bagian</div>
            </div>
            <div style={{ fontSize: 28, color: '#94A3B8', paddingTop: 16 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>{q.f2.split(' ')[1]}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{q.r2}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>bagian</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>
              Perbandingan {q.f1.split(' ')[0]} : {q.f2.split(' ')[0]} = {q.r1} : {q.r2}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Total buah = <strong style={{ color: '#67E8F9' }}>{q.total}</strong> buah
            </div>
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih jumlah {q.f1}:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {q.opts1.map(v => (
            <button key={v} onClick={() => { if (!feedback) setSel1(v) }} style={{
              background: sel1 === v ? 'rgba(103,232,249,0.2)' : '#1E2128',
              border: `2px solid ${sel1 === v ? '#67E8F9' : 'rgba(103,232,249,0.2)'}`,
              borderRadius: 10, padding: '12px 4px', color: '#fff', fontSize: 18, fontWeight: 800,
              cursor: feedback ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{v}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Pilih jumlah {q.f2}:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {q.opts2.map(v => (
            <button key={v} onClick={() => { if (!feedback) setSel2(v) }} style={{
              background: sel2 === v ? 'rgba(245,158,11,0.2)' : '#1E2128',
              border: `2px solid ${sel2 === v ? '#f59e0b' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: 10, padding: '12px 4px', color: '#fff', fontSize: 18, fontWeight: 800,
              cursor: feedback ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{v}</button>
          ))}
        </div>

        {feedback === null ? (
          <Btn onClick={submit} disabled={!sel1 || !sel2} color="#0e7490">🧃 Buat Jus!</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Jus sempurna! ${q.f1}: ${q.a1}, ${q.f2}: ${q.a2}` : `❌ Rasanya aneh! Benar: ${q.f1} ${q.a1}, ${q.f2} ${q.a2}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Ramuan Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
