// Client-side mirror of server/pet-bonuses.js — display info only.
// Actual computation happens server-side; this file drives the shop UI.

export const PET_BONUS_DISPLAY = {
  // Tomi — koin per jawaban benar
  golden:             { label: null,                 icon: null,  color: '#94A3B8', desc: null },
  pet_skin_silver:    { label: '+10% Koin',          icon: '🪙',  color: '#C0C8D8', desc: 'Setiap jawaban benar memberikan 10% koin lebih banyak.' },
  pet_skin_cosmic:    { label: '+25% Koin',          icon: '🪙',  color: '#A78BFA', desc: 'Setiap jawaban benar memberikan 25% koin lebih banyak.' },
  pet_skin_void:      { label: '+50% Koin',          icon: '🪙',  color: '#F59E0B', desc: 'Setiap jawaban benar memberikan 50% koin lebih banyak!' },

  // Kelinsay — EXP per jawaban benar
  pet_kelinsay:       { label: '+15% EXP',           icon: '⭐',  color: '#34D399', desc: 'Setiap jawaban benar memberikan 15% EXP lebih banyak.' },
  pet_kelinsay_senja: { label: '+25% EXP',           icon: '⭐',  color: '#FB923C', desc: 'Setiap jawaban benar memberikan 25% EXP lebih banyak.' },
  pet_kelinsay_malam: { label: '+40% EXP',           icon: '⭐',  color: '#A78BFA', desc: 'Setiap jawaban benar memberikan 40% EXP lebih banyak!' },

  // Monyang — koin + EXP per jawaban benar
  pet_monyong:        { label: '+10% Koin & EXP',    icon: '✨',  color: '#C084FC', desc: '+10% koin dan EXP dari setiap jawaban benar.' },
  pet_monyong_raja:   { label: '+20% Koin & EXP',    icon: '✨',  color: '#D4AF37', desc: '+20% koin dan EXP dari setiap jawaban benar.' },
  pet_monyong_kosmik: { label: '+35% Koin & EXP',    icon: '✨',  color: '#C084FC', desc: '+35% koin dan EXP dari setiap jawaban benar!' },

  // Nananaga — makanan lebih awet
  pet_nananaga:       { label: 'Stamina +25%',       icon: '🍖',  color: '#FB923C', desc: 'Makanan bertahan 25% lebih lama setiap kali diberi makan.' },
  pet_nananaga_merah: { label: 'Stamina +50%',       icon: '🍖',  color: '#F87171', desc: 'Makanan bertahan 50% lebih lama setiap kali diberi makan.' },
  pet_nananaga_es:    { label: 'Stamina ×2',         icon: '🍖',  color: '#7DD3FC', desc: 'Makanan bertahan 2× lebih lama — Nananaga Es tidak pernah lapar!' },
}

export function getPetBonusDisplay(skinId) {
  return PET_BONUS_DISPLAY[skinId] || PET_BONUS_DISPLAY.golden
}
