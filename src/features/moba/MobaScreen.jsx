import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, LoaderCircle, Radio, RefreshCw } from 'lucide-react'
import { useAuth } from '../../AuthContext.jsx'
import useMobaSocket from './useMobaSocket.js'
import { selectMobaNodes, selectMobaPlayers } from './mobaReducer.js'
import MobaArena from './MobaArena.jsx'
import MobaHud from './MobaHud.jsx'
import MobaQuestionModal, { MobaQuestionResult } from './MobaQuestionModal.jsx'
import './moba.css'

const KEY_MOVE_REPEAT_MS = 80
const KEYBOARD_DIRECTIONS = Object.freeze({
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
})

function useServerRemaining(match, serverNow) {
  const [clientNow, setClientNow] = useState(() => Date.now())
  const syncRef = useRef(null)

  useEffect(() => {
    if (!Number.isFinite(serverNow)) return
    syncRef.current = {
      serverNow,
      receivedAt: Date.now(),
    }
  }, [serverNow])

  useEffect(() => {
    const timer = window.setInterval(() => setClientNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!match?.endsAt) return 0
  const sync = syncRef.current
  if (!sync) return match.endsAt - clientNow
  const estimatedServerNow = sync.serverNow + (clientNow - sync.receivedAt)
  return match.endsAt - estimatedServerNow
}

export default function MobaScreen({ goBack, matchId: requestedMatchId = null, debug = false }) {
  const { user } = useAuth()
  const [snapshotPending, setSnapshotPending] = useState(false)
  const {
    state,
    connected,
    join,
    move,
    claimNode,
    answerQuestion,
    depositScroll,
    requestSnapshot,
    leave,
    clearQuestionResult,
  } = useMobaSocket({
    enabled: true,
    userId: user?.id || user?.userId || null,
    matchId: requestedMatchId,
    debug,
  })

  const matchId = requestedMatchId || state.matchId
  const players = useMemo(() => selectMobaPlayers(state), [state])
  const nodes = useMemo(() => selectMobaNodes(state), [state])
  const remainingMs = useServerRemaining(state.match, state.serverNow)
  const targetTeamId = state.self?.teamId === 'teamA' ? 'teamB' : 'teamA'
  const canAct = connected &&
    Boolean(state.self) &&
    ['running_outer_tower', 'running_main_base'].includes(state.match?.phase) &&
    Number(state.self?.stunUntil || 0) <= Date.now() &&
    !state.activeQuestion

  // Team B sees the world flipped 180°, so all directional input must be
  // inverted before being sent to the server — regardless of whether the
  // input came from the keyboard, analog joystick, or d-pad buttons.
  const isTeamB = state.self?.teamId === 'teamB'

  // Use a ref so sendMove is a stable function reference. MobaJoystick keeps
  // a setInterval that captures onMove at creation time; if sendMove changed
  // every time canAct flipped the old interval would hold a stale closure
  // with canAct=true and keep sending moves while a question is open.
  const canActRef = React.useRef(canAct)
  const isTeamBRef = React.useRef(isTeamB)
  useEffect(() => { canActRef.current = canAct }, [canAct])
  useEffect(() => { isTeamBRef.current = isTeamB }, [isTeamB])

  const sendMove = useCallback(direction => {
    if (!canActRef.current || !direction) return
    const sent = isTeamBRef.current ? { x: -direction.x, y: -direction.y } : direction
    move({ direction: sent }).catch(() => {})
  }, [move]) // stable: canAct/isTeamB read from refs, not closure

  useEffect(() => {
    const heldDirections = new Map()
    let repeatTimer = null

    const stopRepeating = () => {
      heldDirections.clear()
      if (repeatTimer) window.clearInterval(repeatTimer)
      repeatTimer = null
    }

    const sendHeldMoves = () => {
      heldDirections.forEach(direction => sendMove(direction))
    }

    const onKeyDown = event => {
      const direction = KEYBOARD_DIRECTIONS[event.key]
      if (!direction ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target?.isContentEditable) return
      event.preventDefault()
      if (heldDirections.has(event.key)) return
      heldDirections.set(event.key, direction)
      sendMove(direction)
      if (!repeatTimer) {
        repeatTimer = window.setInterval(sendHeldMoves, KEY_MOVE_REPEAT_MS)
      }
    }

    const onKeyUp = event => {
      if (!KEYBOARD_DIRECTIONS[event.key]) return
      heldDirections.delete(event.key)
      if (!heldDirections.size) {
        if (repeatTimer) window.clearInterval(repeatTimer)
        repeatTimer = null
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', stopRepeating)
    return () => {
      stopRepeating()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', stopRepeating)
    }
  }, [sendMove])

  useEffect(() => {
    if (!requestedMatchId || state.matchId || !connected) return
    join(requestedMatchId).catch(() => {})
  }, [connected, join, requestedMatchId, state.matchId])

  useEffect(() => () => {
    if (matchId) leave(matchId).catch(() => {})
  }, [leave, matchId])

  const refreshSnapshot = async () => {
    if (!matchId || snapshotPending) return
    setSnapshotPending(true)
    try {
      await requestSnapshot(matchId)
    } catch {
      // Error is already represented in the hook state.
    } finally {
      setSnapshotPending(false)
    }
  }

  const handleClaimNode = node => {
    if (!canAct || node?.status !== 'available') return
    claimNode({ nodeId: node.id }).catch(() => {})
  }

  // Auto-claim: when player walks onto a node, trigger claim without manual click.
  // Uses a per-node timestamp throttle so failed claims (PLAYER_TOO_FAR, etc.)
  // are retried after 2 s instead of being permanently blocked by a ref flag.
  const claimThrottleRef = React.useRef(new Map())
  const self = state.self
  const interactionRadius = Number(state.match?.config?.nodeInteractionRadius) || 3000
  React.useEffect(() => {
    if (!canAct) return
    const selfPos = self?.position
    if (!selfPos) return
    const nearby = nodes.find(node =>
      node.status === 'available' &&
      Math.hypot(
        Number(node.position?.x) - Number(selfPos.x),
        Number(node.position?.y) - Number(selfPos.y),
      ) <= interactionRadius
    )
    if (!nearby) return
    const now = Date.now()
    const lastSent = claimThrottleRef.current.get(nearby.id) || 0
    if (now - lastSent < 2000) return   // one attempt per node per 2 s
    claimThrottleRef.current.set(nearby.id, now)
    claimNode({ nodeId: nearby.id }).catch(() => {})
  }, [canAct, self?.position?.x, self?.position?.y, nodes, interactionRadius, claimNode])

  const handleAnswer = payload => answerQuestion(payload)

  const handleDeposit = scroll => {
    if (!canAct || !scroll || !targetTeamId) return
    depositScroll({
      targetId: targetTeamId,
      scrollId: scroll.id,
    }).catch(() => {})
  }

  const dismissQuestionResult = () => {
    // The next server event/snapshot can still replace this result. Clearing
    // locally only dismisses the transient notification.
    clearQuestionResult()
  }

  if (!requestedMatchId && !state.match) {
    return (
      <main className="moba11-empty">
        <div className="moba11-empty__card">
          <Radio size={30} />
          <h1>Arena MOBA belum dipilih</h1>
          <p>Masuk melalui lobby MOBA untuk menampilkan pertandingan yang sedang berlangsung.</p>
          <button onClick={goBack}><ArrowLeft size={16} /> Kembali</button>
        </div>
      </main>
    )
  }

  if (!state.match && (state.connection === 'connecting' || state.connection === 'idle')) {
    return (
      <main className="moba11-empty">
        <div className="moba11-empty__card">
          <LoaderCircle className="moba11-spin" size={30} />
          <h1>Menghubungkan ke arena…</h1>
          <p>State pertandingan sedang diminta dari server.</p>
        </div>
      </main>
    )
  }

  const errorMessage = state.lastError?.message
  return (
    <main className="moba11-screen">
      <div className="moba11-shell">
        <MobaHud
          match={state.match}
          self={state.self}
          connection={state.connection}
          remainingMs={remainingMs}
          eventFeed={state.eventFeed}
          onSnapshot={refreshSnapshot}
          snapshotPending={snapshotPending}
          onDeposit={handleDeposit}
          canAct={canAct}
          targetTeamId={targetTeamId}
        />
        <section className="moba11-game-panel">
          <div className="moba11-game-panel__status">
            <span>Match #{state.match?.id || matchId || '—'}</span>
            {errorMessage && <span className="moba11-error"><AlertTriangle size={13} /> {errorMessage}</span>}
          </div>
          <MobaArena
            match={state.match}
            players={players}
            nodes={nodes}
            selfId={state.selfId}
            onClaimNode={handleClaimNode}
            onMove={sendMove}
            canAct={canAct}
            remainingMs={remainingMs}
          />
          <div className="moba11-game-panel__note">
            <Radio size={13} /> Posisi, node, skor, dan gulungan berasal dari snapshot server.
            {!connected && <><span>•</span><RefreshCw size={13} /> Menunggu koneksi pulih.</>}
          </div>
        </section>
        <MobaQuestionModal
          questionState={state.activeQuestion}
          onAnswer={handleAnswer}
          disabled={!connected}
        />
        <MobaQuestionResult
          result={state.questionResult}
          onClose={dismissQuestionResult}
        />
      </div>
    </main>
  )
}