// Static mirror of the `visual` jsonb seeded server-side (server/schema.js shopItems).
// Kept here so PlayerHeader can render the equipped bingkai ring instantly from
// AuthContext's `user.equippedBingkai` id alone, without an extra fetch to the shop API.
export const BINGKAI_VISUALS = {
  bingkai_neon: { border: '#34D399', style: 'dashed' },
  bingkai_api: { border: '#F87171', style: 'double' },
  bingkai_es: { border: '#67E8F9', style: 'solid' },
  bingkai_sakura: { border: '#F9A8D4', style: 'dotted' },
  bingkai_emas: { border: '#EAB308', style: 'solid', glow: true },
  bingkai_void: { border: '#A855F7', style: 'solid', glow: true },
  bingkai_aurum_sovereign: { border: '#D4AF37', style: 'double', glow: true, luxury: 'aurum' },
  bingkai_void_monarch: { border: '#6366F1', style: 'solid', glow: true, luxury: 'void' },
}

export const SPANDUK_VISUALS = {
  spanduk_galaksi: { gradient: 'linear-gradient(90deg,#312e81,#581c87,#000)' },
  spanduk_hutan: { gradient: 'linear-gradient(90deg,#064e3b,#134e4a)' },
  spanduk_retro: { gradient: 'linear-gradient(90deg,#374151,#111827)' },
  spanduk_celestia_relic: { gradient: 'linear-gradient(115deg,#020617,#172554 48%,#e0f2fe)', luxury: 'celestia' },
  spanduk_royal_mathematician: { gradient: 'linear-gradient(115deg,#17120c,#45351b 48%,#d4af37)', luxury: 'royal' },
}

export const KATEGORI_LABELS = {
  bingkai:  'Bingkai',
  spanduk:  'Spanduk',
  tema:     'Tema',
  stiker:   'Stiker',
  pet_skin: '🐹 Tomi',
}

// Pet skin metadata — mirrors shop_items seed in server/schema.js
export const PET_SKIN_INFO = {
  golden: {
    nama: 'Golden Marmut', tier: 'STANDAR', tierColor: '#F5A623',
    desc: 'Skin bawaan Tomi. Bulu emas mengkilap, rosette khas marmut.',
    free: true,
  },
  pet_skin_silver: {
    nama: 'Silver Fluff', tier: 'PREMIUM', tierColor: '#C0C8D8',
    desc: 'Bulu perak berkilau. Menunjukkan siswa aktif dan rajin mengumpulkan koin.',
    glow: 'rgba(192,200,216,0.35)',
  },
  pet_skin_cosmic: {
    nama: 'Cosmic Fluff', tier: 'EKSKLUSIF', tierColor: '#A78BFA',
    desc: 'Bulu ungu-biru galaksi dengan bintang berkelip di rosette. Mengesankan.',
    glow: 'rgba(167,139,250,0.45)',
  },
  pet_skin_void: {
    nama: 'Void Emperor', tier: 'LEGENDARIS', tierColor: '#F59E0B',
    desc: 'Bulu hitam pekat berpendar emas, mahkota emas. Dominasi leaderboard.',
    glow: 'rgba(245,158,11,0.55)',
  },
}

// Hardcoded food catalog for shop display (matches server/pet.js PET_FOODS)
export const PET_FOOD_CATALOG = [
  { id: 'wortel_kecil',  nama: 'Wortel Kecil',  emoji: '🥕', harga: 30,  dur: '2 jam',  color: '#F5A623' },
  { id: 'sayuran_segar', nama: 'Sayuran Segar', emoji: '🥦', harga: 80,  dur: '6 jam',  color: '#34D399' },
  { id: 'buah_premium',  nama: 'Buah Premium',  emoji: '🍓', harga: 200, dur: '16 jam', color: '#F472B6' },
  { id: 'pesta_mewah',   nama: 'Pesta Mewah',   emoji: '🫐', harga: 500, dur: '3 hari', color: '#A78BFA' },
]

// Static catalog of stiker visuals — mirrors shop_items seed in server/schema.js.
// Used by ShopScreen item previews and profile banner sticker rendering.
export const STIKER_VISUALS = {
  stiker_roket:   { emoji: '🚀', nama: 'Roket Belajar', tier: 'common' },
  stiker_api:     { emoji: '🔥', nama: 'Api Semangat',  tier: 'common' },
  stiker_petir:   { emoji: '⚡', nama: 'Kilat Pintar',  tier: 'common' },
  stiker_bintang: { emoji: '⭐', nama: 'Bintang Lima',  tier: 'common' },
  stiker_awan:    { emoji: '☁️', nama: 'Awan Cerah',    tier: 'common' },
  stiker_hati:    { emoji: '💜', nama: 'Hati Ungu',     tier: 'common' },
  stiker_otak:    { emoji: '🧠', nama: 'Brainiac',      tier: 'rare'   },
  stiker_mahkota: { emoji: '👑', nama: 'Mahkota',       tier: 'rare'   },
  stiker_berlian: { emoji: '💎', nama: 'Berlian',       tier: 'rare'   },
  stiker_medali:  { emoji: '🏅', nama: 'Medali Emas',   tier: 'rare'   },
  stiker_naga:    { emoji: '🐉', nama: 'Sang Naga',     tier: 'epic'   },
  stiker_galaksi: { emoji: '🌌', nama: 'Galaksi',       tier: 'epic'   },
}

export const STIKER_TIER_LABEL = { common: 'Umum', rare: 'Langka', epic: 'Epik' }
