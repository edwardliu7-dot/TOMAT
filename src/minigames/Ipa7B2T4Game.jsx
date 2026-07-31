import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#16a34a'
const BG = 'linear-gradient(180deg, #021008 0%, #041a10 100%)'
const TITLE = '🌿 Capillary Tube Challenge'

const SOAL = [
  { teks: 'Kapilaritas adalah peristiwa...', benar: 'Naiknya atau turunnya zat cair dalam pipa/pembuluh sempit', salah: ['Mengalirnya air dari tempat tinggi ke rendah', 'Penguapan air di permukaan', 'Pembekuan air di suhu rendah'] },
  { teks: 'Air naik dari akar ke daun melalui xilem merupakan contoh kapilaritas yang berperan dalam...', benar: 'Pengangkutan air pada tumbuhan', salah: ['Fotosintesis langsung', 'Respirasi daun', 'Penyimpanan energi'] },
  { teks: 'Kain lap (serbet) yang menyerap air tumpahan adalah contoh kapilaritas karena...', benar: 'Air naik melalui celah-celah kecil antar serat kain', salah: ['Kain memiliki gaya magnet', 'Kain memiliki pori besar', 'Gravitasi menarik air ke kain'] },
  { teks: 'Sumbu kompor minyak bisa menyalurkan minyak ke api karena...', benar: 'Kapilaritas — minyak naik melalui serat sumbu', salah: ['Minyak bertekanan tinggi', 'Gaya gravitasi mendorong ke atas', 'Minyak mudah terbakar'] },
  { teks: 'Makin kecil diameter pipa kapiler, air yang naik makin...', benar: 'Tinggi', salah: ['Rendah', 'Tetap sama', 'Tidak tentu'] },
  { teks: 'Kapilaritas TIDAK terjadi pada...', benar: 'Pipa berdiameter besar', salah: ['Pembuluh darah kapiler', 'Sumbu lilin', 'Serat kain'] },
  { teks: 'Fenomena air tanah bisa naik ke permukaan tanah secara alami disebabkan oleh...', benar: 'Kapilaritas pada pori-pori tanah', salah: ['Gempa bumi', 'Tekanan gas dalam tanah', 'Gravitasi terbalik'] },
  { teks: 'Pada peristiwa kapilaritas, zat cair naik karena...', benar: 'Adhesi zat cair terhadap dinding pipa lebih besar dari kohesinya', salah: ['Gravitasi mendorong ke atas', 'Zat cair ringan', 'Kohesi lebih besar dari adhesi'] },
  { teks: 'Contoh kapilaritas yang merugikan dalam bangunan adalah...', benar: 'Tembok lembap karena air tanah naik ke dinding', salah: ['Air hujan masuk lewat atap', 'Banjir di lantai', 'Retakan tembok karena panas'] },
  { teks: 'Mengapa kertas tisu lebih baik menyerap air dari pada plastik?', benar: 'Kertas tisu memiliki banyak serat kecil yang memungkinkan kapilaritas', salah: ['Kertas tisu lebih berat', 'Plastik tidak bisa basah', 'Kertas memiliki gaya magnet'] },
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
  const pct = Math.round((score / 10) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT, textAlign: 'center' }}>Selesai!</div>
      <div style={{ background: 'rgba(22,163,74,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

export default function Ipa7B2T4Game({ onBack }) {
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
    if (correct) { addCoins(15); addExp(10); setScore(s => s + 1); setCoinsEarned(c => c + 15) }
    setTimeout(() => {
      if (idx + 1 >= session.length) setDone(true)
      else { setIdx(i => i + 1); setSelected(null) }
    }, 1300)
  }

  const restart = useCallback(() => {
    setSession(buildSession()); setIdx(0); setSelected(null); setScore(0); setCoinsEarned(0); setDone(false)
  }, [])

  if (done) return <EndScreen score={score} coins={coinsEarned} onRestart={restart} onBack={onBack} />

  // Capillary tube animation — height indicator
  const tubeHeight = idx * 8 // simulate rising water
  const capillaryExamples = ['🌿', '🕯️', '🧻', '🏗️', '💧']

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <PlayerHeader />
      <TopBar title={TITLE} onBack={onBack} accentColor={ACCENT} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(idx / 10) * 100}%`, background: ACCENT, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap' }}>{idx + 1} / 10</div>
        </div>

        {/* Capillary tube visual */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {[80, 60, 45, 35, 28].map((h, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: [16, 12, 9, 7, 6][i], height: h, border: `1px solid ${ACCENT}60`, borderRadius: '4px 4px 0 0', overflow: 'hidden', background: 'transparent', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${Math.min(100, tubeHeight + h * 0.3)}%`, background: `${ACCENT}50`, transition: 'height 0.5s' }} />
              </div>
              <div style={{ fontSize: 8, color: '#94A3B8' }}>{['⬤', '○', '○', '○', '○'][i]}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8' }}>Pipa lebih kecil → air lebih tinggi</div>

        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>KAPILARITAS</div>
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
          <FeedbackBanner
            message={isCorrect ? `✅ Benar! ${q.benar}` : `❌ Salah! Jawaban: ${q.benar}`}
            isCorrect={isCorrect}
            extras={isCorrect ? '+15 Koin | +10 EXP' : ''}
          />
        )}
      </div>
    </div>
  )
}
