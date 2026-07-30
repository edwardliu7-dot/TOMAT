/**
 * Seasonal event configuration — authoritative server-side definition.
 * Client mirrors this in src/data/seasonalEvents.js.
 *
 * Events are annual; we check month+day ranges only (no year).
 * Year-spanning events (Natal: Dec 15 – Jan 10) have endMonth < startMonth.
 */

export const SEASONAL_EVENTS = [
  {
    slug: 'kemerdekaan',
    name: 'Kemerdekaan RI',
    emoji: '🇮🇩',
    description: 'Rayakan Hari Kemerdekaan Indonesia ke-81 dengan semangat merah putih!',
    accent: '#E11D48',
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
    bgGradient: 'linear-gradient(135deg,#021408,#0d1f0d)',
    startMonth: 12, startDay: 15,
    endMonth:   1,  endDay:   10,   // year-spanning
    itemIds: ['bingkai_natal', 'tema_natal', 'pet_skin_natal'],
  },
  {
    slug: 'ramadan',
    name: 'Ramadan Mubarak',
    emoji: '🌙',
    description: 'Sambut bulan penuh berkah dengan semangat belajar yang membara!',
    accent: '#7C3AED',
    bgGradient: 'linear-gradient(135deg,#06041a,#100028)',
    startMonth: 2,  startDay: 18,
    endMonth:   3,  endDay:   20,
    itemIds: ['bingkai_ramadan', 'spanduk_ramadan', 'pet_skin_ramadan'],
  },
]

/**
 * Returns true if the given Date falls within the event's active window.
 * Uses month+day only so events repeat annually.
 * Year-spanning events (endMonth < startMonth) wrap correctly.
 */
export function isEventActive(event, now = new Date()) {
  const m = now.getMonth() + 1
  const d = now.getDate()
  const cur   = m * 100 + d
  const start = event.startMonth * 100 + event.startDay
  const end   = event.endMonth   * 100 + event.endDay
  if (start <= end) {
    return cur >= start && cur <= end
  }
  // Year-spanning (e.g. Dec 15 – Jan 10): active if cur >= start OR cur <= end
  return cur >= start || cur <= end
}

/** Returns all events currently active. */
export function getActiveEvents(now = new Date()) {
  return SEASONAL_EVENTS.filter(ev => isEventActive(ev, now))
}

/** Returns the set of item IDs belonging to currently active events. */
export function getActiveEventItemIds(now = new Date()) {
  return new Set(getActiveEvents(now).flatMap(ev => ev.itemIds))
}

/**
 * Returns the end Date of the current occurrence of an annual event window.
 * Used to show countdown timers on the client.
 */
export function getEventEndDate(event, now = new Date()) {
  const year = now.getFullYear()
  const start = event.startMonth * 100 + event.startDay
  const end   = event.endMonth   * 100 + event.endDay
  // Year-spanning and we're past start (e.g. Dec)
  if (start > end && (now.getMonth() + 1) * 100 + now.getDate() >= start) {
    return new Date(year + 1, event.endMonth - 1, event.endDay, 23, 59, 59)
  }
  return new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59)
}
