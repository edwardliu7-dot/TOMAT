import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, LoaderCircle, Radio, Search, Shield, Swords, Users, X } from 'lucide-react'
import { useAuth } from '../../AuthContext.jsx'
import useMobaSocket from './useMobaSocket.js'
import MobaBattleLoader from './MobaBattleLoader.jsx'
import './moba.css'

const TEAM_SIZES = [
  { value: 1, label: '1v1', detail: 'Duel cepat', icon: '⚔️' },
  { value: 2, label: '2v2', detail: 'Kerja sama tim', icon: '🛡️' },
  { value: 3, label: '3v3', detail: 'Pertarungan tim', icon: '🏆' },
]

export default function MobaLobbyScreen({ goBack, onEnterArena }) {
  const { user } = useAuth()
  const [teamSize, setTeamSize] = useState(1)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const matchedRef = useRef(null)

  const {
    state,
    connected,
    findMatch,
    cancelMatchmaking,
    clientLoaded,
  } = useMobaSocket({
    enabled: true,
    userId: user?.id || user?.userId || null,
    debug: 'auto',
  })

  const matchmaking = state.matchmaking || {}
  const isSearching = matchmaking.status === 'queued'
  const isMatched = matchmaking.status === 'matched' && matchmaking.matchId
  // Loading phase: match found but countdown hasn't started yet
  const isLoadingBattle = isMatched && !matchmaking.countdownStarted
  // Entering phase: countdown started → transition to arena
  const isEnteringArena = isMatched && matchmaking.countdownStarted === true
  const selectedTeam = useMemo(
    () => TEAM_SIZES.find(option => option.value === teamSize) || TEAM_SIZES[0],
    [teamSize],
  )
  const errorMessage = state.lastError?.message || notice

  // Transition to arena once the countdown starts (all clients loaded)
  useEffect(() => {
    if (!isEnteringArena || !matchmaking.matchId) return
    if (matchedRef.current === matchmaking.matchId) return
    matchedRef.current = matchmaking.matchId
    onEnterArena(matchmaking.matchId)
  }, [isEnteringArena, matchmaking.matchId, onEnterArena])

  const run = async action => {
    setBusy(true)
    setNotice('')
    try {
      await action()
    } catch (error) {
      setNotice(error?.message || 'Matchmaking belum berhasil. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const handleFindMatch = () => run(async () => {
    matchedRef.current = null
    await findMatch(teamSize)
  })

  const handleCancel = () => run(async () => {
    await cancelMatchmaking()
  })

  const handleBack = () => {
    if (isSearching) {
      handleCancel().finally(goBack)
      return
    }
    goBack()
  }

  // Show loading screen while waiting for all clients to be ready
  if (isLoadingBattle) {
    return (
      <MobaBattleLoader
        matchmaking={matchmaking}
        userId={user?.id || user?.userId}
        clientLoaded={clientLoaded}
      />
    )
  }

  return (
    <main className="moba11-lobby-screen">
      <div className="moba11-lobby-shell">
        <button type="button" className="moba11-lobby-back" onClick={handleBack} disabled={busy}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <section className="moba11-lobby-hero">
          <div className="moba11-lobby-kicker"><Radio size={14} /> MATCHMAKING ONLINE</div>
          <h1>Cari Lawan</h1>
          <p>
            Pilih ukuran tim, tekan cari lawan, dan sistem akan otomatis
            memasangkanmu dengan siswa lain yang sedang menunggu.
          </p>
        </section>

        <section className="moba11-lobby-card moba11-matchmaking-card">
          <div className="moba11-lobby-card__heading">
            <div>
              <h2>Mode pertandingan</h2>
              <p>Seperti matchmaking game favoritmu — tanpa kode ruangan.</p>
            </div>
            <Swords size={22} />
          </div>

          <div className="moba11-team-options">
            {TEAM_SIZES.map(option => (
              <button
                type="button"
                key={option.value}
                className={teamSize === option.value ? 'is-selected' : ''}
                onClick={() => setTeamSize(option.value)}
                disabled={busy || isSearching}
              >
                <span className="moba11-team-option__icon">{option.icon}</span>
                <strong>{option.label}</strong>
                <small>{option.detail}</small>
              </button>
            ))}
          </div>

          {!isSearching ? (
            <button
              type="button"
              className="moba11-primary-button"
              onClick={handleFindMatch}
              disabled={busy || !connected}
            >
              {busy || !connected
                ? <LoaderCircle size={17} className="moba11-spin" />
                : <Search size={17} />}
              {!connected ? 'Menyambungkan…' : 'Cari lawan'}
            </button>
          ) : (
            <div className="moba11-searching-panel">
              <div className="moba11-searching-panel__icon"><LoaderCircle size={26} className="moba11-spin" /></div>
              <div>
                <strong>Mencari lawan untuk {selectedTeam.label}</strong>
                <span>
                  {matchmaking.playersInQueue || 1} dari {matchmaking.playersNeeded || teamSize * 2} pemain siap
                </span>
              </div>
              <button type="button" onClick={handleCancel} disabled={busy} aria-label="Batalkan matchmaking">
                <X size={18} />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="moba11-lobby-alert">
              <AlertTriangle size={16} /> {errorMessage}
            </div>
          )}
        </section>

        <section className="moba11-lobby-card moba11-how-card">
          <div className="moba11-lobby-card__heading">
            <div><h2>Bagaimana cara bermain?</h2><p>Semua pemain akan masuk otomatis saat tim lengkap.</p></div>
            <Users size={22} />
          </div>
          <div className="moba11-how-grid">
            <div><span>1</span><p>Pilih mode tim</p></div>
            <div><span>2</span><p>Tekan cari lawan</p></div>
            <div><span>3</span><p>Masuk arena otomatis</p></div>
          </div>
          <div className="moba11-lobby-note"><Shield size={14} /> Pertandingan tetap non-combat dan fokus pada soal matematika.</div>
        </section>
      </div>
    </main>
  )
}