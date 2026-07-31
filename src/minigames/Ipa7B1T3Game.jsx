import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#38bdf8'
const BG = 'linear-gradient(180deg, #030d1a 0%, #051a2d 100%)'
const TITLE = '🔬 Lab Measurement Simulator'

const SOAL = [
  { teks: 'Alat ukur yang paling tepat untuk mengukur diameter dalam sebuah pipa kecil adalah...', benar: 'Jangka sorong', salah: ['Mistar', 'Meteran', 'Mikrometer sekrup'] },
  { teks: 'Mikrometer sekrup digunakan untuk mengukur...', benar: 'Ketebalan benda yang sangat kecil (0,01 mm)', salah: ['Panjang jalan raya', 'Volume air', 'Massa batu'] },
  { teks: 'Bagian jangka sorong yang digeser saat mengukur disebut...', benar: 'Rahang geser (nonius)', salah: ['Skala utama', 'Baut pengunci', 'Penunjuk nol'] },
  { teks: 'Neraca Ohaus digunakan untuk mengukur...', benar: 'Massa benda', salah: ['Berat benda', 'Volume cairan', 'Panjang benda'] },
  { teks: 'Untuk mengukur volume cairan secara tepat di laboratorium, alat yang digunakan adalah...', benar: 'Gelas ukur', salah: ['Gelas biasa', 'Mangkuk', 'Sendok makan'] },
  { teks: 'Ketelitian jangka sorong adalah...', benar: '0,1 mm (0,01 cm)', salah: ['1 mm', '0,01 mm', '1 cm'] },
  { teks: 'Saat membaca skala pada gelas ukur, mata harus sejajar dengan...', benar: 'Meniskus bawah permukaan cairan', salah: ['Bagian atas gelas', 'Dasar gelas', 'Angka terdekat'] },
  { teks: 'Alat ukur yang tepat untuk mengukur tinggi badan siswa adalah...', benar: 'Meteran pita (cm)', salah: ['Jangka sorong', 'Mikrometer', 'Mistar 30 cm'] },
  { teks: 'Sebuah koin memiliki ketebalan sangat tipis. Alat ukur terbaik adalah...', benar: 'Mikrometer sekrup', salah: ['Mistar', 'Jangka sorong', 'Penggaris'] },
  { teks: 'Pada neraca Ohaus, massa benda ditentukan saat...', benar: 'Lengan neraca seimbang (jarum di nol)', salah: ['Beban paling berat digunakan', 'Neraca bergetar', 'Jarum menunjuk angka terbesar'] },
  { teks: 'Volume benda padat yang tidak beraturan dapat diukur dengan cara...', benar: 'Mencelupkan benda ke gelas ukur berisi air (mengukur kenaikan volumenya)', salah: ['Mengalikan panjang × lebar × tinggi', 'Menimbang massanya', 'Menggunakan jangka sorong'] },
  { teks: 'Satuan yang dihasilkan dari pembacaan jangka sorong adalah...', benar: 'Milimeter (mm) atau sentimeter (cm)', salah: ['Meter (m)', 'Kilometer (km)', 'Mikrometer (µm)'] },
]

const TOOL_ICONS = {
  'Jangka sorong': '🔩',
  'Mikrometer sekrup': '🔬',
  'Neraca Ohaus': '⚖️',
  'Gelas ukur': '🧪',
  'Meteran pita (cm)': '📏',
  'Mistar': '📐',
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
      <div style={{ background: 'rgba(56,189,248,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

export default function Ipa7B1T3Game({ onBack }) {
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

        {/* Lab visual */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          {['🔬', '⚖️', '🧪', '🔩', '📏'].map((icon, i) => (
            <div key={i} style={{ fontSize: 22, opacity: i === idx % 5 ? 1 : 0.3, transition: 'opacity 0.3s' }}>{icon}</div>
          ))}
        </div>

        {/* Question */}
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ALAT UKUR LABORATORIUM</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>
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
            const icon = Object.entries(TOOL_ICONS).find(([k]) => c.includes(k))?.[1] ?? '🔭'
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.4, transition: 'all 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span>{c}</span>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {selected !== null && (
          <FeedbackBanner
            message={isCorrect ? `✅ Tepat! ${q.benar}` : `❌ Salah! Jawaban: ${q.benar}`}
            isCorrect={isCorrect}
            extras={isCorrect ? '+15 Koin | +10 EXP' : ''}
          />
        )}
      </div>
    </div>
  )
}
