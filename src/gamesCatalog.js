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
  // Grade 8 — BAB IV: Pola Bilangan
  { key: 'g8tameng',           name: 'Formasi Pasukan Tameng',        emoji: '🛡️',  bab: 'IV',  grade: 8 },
  { key: 'g8bunga',            name: 'Teka-teki Hutan Bunga',         emoji: '🌸',  bab: 'IV',  grade: 8 },
  { key: 'g8jembatanbatu',     name: 'Jembatan Batu Ajaib',           emoji: '🌉',  bab: 'IV',  grade: 8 },
  { key: 'g8ramalan',          name: 'Ramalan Penyihir Agung',        emoji: '🔮',  bab: 'IV',  grade: 8 },
  { key: 'g8dungeon',          name: 'Sandi Pintu Dungeon',           emoji: '🗝️',  bab: 'IV',  grade: 8 },
  { key: 'g8radar',            name: 'Radar Naga Pengintai',          emoji: '🐉',  bab: 'IV',  grade: 8 },
  // Grade 8 — BAB V: Bangun Datar
  { key: 'g8makcomblang',      name: 'Makcomblang Desa',              emoji: '💘',  bab: 'V',   grade: 8 },
  { key: 'g8gerbang',          name: 'Gerbang Seleksi Sihir',         emoji: '🚪',  bab: 'V',   grade: 8 },
  { key: 'g8pandaibesi',       name: 'Pabrik Senjata Pandai Besi',    emoji: '🔨',  bab: 'V',   grade: 8 },
  { key: 'g8menara',           name: 'Kombinasi Kunci Menara',        emoji: '🗼',  bab: 'V',   grade: 8 },
  { key: 'g8dansa',            name: 'Pesta Dansa Kerajaan',          emoji: '💃',  bab: 'V',   grade: 8 },
  { key: 'g8petakerajaan',     name: 'Ahli Peta Kerajaan',            emoji: '🗺️',  bab: 'V',   grade: 8 },
  { key: 'g8balista',          name: 'Pemanah Balista',               emoji: '🏹',  bab: 'V',   grade: 8 },
  { key: 'g8bukitnaga',        name: 'Mendaki Bukit Naga',            emoji: '🐲',  bab: 'V',   grade: 8 },
  // Grade 8 — BAB VI: Statistika
  { key: 'g8tembokbenteng',    name: 'Rancangan Tembok Benteng',      emoji: '🧱',  bab: 'VI',  grade: 8 },
  { key: 'g8logistik',         name: 'Jalur Suplai Logistik',         emoji: '🚚',  bab: 'VI',  grade: 8 },
  { key: 'g8pertahananberlapis',name:'Sistem Pertahanan Berlapis',    emoji: '🛡️',  bab: 'VI',  grade: 8 },
  { key: 'g8timbangan',        name: 'Timbangan Emas dan Perak',      emoji: '⚖️',  bab: 'VI',  grade: 8 },
  // Grade 8 — BAB VII: Peluang
  { key: 'g8pedagangmisterius',name: 'Pedagang Misterius',            emoji: '🧪',  bab: 'VII', grade: 8 },
  { key: 'g8penyelamatan',     name: 'Misi Penyelamatan Ganda',       emoji: '🆘',  bab: 'VII', grade: 8 },
  { key: 'g8taktikperang',     name: 'Ahli Taktik Perang',            emoji: '♟️',  bab: 'VII', grade: 8 },
  { key: 'g8pasarbarter',      name: 'Pasar Barter Ksatria',          emoji: '🛒',  bab: 'VII', grade: 8 },

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
  // Grade 9 — BAB IV: Transformasi Geometri
  { key: 'g9kargo',            name: 'Sortir Kargo Pesawat',          emoji: '📦',  bab: 'IV',  grade: 9 },
  { key: 'g9reaktor',          name: 'Transfer Energi Reaktor',       emoji: '⚡',  bab: 'IV',  grade: 9 },
  { key: 'g9lambungkapal',     name: 'Perluasan Lambung Kapal',       emoji: '🚀',  bab: 'IV',  grade: 9 },
  { key: 'g9sinyalalien',      name: 'Dekripsi Sinyal Alien',         emoji: '📡',  bab: 'IV',  grade: 9 },
  { key: 'g9pipaoksigen',      name: 'Kalibrasi Pipa Oksigen',        emoji: '🫁',  bab: 'IV',  grade: 9 },
  { key: 'g9perdagangangalaksi',name:'Misi Perdagangan Galaksi',      emoji: '👽',  bab: 'IV',  grade: 9 },
  { key: 'g9mikroskop',        name: 'Mikroskop Sub-Atomik',          emoji: '🔬',  bab: 'IV',  grade: 9 },
  // Grade 9 — BAB V: Statistika & Peluang
  { key: 'g9wormhole',         name: 'Generator Lubang Cacing',       emoji: '🌀',  bab: 'V',   grade: 9 },
  { key: 'g9tahuncahaya',      name: 'Navigasi Tahun Cahaya',         emoji: '🌌',  bab: 'V',   grade: 9 },
  { key: 'g9cetakbiru',        name: 'Cetak Biru Hologram',           emoji: '🧊',  bab: 'V',   grade: 9 },
  { key: 'g9bayanganmenara',   name: 'Bayangan Menara Alien',         emoji: '🗽',  bab: 'V',   grade: 9 },
  { key: 'g9panelsurya',       name: 'Perakitan Panel Surya Satelit', emoji: '🛰️',  bab: 'V',   grade: 9 },
  { key: 'g9medangaya',        name: 'Medan Gaya Pelindung',          emoji: '🛡️',  bab: 'V',   grade: 9 },
  { key: 'g9sektorpemindai',   name: 'Sektor Pemindai',               emoji: '📡',  bab: 'V',   grade: 9 },
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
    IV:  'BAB IV: Pola Bilangan',
    V:   'BAB V: Bangun Datar',
    VI:  'BAB VI: Statistika',
    VII: 'BAB VII: Peluang',
  },
  9: {
    I:   'BAB I: Sistem Persamaan Linear Dua Variabel',
    II:  'BAB II: Lingkaran',
    III: 'BAB III: Bangun Ruang',
    IV:  'BAB IV: Transformasi Geometri',
    V:   'BAB V: Statistika & Peluang',
  },
}

// Which chapters (bab) exist for a given grade, in order — used to render the guru bab-lock panel.
export function getBabsForGrade(grade) {
  return Object.keys(GRADE_BAB_LABELS[grade] || {})
}

export function getGameInfo(key) {
  return GAMES_CATALOG.find(g => g.key === key) || null
}
