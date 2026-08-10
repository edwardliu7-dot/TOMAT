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
const MOVE_REPEAT_MS = 150
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

function MiniMap({ arena, players, nodes, depositZones = [], selfId, onClose, compact = false, flip = false }) {
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
        {/* Deposit zone markers on minimap */}
        {depositZones.map(z => (
          <i
            key={`mm-dz-${z.id}`}
            className={`moba-jungle-map-zone ${z.team === 'teamA' ? 'is-a' : 'is-b'}`}
            style={toPosition(z, arena, flip)}
            title={z.id}
          />
        ))}
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

function formatDepositTime(timestamp, startedAt) {
  const depositedAt = Number(timestamp)
  const matchStartedAt = Number(startedAt)
  if (!Number.isFinite(depositedAt) || !Number.isFinite(matchStartedAt)) return '--:--'
  const elapsedSeconds = Math.max(0, Math.floor((depositedAt - matchStartedAt) / 1000))
  return `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`
}

function getMatchWinner(match) {
  const teamAScore = Number(match?.teams?.teamA?.score || 0)
  const teamBScore = Number(match?.teams?.teamB?.score || 0)
  if (teamAScore === teamBScore) return 'draw'
  return teamAScore > teamBScore ? 'teamA' : 'teamB'
}

function MobaMatchResultOverlay({ match, self, onBack }) {
  const winner = getMatchWinner(match)
  const isDraw = winner === 'draw'
  const isWinner = !isDraw && self?.teamId === winner
  const winningScore = Number(match?.teams?.[winner]?.score || 0)
  const rewardCoins = isWinner && winningScore > 0
    ? Math.max(1, Math.min(winningScore, 500))
    : 0
  const history = [...(match?.depositHistory || [])].reverse()
  const startedAt = match?.startedAt
  const teamA = match?.teams?.teamA
  const teamB = match?.teams?.teamB

  return (
    <div className="moba-match-result-layer" role="dialog" aria-modal="true" aria-labelledby="moba-match-result-title">
      <div className="moba-match-result-card">
        <div className={`moba-match-result-kicker ${isDraw ? 'is-draw' : isWinner ? 'is-win' : 'is-loss'}`}>
          {isDraw ? 'PERTANDINGAN SELESAI' : isWinner ? 'KEMENANGAN TIMMU' : 'PERTANDINGAN SELESAI'}
        </div>
        <h1 id="moba-match-result-title">
          {isDraw ? 'HASIL SERI' : isWinner ? 'KAMU MENANG!' : 'KAMU KALAH'}
        </h1>
        <p className="moba-match-result-subtitle">
          {isDraw
            ? 'Kedua tim mengumpulkan poin yang sama.'
            : `${winner === 'teamA' ? teamA?.name || 'Tim A' : teamB?.name || 'Tim B'} menjadi pemenang.`}
        </p>

        <div className="moba-match-result-scores" aria-label="Skor akhir kedua tim">
          <div className="moba-match-result-score moba-match-result-score--a">
            <span>{teamA?.name || 'Tim A'}</span>
            <b>{teamA?.score || 0}</b>
            <small>POIN</small>
          </div>
          <div className="moba-match-result-score-vs">VS</div>
          <div className="moba-match-result-score moba-match-result-score--b">
            <span>{teamB?.name || 'Tim B'}</span>
            <b>{teamB?.score || 0}</b>
            <small>POIN</small>
          </div>
        </div>

        {rewardCoins > 0 && (
          <div className="moba-match-result-reward">
            <span>🪙</span>
            <div>
              <strong>+{rewardCoins} koin untukmu</strong>
              <small>Poin pemenang dikonversi otomatis dan sudah diberikan ke akunmu.</small>
            </div>
          </div>
        )}

        <div className="moba-match-result-history">
          <div className="moba-match-result-history__heading">
            <span>RIWAYAT SETOR POIN</span>
            <small>{history.length} setoran</small>
          </div>
          <div className="moba-match-result-history__list">
            {history.length === 0 ? (
              <div className="moba-match-result-history__empty">Belum ada poin yang disetor.</div>
            ) : history.map(entry => (
              <div className="moba-match-result-history__row" key={entry.id}>
                <span className={`moba-match-result-history__dot ${entry.teamId === 'teamA' ? 'is-a' : 'is-b'}`} />
                <div>
                  <strong>
                    {entry.displayName || 'Pemain'} setor poin pada{' '}
                    {formatDepositTime(entry.depositedAt, startedAt)}
                  </strong>
                  <small>{entry.teamId === 'teamA' ? teamA?.name || 'Tim A' : teamB?.name || 'Tim B'}</small>
                </div>
                <b>+{entry.awardedPoints}</b>
              </div>
            ))}
          </div>
        </div>

        {onBack && (
          <button type="button" className="moba-match-result-back" onClick={onBack}>
            Kembali ke menu
          </button>
        )}
      </div>
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
  remainingMs = 0,
  onBack,
}) {
  const arena = match?.config?.arena || DEFAULT_ARENA
  const self = players.find(player => player.id === selfId || player.userId === selfId)
  const interactionRadius = Number(match?.config?.nodeInteractionRadius) || 72
  const [mapOpen, setMapOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const isFinished = match?.phase === 'finished'

  // ── Deposit burst animation ───────────────────────────────────────────────
  // burstZones: Set of zone IDs that should show the burst class right now.
  const [burstZones, setBurstZones] = useState(() => new Set())
  const prevFillsRef = useRef({})
  const burstTimersRef = useRef({})

  // Detect fill increases after each render and schedule the burst class.
  // Using useEffect keeps this out of the render phase (no side effects during render).
  const depositBoxes = match?.depositBoxes || []
  useEffect(() => {
    const triggered = []
    depositBoxes.forEach(box => {
      if (!box?.id) return
      const prev = prevFillsRef.current[box.id] ?? box.fill
      if (box.fill > prev) {
        triggered.push(box.id)
      }
      prevFillsRef.current[box.id] = box.fill
    })
    if (triggered.length === 0) return
    setBurstZones(s => {
      const n = new Set(s)
      triggered.forEach(id => n.add(id))
      return n
    })
    triggered.forEach(id => {
      if (burstTimersRef.current[id]) clearTimeout(burstTimersRef.current[id])
      burstTimersRef.current[id] = setTimeout(() => {
        setBurstZones(s => { const n = new Set(s); n.delete(id); return n })
      }, 600)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositBoxes])

  // Clean up timers on unmount.
  useEffect(() => () => Object.values(burstTimersRef.current).forEach(clearTimeout), [])
  const bounds = getArenaBounds(arena)
  // Team B sees the map flipped 180° so they also feel like they spawn at bottom-left
  const isFlipped = self?.teamId === 'teamB'
  const handleMove = (direction) => {
    if (!direction) return
    onMove?.(direction) // flip already applied in sendMove (MobaScreen)
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
      // Only update horizontal facing when there is meaningful horizontal delta.
      // Team B sees the world flipped 180°: world +x = screen −x, so facing is inverted.
      if (Math.abs(dx) > 0.5) {
        facingLeftRef.current[id] = isFlipped ? dx > 0 : dx < 0
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

  // Camera tightly follows the player (no dead-zone).
  // CSS: translate(T) … scale(S) → to center player at P% of world div,
  // T must equal (50 − P) * S so the scaled element lands at screen 50%.
  const ZOOM = 2.0
  const cameraStyle = {
    '--moba-camera-x': `${(50 - selfXPercent) * ZOOM}%`,
    '--moba-camera-y': `${(50 - selfYPercent) * ZOOM}%`,
    '--moba-camera-zoom': ZOOM,
  }

  return (
    <div
      className={`moba11-arena moba-jungle-arena${isFinished ? ' is-finished' : ''}`}
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
            [25,12],[50,10],[75,12],[38,20],[62,20],
            // BOTTOM triangle (large y, middle x)
            [25,88],[50,90],[75,88],[38,80],[62,80],
            // LEFT triangle  (small x, middle y)
            [11,30],[11,50],[11,70],[21,40],[21,60],
            // RIGHT triangle (large x, middle y)
            [89,30],[89,50],[89,70],[79,40],[79,60],
          ].map(([lp, tp], i) => (
            <div key={`tr${i}`} aria-hidden="true"
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
            <div key={`rk${i}`} aria-hidden="true"
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

          {/* ── Deposit zones — driven by match.config.depositZones from server ── */}
          {(() => {
            const zones = match?.config?.depositZones || []
            const boxFills = match?.depositBoxes || []
            const selfTeam = self?.teamId
            const hasScrolls = Boolean(self?.scrolls?.length)
            const boxCapacity = match?.config?.boxCapacity ?? 100

            return zones.map(z => {
              const boxState = boxFills.find(b => b.id === z.id)
              const fill = boxState?.fill ?? 0
              const completed = boxState?.completedBoxes ?? 0
              const isMine = z.team === selfTeam
              const teamCls = z.team === 'teamA' ? 'moba-deposit-box--a' : 'moba-deposit-box--b'
              const mineCls = isMine ? 'moba-deposit-box--mine' : 'moba-deposit-box--enemy'
              const pulseCls = isMine && hasScrolls ? 'moba-deposit-box--pulsing' : ''
              const burstCls = burstZones.has(z.id) ? 'moba-deposit-box--burst' : ''
              const fillPct = Math.min(100, Math.round((fill / boxCapacity) * 100))

              return (
                <div
                  key={z.id}
                  className={`moba-deposit-box ${teamCls} ${mineCls} ${pulseCls} ${burstCls}`}
                  style={toPosition(z, arena, isFlipped)}
                  title={isMine ? `Zona setormu — ${fill}/${boxCapacity}` : `Zona lawan (${z.team})`}
                >
                  {isMine && hasScrolls && (
                    <span className="moba-deposit-box__arrow" aria-hidden="true">▼</span>
                  )}
                  <span className="moba-deposit-box__icon">
                    {isMine ? <span className="moba-sprite-box" aria-hidden="true" /> : '🏛️'}
                  </span>
                  {isMine && (
                    <>
                      <div className="moba-deposit-box__bar" aria-hidden="true">
                        <div className="moba-deposit-box__fill" style={{ width: `${fillPct}%` }} />
                      </div>
                      <span className="moba-deposit-box__pts">
                        {fill}<span style={{ opacity: .55 }}>/{boxCapacity}</span>
                        {completed > 0 && <span className="moba-deposit-box__done">×{completed}</span>}
                      </span>
                    </>
                  )}
                </div>
              )
            })
          })()}

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
      {isFinished && <MobaMatchResultOverlay match={match} self={self} onBack={onBack} />}
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
        {/* Analog joystick — fixed bottom-left, outside the actions cluster */}
        <MobaJoystick disabled={!canAct} onMove={handleMove} />
        <div className="moba-jungle-actions">
          <button
            type="button"
            className="moba-jungle-icon-button"
            onClick={() => setMapOpen(value => !value)}
            aria-label={mapOpen ? 'Tutup peta arena' : 'Buka peta arena'}
          >
            <Map size={16} />
          </button>
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
        {(() => {
          const depositZones = match?.config?.depositZones || []
          return (
            <>
              <MiniMap
                compact flip={isFlipped}
                arena={arena} players={players} nodes={nodes} depositZones={depositZones} selfId={selfId}
                onClose={() => setMapOpen(true)}
              />
              {mapOpen && (
                <MiniMap
                  arena={arena} players={players} nodes={nodes} depositZones={depositZones} selfId={selfId} flip={isFlipped}
                  onClose={() => setMapOpen(false)}
                />
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}

export { DEFAULT_ARENA, distanceBetween, getArenaBounds, toPosition }