import React from 'react'
import { Gem } from 'lucide-react'
import MobaBase from './MobaBase.jsx'
import MobaNode from './MobaNode.jsx'
import MobaPet from './MobaPet.jsx'

const DEFAULT_ARENA = { minX: 80, maxX: 920, minY: 80, maxY: 520 }

function getArenaBounds(arena = {}) {
  const minX = Number.isFinite(Number(arena.minX)) ? Number(arena.minX) : DEFAULT_ARENA.minX
  const maxX = Number.isFinite(Number(arena.maxX)) ? Number(arena.maxX) : DEFAULT_ARENA.maxX
  const minY = Number.isFinite(Number(arena.minY)) ? Number(arena.minY) : DEFAULT_ARENA.minY
  const maxY = Number.isFinite(Number(arena.maxY)) ? Number(arena.maxY) : DEFAULT_ARENA.maxY

  return {
    minX,
    maxX: maxX > minX ? maxX : DEFAULT_ARENA.maxX,
    minY,
    maxY: maxY > minY ? maxY : DEFAULT_ARENA.maxY,
  }
}

function toPosition(position = {}, arena = DEFAULT_ARENA) {
  const bounds = getArenaBounds(arena)
  const x = ((Number(position.x) - bounds.minX) / (bounds.maxX - bounds.minX)) * 100
  const y = ((Number(position.y) - bounds.minY) / (bounds.maxY - bounds.minY)) * 100
  return {
    left: `${Math.max(2, Math.min(98, Number.isFinite(x) ? x : 50))}%`,
    top: `${Math.max(3, Math.min(97, Number.isFinite(y) ? y : 50))}%`,
  }
}

function distanceBetween(left, right) {
  return Math.hypot(
    Number(left?.x || 0) - Number(right?.x || 0),
    Number(left?.y || 0) - Number(right?.y || 0),
  )
}

export default function MobaArena({
  match,
  players = [],
  nodes = [],
  selfId,
  onClaimNode,
  onMove,
  canAct = false,
}) {
  const arena = match?.config?.arena || DEFAULT_ARENA
  const self = players.find(player => player.id === selfId || player.userId === selfId)
  const interactionRadius = Number(match?.config?.nodeInteractionRadius) || 72

  return (
    <div
      className="moba11-arena"
      role="img"
      aria-label="Arena pertandingan dua sisi TOMAT"
      data-arena-min-x={getArenaBounds(arena).minX}
      data-arena-max-x={getArenaBounds(arena).maxX}
      data-arena-min-y={getArenaBounds(arena).minY}
      data-arena-max-y={getArenaBounds(arena).maxY}
    >
      <div className="moba11-river" />
      <div className="moba11-lane moba11-lane--top" />
      <div className="moba11-lane moba11-lane--middle" />
      <div className="moba11-lane moba11-lane--bottom" />
      <span className="moba11-lane-label moba11-lane-label--top">Lajur atas</span>
      <span className="moba11-lane-label moba11-lane-label--middle">Lajur tengah</span>
      <span className="moba11-lane-label moba11-lane-label--bottom">Lajur bawah</span>
      <MobaBase team={match?.teams?.teamA} side="left" />
      <MobaBase team={match?.teams?.teamB} side="right" />
      {nodes.map(node => (
        <MobaNode
          key={node.id}
          node={node}
          style={toPosition(node.position, arena)}
          isNearby={Boolean(self && distanceBetween(self.position, node.position) <= interactionRadius)}
          onClaim={onClaimNode}
        />
      ))}
      {players.map(player => (
        <div key={player.id} className="moba11-positioned" style={toPosition(player.position, arena)}>
          <MobaPet player={player} isSelf={player.id === selfId || player.userId === selfId} />
        </div>
      ))}
      <div className="moba11-arena__center"><Gem size={19} /></div>
      <div className="moba12-move-pad" aria-label="Kontrol gerak Pet">
        <button type="button" onClick={() => onMove?.({ x: 0, y: -1 })} disabled={!canAct} aria-label="Gerak ke atas">↑</button>
        <div>
          <button type="button" onClick={() => onMove?.({ x: -1, y: 0 })} disabled={!canAct} aria-label="Gerak ke kiri">←</button>
          <button type="button" onClick={() => onMove?.({ x: 1, y: 0 })} disabled={!canAct} aria-label="Gerak ke kanan">→</button>
        </div>
        <button type="button" onClick={() => onMove?.({ x: 0, y: 1 })} disabled={!canAct} aria-label="Gerak ke bawah">↓</button>
      </div>
    </div>
  )
}

export { DEFAULT_ARENA, distanceBetween, getArenaBounds, toPosition }