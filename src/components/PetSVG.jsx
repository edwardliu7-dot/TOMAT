// ── PetSVG — universal pet renderer ──────────────────────────────────────────
// Routes to the correct SVG based on the equipped skin ID.
// Tomi (guinea pig) skins: golden, pet_skin_silver, pet_skin_cosmic, pet_skin_void
// New animal pets: pet_kelinsay, pet_monyong, pet_nananaga
import React from 'react'
import TomiSVG from './TomiSVG'
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
  pet_monyong:    'Monyong',
  pet_nananaga:   'Nananaga',
}

export function getPetName(skinId) {
  return PET_NAMES[skinId] || 'Tomi'
}

export default function PetSVG({ state = 'idle', skinId = 'golden', size = 100 }) {
  if (skinId === 'pet_kelinsay') return <KelinciSVG state={state} size={size} />
  if (skinId === 'pet_monyong')  return <MonyetSVG  state={state} size={size} />
  if (skinId === 'pet_nananaga') return <NagaSVG    state={state} size={size} />
  return <TomiSVG state={state} skinId={skinId} size={size} />
}
