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
      <div className="moba11-base__bar">
        <i style={{ width: `${tower.destroyed ? 100 : towerPercent}%` }} />
      </div>
      {tower.destroyed && (
        <>
          <div className="moba11-base__bar">
            <i style={{ width: `${basePercent}%` }} />
          </div>
        </>
      )}
    </div>
  )
}