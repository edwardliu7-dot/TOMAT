/**
 * Client-side mirror of server/seasonal-events.js
 * Keep in sync manually — no circular imports from server.
 */

export const SEASONAL_EVENTS = [
  {
    slug: 'kemerdekaan',
    name: 'Kemerdekaan RI',
    emoji: '🇮🇩',
    description: 'Rayakan Hari Kemerdekaan Indonesia ke-81 dengan semangat merah putih!',
    accent: '#E11D48',
    softBg: 'rgba(225,29,72,0.08)',
    bgGradient: 'linear-gradient(135deg,#1a0009,#2d0a04)',
    startMonth: 7,  startDay: 15,
    endMonth:   8,  endDay:   31,
    itemIds: ['bingkai_kemerdekaan', 'spanduk_kemerdekaan', 'pet_kelinsay_merahputih'],
  },
  {
    slug: 'ramadan',
    name: 'Ramadan Mubarak',
    emoji: '🌙',
    description: 'Sambut bulan penuh berkah dengan semangat belajar yang membara!',
    accent: '#7C3AED',
    softBg: 'rgba(124,58,237,0.08)',
    bgGradient: 'linear-gradient(135deg,#06041a,#100028)',
    startMonth: 2,  startDay: 18,
    endMonth:   3,  endDay:   20,
    itemIds: ['bingkai_ramadan', 'spanduk_ramadan', 'pet_skin_ramadan'],
    hidden: true,   // hide from shop & banner until ready
  },
]

/** All events that are visible (not hidden). */
export const VISIBLE_EVENTS = SEASONAL_EVENTS.filter(e => !e.hidden)

export function isEventActive(event, now = new Date()) {
  const m = now.getMonth() + 1
  const d = now.getDate()
  const cur   = m * 100 + d
  const start = event.startMonth * 100 + event.startDay
  const end   = event.endMonth   * 100 + event.endDay
  if (start <= end) return cur >= start && cur <= end
  return cur >= start || cur <= end
}

export function getActiveEvents(now = new Date()) {
  return VISIBLE_EVENTS.filter(ev => isEventActive(ev, now))
}

/** Get next upcoming event (soonest startDate in future). */
export function getUpcomingEvents(now = new Date()) {
  return VISIBLE_EVENTS.filter(ev => !isEventActive(ev, now))
    .map(ev => {
      // Compute next start date
      const year = now.getFullYear()
      let next = new Date(year, ev.startMonth - 1, ev.startDay)
      if (next <= now) next = new Date(year + 1, ev.startMonth - 1, ev.startDay)
      return { ...ev, nextStart: next }
    })
    .sort((a, b) => a.nextStart - b.nextStart)
}

/** Compute event end Date for the current active window. */
export function getEventEndDate(event, now = new Date()) {
  const year = now.getFullYear()
  const start = event.startMonth * 100 + event.startDay
  const end   = event.endMonth   * 100 + event.endDay
  if (start > end && (now.getMonth() + 1) * 100 + now.getDate() >= start) {
    return new Date(year + 1, event.endMonth - 1, event.endDay, 23, 59, 59)
  }
  return new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59)
}

/** Format remaining time to a readable string. */
export function formatCountdown(msLeft) {
  if (msLeft <= 0) return 'Berakhir'
  const totalSeconds = Math.floor(msLeft / 1000)
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (days > 0)  return `${days}h ${hours}j lagi`
  if (hours > 0) return `${hours}j ${minutes}m lagi`
  return `${minutes}m lagi`
}

/** Format days remaining until next event start. */
export function formatDaysUntil(date, now = new Date()) {
  const diff = date - now
  const days = Math.ceil(diff / 86400000)
  if (days <= 0)  return 'Hari ini'
  if (days === 1) return 'Besok'
  return `${days} hari lagi`
}
