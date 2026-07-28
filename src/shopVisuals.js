// Static mirror of the `visual` jsonb seeded server-side (server/schema.js shopItems).
// Kept here so PlayerHeader can render the equipped bingkai ring instantly from
// AuthContext's `user.equippedBingkai` id alone, without an extra fetch to the shop API.
export const BINGKAI_VISUALS = {
  bingkai_neon:   { image: '/bingkai-neon.png',   border: '#34D399', mixBlend: 'screen', spread: 0.25 },
  bingkai_api:    { image: '/bingkai-api.png',    border: '#F87171', mixBlend: 'screen', spread: 0.30 },
  bingkai_es:     { image: '/bingkai-es.png',     border: '#67E8F9', mixBlend: 'screen', spread: 0.30 },
  bingkai_sakura: { image: '/bingkai-sakura.png', border: '#F9A8D4', mixBlend: 'screen', spread: 0.38 },
  bingkai_emas: { image: '/bingkai-emas.png', border: '#EAB308', mixBlend: 'screen', spread: 0.32, glow: true },
  bingkai_void: { image: '/bingkai-void-king.png', border: '#A855F7', mixBlend: 'screen', spread: 0.30, glow: true },
  bingkai_aurum_sovereign: { image: '/bingkai-aurum-sovereign.png', border: '#D4AF37', mixBlend: 'screen', spread: 0.30, glow: true, limited: true, luxury: 'aurum' },
  bingkai_void_monarch: { image: '/bingkai-void-monarch.png', border: '#6366F1', mixBlend: 'screen', spread: 0.30, glow: true, limited: true, luxury: 'void' },
  bingkai_petal_rose: { image: '/petal-rose.png', border: '#F9A8D4', style: 'solid', spread: 0.25 },
  bingkai_garuda: { image: '/garuda.gif', border: '#F59E0B', style: 'solid', glow: true, spread: 0.55 },
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
  // New animal pets
  pet_kelinsay: {
    nama: 'Kelinsay', tier: 'UMUM', tierColor: '#34D399',
    desc: 'Kelinci putih lembut berhati hangat. Telinganya panjang, selalu mendengarkan.',
    glow: 'rgba(52,211,153,0.30)',
  },
  pet_monyong: {
    nama: 'Monyang', tier: 'EPIC', tierColor: '#C084FC',
    desc: 'Monyet ceria penuh ekspresi. Ekornya selalu berayun dan senyumnya lebar!',
    glow: 'rgba(192,132,252,0.40)',
  },
  pet_nananaga: {
    nama: 'Nananaga', tier: 'LANGKA', tierColor: '#FB923C',
    desc: 'Naga abadi berkuasa. Matanya menyala, sayapnya menggelegar, api di mulutnya.',
    glow: 'rgba(251,146,60,0.50)',
  },
  pet_kelinsay_senja: {
    nama: 'Kelinsay Senja', tier: 'UMUM+', tierColor: '#FB923C',
    desc: 'Bulu hangat warna senja. Muncul saat matahari terbenam, membawa ketenangan dan semangat belajar.',
    glow: 'rgba(249,115,22,0.38)', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay',
  },
  pet_kelinsay_malam: {
    nama: 'Kelinsay Malam', tier: 'PREMIUM', tierColor: '#A78BFA',
    desc: 'Bulu malam bertabur bintang. Pendiam, elegan, dan selalu ditemani cahaya bulan.',
    glow: 'rgba(99,102,241,0.42)', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay',
  },
  pet_monyong_raja: {
    nama: 'Monyang Raja', tier: 'EPIC', tierColor: '#D4AF37',
    desc: 'Mahkota emas bertahta di kepalanya. Monyang Raja memerintah leaderboard dengan senyum lebarnya.',
    glow: 'rgba(212,175,55,0.42)', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong',
  },
  pet_monyong_kosmik: {
    nama: 'Monyang Kosmik', tier: 'EPIC', tierColor: '#C084FC',
    desc: 'Monyet penjelajah galaksi dengan bulu nebula dan bintang-bintang yang berkilau di sekelilingnya.',
    glow: 'rgba(168,85,247,0.48)', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong',
  },
  pet_nananaga_merah: {
    nama: 'Nananaga Merah', tier: 'LANGKA', tierColor: '#F87171',
    desc: 'Naga api merah menyala. Sisiknya membara dan napasnya meninggalkan jejak bara.',
    glow: 'rgba(239,68,68,0.48)', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga',
  },
  pet_nananaga_es: {
    nama: 'Nananaga Es', tier: 'LANGKA', tierColor: '#7DD3FC',
    desc: 'Naga es dari puncak gunung beku. Napasnya membekukan segalanya, matanya biru seperti samudra arktik.',
    glow: 'rgba(56,189,248,0.45)', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga',
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
