// Client-side mirror of server/pet-bonuses.js — display info only.
// Actual computation happens server-side; this file drives the shop UI.
// RARITY ORDER: umum → langka → epic (epic = most powerful)

export const PET_BONUS_DISPLAY = {
  // ── Tomi — koin booster (umum → umum → langka → epic) ──────────────────────
  golden:             { label: null,                 icon: null,  color: '#94A3B8', desc: null },
  pet_skin_silver:    { label: '+10% Koin',          icon: '🪙',  color: '#C0C8D8', desc: 'Setiap jawaban benar memberikan 10% koin lebih banyak.' },
  pet_skin_cosmic:    { label: '+25% Koin',          icon: '🪙',  color: '#A78BFA', desc: 'Setiap jawaban benar memberikan 25% koin lebih banyak.' },   // langka
  pet_skin_void:      { label: '+50% Koin',          icon: '🪙',  color: '#F59E0B', desc: 'Setiap jawaban benar memberikan 50% koin lebih banyak!' },  // epic

  // ── Kelinsay — EXP booster (umum → umum → epic) ───────────────────────────
  pet_kelinsay:       { label: '+15% EXP',           icon: '⭐',  color: '#34D399', desc: 'Setiap jawaban benar memberikan 15% EXP lebih banyak.' },
  pet_kelinsay_senja: { label: '+25% EXP',           icon: '⭐',  color: '#FB923C', desc: 'Setiap jawaban benar memberikan 25% EXP lebih banyak.' },
  pet_kelinsay_malam: { label: '+40% EXP',           icon: '⭐',  color: '#A78BFA', desc: 'Setiap jawaban benar memberikan 40% EXP lebih banyak!' },  // epic

  // ── Monyang — koin + EXP booster (langka → langka → epic) ─────────────────
  pet_monyong:        { label: '+20% Koin & EXP',    icon: '✨',  color: '#FB923C', desc: '+20% koin dan EXP dari setiap jawaban benar.' },            // langka
  pet_monyong_raja:   { label: '+30% Koin & EXP',    icon: '✨',  color: '#D4AF37', desc: '+30% koin dan EXP dari setiap jawaban benar.' },            // langka
  pet_monyong_kosmik: { label: '+50% Koin & EXP',    icon: '✨',  color: '#C084FC', desc: '+50% koin dan EXP dari setiap jawaban benar!' },            // epic

  // ── Nananaga — stamina booster (epic → epic → epic) ───────────────────────
  pet_nananaga:       { label: 'Stamina +25%',       icon: '🍖',  color: '#FB923C', desc: 'Makanan bertahan 25% lebih lama setiap kali diberi makan.' },  // epic
  pet_nananaga_merah: { label: 'Stamina +50%',       icon: '🍖',  color: '#F87171', desc: 'Makanan bertahan 50% lebih lama setiap kali diberi makan.' }, // epic
  pet_nananaga_es:    { label: 'Stamina ×2',         icon: '🍖',  color: '#7DD3FC', desc: 'Makanan bertahan 2× lebih lama — Nananaga Es tidak pernah lapar!' }, // epic
}

export function getPetBonusDisplay(skinId) {
  return PET_BONUS_DISPLAY[skinId] || PET_BONUS_DISPLAY.golden
}
