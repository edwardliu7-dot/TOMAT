import React from 'react'
import { Activity, Clock3, Wifi } from 'lucide-react'

const PHASE_LABELS = {
  lobby: 'Menunggu pemain',
  countdown: 'Bersiap',
  running_outer_tower: 'Tower luar',
  running_main_base: 'Base utama',
  finished: 'Selesai',
}

function formatRemaining(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function connectionCopy(connection) {
  if (connection === 'connected') return 'Terhubung'
  if (connection === 'connecting') return 'Menghubungkan'
  if (connection === 'disconnected') return 'Terputus'
  if (connection === 'error') return 'Koneksi bermasalah'
  return 'Belum tersambung'
}

export default function MobaHud({
  match,
  self,
  connection,
  remainingMs,
  eventFeed,
  onSnapshot,
  snapshotPending = false,
  onDeposit,
  canAct = false,
  targetTeamId = null,
}) {
  const teamA = match?.teams?.teamA
  const teamB = match?.teams?.teamB
  const capacity = self?.maxScrolls || 1
  const scrolls = self?.scrolls || []
  const isConnected = connection === 'connected'
  const feed = (eventFeed || []).slice(-4).reverse()

  return (
    <>
      <header className="moba11-topbar">
        <div className="moba11-brand">
          <div className="moba11-brand__mark">T</div>
          <div>
            <h1>TOMAT</h1>
            <p>Arena belajar bersama</p>
          </div>
        </div>
        <div className="moba11-topbar__actions">
          <div className="moba11-pill"><Clock3 size={14} /> MOBA · {match?.teamSize || '—'}v{match?.teamSize || '—'}</div>
          <div className={`moba11-pill moba11-pill--connection ${isConnected ? '' : 'is-offline'}`}>
            <span className="moba11-live-dot" />
            {connectionCopy(connection)}
            <Wifi size={14} />
          </div>
        </div>
      </header>

      <div className="moba11-match-head">
        <div className="moba11-phase">
          <span>Match #{match?.id || '—'}</span>
          <b><Activity size={12} /> {PHASE_LABELS[match?.phase] || match?.phase || 'Memuat'}</b>
        </div>
        <div className="moba11-timer">
          {match?.endsAt ? formatRemaining(remainingMs) : '--:--'}
          <small>{match?.phase === 'finished' ? 'SELESAI' : 'TERSISA'}</small>
        </div>
      </div>

      <div className="moba11-scoreboard">
        <div className="moba11-team-score">
          <strong>{teamA?.score || 0}</strong>
          <span>{teamA?.name || 'Tim A'}</span>
          <div className="moba11-score-line"><i style={{ width: `${Math.min(100, teamA?.score || 0)}%` }} /></div>
        </div>
        <div className="moba11-versus">VS</div>
        <div className="moba11-team-score moba11-team-score--right">
          <div className="moba11-score-line"><i style={{ width: `${Math.min(100, teamB?.score || 0)}%` }} /></div>
          <span>{teamB?.name || 'Tim B'}</span>
          <strong>{teamB?.score || 0}</strong>
        </div>
      </div>

    </>
  )
}

export { formatRemaining }