import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#06b6d4'
const BG = 'linear-gradient(180deg, #020d10 0%, #041a20 100%)'
const TITLE = '💧 Cohesion vs Adhesion Lab'

const SOAL = [
  { teks: 'Gaya tarik menarik antara partikel-partikel ZAT YANG SEJENIS disebut...', benar: 'Kohesi', salah: ['Adhesi', 'Gravitasi', 'Tegangan permukaan'] },
  { teks: 'Gaya tarik menarik antara partikel ZAT YANG BERBEDA JENIS disebut...', benar: 'Adhesi', salah: ['Kohesi', 'Gaya magnet', 'Gaya gesek'] },
  { teks: 'Air yang menempel pada dinding kaca gelas menunjukkan...', benar: 'Adhesi (air-kaca)', salah: ['Kohesi air', 'Gravitasi', 'Tegangan permukaan'] },
  { teks: 'Tinta yang menempel pada kertas merupakan contoh...', benar: 'Adhesi (tinta-kertas)', salah: ['Kohesi tinta', 'Kohesi kertas', 'Gaya gesek'] },
  { teks: 'Air raksa di dalam tabung kaca membentuk meniskus CEMBUNG karena...', benar: 'Kohesi raksa > adhesi raksa-kaca', salah: ['Adhesi raksa > kohesi', 'Gravitasi sangat kuat', 'Raksa ringan'] },
  { teks: 'Air di dalam tabung kaca membentuk meniskus CEKUNG karena...', benar: 'Adhesi air-kaca > kohesi air', salah: ['Kohesi air > adhesi', 'Air sangat berat', 'Tekanan udara'] },
  { teks: 'Cat yang menempel pada tembok adalah contoh...', benar: 'Adhesi (cat-tembok)', salah: ['Kohesi cat', 'Gaya magnet', 'Gravitasi'] },
  { teks: 'Air yang membentuk tetes bulat di atas daun talas menunjukkan...', benar: 'Kohesi air lebih besar dari adhesi air-daun', salah: ['Adhesi air-daun sangat kuat', 'Gravitasi rendah', 'Air bermassa kecil'] },
  { teks: 'Kapilaritas (naiknya air di pembuluh kapiler) terjadi karena...', benar: 'Adhesi air > kohesi air', salah: ['Kohesi air > adhesi', 'Gravitasi mendorong ke atas', 'Tekanan atmosfer'] },
  { teks: 'Spidol bisa menulis di papan whiteboard karena tinta mengalami...', benar: 'Adhesi dengan permukaan papan', salah: ['Kohesi yang kuat', 'Gaya gesek kinetik', 'Kapilaritas'] },
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
      <div style={{ background: 'rgba(6,182,212,0.1)', border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '20px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

export default function Ipa7B2T3Game({ onBack }) {
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

        {/* Kohesi vs Adhesi legend */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {[['💙', 'KOHESI', 'Sejenis', '#38bdf8'], ['🔗', 'ADHESI', 'Beda jenis', '#f472b6']].map(([icon, label, sub, color]) => (
            <div key={label} style={{ padding: '8px 16px', borderRadius: 14, border: `1px solid ${color}40`, background: `${color}10`, textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color }}>{label}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>{sub}</div>
            </div>
          ))}
        </div>

        <Card border={`${ACCENT}40`}>
          <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>KOHESI & ADHESI</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.5, padding: '6px 0' }}>{q.teks}</div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.12)', color = '#cbd5e1'
            if (selected !== null) {
              if (c === q.benar) { bg = 'rgba(34,197,94,0.18)'; border = '#22c55e'; color = '#fff' }
              else if (c === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fff' }
            }
            const isKohesi = c.toLowerCase().includes('kohesi')
            const isAdhesi = c.toLowerCase().includes('adhesi')
            const badge = isKohesi ? '💙' : isAdhesi ? '🔗' : ''
            return (
              <button key={i} onClick={() => pick(c)} disabled={selected !== null}
                style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.5, transition: 'all 0.18s' }}>
                {badge && <div style={{ fontSize: 18, marginBottom: 4 }}>{badge}</div>}
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
