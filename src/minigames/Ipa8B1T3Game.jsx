import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// Perbandingan Sel Hewan vs Sel Tumbuhan:
// ┌─────────────────────┬──────────────┬──────────────────┐
// │ Organel             │ Sel Hewan    │ Sel Tumbuhan     │
// ├─────────────────────┼──────────────┼──────────────────┤
// │ Dinding sel (selulosa) │ ✗         │ ✓                │
// │ Kloroplas           │ ✗            │ ✓ (fotosintesis) │
// │ Vakuola besar       │ ✗ (kecil)    │ ✓                │
// │ Sentriol            │ ✓            │ ✗ (pembelahan)   │
// │ Lisosom             │ ✓            │ ✗ (pencernaan)   │
// │ Mitokondria         │ ✓            │ ✓ (keduanya)     │
// │ Nukleus             │ ✓            │ ✓ (keduanya)     │
// │ Membran sel         │ ✓            │ ✓ (keduanya)     │
// │ Ribosom             │ ✓            │ ✓ (sintesis protein) │
// └─────────────────────┴──────────────┴──────────────────┘

const ACCENT = '#0ea5e9'
const BG = 'linear-gradient(180deg, #020c14 0%, #031824 100%)'
const TITLE = '🧫 Cell Organelle Sorter'

const SOAL = [
  { teks: 'Organel yang HANYA ada pada sel tumbuhan (tidak ada di sel hewan) adalah...', benar: 'Dinding sel, kloroplas, dan vakuola besar', salah: ['Mitokondria dan ribosom', 'Nukleus dan membran sel', 'Lisosom dan sentriol'] },
  { teks: 'Organel yang HANYA ada pada sel hewan (tidak ada di sel tumbuhan) adalah...', benar: 'Sentriol dan lisosom', salah: ['Kloroplas dan vakuola', 'Dinding sel', 'Plastida'] },
  { teks: 'Kloroplas pada sel tumbuhan berfungsi untuk...', benar: 'Fotosintesis (mengubah cahaya menjadi energi/glukosa)', salah: ['Respirasi sel', 'Memompa air', 'Menyimpan protein'] },
  { teks: 'Dinding sel pada tumbuhan tersusun dari bahan...', benar: 'Selulosa (polisakarida)', salah: ['Protein', 'Lipid', 'Kitin (seperti jamur)'] },
  { teks: 'Vakuola pada sel tumbuhan berperan untuk...', benar: 'Menyimpan cadangan makanan, air, dan zat sisa', salah: ['Fotosintesis', 'Respirasi', 'Pembelahan sel'] },
  { teks: 'Mitokondria terdapat pada...', benar: 'Sel hewan DAN sel tumbuhan (keduanya)', salah: ['Hanya sel hewan', 'Hanya sel tumbuhan', 'Hanya sel bakteri'] },
  { teks: 'Membran sel (membran plasma) berfungsi sebagai...', benar: 'Pelindung dan pengatur keluar-masuk zat (semipermeabel)', salah: ['Tempat fotosintesis', 'Tempat produksi energi', 'Tempat sintesis protein'] },
  { teks: 'Nukleus (inti sel) berfungsi sebagai...', benar: 'Pusat kontrol sel — mengatur aktivitas dan menyimpan DNA', salah: ['Tempat fotosintesis', 'Penghasil energi', 'Penampung zat sisa'] },
  { teks: 'Ribosom adalah organel yang berfungsi untuk...', benar: 'Sintesis protein', salah: ['Menghasilkan energi (ATP)', 'Fotosintesis', 'Membuang zat sisa'] },
  { teks: 'Sel yang memiliki dinding sel, kloroplas, dan vakuola besar kemungkinan adalah sel...', benar: 'Tumbuhan', salah: ['Hewan', 'Bakteri', 'Jamur'] },
  { teks: 'Sentriol pada sel hewan berperan dalam...', benar: 'Pembelahan sel (membentuk gelendong pembelahan)', salah: ['Fotosintesis', 'Respirasi', 'Pencernaan intraseluler'] },
  { teks: 'Lisosom pada sel hewan berfungsi untuk...', benar: 'Pencernaan intraseluler (menghancurkan zat asing dan organel rusak)', salah: ['Fotosintesis', 'Sintesis protein', 'Menyimpan air'] },
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

export default function Ipa8B1T3Game({ onBack }) {
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

  const advance = useCallback(() => {
    if (idx + 1 >= session.length) setDone(true)
    else { setIdx(i => i + 1); setSelected(null) }
  }, [idx, session.length])

  const pick = (c) => {
    if (selected !== null) return
    setSelected(c)
    if (c === q.benar) { addCoins(15); addExp(10); setScore(s => s + 1); setCoinsEarned(e => e + 15) }
    setTimeout(advance, 1300)
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#94A3B8' }}>
          <span>Soal {idx + 1} / {session.length}</span>
          <span style={{ color: ACCENT, fontWeight: 700 }}>✅ {score} benar</span>
        </div>
        <div style={{ height: 6, background: '#ffffff18', borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${((idx + 1) / session.length) * 100}%`, background: ACCENT, borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
        <Card style={{ background: `${ACCENT}14`, border: `1.5px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 18px', fontSize: 15, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.55 }}>
          {q.teks}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = `${ACCENT}12`, border = `1px solid ${ACCENT}30`, color = '#cbd5e1'
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
        {selected !== null && <FeedbackBanner correct={isCorrect} answer={q.benar} onNext={advance} />}
      </div>
    </div>
  )
}
