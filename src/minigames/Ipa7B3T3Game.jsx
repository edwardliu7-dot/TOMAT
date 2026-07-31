import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#dc2626'
const BG = 'linear-gradient(180deg, #1a0000 0%, #2d0808 100%)'
const TITLE = '🔩 Thermal Expansion Builder'

const SOAL = [
  { teks: 'Urutan zat dari pemuaian TERKECIL ke TERBESAR saat dipanaskan adalah...', benar: 'Padat → Cair → Gas', salah: ['Gas → Cair → Padat', 'Cair → Padat → Gas', 'Semuanya sama'] },
  { teks: 'Sambungan rel kereta api diberi celah kecil agar...', benar: 'Rel punya ruang untuk memuai saat panas dan tidak bengkok', salah: ['Air hujan bisa meresap', 'Rel lebih mudah dipasang', 'Mengurangi gesekan roda'] },
  { teks: 'Kawat listrik tampak lebih kendur di siang hari karena...', benar: 'Kawat memuai saat suhu tinggi sehingga panjangnya bertambah', salah: ['Kawat meleleh di siang hari', 'Gravitasi lebih kuat di siang hari', 'Angin menyebabkan kawat kendur'] },
  { teks: 'Botol kaca berisi air penuh lalu dipanaskan bisa pecah karena...', benar: 'Air memuai lebih besar dari kaca, tekanan meningkat', salah: ['Kaca memuai lebih cepat', 'Udara masuk ke botol', 'Suhu terlalu rendah'] },
  { teks: 'Ban mobil bisa kempes di cuaca sangat dingin karena...', benar: 'Udara dalam ban menyusut saat dingin, tekanan berkurang', salah: ['Karet ban mengembang saat dingin', 'Udara keluar melewati karet', 'Gravitasi menarik ban ke bawah'] },
  { teks: 'Termometer memanfaatkan prinsip pemuaian...', benar: 'Zat cair (raksa atau alkohol)', salah: ['Zat padat (logam)', 'Gas nitrogen', 'Pemuaian ruang hampa'] },
  { teks: 'Pemuaian panjang (linear) terjadi pada benda...', benar: 'Padat dengan satu dimensi dominan (kawat/rel)', salah: ['Zat cair', 'Gas dalam balon', 'Udara panas'] },
  { teks: 'Balon udara panas bisa terbang karena...', benar: 'Udara panas di dalam balon memuai dan menjadi lebih ringan dari udara di luar', salah: ['Balon dibuat dari bahan ringan', 'Gas di dalam balon bertambah banyak', 'Api di bawah mendorong balon ke atas'] },
  { teks: 'Keping bimetal melengkung saat dipanaskan karena...', benar: 'Dua logam memiliki koefisien muai yang berbeda', salah: ['Logam meleleh', 'Tekanan udara berubah', 'Salah satu logam lebih berat'] },
  { teks: 'Aplikasi keping bimetal dalam kehidupan sehari-hari adalah...', benar: 'Termostat (pengatur suhu otomatis)', salah: ['Termometer air raksa', 'Rel kereta api', 'Gelas ukur laboratorium'] },
  { teks: 'Pemasangan kaca jendela sengaja dibuat sedikit lebih kecil dari bingkainya agar...', benar: 'Ada ruang untuk pemuaian kaca saat panas', salah: ['Kaca mudah dibuka', 'Mengurangi biaya', 'Agar cahaya bisa masuk'] },
  { teks: 'Pemuaian volume (kubik) terutama terjadi pada...', benar: 'Zat padat tiga dimensi, zat cair, dan gas', salah: ['Hanya gas', 'Hanya zat cair', 'Hanya benda panjang'] },
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

export default function Ipa7B3T3Game({ onBack }) {
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

  const EXAMPLES = ['🚂 rel kereta', '🔌 kawat', '🌡️ termometer', '🎈 balon', '🪟 kaca']

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
        {/* Expansion scale visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          {['🪨 Padat\n(kecil)', '→', '💧 Cair\n(sedang)', '→', '💨 Gas\n(besar)'].map((t, i) => (
            i % 2 === 1
              ? <div key={i} style={{ color: ACCENT, fontWeight: 900, fontSize: 16 }}>→</div>
              : <div key={i} style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>{t}</div>
          ))}
        </div>
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PEMUAIAN ZAT</div>
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
