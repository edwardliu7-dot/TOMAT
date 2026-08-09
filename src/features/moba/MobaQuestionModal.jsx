import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clock3, LoaderCircle, Shield, X } from 'lucide-react'

// ── Game identity map (mirroring App.jsx GAME_MAP but as plain static data) ──
// Used to give each question a themed look without importing heavy components.
const GAME_INFO = {
  // Grade 7 BAB I — Bilangan Bulat
  katak:         { label: 'Katak Pelompat',              emoji: '🐸', color: '#22c55e' },
  termometer:    { label: 'Termometer Ajaib',            emoji: '🌡️', color: '#f97316' },
  pabrikrobot:   { label: 'Pabrik Robot',                emoji: '🤖', color: '#6366f1' },
  gembok:        { label: 'Gembok Roda Gigi',            emoji: '🔒', color: '#eab308' },
  mercusuar:     { label: 'Sinyal Mercusuar',            emoji: '🏮', color: '#f59e0b' },
  sporajamur:    { label: 'Spora Jamur',                 emoji: '🍄', color: '#84cc16' },
  scanner:       { label: 'Scanner Batu Permata',        emoji: '💎', color: '#06b6d4' },
  // Grade 7 BAB II — Bilangan Rasional
  kokipizza:     { label: 'Koki Pizza',                  emoji: '🍕', color: '#ef4444' },
  pipaair:       { label: 'Pipa Air Ajaib',              emoji: '🚿', color: '#06b6d4' },
  bortambang:    { label: 'Bor Tambang',                 emoji: '⛏️', color: '#78716c' },
  kabataku:      { label: 'KaBaTaKu Pecahan',            emoji: '📐', color: '#8b5cf6' },
  baterai:       { label: 'Baterai Ajaib',               emoji: '🔋', color: '#16a34a' },
  timbanganemas: { label: 'Timbangan Emas',              emoji: '⚖️', color: '#d97706' },
  fokusteleskop: { label: 'Fokus Teleskop',              emoji: '🔭', color: '#0284c7' },
  // Grade 7 BAB III — Rasio & Perbandingan
  ramuanjus:     { label: 'Ramuan Jus',                  emoji: '🧃', color: '#f59e0b' },
  kasirsihir:    { label: 'Kasir Sihir',                 emoji: '🪄', color: '#a855f7' },
  benteng:       { label: 'Benteng Kerajaan',            emoji: '🏰', color: '#64748b' },
  nakhoda:       { label: 'Petualangan Nakhoda',         emoji: '⚓', color: '#0369a1' },
  relkereta:     { label: 'Rel Kereta Ekspres',          emoji: '🚂', color: '#dc2626' },
  brankas:       { label: 'Brankas Rahasia',             emoji: '🔐', color: '#92400e' },
  // Grade 8 BAB I – Bilangan Berpangkat
  g8selramuan:   { label: 'Penggandaan Sel Ramuan',      emoji: '🧪', color: '#a855f7' },
  g8racunminiatur:{ label: 'Ekstraksi Racun Miniatur',   emoji: '☠️', color: '#ef4444' },
  g8kristal:     { label: 'Pemisahan Elemen Kristal',    emoji: '💎', color: '#06b6d4' },
  g8fusienergi:  { label: 'Fusi Energi Alkemis',         emoji: '⚗️', color: '#f59e0b' },
  g8mantraakar:  { label: 'Penyederhanaan Mantra Akar',  emoji: '✨', color: '#a78bfa' },
  g8geolog:      { label: 'Ekspedisi Geolog Kerajaan',   emoji: '⛏️', color: '#78716c' },
  // Grade 8 BAB II – Teorema Pythagoras
  g8trebuchet:   { label: 'Bidikan Tepat Trebuchet',     emoji: '⚔️', color: '#dc2626' },
  g8perisai:     { label: 'Restorasi Perisai Kerajaan',  emoji: '🛡️', color: '#2563eb' },
  g8hartakarun:  { label: 'Harta Karun di Sudut Ruangan',emoji: '💰', color: '#d97706' },
  g8inspeksisudut:{ label: 'Inspeksi Sudut Menara',      emoji: '🗼', color: '#64748b' },
  g8petaradar:   { label: 'Peta Radar Pengintai',        emoji: '📡', color: '#0ea5e9' },
  g8taligantung: { label: 'Misi Penyelamatan Tali Gantung',emoji: '🪢', color: '#65a30d' },
  // Grade 8 BAB III – Persamaan Linear
  g8gerbanglogika:{ label: 'Teka-Teki Gerbang Logika',  emoji: '🚪', color: '#7c3aed' },
  g8katrol:      { label: 'Katrol Penyeimbang Jembatan', emoji: '⚙️', color: '#475569' },
  g8gulungan:    { label: 'Penerjemah Gulungan Kuno',    emoji: '📜', color: '#92400e' },
  g8keretakuda:  { label: 'Kapasitas Kereta Kuda',       emoji: '🐴', color: '#854d0e' },
  // Grade 9 BAB I – SPLDV
  g9manifest:    { label: 'Manifest Kargo Alien',        emoji: '📦', color: '#4f46e5' },
  g9plotrute:    { label: 'Plotting Rute Grafik',        emoji: '🗺️', color: '#16a34a' },
  g9interseksi:  { label: 'Interseksi Radar Sinyal',     emoji: '📡', color: '#0891b2' },
  g9konsol:      { label: 'Dekripsi Konsol Komputer',    emoji: '💻', color: '#6d28d9' },
  g9pasargalaksi:{ label: 'Barter Di Pasar Galaksi',    emoji: '👽', color: '#15803d' },
  // Grade 9 BAB II – Lingkaran
  g9kalibrasirada:{ label: 'Kalibrasi Jangkauan Radar', emoji: '🎯', color: '#b91c1c' },
  g9orbit:       { label: 'Kalkulasi Orbit Satelit',     emoji: '🛰️', color: '#1d4ed8' },
  g9shieldgaya:  { label: 'Medan Gaya Shield Pelindung', emoji: '🛡️', color: '#0f766e' },
  g9laserjuring: { label: 'Tembakan Laser Sektor',       emoji: '⚡', color: '#ca8a04' },
  g9asteroid:    { label: 'Jalur Pintas Sabuk Asteroid', emoji: '☄️', color: '#9333ea' },
  // Grade 9 BAB III – Bangun Ruang
  g9boksbaterai: { label: 'Optimalisasi Boks Baterai',   emoji: '🔋', color: '#16a34a' },
  g9refraktor:   { label: 'Refraktor Kristal Energi',    emoji: '💎', color: '#0284c7' },
}

const DEFAULT_GAME_INFO = { label: 'Soal Arena', emoji: '🎮', color: '#6366f1' }

function getGameInfo(gameKey) {
  return (gameKey && GAME_INFO[gameKey]) || DEFAULT_GAME_INFO
}

function formatQuestionTime(remainingMs) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000))
  return `${seconds}s`
}

export default function MobaQuestionModal({
  questionState,
  onAnswer,
  disabled = false,
}) {
  const [now, setNow] = useState(() => Date.now())
  const syncRef = useRef(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const question = questionState?.question
  const gameInfo = getGameInfo(question?.gameKey)

  useEffect(() => {
    setSelectedAnswer('')
    setSubmitting(false)
    if (Number.isFinite(Number(questionState?.serverNow))) {
      syncRef.current = {
        serverNow: Number(questionState.serverNow),
        receivedAt: Date.now(),
      }
    }
  }, [questionState?.questionSessionId])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  const sync = syncRef.current
  const estimatedServerNow = sync
    ? sync.serverNow + (now - sync.receivedAt)
    : now
  const remainingMs = Math.max(0, Number(questionState?.expiresAt || 0) - estimatedServerNow)
  const options = useMemo(() => (
    Array.isArray(question?.options) ? question.options : []
  ), [question?.options])
  const isExpired = remainingMs <= 0
  const isDisabled = disabled || submitting || isExpired || !question

  const submit = async event => {
    event.preventDefault()
    if (isDisabled || selectedAnswer === '') return
    setSubmitting(true)
    try {
      await onAnswer({
        questionSessionId: questionState.questionSessionId,
        answer: selectedAnswer,
      })
    } catch {
      setSubmitting(false)
    }
  }

  if (!questionState || !question) return null

  const accentColor = gameInfo.color
  const pct = Math.min(1, remainingMs / (questionState.expiresAt - (sync?.serverNow ?? estimatedServerNow - remainingMs)))
  const timerUrgent = remainingMs <= 5000

  return (
    <div className="moba12-modal-layer" role="presentation">
      <section
        className="moba12-question-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moba12-question-title"
        style={{ '--moba-accent': accentColor }}
      >
        {/* ── Game identity header ─────────────────────────────────────── */}
        <div className="moba12-game-header">
          <div className="moba12-game-badge" style={{ background: accentColor + '22', borderColor: accentColor + '55' }}>
            <span className="moba12-game-emoji">{gameInfo.emoji}</span>
            <span className="moba12-game-label" style={{ color: accentColor }}>{question.gameLabel || gameInfo.label}</span>
          </div>
          <div className={`moba12-question-timer ${timerUrgent ? 'is-urgent' : ''}`}>
            <Clock3 size={13} />
            {isExpired ? 'Waktu habis' : formatQuestionTime(remainingMs)}
          </div>
        </div>

        {/* ── Timer bar ────────────────────────────────────────────────── */}
        <div className="moba12-timer-track">
          <div
            className="moba12-timer-fill"
            style={{
              width: `${Math.max(0, pct * 100)}%`,
              background: timerUrgent ? '#ef4444' : accentColor,
              transition: 'width 0.25s linear, background 0.5s',
            }}
          />
        </div>

        {/* ── Question prompt ──────────────────────────────────────────── */}
        <h2 id="moba12-question-title" className="moba12-prompt">{question.prompt}</h2>

        {/* ── Answer options ───────────────────────────────────────────── */}
        <form onSubmit={submit}>
          {options.length ? (
            <div className="moba12-answer-options">
              {options.map((option, index) => {
                const value = String(option)
                const isSelected = selectedAnswer === value
                return (
                  <button
                    type="button"
                    className={`moba12-answer-option ${isSelected ? 'is-selected' : ''}`}
                    key={`${value}-${index}`}
                    onClick={() => setSelectedAnswer(value)}
                    disabled={isDisabled}
                    style={isSelected ? {
                      background: accentColor + '22',
                      borderColor: accentColor,
                      color: accentColor,
                    } : undefined}
                  >
                    <span className="moba12-option-letter"
                      style={isSelected ? { background: accentColor, color: '#fff' } : undefined}
                    >{String.fromCharCode(65 + index)}</span>
                    {value}
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              className="moba12-answer-input"
              value={selectedAnswer}
              onChange={event => setSelectedAnswer(event.target.value)}
              placeholder="Tulis jawabanmu"
              disabled={isDisabled}
              autoFocus
            />
          )}

          <button
            className="moba12-submit-answer"
            type="submit"
            disabled={isDisabled || selectedAnswer === ''}
            style={{ background: accentColor }}
          >
            {submitting ? <LoaderCircle size={17} className="moba11-spin" /> : <Check size={17} />}
            {submitting ? 'Memeriksa…' : isExpired ? 'Waktu habis' : 'Kirim jawaban'}
          </button>
        </form>

        <div className="moba12-modal-note">
          <Shield size={13} /> Jawaban benar tidak dikirim ke lawan.
        </div>
      </section>
    </div>
  )
}

export function MobaQuestionResult({ result, onClose }) {
  if (!result) return null
  const isCorrect = result.correct === true
  const isImmune = result.immune === true
  const title = isCorrect
    ? 'Jawaban benar!'
    : result.timedOut
      ? 'Waktu habis'
      : isImmune
        ? 'Perisai Nananaga aktif'
        : 'Jawaban belum tepat'
  const body = isCorrect
    ? `Gulungan +${result.scroll?.points || 0} poin sudah kamu bawa.`
    : result.timedOut || !isImmune
      ? 'Pet terkena stun sementara. Coba lagi setelah pulih.'
      : 'Jawaban belum tepat, tetapi kamu tidak terkena stun.'

  return (
    <div className={`moba12-result moba12-result--${isCorrect ? 'correct' : 'wrong'}`} role="status">
      <div className="moba12-result__icon">
        {isCorrect ? <Check size={19} /> : <X size={19} />}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup hasil">
        <X size={15} />
      </button>
    </div>
  )
}
