// ── PetSVG — universal pet renderer ──────────────────────────────────────────
// Routes to the correct renderer based on the equipped skin ID.
// Tomi     → TomiSprite      (/tomi-sprite.png)
// Kelinsay → KelinsaySprite  (/kelinsay-sprite.png)
// Monyang  → MonyangSprite   (/monyang-sprite.png)
// Nananaga → NananagaSprite  (/nananaga-sprite.png)
import React from 'react'
import TomiSprite from './TomiSprite'
import KelinsaySprite from './KelinsaySprite'
import MonyangSprite from './MonyangSprite'
import NananagaSprite from './NananagaSprite'

// Re-export so callers only need to import from PetSVG
export { PET_CSS, STATE_ANIMS } from './TomiSVG'

/** Map from skinId → display name */
export const PET_NAMES = {
  golden:                    'Tomi',
  pet_skin_silver:           'Tomi',
  pet_skin_cosmic:           'Tomi',
  pet_skin_void:             'Tomi',
  pet_skin_natal:            'Tomi',
  pet_skin_ramadan:          'Tomi',
  pet_kelinsay:              'Kelinsay',
  pet_kelinsay_senja:        'Kelinsay',
  pet_kelinsay_malam:        'Kelinsay',
  pet_kelinsay_merahputih:   'Kelinsay',
  pet_kelinsay_labu:         'Kelinsay',
  pet_monyong:               'Monyang',
  pet_monyong_raja:          'Monyang',
  pet_monyong_kosmik:        'Monyang',
  pet_nananaga:              'Nananaga',
  pet_nananaga_merah:        'Nananaga',
  pet_nananaga_es:           'Nananaga',
}

/**
 * CSS filters for seasonal event skins — applied as a wrapper div so the
 * base sprite sheet can be reused without new image assets.
 */
const EVENT_SKIN_FILTERS = {
  pet_kelinsay_merahputih: 'hue-rotate(340deg) saturate(2.5) brightness(1.05)',
  pet_kelinsay_labu:       'sepia(0.7) hue-rotate(-20deg) saturate(4) brightness(0.88)',
  pet_skin_natal:          'hue-rotate(120deg) saturate(1.8) brightness(1.1)',
  pet_skin_ramadan:        'sepia(0.5) hue-rotate(200deg) saturate(2)',
}

export function getPetName(skinId) {
  return PET_NAMES[skinId] || 'Tomi'
}

export default function PetSVG({ state = 'idle', skinId = 'golden', size = 100, cssFilter: filterOverride }) {
  const cssFilter = filterOverride ?? EVENT_SKIN_FILTERS[skinId]

  let sprite
  if (skinId.startsWith('pet_kelinsay'))  sprite = <KelinsaySprite state={state} variant={skinId} size={size} />
  else if (skinId.startsWith('pet_monyong'))   sprite = <MonyangSprite state={state} variant={skinId} size={size} />
  else if (skinId.startsWith('pet_nananaga'))  sprite = <NananagaSprite state={state} variant={skinId} size={size} />
  else sprite = <TomiSprite state={state} skinId={skinId} size={size} />

  if (!cssFilter) return sprite
  return (
    <div style={{ filter: cssFilter, display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      {sprite}
    </div>
  )
}
