import React from 'react'
import { getEventEndDate, formatCountdown } from '../data/seasonalEvents'

const EVENT_IMAGES = {
  kemerdekaan: '/banner%20event%2081.png',
}

export default function EventAnnouncementModal({ event, onClose, onOpenEventShop }) {
  if (!event) return null

  const endDate = getEventEndDate(event)
  const countdown = formatCountdown(endDate - new Date())
  const image = EVENT_IMAGES[event.slug]

  const openShop = () => {
    onClose()
    onOpenEventShop?.()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Event ${event.name}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 10060,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(7px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540, overflow: 'hidden',
          borderRadius: 20,
          background: 'linear-gradient(160deg,#151923,#0b0f18)',
          border: `1px solid ${event.accent}66`,
          boxShadow: `0 12px 50px rgba(0,0,0,0.7), 0 0 34px ${event.accent}2b`,
        }}
      >
        {image ? (
          <img
            src={image}
            alt={`${event.name} — event aktif`}
            style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: event.bgGradient || `linear-gradient(135deg,${event.accent}55,#0b0f18)`,
            fontSize: 72,
          }}>
            {event.emoji}
          </div>
        )}

        <div style={{ padding: '16px 18px 18px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 9px', borderRadius: 999,
            background: `${event.accent}1f`, border: `1px solid ${event.accent}55`,
            color: event.accent, fontSize: 10, fontWeight: 900, letterSpacing: 1.2,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: event.accent }} />
            EVENT SEDANG BERJALAN
          </div>

          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 25 }}>{event.emoji}</span>
            <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: 20, fontWeight: 900 }}>
              {event.name}
            </h2>
          </div>
          <p style={{ margin: '8px 0 0', color: '#CBD5E1', fontSize: 12, lineHeight: 1.55 }}>
            {event.description}
          </p>

          <div style={{
            marginTop: 12, padding: '9px 11px', borderRadius: 10,
            background: 'rgba(255,255,255,0.045)', color: '#94A3B8',
            fontSize: 11, display: 'flex', justifyContent: 'space-between', gap: 10,
          }}>
            <span>⏰ Berakhir dalam</span>
            <strong style={{ color: '#F8FAFC' }}>{countdown}</strong>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 11,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#CBD5E1',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Nanti
            </button>
            <button
              onClick={openShop}
              style={{
                flex: 1.5, padding: '10px 12px', borderRadius: 11, border: 'none',
                background: `linear-gradient(135deg,${event.accent},${event.accent}bb)`,
                color: '#fff', fontSize: 12, fontWeight: 900, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: `0 4px 18px ${event.accent}44`,
              }}
            >
              Lihat Hadiah & Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}