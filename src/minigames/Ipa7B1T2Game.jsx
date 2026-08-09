import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#eab308'
const BG = 'linear-gradient(180deg, #1a1500 0%, #2d2200 100%)'
const TITLE = '⚖️ Baku vs Non-Baku Sort'

const SOAL = [
  { teks: 'Manakah yang termasuk satuan BAKU panjang?', benar: 'Meter (m)', salah: ['Jengkal', 'Depa', 'Langkah'] },
  { teks: 'Mengukur panjang meja dengan jengkal tangan termasuk satuan...', benar: 'Tak baku', salah: ['Baku', 'Internasional', 'SI'] },
  { teks: 'Satuan baku massa dalam Sistem Internasional (SI) adalah...', benar: 'Kilogram (kg)', salah: ['Pon', 'Kati', 'Pikul'] },
  { teks: 'Kelemahan utama satuan tak baku adalah...', benar: 'Hasilnya berbeda-beda antar orang', salah: ['Sulit diingat', 'Terlalu mahal', 'Tidak ada di pasaran'] },
  { teks: 'Satuan waktu yang BUKAN satuan baku adalah...', benar: 'Kedipan mata', salah: ['Detik', 'Menit', 'Jam'] },
  { teks: 'Alat ukur standar yang digunakan sebagai satuan baku panjang adalah...', benar: 'Mistar/penggaris (cm/mm)', salah: ['Jari tangan', 'Tongkat kayu', 'Tali rafia'] },
  { teks: 'Mengapa ilmuwan menggunakan satuan baku?', benar: 'Agar pengukuran konsisten di seluruh dunia', salah: ['Karena lebih murah', 'Karena lebih mudah', 'Karena sudah tradisi'] },
  { teks: '"Depa" adalah satuan tak baku untuk mengukur...', benar: 'Panjang', salah: ['Massa', 'Waktu', 'Suhu'] },
  { teks: 'Satuan baku untuk suhu dalam SI adalah...', benar: 'Kelvin (K)', salah: ['Celsius', 'Fahrenheit', 'Reamur'] },
  { teks: 'Ciri satuan baku yang benar adalah...', benar: 'Nilainya tetap dan diakui secara internasional', salah: ['Mudah diucapkan', 'Sering dipakai sehari-hari', 'Hanya digunakan di Indonesia'] },
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
  return shuffle(SOAL).slice(0, 10).map(q => ({
    ...q,
    choices: shuffle([q.benar, ...q.salah]),
  }))
}

function EndScreen({ score, coins, onRestart, onBack }) {
  const pct = Math.round((score / 10) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT, textAlign: 'center' }}>Selesai!</div>
      <div style={{ background: 'rgba(234,179,8,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{score}<span style={{ fontSize: 20, color: '#94A3B8' }}>/10</span></div>
        <div style={{ fontSize: 14, color: '#94A3B8' }}>Jawaban benar</div>
        <div style={{ marginTop: 8, fontSize: 16, color: '#fbbf24', fontWeight: 700 }}>🪙 +{coins} Koin diperoleh</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          🔄 Main Lagi
        </button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          ← Kembali
        </button>
      </div>
    </div>
  )
}

export default function Ipa7B1T2Game({ onBack }) {
  const { addCoins, addExp } = usePlayer()
  const [session, setSession] = useState(() => buildSession())
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [done, setDone] = useState(false)

  const q = session[idx]
  const isCorrect = selected !== null ? selected === q.benar : null

  const pick = (choice) => {
    if (selected !== null) return
    setSelected(choice)
    const correct = choice === q.benar
    if (correct) {
      addCoins(15)
      addExp(10)
      setScore(s => s + 1)
      setCoinsEarned(c => c + 15)
    }
    setTimeout(() => {
      if (idx + 1 >= session.length) {
        setDone(true)
      } else {
        setIdx(i => i + 1)
        setSelected(null)
      }
    }, 1300)
  }

  const restart = useCallback(() => {
    setSession(buildSession())
    setIdx(0)
    setSelected(null)
    setScore(0)
    setCoinsEarned(0)
    setDone(false)
  }, [])

  if (done) {
    return <EndScreen score={score} coins={coinsEarned} onRestart={restart} onBack={onBack} />
  }

  // Label each option with BAKU / TAK BAKU badge when answered
  const bakuSet = new Set(['Meter (m)', 'Kilogram (kg)', 'Detik', 'Menit', 'Jam', 'Mistar/penggaris (cm/mm)', 'Kelvin (K)'])

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <PlayerHeader />
      <TopBar title={TITLE} onBack={onBack} accentColor={ACCENT} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(idx / 10) * 100}%`, background: ACCENT, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap' }}>{idx + 1} / 10</div>
        </div>

        {/* Category banner */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {['✅ BAKU', '❌ TAK BAKU'].map((label, i) => (
            <div key={i} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${i === 0 ? '#22c55e' : '#ef4444'}40`, background: i === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', fontSize: 12, fontWeight: 700, color: i === 0 ? '#22c55e' : '#ef4444' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Question */}
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SATUAN BAKU VS TAK BAKU</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>
            {q.teks}
          </div>
        </Card>

        {/* Choices 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)'
            let border = 'rgba(255,255,255,0.12)'
            let color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '16px 12px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.4, transition: 'all 0.18s' }}>
                {c}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {selected !== null && (
          <FeedbackBanner
            message={isCorrect ? `✅ Benar! ${q.benar}` : `❌ Salah! Jawaban: ${q.benar}`}
            isCorrect={isCorrect}
            extras={isCorrect ? '+15 Koin | +10 EXP' : ''}
          />
        )}
      </div>
    </div>
  )
}
