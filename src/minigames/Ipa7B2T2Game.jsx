import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#38bdf8'
const BG = 'linear-gradient(180deg, #030d1a 0%, #052040 100%)'
const TITLE = '❄️ Phase Change Master'

const SOAL = [
  { teks: 'Perubahan wujud dari padat menjadi cair disebut...', benar: 'Mencair (meleleh)', salah: ['Membeku', 'Menguap', 'Menyublim'] },
  { teks: 'Es batu yang dibiarkan di ruang terbuka lama-kelamaan akan...', benar: 'Mencair (padat → cair)', salah: ['Menguap langsung', 'Membeku lagi', 'Mengembun'] },
  { teks: 'Air yang dipanaskan hingga mendidih mengalami perubahan wujud...', benar: 'Menguap (cair → gas)', salah: ['Mencair', 'Membeku', 'Mengkristal'] },
  { teks: 'Embun di pagi hari terbentuk dari uap air yang mengalami...', benar: 'Mengembun (gas → cair)', salah: ['Menguap', 'Menyublim', 'Mencair'] },
  { teks: 'Kapur barus (kamper) yang mengecil tanpa menjadi cair mengalami...', benar: 'Menyublim (padat → gas)', salah: ['Mencair', 'Menguap', 'Mengembun'] },
  { teks: 'Perubahan wujud dari gas menjadi padat langsung disebut...', benar: 'Mengkristal (deposisi)', salah: ['Menyublim', 'Mengembun', 'Membeku'] },
  { teks: 'Perubahan wujud dari cair menjadi padat disebut...', benar: 'Membeku', salah: ['Mencair', 'Menguap', 'Mengembun'] },
  { teks: 'Proses pembuatan es krim menggunakan prinsip perubahan wujud...', benar: 'Membeku (cair → padat)', salah: ['Menguap', 'Menyublim', 'Mengkristal'] },
  { teks: 'Salju yang terbentuk di pegunungan dingin merupakan contoh...', benar: 'Mengkristal (uap air → padat)', salah: ['Menyublim', 'Membeku dari cair', 'Mengembun'] },
  { teks: 'Perubahan wujud yang MENYERAP kalor adalah...', benar: 'Mencair, menguap, menyublim', salah: ['Membeku, mengembun, mengkristal', 'Semua perubahan wujud', 'Tidak ada yang menyerap kalor'] },
  { teks: 'Perubahan wujud yang MELEPAS kalor adalah...', benar: 'Membeku, mengembun, mengkristal', salah: ['Mencair, menguap, menyublim', 'Semua perubahan wujud', 'Hanya membeku'] },
  { teks: 'Tutup panci yang basah saat memasak menunjukkan proses...', benar: 'Mengembun (gas → cair)', salah: ['Menguap', 'Mencair', 'Menyublim'] },
]

// Phase icons & kalor info
const PHASE_INFO = {
  'Mencair (meleleh)':       { icon: '🧊→💧', kalor: '🔥 serap' },
  'Membeku':                 { icon: '💧→🧊', kalor: '❄️ lepas' },
  'Menguap (cair → gas)':   { icon: '💧→💨', kalor: '🔥 serap' },
  'Mengembun (gas → cair)': { icon: '💨→💧', kalor: '❄️ lepas' },
  'Menyublim (padat → gas)':{ icon: '🧊→💨', kalor: '🔥 serap' },
  'Mengkristal (deposisi)': { icon: '💨→🧊', kalor: '❄️ lepas' },
}

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
      <div style={{ background: 'rgba(56,189,248,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{score}<span style={{ fontSize: 20, color: '#94A3B8' }}>/10</span></div>
        <div style={{ fontSize: 14, color: '#94A3B8' }}>Jawaban benar</div>
        <div style={{ marginTop: 8, fontSize: 16, color: '#fbbf24', fontWeight: 700 }}>🪙 +{coins} Koin diperoleh</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Kembali</button>
      </div>
    </div>
  )
}

export default function Ipa7B2T2Game({ onBack }) {
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

        {/* Phase diagram mini */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8' }}>
          <span style={{ fontSize: 20 }}>🧊</span>
          <span>⇌</span>
          <span style={{ fontSize: 20 }}>💧</span>
          <span>⇌</span>
          <span style={{ fontSize: 20 }}>💨</span>
        </div>

        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PERUBAHAN WUJUD ZAT</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>{q.teks}</div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.12)', color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            const info = Object.entries(PHASE_INFO).find(([k]) => c.includes(k.split(' ')[0]) && c.length < 30)?.[1]
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.5, transition: 'all 0.18s' }}>
                {info && <div style={{ fontSize: 16, marginBottom: 4 }}>{info.icon}</div>}
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
