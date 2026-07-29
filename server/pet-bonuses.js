// Server-side pet bonus table.
// Skins of the same animal (same pet type) share HP but each skin tier grants
// a different multiplier applied server-side in /api/siswa/player/gain and /pet/feed.
//
// coinMult   — multiplies coin reward after the base cap check
// expMult    — multiplies EXP reward after the base cap check
// hungerMult — multiplies food.hours when feeding (food lasts longer)

export const PET_BONUSES = {
  // ── Tomi — koin booster ────────────────────────────────────────────────────
  golden:             { coinMult: 1.00, expMult: 1.00, hungerMult: 1.00 },
  pet_skin_silver:    { coinMult: 1.10, expMult: 1.00, hungerMult: 1.00 },
  pet_skin_cosmic:    { coinMult: 1.25, expMult: 1.00, hungerMult: 1.00 },
  pet_skin_void:      { coinMult: 1.50, expMult: 1.00, hungerMult: 1.00 },

  // ── Kelinsay — EXP booster ─────────────────────────────────────────────────
  pet_kelinsay:       { coinMult: 1.00, expMult: 1.15, hungerMult: 1.00 },
  pet_kelinsay_senja: { coinMult: 1.00, expMult: 1.25, hungerMult: 1.00 },
  pet_kelinsay_malam: { coinMult: 1.00, expMult: 1.40, hungerMult: 1.00 },

  // ── Monyang — koin + EXP booster ───────────────────────────────────────────
  pet_monyong:        { coinMult: 1.10, expMult: 1.10, hungerMult: 1.00 },
  pet_monyong_raja:   { coinMult: 1.20, expMult: 1.20, hungerMult: 1.00 },
  pet_monyong_kosmik: { coinMult: 1.35, expMult: 1.35, hungerMult: 1.00 },

  // ── Nananaga — stamina booster (makanan lebih awet) ────────────────────────
  pet_nananaga:       { coinMult: 1.00, expMult: 1.00, hungerMult: 1.25 },
  pet_nananaga_merah: { coinMult: 1.00, expMult: 1.00, hungerMult: 1.50 },
  pet_nananaga_es:    { coinMult: 1.00, expMult: 1.00, hungerMult: 2.00 },
}

export function getPetBonus(skinId) {
  return PET_BONUSES[skinId] || PET_BONUSES.golden
}
