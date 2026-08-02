import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// Rumus:
// Kelajuan  : v = s / t    (skalar — hanya besar, tanpa arah)
// Kecepatan : v = Δx / t  (vektor — ada besar DAN arah)
// Perpindahan = posisi akhir − posisi awal (bisa 0 jika kembali ke titik asal)
// Jarak     : total lintasan yang ditempuh (selalu ≥ perpindahan)

const ACCENT = '#6366f1'
const BG = 'linear-gradient(180deg, #080010 0%, #120820 100%)'
const TITLE = '✈️ Speed vs Velocity Pilot'

const SOAL = [
  { teks: 'Perbedaan utama kelajuan dan kecepatan adalah...', benar: 'Kelajuan skalar (tanpa arah), kecepatan vektor (ada arah)', salah: ['Kelajuan lebih besar dari kecepatan', 'Tidak ada perbedaan', 'Kelajuan punya arah, kecepatan tidak'] },
  { teks: 'Mobil menempuh jarak 150 km dalam 3 jam. Kelajuannya = ?', benar: '50 km/jam', salah: ['450 km/jam', '0,5 km/jam', '153 km/jam'] },
  { teks: 'Andi berlari mengelilingi lapangan 400 m lalu kembali ke start. Perpindahannya = ?', benar: '0 m (kembali ke titik awal)', salah: ['400 m', '800 m', '200 m'] },
  { teks: 'Kelajuan rata-rata mobil 60 km/jam selama 2 jam. Jarak yang ditempuh = ?', benar: '120 km', salah: ['30 km', '62 km', '120 m'] },
  { teks: 'Seorang pelari menempuh 100 m ke timur dalam 10 detik. Kecepatannya = ?', benar: '10 m/s ke arah timur', salah: ['10 m/s (tanpa arah)', '100 m/s ke timur', '1 m/s ke timur'] },
  { teks: 'Besaran yang TIDAK termasuk kecepatan adalah...', benar: 'Hanya besar tanpa arah (contoh: 60 km/jam)', salah: ['60 km/jam ke utara', '10 m/s ke barat', '5 m/s ke atas'] },
  { teks: 'Pelari marathon menyelesaikan 42 km dalam 4 jam. Kelajuan rata-ratanya = ?', benar: '10,5 km/jam', salah: ['42 km/jam', '4 km/jam', '168 km/jam'] },
  { teks: 'Benda bergerak dari A ke B (5 m) lalu balik ke A. Perpindahan totalnya = ?', benar: '0 m', salah: ['10 m', '5 m', '25 m'] },
  { teks: 'Speedometer kendaraan menunjukkan...', benar: 'Kelajuan sesaat (skalar, tanpa arah)', salah: ['Kecepatan (vektor)', 'Percepatan', 'Jarak total'] },
  { teks: 'GPS menunjukkan arah dan kecepatan kendaraan. Data yang ditampilkan GPS adalah...', benar: 'Kecepatan (vektor, ada nilai dan arah)', salah: ['Kelajuan', 'Percepatan', 'Perpindahan saja'] },
  { teks: 'Satuan SI untuk kelajuan dan kecepatan adalah...', benar: 'm/s (meter per sekon)', salah: ['km/jam', 'cm/s²', 'Newton'] },
  { teks: 'Bola dilempar ke atas dan kembali ke tangan pelempar. Perpindahannya = ?', benar: '0 m (kembali ke posisi awal)', salah: ['2× tinggi lemparan', 'Tinggi lemparan', 'Tidak bisa ditentukan'] },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function buildSession() {
  return shuffle(SOAL).slice(0, 10).map(q => ({ ...q, choices: shuffle([q.benar, ...q.salah]) }))
}

function EndScreen({ score, coins, onRestart, onBack }) {
  const emoji = score >= 8 ? '🏆' : score >= 5 ? '⭐' : '💪'
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT }}>Selesai!</div>
      <div style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{score}<span style={{ fontSize: 20, color: '#94A3B8' }}>/10</span></div>
        <div style={{ fontSize: 14, color: '#94A3B8' }}>Jawaban benar</div>
        <div style={{ marginTop: 8, fontSize: 16, color: '#fbbf24', fontWeight: 700 }}>🪙 +{coins} Koin diperoleh</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Kembali</button>
      </div>
    </div>
  )
}

export default function Ipa7B4T4Game({ onBack }) {
  const { addCoins, addExp } = usePlayer()
  useSurvival()
  const [session, setSession] = useState(() => buildSession())
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [done, setDone] = useState(false)

  const q = session[idx]
  const isCorrect = selected !== null ? selected === q.benar : null

  const pick = (c) => {
    if (selected !== null) return
    setSelected(c)
    const ok = c === q.benar
    if (ok) { addCoins(15); addExp(10); setScore(s => s + 1); setCoinsEarned(e => e + 15) }
    setTimeout(() => {
      if (idx + 1 >= session.length) setDone(true)
      else { setIdx(i => i + 1); setSelected(null) }
    }, 1300)
  }

  const restart = useCallback(() => {
    setSession(buildSession()); setIdx(0); setSelected(null)
    setScore(0); setCoinsEarned(0); setDone(false)
  }, [])

  if (done) return <EndScreen score={score} coins={coinsEarned} onRestart={restart} onBack={onBack} />

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={TITLE} onBack={onBack} accent={ACCENT} />
      <PlayerHeader accent={ACCENT} />

      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#94A3B8' }}>
          <span>Soal {idx + 1} / {session.length}</span>
          <span style={{ color: ACCENT, fontWeight: 700 }}>✅ {score} benar</span>
        </div>
        <div style={{ height: 6, background: '#ffffff18', borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${((idx + 1) / session.length) * 100}%`, background: ACCENT, borderRadius: 99, transition: 'width 0.4s' }} />
        </div>

        {/* Soal */}
        <Card style={{ background: `${ACCENT}14`, border: `1.5px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 18px', fontSize: 15, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.55 }}>
          {q.teks}
        </Card>

        {/* Pilihan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = `${ACCENT}12`
            let border = `1px solid ${ACCENT}30`
            let color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = '#22c55e20'; border = '1.5px solid #22c55e'; color = '#4ade80' }
              else if (c === selected) { bg = '#ef444420'; border = '1.5px solid #ef4444'; color = '#f87171' }
            }
            return (
              <button key={i} onClick={() => pick(c)} style={{ background: bg, border, borderRadius: 14, padding: '14px 16px', color, fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                {c}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {selected !== null && (
          <FeedbackBanner correct={isCorrect} answer={q.benar} onNext={() => {
            if (idx + 1 >= session.length) setDone(true)
            else { setIdx(i => i + 1); setSelected(null) }
          }} />
        )}
      </div>
    </div>
  )
}
