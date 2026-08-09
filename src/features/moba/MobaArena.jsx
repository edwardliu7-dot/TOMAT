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
        <i className="moba-jungle-map-lane--top" />
        <i className="moba-jungle-map-lane" />
        <i className="moba-jungle-map-lane--bot" />
        <i className="moba-jungle-map-river" />
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
          {/* ── Base terrain ─────────────────────────────────────── */}
          <div className="moba-jungle-terrain" aria-hidden="true" />
          <div className="moba-jungle-grid" />

          {/* ── Outer boundary walls / spawn zones ───────────────── */}
          <div className="moba-map-outer moba-map-outer--top"   aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--bot"   aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--left"  aria-hidden="true" />
          <div className="moba-map-outer moba-map-outer--right" aria-hidden="true" />

          {/* ── 3 diagonal lanes (top-right → bottom-left, gray path) ── */}
          <div className="moba-diagonal-lane moba-diagonal-lane--top" aria-hidden="true" />
          <div className="moba-diagonal-lane" aria-hidden="true" />
          <div className="moba-diagonal-lane moba-diagonal-lane--bot" aria-hidden="true" />

          {/* ── Diagonal river (top-left → bottom-right, water) ─────── */}
          <div className="moba-diagonal-river" aria-hidden="true" />

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

          {/* ── Deposit boxes (6 total: 3 per team, positioned by world coords) */}
          {[
            // Team A deposit zones (A carries scrolls here; world top-left area + center)
            { id:'az-1',   team:'teamA', x:  9_000, y:  8_000 },
            { id:'az-2',   team:'teamA', x:  7_000, y: 13_500 },
            { id:'az-ctr', team:'teamA', x: 43_000, y: 33_000 },
            // Team B deposit zones (B carries scrolls here; world bottom-right area + center)
            { id:'bz-1',   team:'teamB', x: 71_000, y: 66_500 },
            { id:'bz-2',   team:'teamB', x: 73_000, y: 71_000 },
            { id:'bz-ctr', team:'teamB', x: 35_000, y: 45_500 },
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
          <div className="moba-deposit-library moba-deposit-library--a"
            style={toPosition({ x: 5_000, y: 75_000 }, arena, isFlipped)}>
            <span>📖</span><small>Pustaka A</small>
          </div>
          <div className="moba-deposit-library moba-deposit-library--b"
            style={toPosition({ x: 75_000, y: 5_000 }, arena, isFlipped)}>
            <span>📖</span><small>Pustaka B</small>
          </div>

          {/* ── Team bases (corners: A=bottom-left, B=top-right) ── */}
          <MobaBase team={match?.teams?.teamA} side="left"
            style={{ ...toPosition({ x: 5_000, y: 75_000 }, arena, isFlipped), transform:'translateX(-50%) translateY(-50%)' }} />
          <MobaBase team={match?.teams?.teamB} side="right"
            style={{ ...toPosition({ x: 75_000, y: 5_000 }, arena, isFlipped), transform:'translateX(-50%) translateY(-50%)' }} />

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