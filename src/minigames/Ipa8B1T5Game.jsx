import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'

// Sel Punca (Stem Cell) — klasifikasi berdasarkan potensi:
// Totipoten   — dapat membentuk SELURUH organisme lengkap (termasuk plasenta)
//               → dari zigot hingga morula
// Pluripoten  — dapat membentuk hampir semua jenis sel tubuh (kecuali plasenta)
//               → sel punca embrionik (paling kontroversial secara etika)
// Multipoten  — hanya dapat membentuk beberapa jenis sel dalam satu kelompok
//               → contoh: hematopoietik (semua jenis sel darah saja)
// Unipoten    — hanya dapat membentuk satu jenis sel
//
// Aplikasi Medis:
//   · Transplantasi sumsum tulang → terapi leukemia (paling terkenal)
//   · Bank darah tali pusat → simpan sel punca hematopoietik
//   · Model penelitian penyakit → mempelajari mekanisme & potensi terapi
// Kontroversi: sel punca embrionik diambil dari embrio manusia

const ACCENT = '#10b981'
const BG = 'linear-gradient(180deg, #021008 0%, #041c10 100%)'
const TITLE = '🌱 Stem Cell Regenerator'

const SOAL = [
  { teks: 'Sel punca (stem cell) adalah sel yang memiliki kemampuan...', benar: 'Berkembang menjadi berbagai jenis sel dan memperbanyak diri', salah: ['Hanya membelah diri saja', 'Hanya membentuk sel otot', 'Tidak bisa membelah diri'] },
  { teks: 'Sel punca totipoten adalah sel yang mampu membentuk...', benar: 'Seluruh jenis sel tubuh, termasuk plasenta (organisme lengkap)', salah: ['Hanya beberapa jenis jaringan', 'Hanya sel darah', 'Hanya sel otot dan tulang'] },
  { teks: 'Sel punca pluripoten mampu membentuk...', benar: 'Hampir semua jenis sel tubuh (kecuali plasenta)', salah: ['Hanya satu jenis sel', 'Seluruh organisme lengkap', 'Hanya sel kulit'] },
  { teks: 'Sel punca yang paling awal dalam perkembangan embrio disebut...', benar: 'Totipoten (dari zigot hingga morula)', salah: ['Pluripoten', 'Multipoten', 'Unipoten'] },
  { teks: 'Contoh aplikasi sel punca dalam bidang medis adalah...', benar: 'Terapi transplantasi sumsum tulang untuk leukemia', salah: ['Membuat vaksin virus', 'Menciptakan antibiotik baru', 'Operasi plastik biasa'] },
  { teks: 'Sumber sel punca yang PALING KONTROVERSIAL secara etika adalah...', benar: 'Sel punca embrionik (diambil dari embrio manusia)', salah: ['Sel punca dari sumsum tulang dewasa', 'Sel punca dari darah tali pusat', 'Sel punca dari adiposa (lemak)'] },
  { teks: 'Sel punca multipoten dapat berkembang menjadi...', benar: 'Beberapa jenis sel dalam satu kelompok jaringan (misal: sel darah saja)', salah: ['Semua jenis sel tubuh', 'Hanya satu jenis sel', 'Seluruh organisme'] },
  { teks: 'Sel punca hematopoietik berfungsi menghasilkan...', benar: 'Semua jenis sel darah (eritrosit, leukosit, trombosit)', salah: ['Semua jenis sel otot', 'Sel-sel kulit', 'Sel-sel tulang rawan'] },
  { teks: 'Mengapa sel punca penting untuk penelitian penyakit?', benar: 'Dapat digunakan sebagai model penelitian dan berpotensi memperbaiki jaringan rusak', salah: ['Sel punca bisa membunuh virus langsung', 'Sel punca tidak bisa mati', 'Sel punca menghasilkan antibiotik alami'] },
  { teks: 'Bank darah tali pusat menyimpan sel punca karena...', benar: 'Darah tali pusat kaya sel punca hematopoietik yang bisa digunakan sebagai terapi masa depan', salah: ['Darah tali pusat bisa diminum sebagai obat', 'Tali pusat mengandung DNA unik', 'Agar darah tidak terbuang sia-sia'] },
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

export default function Ipa8B1T5Game({ onBack }) {
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
