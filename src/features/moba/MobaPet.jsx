import React, { useEffect, useState } from 'react'
import { ScrollText, Shield } from 'lucide-react'
import PetSVG, { getPetName } from '../../components/PetSVG'

const PET_LABELS = {
  tomi: 'Tomi',
  kelinsay: 'Kelinsay',
  monyang: 'Monyang',
  nananaga: 'Nananaga',
  komodih: 'KomoDIH',
}

const TEAM_COLORS = {
  teamA: '#ef765e',
  teamB: '#7180dc',
}

export default function MobaPet({ player, isSelf = false }) {
  const visualState = player?.mobaPetState
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => {
    if (!visualState?.until || visualState.until <= Date.now()) return undefined
    const timer = window.setTimeout(() => setClock(Date.now()), visualState.until - Date.now())
    return () => window.clearTimeout(timer)
  }, [visualState?.until])

  if (!player) return null

  const teamColor = TEAM_COLORS[player.teamId] || '#7e8b83'
  const petName = PET_LABELS[player.petType] || getPetName(player.petSkinId)
  const isStunned = Number(player.stunUntil) > clock
  const isCarrying = (player.scrolls?.length || 0) > 0
  const spriteState = isStunned
    ? 'hungry'
    : visualState?.until > clock
      ? visualState.state
      : 'idle'

  return (
    <div
      className={`moba11-pet ${isSelf ? 'moba11-pet--self' : ''} ${isStunned ? 'moba11-pet--stunned' : ''}`}
      style={{ '--moba-team': teamColor }}
      aria-label={`${player.displayName || 'Pemain'} menggunakan ${petName}`}
    >
      <div className="moba11-pet__name">
        {player.displayName || 'Pemain'}
        {isSelf ? ' · kamu' : ''}
      </div>
      <div className="moba11-pet__sprite">
        <PetSVG state={spriteState} skinId={player.petSkinId || 'golden'} size={48} />
        {isStunned && <span className="moba11-pet__stun" aria-label="Terkena stun">!</span>}
        {player.immunityAvailable && (
          <span className="moba11-pet__shield" aria-label="Imunitas tersedia">
            <Shield size={12} />
          </span>
        )}
        {isCarrying && (
          <span className="moba11-pet__scroll" aria-label="Membawa gulungan">
            <ScrollText size={13} />
          </span>
        )}
      </div>
      <div className="moba11-pet__meta">
        <i style={{ background: teamColor }} />
        {player.scrolls?.length || 0}/{player.maxScrolls || 1}
      </div>
    </div>
  )
}