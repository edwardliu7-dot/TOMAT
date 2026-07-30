import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePlayer } from '../PlayerContext'
import { PAKET_UJIAN } from '../data/soalUjian'

// ── Local storage helpers ─────────────────────────────────────────────────────
const LS_KEY = 'tomat_latihan_ujian_v1'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveHistory(paketId, entry) {
  const h = loadHistory()
  const prev = h[paketId] || { attempts: 0, bestScore: 0, bestPct: 0 }
  h[paketId] = {
    attempts: prev.attempts + 1,
    bestScore: Math.max(prev.bestScore, entry.score),
    bestPct: Math.max(prev.bestPct, entry.pct),
    lastAt: entry.at,
  }
  localStorage.setItem(LS_KEY, JSON.stringify(h))
  return h[paketId]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n) { return String(n).padStart(2, '0') }
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad2(m)}:${pad2(s)}`
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PaketCard({ paket, history, onClick }) {
  const hist = history[paket.id]
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: paket.soft,
        border: `1.5px solid ${paket.accent}33`,
        borderRadius: 18, padding: '18px 20px', cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', gap: 16,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = paket.accent; e.currentTarget.style.background = paket.soft.replace('0.1', '0.18') }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${paket.accent}33`; e.currentTarget.style.background = paket.soft }}
    >
      <span style={{ fontSize: 38, flexShrink: 0 }}>{paket.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#F1F5F9', marginBottom: 2 }}>{paket.title}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: hist ? 8 : 0 }}>{paket.description}</div>
        {hist && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: paket.accent, background: `${paket.accent}1a`, borderRadius: 8, padding: '3px 8px' }}>
              Terbaik: {hist.bestScore}/{paket.questions.length} ({hist.bestPct}%)
            </span>
            <span style={{ fontSize: 11, color: '#64748B' }}>{hist.attempts}× dikerjakan</span>
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 3 }}>
          {paket.questions.length} soal
        </div>
        <div style={{ fontSize: 11, color: '#64748B' }}>{paket.duration} menit</div>
        <div style={{ marginTop: 6, fontSize: 18 }}>›</div>
      </div>
    </button>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LatihanUjianScreen({ goBack }) {
  const { addCoins, addExp } = usePlayer()

  const [view, setView] = useState('home')       // home | intro | exam | result | pembahasan
  const [paket, setPaket] = useState(null)
  const [answers, setAnswers] = useState({})     // { [qIndex]: choiceIndex }
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeUsed, setTimeUsed] = useState(0)
  const [resultData, setResultData] = useState(null)
  const [history, setHistory] = useState(loadHistory)
  const [reviewQ, setReviewQ] = useState(0)
  const [flagged, setFlagged] = useState(new Set())

  const timerRef = useRef(null)

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = useCallback((durationMins) => {
    const total = durationMins * 60
    setTimeLeft(total)
    setTimeUsed(0)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
      setTimeUsed(prev => prev + 1)
    }, 1000)
  }, [])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (view === 'exam' && timeLeft === 0 && paket) {
      handleSubmit(true)
    }
  }, [timeLeft, view]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  function selectPaket(p) {
    setPaket(p)
    setView('intro')
    setAnswers({})
    setFlagged(new Set())
    setCurrentQ(0)
  }

  function startExam() {
    setView('exam')
    startTimer(paket.duration)
  }

  function pickAnswer(qIndex, choiceIndex) {
    setAnswers(prev => ({ ...prev, [qIndex]: choiceIndex }))
  }

  function toggleFlag(qIndex) {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(qIndex)) next.delete(qIndex)
      else next.add(qIndex)
      return next
    })
  }

  function handleSubmit(auto = false) {
    clearInterval(timerRef.current)
    const used = auto ? paket.duration * 60 : (paket.duration * 60 - timeLeft)
    setTimeUsed(used)

    let correct = 0
    paket.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    const pct = Math.round((correct / paket.questions.length) * 100)
    const coinsEarned = Math.round(pct / 10) * 5  // 5 per 10% → max 50
    const expEarned = Math.round(pct / 10) * 10   // 10 per 10% → max 100

    addCoins(coinsEarned)
    addExp(expEarned)

    const entry = { score: correct, pct, at: Date.now() }
    const updated = saveHistory(paket.id, entry)
    setHistory(loadHistory())

    setResultData({ correct, pct, coinsEarned, expEarned, auto, timeUsed: used, updated })
    setView('result')
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const totalQ = paket?.questions.length || 0
  const answeredCount = Object.keys(answers).length
  const timerPct = paket ? (timeLeft / (paket.duration * 60)) * 100 : 100
  const timerColor = timerPct > 50 ? '#34D399' : timerPct > 20 ? '#FBBF24' : '#EF4444'

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div style={{ minHeight: '100vh', background: '#080D18', fontFamily: 'system-ui, sans-serif', paddingBottom: 40 }}>
        <style>{`
          @keyframes luFadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
          .lu-card-enter { animation: luFadeUp 0.3s ease both }
        `}</style>

        {/* Header */}
        <div style={{ padding: '0 20px', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <button
              type="button"
              onClick={goBack}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12, width: 40, height: 40, cursor: 'pointer', color: '#94A3B8', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >‹</button>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#818CF8', marginBottom: 2 }}>MODE LATIHAN</div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#F1F5F9' }}>Simulasi Ujian</h1>
            </div>
          </div>

          {/* Banner */}
          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: 18, padding: '18px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 36 }}>📝</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#A5B4FC', marginBottom: 4 }}>Persiapkan dirimu!</div>
              <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>Kerjakan soal seperti ujian nyata. Timer berjalan, jawaban dinilai otomatis, dan pembahasan tersedia setelah selesai.</div>
            </div>
          </div>

          {/* Paket list */}
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#64748B', marginBottom: 14 }}>PILIH PAKET UJIAN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PAKET_UJIAN.map((p, i) => (
              <div key={p.id} className="lu-card-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                <PaketCard paket={p} history={history} onClick={() => selectPaket(p)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (view === 'intro' && paket) {
    return (
      <div style={{ minHeight: '100vh', background: '#080D18', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '0 20px', paddingTop: 'max(24px, env(safe-area-inset-top))', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <button type="button" onClick={() => setView('home')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12, width: 40, height: 40, cursor: 'pointer', color: '#94A3B8', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>‹</button>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{paket.emoji}</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: '#F1F5F9' }}>{paket.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>{paket.description}</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
            {[
              { icon: '📋', label: 'Jumlah Soal', value: `${paket.questions.length} soal` },
              { icon: '⏱️', label: 'Durasi', value: `${paket.duration} menit` },
              { icon: '⭐', label: 'Lulus Jika', value: '≥ 60%' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '16px 18px', marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#FCD34D', marginBottom: 10 }}>📌 ATURAN UJIAN</div>
            {[
              'Timer berjalan mundur sejak soal pertama ditampilkan',
              'Kamu bisa melompat antar soal dan menandai soal ragu',
              'Setelah waktu habis, ujian dikirim otomatis',
              'Pembahasan lengkap tersedia setelah selesai',
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: '#FBBF24', flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px 36px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <button
            type="button"
            onClick={startExam}
            style={{ width: '100%', background: `linear-gradient(135deg, ${paket.accent}, ${paket.accent}bb)`, border: 'none', borderRadius: 16, padding: '18px', fontSize: 16, fontWeight: 900, color: '#0A0F1E', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5, boxShadow: `0 4px 24px ${paket.accent}44` }}
          >
            MULAI UJIAN →
          </button>
        </div>
      </div>
    )
  }

  // ── EXAM ──────────────────────────────────────────────────────────────────
  if (view === 'exam' && paket) {
    const q = paket.questions[currentQ]
    const selectedAnswer = answers[currentQ]
    const isAnswered = selectedAnswer !== undefined

    return (
      <div style={{ minHeight: '100vh', background: '#080D18', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 540, margin: '0 auto' }}>
        <style>{`
          .lu-option { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px 16px; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.15s; width: 100%; text-align: left; font-family: inherit; }
          .lu-option:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.25); }
          .lu-option.selected { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
          .lu-qnav-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); cursor: pointer; font-size: 12px; font-weight: 700; color: #94A3B8; display: flex; align-items: center; justify-content: center; transition: all 0.12s; font-family: inherit; }
          .lu-qnav-btn.answered { background: rgba(52,211,153,0.15); border-color: #34D399; color: #34D399; }
          .lu-qnav-btn.flagged { background: rgba(251,191,36,0.15); border-color: #FBBF24; color: #FBBF24; }
          .lu-qnav-btn.current { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent); }
        `}</style>

        {/* Timer bar */}
        <div style={{ height: 4, background: '#1E293B', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, transition: 'width 1s linear, background 1s' }} />
        </div>

        {/* Top bar */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>{currentQ + 1}/{totalQ}</span>
            <div style={{ height: 4, width: 80, background: '#1E293B', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${((currentQ + 1) / totalQ) * 100}%`, background: paket.accent, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: timerColor, fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'right' }}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 12px' }}>
          <div style={{ '--accent': paket.accent }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: paket.accent }}>SOAL {currentQ + 1}</span>
              <button
                type="button"
                onClick={() => toggleFlag(currentQ)}
                style={{ background: flagged.has(currentQ) ? 'rgba(251,191,36,0.15)' : 'transparent', border: `1px solid ${flagged.has(currentQ) ? '#FBBF24' : 'rgba(255,255,255,0.12)'}`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: flagged.has(currentQ) ? '#FBBF24' : '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >
                {flagged.has(currentQ) ? '🚩 Ditandai' : '🏳 Tandai'}
              </button>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.6, marginBottom: 24, minHeight: 60 }}>
              {q.soal}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`lu-option${selectedAnswer === i ? ' selected' : ''}`}
                  style={{ '--accent': paket.accent }}
                  onClick={() => pickAnswer(currentQ, i)}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: selectedAnswer === i ? paket.accent : 'rgba(255,255,255,0.08)',
                    color: selectedAnswer === i ? '#0A0F1E' : '#94A3B8',
                    fontSize: 12, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>{opt.label}</span>
                  <span style={{ fontSize: 14, color: selectedAnswer === i ? '#F1F5F9' : '#CBD5E1', fontWeight: selectedAnswer === i ? 700 : 400, lineHeight: 1.4 }}>{opt.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {/* Q navigator */}
          <div style={{ overflowX: 'auto', display: 'flex', gap: 6, marginBottom: 14, paddingBottom: 4 }}>
            {paket.questions.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`lu-qnav-btn${i === currentQ ? ' current' : answers[i] !== undefined ? ' answered' : flagged.has(i) ? ' flagged' : ''}`}
                style={{ '--accent': paket.accent, flexShrink: 0 }}
                onClick={() => setCurrentQ(i)}
              >{i + 1}</button>
            ))}
          </div>

          {/* Prev / Next / Submit */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: currentQ === 0 ? '#334155' : '#94A3B8', cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              ‹ Sebelumnya
            </button>
            {currentQ < totalQ - 1 ? (
              <button type="button" onClick={() => setCurrentQ(q => q + 1)}
                style={{ flex: 1.5, background: paket.soft, border: `1.5px solid ${paket.accent}44`, borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 900, color: paket.accent, cursor: 'pointer', fontFamily: 'inherit' }}>
                Berikutnya ›
              </button>
            ) : (
              <button type="button" onClick={() => {
                const unanswered = totalQ - answeredCount
                if (unanswered > 0) {
                  const ok = window.confirm(`Masih ada ${unanswered} soal belum dijawab. Tetap kumpulkan?`)
                  if (!ok) return
                }
                handleSubmit(false)
              }}
                style={{ flex: 1.5, background: `linear-gradient(135deg, ${paket.accent}, ${paket.accent}bb)`, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 900, color: '#0A0F1E', cursor: 'pointer', fontFamily: 'inherit' }}>
                Kumpulkan ✓
              </button>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#475569' }}>
            {answeredCount}/{totalQ} soal dijawab · {flagged.size} ditandai
          </div>
        </div>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (view === 'result' && resultData && paket) {
    const { correct, pct, coinsEarned, expEarned, auto, timeUsed: tu } = resultData
    const passed = pct >= 60
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'E'
    const gradeColor = pct >= 80 ? '#34D399' : pct >= 60 ? '#FBBF24' : '#EF4444'

    return (
      <div style={{ minHeight: '100vh', background: '#080D18', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 540, margin: '0 auto' }}>
        <style>{`
          @keyframes luScoreIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes luSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
        `}</style>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingTop: 'max(32px, env(safe-area-inset-top))' }}>
          {auto && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#FCA5A5', textAlign: 'center' }}>
              ⏰ Waktu habis — ujian dikumpulkan otomatis
            </div>
          )}

          {/* Score circle */}
          <div style={{ textAlign: 'center', marginBottom: 32, animation: 'luScoreIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', border: `6px solid ${gradeColor}`, margin: '0 auto 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${gradeColor}11`, boxShadow: `0 0 40px ${gradeColor}33` }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#F1F5F9' }}>{pct}%</span>
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: '#F1F5F9' }}>
              {passed ? '🎉 Lulus!' : '💪 Terus semangat!'}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>{paket.title}</p>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, animation: 'luSlideUp 0.4s 0.2s ease both' }}>
            {[
              { icon: '✅', label: 'Benar', value: correct, color: '#34D399' },
              { icon: '❌', label: 'Salah', value: paket.questions.length - correct, color: '#EF4444' },
              { icon: '⏱️', label: 'Waktu dipakai', value: formatTime(tu), color: '#67E8F9' },
              { icon: '🪙', label: 'Koin didapat', value: `+${coinsEarned}`, color: '#FBBF24' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Reward */}
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, animation: 'luSlideUp 0.4s 0.3s ease both' }}>
            <span style={{ fontSize: 32 }}>🎁</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FCD34D', marginBottom: 4 }}>Reward didapat!</div>
              <div style={{ fontSize: 12, color: '#CBD5E1' }}>+{coinsEarned} koin · +{expEarned} EXP</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => { setReviewQ(0); setView('pembahasan') }}
            style={{ background: `linear-gradient(135deg, ${paket.accent}, ${paket.accent}bb)`, border: 'none', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 900, color: '#0A0F1E', cursor: 'pointer', fontFamily: 'inherit' }}>
            Lihat Pembahasan
          </button>
          <button type="button" onClick={() => { setAnswers({}); setFlagged(new Set()); setCurrentQ(0); startTimer(paket.duration); setView('exam') }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 700, color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}>
            Ulangi Ujian
          </button>
          <button type="button" onClick={() => setView('home')}
            style={{ background: 'transparent', border: 'none', padding: '10px', fontSize: 13, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
            Kembali ke pilihan paket
          </button>
        </div>
      </div>
    )
  }

  // ── PEMBAHASAN ────────────────────────────────────────────────────────────
  if (view === 'pembahasan' && paket) {
    const q = paket.questions[reviewQ]
    const userAns = answers[reviewQ]
    const isCorrect = userAns === q.answer

    return (
      <div style={{ minHeight: '100vh', background: '#080D18', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 540, margin: '0 auto' }}>
        <style>{`
          @keyframes luFadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
          .lu-review-enter { animation: luFadeUp 0.25s ease both }
        `}</style>

        {/* Header */}
        <div style={{ padding: '12px 20px', paddingTop: 'max(16px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button type="button" onClick={() => setView('result')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#94A3B8', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#64748B' }}>PEMBAHASAN</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{paket.title}</div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>{reviewQ + 1}/{totalQ}</div>
        </div>

        {/* Q navigator */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
            {paket.questions.map((q2, i) => {
              const ua = answers[i]
              const correct2 = ua === q2.answer
              const unanswered = ua === undefined
              return (
                <button key={i} type="button" onClick={() => setReviewQ(i)} style={{
                  width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${i === reviewQ ? paket.accent : unanswered ? 'rgba(255,255,255,0.1)' : correct2 ? '#34D399' : '#EF4444'}`,
                  background: i === reviewQ ? `${paket.accent}22` : unanswered ? 'transparent' : correct2 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                  color: i === reviewQ ? paket.accent : unanswered ? '#475569' : correct2 ? '#34D399' : '#EF4444',
                  fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                }}>{i + 1}</button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div key={reviewQ} className="lu-review-enter" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: paket.accent }}>SOAL {reviewQ + 1}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? '#34D399' : userAns === undefined ? '#94A3B8' : '#EF4444', background: isCorrect ? 'rgba(52,211,153,0.12)' : userAns === undefined ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.12)', borderRadius: 8, padding: '3px 8px' }}>
              {userAns === undefined ? 'Tidak dijawab' : isCorrect ? '✓ Benar' : '✗ Salah'}
            </span>
          </div>

          {/* Question */}
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.6, marginBottom: 20 }}>{q.soal}</div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {q.options.map((opt, i) => {
              const isRight = i === q.answer
              const isChosen = i === userAns
              let bg = 'rgba(255,255,255,0.04)'
              let border = 'rgba(255,255,255,0.08)'
              let textColor = '#94A3B8'
              let badgeBg = 'rgba(255,255,255,0.08)'
              let badgeColor = '#64748B'
              if (isRight) { bg = 'rgba(52,211,153,0.1)'; border = '#34D399'; textColor = '#34D399'; badgeBg = '#34D399'; badgeColor = '#0A0F1E' }
              else if (isChosen && !isRight) { bg = 'rgba(239,68,68,0.1)'; border = '#EF4444'; textColor = '#FCA5A5'; badgeBg = '#EF4444'; badgeColor = '#fff' }
              return (
                <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: badgeBg, color: badgeColor, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{opt.label}</span>
                  <span style={{ fontSize: 13, color: textColor, lineHeight: 1.4 }}>{opt.value}</span>
                  {isRight && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
                  {isChosen && !isRight && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✗</span>}
                </div>
              )
            })}
          </div>

          {/* Pembahasan */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#818CF8', letterSpacing: 1.2, marginBottom: 10 }}>💡 PEMBAHASAN</div>
            <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', lineHeight: 1.7 }}>{q.pembahasan}</p>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 20px 36px', display: 'flex', gap: 10, flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button type="button" onClick={() => setReviewQ(q => Math.max(0, q - 1))} disabled={reviewQ === 0}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: reviewQ === 0 ? '#334155' : '#94A3B8', cursor: reviewQ === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            ‹ Prev
          </button>
          {reviewQ < totalQ - 1 ? (
            <button type="button" onClick={() => setReviewQ(q => q + 1)}
              style={{ flex: 1.5, background: paket.soft, border: `1.5px solid ${paket.accent}44`, borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 900, color: paket.accent, cursor: 'pointer', fontFamily: 'inherit' }}>
              Next ›
            </button>
          ) : (
            <button type="button" onClick={() => setView('result')}
              style={{ flex: 1.5, background: `linear-gradient(135deg, ${paket.accent}, ${paket.accent}bb)`, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 900, color: '#0A0F1E', cursor: 'pointer', fontFamily: 'inherit' }}>
              Selesai ✓
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
