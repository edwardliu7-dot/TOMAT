import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

const ACCENT = '#16a34a'
const BG = 'linear-gradient(180deg, #021008 0%, #041a10 100%)'
const TITLE = '🛡️ Say No Challenge'

const SOAL = [
  { teks: 'Cara paling efektif menolak tawaran narkoba dari teman adalah...', benar: 'Tegas berkata tidak, pergi dari situasi tersebut, tidak perlu menjelaskan panjang lebar', salah: ['Mencoba dulu sedikit agar tidak dianggap pengecut', 'Diam saja dan tidak berreaksi', 'Menerima agar tidak kehilangan teman'] },
  { teks: 'Lingkungan yang PALING berpengaruh dalam mencegah penggunaan narkoba remaja adalah...', benar: 'Keluarga yang hangat dan komunikatif, serta teman sebaya yang positif', salah: ['Uang yang banyak', 'Tinggal di kota besar', 'Sekolah swasta yang mahal'] },
  { teks: 'Kegiatan positif yang efektif mengalihkan dari narkoba adalah...', benar: 'Olahraga, seni, organisasi, dan kegiatan keagamaan', salah: ['Bermain game online terus-menerus', 'Tidur sepanjang hari', 'Mengurung diri di kamar'] },
  { teks: 'Seseorang yang melihat temannya menggunakan narkoba sebaiknya...', benar: 'Melaporkan kepada orang tua, guru, atau pihak berwenang dengan penuh kasih, bukan menghakimi', salah: ['Diam saja dan tidak ikut campur', 'Ikut mencoba agar diajak bergaul', 'Langsung memutus pertemanan tanpa memberi bantuan'] },
  { teks: 'Pengetahuan tentang bahaya narkoba sebaiknya diajarkan sejak...', benar: 'Dini (usia anak-anak hingga remaja) sebelum ada kesempatan terpapar', salah: ['Hanya setelah dewasa', 'Setelah seseorang mencoba narkoba', 'Tidak perlu diajarkan karena sudah otomatis tahu'] },
  { teks: 'Kepercayaan diri yang tinggi dapat melindungi dari narkoba karena...', benar: 'Seseorang yang percaya diri tidak membutuhkan persetujuan orang lain untuk merasa baik', salah: ['Orang percaya diri lebih suka tantangan berbahaya', 'Percaya diri membuat kebal terhadap tekanan teman', 'Tidak ada kaitan antara percaya diri dan narkoba'] },
  { teks: 'Lembaga yang bertugas melakukan rehabilitasi pengguna narkoba di Indonesia adalah...', benar: 'BNN (Badan Narkotika Nasional) dan rumah sakit/klinik rehabilitasi', salah: ['Komnas HAM', 'KPK (Komisi Pemberantasan Korupsi)', 'BPOM saja'] },
  { teks: 'Mengapa "coba-coba" sekali saja sudah berbahaya?', benar: 'Beberapa zat (heroin, shabu) dapat menyebabkan ketergantungan bahkan setelah penggunaan pertama', salah: ['Sekali tidak ada efek sama sekali', 'Ketergantungan butuh ratusan kali penggunaan', 'Hanya berbahaya jika sering digunakan'] },
  { teks: 'Tekanan teman sebaya (peer pressure) untuk mencoba narkoba paling efektif dilawan dengan...', benar: 'Memilih teman yang tepat dan memiliki nilai/prinsip yang kuat sejak awal', salah: ['Menghindari semua teman', 'Selalu membawa orang tua ke mana-mana', 'Tidak pernah bergaul sama sekali'] },
  { teks: 'Manfaat utama program anti-narkoba di sekolah adalah...', benar: 'Memberikan pengetahuan, keterampilan menolak, dan menciptakan lingkungan sekolah bebas narkoba', salah: ['Membuat siswa takut terhadap semua obat', 'Hanya formalitas tanpa manfaat nyata', 'Membuat siswa lebih penasaran'] },
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

export default function Ipa9B2T6Game({ onBack }) {
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
