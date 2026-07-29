// ── PetSVG — universal pet renderer ──────────────────────────────────────────
// Routes to the correct renderer based on the equipped skin ID.
// Tomi   → TomiSprite    (/tomi-sprite.png)
// Monyang → MonyangSprite (/monyang-sprite.png)
// Nananaga → NananagaSprite (/nananaga-sprite.png)
// Kelinsay → KelinciSVG  (sprite via TomiSprite-style renderer in KelinciSVG)
import React from 'react'
import TomiSprite from './TomiSprite'
import KelinciSVG from './KelinciSVG'
import MonyangSprite from './MonyangSprite'
import NananagaSprite from './NananagaSprite'

// Re-export so callers only need to import from PetSVG
export { PET_CSS, STATE_ANIMS } from './TomiSVG'

/** Map from skinId → display name */
export const PET_NAMES = {
  golden:             'Tomi',
  pet_skin_silver:    'Tomi',
  pet_skin_cosmic:    'Tomi',
  pet_skin_void:      'Tomi',
  pet_kelinsay:       'Kelinsay',
  pet_kelinsay_senja: 'Kelinsay',
  pet_kelinsay_malam: 'Kelinsay',
  pet_monyong:        'Monyang',
  pet_monyong_raja:   'Monyang',
  pet_monyong_kosmik: 'Monyang',
  pet_nananaga:       'Nananaga',
  pet_nananaga_merah: 'Nananaga',
  pet_nananaga_es:    'Nananaga',
}

export function getPetName(skinId) {
  return PET_NAMES[skinId] || 'Tomi'
}

export default function PetSVG({ state = 'idle', skinId = 'golden', size = 100 }) {
  if (skinId.startsWith('pet_kelinsay'))  return <KelinciSVG state={state} size={size} variant={skinId} />
  if (skinId.startsWith('pet_monyong'))   return <MonyangSprite state={state} variant={skinId} size={size} />
  if (skinId.startsWith('pet_nananaga'))  return <NananagaSprite state={state} variant={skinId} size={size} />
  return <TomiSprite state={state} skinId={skinId} size={size} />
}
