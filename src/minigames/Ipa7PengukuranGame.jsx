import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// ── Data Soal ───────────────────────────────────────────────────────────────

const ALAT_UKUR_SOAL = [
  { soal: 'Panjang meja 📏',                  benar: 'Mistar',        salah: ['Jangka sorong', 'Neraca', 'Gelas ukur'] },
  { soal: 'Diameter koin logam 🪙',            benar: 'Jangka sorong', salah: ['Mistar', 'Stopwatch', 'Gelas ukur'] },
  { soal: 'Massa apel 🍎',                     benar: 'Neraca',        salah: ['Mistar', 'Termometer', 'Stopwatch'] },
  { soal: 'Volume air dalam botol 💧',         benar: 'Gelas ukur',    salah: ['Neraca', 'Mistar', 'Jangka sorong'] },
  { soal: 'Waktu lari 100 meter ⏱️',           benar: 'Stopwatch',     salah: ['Termometer', 'Neraca', 'Gelas ukur'] },
  { soal: 'Suhu air panas 🌡️',                benar: 'Termometer',    salah: ['Mistar', 'Stopwatch', 'Neraca'] },
  { soal: 'Ketebalan buku 📚',                 benar: 'Jangka sorong', salah: ['Gelas ukur', 'Stopwatch', 'Termometer'] },
  { soal: 'Massa emas perhiasan 💍',           benar: 'Neraca',        salah: ['Mistar', 'Gelas ukur', 'Termometer'] },
  { soal: 'Volume batu kecil (metode celup) 🪨', benar: 'Gelas ukur', salah: ['Neraca', 'Mistar', 'Stopwatch'] },
  { soal: 'Panjang lapangan basket 🏀',        benar: 'Mistar (meteran)', salah: ['Jangka sorong', 'Neraca', 'Termometer'] },
]

const KONVERSI_SOAL = [
  { soal: '5 km = ___ m',        benar: 5000,   salah: [500, 50000, 0.005] },
  { soal: '250 cm = ___ m',      benar: 2.5,    salah: [25, 0.25, 2500] },
  { soal: '3000 mm = ___ m',     benar: 3,      salah: [30, 300, 0.3] },
  { soal: '2 kg = ___ gram',     benar: 2000,   salah: [200, 20000, 0.002] },
  { soal: '750 gram = ___ kg',   benar: 0.75,   salah: [75, 7.5, 7500] },
  { soal: '1 jam = ___ menit',   benar: 60,     salah: [24, 100, 360] },
  { soal: '180 menit = ___ jam', benar: 3,      salah: [1.8, 18, 0.3] },
  { soal: '2 jam = ___ detik',   benar: 7200,   salah: [720, 120, 3600] },
  { soal: '1 L = ___ mL',        benar: 1000,   salah: [100, 10000, 0.1] },
  { soal: '500 mL = ___ L',      benar: 0.5,    salah: [5, 50, 5000] },
  { soal: '4500 m = ___ km',     benar: 4.5,    salah: [45, 450, 0.45] },
  { soal: '1500 gram = ___ kg',  benar: 1.5,    salah: [15, 150, 0.15] },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a session of 10 questions: 5 Mode A + 5 Mode B, shuffled
function buildSession() {
  const poolA = shuffle(ALAT_UKUR_SOAL).slice(0, 5).map(q => ({
    mode: 'A',
    soal: `Alat ukur apa yang paling tepat untuk mengukur "${q.soal}"?`,
    benar: q.benar,
    pilihan: shuffle([q.benar, ...q.salah]),
  }))
  const poolB = shuffle(KONVERSI_SOAL).slice(0, 5).map(q => ({
    mode: 'B',
    soal: q.soal,
    benar: String(q.benar),
    pilihan: shuffle([q.benar, ...q.salah]).map(String),
  }))
  return shuffle([...poolA, ...poolB])
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Ipa7PengukuranGame({ onBack }) {
  const { addReward } = usePlayer()
  const { onCorrect, onWrong } = useSurvival()

  const [session]   = useState(() => buildSession())
  const [idx, setIdx]          = useState(0)
  const [selected, setSelected] = useState(null)   // chosen option string
  const [feedback, setFeedback] = useState(null)   // null | true | false
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)

  const q = session[idx]

  const handleSelect = useCallback((opt) => {
    if (feedback !== null) return
    const isCorrect = opt === q.benar
    setSelected(opt)
    setFeedback(isCorrect)
    if (isCorrect) {
      addReward({ coins: 15, exp: 10 })
      onCorrect()
      setScore(s => s + 1)
    } else {
      onWrong()
    }
    // Auto-advance after 1.2s
    setTimeout(() => {
      if (idx + 1 >= session.length) {
        setDone(true)
      } else {
        setIdx(i => i + 1)
        setSelected(null)
        setFeedback(null)
      }
    }, 1200)
  }, [feedback, q, idx, session.length, addReward, onCorrect, onWrong])

  const handleRestart = () => {
    // rebuild session
    window.location.reload()
  }

  // ── Done screen ─────────────────────────────────────────────────────────
  if (done) {
    const coins = score * 15
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#052e16 0%,#14532d 100%)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="📏 Precision Measurement Lab" onBack={onBack} accentColor="#22c55e" />
        <PlayerHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Card style={{ textAlign: 'center', padding: 32, maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>Sesi Selesai!</div>
            <div style={{ fontSize: 15, color: '#94A3B8', marginBottom: 20 }}>Nilaimu hari ini</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{score}<span style={{ fontSize: 24, color: '#94A3B8' }}>/10</span></div>
            <div style={{ fontSize: 14, color: '#FBBF24', marginBottom: 28 }}>+{coins} koin didapat 🪙</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleRestart}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Main Lagi 🔄
              </button>
              <button
                onClick={onBack}
                style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.08)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Kembali
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ── Game screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#052e16 0%,#14532d 100%)' }}>
      <TopBar title="📏 Precision Measurement Lab" onBack={onBack} accentColor="#22c55e" />
      <PlayerHeader />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520, margin: '0 auto' }}>

        <Card border="rgba(34,197,94,0.35)">
          {/* Mode label + Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              color: q.mode === 'A' ? '#22c55e' : '#38bdf8',
              background: q.mode === 'A' ? 'rgba(34,197,94,0.12)' : 'rgba(56,189,248,0.12)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {q.mode === 'A' ? '🔧 Mode: Pilih Alat Ukur' : '🔢 Mode: Konversi Satuan'}
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
              {idx + 1} / {session.length}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
            <div style={{ height: 4, width: `${((idx + 1) / session.length) * 100}%`, background: '#22c55e', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>

          {/* Question text */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {q.mode === 'A' && <div style={{ fontSize: 32, marginBottom: 8 }}>🔬</div>}
            <div style={{
              fontSize: q.mode === 'B' ? 26 : 16,
              fontWeight: q.mode === 'B' ? 800 : 600,
              color: '#F1F5F9',
              lineHeight: 1.5,
            }}>
              {q.soal}
            </div>
          </div>

          {/* 2×2 Answer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {q.pilihan.map((opt) => {
              const isSelected = selected === opt
              const isCorrect  = feedback !== null && opt === q.benar
              const isWrong    = feedback !== null && isSelected && opt !== q.benar

              let bg     = 'rgba(255,255,255,0.06)'
              let border = '1.5px solid rgba(255,255,255,0.1)'
              let color  = '#F1F5F9'
              if (isCorrect) { bg = '#14532d'; border = '1.5px solid #22c55e'; color = '#22c55e' }
              if (isWrong)   { bg = '#450a0a'; border = '1.5px solid #ef4444'; color = '#ef4444' }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={feedback !== null}
                  style={{
                    padding: '14px 10px',
                    background: bg,
                    border,
                    borderRadius: 12,
                    color,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: feedback !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </Card>

        {feedback !== null && (
          <FeedbackBanner
            isCorrect={feedback}
            message={feedback ? '✅ Benar!' : `❌ Salah! Jawaban: ${q.benar}`}
          />
        )}
      </div>
    </div>
  )
}
