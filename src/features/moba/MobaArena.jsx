import React, { useEffect, useRef, useState } from 'react'
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

const MOVE_REPEAT_MS = 65
const JOYSTICK_RADIUS = 42
const JOYSTICK_DEAD_ZONE = 0.16

function MoveButton({ direction, label, children, disabled, onMove }) {
  const repeatRef = useRef(null)

  const stop = () => {
    if (repeatRef.current) window.clearInterval(repeatRef.current)
    repeatRef.current = null
  }

  const start = event => {
    event.preventDefault()
    if (disabled) return
    onMove?.(direction)
    stop()
    repeatRef.current = window.setInterval(() => onMove?.(direction), MOVE_REPEAT_MS)
  }

  useEffect(() => stop, [])

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={event => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
          event.preventDefault()
          onMove?.(direction)
        }
      }}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  )
}

function directionFromPointer(event, element) {
  const rect = element.getBoundingClientRect()
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  const distance = Math.hypot(dx, dy)
  if (!distance || distance < rect.width * JOYSTICK_DEAD_ZONE) return null
  const scale = Math.min(1, JOYSTICK_RADIUS / distance)
  return {
    x: (dx * scale) / JOYSTICK_RADIUS,
    y: (dy * scale) / JOYSTICK_RADIUS,
    distance: Math.min(distance, JOYSTICK_RADIUS),
  }
}

function MobaJoystick({ disabled, onMove }) {
  const baseRef = useRef(null)
  const repeatRef = useRef(null)
  const directionRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const stop = () => {
    if (repeatRef.current) window.clearInterval(repeatRef.current)
    repeatRef.current = null
    directionRef.current = null
    setKnob({ x: 0, y: 0 })
  }

  const update = event => {
    if (!baseRef.current || disabled) return
    const direction = directionFromPointer(event, baseRef.current)
    if (!direction) {
      directionRef.current = null
      setKnob({ x: 0, y: 0 })
      return
    }
    directionRef.current = { x: direction.x, y: direction.y }
    setKnob({
      x: (direction.x * direction.distance) / JOYSTICK_RADIUS * 42,
      y: (direction.y * direction.distance) / JOYSTICK_RADIUS * 42,
    })
    onMove?.(directionRef.current)
  }

  const start = event => {
    event.preventDefault()
    if (disabled || !baseRef.current) return
    baseRef.current.setPointerCapture?.(event.pointerId)
    update(event)
    if (repeatRef.current) window.clearInterval(repeatRef.current)
    repeatRef.current = window.setInterval(() => {
      if (directionRef.current) onMove?.(directionRef.current)
    }, MOVE_REPEAT_MS)
  }

  useEffect(() => stop, [])

  return (
    <div
      className="moba12-joystick"
      role="group"
      aria-label="Analog gerak Pet"
      ref={baseRef}
      onPointerDown={start}
      onPointerMove={update}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <span className="moba12-joystick__ring" />
      <span
        className="moba12-joystick__knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
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
      <MobaJoystick disabled={!canAct} onMove={onMove} />
      <div className="moba12-move-pad" role="group" aria-label="Tombol gerak Pet">
        <MoveButton direction={{ x: 0, y: -1 }} onMove={onMove} disabled={!canAct} label="Gerak ke atas">↑</MoveButton>
        <div>
          <MoveButton direction={{ x: -1, y: 0 }} onMove={onMove} disabled={!canAct} label="Gerak ke kiri">←</MoveButton>
          <MoveButton direction={{ x: 1, y: 0 }} onMove={onMove} disabled={!canAct} label="Gerak ke kanan">→</MoveButton>
        </div>
        <MoveButton direction={{ x: 0, y: 1 }} onMove={onMove} disabled={!canAct} label="Gerak ke bawah">↓</MoveButton>
      </div>
    </div>
  )
}

export { DEFAULT_ARENA, distanceBetween, getArenaBounds, toPosition }