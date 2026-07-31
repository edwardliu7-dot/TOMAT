import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// ── Data Soal ───────────────────────────────────────────────────────────────

const WUJUD_SOAL = [
  { deskripsi: 'Benda ini memiliki bentuk tetap dan volume tetap. Contoh: batu dan logam. 🪨', jawaban: 'Padat', salah: ['Cair', 'Gas', 'Plasma'] },
  { deskripsi: 'Benda ini mengikuti bentuk wadahnya tetapi volume tetap. Contoh: air dan minyak. 💧', jawaban: 'Cair', salah: ['Padat', 'Gas', 'Plasma'] },
  { deskripsi: 'Benda ini mengisi seluruh ruang wadahnya. Bentuk dan volume berubah. Contoh: oksigen. 💨', jawaban: 'Gas', salah: ['Padat', 'Cair', 'Plasma'] },
  { deskripsi: 'Es batu berubah menjadi air saat dipanaskan. Perubahan wujud ini disebut... 🧊→💧', jawaban: 'Mencair (Meleleh)', salah: ['Membeku', 'Menguap', 'Menyublim'] },
  { deskripsi: 'Air berubah menjadi uap air saat dipanaskan. Perubahan wujud ini disebut... 💧→☁️', jawaban: 'Menguap', salah: ['Mengembun', 'Mencair', 'Mengkristal'] },
  { deskripsi: 'Uap air di udara berubah menjadi titik-titik air di permukaan gelas dingin. Ini disebut... ❄️', jawaban: 'Mengembun', salah: ['Menguap', 'Membeku', 'Mencair'] },
  { deskripsi: 'Kapur barus (kamper) langsung berubah dari padat ke gas tanpa jadi cair. Ini disebut... 🧴', jawaban: 'Menyublim', salah: ['Menguap', 'Mengkristal', 'Membeku'] },
  { deskripsi: 'Air didinginkan hingga 0°C dan berubah menjadi es. Perubahan wujud ini disebut... ❄️', jawaban: 'Membeku', salah: ['Mengembun', 'Mengkristal', 'Mencair'] },
]

const GAYA_SOAL = [
  { fenomena: 'Air tidak mau bercampur dengan minyak karena molekul air lebih tertarik ke sesama air. 🫧', jawaban: 'Kohesi', salah: ['Adhesi', 'Kapilaritas', 'Tegangan permukaan'] },
  { fenomena: 'Air menempel pada dinding gelas kaca dan membentuk cekungan (meniskus cekung). 🥛', jawaban: 'Adhesi', salah: ['Kohesi', 'Kapilaritas', 'Gravitasi'] },
  { fenomena: 'Air raksa tidak membasahi kaca, justru membentuk benjolan (meniskus cembung). ⚗️', jawaban: 'Kohesi > Adhesi', salah: ['Adhesi > Kohesi', 'Kapilaritas', 'Tegangan permukaan'] },
  { fenomena: 'Air naik sendiri melalui pipa tipis (sedotan kecil) meskipun tidak dipompa. 🌿', jawaban: 'Kapilaritas', salah: ['Kohesi', 'Adhesi', 'Gravitasi'] },
  { fenomena: 'Air bisa merembes naik pada kain lap/handuk sehingga seluruh kain basah. 🧻', jawaban: 'Kapilaritas', salah: ['Adhesi', 'Kohesi', 'Osmosis'] },
  { fenomena: 'Nyamuk bisa berjalan di atas permukaan air tanpa tenggelam. 🦟', jawaban: 'Tegangan permukaan (Kohesi)', salah: ['Adhesi', 'Kapilaritas', 'Gravitasi'] },
  { fenomena: 'Tumbuhan bisa mengangkat air dari akar ke daun melalui pembuluh xilem yang tipis. 🌱', jawaban: 'Kapilaritas', salah: ['Osmosis', 'Kohesi', 'Adhesi'] },
  { fenomena: 'Cat dapat menempel pada dinding karena gaya tarik antara cat dan dinding. 🖌️', jawaban: 'Adhesi', salah: ['Kohesi', 'Kapilaritas', 'Gravitasi'] },
]

const BENAR_SALAH = [
  { pernyataan: 'Zat cair memiliki bentuk tetap tetapi volume yang berubah-ubah.', jawaban: false, penjelasan: 'Zat cair memiliki volume tetap, tetapi bentuknya mengikuti wadah.' },
  { pernyataan: 'Menyublim adalah perubahan wujud dari padat langsung ke gas.', jawaban: true, penjelasan: 'Benar! Contoh: kapur barus dan es kering (dry ice).' },
  { pernyataan: 'Adhesi adalah gaya tarik-menarik antara molekul yang sejenis.', jawaban: false, penjelasan: 'Adhesi adalah gaya tarik antara molekul berbeda jenis. Kohesi yang sejenis.' },
  { pernyataan: 'Kapilaritas bisa terjadi karena adanya gaya adhesi dan kohesi bersama-sama.', jawaban: true, penjelasan: 'Benar! Kapilaritas terjadi ketika adhesi lebih besar dari kohesi.' },
  { pernyataan: 'Air raksa di dalam pipa kaca membentuk meniskus cekung.', jawaban: false, penjelasan: 'Air raksa membentuk meniskus cembung karena kohesi > adhesi.' },
  { pernyataan: 'Mengembun adalah perubahan wujud dari gas menjadi cair.', jawaban: true, penjelasan: 'Benar! Contoh: embun pagi hari dan titik air di gelas dingin.' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSession() {
  // Pick a balanced mix: 4 wujud + 3 gaya + 3 benarSalah = 10
  const wujud = shuffle(WUJUD_SOAL).slice(0, 4).map(q => ({
    mode: 'A',
    teks: q.deskripsi,
    benar: q.jawaban,
    pilihan: shuffle([q.jawaban, ...q.salah]),
    penjelasan: null,
  }))
  const gaya = shuffle(GAYA_SOAL).slice(0, 3).map(q => ({
    mode: 'B',
    teks: q.fenomena,
    benar: q.jawaban,
    pilihan: shuffle([q.jawaban, ...q.salah]),
    penjelasan: null,
  }))
  const bs = shuffle(BENAR_SALAH).slice(0, 3).map(q => ({
    mode: 'C',
    teks: q.pernyataan,
    benar: q.jawaban,   // boolean
    pilihan: null,
    penjelasan: q.penjelasan,
  }))
  return shuffle([...wujud, ...gaya, ...bs])
}

const MODE_LABELS = {
  A: { label: '🧊 Wujud Zat', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  B: { label: '🫧 Gaya Molekul', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  C: { label: '✅ Benar atau Salah?', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Ipa7ZatGame({ onBack }) {
  const { addReward } = usePlayer()
  const { onCorrect, onWrong } = useSurvival()

  const [session]              = useState(() => buildSession())
  const [idx, setIdx]          = useState(0)
  const [selected, setSelected] = useState(null)   // string or boolean
  const [feedback, setFeedback] = useState(null)   // null | true | false
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)
  const [penjelasan, setPenjelasan] = useState(null)

  const q = session[idx]

  const advance = useCallback(() => {
    if (idx + 1 >= session.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setFeedback(null)
      setPenjelasan(null)
    }
  }, [idx, session.length])

  const handleAnswer = useCallback((opt) => {
    if (feedback !== null) return
    const isCorrect = q.mode === 'C'
      ? opt === q.benar
      : opt === q.benar
    setSelected(opt)
    setFeedback(isCorrect)
    if (q.mode === 'C') setPenjelasan(q.penjelasan)
    if (isCorrect) {
      addReward({ coins: 15, exp: 10 })
      onCorrect()
      setScore(s => s + 1)
    } else {
      onWrong()
    }
    const delay = q.mode === 'C' ? 1500 : 1200
    setTimeout(advance, delay)
  }, [feedback, q, advance, addReward, onCorrect, onWrong])

  // ── Done screen ─────────────────────────────────────────────────────────
  if (done) {
    const coins = score * 15
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0c1a2e 0%,#1e3a5f 100%)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="💧 Fluid & Molecular Quest" onBack={onBack} accentColor="#38bdf8" />
        <PlayerHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Card style={{ textAlign: 'center', padding: 32, maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginBottom: 4 }}>Sesi Selesai!</div>
            <div style={{ fontSize: 15, color: '#94A3B8', marginBottom: 20 }}>Nilaimu hari ini</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score}<span style={{ fontSize: 24, color: '#94A3B8' }}>/10</span>
            </div>
            <div style={{ fontSize: 14, color: '#FBBF24', marginBottom: 28 }}>+{coins} koin didapat 🪙</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#38bdf8,#0284c7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
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

  const modeInfo = MODE_LABELS[q.mode]

  // ── Game screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0c1a2e 0%,#1e3a5f 100%)' }}>
      <TopBar title="💧 Fluid & Molecular Quest" onBack={onBack} accentColor="#38bdf8" />
      <PlayerHeader />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520, margin: '0 auto' }}>

        <Card border="rgba(56,189,248,0.3)">
          {/* Mode label + Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: modeInfo.color, background: modeInfo.bg, padding: '3px 10px', borderRadius: 20 }}>
              {modeInfo.label}
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{idx + 1} / {session.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
            <div style={{ height: 4, width: `${((idx + 1) / session.length) * 100}%`, background: '#38bdf8', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>

          {/* Question text */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.6 }}>{q.teks}</div>
          </div>

          {/* Mode A & B — 4 pilihan ganda */}
          {(q.mode === 'A' || q.mode === 'B') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {q.pilihan.map((opt) => {
                const isCorrect = feedback !== null && opt === q.benar
                const isWrong   = feedback !== null && selected === opt && opt !== q.benar
                let bg     = 'rgba(255,255,255,0.06)'
                let border = '1.5px solid rgba(255,255,255,0.1)'
                let color  = '#F1F5F9'
                if (isCorrect) { bg = '#082f49'; border = '1.5px solid #38bdf8'; color = '#38bdf8' }
                if (isWrong)   { bg = '#450a0a'; border = '1.5px solid #ef4444'; color = '#ef4444' }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={feedback !== null}
                    style={{ padding: '13px 10px', background: bg, border, borderRadius: 12, color, fontWeight: 600, fontSize: 13, cursor: feedback !== null ? 'default' : 'pointer', transition: 'all 0.2s', lineHeight: 1.3 }}>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* Mode C — Benar / Salah */}
          {q.mode === 'C' && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[true, false].map((val) => {
                const label    = val ? '✅ BENAR' : '❌ SALAH'
                const isChosen = feedback !== null && selected === val
                const isCorrect = feedback !== null && val === q.benar
                const isWrong   = isChosen && val !== q.benar
                let bg     = val ? 'rgba(34,197,94,0.1)'  : 'rgba(239,68,68,0.1)'
                let border = val ? '1.5px solid #22c55e'  : '1.5px solid #ef4444'
                let color  = val ? '#22c55e' : '#ef4444'
                if (feedback !== null) {
                  if (isCorrect) { bg = val ? '#14532d' : '#450a0a'; }
                  if (isWrong)   { bg = '#1e1e1e'; border = '1.5px solid rgba(255,255,255,0.1)'; color = '#475569' }
                }
                return (
                  <button key={String(val)} onClick={() => handleAnswer(val)} disabled={feedback !== null}
                    style={{ flex: 1, padding: '18px 10px', background: bg, border, borderRadius: 14, color, fontWeight: 800, fontSize: 16, cursor: feedback !== null ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Feedback */}
        {feedback !== null && (
          <FeedbackBanner
            isCorrect={feedback}
            message={
              q.mode === 'C'
                ? (feedback ? `✅ Benar! ${penjelasan}` : `❌ Salah! ${penjelasan}`)
                : (feedback ? '✅ Benar!' : `❌ Salah! Jawaban: ${q.benar}`)
            }
          />
        )}
      </div>
    </div>
  )
}
