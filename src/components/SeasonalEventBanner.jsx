import React, { useState, useEffect } from 'react'
import { getActiveEvents, getUpcomingEvents, getEventEndDate, formatCountdown, formatDaysUntil } from '../data/seasonalEvents'

export default function SeasonalEventBanner({ onOpenEventShop }) {
  const [now, setNow] = useState(() => new Date())

  // Tick every minute to update countdown
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const activeEvents  = getActiveEvents(now)
  const upcomingEvents = getUpcomingEvents(now)

  // Show active event(s) first; if none, show teaser for next upcoming
  if (activeEvents.length === 0 && upcomingEvents.length === 0) return null

  // Active event banner
  if (activeEvents.length > 0) {
    const ev = activeEvents[0]
    const endDate = getEventEndDate(ev, now)
    const msLeft  = endDate - now
    const countdown = formatCountdown(msLeft)

    return (
      <div
        style={{
          position: 'relative', overflow: 'hidden',
          border: `1.5px solid ${ev.accent}44`,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${ev.accent}14, rgba(0,0,0,0) 70%), rgba(11,22,40,0.85)`,
          padding: '16px 18px',
          marginBottom: 20,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: `0 0 32px ${ev.accent}18`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onClick={onOpenEventShop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onOpenEventShop?.()}
      >
        {/* Animated glow pulse */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          background: `radial-gradient(ellipse at 0% 50%, ${ev.accent}1a, transparent 55%)`,
        }} />

        {/* Shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${ev.accent}88, transparent)`,
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Emoji */}
        <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>{ev.emoji}</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: 2, color: ev.accent,
              background: `${ev.accent}18`, borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase',
            }}>EVENT AKTIF</span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#94A3B8',
              background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px',
            }}>⏰ {countdown}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#F1F5F9', marginBottom: 2 }}>{ev.name}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>{ev.description}</div>
        </div>

        {/* Arrow */}
        <div style={{
          flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
          background: `${ev.accent}22`, border: `1.5px solid ${ev.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ev.accent, fontSize: 18, fontWeight: 700,
        }}>›</div>
      </div>
    )
  }

  // Upcoming event teaser (smaller, muted)
  const next = upcomingEvents[0]
  const daysUntil = formatDaysUntil(next.nextStart, now)
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '12px 16px',
        background: 'rgba(255,255,255,0.025)',
        marginBottom: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
      onClick={onOpenEventShop}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenEventShop?.()}
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>{next.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>EVENT BERIKUTNYA · {daysUntil.toUpperCase()}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#94A3B8' }}>{next.name}</div>
      </div>
      <span style={{ fontSize: 14, color: '#475569' }}>›</span>
    </div>
  )
}
