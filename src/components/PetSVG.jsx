// ── PetSVG — universal pet renderer ──────────────────────────────────────────
// Routes to the correct renderer based on the equipped skin ID.
// Tomi (guinea pig) now uses the sprite-sheet renderer (TomiSprite).
// Other animals continue using their SVG renderers.
import React from 'react'
import TomiSprite from './TomiSprite'
import KelinciSVG from './KelinciSVG'
import MonyetSVG from './MonyetSVG'
import NagaSVG from './NagaSVG'

// Re-export so callers only need to import from PetSVG
export { PET_CSS, STATE_ANIMS } from './TomiSVG'

/** Map from skinId → display name */
export const PET_NAMES = {
  golden:         'Tomi',
  pet_skin_silver:'Tomi',
  pet_skin_cosmic:'Tomi',
  pet_skin_void:  'Tomi',
  pet_kelinsay:   'Kelinsay',
  pet_kelinsay_senja: 'Kelinsay',
  pet_kelinsay_malam: 'Kelinsay',
  pet_monyong:    'Monyang',
  pet_monyong_raja: 'Monyang',
  pet_monyong_kosmik: 'Monyang',
  pet_nananaga:   'Nananaga',
  pet_nananaga_merah: 'Nananaga',
  pet_nananaga_es: 'Nananaga',
}

export function getPetName(skinId) {
  return PET_NAMES[skinId] || 'Tomi'
}

export default function PetSVG({ state = 'idle', skinId = 'golden', size = 100 }) {
  if (skinId.startsWith('pet_kelinsay')) return <KelinciSVG state={state} size={size} variant={skinId} />
  if (skinId.startsWith('pet_monyong')) return <MonyetSVG state={state} size={size} variant={skinId} />
  if (skinId.startsWith('pet_nananaga')) return <NagaSVG state={state} size={size} variant={skinId} />
  return <TomiSprite state={state} skinId={skinId} size={size} />
}
