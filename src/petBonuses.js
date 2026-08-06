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
  pet_kelinsay_malam:      { label: '+40% EXP',           icon: '⭐',  color: '#A78BFA', desc: 'Setiap jawaban benar memberikan 40% EXP lebih banyak!' },  // epic
  pet_kelinsay_merahputih: { label: '+75% EXP',           icon: '🎖️', color: '#E11D48', desc: 'Skin eksklusif event — setiap jawaban benar memberikan 75% EXP lebih banyak!' }, // missionOnly

  // ── Monyang — koin + EXP booster (langka → langka → epic) ─────────────────
  pet_monyong:        { label: '+20% Koin & EXP',    icon: '✨',  color: '#FB923C', desc: '+20% koin dan EXP dari setiap jawaban benar.' },            // langka
  pet_monyong_raja:   { label: '+30% Koin & EXP',    icon: '✨',  color: '#D4AF37', desc: '+30% koin dan EXP dari setiap jawaban benar.' },            // langka
  pet_monyong_kosmik: { label: '+50% Koin & EXP',    icon: '✨',  color: '#C084FC', desc: '+50% koin dan EXP dari setiap jawaban benar!' },            // epic

  // ── Nananaga — wrong-answer immunity + koin & EXP booster (epic → epic → epic)
  pet_nananaga:       { label: '🛡️×1 · +50% Koin & EXP', icon: '🛡️', color: '#FB923C', desc: 'Kebal 1 jawaban salah (duel/turnamen/survival) + setiap jawaban benar memberikan 50% koin & EXP lebih banyak.' },  // epic
  pet_nananaga_merah: { label: '🛡️×2 · +60% Koin & EXP', icon: '🛡️', color: '#F87171', desc: 'Kebal 2 jawaban salah (duel/turnamen/survival) + setiap jawaban benar memberikan 60% koin & EXP lebih banyak.' }, // epic
  pet_nananaga_es:    { label: '🛡️×3 · +70% Koin & EXP', icon: '🛡️', color: '#7DD3FC', desc: 'Kebal 3 jawaban salah (duel/turnamen/survival) + setiap jawaban benar memberikan 70% koin & EXP lebih banyak!' }, // epic
}

export function getPetBonusDisplay(skinId) {
  return PET_BONUS_DISPLAY[skinId] || PET_BONUS_DISPLAY.golden
}

// ── Client-side multiplier maps ────────────────────────────────────────────────
// Mirrors server/pet-bonuses.js — used for OPTIMISTIC display in PlayerContext so
// the UI shows the boosted amount immediately, not just after server reconcile.
export const PET_COIN_MULT = {
  golden:             1.00,
  pet_skin_silver:    1.10,
  pet_skin_cosmic:    1.25,
  pet_skin_void:      1.50,
  pet_monyong:        1.20,
  pet_monyong_raja:   1.30,
  pet_monyong_kosmik: 1.50,
  pet_nananaga:       1.50,
  pet_nananaga_merah: 1.60,
  pet_nananaga_es:    1.70,
}

export const PET_EXP_MULT = {
  golden:                  1.00,
  pet_kelinsay:            1.15,
  pet_kelinsay_senja:      1.25,
  pet_kelinsay_malam:      1.40,
  pet_kelinsay_merahputih: 1.75,
  pet_monyong:             1.20,
  pet_monyong_raja:        1.30,
  pet_monyong_kosmik:      1.50,
  pet_nananaga:            1.50,
  pet_nananaga_merah:      1.60,
  pet_nananaga_es:         1.70,
}

// ── Wrong-immunity helpers ─────────────────────────────────────────────────────
// Maps skinId → number of wrong-answer immunity tokens for duel/tournament/survival.
// Mirrors server/pet-bonuses.js wrongImmunity values — kept in sync manually.
const WRONG_IMMUNITY_MAP = {
  pet_nananaga:       1,
  pet_nananaga_merah: 2,
  pet_nananaga_es:    3,
}

export function getWrongImmunity(skinId) {
  return WRONG_IMMUNITY_MAP[skinId] ?? 0
}
