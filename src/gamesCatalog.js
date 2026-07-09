// Single source of truth for game metadata used by guru (task assignment) and grade zone screens.
export const GAMES_CATALOG = [
  { key: 'termometer', name: 'Termometer Penyelamat', emoji: '🌡️', bab: 'I', grade: 7 },
  { key: 'katak', name: 'Katak Pelompat Batu', emoji: '🐸', bab: 'I', grade: 7 },
  { key: 'pabrikrobot', name: 'Pabrik Pasukan Robot', emoji: '🤖', bab: 'I', grade: 7 },
  { key: 'sporajamur', name: 'Serangan Spora Jamur', emoji: '🍄', bab: 'I', grade: 7 },
  { key: 'scanner', name: 'Scanner Batu Permata', emoji: '💎', bab: 'I', grade: 7 },
  { key: 'gembok', name: 'Gembok Roda Gigi', emoji: '⚙️', bab: 'I', grade: 7 },
  { key: 'mercusuar', name: 'Sinyal Mercusuar', emoji: '🏮', bab: 'I', grade: 7 },
  { key: 'kokipizza', name: 'Koki Pemotong Pizza', emoji: '🍕', bab: 'II', grade: 7 },
  { key: 'pipaair', name: 'Teknisi Pipa Air', emoji: '🔧', bab: 'II', grade: 7 },
  { key: 'bortambang', name: 'Bor Tambang Bumi', emoji: '⛏️', bab: 'II', grade: 7 },
  { key: 'kabataku', name: 'Rute Kereta Tambang', emoji: '🚂', bab: 'II', grade: 7 },
  { key: 'baterai', name: 'Baterai Pesawat Luar Angkasa', emoji: '🚀', bab: 'II', grade: 7 },
  { key: 'timbanganemas', name: 'Timbangan Emas Digital', emoji: '⚖️', bab: 'II', grade: 7 },
  { key: 'fokusteleskop', name: 'Fokus Teleskop Bintang', emoji: '🔭', bab: 'II', grade: 7 },
  { key: 'ramuanjus', name: 'Ramuan Jus Buah', emoji: '🧃', bab: 'III', grade: 7 },
  { key: 'kasirsihir', name: 'Kasir Toko Sihir', emoji: '🏪', bab: 'III', grade: 7 },
  { key: 'benteng', name: 'Pembangun Benteng Pertahanan', emoji: '🏰', bab: 'III', grade: 7 },
  { key: 'nakhoda', name: 'Nakhoda Kapal Penjelajah', emoji: '⚓', bab: 'III', grade: 7 },
  { key: 'relkereta', name: 'Menyusun Rel Kereta Cepat', emoji: '🚄', bab: 'III', grade: 7 },
  { key: 'brankas', name: 'Peretas Brankas Sandi', emoji: '🔐', bab: 'III', grade: 7 },
]

export const BAB_LABELS = {
  I: 'BAB I: Bilangan Bulat',
  II: 'BAB II: Bilangan Rasional',
  III: 'BAB III: Rasio',
}

export function getGameInfo(key) {
  return GAMES_CATALOG.find(g => g.key === key) || null
}
