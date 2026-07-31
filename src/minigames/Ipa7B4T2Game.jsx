// Rumus Resultan Gaya:
// Searah    : R = F1 + F2  (arah = arah keduanya)
// Berlawanan: R = F1 − F2  (arah ikut gaya terbesar)
// Seimbang  : R = 0 jika F1 = F2 berlawanan

import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#f97316'
const BG = 'linear-gradient(180deg, #1a0800 0%, #2d1200 100%)'
const TITLE = '⚖️ Resultant Tug of War'

const SOAL = [
  { teks: 'F1 = 30 N ke kanan, F2 = 20 N ke kanan. Resultan = ?', benar: '50 N ke kanan', salah: ['10 N ke kanan', '50 N ke kiri', '600 N'] },
  { teks: 'F1 = 40 N ke kanan, F2 = 15 N ke kiri. Resultan = ?', benar: '25 N ke kanan', salah: ['55 N ke kanan', '25 N ke kiri', '40 N'] },
  { teks: 'F1 = 50 N ke atas, F2 = 50 N ke bawah. Resultan = ?', benar: '0 N (setimbang)', salah: ['100 N ke atas', '100 N ke bawah', '50 N'] },
  { teks: 'Tiga orang mendorong ke kanan: 20 N, 25 N, 15 N. Resultan = ?', benar: '60 N ke kanan', salah: ['20 N', '45 N', '60 N ke kiri'] },
  { teks: 'F1 = 70 N ke kiri, F2 = 30 N ke kanan. Resultan = ?', benar: '40 N ke kiri', salah: ['40 N ke kanan', '100 N ke kiri', '70 N'] },
  { teks: 'Dua gaya berlawanan F1 = 100 N, F2 = 60 N. Arah resultan mengikuti...', benar: 'F1 (100 N), resultan = 40 N arah F1', salah: ['F2, resultan = 40 N', 'Tidak ada resultan', 'Resultan = 160 N'] },
  { teks: 'Benda diam saat gaya-gaya yang bekerja berjumlah...', benar: '0 N (resultan nol)', salah: ['100 N', '50 N', 'Tidak ada gaya'] },
  { teks: 'F1 = 80 N, F2 = 30 N, keduanya ke kanan. Resultan = ?', benar: '110 N ke kanan', salah: ['50 N ke kanan', '110 N ke kiri', '80 N'] },
  { teks: 'Dalam tarik tambang, tim A menarik 500 N ke kiri, tim B 500 N ke kanan. Hasilnya...', benar: 'Resultan = 0 N, tali tidak bergerak', salah: ['Resultan = 1000 N ke kiri', 'Tali bergerak ke kanan', 'Resultan = 500 N'] },
  { teks: 'F1 = 25 N ke timur, F2 = 10 N ke barat. Resultan = ?', benar: '15 N ke timur', salah: ['35 N ke timur', '15 N ke barat', '25 N'] },
  { teks: 'Benda yang bergerak ke kanan artinya resultan gaya pada benda tersebut...', benar: 'Mengarah ke kanan (resultan positif ke kanan)', salah: ['Mengarah ke kiri', 'Resultan nol', 'Tidak ada gaya'] },
  { teks: 'Dua gaya 45 N dan 45 N berlawanan arah. Resultannya adalah...', benar: '0 N', salah: ['90 N', '45 N', '22,5 N'] },
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

// Tug-of-war arrow visual
function TugBar({ f1, f2, dir }) {
  const max = Math.max(Math.abs(f1), Math.abs(f2), 1)
  const leftW = (Math.abs(f2) / max) * 45
  const rightW = (Math.abs(f1) / max) * 45
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, height: 32 }}>
      <div style={{ width: `${leftW}%`, maxWidth: 80, height: 8, background: '#ef4444', borderRadius: '4px 0 0 4px', transition: 'width 0.4s' }} />
      <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', border: '2px solid #334155', zIndex: 1, flexShrink: 0 }} />
      <div style={{ width: `${rightW}%`, maxWidth: 80, height: 8, background: '#22c55e', borderRadius: '0 4px 4px 0', transition: 'width 0.4s' }} />
    </div>
  )
}

export default function Ipa7B4T2Game({ onBack }) {
  const { addCoins, addExp } = usePlayer()
  const [session, setSession] = useState(() => buildSession())
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [done, setDone] = useState(false)
  const q = session[idx]
  const isCorrect = selected !== null ? selected === q.benar : null

  // Parse forces from question for visual
  const nums = (q.teks.match(/\d+/g) || []).map(Number)
  const f1 = nums[0] || 50, f2 = nums[1] || 30

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
        {/* Tug of war visual */}
        <Card border={`${ACCENT}30`}>
          <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 6 }}>Tarik Tambang Gaya</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
            <span style={{ color: '#ef4444' }}>← {f2} N</span>
            <span style={{ color: '#22c55e' }}>{f1} N →</span>
          </div>
          <TugBar f1={f1} f2={f2} />
        </Card>
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>RESULTAN GAYA</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '4px 0' }}>{q.teks}</div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.12)', color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.5, transition: 'all 0.18s' }}>
                {c}
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
