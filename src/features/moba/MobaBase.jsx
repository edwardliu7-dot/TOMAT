import React from 'react'
import { Crown } from 'lucide-react'

export default function MobaBase({ team, side, style }) {
  if (!team) return null
  const tower = team.tower || { points: 0, maxPoints: 100, destroyed: false }
  const base = team.base || { hp: 100, maxPoints: 100, points: 0 }
  const towerPercent = tower.maxPoints > 0
    ? Math.min(100, Math.round((tower.points / tower.maxPoints) * 100))
    : 0
  const basePercent = base.maxPoints > 0
    ? Math.min(100, Math.round((base.hp / base.maxPoints) * 100))
    : 0

  return (
    <div className={`moba11-base moba11-base--${side}`} style={style}>
      <div className="moba11-base__glow" />
      <div className="moba11-base__icon"><Crown size={21} /></div>
      <div className="moba11-base__title">{team.name || (side === 'left' ? 'Tim A' : 'Tim B')}</div>
      <div className="moba11-base__score">
        {team.score || 0}<small> poin</small>
      </div>
      <div className="moba11-base__bar-label">
        <span>{tower.destroyed ? 'Tower hancur' : 'Tower luar'}</span>
        <b>{tower.destroyed ? 'terbuka' : `${towerPercent}%`}</b>
      </div>
      <div className="moba11-base__bar">
        <i style={{ width: `${tower.destroyed ? 100 : towerPercent}%` }} />
      </div>
      {tower.destroyed && (
        <>
          <div className="moba11-base__bar-label moba11-base__bar-label--base">
            <span>Base utama</span>
            <b>{basePercent}%</b>
          </div>
          <div className="moba11-base__bar">
            <i style={{ width: `${basePercent}%` }} />
          </div>
        </>
      )}
    </div>
  )
}