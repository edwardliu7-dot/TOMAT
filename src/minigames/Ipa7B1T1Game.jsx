import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#22c55e'
const BG = 'linear-gradient(180deg, #0a1a0a 0%, #0d2d0d 100%)'
const TITLE = '📏 Unit Converter Dash'

const SOAL = [
  { teks: '5 km = ___ m',        benar: '5.000 m',       salah: ['500 m', '50.000 m', '0,5 m'] },
  { teks: '300 cm = ___ m',      benar: '3 m',            salah: ['30 m', '0,3 m', '3.000 m'] },
  { teks: '2,5 m = ___ cm',      benar: '250 cm',         salah: ['25 cm', '2.500 cm', '0,25 cm'] },
  { teks: '1 km = ___ cm',       benar: '100.000 cm',     salah: ['1.000 cm', '10.000 cm', '1.000.000 cm'] },
  { teks: '3 kg = ___ g',        benar: '3.000 g',        salah: ['300 g', '30.000 g', '0,3 g'] },
  { teks: '750 g = ___ kg',      benar: '0,75 kg',        salah: ['7,5 kg', '75 kg', '0,075 kg'] },
  { teks: '2 ton = ___ kg',      benar: '2.000 kg',       salah: ['200 kg', '20.000 kg', '0,2 kg'] },
  { teks: '500 mg = ___ g',      benar: '0,5 g',          salah: ['5 g', '50 g', '0,05 g'] },
  { teks: '2 jam = ___ menit',   benar: '120 menit',      salah: ['60 menit', '200 menit', '20 menit'] },
  { teks: '3 menit = ___ detik', benar: '180 detik',      salah: ['30 detik', '300 detik', '18 detik'] },
  { teks: '1 hari = ___ jam',    benar: '24 jam',          salah: ['12 jam', '48 jam', '60 jam'] },
  { teks: '90 menit = ___ jam',  benar: '1,5 jam',        salah: ['9 jam', '0,9 jam', '0,15 jam'] },
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
  return shuffle(SOAL).slice(0, 10).map(q => ({
    ...q,
    choices: shuffle([q.benar, ...q.salah]),
  }))
}

function EndScreen({ score, coins, onRestart, onBack }) {
  const pct = Math.round((score / 10) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT, textAlign: 'center' }}>Selesai!</div>
      <div style={{ background: 'rgba(34,197,94,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{score}<span style={{ fontSize: 20, color: '#94A3B8' }}>/10</span></div>
        <div style={{ fontSize: 14, color: '#94A3B8' }}>Jawaban benar</div>
        <div style={{ marginTop: 8, fontSize: 16, color: '#fbbf24', fontWeight: 700 }}>🪙 +{coins} Koin diperoleh</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          🔄 Main Lagi
        </button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          ← Kembali
        </button>
      </div>
    </div>
  )
}

export default function Ipa7B1T1Game({ onBack }) {
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
    if (correct) {
      addCoins(15)
      addExp(10)
      setScore(s => s + 1)
      setCoinsEarned(c => c + 15)
    }
    setTimeout(() => {
      if (idx + 1 >= session.length) {
        setDone(true)
      } else {
        setIdx(i => i + 1)
        setSelected(null)
      }
    }, 1300)
  }

  const restart = useCallback(() => {
    setSession(buildSession())
    setIdx(0)
    setSelected(null)
    setScore(0)
    setCoinsEarned(0)
    setDone(false)
  }, [])

  if (done) {
    return <EndScreen score={score} coins={coinsEarned} onRestart={restart} onBack={onBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <PlayerHeader />
      <TopBar title={TITLE} onBack={onBack} accentColor={ACCENT} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(idx / 10) * 100}%`, background: ACCENT, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap' }}>{idx + 1} / 10</div>
        </div>

        {/* Question */}
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>KONVERSI SATUAN</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.4, padding: '8px 0' }}>
            {q.teks}
          </div>
        </Card>

        {/* Choices 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)'
            let border = 'rgba(255,255,255,0.12)'
            let color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = ACCENT; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '16px 12px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.4, transition: 'all 0.18s' }}>
                {c}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
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
