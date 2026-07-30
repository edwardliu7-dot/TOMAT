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
    itemIds: ['bingkai_kemerdekaan', 'tema_nusantara', 'pet_kelinsay_merahputih'],
  },
  {
    slug: 'halloween',
    name: 'Malam Halloween',
    emoji: '🎃',
    description: 'Selamat datang di malam paling menyeramkan sepanjang tahun!',
    accent: '#F97316',
    softBg: 'rgba(249,115,22,0.08)',
    bgGradient: 'linear-gradient(135deg,#0a0503,#1a0e00)',
    startMonth: 10, startDay: 1,
    endMonth:   10, endDay:   31,
    itemIds: ['bingkai_halloween', 'tema_halloween', 'pet_kelinsay_labu'],
  },
  {
    slug: 'natal',
    name: 'Natal & Tahun Baru',
    emoji: '🎄',
    description: 'Selamat merayakan musim paling ceria dan penuh kegembiraan!',
    accent: '#22C55E',
    softBg: 'rgba(34,197,94,0.08)',
    bgGradient: 'linear-gradient(135deg,#021408,#0d1f0d)',
    startMonth: 12, startDay: 15,
    endMonth:   1,  endDay:   10,
    itemIds: ['bingkai_natal', 'tema_natal', 'pet_skin_natal'],
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
  },
]

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
  return SEASONAL_EVENTS.filter(ev => isEventActive(ev, now))
}

/** Get next upcoming event (soonest startDate in future). */
export function getUpcomingEvents(now = new Date()) {
  return SEASONAL_EVENTS.filter(ev => !isEventActive(ev, now))
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
