// Rumus konversi suhu:
// °C → °R : C × 4/5
// °C → °F : (C × 9/5) + 32
// °C → K  : C + 273
// °R → °C : R × 5/4
// °F → °C : (F - 32) × 5/9

import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#eab308'
const BG = 'linear-gradient(180deg, #1a1200 0%, #2d1f00 100%)'
const TITLE = '🔄 Temperature Converter Wheel'

const SOAL = [
  { teks: '100°C = ___ °R',  benar: '80°R',   salah: ['100°R', '125°R', '40°R'] },
  { teks: '0°C = ___ °R',    benar: '0°R',    salah: ['32°R', '273°R', '4°R'] },
  { teks: '25°C = ___ °R',   benar: '20°R',   salah: ['25°R', '31,25°R', '10°R'] },
  { teks: '100°C = ___ °F',  benar: '212°F',  salah: ['100°F', '180°F', '373°F'] },
  { teks: '0°C = ___ °F',    benar: '32°F',   salah: ['0°F', '273°F', '100°F'] },
  { teks: '37°C = ___ °F',   benar: '98,6°F', salah: ['37°F', '100°F', '66,6°F'] },
  { teks: '0°C = ___ K',     benar: '273 K',  salah: ['0 K', '100 K', '373 K'] },
  { teks: '100°C = ___ K',   benar: '373 K',  salah: ['100 K', '273 K', '473 K'] },
  { teks: '27°C = ___ K',    benar: '300 K',  salah: ['27 K', '327 K', '273 K'] },
  { teks: '212°F = ___ °C',  benar: '100°C',  salah: ['212°C', '180°C', '32°C'] },
  { teks: '32°F = ___ °C',   benar: '0°C',    salah: ['32°C', '-32°C', '16°C'] },
  { teks: '40°R = ___ °C',   benar: '50°C',   salah: ['40°C', '32°C', '100°C'] },
]

const SCALE_INFO = {
  '°R': { label: 'Reamur', color: '#a855f7', icon: '🟣' },
  '°F': { label: 'Fahrenheit', color: '#ef4444', icon: '🔴' },
  'K':  { label: 'Kelvin', color: '#38bdf8', icon: '🔵' },
  '°C': { label: 'Celsius', color: '#22c55e', icon: '🟢' },
}

function getScale(str) {
  for (const k of Object.keys(SCALE_INFO)) if (str.includes(k)) return SCALE_INFO[k]
  return null
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
        <button onClick={onRestart} style={{ padding: '14px', borderRadius: 14, border: 'none', background: ACCENT, color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={onBack} style={{ padding: '14px', borderRadius: 14, border: `1px solid ${ACCENT}50`, background: 'transparent', color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Kembali</button>
      </div>
    </div>
  )
}

export default function Ipa7B3T2Game({ onBack }) {
  const { addCoins, addExp } = usePlayer()
  const [session, setSession] = useState(() => buildSession())
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [done, setDone] = useState(false)
  const q = session[idx]
  const isCorrect = selected !== null ? selected === q.benar : null
  // Detect target scale from question
  const targetScale = getScale(q.teks.split('=')[1] || '')

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
        {/* Scale legend */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['°C', '#22c55e'], ['°R', '#a855f7'], ['°F', '#ef4444'], ['K', '#38bdf8']].map(([s, c]) => (
            <div key={s} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${c}50`, background: `${c}12`, fontSize: 12, fontWeight: 700, color: c }}>
              {s} {targetScale?.label && s === Object.keys(SCALE_INFO).find(k => SCALE_INFO[k] === targetScale) ? '← target' : ''}
            </div>
          ))}
        </div>
        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>KONVERSI SUHU</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: 1, padding: '8px 0' }}>{q.teks}</div>
          {targetScale && (
            <div style={{ textAlign: 'center', fontSize: 11, color: targetScale.color, marginTop: 4 }}>
              {targetScale.icon} {targetScale.label}
            </div>
          )}
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
                style={{ padding: '18px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 18, fontWeight: 800, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'monospace', textAlign: 'center', transition: 'all 0.18s' }}>
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
