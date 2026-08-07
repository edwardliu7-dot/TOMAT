import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, LoaderCircle, Radio, RefreshCw } from 'lucide-react'
import { useAuth } from '../../AuthContext.jsx'
import useMobaSocket from './useMobaSocket.js'
import { selectMobaNodes, selectMobaPlayers } from './mobaReducer.js'
import MobaArena from './MobaArena.jsx'
import MobaHud from './MobaHud.jsx'
import './moba.css'

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
    requestSnapshot,
    leave,
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
        />
        <section className="moba11-game-panel">
          <div className="moba11-game-panel__status">
            <span>Match #{state.match?.id || matchId || '—'}</span>
            {errorMessage && <span className="moba11-error"><AlertTriangle size={13} /> {errorMessage}</span>}
          </div>
          <MobaArena match={state.match} players={players} nodes={nodes} selfId={state.selfId} />
          <div className="moba11-game-panel__note">
            <Radio size={13} /> Posisi, node, skor, dan gulungan berasal dari snapshot server.
            {!connected && <><span>•</span><RefreshCw size={13} /> Menunggu koneksi pulih.</>}
          </div>
        </section>
      </div>
    </main>
  )
}