import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// ── Rumus konversi suhu ───────────────────────────────────────────────────────
// °C → °F : (C × 9/5) + 32
// °C → K  : C + 273
// °C → °R : C × 4/5
// °F → °C : (F − 32) × 5/9

// ── Data Soal ─────────────────────────────────────────────────────────────────

const KONVERSI_SOAL = [
  { soal: '100°C = ___ °F',  jawaban: 212, salah: [100, 180, 373]  },
  { soal: '0°C = ___ °F',    jawaban: 32,  salah: [0, 273, -32]    },
  { soal: '100°C = ___ K',   jawaban: 373, salah: [100, 273, 212]  },
  { soal: '0°C = ___ K',     jawaban: 273, salah: [0, 100, 373]    },
  { soal: '100°C = ___ °R',  jawaban: 80,  salah: [100, 125, 60]   },
  { soal: '40°C = ___ °R',   jawaban: 32,  salah: [40, 50, 36]     },
  { soal: '37°C = ___ K',    jawaban: 310, salah: [273, 237, 37]   },
  { soal: '212°F = ___ °C',  jawaban: 100, salah: [212, 180, 120]  },
  { soal: '32°F = ___ °C',   jawaban: 0,   salah: [32, -32, 100]   },
  { soal: '60°C = ___ °F',   jawaban: 140, salah: [100, 160, 120]  },
  { soal: '25°C = ___ K',    jawaban: 298, salah: [248, 273, 325]  },
  { soal: '20°C = ___ °R',   jawaban: 16,  salah: [20, 25, 24]     },
]

const PEMUAIAN_SOAL = [
  {
    soal: 'Kabel listrik di luar ruangan tampak lebih kendur di siang hari dibanding malam hari. Fenomena ini disebut pemuaian...',
    jawaban: 'Zat Padat (panjang)', salah: ['Zat Cair', 'Zat Gas', 'Zat Padat (volume)'],
  },
  {
    soal: 'Balon gas yang diisi penuh lalu diletakkan di tempat panas akan mengembang dan bisa meletus. Ini contoh pemuaian...',
    jawaban: 'Zat Gas', salah: ['Zat Padat', 'Zat Cair', 'Pemuaian termal'],
  },
  {
    soal: 'Sambungan rel kereta api diberi celah kecil antar logam. Tujuannya adalah untuk...',
    jawaban: 'Memberi ruang pemuaian agar rel tidak bengkok', salah: ['Menghemat bahan logam', 'Memperkuat sambungan', 'Mencegah korosi'],
  },
  {
    soal: 'Termometer bekerja berdasarkan prinsip pemuaian...',
    jawaban: 'Zat Cair (raksa/alkohol)', salah: ['Zat Padat', 'Zat Gas', 'Pemuaian udara'],
  },
  {
    soal: 'Zat yang memuai paling besar untuk kenaikan suhu yang sama adalah...',
    jawaban: 'Gas', salah: ['Padat', 'Cair', 'Semua sama'],
  },
  {
    soal: 'Botol kaca berisi air penuh, lalu dipanaskan. Kemungkinan yang terjadi adalah...',
    jawaban: 'Botol bisa pecah karena air memuai lebih cepat dari kaca', salah: ['Air menyusut karena panas', 'Tidak terjadi apa-apa', 'Kaca memuai lebih cepat dari air'],
  },
  {
    soal: 'Ban mobil bisa kempes di cuaca sangat dingin. Ini karena...',
    jawaban: 'Gas di dalam ban menyusut (berkurang volume) saat dingin', salah: ['Ban bocor karena suhu rendah', 'Karet mengembang saat dingin', 'Tekanan ban tidak berubah'],
  },
  {
    soal: 'Perbedaan pemuaian panjang dan pemuaian volume adalah...',
    jawaban: 'Pemuaian panjang untuk 1 dimensi, volume untuk 3 dimensi', salah: ['Tidak ada perbedaan', 'Pemuaian volume hanya untuk gas', 'Pemuaian panjang hanya untuk cair'],
  },
]

const KALOR_SOAL = [
  { fenomena: 'Ujung sendok logam menjadi panas saat dicelupkan ke dalam sup panas. 🥄🔥', jawaban: 'Konduksi',  salah: ['Konveksi', 'Radiasi', 'Evaporasi'] },
  { fenomena: 'Air di panci dipanaskan — air di bawah naik ke atas dan yang di atas turun membentuk arus. 🫕',   jawaban: 'Konveksi',  salah: ['Konduksi', 'Radiasi', 'Konduksi & Radiasi'] },
  { fenomena: 'Kita merasakan hangat dari sinar matahari meskipun tidak menyentuh matahari. ☀️',               jawaban: 'Radiasi',   salah: ['Konduksi', 'Konveksi', 'Induksi'] },
  { fenomena: 'Api unggun menghangatkan orang yang berdiri di dekatnya tanpa harus menyentuh api. 🔥',          jawaban: 'Radiasi',   salah: ['Konduksi', 'Konveksi', 'Evaporasi'] },
  { fenomena: 'Angin laut terjadi karena udara di atas daratan yang panas naik, digantikan udara dari laut. 🌊', jawaban: 'Konveksi', salah: ['Konduksi', 'Radiasi', 'Adveksi'] },
  { fenomena: 'Setrika menghangatkan pakaian dengan cara menempel langsung pada kain. 👔',                       jawaban: 'Konduksi',  salah: ['Konveksi', 'Radiasi', 'Induksi'] },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSession() {
  // 4 konversi + 3 pemuaian + 3 kalor = 10
  const konversi = shuffle(KONVERSI_SOAL).slice(0, 4).map(q => ({
    mode: 'A',
    teks: q.soal,
    benar: String(q.jawaban),
    pilihan: shuffle([q.jawaban, ...q.salah]).map(String),
  }))
  const pemuaian = shuffle(PEMUAIAN_SOAL).slice(0, 3).map(q => ({
    mode: 'B',
    teks: q.soal,
    benar: q.jawaban,
    pilihan: shuffle([q.jawaban, ...q.salah]),
  }))
  const kalor = shuffle(KALOR_SOAL).slice(0, 3).map(q => ({
    mode: 'C',
    teks: q.fenomena,
    benar: q.jawaban,
    pilihan: shuffle([q.jawaban, ...q.salah]),
  }))
  return shuffle([...konversi, ...pemuaian, ...kalor])
}

const MODE_META = {
  A: { label: '🌡️ Konversi Suhu',       color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  B: { label: '📏 Pemuaian Zat',         color: '#facc15', bg: 'rgba(250,204,21,0.12)'  },
  C: { label: '🔥 Perpindahan Kalor',    color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'   },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Ipa7SuhuGame({ onBack }) {
  const { addReward }          = usePlayer()
  const { onCorrect, onWrong } = useSurvival()

  const [session]               = useState(() => buildSession())
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected]  = useState(null)
  const [feedback, setFeedback]  = useState(null)
  const [score, setScore]        = useState(0)
  const [done, setDone]          = useState(false)

  const q = session[idx]

  const advance = useCallback(() => {
    if (idx + 1 >= session.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setFeedback(null)
    }
  }, [idx, session.length])

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
    setTimeout(advance, 1300)
  }, [feedback, q, advance, addReward, onCorrect, onWrong])

  // ── Done screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1c0a00 0%,#431407 100%)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="🌡️ Thermal Control Center" onBack={onBack} accentColor="#f97316" />
        <PlayerHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Card style={{ textAlign: 'center', padding: 32, maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f97316', marginBottom: 4 }}>Sesi Selesai!</div>
            <div style={{ fontSize: 15, color: '#94A3B8', marginBottom: 20 }}>Nilaimu hari ini</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score}<span style={{ fontSize: 24, color: '#94A3B8' }}>/10</span>
            </div>
            <div style={{ fontSize: 14, color: '#FBBF24', marginBottom: 28 }}>+{score * 15} koin didapat 🪙</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
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

  const meta = MODE_META[q.mode]

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1c0a00 0%,#431407 100%)' }}>
      <TopBar title="🌡️ Thermal Control Center" onBack={onBack} accentColor="#f97316" />
      <PlayerHeader />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520, margin: '0 auto' }}>

        <Card border="rgba(249,115,22,0.35)">
          {/* Mode label + Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: meta.color, background: meta.bg, padding: '3px 10px', borderRadius: 20 }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{idx + 1} / {session.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
            <div style={{ height: 4, width: `${((idx + 1) / session.length) * 100}%`, background: '#f97316', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>

          {/* Question */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              fontSize: q.mode === 'A' ? 26 : 15,
              fontWeight: q.mode === 'A' ? 800 : 600,
              color: '#F1F5F9',
              lineHeight: 1.6,
            }}>
              {q.teks}
            </div>
          </div>

          {/* 2×2 Answer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {q.pilihan.map((opt) => {
              const isCorrect = feedback !== null && opt === q.benar
              const isWrong   = feedback !== null && selected === opt && opt !== q.benar
              let bg     = 'rgba(255,255,255,0.06)'
              let border = '1.5px solid rgba(255,255,255,0.1)'
              let color  = '#F1F5F9'
              if (isCorrect) { bg = '#431407'; border = '1.5px solid #f97316'; color = '#fb923c' }
              if (isWrong)   { bg = '#450a0a'; border = '1.5px solid #ef4444'; color = '#ef4444' }
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={feedback !== null}
                  style={{
                    padding: '13px 10px', background: bg, border, borderRadius: 12,
                    color, fontWeight: 600, fontSize: 13,
                    cursor: feedback !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s', lineHeight: 1.3, textAlign: 'center',
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
