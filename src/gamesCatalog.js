// Single source of truth for game metadata used by guru (task assignment) and grade zone screens.
export const GAMES_CATALOG = [
  // Grade 7
  { key: 'termometer',   name: 'Termometer Penyelamat',           emoji: '🌡️', bab: 'I',   grade: 7 },
  { key: 'katak',        name: 'Katak Pelompat Batu',             emoji: '🐸',  bab: 'I',   grade: 7 },
  { key: 'pabrikrobot',  name: 'Pabrik Pasukan Robot',            emoji: '🤖',  bab: 'I',   grade: 7 },
  { key: 'sporajamur',   name: 'Serangan Spora Jamur',            emoji: '🍄',  bab: 'I',   grade: 7 },
  { key: 'scanner',      name: 'Scanner Batu Permata',            emoji: '💎',  bab: 'I',   grade: 7 },
  { key: 'gembok',       name: 'Gembok Roda Gigi',                emoji: '⚙️',  bab: 'I',   grade: 7 },
  { key: 'mercusuar',    name: 'Sinyal Mercusuar',                 emoji: '🏮',  bab: 'I',   grade: 7 },
  { key: 'kokipizza',    name: 'Koki Pemotong Pizza',              emoji: '🍕',  bab: 'II',  grade: 7 },
  { key: 'pipaair',      name: 'Teknisi Pipa Air',                 emoji: '🔧',  bab: 'II',  grade: 7 },
  { key: 'bortambang',   name: 'Bor Tambang Bumi',                emoji: '⛏️',  bab: 'II',  grade: 7 },
  { key: 'kabataku',     name: 'Rute Kereta Tambang',             emoji: '🚂',  bab: 'II',  grade: 7 },
  { key: 'baterai',      name: 'Baterai Pesawat Luar Angkasa',    emoji: '🚀',  bab: 'II',  grade: 7 },
  { key: 'timbanganemas',name: 'Timbangan Emas Digital',          emoji: '⚖️',  bab: 'II',  grade: 7 },
  { key: 'fokusteleskop',name: 'Fokus Teleskop Bintang',          emoji: '🔭',  bab: 'II',  grade: 7 },
  { key: 'ramuanjus',    name: 'Ramuan Jus Buah',                 emoji: '🧃',  bab: 'III', grade: 7 },
  { key: 'kasirsihir',   name: 'Kasir Toko Sihir',                emoji: '🏪',  bab: 'III', grade: 7 },
  { key: 'benteng',      name: 'Pembangun Benteng Pertahanan',    emoji: '🏰',  bab: 'III', grade: 7 },
  { key: 'nakhoda',      name: 'Nakhoda Kapal Penjelajah',        emoji: '⚓',  bab: 'III', grade: 7 },
  { key: 'relkereta',    name: 'Menyusun Rel Kereta Cepat',       emoji: '🚄',  bab: 'III', grade: 7 },
  { key: 'brankas',      name: 'Peretas Brankas Sandi',           emoji: '🔐',  bab: 'III', grade: 7 },

  // Grade 8 — BAB I: Bilangan Berpangkat
  { key: 'g8selramuan',    name: 'Penggandaan Sel Ramuan',        emoji: '🧪',  bab: 'I',   grade: 8 },
  { key: 'g8racunminiatur',name: 'Ekstraksi Racun Miniatur',      emoji: '☠️',  bab: 'I',   grade: 8 },
  { key: 'g8kristal',      name: 'Pemisahan Elemen Kristal',      emoji: '💎',  bab: 'I',   grade: 8 },
  { key: 'g8fusienergi',   name: 'Fusi Energi Alkemis',           emoji: '⚗️',  bab: 'I',   grade: 8 },
  { key: 'g8mantraakar',   name: 'Penyederhanaan Mantra Akar',    emoji: '✨',  bab: 'I',   grade: 8 },
  { key: 'g8geolog',       name: 'Ekspedisi Geolog Kerajaan',     emoji: '⛏️',  bab: 'I',   grade: 8 },
  // Grade 8 — BAB II: Teorema Pythagoras
  { key: 'g8trebuchet',    name: 'Bidikan Tepat Trebuchet',       emoji: '⚔️',  bab: 'II',  grade: 8 },
  { key: 'g8perisai',      name: 'Restorasi Perisai Kerajaan',    emoji: '🛡️',  bab: 'II',  grade: 8 },
  { key: 'g8hartakarun',   name: 'Harta Karun di Sudut Ruangan', emoji: '💰',  bab: 'II',  grade: 8 },
  { key: 'g8inspeksisudut',name: 'Inspeksi Sudut Menara',         emoji: '🗼',  bab: 'II',  grade: 8 },
  { key: 'g8petaradar',    name: 'Peta Radar Pengintai',          emoji: '📡',  bab: 'II',  grade: 8 },
  { key: 'g8taligantung',  name: 'Misi Penyelamatan Tali Gantung',emoji: '🪢', bab: 'II',  grade: 8 },
  // Grade 8 — BAB III: Persamaan & Pertidaksamaan Linear Satu Variabel
  { key: 'g8gerbanglogika',name: 'Teka-Teki Gerbang Logika',     emoji: '🚪',  bab: 'III', grade: 8 },
  { key: 'g8katrol',       name: 'Katrol Penyeimbang Jembatan',   emoji: '⚙️',  bab: 'III', grade: 8 },
  { key: 'g8gulungan',     name: 'Penerjemah Gulungan Kuno',      emoji: '📜',  bab: 'III', grade: 8 },
  { key: 'g8keretakuda',   name: 'Kapasitas Kereta Kuda',         emoji: '🐴',  bab: 'III', grade: 8 },
  // Grade 9 — BAB I: Sistem Persamaan Linear Dua Variabel
  { key: 'g9manifest',     name: 'Manifest Kargo Alien',          emoji: '📦',  bab: 'I',   grade: 9 },
  { key: 'g9plotrute',     name: 'Plotting Rute Grafik',          emoji: '🗺️',  bab: 'I',   grade: 9 },
  { key: 'g9interseksi',   name: 'Interseksi Radar Sinyal',       emoji: '📡',  bab: 'I',   grade: 9 },
  { key: 'g9konsol',       name: 'Dekripsi Konsol Komputer',      emoji: '💻',  bab: 'I',   grade: 9 },
  { key: 'g9pasargalaksi', name: 'Barter Di Pasar Galaksi',       emoji: '👽',  bab: 'I',   grade: 9 },
  // Grade 9 — BAB II: Lingkaran
  { key: 'g9kalibrasirada',name: 'Kalibrasi Jangkauan Radar',     emoji: '🎯',  bab: 'II',  grade: 9 },
  { key: 'g9orbit',        name: 'Kalkulasi Orbit Satelit',       emoji: '🛰️',  bab: 'II',  grade: 9 },
  { key: 'g9shieldgaya',   name: 'Medan Gaya Shield Pelindung',   emoji: '🛡️',  bab: 'II',  grade: 9 },
  { key: 'g9laserjuring',  name: 'Tembakan Laser Sektor',         emoji: '⚡',  bab: 'II',  grade: 9 },
  { key: 'g9asteroid',     name: 'Jalur Pintas Sabuk Asteroid',   emoji: '☄️',  bab: 'II',  grade: 9 },
  // Grade 9 — BAB III: Bangun Ruang
  { key: 'g9boksbaterai',  name: 'Optimalisasi Boks Baterai',     emoji: '🔋',  bab: 'III', grade: 9 },
  { key: 'g9refraktor',    name: 'Refraktor Kristal Energi',      emoji: '💎',  bab: 'III', grade: 9 },
  { key: 'g9kuilalien',    name: 'Eksplorasi Kuil Alien',         emoji: '🏛️',  bab: 'III', grade: 9 },
  { key: 'g9reaktorbahan', name: 'Pengisian Reaktor Bahan Bakar', emoji: '⚛️',  bab: 'III', grade: 9 },
  { key: 'g9sinyalkerucut',name: 'Zona Pancaran Sinyal',          emoji: '📡',  bab: 'III', grade: 9 },
  { key: 'g9bintang',      name: 'Kompresi Inti Bintang',         emoji: '⭐',  bab: 'III', grade: 9 },
  { key: 'g9upgradekapal', name: 'Upgrade Kapal Induk',           emoji: '🚀',  bab: 'III', grade: 9 },
]

export const BAB_LABELS = {
  I: 'BAB I', II: 'BAB II', III: 'BAB III',
}

// Per-grade chapter titles, since the same roman numeral means a different topic per grade.
export const GRADE_BAB_LABELS = {
  7: {
    I:   'BAB I: Bilangan Bulat',
    II:  'BAB II: Bilangan Rasional',
    III: 'BAB III: Rasio',
  },
  8: {
    I:   'BAB I: Bilangan Berpangkat',
    II:  'BAB II: Teorema Pythagoras',
    III: 'BAB III: Persamaan & Pertidaksamaan Linear Satu Variabel',
  },
  9: {
    I:   'BAB I: Sistem Persamaan Linear Dua Variabel',
    II:  'BAB II: Lingkaran',
    III: 'BAB III: Bangun Ruang',
  },
}

// Which chapters (bab) exist for a given grade, in order — used to render the guru bab-lock panel.
export function getBabsForGrade(grade) {
  return Object.keys(GRADE_BAB_LABELS[grade] || {})
}

export function getGameInfo(key) {
  return GAMES_CATALOG.find(g => g.key === key) || null
}

// Game keys that support both Tournament and Duel mode.
// Keep in sync with generators in server/tournament-questions.js.
export const DUEL_GAME_KEYS = new Set([
  'katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar', 'sporajamur', 'scanner',
  'g8selramuan', 'g8racunminiatur', 'g8kristal', 'g8fusienergi', 'g8mantraakar', 'g8geolog',
])
