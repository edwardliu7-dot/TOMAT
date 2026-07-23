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
  bingkai: 'Bingkai',
  spanduk: 'Spanduk',
  tema: 'Tema',
  stiker: 'Stiker',
}
