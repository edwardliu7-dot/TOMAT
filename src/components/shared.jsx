import React from 'react'
import { usePlayer } from '../PlayerContext'
import { useAuth } from '../AuthContext'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../difficulty'
import { BINGKAI_VISUALS } from '../shopVisuals'

export function TopBar({ title, onBack, accentColor = '#67E8F9', rightElement }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: 12 }}>
      <button onClick={onBack} style={{
        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
        width: 40, height: 40, borderRadius: 10, cursor: 'pointer', fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>←</button>
      <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, flex: 1 }}>{title}</h2>
      {rightElement}
    </div>
  )
}

// Small pill showing the active difficulty tier (or "Survival" streak) next to a TopBar title.
export function DifficultyBadge({ difficulty, survival, streak }) {
  if (survival) {
    return (
      <span style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
        🔥 Survival · {streak ?? 0}
      </span>
    )
  }
  if (!difficulty) return null
  const color = DIFFICULTY_COLORS[difficulty] || '#67E8F9'
  return (
    <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
      {DIFFICULTY_LABELS[difficulty] || difficulty}
    </span>
  )
}

// Shared "game over" screen for Survival mode: shown instead of the normal feedback/next-
// question UI the instant a wrong answer is recorded. Reused by every minigame.
export function SurvivalOverScreen({ streak, onRetry, goBack, accentColor = '#F87171' }) {
  const { reportSurvivalStreak } = usePlayer()
  const reportedRef = React.useRef(false)
  React.useEffect(() => {
    if (reportedRef.current) return
    reportedRef.current = true
    reportSurvivalStreak?.(streak)
  }, [streak, reportSurvivalStreak])
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔥 Survival Berakhir" onBack={goBack} accentColor={accentColor} />
      <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 56 }}>💀</div>
        <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center' }}>Jawaban salah — perjalanan survival-mu berakhir di sini.</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase' }}>Soal Benar Berturut-turut</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#EAB308' }}>{streak}</div>
        </div>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Btn onClick={onRetry} color={accentColor}>🔁 Coba Lagi</Btn>
          <Btn onClick={goBack} color="#334155">⬅ Kembali</Btn>
        </div>
      </div>
    </div>
  )
}

export function PlayerHeader({ onAvatarClick, onNotificationTaskClick }) {
  const { player } = usePlayer()
  const { logout, user } = useAuth()
  const { tasks = [] } = useTask() || {}
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const activeTasks = tasks.filter(task => task.status === 'active')
  const expPct = Math.min(100, Math.round((player.exp / player.maxExp) * 100))
  const bingkai = user?.equippedBingkai ? BINGKAI_VISUALS[user.equippedBingkai] : null
  return (
    <div style={{
      padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(10,11,20,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 20,
    }}>
      <button onClick={onAvatarClick} disabled={!onAvatarClick} style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0, padding: 0,
        cursor: onAvatarClick ? 'pointer' : 'default',
        background: user?.photoUrl ? `url(${user.photoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #10B981, #06B6D4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800, color: '#fff',
        border: bingkai ? `3px ${bingkai.style} ${bingkai.border}` : '2px solid rgba(16,185,129,0.4)',
        boxShadow: bingkai?.glow ? `0 0 14px ${bingkai.border}88` : '0 0 12px rgba(16,185,129,0.2)',
      }}>{!user?.photoUrl && player.name[0].toUpperCase()}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#34D399', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          ⭐ Level {player.level}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 1 }}>{player.name}</div>
        <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 5, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${expPct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #06B6D4)', borderRadius: 99, transition: 'width 0.6s ease', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{player.exp} / {player.maxExp} EXP</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 900, color: '#FBBF24',
          background: 'rgba(251,191,36,0.1)', padding: '4px 10px', borderRadius: 20,
          border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 4,
        }}>🪙 {player.coins}</div>
      </div>
      {onNotificationTaskClick && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setNotificationsOpen(open => !open)}
            title="Notifikasi tugas"
            aria-label={`Notifikasi tugas${activeTasks.length ? `, ${activeTasks.length} tugas aktif` : ''}`}
            aria-expanded={notificationsOpen}
            style={{
              position: 'relative', width: 36, height: 36, borderRadius: 10,
              background: notificationsOpen ? 'rgba(103,232,249,0.16)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${notificationsOpen ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.08)'}`,
              color: '#67E8F9', cursor: 'pointer', fontSize: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            🔔
            {activeTasks.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18,
                padding: '0 4px', borderRadius: 99, background: '#EF4444', color: '#fff',
                fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #0A0B14',
              }}>{activeTasks.length}</span>
            )}
          </button>
          {notificationsOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0, width: 290, maxWidth: 'calc(100vw - 32px)',
              background: '#151923', border: '1px solid rgba(103,232,249,0.25)',
              borderRadius: 16, boxShadow: '0 14px 34px rgba(0,0,0,0.45)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 13, fontWeight: 800,
              }}>
                🔔 Tugas Baru
              </div>
              {activeTasks.length === 0 ? (
                <div style={{ padding: '18px 14px', color: '#64748B', fontSize: 12, textAlign: 'center' }}>
                  Tidak ada tugas aktif saat ini.
                </div>
              ) : (
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeTasks.map(task => {
                    const color = TYPE_COLORS[task.type] || '#67E8F9'
                    return (
                      <button
                        key={task.id}
                        onClick={() => {
                          setNotificationsOpen(false)
                          onNotificationTaskClick(task)
                        }}
                        style={{
                          width: '100%', textAlign: 'left', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33`,
                          borderRadius: 12, padding: '10px 11px', color: '#fff', fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 21 }}>{task.gameEmoji || '🎮'}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.gameName}
                            </span>
                            <span style={{ display: 'block', marginTop: 3, color, fontSize: 10, fontWeight: 700 }}>
                              {TYPE_ICONS[task.type] || '📝'} {TYPE_LABELS[task.type] || 'Tugas'} · {task.totalQuestions} soal
                            </span>
                          </span>
                          <span style={{ color: '#67E8F9', fontSize: 15 }}>▶</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <button onClick={logout} title="Keluar" style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
        color: '#64748B', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 15, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>⏻</button>
    </div>
  )
}

export function Card({ children, style = {}, border = 'rgba(255,255,255,0.08)' }) {
  return (
    <div style={{
      background: '#1E2128', borderRadius: 16, border: `1px solid ${border}`,
      padding: '16px', ...style
    }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, disabled, color = '#6366F1', textColor = '#fff', style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#374151' : color,
      color: disabled ? '#6B7280' : textColor,
      border: 'none', borderRadius: 12, padding: '14px 20px',
      fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', fontFamily: 'inherit', transition: 'opacity 0.2s',
      opacity: disabled ? 0.6 : 1, ...style,
    }}>{children}</button>
  )
}

export function OptionGrid({ options, onSelect, correct = null, disabled = false, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10 }}>
      {options.map((opt, i) => {
        const isCorrect = correct !== null && opt === correct
        const bg = correct !== null ? (isCorrect ? '#16a34a' : '#1E2128') : '#1E2128'
        const border = correct !== null ? (isCorrect ? '#22c55e' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.08)'
        return (
          <button key={i} onClick={() => !disabled && onSelect(opt)} style={{
            background: bg, border: `2px solid ${border}`, borderRadius: 12,
            padding: '14px 8px', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>{opt}</button>
        )
      })}
    </div>
  )
}

// FeedbackBanner supports two call patterns:
//   New (G7 games): <FeedbackBanner message="..." isCorrect={bool} extras="..." />
//   Legacy (G8/G9): <FeedbackBanner correct={bool} answer={val} onNext={fn} />
export function FeedbackBanner({ message, isCorrect, extras, correct, answer, onNext }) {
  // Resolve which pattern is being used
  const resolvedIsCorrect = isCorrect !== undefined ? isCorrect : correct
  const resolvedMessage = message !== undefined
    ? message
    : resolvedIsCorrect
      ? `✅ Benar! Jawaban: ${answer}`
      : `❌ Salah! Jawaban yang benar: ${answer}`
  if (resolvedMessage === null || resolvedMessage === undefined || resolvedMessage === '') return null
  return (
    <>
      <div style={{
        padding: '14px 16px', borderRadius: 12, marginTop: 16,
        background: resolvedIsCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
        border: `1px solid ${resolvedIsCorrect ? '#16a34a' : '#dc2626'}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: resolvedIsCorrect ? '#4ade80' : '#f87171' }}>{resolvedMessage}</div>
        {resolvedIsCorrect && extras && <div style={{ fontSize: 14, color: '#EAB308', marginTop: 4 }}>{extras}</div>}
        {resolvedIsCorrect && !extras && onNext && <div style={{ fontSize: 14, color: '#EAB308', marginTop: 4 }}>+50 Koin | +100 EXP</div>}
      </div>
      {onNext && (
        <Btn onClick={onNext} color="#0e7490" style={{ marginTop: 8 }}>Misi Berikutnya ▶</Btn>
      )}
    </>
  )
}

// ── Keyboard-first numeric answer field ──────────────────────────────────────
// Use instead of SliderInput when the student should TYPE the answer.
export function NumericInput({ value, onChange, onSubmit, unit = '', accentColor = '#67E8F9', placeholder = 'Ketik jawaban…', disabled = false }) {
  const handleKey = (e) => { if (e.key === 'Enter' && !disabled) onSubmit?.() }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="number" inputMode="numeric" value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.06)', border: `2px solid ${accentColor}55`,
          borderRadius: 14, padding: '18px 20px', fontSize: 32, fontWeight: 900,
          color: '#fff', textAlign: 'center', width: '100%', outline: 'none',
          fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = accentColor }}
        onBlur={e => { e.target.style.borderColor = `${accentColor}55` }}
      />
      {unit && <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>Satuan: <strong style={{ color: '#fff' }}>{unit}</strong></div>}
    </div>
  )
}

// ── 2×2 / 4-option multiple-choice tile grid ─────────────────────────────────
// `options` — array of strings/numbers shown as tiles.
// `correct`  — the correct value; null while waiting for input.
// Pass `cols` to override the 2-column default (e.g. cols=1 for Yes/No pairs).
export function MultipleChoice({ options, selected, onSelect, correct = null, disabled = false, accentColor = '#67E8F9', cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {options.map((opt, i) => {
        const isCorrect = correct !== null && String(opt) === String(correct)
        const isWrong   = correct !== null && String(selected) === String(opt) && !isCorrect
        let bg = '#1E2128', border = 'rgba(255,255,255,0.1)'
        if (isCorrect) { bg = 'rgba(34,197,94,0.15)';  border = '#22c55e' }
        else if (isWrong)  { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444' }
        else if (String(selected) === String(opt)) { bg = `${accentColor}22`; border = accentColor }
        return (
          <button key={i} onClick={() => !disabled && onSelect(opt)} style={{
            background: bg, border: `2px solid ${border}`, borderRadius: 14,
            padding: '18px 10px', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.18s', textAlign: 'center', lineHeight: 1.3,
          }}>{String(opt)}</button>
        )
      })}
    </div>
  )
}

// ── Unified answer feedback + "Next" button ───────────────────────────────────
// Replaces the old FeedbackBanner usage in G8/G9 games.
export function GameFeedback({ correct, correctAnswer, onNext, unit = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '18px 16px', borderRadius: 16, textAlign: 'center',
        background: correct ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${correct ? '#22c55e' : '#ef4444'}`,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{correct ? '✅' : '❌'}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: correct ? '#4ade80' : '#f87171' }}>
          {correct ? 'Benar! Mantap 🎉' : 'Belum tepat'}
        </div>
        {!correct && correctAnswer !== undefined && (
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 6 }}>
            Jawaban yang benar:{' '}
            <span style={{ color: '#fff', fontWeight: 800 }}>{correctAnswer}{unit ? ' ' + unit : ''}</span>
          </div>
        )}
        {correct && <div style={{ fontSize: 13, color: '#EAB308', marginTop: 6 }}>+50 🪙 &nbsp;+100 XP</div>}
      </div>
      <button onClick={onNext} style={{
        background: '#1E2128', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
        padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>Soal Berikutnya →</button>
    </div>
  )
}

// Computes a randomized [min,max] range for a SliderInput so the answer never sits at a
// predictable position (e.g. always in the middle, or always a fixed offset from an edge).
// Pass every value that MUST be visible on the slider (answer, start value, reference marks)
// as `mustInclude`. Randomizes independent left/right padding and occasionally widens the
// range further, then snaps to `step`. Call this once per new question (inside genQ()), not
// on every render, so the range itself is part of the randomized question state.
export function randomSliderRange(mustInclude, { step = 1, minPad = 6, maxPad = 30 } = {}) {
  const lo = Math.min(...mustInclude)
  const hi = Math.max(...mustInclude)
  const padLeft = minPad + Math.random() * (maxPad - minPad)
  const padRight = minPad + Math.random() * (maxPad - minPad)
  const snap = (v) => Math.round(v / step) * step
  let min = snap(lo - padLeft)
  let max = snap(hi + padRight)
  if (max <= min) max = min + step * 10
  return { min, max }
}

// Big touch-friendly slider for numeric answers. Replaces numpad/typing wherever the
// answer is a single number moving along a line (temperature, position, quantity, etc).
export function SliderInput({
  value, min, max, step = 1, onChange, disabled = false,
  accentColor = '#67E8F9', unit = '', markEvery = null,
  leftLabel, rightLabel, big = false, label,
}) {
  const pct = ((value - min) / (max - min)) * 100
  const marks = markEvery ? (() => {
    const arr = []
    for (let m = min; m <= max; m += markEvery) arr.push(m)
    return arr
  })() : null
  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: big ? 38 : 28, fontWeight: 900, color: '#fff' }}>
          {label !== undefined ? label : `${value}${unit}`}
        </span>
      </div>
      <div style={{ position: 'relative', padding: '8px 4px' }}>
        <div style={{ position: 'relative', height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`, transition: 'width 0.1s' }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', top: -13, left: 0, width: '100%', height: 36,
            appearance: 'none', background: 'transparent', margin: 0, cursor: disabled ? 'default' : 'pointer',
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none; width: 36px; height: 36px; border-radius: 50%;
            background: ${accentColor}; border: 4px solid #0F1115; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: ${disabled ? 'default' : 'grab'};
          }
          input[type=range]::-moz-range-thumb {
            width: 36px; height: 36px; border-radius: 50%; border: 4px solid #0F1115;
            background: ${accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: ${disabled ? 'default' : 'grab'};
          }
        `}</style>
      </div>
      {marks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: 2 }}>
          {marks.map(m => <span key={m} style={{ fontSize: 10, color: '#6B7280' }}>{m}</span>)}
        </div>
      )}
      {(leftLabel || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{leftLabel}</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

// Generic drag-and-drop matcher: drag chips from a source tray onto target slots.
// Used for "connect the pipe/bridge piece" style interactions instead of multiple choice text.
export function DragMatch({ items, slots, placed, onPlace, disabled = false, accentColor = '#67E8F9', renderChip, renderSlot }) {
  const [dragId, setDragId] = React.useState(null)

  const handleDrop = (slotId) => {
    if (disabled || dragId == null) return
    onPlace(slotId, dragId)
    setDragId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {items.filter(it => !Object.values(placed).includes(it.id)).map(it => (
          <div key={it.id}
            draggable={!disabled}
            onDragStart={() => setDragId(it.id)}
            onTouchStart={() => setDragId(it.id)}
            onClick={() => setDragId(it.id)}
            style={{
              cursor: disabled ? 'default' : 'grab',
              border: dragId === it.id ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '10px 14px', background: '#1E2128',
              opacity: disabled ? 0.5 : 1, userSelect: 'none',
            }}>
            {renderChip ? renderChip(it) : <span style={{ color: '#fff', fontWeight: 700 }}>{it.label}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {slots.map(slot => {
          const filledId = placed[slot.id]
          const filledItem = items.find(it => it.id === filledId)
          return (
            <div key={slot.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
              onClick={() => dragId != null && handleDrop(slot.id)}
              style={{
                minWidth: 70, minHeight: 60, borderRadius: 12,
                border: `2px dashed ${filledItem ? accentColor : 'rgba(255,255,255,0.25)'}`,
                background: filledItem ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 10px',
              }}>
              {filledItem
                ? (renderChip ? renderChip(filledItem) : <span style={{ color: '#fff', fontWeight: 700 }}>{filledItem.label}</span>)
                : (renderSlot ? renderSlot(slot) : <span style={{ color: '#6B7280', fontSize: 20 }}>+</span>)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MissionCard({ chapter, title, description, onClick, accentColor }) {
  return (
    <div onClick={onClick} style={{
      background: '#1E2128', borderRadius: 16, border: `1px solid rgba(255,255,255,0.08)`,
      padding: '16px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = accentColor }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >
      <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{chapter}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{description}</div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ background: `${accentColor}22`, color: accentColor, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Mulai Misi ▶</span>
      </div>
    </div>
  )
}
