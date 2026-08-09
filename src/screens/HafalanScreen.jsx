/**
 * HafalanScreen — Hafalan Interaktif untuk Siswa
 * Flash card & kuis mandiri perkalian dan pembagian (tabel 1–10).
 */
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { usePlayer } from '../PlayerContext'

const API = (path) => fetch(path, { credentials: 'include' }).then(r => r.json())

// ─── Coin rewards ─────────────────────────────────────────────────────────────
const REWARD_BY_SCORE = { 10: 30, 9: 15, 8: 15 } // koin per correct/10

// ─── Question generators ──────────────────────────────────────────────────────
function genPerkalianCards(angka) {
  return Array.from({ length: 10 }, (_, i) => {
    const k = i + 1
    return { question: `${angka} × ${k}`, answer: angka * k }
  })
}
function genPembagianCards(angka) {
  return Array.from({ length: 10 }, (_, i) => {
    const k = i + 1
    return { question: `${angka * k} ÷ ${angka}`, answer: k }
  })
}
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function genCards(jenis, angka) {
  return jenis === 'perkalian' ? genPerkalianCards(angka) : genPembagianCards(angka)
}

// ─── Status color ─────────────────────────────────────────────────────────────
const STATUS_COLOR = { lulus: '#10b981', diulang: '#f59e0b', default: '#1e293b' }
const STATUS_BORDER = { lulus: 'rgba(16,185,129,0.4)', diulang: 'rgba(245,158,11,0.4)', default: 'rgba(255,255,255,0.08)' }
const STATUS_LABEL = { lulus: '✅ Lulus', diulang: '🔁 Diulang', default: '⬜ Belum' }

function getStatus(hafalanStatus, jenis, angka) {
  return hafalanStatus?.[jenis]?.[String(angka)] || 'default'
}

// ─── Numpad component ─────────────────────────────────────────────────────────
function Numpad({ value, onChange, onSubmit }) {
  const press = (d) => {
    if (d === '⌫') { onChange(value.slice(0, -1)); return }
    if (value.length >= 3) return
    onChange(value + d)
  }
  const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {KEYS.map(k => (
        <button key={k} type="button" onClick={() => k === '✓' ? onSubmit() : press(k)}
          style={{
            padding: '18px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 20, fontWeight: 800,
            background: k === '✓' ? '#0e7490' : k === '⌫' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.07)',
            color: k === '✓' ? '#fff' : k === '⌫' ? '#f87171' : '#e2e8f0',
            boxShadow: k === '✓' ? '0 4px 12px rgba(14,116,144,0.3)' : 'none',
          }}>
          {k}
        </button>
      ))}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HafalanScreen({ goBack }) {
  const { addCoins } = usePlayer() || {}

  // Data
  const [hafalanStatus, setHafalanStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  // Navigation state
  const [view, setView] = useState('home') // 'home' | 'detail' | 'flash' | 'kuis' | 'result'
  const [jenis, setJenis] = useState('perkalian')
  const [angka, setAngka] = useState(null)

  // Flash card state
  const [cards, setCards] = useState([])
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Kuis state
  const [kuisQs, setKuisQs] = useState([])
  const [kuisIdx, setKuisIdx] = useState(0)
  const [kuisInput, setKuisInput] = useState('')
  const [kuisCorrect, setKuisCorrect] = useState(0)
  const [kuisWrong, setKuisWrong] = useState([])  // { question, userAnswer, correct }
  const [kuisFeedback, setKuisFeedback] = useState(null) // 'correct' | 'wrong'
  const feedbackTimer = useRef(null)

  useEffect(() => {
    API('/api/siswa/hafalan').then(d => {
      setHafalanStatus({ perkalian: d.perkalian || {}, pembagian: d.pembagian || {} })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const openDetail = (j, n) => {
    setJenis(j)
    setAngka(n)
    setView('detail')
  }
  const startFlash = () => {
    setCards(genCards(jenis, angka))
    setCardIdx(0)
    setFlipped(false)
    setView('flash')
  }
  const startKuis = () => {
    setKuisQs(shuffle(genCards(jenis, angka)))
    setKuisIdx(0)
    setKuisInput('')
    setKuisCorrect(0)
    setKuisWrong([])
    setKuisFeedback(null)
    setView('kuis')
  }
  const goHome = () => setView('home')

  // ── Kuis answer handler ─────────────────────────────────────────────────────
  const submitKuisAnswer = useCallback(() => {
    if (!kuisInput.trim()) return
    const q = kuisQs[kuisIdx]
    const userAns = parseInt(kuisInput, 10)
    const isCorrect = userAns === q.answer
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setKuisFeedback(isCorrect ? 'correct' : 'wrong')

    const newCorrect = isCorrect ? kuisCorrect + 1 : kuisCorrect
    const newWrong = isCorrect ? kuisWrong : [...kuisWrong, { question: q.question, userAnswer: kuisInput, correct: q.answer }]

    feedbackTimer.current = setTimeout(() => {
      setKuisFeedback(null)
      setKuisInput('')
      if (kuisIdx + 1 >= kuisQs.length) {
        // Finished
        const reward = REWARD_BY_SCORE[newCorrect]
        if (reward && addCoins) addCoins(reward)
        setKuisCorrect(newCorrect)
        setKuisWrong(newWrong)
        setView('result')
      } else {
        setKuisCorrect(newCorrect)
        setKuisWrong(newWrong)
        setKuisIdx(i => i + 1)
      }
    }, 800)
  }, [kuisInput, kuisQs, kuisIdx, kuisCorrect, kuisWrong, addCoins])

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#475569', fontSize: 13 }}>Memuat…</div>
    </div>
  )

  // ── View: Home ────────────────────────────────────────────────────────────
  if (view === 'home') {
    const totalLulus = (hafalanStatus
      ? Object.values(hafalanStatus.perkalian || {}).filter(s => s === 'lulus').length
        + Object.values(hafalanStatus.pembagian || {}).filter(s => s === 'lulus').length
      : 0)
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff' }}>
        {/* Header */}
        <div style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 800, letterSpacing: 1 }}>🧮 HAFALAN INTERAKTIF</div>
            <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>Flash Card &amp; Kuis Mandiri</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 800, color: '#10b981' }}>
            {totalLulus}/20 Lulus
          </div>
        </div>

        <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { jenis: 'perkalian', label: 'Perkalian', sym: '×', emoji: '✖️' },
            { jenis: 'pembagian', label: 'Pembagian', sym: '÷', emoji: '➗' },
          ].map(({ jenis: j, label, sym, emoji }) => {
            const lulusCount = Object.values(hafalanStatus?.[j] || {}).filter(s => s === 'lulus').length
            return (
              <div key={j}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{emoji} Tabel {label}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{lulusCount}/10 lulus</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const st = getStatus(hafalanStatus, j, n)
                    return (
                      <button key={n} type="button" onClick={() => openDetail(j, n)} style={{
                        padding: '14px 0', borderRadius: 14, border: `1.5px solid ${STATUS_BORDER[st]}`,
                        background: st === 'lulus' ? 'rgba(16,185,129,0.08)' : st === 'diulang' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: STATUS_COLOR[st] }}>{n}</span>
                        <span style={{ fontSize: 8, color: STATUS_COLOR[st], fontWeight: 700 }}>
                          {st === 'lulus' ? '✅' : st === 'diulang' ? '🔁' : '○'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['✅', '#10b981', 'Lulus (oleh guru)'], ['🔁', '#f59e0b', 'Perlu diulang'], ['○', '#475569', 'Belum dinilai']].map(([icon, color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B' }}>
                <span style={{ color }}>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── View: Detail (choose flash / kuis) ────────────────────────────────────
  if (view === 'detail') {
    const st = getStatus(hafalanStatus, jenis, angka)
    const sym = jenis === 'perkalian' ? '×' : '÷'
    const preview = jenis === 'perkalian'
      ? genPerkalianCards(angka).slice(0, 3).map(c => `${c.question}=${c.answer}`).join(', ')
      : genPembagianCards(angka).slice(0, 3).map(c => `${c.question}=${c.answer}`).join(', ')
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goHome} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 800, letterSpacing: 1 }}>PILIH MODE</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Tabel {jenis === 'perkalian' ? '×' : '÷'} {angka}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', maxWidth: 400, margin: '0 auto', width: '100%' }}>
          {/* Status badge */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ display: 'inline-block', background: st === 'lulus' ? 'rgba(16,185,129,0.1)' : st === 'diulang' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${STATUS_BORDER[st]}`, borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: STATUS_COLOR[st] }}>
              {STATUS_LABEL[st]}
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '12px 16px', fontSize: 12, color: '#64748B', textAlign: 'center' }}>
            {preview}, …
          </div>

          {/* Mode buttons */}
          <button onClick={startFlash} style={{
            padding: '20px', borderRadius: 18, border: '1.5px solid rgba(99,102,241,0.3)',
            background: 'rgba(99,102,241,0.08)', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 28 }}>🃏</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#c7d2fe' }}>Flash Card</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Buka kartu satu per satu, ketuk untuk melihat jawaban. Cocok untuk menghafal.</div>
          </button>

          <button onClick={startKuis} style={{
            padding: '20px', borderRadius: 18, border: '1.5px solid rgba(245,158,11,0.3)',
            background: 'rgba(245,158,11,0.06)', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 28 }}>✏️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fde68a' }}>Kuis Mandiri</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Jawab 10 soal acak dengan numpad. Koin menanti kalau nilaimu bagus!</div>
            <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>🪙 10/10 = +30 koin · 8-9/10 = +15 koin</div>
          </button>
        </div>
      </div>
    )
  }

  // ── View: Flash Card ──────────────────────────────────────────────────────
  if (view === 'flash') {
    const card = cards[cardIdx]
    const sym = jenis === 'perkalian' ? '×' : '÷'
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('detail')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 800, letterSpacing: 1 }}>FLASH CARD</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Tabel {sym}{angka}</div>
          </div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>{cardIdx + 1} / {cards.length}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
          {/* Card */}
          <button type="button" onClick={() => setFlipped(f => !f)}
            style={{
              width: '100%', maxWidth: 360, minHeight: 220,
              background: flipped ? 'linear-gradient(135deg,#0e7490,#0284c7)' : 'linear-gradient(135deg,#1e1b4b,#312e81)',
              border: `2px solid ${flipped ? '#67E8F9' : 'rgba(99,102,241,0.4)'}`,
              borderRadius: 24, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: 24, transition: 'all 0.2s',
              boxShadow: flipped ? '0 8px 32px rgba(14,116,144,0.3)' : '0 8px 32px rgba(49,46,129,0.3)',
            }}>
            {!flipped ? (
              <>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#c7d2fe' }}>{card.question} = ?</div>
                <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 700 }}>Ketuk untuk lihat jawaban</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'rgba(103,232,249,0.7)' }}>{card.question}</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1 }}>= {card.answer}</div>
              </>
            )}
          </button>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button"
              disabled={cardIdx === 0}
              onClick={() => { setCardIdx(i => i - 1); setFlipped(false) }}
              style={{
                padding: '12px 24px', borderRadius: 14, border: 'none', cursor: cardIdx === 0 ? 'default' : 'pointer',
                background: 'rgba(255,255,255,0.06)', color: cardIdx === 0 ? '#374151' : '#e2e8f0',
                fontFamily: 'inherit', fontSize: 16, fontWeight: 800,
              }}>← Sebelumnya</button>
            <button type="button"
              disabled={cardIdx === cards.length - 1}
              onClick={() => { setCardIdx(i => i + 1); setFlipped(false) }}
              style={{
                padding: '12px 24px', borderRadius: 14, border: 'none', cursor: cardIdx === cards.length - 1 ? 'default' : 'pointer',
                background: cardIdx === cards.length - 1 ? 'rgba(255,255,255,0.04)' : '#0e7490',
                color: cardIdx === cards.length - 1 ? '#374151' : '#fff',
                fontFamily: 'inherit', fontSize: 16, fontWeight: 800,
                boxShadow: cardIdx < cards.length - 1 ? '0 4px 12px rgba(14,116,144,0.3)' : 'none',
              }}>Berikutnya →</button>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {cards.map((_, i) => (
              <button key={i} type="button" onClick={() => { setCardIdx(i); setFlipped(false) }}
                style={{
                  width: i === cardIdx ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === cardIdx ? '#6366f1' : i < cardIdx ? '#10b981' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s', padding: 0,
                }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── View: Kuis ────────────────────────────────────────────────────────────
  if (view === 'kuis') {
    const q = kuisQs[kuisIdx]
    const progress = kuisIdx / kuisQs.length
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('detail')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer', padding: 0 }}>✕</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1 }}>KUIS MANDIRI</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>{kuisIdx + 1} / {kuisQs.length}</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(245,158,11,0.12)' }}>
          <div style={{ height: '100%', background: '#f59e0b', width: `${progress * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 20px', gap: 20, maxWidth: 400, margin: '0 auto', width: '100%' }}>
          {/* Question */}
          <div style={{
            width: '100%', minHeight: 120,
            background: kuisFeedback === 'correct' ? 'rgba(16,185,129,0.1)' : kuisFeedback === 'wrong' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${kuisFeedback === 'correct' ? 'rgba(16,185,129,0.4)' : kuisFeedback === 'wrong' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: 20, transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#fde68a' }}>{q.question} = ?</div>
            {kuisFeedback && (
              <div style={{ fontSize: 16, fontWeight: 800, color: kuisFeedback === 'correct' ? '#10b981' : '#f87171' }}>
                {kuisFeedback === 'correct' ? '✅ Benar!' : `❌ Jawaban: ${q.answer}`}
              </div>
            )}
          </div>

          {/* Answer display */}
          <div style={{
            width: '100%', padding: '16px 20px', borderRadius: 14, textAlign: 'center',
            background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(245,158,11,0.2)',
            fontSize: 32, fontWeight: 900, color: kuisInput ? '#fff' : '#374151', minHeight: 64,
            letterSpacing: 4,
          }}>
            {kuisInput || '—'}
          </div>

          {/* Numpad */}
          <div style={{ width: '100%' }}>
            <Numpad value={kuisInput} onChange={setKuisInput} onSubmit={submitKuisAnswer} />
          </div>
        </div>
      </div>
    )
  }

  // ── View: Result ──────────────────────────────────────────────────────────
  if (view === 'result') {
    const sym = jenis === 'perkalian' ? '×' : '÷'
    const reward = REWARD_BY_SCORE[kuisCorrect] || 0
    const pct = kuisCorrect / kuisQs.length
    const emoji = pct === 1 ? '🏆' : pct >= 0.8 ? '🌟' : pct >= 0.6 ? '👍' : '💪'
    const msg = pct === 1 ? 'Sempurna!' : pct >= 0.8 ? 'Bagus sekali!' : pct >= 0.6 ? 'Terus berlatih!' : 'Ayo semangat!'
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        <div style={{ fontSize: 64 }}>{emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fde68a' }}>{msg}</div>
        <div style={{ fontSize: 48, fontWeight: 900 }}>{kuisCorrect}<span style={{ fontSize: 20, color: '#64748B', fontWeight: 600 }}> / {kuisQs.length}</span></div>
        <div style={{ fontSize: 13, color: '#64748B' }}>Tabel {sym}{angka} — Kuis Mandiri</div>

        {reward > 0 && (
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 16, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div>
              <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800 }}>REWARD</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>+{reward} Koin</div>
            </div>
          </div>
        )}

        {/* Wrong answers review */}
        {kuisWrong.length > 0 && (
          <div style={{ width: '100%', maxWidth: 360, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#f87171', fontWeight: 800, marginBottom: 10 }}>YANG PERLU DIULANG</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {kuisWrong.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#94A3B8' }}>{w.question} =</span>
                  <span>
                    <span style={{ color: '#f87171', textDecoration: 'line-through', marginRight: 8 }}>{w.userAnswer}</span>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>{w.correct}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 360 }}>
          <button onClick={startKuis} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', background: '#0e7490', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 Ulang Kuis
          </button>
          <button onClick={goHome} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Tabel Lain
          </button>
        </div>
      </div>
    )
  }

  return null
}
