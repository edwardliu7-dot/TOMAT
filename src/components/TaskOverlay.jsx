import React from 'react'
import { useTask, TYPE_COLORS, TYPE_ICONS, TYPE_LABELS } from '../TaskContext'

// Floating progress overlay shown on top of any game during a task session.
// Rendered by App.jsx when activeSession is non-null; requires no game-file changes.
export default function TaskOverlay() {
  const { activeSession } = useTask()
  if (!activeSession) return null

  const { correctAnswers, totalQuestions, task } = activeSession
  const pct = (correctAnswers / totalQuestions) * 100
  const color = TYPE_COLORS[task.type]
  const icon = TYPE_ICONS[task.type]
  const label = TYPE_LABELS[task.type]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 'var(--shell-max)',
      zIndex: 999,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(8,16,32,0.96)',
        borderTop: `2px solid ${color}`,
        backdropFilter: 'blur(12px)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Type badge */}
        <span style={{
          background: `${color}22`, color, fontSize: 10, fontWeight: 800,
          padding: '3px 9px', borderRadius: 20, letterSpacing: 0.5, flexShrink: 0,
        }}>
          {icon} {label.toUpperCase()}
        </span>

        {/* Progress bar */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: color,
            width: `${pct}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Counter */}
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {correctAnswers}<span style={{ color: '#6B7280' }}>/{totalQuestions}</span>
        </span>
      </div>
    </div>
  )
}
