import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#0ea5e9'
const BG = 'linear-gradient(180deg, #021018 0%, #041a28 100%)'
const TITLE = '🏃 Motion Classifier'

const SOAL = [
  { teks: 'Gerak mobil di jalan raya yang lurus dengan kecepatan tetap disebut...', benar: 'GLB (Gerak Lurus Beraturan)', salah: ['GLBB dipercepat', 'GLBB diperlambat', 'Gerak melingkar'] },
  { teks: 'Motor dari diam lalu bergerak makin cepat di jalan lurus disebut...', benar: 'GLBB dipercepat', salah: ['GLB', 'GLBB diperlambat', 'Gerak parabola'] },
  { teks: 'Sepeda mengerem dan melambat hingga berhenti disebut...', benar: 'GLBB diperlambat', salah: ['GLB', 'GLBB dipercepat', 'Gerak harmonik'] },
  { teks: 'Bumi berputar mengelilingi matahari merupakan contoh gerak...', benar: 'Melingkar', salah: ['Lurus', 'Parabola', 'Harmonik'] },
  { teks: 'Bola yang dilempar mendatar (tidak vertikal) membentuk lintasan...', benar: 'Parabola', salah: ['Lurus', 'Melingkar', 'Zigzag'] },
  { teks: 'Pada GLB, percepatan benda bernilai...', benar: 'Nol (0 m/s²)', salah: ['Positif', 'Negatif', 'Berubah-ubah'] },
  { teks: 'Jarum jam yang berputar merupakan contoh gerak...', benar: 'Melingkar beraturan', salah: ['GLB', 'GLBB', 'Gerak parabola'] },
  { teks: 'Ciri utama GLBB adalah...', benar: 'Kecepatan berubah secara teratur (percepatan tetap)', salah: ['Kecepatan tetap', 'Lintasan selalu melengkung', 'Tidak ada percepatan'] },
  { teks: 'Gerak relatif adalah gerak yang diamati dari...', benar: 'Sudut pandang (titik acuan) yang berbeda', salah: ['Tempat yang sangat jauh', 'Kamera satelit saja', 'Benda yang diam saja'] },
  { teks: 'Saat kamu naik bus dan bus bergerak, pohon di luar terlihat bergerak. Ini contoh gerak...', benar: 'Relatif (pohon relatif bergerak terhadap bus)', salah: ['Pohon benar-benar bergerak', 'GLB pohon', 'GLBB pohon'] },
  { teks: 'Bola yang dilempar vertikal ke atas, lalu jatuh kembali memiliki lintasan berbentuk...', benar: 'Lurus vertikal (naik-turun)', salah: ['Parabola', 'Melingkar', 'Zigzag'] },
  { teks: 'Grafik v-t (kecepatan vs waktu) untuk GLB berbentuk...', benar: 'Garis horizontal (kecepatan konstan)', salah: ['Garis miring ke atas', 'Garis miring ke bawah', 'Kurva melengkung'] },
]

const MOTION_ICONS = {
  'GLB': '➡️', 'GLBB dipercepat': '🚀', 'GLBB diperlambat': '🛑',
  'Melingkar': '🔄', 'Parabola': '🏹', 'Relatif': '👁️',
}

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
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Kembali</button>
      </div>
    </div>
  )
}

export default function Ipa7B4T3Game({ onBack }) {
  const { addCoins, addExp } = usePlayer()
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
  const restart = useCallback(() => { setSession(buildSession()); setIdx(0); setSelected(null); setScore(0); setCoinsEarned(0); setDone(false) }, [])
  if (done) return <EndScreen score={score} coins={coinsEarned} onRestart={restart} onBack={onBack} />

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <PlayerHeader />
      <TopBar title={TITLE} onBack={onBack} accentColor={ACCENT} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(idx / 10) * 100}%`, background: ACCENT, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>{idx + 1} / 10</div>
        </div>
        {/* Motion type legend */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(MOTION_ICONS).map(([k, v]) => (
            <div key={k} style={{ fontSize: 10, color: '#94A3B8', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>{v} {k}</div>
          ))}
        </div>
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>JENIS GERAK</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>{q.teks}</div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.12)', color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            const icon = Object.entries(MOTION_ICONS).find(([k]) => c.includes(k))?.[1] ?? '🏃'
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.5, transition: 'all 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{c}</span>
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <FeedbackBanner message={isCorrect ? `✅ Benar! ${q.benar}` : `❌ Salah! Jawaban: ${q.benar}`} isCorrect={isCorrect} extras={isCorrect ? '+15 Koin | +10 EXP' : ''} />
        )}
      </div>
    </div>
  )
}
