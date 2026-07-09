import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

// Proportional scaling: if A/B = C/D, find D
const BLUEPRINTS = [
  { w1: 4, h1: 6, w2: 8, h2: 12 },
  { w1: 3, h1: 9, w2: 6, h2: 18 },
  { w1: 5, h1: 10, w2: 15, h2: 30 },
  { w1: 2, h1: 8, w2: 5, h2: 20 },
  { w1: 6, h1: 4, w2: 9, h2: 6 },
  { w1: 4, h1: 10, w2: 6, h2: 15 },
]

function genBp() {
  const b = BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)]
  const correct = b.h2
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const offsets = [-6, -3, 3, 6, -9, 9, 5, -5]
    const w = correct + offsets[Math.floor(Math.random() * offsets.length)]
    if (w !== correct && w > 0) wrongs.add(w)
  }
  const arr = [...wrongs, correct]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return { ...b, correct, opts: arr.map(String) }
}

export default function HologramGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genBp)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genBp()); setFeedback(null) }, [])

  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.correct)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="📐 Cetak Biru Hologram" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(16,185,129,0.35)">
          <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: 1, marginBottom: 12, textAlign: 'center' }}>CETAK BIRU HOLOGRAFIK</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'flex-end', marginBottom: 16 }}>
            {/* Blueprint A */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#34D399', marginBottom: 6 }}>BLUEPRINT A (Asli)</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: q.w1 * 8, height: q.h1 * 8, border: '2px solid #34D399', background: 'rgba(52,211,153,0.05)', borderRadius: 4, minWidth: 40, minHeight: 40 }} />
                <div style={{ position: 'absolute', top: '50%', left: '120%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', fontSize: 12, color: '#94A3B8' }}>h={q.h1}</div>
                <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 12, color: '#94A3B8' }}>w={q.w1}</div>
              </div>
            </div>
            <div style={{ fontSize: 24, color: '#94A3B8', marginBottom: 24 }}>→</div>
            {/* Blueprint B */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6366F1', marginBottom: 6 }}>BLUEPRINT B (Diperbesar)</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: q.w2 * 5, height: q.h2 * 5, border: '2px dashed #6366F1', background: 'rgba(99,102,241,0.05)', borderRadius: 4, minWidth: 50, minHeight: 50 }} />
                <div style={{ position: 'absolute', top: '50%', left: '120%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', fontSize: 12, color: '#94A3B8' }}>h=?</div>
                <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 12, color: '#94A3B8' }}>w={q.w2}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: '12px', background: 'rgba(52,211,153,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 6 }}>Prinsip Kesebangunan:</div>
            <div style={{ fontSize: 17, color: '#34D399', fontWeight: 800, fontFamily: 'monospace' }}>
              {q.w1}/{q.h1} = {q.w2}/h₂
            </div>
            <div style={{ fontSize: 14, color: '#fff', marginTop: 6 }}>
              Cari nilai h₂!
            </div>
          </div>
        </Card>

        <div style={{ fontSize: 13, color: '#34D399', fontWeight: 600 }}>Pilih tinggi blueprint B (h₂):</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = feedback !== null && opt === String(q.correct)
            return (
              <button key={i} onClick={() => select(opt)} disabled={feedback !== null} style={{
                background: isCorrect ? '#16a34a' : '#1E2128',
                border: `2px solid ${isCorrect ? '#22c55e' : 'rgba(52,211,153,0.25)'}`,
                borderRadius: 12, padding: '16px 8px', color: '#fff', fontSize: 20, fontWeight: 700,
                cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>{opt}</button>
            )
          })}
        </div>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ SAH! Dimensi sangat akurat, suku cadang terpasang mulus.' : `❌ SALAH! Dimensi tidak proporsional. Jawaban: h₂ = ${q.correct}`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#065f46">Cetak Biru Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
