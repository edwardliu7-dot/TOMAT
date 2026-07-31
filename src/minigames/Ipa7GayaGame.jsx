import React, { useState, useCallback, useMemo } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// ── Rumus Penting ─────────────────────────────────────────────────────────────
// Resultan gaya searah    : R = F1 + F2
// Resultan gaya berlawanan: R = F1 − F2  (arah mengikuti gaya terbesar)
// Kelajuan  : v = s / t  (skalar, tanpa arah)
// Kecepatan : v = perpindahan / t  (vektor, ada arah)
// Hukum II  : F = m × a

// ── Data Soal ─────────────────────────────────────────────────────────────────

const RESULTAN_SOAL = [
  { teks: 'Dua gaya searah: F1 = 30 N ke kanan, F2 = 20 N ke kanan. Resultan gaya = ?', benar: '50 N ke kanan', salah: ['10 N ke kanan', '50 N ke kiri', '600 N'] },
  { teks: 'Dua gaya berlawanan: F1 = 40 N ke kanan, F2 = 15 N ke kiri. Resultan = ?', benar: '25 N ke kanan', salah: ['55 N ke kanan', '25 N ke kiri', '40 N'] },
  { teks: 'F1 = 50 N ke atas, F2 = 50 N ke bawah. Resultan gaya = ?', benar: '0 N (benda diam)', salah: ['100 N ke atas', '100 N ke bawah', '50 N'] },
  { teks: 'Benda didorong 3 orang ke kanan: 20 N, 25 N, dan 15 N. Resultan = ?', benar: '60 N ke kanan', salah: ['20 N', '45 N', '60 N ke kiri'] },
  { teks: 'F1 = 70 N ke kiri, F2 = 30 N ke kanan. Resultan = ?', benar: '40 N ke kiri', salah: ['40 N ke kanan', '100 N ke kiri', '70 N'] },
  { teks: 'Benda bermassa 5 kg mendapat gaya 20 N. Percepatannya = ? (F = ma)', benar: '4 m/s²', salah: ['25 m/s²', '100 m/s²', '2 m/s²'] },
  { teks: 'Benda bermassa 10 kg mendapat percepatan 3 m/s². Gaya yang bekerja = ?', benar: '30 N', salah: ['13 N', '3 N', '300 N'] },
  { teks: 'Dua gaya berlawanan: F1 = 100 N, F2 = 60 N. Resultan mengikuti arah...', benar: 'F1 (100 N), resultan = 40 N arah F1', salah: ['F2, resultan = 40 N', 'Tidak ada resultan', 'Resultan = 160 N'] },
]

const NEWTON_SOAL = [
  { teks: 'Penumpang terdorong ke depan saat bus tiba-tiba direm. 🚌', benar: 'Hukum Newton I (Inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { teks: 'Roket meluncur ke atas karena gas menyembur ke bawah dengan kuat. 🚀', benar: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Hukum Gravitasi'] },
  { teks: 'Truk bermuatan berat butuh gaya lebih besar dari motor untuk percepatan yang sama. 🚛', benar: 'Hukum Newton II (F = ma)', salah: ['Hukum Newton I', 'Hukum Newton III', 'Hukum Gesek'] },
  { teks: 'Bola menggelinding di lantai licin akan terus bergerak tanpa berhenti. 🎱', benar: 'Hukum Newton I (Inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gesek'] },
  { teks: 'Saat berenang, tangan mendorong air ke belakang sehingga badan maju ke depan. 🏊', benar: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gaya Apung'] },
  { teks: 'Makin besar gaya pada benda, makin besar percepatannya (massa tetap). 💪', benar: 'Hukum Newton II (F = ma)', salah: ['Hukum Newton I', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { teks: 'Buku diam di atas meja karena gaya gravitasi dan gaya normal seimbang. 📚', benar: 'Hukum Newton I (Inersia/kesetimbangan)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Gaya Gesek'] },
  { teks: 'Pistol bergerak mundur (recoil) saat peluru ditembakkan ke depan. 🔫', benar: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Hukum Inersia'] },
]

const GERAK_SOAL = [
  { teks: 'Andi berlari mengelilingi lapangan 400 m lalu kembali ke titik start. Perpindahannya = ?', benar: '0 m (kembali ke titik awal)', salah: ['400 m', '800 m', '200 m'] },
  { teks: 'Mobil menempuh jarak 150 km dalam 3 jam. Kelajuannya = ?', benar: '50 km/jam', salah: ['450 km/jam', '0,5 km/jam', '153 km/jam'] },
  { teks: 'Perbedaan kelajuan dan kecepatan adalah...', benar: 'Kelajuan skalar (tanpa arah), kecepatan vektor (ada arah)', salah: ['Tidak ada perbedaan', 'Kecepatan selalu lebih besar', 'Kelajuan punya arah, kecepatan tidak'] },
  { teks: 'Benda bergerak lurus dengan kecepatan tetap 10 m/s. Jenis geraknya adalah...', benar: 'GLB (Gerak Lurus Beraturan)', salah: ['GLBB dipercepat', 'GLBB diperlambat', 'Gerak melingkar'] },
  { teks: 'Motor dari keadaan diam lalu bergerak makin cepat di jalan lurus. Jenis geraknya adalah...', benar: 'GLBB dipercepat', salah: ['GLB', 'GLBB diperlambat', 'Gerak parabola'] },
  { teks: 'Sepeda mengerem dan melambat hingga berhenti. Jenis geraknya adalah...', benar: 'GLBB diperlambat', salah: ['GLB', 'GLBB dipercepat', 'Gerak harmonik'] },
]

const MODE_META = {
  A: { label: 'Resultan Gaya',    color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  B: { label: 'Hukum Newton',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  C: { label: 'Konsep Gerak',     color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
}

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
  // Ambil ~4 dari A, ~3 dari B, ~3 dari C → total 10
  const fromA = shuffle(RESULTAN_SOAL).slice(0, 4).map(s => ({ ...s, mode: 'A', pilihan: shuffle([s.benar, ...s.salah]) }))
  const fromB = shuffle(NEWTON_SOAL).slice(0, 3).map(s => ({ ...s, mode: 'B', pilihan: shuffle([s.benar, ...s.salah]) }))
  const fromC = shuffle(GERAK_SOAL).slice(0, 3).map(s => ({ ...s, mode: 'C', pilihan: shuffle([s.benar, ...s.salah]) }))
  return shuffle([...fromA, ...fromB, ...fromC])
}

// ── Komponen Utama ────────────────────────────────────────────────────────────

export default function Ipa7GayaGame({ onBack }) {
  const { addReward } = usePlayer()
  const { onCorrect, onWrong } = useSurvival()

  const [session]  = useState(() => buildSession())
  const [idx,      setIdx]      = useState(0)
  const [score,    setScore]    = useState(0)
  const [feedback, setFeedback] = useState(null)   // null | true | false
  const [selected, setSelected] = useState(null)
  const [done,     setDone]     = useState(false)

  const q = session[idx]

  const advance = useCallback(() => {
    setFeedback(null)
    setSelected(null)
    if (idx + 1 >= session.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
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

  // ── Layar Selesai ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a0a1a 0%,#1a1040 100%)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="⚡ Physics Arena" onBack={onBack} accentColor="#facc15" />
        <PlayerHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Card style={{ textAlign: 'center', padding: 32, maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#facc15', marginBottom: 4 }}>Sesi Selesai!</div>
            <div style={{ fontSize: 15, color: '#94A3B8', marginBottom: 20 }}>Nilaimu hari ini</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score}<span style={{ fontSize: 24, color: '#94A3B8' }}>/10</span>
            </div>
            <div style={{ fontSize: 14, color: '#FBBF24', marginBottom: 28 }}>+{score * 15} koin didapat 🪙</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#facc15,#d97706)', color: '#0a0a00', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
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

  // ── Layar Game ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a0a1a 0%,#1a1040 100%)' }}>
      <TopBar title="⚡ Physics Arena" onBack={onBack} accentColor="#facc15" />
      <PlayerHeader />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520, margin: '0 auto' }}>

        <Card border="rgba(250,204,21,0.3)">
          {/* Label mode + Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: meta.color, background: meta.bg, padding: '3px 10px', borderRadius: 20 }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{idx + 1} / {session.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
            <div style={{ height: 4, width: `${((idx + 1) / session.length) * 100}%`, background: '#facc15', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>

          {/* Soal */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.7 }}>
              {q.teks}
            </div>
          </div>

          {/* Grid 2×2 pilihan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {q.pilihan.map((opt) => {
              const isCorrect = feedback !== null && opt === q.benar
              const isWrong   = feedback !== null && selected === opt && opt !== q.benar
              let bg     = 'rgba(255,255,255,0.06)'
              let border = '1.5px solid rgba(255,255,255,0.1)'
              let color  = '#F1F5F9'
              if (isCorrect) { bg = 'rgba(52,211,153,0.12)'; border = '1.5px solid #34d399'; color = '#34d399' }
              if (isWrong)   { bg = 'rgba(239,68,68,0.12)';  border = '1.5px solid #ef4444'; color = '#ef4444' }
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={feedback !== null}
                  style={{
                    padding: '13px 10px', background: bg, border, borderRadius: 12,
                    color, fontWeight: 600, fontSize: 12,
                    cursor: feedback !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s', lineHeight: 1.4, textAlign: 'center',
                    fontFamily: 'inherit',
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
