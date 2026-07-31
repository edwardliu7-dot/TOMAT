import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#a855f7'
const BG = 'linear-gradient(180deg, #0d0a1a 0%, #1a1030 100%)'
const TITLE = '🧪 Matter Inspector'

const SOAL = [
  { teks: 'Zat yang memiliki bentuk dan volume tetap adalah...', benar: 'Zat Padat', salah: ['Zat Cair', 'Gas', 'Plasma'] },
  { teks: 'Sifat zat cair yang benar adalah...', benar: 'Volume tetap, bentuk mengikuti wadah', salah: ['Bentuk dan volume tetap', 'Bentuk dan volume berubah', 'Tidak bisa dialirkan'] },
  { teks: 'Gas memiliki sifat...', benar: 'Bentuk dan volume mengikuti wadah', salah: ['Volume tetap, bentuk berubah', 'Bentuk tetap, volume berubah', 'Massa selalu nol'] },
  { teks: 'Es batu termasuk zat...', benar: 'Padat', salah: ['Cair', 'Gas', 'Plasma'] },
  { teks: 'Uap air termasuk zat...', benar: 'Gas', salah: ['Padat', 'Cair', 'Larutan'] },
  { teks: 'Jarak antar partikel pada zat padat adalah...', benar: 'Sangat rapat dan teratur', salah: ['Renggang dan tidak teratur', 'Sangat renggang', 'Berubah-ubah'] },
  { teks: 'Mengapa air bisa dituang dari satu wadah ke wadah lain?', benar: 'Karena partikel zat cair dapat bergerak bebas', salah: ['Karena air ringan', 'Karena air tidak bermassa', 'Karena air berbentuk gas'] },
  { teks: 'Contoh zat cair dalam kehidupan sehari-hari adalah...', benar: 'Minyak goreng', salah: ['Besi', 'Asap', 'Pasir'] },
  { teks: 'Gas mudah dimampatkan (dikompresi) karena...', benar: 'Jarak antar partikelnya sangat jauh', salah: ['Partikelnya sangat berat', 'Gas tidak memiliki partikel', 'Gas selalu panas'] },
  { teks: 'Perbedaan utama zat cair dan gas adalah...', benar: 'Zat cair volumenya tetap, gas volumenya berubah', salah: ['Zat cair selalu panas, gas selalu dingin', 'Keduanya tidak memiliki bentuk tetap', 'Tidak ada perbedaan'] },
  { teks: 'Kayu, batu, dan logam termasuk contoh zat...', benar: 'Padat', salah: ['Cair', 'Gas', 'Campuran'] },
  { teks: 'Oksigen (O₂) yang kita hirup termasuk zat...', benar: 'Gas', salah: ['Padat', 'Cair', 'Koloid'] },
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
      <div style={{ background: 'rgba(168,85,247,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

export default function Ipa7B2T1Game({ onBack }) {
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

  const ICONS = { 'Zat Padat': '🪨', 'Padat': '🪨', 'Zat Cair': '💧', 'Cair': '💧', 'Gas': '💨', 'Plasma': '⚡' }

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

        {/* Wujud zat visual indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[['🪨', 'Padat'], ['💧', 'Cair'], ['💨', 'Gas']].map(([icon, label]) => (
            <div key={label} style={{ textAlign: 'center', opacity: 0.7 }}>
              <div style={{ fontSize: 26 }}>{icon}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>WUJUD ZAT</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>{q.teks}</div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.12)', color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            const icon = Object.entries(ICONS).find(([k]) => c.includes(k))?.[1] ?? ''
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.4, transition: 'all 0.18s' }}>
                {icon && <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>}
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
