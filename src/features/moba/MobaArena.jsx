import React, { useEffect, useRef, useState } from 'react'
import { Gem, Map, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import MobaBase from './MobaBase.jsx'
import MobaNode from './MobaNode.jsx'
import MobaPet from './MobaPet.jsx'

const DEFAULT_ARENA = {
  minX: 0,
  maxX: 80000,
  minY: 0,
  maxY: 80000,
  tileSize: 16,
  columns: 5000,
  rows: 5000,
}

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

// The server accepts movement no more often than movementMinIntervalMs
// (40ms by default). Keep a little headroom so pointer events and network
// jitter cannot turn a continuous analog gesture into a stream of rejected
// MOVE_RATE_LIMITED actions.
const MOVE_REPEAT_MS = 80
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
  }

  const start = event => {
    event.preventDefault()
    if (disabled || !baseRef.current) return
    baseRef.current.setPointerCapture?.(event.pointerId)
    update(event)
    // Send immediately once, then let the interval below own the stream.
    // PointerMove must only update the latest direction; sending from both
    // paths floods the server and makes the Pet appear stuck on touch devices.
    if (directionRef.current) onMove?.(directionRef.current)
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

function MiniMap({ arena, players, nodes, selfId, onClose, compact = false }) {
  return (
    <div className={`moba-jungle-map-pop${compact ? ' is-persistent' : ''}`}>
      <header>
        <span><Map size={14} /> Peta arena</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={compact ? 'Perbesar peta arena' : 'Tutup peta'}
        >
          {compact ? <Map size={13} /> : <X size={14} />}
        </button>
      </header>
      <div className="moba-jungle-map-large">
        <i className="moba-jungle-map-river" />
        <i className="moba-jungle-map-base moba-jungle-map-base--a" />
        <i className="moba-jungle-map-base moba-jungle-map-base--b" />
        {nodes.map(node => (
          <i className="moba-jungle-map-node" key={node.id} style={toPosition(node.position, arena)} />
        ))}
        {players.map(player => (
          <i
            className={`moba-jungle-map-player ${player.id === selfId || player.userId === selfId ? 'is-self' : ''}`}
            key={player.id}
            style={toPosition(player.position, arena)}
          />
        ))}
      </div>
      <small>Gulungan tersebar di jalur hutan</small>
    </div>
  )
}

function formatArenaTime(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(Number(remainingMs || 0) / 1000))
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export default function MobaArena({
  match,
  players = [],
  nodes = [],
  selfId,
  onClaimNode,
  onMove,
  canAct = false,
  remainingMs = 0,
}) {
  const arena = match?.config?.arena || DEFAULT_ARENA
  const self = players.find(player => player.id === selfId || player.userId === selfId)
  const interactionRadius = Number(match?.config?.nodeInteractionRadius) || 72
  const [mapOpen, setMapOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const bounds = getArenaBounds(arena)
  const tileSize = Number(arena.tileSize) > 0 ? Number(arena.tileSize) : 16
  const tileColumns = Number(arena.columns) > 0
    ? Number(arena.columns)
    : Math.round((bounds.maxX - bounds.minX) / tileSize)
  const tileRows = Number(arena.rows) > 0
    ? Number(arena.rows)
    : Math.round((bounds.maxY - bounds.minY) / tileSize)
  const selfX = Number(self?.position?.x)
  const selfY = Number(self?.position?.y)
  const selfXPercent = Number.isFinite(selfX)
    ? Math.max(0, Math.min(100, ((selfX - bounds.minX) / (bounds.maxX - bounds.minX)) * 100))
    : 50
  const selfYPercent = Number.isFinite(selfY)
    ? Math.max(0, Math.min(100, ((selfY - bounds.minY) / (bounds.maxY - bounds.minY)) * 100))
    : 50
  // Keep a camera dead-zone so the Pet visibly travels through the arena
  // instead of being perfectly pinned to the center on every server update.
  // Once it reaches the edge of the zone, the world follows it smoothly.
  const cameraTargetX = Math.max(35, Math.min(65, selfXPercent))
  const cameraTargetY = Math.max(35, Math.min(65, selfYPercent))
  const cameraStyle = {
    '--moba-camera-x': `${(50 - cameraTargetX) * 0.78}%`,
    '--moba-camera-y': `${(50 - cameraTargetY) * 0.78}%`,
    // Keep the same visual asset scale as the previous arena. The world
    // coordinate space is larger, but Pet, node, base, and tileset assets
    // should not shrink just because the map gained more room.
    '--moba-camera-zoom': 1.16,
  }

  return (
    <div
      className="moba11-arena moba-jungle-arena"
      role="img"
      aria-label="Arena pertandingan dua sisi TOMAT"
      data-arena-min-x={getArenaBounds(arena).minX}
      data-arena-max-x={getArenaBounds(arena).maxX}
      data-arena-min-y={getArenaBounds(arena).minY}
      data-arena-max-y={getArenaBounds(arena).maxY}
      data-tile-size={tileSize}
      data-tile-columns={tileColumns}
      data-tile-rows={tileRows}
    >
      <div className="moba-jungle-board">
          <div
            className="moba-jungle-board__world"
            style={{
              ...cameraStyle,
              '--moba-tile-size': `${tileSize}px`,
              '--moba-tile-columns': tileColumns,
              '--moba-tile-rows': tileRows,
            }}
          >
          {/* ── Base terrain ─────────────────────────────────── */}
          <div className="moba-jungle-terrain" aria-hidden="true" />
          <div className="moba-jungle-grid" />

          {/* ── Outer boundary walls ─────────────────────────── */}
          <div className="moba-map-outer moba-map-outer--top"    aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--bot"    aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--left"   aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--right"  aria-hidden="true" />

          {/* ── Lane bands ───────────────────────────────────── */}
          <div className="moba-lane-band moba-lane-band--top"    aria-hidden="true" />
          <div className="moba-lane-band moba-lane-band--mid"    aria-hidden="true" />
          <div className="moba-lane-band moba-lane-band--bot"    aria-hidden="true" />
          <span className="moba-lane-label" style={{ top:'9.375%', left:'50%' }}>Lajur Atas</span>
          <span className="moba-lane-label" style={{ top:'50%', left:'50%' }}>Lajur Tengah</span>
          <span className="moba-lane-label" style={{ top:'90.625%', left:'50%' }}>Lajur Bawah</span>

          {/* ── Jungle zones (darker green) ──────────────────── */}
          <div className="moba-jungle-zone moba-jungle-zone--upper" aria-hidden="true" />
          <div className="moba-jungle-zone moba-jungle-zone--lower" aria-hidden="true" />

          {/* ── Wall dividers (4 dividers × 4 segments each) ─── */}
          {[
            '16.25%', // top divider   y=13000-15000
            '41.25%', // mid-top       y=33000-35000
            '56.25%', // mid-bot       y=45000-47000
            '81.25%', // bot divider   y=65000-67000
          ].map((top, di) => (
            [
              { left:'2.5%',  width:'20%'  }, // x=2000-18000
              { left:'27.5%', width:'20%'  }, // x=22000-38000
              { left:'52.5%', width:'20%'  }, // x=42000-58000
              { left:'77.5%', width:'20%'  }, // x=62000-78000
            ].map((seg, si) => (
              <div key={`w${di}-${si}`} className="moba-wall-seg" aria-hidden="true"
                style={{ top, height:'2.5%', left: seg.left, width: seg.width }} />
            ))
          ))}

          {/* ── Forest tiles — trees (impassable, 16×16 units) ─ */}
          {[
            // Upper jungle (y ≈ 21-36%)
            [7.5,21.25,false],[20,21.25,true],[32.5,21.25,false],[47.5,21.25,true],
            [62.5,21.25,false],[77.5,21.25,true],[92.5,21.25,false],
            [12.5,28.75,true],[25,28.75,false],[37.5,31.25,true],[50,28.75,false],
            [62.5,31.25,true],[75,28.75,false],[87.5,31.25,true],
            // Lower jungle (y ≈ 61-76%)
            [7.5,61.25,false],[20,61.25,true],[32.5,61.25,false],[47.5,61.25,true],
            [62.5,61.25,false],[77.5,61.25,true],[92.5,61.25,false],
            [12.5,68.75,true],[25,68.75,false],[37.5,71.25,true],[50,68.75,false],
            [62.5,71.25,true],[75,68.75,false],[87.5,71.25,true],
          ].map(([lp, tp, alt], i) => (
            <img key={`tr${i}`} aria-hidden="true"
              src={alt ? '/moba-arena/moba-tree-spring-alt.png' : '/moba-arena/moba-tree-spring.png'}
              className="moba-forest-tree"
              style={{ left:`${lp}%`, top:`${tp}%` }}
            />
          ))}

          {/* ── Forest tiles — rocks (impassable, 6×6 units) ─── */}
          {[
            [22.5,24.375],[47.5,24.375],[72.5,24.375],
            [17.5,35],[37.5,35],[57.5,35],[77.5,35],
            [22.5,64.375],[47.5,64.375],[72.5,64.375],
            [17.5,75],[37.5,75],[57.5,75],[77.5,75],
          ].map(([lp, tp], i) => (
            <img key={`rk${i}`} aria-hidden="true"
              src="/moba-arena/FG_Grounds.png"
              className="moba-forest-rock"
              style={{ left:`${lp}%`, top:`${tp}%` }}
            />
          ))}

          {/* ── Crystals & relics in jungle ──────────────────── */}
          <img className="moba-jungle-relic moba-jungle-relic--1" style={{ left:'30%', top:'25%' }} src="/moba-arena/FG_Crystal_Blue_1.png" alt="" />
          <img className="moba-jungle-relic moba-jungle-relic--2" style={{ left:'55%', top:'33%' }} src="/moba-arena/FG_Crystal_Gold_1.png" alt="" />
          <img className="moba-jungle-relic moba-jungle-relic--3" style={{ left:'45%', top:'26%' }} src="/moba-arena/FG_Treasure_Big.png" alt="" />
          <img className="moba-jungle-relic moba-jungle-relic--4" style={{ left:'30%', top:'65%' }} src="/moba-arena/FG_Crystal_Blue_1.png" alt="" />
          <img className="moba-jungle-relic moba-jungle-relic--5" style={{ left:'55%', top:'73%' }} src="/moba-arena/FG_Crystal_Gold_1.png" alt="" />
          <img className="moba-jungle-relic moba-jungle-relic--6" style={{ left:'45%', top:'66%' }} src="/moba-arena/FG_Treasure_Small_1.png" alt="" />

          {/* ── Deposit boxes — Team A (attack right) ────────── */}
          {/* Lane-end boxes: right side top/mid/bot */}
          {[
            { top:'9.375%',  label:'Kotak A Atas',   lane:'top'    },
            { top:'50%',     label:'Kotak A Tengah',  lane:'middle' },
            { top:'90.625%', label:'Kotak A Bawah',   lane:'bottom' },
          ].map((z, i) => {
            const pts = match?.teams?.teamA?.tower?.points || 0
            const dest = match?.teams?.teamA?.tower?.destroyed
            return !dest && (
              <div key={`az${i}`} className="moba-deposit-box moba-deposit-box--a" style={{ left:'91%', top: z.top }} title={z.label}>
                <span className="moba-deposit-box__icon">📚</span>
                <span className="moba-deposit-box__pts">{i === 0 ? `${pts}/100` : '–/100'}</span>
                <span className="moba-deposit-box__lbl">{z.lane === 'top' ? 'Atas' : z.lane === 'middle' ? 'Tgah' : 'Bwh'}</span>
              </div>
            )
          })}
          {/* Base library — Team A's own base */}
          <div className="moba-deposit-library moba-deposit-library--a" style={{ left:'4%', top:'48%' }}>
            <span>📖</span><small>Pustaka A</small>
          </div>

          {/* ── Deposit boxes — Team B (attack left) ─────────── */}
          {[
            { top:'9.375%',  label:'Kotak B Atas',   lane:'top'    },
            { top:'50%',     label:'Kotak B Tengah',  lane:'middle' },
            { top:'90.625%', label:'Kotak B Bawah',   lane:'bottom' },
          ].map((z, i) => {
            const pts = match?.teams?.teamB?.tower?.points || 0
            const dest = match?.teams?.teamB?.tower?.destroyed
            return !dest && (
              <div key={`bz${i}`} className="moba-deposit-box moba-deposit-box--b" style={{ left:'7.5%', top: z.top }} title={z.label}>
                <span className="moba-deposit-box__icon">📚</span>
                <span className="moba-deposit-box__pts">{i === 0 ? `${pts}/100` : '–/100'}</span>
                <span className="moba-deposit-box__lbl">{z.lane === 'top' ? 'Atas' : z.lane === 'middle' ? 'Tgah' : 'Bwh'}</span>
              </div>
            )
          })}
          {/* Base library — Team B's own base */}
          <div className="moba-deposit-library moba-deposit-library--b" style={{ left:'93%', top:'48%' }}>
            <span>📖</span><small>Pustaka B</small>
          </div>

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
        </div>
      </div>
      <div className="moba-jungle-hud" aria-label="Kontrol arena">
        <div className="moba-jungle-brand">
          <span className="moba-jungle-brand__mark">T</span>
          <span><strong>TOMAT</strong><small>Arena belajar</small></span>
        </div>
        <div className="moba-jungle-score">
          <span className="moba-jungle-team-score moba-jungle-team-score--a">
            <b>{match?.teams?.teamA?.score || 0}</b>{match?.teams?.teamA?.name || 'Tim A'}
          </span>
          <span className="moba-jungle-vs">VS</span>
          <span className="moba-jungle-team-score moba-jungle-team-score--b">
            {match?.teams?.teamB?.name || 'Tim B'}<b>{match?.teams?.teamB?.score || 0}</b>
          </span>
        </div>
        <div className="moba-jungle-time">{match?.endsAt ? formatArenaTime(remainingMs) : '--:--'}</div>
        <button
          type="button"
          className="moba-jungle-icon-button moba-jungle-sound"
          onClick={() => setMuted(value => !value)}
          aria-label={muted ? 'Nyalakan suara arena' : 'Matikan suara arena'}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <div className="moba-jungle-actions">
          <button
            type="button"
            className="moba-jungle-icon-button"
            onClick={() => setMapOpen(value => !value)}
            aria-label={mapOpen ? 'Tutup peta arena' : 'Buka peta arena'}
          >
            <Map size={16} />
          </button>
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
        <div className="moba-jungle-hint" role="status" aria-live="polite">
          <Sparkles size={12} /> {self?.displayName || 'Pet'} bergerak mengikuti analog
        </div>
        <MiniMap
          compact
          arena={arena}
          players={players}
          nodes={nodes}
          selfId={selfId}
          onClose={() => setMapOpen(true)}
        />
        {mapOpen && <MiniMap arena={arena} players={players} nodes={nodes} selfId={selfId} onClose={() => setMapOpen(false)} />}
      </div>
    </div>
  )
}

export { DEFAULT_ARENA, distanceBetween, getArenaBounds, toPosition }