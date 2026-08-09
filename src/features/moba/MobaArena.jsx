import React, { useEffect, useRef, useState } from 'react'
import { Map, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
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

// flip=true flips coordinates 180° — used for Team B so they see the map as if they
// also spawn at the bottom-left, matching the symmetric X-diagonal arena design.
function toPosition(position = {}, arena = DEFAULT_ARENA, flip = false) {
  const bounds = getArenaBounds(arena)
  let x = ((Number(position.x) - bounds.minX) / (bounds.maxX - bounds.minX)) * 100
  let y = ((Number(position.y) - bounds.minY) / (bounds.maxY - bounds.minY)) * 100
  if (flip) { x = 100 - x; y = 100 - y }
  return {
    left: `${Math.max(2, Math.min(98, Number.isFinite(x) ? x : 50))}%`,
    top:  `${Math.max(3, Math.min(97, Number.isFinite(y) ? y : 50))}%`,
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

function MiniMap({ arena, players, nodes, selfId, onClose, compact = false, flip = false }) {
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
        {/* Minimap SVG — mirrors the main arena lane layout */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none' }}>
          <defs>
            <linearGradient id="mm-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          {/* Top lane L */}
          <polyline points="5,95 5,5 95,5" fill="none" stroke="#6b6a58" strokeWidth="11" strokeLinecap="butt" strokeLinejoin="round" />
          {/* Bottom lane L */}
          <polyline points="5,95 95,95 95,5" fill="none" stroke="#6b6a58" strokeWidth="11" strokeLinecap="butt" strokeLinejoin="round" />
          {/* Mid lane diagonal */}
          <line x1="5" y1="95" x2="95" y2="5" stroke="#7a7963" strokeWidth="10" strokeLinecap="butt" />
          {/* River */}
          <line x1="10" y1="10" x2="90" y2="90" stroke="url(#mm-blue)" strokeWidth="13" strokeLinecap="round" />
        </svg>
        <i className="moba-jungle-map-base moba-jungle-map-base--a" />
        <i className="moba-jungle-map-base moba-jungle-map-base--b" />
        {nodes.map(node => (
          <i className="moba-jungle-map-node" key={node.id} style={toPosition(node.position, arena, flip)} />
        ))}
        {players.map(player => (
          <i
            className={`moba-jungle-map-player ${player.id === selfId || player.userId === selfId ? 'is-self' : ''}`}
            key={player.id}
            style={toPosition(player.position, arena, flip)}
          />
        ))}
      </div>
      <small>Gulungan tersebar di hutan dan sungai</small>
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
  // Team B sees the map flipped 180° so they also feel like they spawn at bottom-left
  const isFlipped = self?.teamId === 'teamB'
  const handleMove = (direction) => {
    if (!direction) return
    onMove?.(isFlipped ? { x: -direction.x, y: -direction.y } : direction)
  }

  // ── Facing direction: track the last horizontal direction per player ──────
  // facingLeft[playerId] = true  → sprite faces left (mirrored)
  //                        false → sprite faces right (normal)
  // Up/down movement keeps whatever the last horizontal state was.
  const prevPositionsRef = useRef({})
  const facingLeftRef     = useRef({})
  players.forEach(player => {
    const id   = player.id || player.userId
    const prev = prevPositionsRef.current[id]
    const cur  = player.position
    if (prev && cur) {
      const dx = Number(cur.x) - Number(prev.x)
      // Only update horizontal facing when there is meaningful horizontal delta
      if (Math.abs(dx) > 0.5) {
        facingLeftRef.current[id] = dx < 0
      }
    }
    prevPositionsRef.current[id] = cur
  })
  const tileSize = Number(arena.tileSize) > 0 ? Number(arena.tileSize) : 16
  const tileColumns = Number(arena.columns) > 0
    ? Number(arena.columns)
    : Math.round((bounds.maxX - bounds.minX) / tileSize)
  const tileRows = Number(arena.rows) > 0
    ? Number(arena.rows)
    : Math.round((bounds.maxY - bounds.minY) / tileSize)
  const selfX = Number(self?.position?.x)
  const selfY = Number(self?.position?.y)
  const selfXRaw = Number.isFinite(selfX)
    ? Math.max(0, Math.min(100, ((selfX - bounds.minX) / (bounds.maxX - bounds.minX)) * 100))
    : 50
  const selfYRaw = Number.isFinite(selfY)
    ? Math.max(0, Math.min(100, ((selfY - bounds.minY) / (bounds.maxY - bounds.minY)) * 100))
    : 50
  // Team B sees the world flipped 180°, so the camera must track the flipped position.
  // Without this, Team B's camera chases the wrong corner of the world.
  const selfXPercent = isFlipped ? 100 - selfXRaw : selfXRaw
  const selfYPercent = isFlipped ? 100 - selfYRaw : selfYRaw

  // Keep a camera dead-zone so the Pet visibly travels through the arena
  // instead of being perfectly pinned to the center on every server update.
  const cameraTargetX = Math.max(35, Math.min(65, selfXPercent))
  const cameraTargetY = Math.max(35, Math.min(65, selfYPercent))
  const cameraStyle = {
    '--moba-camera-x': `${(50 - cameraTargetX) * 0.78}%`,
    '--moba-camera-y': `${(50 - cameraTargetY) * 0.78}%`,
    '--moba-camera-zoom': 0.58,
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
          {/* ── Base terrain ─────────────────────────────────────── */}
          <div className="moba-jungle-terrain" aria-hidden="true" />
          <div className="moba-jungle-grid" />

          {/* ── Outer boundary walls / spawn zones ───────────────── */}
          <div className="moba-map-outer moba-map-outer--top"   aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--bot"   aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--left"  aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--right" aria-hidden="true" />

          {/*
           * ── SVG lane overlay ─────────────────────────────────────────────
           * preserveAspectRatio="none" maps viewBox 0-100 directly to % of
           * the container — so corner-to-corner lines are always geometrically
           * correct regardless of screen aspect ratio (no more skewed X).
           *
           * 3 lanes from the diagram:
           *   1. Blue  — NW→SE (top-left → bottom-right), thick, rounded ends
           *   2. Dashed — NE→SW, offset toward top-right (upper road edge)
           *   3. Gray  — NE→SW, offset toward bottom-left (lower road, wider)
           */}
          {/*
           * ── SVG lane overlay ──────────────────────────────────────────────
           * Coordinate system (server/CSS): origin top-left, Y increases down.
           * User Cartesian coords are converted: server_y = 80000 − user_y.
           *
           * Layout (in SVG 0-100 space = % of container):
           *   Top Lane    — L-shape: (5,95)→(5,5)→(95,5)   [left side ↑ then top →]
           *   Bottom Lane — L-shape: (5,95)→(95,95)→(95,5) [bottom → then right ↑]
           *   Mid Lane    — diagonal: (5,95)→(95,5)         [bottom-left→top-right]
           *   River       — diagonal: (10,10)→(90,90)       [top-left→bottom-right, crosses all 3]
           */}
          <svg
            className="moba-lanes-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="moba-blue-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#7dd3fc" stopOpacity="0.92" />
                <stop offset="50%"  stopColor="#38bdf8" stopOpacity="1"   />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.92" />
              </linearGradient>
            </defs>

            {/* Top Lane — L-shape: up left side, then across top */}
            <polyline points="5,95 5,5 95,5"
              fill="none" stroke="#6b6a58" strokeWidth="11"
              strokeLinecap="butt" strokeLinejoin="round" />

            {/* Bottom Lane — L-shape: across bottom, then up right side */}
            <polyline points="5,95 95,95 95,5"
              fill="none" stroke="#6b6a58" strokeWidth="11"
              strokeLinecap="butt" strokeLinejoin="round" />

            {/* Mid Lane — straight diagonal, bottom-left → top-right */}
            <line x1="5" y1="95" x2="95" y2="5"
              stroke="#7a7963" strokeWidth="10" strokeLinecap="butt" />
            {/* Mid lane center dashed divider */}
            <line x1="5" y1="95" x2="95" y2="5"
              stroke="#3a3a2a" strokeWidth="2.5" strokeLinecap="butt"
              strokeDasharray="4.5 3" />

            {/* River — diagonal top-left → bottom-right, crosses all 3 lanes.
                Round caps give the pill shape seen in the diagram. */}
            <line x1="10" y1="10" x2="90" y2="90"
              stroke="url(#moba-blue-grad)" strokeWidth="13" strokeLinecap="round" />
            {/* River inner shimmer */}
            <line x1="10" y1="10" x2="90" y2="90"
              stroke="rgba(186,230,253,0.30)" strokeWidth="5" strokeLinecap="round" />
          </svg>

          {/* ── Trees in 4 triangular jungle zones ───────────────── */}
          {[
            // TOP triangle  (small y, middle x)
            [25,12,false],[50,10,true],[75,12,false],[38,20,true],[62,20,false],
            // BOTTOM triangle (large y, middle x)
            [25,88,true],[50,90,false],[75,88,true],[38,80,false],[62,80,true],
            // LEFT triangle  (small x, middle y)
            [11,30,false],[11,50,true],[11,70,false],[21,40,true],[21,60,false],
            // RIGHT triangle (large x, middle y)
            [89,30,true],[89,50,false],[89,70,true],[79,40,false],[79,60,true],
          ].map(([lp, tp, alt], i) => (
            <img key={`tr${i}`} aria-hidden="true"
              src={alt ? '/moba-arena/moba-tree-spring-alt.png' : '/moba-arena/moba-tree-spring.png'}
              className="moba-forest-tree"
              style={{ left:`${lp}%`, top:`${tp}%` }}
            />
          ))}

          {/* ── Rocks in 4 triangular jungle zones ───────────────── */}
          {[
            [32,16],[55,17],[44,22],        // TOP
            [32,84],[55,83],[44,78],        // BOTTOM
            [16,30],[15,52],[16,70],        // LEFT
            [84,30],[85,52],[84,70],        // RIGHT
          ].map(([lp, tp], i) => (
            <img key={`rk${i}`} aria-hidden="true"
              src="/moba-arena/FG_Grounds.png"
              className="moba-forest-rock"
              style={{ left:`${lp}%`, top:`${tp}%` }}
            />
          ))}

          {/* ── Crystals & relics (one per triangular zone, two each) */}
          <img className="moba-jungle-relic" style={{ left:'35%', top:'17%', animationDelay:'0s'     }} src="/moba-arena/FG_Crystal_Blue_1.png"    alt="" />
          <img className="moba-jungle-relic" style={{ left:'62%', top:'19%', animationDelay:'.7s'    }} src="/moba-arena/FG_Crystal_Gold_1.png"    alt="" />
          <img className="moba-jungle-relic" style={{ left:'17%', top:'36%', animationDelay:'1.4s'   }} src="/moba-arena/FG_Treasure_Big.png"      alt="" />
          <img className="moba-jungle-relic" style={{ left:'17%', top:'62%', animationDelay:'2.1s'   }} src="/moba-arena/FG_Crystal_Blue_1.png"    alt="" />
          <img className="moba-jungle-relic" style={{ left:'82%', top:'38%', animationDelay:'2.8s'   }} src="/moba-arena/FG_Crystal_Gold_1.png"    alt="" />
          <img className="moba-jungle-relic" style={{ left:'82%', top:'61%', animationDelay:'1.1s'   }} src="/moba-arena/FG_Treasure_Small_1.png"  alt="" />

          {/* ── Deposit boxes (6 total: 3 per team)
           * Positions converted from user Cartesian (origin bottom-left):
           *   server_x = user_x,  server_y = 80000 − user_y
           *
           * Top lane  A-side turret : user (4000,68000)  → server (4000,12000)
           * Top lane  B-side turret : user (12000,76000) → server (12000,4000)
           * Mid lane  A-side turret : user (36000,36000) → server (36000,44000)
           * Bottom lane A-side turret: user (68000,4000) → server (68000,76000)
           * Bottom lane B-side turret: user (76000,12000)→ server (76000,68000)
           * Mid lane  B-side turret : user (44000,44000) → server (44000,36000)
           */}
          {[
            { id:'az-1',   team:'teamA', x:  4_000, y: 12_000 },
            { id:'az-2',   team:'teamA', x: 12_000, y:  4_000 },
            { id:'az-ctr', team:'teamA', x: 36_000, y: 44_000 },
            { id:'bz-1',   team:'teamB', x: 68_000, y: 76_000 },
            { id:'bz-2',   team:'teamB', x: 76_000, y: 68_000 },
            { id:'bz-ctr', team:'teamB', x: 44_000, y: 36_000 },
          ].map(z => {
            const pts = match?.teams?.[z.team]?.score || 0
            const cls = z.team === 'teamA' ? 'moba-deposit-box--a' : 'moba-deposit-box--b'
            return (
              <div key={z.id} className={`moba-deposit-box ${cls}`}
                style={toPosition(z, arena, isFlipped)} title={z.id}>
                <span className="moba-deposit-box__icon">📚</span>
                <span className="moba-deposit-box__pts">{pts}</span>
              </div>
            )
          })}

          {/* ── Base libraries ─────────────────────────────────── */}
          {/* user A=(4000,4000) → server (4000,76000); user B=(76000,76000) → server (76000,4000) */}
          <div className="moba-deposit-library moba-deposit-library--a"
            style={toPosition({ x: 4_000, y: 76_000 }, arena, isFlipped)}>
            <span>📖</span><small>Pustaka A</small>
          </div>
          <div className="moba-deposit-library moba-deposit-library--b"
            style={toPosition({ x: 76_000, y: 4_000 }, arena, isFlipped)}>
            <span>📖</span><small>Pustaka B</small>
          </div>

          {/* ── Team bases (A=bottom-left in screen, B=top-right in screen) ── */}
          <MobaBase team={match?.teams?.teamA} side="left"
            style={{ ...toPosition({ x: 4_000, y: 76_000 }, arena, isFlipped), transform:'translateX(-50%) translateY(-50%)' }} />
          <MobaBase team={match?.teams?.teamB} side="right"
            style={{ ...toPosition({ x: 76_000, y: 4_000 }, arena, isFlipped), transform:'translateX(-50%) translateY(-50%)' }} />

          {/* ── Question nodes ──────────────────────────────────── */}
          {nodes.map(node => (
            <MobaNode
              key={node.id}
              node={node}
              style={toPosition(node.position, arena, isFlipped)}
              isNearby={Boolean(self && distanceBetween(self.position, node.position) <= interactionRadius)}
              onClaim={onClaimNode}
            />
          ))}

          {/* ── Players ─────────────────────────────────────────── */}
          {players.map(player => {
            const pid = player.id || player.userId
            return (
              <div key={player.id} className="moba11-positioned" style={toPosition(player.position, arena, isFlipped)}>
                <MobaPet
                  player={player}
                  isSelf={player.id === selfId || player.userId === selfId}
                  facingLeft={facingLeftRef.current[pid] ?? false}
                />
              </div>
            )
          })}
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
          <MobaJoystick disabled={!canAct} onMove={handleMove} />
          <div className="moba12-move-pad" role="group" aria-label="Tombol gerak Pet">
            <MoveButton direction={{ x: 0, y: -1 }} onMove={handleMove} disabled={!canAct} label="Gerak ke atas">↑</MoveButton>
            <div>
              <MoveButton direction={{ x: -1, y: 0 }} onMove={handleMove} disabled={!canAct} label="Gerak ke kiri">←</MoveButton>
              <MoveButton direction={{ x: 1, y: 0 }} onMove={handleMove} disabled={!canAct} label="Gerak ke kanan">→</MoveButton>
            </div>
            <MoveButton direction={{ x: 0, y: 1 }} onMove={handleMove} disabled={!canAct} label="Gerak ke bawah">↓</MoveButton>
          </div>
        </div>
        <div className="moba-jungle-hint" role="status" aria-live="polite">
          <Sparkles size={12} /> {self?.displayName || 'Pet'} bergerak mengikuti analog
        </div>
        <MiniMap
          compact flip={isFlipped}
          arena={arena} players={players} nodes={nodes} selfId={selfId}
          onClose={() => setMapOpen(true)}
        />
        {mapOpen && <MiniMap arena={arena} players={players} nodes={nodes} selfId={selfId} flip={isFlipped} onClose={() => setMapOpen(false)} />}
      </div>
    </div>
  )
}

export { DEFAULT_ARENA, distanceBetween, getArenaBounds, toPosition }