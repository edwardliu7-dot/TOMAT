import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#f97316'
const BG = 'linear-gradient(180deg, #1a0800 0%, #2d1000 100%)'
const TITLE = '🌡️ Thermometer Reader'

const SOAL = [
  { teks: 'Termometer bekerja berdasarkan prinsip...', benar: 'Pemuaian zat cair (raksa/alkohol) saat suhu naik', salah: ['Perubahan warna zat', 'Perubahan massa zat', 'Gaya gravitasi'] },
  { teks: 'Jenis termometer yang paling umum digunakan untuk mengukur suhu tubuh manusia adalah...', benar: 'Termometer klinis (air raksa/digital)', salah: ['Termometer ruangan', 'Termometer bimetal', 'Termometer gas'] },
  { teks: 'Mengapa air raksa dipilih sebagai pengisi termometer?', benar: 'Pemuaiannya merata, tidak menempel kaca, dan terlihat jelas', salah: ['Air raksa murah dan mudah didapat', 'Air raksa tidak berbahaya', 'Air raksa tidak bisa membeku'] },
  { teks: 'Termometer bimetal bekerja dengan memanfaatkan...', benar: 'Perbedaan pemuaian dua logam yang direkatkan', salah: ['Perubahan warna logam', 'Perubahan massa logam', 'Aliran listrik'] },
  { teks: 'Suhu normal tubuh manusia adalah sekitar...', benar: '36–37°C', salah: ['30–32°C', '38–40°C', '20–25°C'] },
  { teks: 'Termometer digital menggunakan sensor...', benar: 'Termistor atau thermocouple (sensor listrik)', salah: ['Air raksa cair', 'Gas nitrogen', 'Alkohol berwarna'] },
  { teks: 'Saat membaca termometer, mata harus diposisikan...', benar: 'Sejajar/tegak lurus dengan skala (menghindari parallax)', salah: ['Di atas skala', 'Di bawah skala', 'Posisi tidak berpengaruh'] },
  { teks: 'Termometer maksimum-minimum digunakan untuk mengukur...', benar: 'Suhu tertinggi dan terendah dalam periode waktu tertentu', salah: ['Suhu rata-rata', 'Suhu saat ini saja', 'Suhu benda padat'] },
  { teks: 'Alkohol digunakan dalam termometer untuk mengukur suhu...', benar: 'Sangat rendah (di bawah -39°C, titik beku raksa)', salah: ['Sangat tinggi di atas 200°C', 'Suhu tubuh manusia', 'Suhu dalam oven'] },
  { teks: 'Bagian termometer yang langsung menyentuh benda/zat yang diukur suhunya adalah...', benar: 'Reservoir/bulb (bagian bawah berisi zat cair)', salah: ['Skala angka', 'Bagian atas kapiler', 'Sumbat karet'] },
  { teks: 'Titik tetap bawah (0°C) pada termometer Celsius ditetapkan berdasarkan...', benar: 'Suhu es murni yang meleleh (campuran es dan air)', salah: ['Suhu air mendidih', 'Suhu ruangan normal', 'Suhu tubuh manusia'] },
  { teks: 'Termometer yang cocok untuk mengukur suhu dalam tungku peleburan baja adalah...', benar: 'Termometer termoelektrik (thermocouple)', salah: ['Termometer air raksa', 'Termometer alkohol', 'Termometer klinis'] },
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

export default function Ipa7B3T1Game({ onBack }) {
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
        {/* Thermometer visual */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
          {['🌡️ Klinis', '🔧 Bimetal', '💻 Digital'].map((t, i) => (
            <div key={i} style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>{t}</div>
          ))}
        </div>
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>TERMOMETER</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>{q.teks}</div>
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
