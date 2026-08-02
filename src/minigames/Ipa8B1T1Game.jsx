import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// Sejarah Penemuan Sel & Teori Sel:
// 1665 — Robert Hooke: menyebut ruang kecil pada gabus sebagai "sel"
// ~1670 — Antonie van Leeuwenhoek: pertama mengamati mikroorganisme hidup (perbesaran 270×)
// 1838 — Matthias Schleiden: semua tumbuhan tersusun atas sel
// 1839 — Theodor Schwann: semua hewan tersusun atas sel
// 1855 — Rudolf Virchow: omnis cellula e cellula ("semua sel berasal dari sel")
// Teori Sel Modern (3 prinsip):
//   1. Semua makhluk hidup tersusun atas sel
//   2. Sel adalah unit dasar kehidupan
//   3. Semua sel berasal dari sel yang sudah ada

const ACCENT = '#1d4ed8'
const BG = 'linear-gradient(180deg, #020d1a 0%, #041830 100%)'
const TITLE = '🕰️ History Timeline Puzzle'

const SOAL = [
  { teks: 'Ilmuwan yang pertama kali menyebut ruangan kecil pada gabus sebagai "sel" adalah...', benar: 'Robert Hooke (1665)', salah: ['Antonie van Leeuwenhoek', 'Matthias Schleiden', 'Theodor Schwann'] },
  { teks: 'Antonie van Leeuwenhoek dikenal sebagai "Bapak Mikrobiologi" karena...', benar: 'Pertama kali mengamati mikroorganisme hidup dengan mikroskop buatannya', salah: ['Menemukan DNA sel', 'Membuat teori sel modern', 'Menciptakan vaksin pertama'] },
  { teks: 'Teori bahwa semua tumbuhan tersusun atas sel dikemukakan oleh...', benar: 'Matthias Schleiden (1838)', salah: ['Robert Hooke', 'Rudolf Virchow', 'Charles Darwin'] },
  { teks: 'Teori bahwa semua hewan tersusun atas sel dikemukakan oleh...', benar: 'Theodor Schwann (1839)', salah: ['Matthias Schleiden', 'Robert Hooke', 'Louis Pasteur'] },
  { teks: 'Prinsip "semua sel berasal dari sel sebelumnya" dikemukakan oleh...', benar: 'Rudolf Virchow (1855)', salah: ['Robert Hooke', 'Antonie van Leeuwenhoek', 'Gregor Mendel'] },
  { teks: 'Urutan penemuan yang benar: Robert Hooke mengamati sel gabus → ...', benar: 'Van Leeuwenhoek amati bakteri → Schleiden (tumbuhan) → Schwann (hewan) → Virchow', salah: ['Virchow dulu, baru Hooke', 'Schwann dulu, baru Schleiden', 'Mendel dulu, baru Hooke'] },
  { teks: 'Mikroskop optik pertama yang digunakan Robert Hooke menggunakan...', benar: 'Cahaya tampak dan lensa kaca', salah: ['Sinar elektron', 'Gelombang radio', 'Sinar ultraviolet'] },
  { teks: 'Spesimen (bahan pengamatan) yang digunakan Robert Hooke untuk menemukan sel adalah...', benar: 'Gabus (kulit kayu ek)', salah: ['Daun tumbuhan', 'Bakteri', 'Sel darah merah'] },
  { teks: 'Teori sel modern terdiri dari 3 prinsip. Yang BUKAN prinsip teori sel adalah...', benar: 'Sel dapat diciptakan dari bahan anorganik', salah: ['Semua makhluk hidup tersusun atas sel', 'Sel adalah unit dasar kehidupan', 'Semua sel berasal dari sel yang sudah ada'] },
  { teks: 'Ilmuwan yang mengembangkan mikroskop dengan perbesaran hingga 270× pada abad ke-17 adalah...', benar: 'Antonie van Leeuwenhoek', salah: ['Robert Hooke', 'Isaac Newton', 'Galileo Galilei'] },
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

export default function Ipa8B1T1Game({ onBack }) {
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
