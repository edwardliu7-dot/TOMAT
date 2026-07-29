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
  spanduk_celestia_relic: { gradient: 'linear-gradient(115deg,#020617,#172554 48%,#e0f2fe)', luxury: 'celestia', image: '/celestia-relic.svg' },
  spanduk_royal_mathematician: { gradient: 'linear-gradient(115deg,#17120c,#45351b 48%,#d4af37)', luxury: 'royal', image: '/dekrit-mahaguru.svg' },
}

// Tema visuals — mirrors shop_items seed in server/schema.js
export const TEMA_VISUALS = {
  tema_space: { accent: '#22d3ee', gradient: 'linear-gradient(135deg,#020610,#0a0f1e)', swatches: ['#020610','#0a0f1e','#22d3ee','#6366f1'], label: 'Luar Angkasa' },
  tema_hutan: { accent: '#4ade80', gradient: 'linear-gradient(135deg,#021408,#04230e)', swatches: ['#021408','#04230e','#4ade80','#2dd4bf'], label: 'Hutan Mistis' },
  tema_api:   { accent: '#f59e0b', gradient: 'linear-gradient(135deg,#150502,#2d0a04)', swatches: ['#150502','#2d0a04','#f59e0b','#ef4444'], label: 'Api Merah'   },
  tema_salju: { accent: '#7dd3fc', gradient: 'linear-gradient(135deg,#0a1929,#0f2744)', swatches: ['#0a1929','#0f2744','#7dd3fc','#e0f2fe'], label: 'Salju'        },
  tema_void:  { accent: '#a855f7', gradient: 'linear-gradient(135deg,#000000,#0d0014)', swatches: ['#000000','#0d0014','#a855f7','#ec4899'], label: 'Void', limited: true },
}

export const STIKER_VISUALS = {}

export const KATEGORI_LABELS = {
  bingkai:  'Bingkai',
  spanduk:  'Spanduk',
  tema:     'Tema',
  pet_skin: '🐾 Pet',
}

// Pet skin metadata — mirrors shop_items seed in server/schema.js
// rarity: 'umum' | 'langka' | 'epic'
// CATEGORY ORDER: umum → langka → epic (epic = rarest & most powerful)
export const PET_SKIN_INFO = {
  // ── UMUM ────────────────────────────────────────────────────────────────────
  golden: {
    nama: 'Tomi', tier: 'STANDAR', tierColor: '#F5A623',
    desc: 'Pahlawan muda Negeri TOMAT — bulu emas mengkilap, rosette khas marmut.',
    story: 'Pahlawan muda Negeri TOMAT yang berhati emas dan bersemangat tinggi! Walaupun badannya mungil, keberanian Tomi siap melindungi setiap jengkal desanya dari kekacauan.',
    free: true, rarity: 'umum',
  },
  pet_skin_silver: {
    nama: 'Silver Fluff', tier: 'PREMIUM', tierColor: '#C0C8D8',
    desc: 'Bulu perak berkilau. Menunjukkan siswa aktif dan rajin mengumpulkan koin.',
    story: 'Terbalut bulu perak murni yang memantulkan cahaya bulan, Tomi siap bertarung dengan kelincahan secepat kilat perak!',
    glow: 'rgba(192,200,216,0.35)', rarity: 'umum',
  },
  pet_kelinsay: {
    nama: 'Kelinsay', tier: 'UMUM', tierColor: '#34D399',
    desc: 'Sahabat sejati Tomi — kelinci putih lembut berhati hangat, selalu bisa diandalkan.',
    story: 'Sahabat sejati Tomi yang selalu bisa diandalkan. Dengan kelincahan luar biasa dan pikiran yang cerdik, Kelinsay adalah kunci keselamatan Tomi di setiap petualangan!',
    glow: 'rgba(52,211,153,0.30)', rarity: 'umum',
  },
  pet_kelinsay_senja: {
    nama: 'Kelinsay Senja', tier: 'UMUM', tierColor: '#FB923C',
    desc: 'Bulu hangat warna senja. Muncul saat matahari terbenam, membawa ketenangan.',
    story: 'Dihiasi kehangatan warna langit sore, Kelinsay Senja membawa kedamaian dan ketenangan tepat sebelum pertarungan sengit dimulai.',
    glow: 'rgba(249,115,22,0.38)', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay', rarity: 'umum',
  },
  // ── LANGKA ──────────────────────────────────────────────────────────────────
  pet_skin_cosmic: {
    nama: 'Cosmic Fluff', tier: 'LANGKA', tierColor: '#A78BFA',
    desc: 'Marmut biru galaksi bertabur bintang dengan mahkota kosmik. Mengesankan!',
    story: 'Menyerap energi bintang dari galaksi jauh, bulu Tomi kini bersinar seperti rasi bintang. Tak ada batas antariksa yang tak bisa ia jelajahi!',
    glow: 'rgba(167,139,250,0.45)', rarity: 'langka',
  },
  pet_monyong: {
    nama: 'Monyang', tier: 'LANGKA', tierColor: '#FB923C',
    desc: 'Monyet jahil pembuat ulah nomor satu di Negeri TOMAT. Senyumnya tak pernah padam!',
    story: 'Monyet jahil pembuat ulah nomor satu di Negeri TOMAT! Di mana ada kekacauan, di situ ada Monyang yang sedang tertawa sambil merencanakan keusilan berikutnya.',
    glow: 'rgba(251,146,60,0.40)', rarity: 'langka',
  },
  pet_monyong_raja: {
    nama: 'Monyang Raja', tier: 'LANGKA', tierColor: '#D4AF37',
    desc: 'Mahkota emas bertahta di kepalanya. Memerintah kerajaan kejahilannya sendiri.',
    story: 'Sembah Sang Raja Usil! Lengkap dengan jubah mewah dan mahkota emas—yang kemungkinan besar hasil curian—Monyang kini memerintah kerajaan kejahilannya sendiri.',
    glow: 'rgba(212,175,55,0.42)', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong', rarity: 'langka',
  },
  // ── EPIC ────────────────────────────────────────────────────────────────────
  pet_kelinsay_malam: {
    nama: 'Kelinsay Malam', tier: 'EPIC', tierColor: '#A78BFA',
    desc: 'Bulu malam bertabur bintang. Pendiam, elegan, ditemani cahaya bulan.',
    story: 'Menjadi satu dengan kegelapan. Dalam balutan gaun malam yang anggun, Kelinsay bergerak cepat bagai bayangan yang tak terdeteksi musuh.',
    glow: 'rgba(99,102,241,0.55)', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay', rarity: 'epic',
  },
  pet_skin_void: {
    nama: 'Void Emperor', tier: 'EPIC', tierColor: '#F59E0B',
    desc: 'Marmut hitam pekat berpendar emas, jubah dan mahkota kerajaan. Dominasi leaderboard.',
    story: 'Ketika kegelapan kehampaan tunduk pada kebaikan hati Tomi. Berubah menjadi sang penguasa void, tak ada kejahatan yang sanggup berdiri di hadapannya!',
    glow: 'rgba(245,158,11,0.65)', rarity: 'epic',
  },
  pet_monyong_kosmik: {
    nama: 'Monyang Kosmik', tier: 'EPIC', tierColor: '#C084FC',
    desc: 'Kejahilan merambah luar angkasa. Mengacak-acak gravitasi dengan kekuatan kosmik.',
    story: 'Kejahilan Monyang kini merambah hingga ke luar angkasa! Dengan kekuatan kosmik, ia siap mengacak-acak gravitasi dan melemparkan meteor usil ke bumi.',
    glow: 'rgba(168,85,247,0.62)', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong', rarity: 'epic',
  },
  pet_nananaga: {
    nama: 'Nananaga', tier: 'EPIC', tierColor: '#FB923C',
    desc: 'Makhluk mitologis purba penjaga Negeri TOMAT. Matanya menyala, sayapnya menggelegar. Memberikan 1× kebal jawaban salah saat duel, turnamen, atau survival.',
    story: 'Makhluk mitologis purba yang telah menjaga Negeri TOMAT selama ribuan tahun. Kehadirannya membawa kewibawaan dan aura mistis yang luar biasa.',
    glow: 'rgba(251,146,60,0.65)', rarity: 'epic',
  },
  pet_nananaga_merah: {
    nama: 'Nananaga Api', tier: 'EPIC', tierColor: '#F87171',
    desc: 'Naga api merah menyala. Sisiknya membara, napasnya meninggalkan jejak bara. Memberikan 2× kebal jawaban salah saat duel, turnamen, atau survival.',
    story: 'Terlahir kembali dari lahar panas inti bumi Negeri TOMAT. Kobaran api di tubuhnya akan membakar habis siapa saja yang berani mengusik kedamaian!',
    glow: 'rgba(239,68,68,0.60)', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga', rarity: 'epic',
  },
  pet_nananaga_es: {
    nama: 'Nananaga Es', tier: 'EPIC', tierColor: '#7DD3FC',
    desc: 'Penguasa puncak gunung tertinggi berselimut salju abadi. Memberikan 3× kebal jawaban salah saat duel, turnamen, atau survival!',
    story: 'Penguasa puncak gunung tertinggi yang diselimuti salju abadi. Hembusan napas es milik Nananaga mampu membekukan ancaman dalam sekejap.',
    glow: 'rgba(56,189,248,0.60)', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga', rarity: 'epic',
  },
}

// Hardcoded food catalog for shop display (matches server/pet.js PET_FOODS)
export const PET_FOOD_CATALOG = [
  { id: 'wortel_kecil',  nama: 'Wortel Kecil',  emoji: '🥕', harga: 30,  dur: '2 jam',  color: '#F5A623' },
  { id: 'sayuran_segar', nama: 'Sayuran Segar', emoji: '🥦', harga: 80,  dur: '6 jam',  color: '#34D399' },
  { id: 'buah_premium',  nama: 'Buah Premium',  emoji: '🍓', harga: 200, dur: '16 jam', color: '#F472B6' },
  { id: 'pesta_mewah',   nama: 'Pesta Mewah',   emoji: '🫐', harga: 500, dur: '3 hari', color: '#A78BFA' },
]
