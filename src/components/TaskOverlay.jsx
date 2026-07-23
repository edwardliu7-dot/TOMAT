import React from 'react'
import { useTask, TYPE_COLORS, TYPE_ICONS, TYPE_LABELS } from '../TaskContext'

// Floating progress overlay shown on top of any game during a task session.
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
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 'var(--shell-max)', zIndex: 999, pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(8,10,18,0.96)',
        borderTop: `2px solid ${color}`,
        backdropFilter: 'blur(16px)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: `0 -4px 30px ${color}22`,
      }}>
        {/* Type badge */}
        <span style={{
          background: `${color}22`, color, fontSize: 10, fontWeight: 800,
          padding: '4px 10px', borderRadius: 20, letterSpacing: 0.5, flexShrink: 0,
          border: `1px solid ${color}44`,
        }}>
          {icon} {label.toUpperCase()}
        </span>

        {/* Progress bar */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 7, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${color}88, ${color})`,
            width: `${pct}%`, transition: 'width 0.4s ease',
            boxShadow: `0 0 10px ${color}66`,
          }} />
        </div>

        {/* Counter */}
        <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
          <span style={{ color }}>{correctAnswers}</span>
          <span style={{ color: '#374151' }}>/{totalQuestions}</span>
        </span>
      </div>
    </div>
  )
}
