import React, { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, Copy, LoaderCircle, LogIn, Radio, Users } from 'lucide-react'
import { useAuth } from '../../AuthContext.jsx'
import useMobaSocket from './useMobaSocket.js'
import './moba.css'

const TEAM_SIZES = [
  { value: 1, label: '1v1', detail: 'Duel cepat, dua pemain' },
  { value: 2, label: '2v2', detail: 'Kerja sama berdua' },
  { value: 3, label: '3v3', detail: 'Tim paling ramai' },
]

function copyText(value) {
  if (!value) return Promise.reject(new Error('Tidak ada ID pertandingan.'))
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
  return Promise.reject(new Error('Clipboard tidak tersedia.'))
}

function getPlayers(match) {
  return Array.isArray(match?.players) ? match.players : []
}

export default function MobaLobbyScreen({ goBack, onEnterArena }) {
  const { user } = useAuth()
  const [teamSize, setTeamSize] = useState(1)
  const [matchIdInput, setMatchIdInput] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    state,
    connected,
    createMatch,
    join,
    ready,
    leave,
  } = useMobaSocket({
    enabled: true,
    userId: user?.id || user?.userId || null,
    matchId: roomId,
    debug: 'auto',
  })

  const match = state.match
  const players = useMemo(() => getPlayers(match), [match])
  const isLobby = match?.phase === 'lobby'
  const isFull = match?.teams?.teamA?.playerIds?.length === match?.teamSize &&
    match?.teams?.teamB?.playerIds?.length === match?.teamSize
  const selfReady = Boolean(state.self?.ready)
  const errorMessage = state.lastError?.message || notice

  const run = async action => {
    setBusy(true)
    setNotice('')
    try {
      return await action()
    } catch (error) {
      setNotice(error?.message || 'Aksi MOBA belum berhasil. Coba lagi.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const handleCreate = () => run(async () => {
    const result = await createMatch(teamSize)
    if (result?.matchId) setRoomId(result.matchId)
    return result
  })

  const handleJoin = () => run(async () => {
    const requestedId = matchIdInput.trim()
    if (!requestedId) {
      setNotice('Masukkan ID pertandingan dari temanmu.')
      return null
    }
    setRoomId(requestedId)
    const result = await join(requestedId)
    if (result?.ok === false) setRoomId(null)
    return result
  })

  const handleReady = () => run(() => ready(!selfReady))

  const handleCopy = () => {
    copyText(state.matchId || roomId)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => setNotice('ID belum dapat disalin.'))
  }

  const handleBack = () => {
    if (!roomId) {
      goBack()
      return
    }
    // Once countdown/running has started the server intentionally rejects
    // leaveMatch. The player can still return to the previous screen; the
    // arena route remains the safe way to rejoin the live match.
    if (!isLobby) {
      goBack()
      return
    }
    run(async () => {
      await leave(roomId)
      goBack()
    })
  }

  if (!match) {
    return (
      <main className="moba11-lobby-screen">
        <div className="moba11-lobby-shell">
          <button type="button" className="moba11-lobby-back" onClick={goBack}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <section className="moba11-lobby-hero">
            <div className="moba11-lobby-kicker"><Radio size={14} /> MODE MULTIPLAYER</div>
            <h1>Arena MOBA</h1>
            <p>Belajar bersama teman dalam arena 2D non-combat. Kumpulkan gulungan soal, lalu setor ke base timmu.</p>
          </section>

          <section className="moba11-lobby-card">
            <div className="moba11-lobby-card__heading">
              <div><h2>Buat pertandingan</h2><p>Pilih ukuran tim untuk mendapatkan ID pertandingan.</p></div>
              <Users size={22} />
            </div>
            <div className="moba11-team-options">
              {TEAM_SIZES.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={teamSize === option.value ? 'is-selected' : ''}
                  onClick={() => setTeamSize(option.value)}
                  disabled={busy}
                >
                  <strong>{option.label}</strong>
                  <span>{option.detail}</span>
                </button>
              ))}
            </div>
            <button type="button" className="moba11-primary-button" onClick={handleCreate} disabled={busy || !connected}>
              {busy ? <LoaderCircle size={17} className="moba11-spin" /> : <Radio size={17} />}
              {connected ? 'Buat arena baru' : 'Menyambungkan…'}
            </button>
          </section>

          <section className="moba11-lobby-card moba11-lobby-card--join">
            <div className="moba11-lobby-card__heading">
              <div><h2>Gabung pertandingan</h2><p>Tempel ID pertandingan yang dibagikan temanmu.</p></div>
              <LogIn size={22} />
            </div>
            <div className="moba11-join-row">
              <input
                value={matchIdInput}
                onChange={event => setMatchIdInput(event.target.value)}
                placeholder="Contoh: match-..."
                aria-label="ID pertandingan"
                disabled={busy}
              />
              <button type="button" onClick={handleJoin} disabled={busy || !connected || !matchIdInput.trim()}>
                Gabung
              </button>
            </div>
          </section>

          {errorMessage && <div className="moba11-lobby-alert"><AlertTriangle size={16} /> {errorMessage}</div>}
        </div>
      </main>
    )
  }

  return (
    <main className="moba11-lobby-screen">
      <div className="moba11-lobby-shell">
        <button type="button" className="moba11-lobby-back" onClick={handleBack} disabled={busy}>
          <ArrowLeft size={16} /> Keluar dari lobby
        </button>
        <section className="moba11-lobby-card moba11-room-card">
          <div className="moba11-lobby-kicker"><Radio size={14} /> LOBBY SIAP BERMAIN</div>
          <h1>{match.teamSize}v{match.teamSize} · Menunggu tim lengkap</h1>
          <p className="moba11-room-help">Bagikan ID ini kepada teman yang akan bermain bersamamu.</p>
          <div className="moba11-room-id">
            <code>{state.matchId || roomId}</code>
            <button type="button" onClick={handleCopy} aria-label="Salin ID pertandingan">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          <div className="moba11-roster">
            {players.map(player => (
              <div className="moba11-roster-player" key={player.id}>
                <span className="moba11-roster-pet">{player.petType === 'nananaga' ? '🐲' : player.petType === 'monyang' ? '🐒' : player.petType === 'kelinsay' ? '🐰' : '🐹'}</span>
                <div><strong>{player.displayName || 'Siswa'}</strong><small>{player.teamId === 'teamA' ? 'Tim A' : 'Tim B'} · {player.ready ? 'Siap' : 'Belum siap'}</small></div>
                {player.ready && <Check size={16} />}
              </div>
            ))}
            {Array.from({ length: Math.max(0, match.teamSize * 2 - players.length) }).map((_, index) => (
              <div className="moba11-roster-player is-empty" key={`empty-${index}`}>
                <span className="moba11-roster-pet">?</span><div><strong>Menunggu pemain…</strong><small>Bagikan ID pertandingan</small></div>
              </div>
            ))}
          </div>

          {isLobby ? (
            <button type="button" className="moba11-primary-button" onClick={handleReady} disabled={busy || !isFull}>
              {busy ? <LoaderCircle size={17} className="moba11-spin" /> : <Check size={17} />}
              {selfReady ? 'Batalkan siap' : isFull ? 'Saya siap bermain' : 'Menunggu tim lawan lengkap'}
            </button>
          ) : (
            <button type="button" className="moba11-primary-button" onClick={() => onEnterArena(state.matchId)} disabled={!state.matchId}>
              <Radio size={17} /> Masuk ke arena
            </button>
          )}
          {errorMessage && <div className="moba11-lobby-alert"><AlertTriangle size={16} /> {errorMessage}</div>}
        </section>
      </div>
    </main>
  )
}