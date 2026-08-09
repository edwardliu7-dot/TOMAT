import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

const ACCENT = '#16a34a'
const BG = 'linear-gradient(180deg, #021008 0%, #041a10 100%)'
const TITLE = '🏃 Healthy Habit Choice'

const SOAL = [
  { teks: 'Kebiasaan yang paling merusak sistem pernapasan adalah...', benar: 'Merokok', salah: ['Olahraga berlebihan', 'Minum air putih banyak', 'Tidur cukup'] },
  { teks: 'Cara menjaga kesehatan paru-paru yang benar adalah...', benar: 'Tidak merokok, olahraga teratur, hindari polusi udara', salah: ['Menghirup uap menthol setiap hari', 'Minum banyak kopi', 'Menghindari semua aktivitas fisik'] },
  { teks: 'Minum air putih yang cukup (2 liter/hari) bermanfaat bagi ginjal karena...', benar: 'Melancarkan pembentukan urin dan mencegah batu ginjal', salah: ['Meningkatkan tekanan darah', 'Membuat ginjal bekerja lebih keras', 'Mengurangi produksi urin'] },
  { teks: 'Pola makan yang baik untuk kesehatan ginjal adalah...', benar: 'Kurangi garam berlebih, hindari makanan tinggi oksalat, cukup protein', salah: ['Makan daging sebanyak-banyaknya', 'Hindari semua buah dan sayuran', 'Konsumsi suplemen kalsium dosis tinggi tanpa saran dokter'] },
  { teks: 'Penggunaan masker saat berada di tempat berpolusi bermanfaat untuk...', benar: 'Menyaring partikel debu dan polutan sebelum masuk ke saluran napas', salah: ['Menghasilkan oksigen ekstra', 'Meningkatkan kapasitas paru-paru', 'Mengurangi produksi CO₂'] },
  { teks: 'Olahraga aerobik rutin bermanfaat bagi sistem pernapasan karena...', benar: 'Melatih kapasitas paru-paru dan efisiensi pertukaran gas', salah: ['Mengurangi jumlah alveolus', 'Membuat pernapasan lebih lambat saat istirahat', 'Meningkatkan produksi lendir'] },
  { teks: 'Kebiasaan buruk yang dapat merusak ginjal dalam jangka panjang adalah...', benar: 'Sering menahan kencing, konsumsi obat pereda nyeri berlebihan, minum sedikit air', salah: ['Olahraga lari pagi', 'Makan sayuran hijau', 'Tidur miring ke kanan'] },
  { teks: 'Efek langsung merokok pada sistem pernapasan adalah...', benar: 'Kerusakan silia, produksi lendir berlebih, penyempitan bronkus', salah: ['Meningkatkan kapasitas paru-paru', 'Memperkuat diafragma', 'Mengurangi produksi CO₂'] },
  { teks: 'Mengonsumsi makanan tinggi antioksidan (buah beri, sayuran hijau) bermanfaat karena...', benar: 'Melindungi sel-sel organ dari kerusakan akibat radikal bebas', salah: ['Langsung membunuh bakteri di paru-paru', 'Menggantikan fungsi ginjal', 'Meningkatkan produksi urin'] },
  { teks: 'Tidur yang cukup (7–9 jam) penting untuk sistem ekskresi karena...', benar: 'Tubuh melakukan perbaikan sel dan detoksifikasi saat tidur', salah: ['Ginjal berhenti bekerja saat tidur', 'Produksi urin meningkat saat tidur', 'Hati tidak aktif saat tidur'] },
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

export default function Ipa8B3T7Game({ onBack }) {
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
              if (c === q.benar) { bg = '#16a34a20'; border = '1.5px solid #16a34a'; color = '#86efac' }
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
