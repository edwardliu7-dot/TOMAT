import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// Rumus Hukum Newton:
// Hukum I   : Benda diam tetap diam / benda bergerak tetap bergerak jika ΣF = 0 (inersia)
// Hukum II  : F = m × a  →  a = F / m  →  m = F / a
//             (gaya = massa × percepatan; satuan: Newton = kg·m/s²)
// Hukum III : F aksi = −F reaksi
//             (sama besar, berlawanan arah, bekerja pada BENDA YANG BERBEDA)

const ACCENT = '#facc15'
const BG = 'linear-gradient(180deg, #0a0a00 0%, #1a1800 100%)'
const TITLE = "⚡ Newton's Law Arena"

const SOAL = [
  { teks: 'Penumpang terdorong ke depan saat bus tiba-tiba direm. Ini menerapkan...', benar: 'Hukum Newton I (inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { teks: 'Roket meluncur ke atas karena gas menyembur ke bawah. Ini menerapkan...', benar: 'Hukum Newton III (aksi-reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gaya gravitasi'] },
  { teks: 'Benda bermassa 5 kg mendapat gaya 20 N. Percepatannya = ?', benar: '4 m/s²', salah: ['100 m/s²', '25 m/s²', '2 m/s²'] },
  { teks: 'Benda bermassa 10 kg bergerak dengan percepatan 3 m/s². Gaya yang bekerja = ?', benar: '30 N', salah: ['13 N', '3 N', '300 N'] },
  { teks: 'Bola di lantai licin sempurna akan terus bergerak selamanya karena...', benar: 'Hukum Newton I — tidak ada gaya yang mengubah geraknya', salah: ['Hukum Newton II — ada gaya mendorong', 'Hukum Newton III', 'Bola memiliki energi tak terbatas'] },
  { teks: 'Truk bermassa besar butuh gaya lebih besar dari sepeda motor untuk percepatan yang sama. Ini Hukum Newton...', benar: 'II (F = ma, semakin besar massa semakin besar gaya yang dibutuhkan)', salah: ['I', 'III', 'Gravitasi Newton'] },
  { teks: 'Saat berenang, tangan mendorong air ke belakang sehingga badan maju. Ini Hukum Newton...', benar: 'III (aksi: tangan mendorong air, reaksi: air mendorong badan)', salah: ['I', 'II', 'Hukum Archimedes'] },
  { teks: 'Sabuk pengaman berfungsi melindungi pengemudi saat tabrakan berdasarkan...', benar: 'Hukum Newton I — tubuh cenderung terus bergerak ke depan', salah: ['Hukum Newton II', 'Hukum Newton III', 'Gaya gesek'] },
  { teks: 'Pistol bergerak mundur (recoil) saat peluru ditembakkan ke depan karena...', benar: 'Hukum Newton III — gaya aksi peluru = gaya reaksi pistol', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gravitasi'] },
  { teks: 'Gaya 50 N bekerja pada benda, menghasilkan percepatan 5 m/s². Massa benda = ?', benar: '10 kg', salah: ['250 kg', '45 kg', '55 kg'] },
  { teks: 'Buku diam di atas meja. Gaya-gaya yang bekerja pada buku (gravitasi + normal) berjumlah...', benar: '0 N (setimbang, sesuai Hukum Newton I)', salah: ['Positif ke bawah', 'Positif ke atas', 'Sama dengan massa buku'] },
  { teks: 'Mendayung perahu: dayung mendorong air ke belakang, perahu maju. Ini contoh Hukum Newton...', benar: 'III (aksi-reaksi)', salah: ['I', 'II', 'Gravitasi'] },
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
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Kembali</button>
      </div>
    </div>
  )
}

export default function Ipa7B4T5Game({ onBack }) {
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
