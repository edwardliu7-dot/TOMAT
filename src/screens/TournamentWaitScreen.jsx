import React, { useEffect, useState } from 'react'
import { connectSocket } from '../socket'
import { usePlayer } from '../PlayerContext'

const RANK_LABEL = { 1: '🥇 Juara 1', 2: '🥈 Runner-up', 3: '🥉 Peringkat 3' }
const RANK_COLOR = { 1: '#fbbf24', 2: '#94A3B8', 3: '#cd7c3a' }

// ── Classic single-elimination bracket ─────────────────────────────────────
export function ClassicBracket({ rounds, myUserId, currentRound, mode, onMatchClick }) {
  const isKelompok = mode === 'kelompok'
  const PLAYER_H = isKelompok ? 42 : 30
  const MATCH_H  = PLAYER_H * 2 + 1
  const MATCH_W  = 158
  const V_GAP    = 14
  const CONN_W   = 44
  const TROPHY_W = 56
  const LABEL_H  = 22

  if (!rounds || rounds.length === 0) return null

  const baseSlot = MATCH_H + V_GAP
  const slotAt   = r => Math.pow(2, r) * baseSlot
  const matchTop = (r, m) => { const s = slotAt(r); return m * s + (s - MATCH_H) / 2 }

  const numRounds  = rounds.length
  const firstCount = rounds[0].matches.length
  const bracketH   = Math.max(firstCount * baseSlot, MATCH_H + 20)
  const totalH     = bracketH + LABEL_H
  const totalW     = numRounds * MATCH_W + (numRounds - 1) * CONN_W + CONN_W + TROPHY_W + 8

  const matchCY = (r, m) => matchTop(r, m) + LABEL_H + MATCH_H / 2

  const LINE_C = 'rgba(255,255,255,0.14)'
  const LINE_W = 1.5

  function PlayerSlot({ player, match }) {
    const isMe     = player?.userId === myUserId
    const isWinner = match.winner?.userId === player?.userId
    const isLoser  = match.winner && !isWinner && !!player
    const isBye    = !player && match.status === 'bye'
    const nameColor = isLoser  ? '#263040'
                    : isWinner ? '#34D399'
                    : isMe     ? '#67E8F9'
                    : '#5a6a80'

    if (isKelompok && player?.teamName) {
      return (
        <div style={{ height: PLAYER_H, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4, background: isWinner ? 'rgba(16,185,129,0.13)' : isMe ? 'rgba(103,232,249,0.08)' : 'transparent' }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: nameColor }}>
              {(isMe ? '🐸 ' : '') + player.teamName}
            </span>
            <span style={{ fontSize: 9, color: '#3a4a5a', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ({player.name})
            </span>
          </div>
          {isWinner && <span style={{ fontSize: 9, color: '#34D399', flexShrink: 0 }}>✓</span>}
          {!isWinner && match.scores?.[player?.userId] != null && (
            <span style={{ fontSize: 9, color: '#fbbf24', flexShrink: 0, fontWeight: 700 }}>{match.scores[player.userId]}</span>
          )}
        </div>
      )
    }

    return (
      <div style={{ height: PLAYER_H, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4, background: isWinner ? 'rgba(16,185,129,0.13)' : isMe ? 'rgba(103,232,249,0.08)' : 'transparent' }}>
        <span style={{ fontSize: 11, fontWeight: isWinner ? 800 : 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: nameColor }}>
          {player ? (isMe ? '🐸 ' : '') + player.name : isBye ? 'BYE' : '—'}
        </span>
        {isWinner && <span style={{ fontSize: 9, color: '#34D399', flexShrink: 0 }}>✓</span>}
        {!isWinner && match.scores?.[player?.userId] != null && (
          <span style={{ fontSize: 9, color: '#fbbf24', flexShrink: 0, fontWeight: 700 }}>{match.scores[player.userId]}</span>
        )}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: totalW, height: totalH }}>
        {rounds.map((round, ri) => {
          const isCurrent = (ri + 1) === currentRound
          return (
            <div key={`lbl-${ri}`} style={{ position: 'absolute', left: ri * (MATCH_W + CONN_W), top: 0, width: MATCH_W, height: LABEL_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, letterSpacing: 1.2, color: isCurrent ? '#f59e0b' : '#2d3d52', textTransform: 'uppercase' }}>
              {round.label || `Ronde ${ri + 1}`}{isCurrent ? ' ⚡' : ''}
            </div>
          )
        })}

        <svg style={{ position: 'absolute', left: 0, top: 0, width: totalW, height: totalH, overflow: 'visible', pointerEvents: 'none' }}>
          {rounds.slice(0, -1).map((round, ri) => {
            const x1 = ri * (MATCH_W + CONN_W) + MATCH_W
            const x2 = (ri + 1) * (MATCH_W + CONN_W)
            const xMid = (x1 + x2) / 2
            return rounds[ri + 1].matches.map((_, nmi) => {
              const topI = nmi * 2
              const botI = nmi * 2 + 1
              const cy1 = matchCY(ri, topI)
              const cy2 = botI < round.matches.length ? matchCY(ri, botI) : cy1
              const cyN = matchCY(ri + 1, nmi)
              return (
                <g key={`cn-${ri}-${nmi}`}>
                  <line x1={x1} y1={cy1} x2={xMid} y2={cy1} stroke={LINE_C} strokeWidth={LINE_W} />
                  {botI < round.matches.length && <line x1={x1} y1={cy2} x2={xMid} y2={cy2} stroke={LINE_C} strokeWidth={LINE_W} />}
                  <line x1={xMid} y1={cy1} x2={xMid} y2={cy2} stroke={LINE_C} strokeWidth={LINE_W} />
                  <line x1={xMid} y1={cyN} x2={x2} y2={cyN} stroke={LINE_C} strokeWidth={LINE_W} />
                </g>
              )
            })
          })}
          {(() => {
            const lr = numRounds - 1
            const fx = lr * (MATCH_W + CONN_W) + MATCH_W
            const fy = matchCY(lr, 0)
            const ty = totalH / 2
            const xEnd = totalW - TROPHY_W / 2 - 4
            return (
              <g>
                <line x1={fx} y1={fy} x2={fx + CONN_W * 0.45} y2={fy} stroke={LINE_C} strokeWidth={LINE_W} />
                {Math.abs(fy - ty) > 3 && <line x1={fx + CONN_W * 0.45} y1={fy} x2={fx + CONN_W * 0.45} y2={ty} stroke={LINE_C} strokeWidth={LINE_W} />}
                <line x1={fx + CONN_W * 0.45} y1={ty} x2={xEnd - TROPHY_W * 0.3} y2={ty} stroke={LINE_C} strokeWidth={LINE_W} />
              </g>
            )
          })()}
        </svg>

        {rounds.map((round, ri) =>
          round.matches.map((match, mi) => {
            const isMyM  = match.player1?.userId === myUserId || match.player2?.userId === myUserId
            const isLive = match.status === 'in-progress'
            const isDone = match.status === 'finished' || !!match.winner
            const bColor = isLive ? '#67E8F9' : isMyM ? 'rgba(103,232,249,0.38)' : isDone ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)'
            const canOpenMatch = isLive && typeof onMatchClick === 'function'
            return (
              <div
                key={`m-${ri}-${mi}`}
                onClick={canOpenMatch ? () => onMatchClick(match) : undefined}
                title={canOpenMatch ? 'Pantau match real-time' : undefined}
                style={{ position: 'absolute', left: ri * (MATCH_W + CONN_W), top: matchTop(ri, mi) + LABEL_H, width: MATCH_W, background: isDone ? '#0d1320' : '#141927', border: `1.5px solid ${bColor}`, borderRadius: 8, overflow: 'hidden', boxShadow: isLive ? '0 0 16px rgba(103,232,249,0.18)' : 'none', cursor: canOpenMatch ? 'pointer' : 'default' }}
              >
                <PlayerSlot player={match.player1} match={match} />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <PlayerSlot player={match.player2} match={match} />
                {isLive && <div style={{ position: 'absolute', top: 2, right: 5, fontSize: 8, color: '#67E8F9', fontWeight: 900, letterSpacing: 0.5 }}>{canOpenMatch ? '👁 LIVE' : 'LIVE'}</div>}
              </div>
            )
          })
        )}

        <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: TROPHY_W, textAlign: 'center', fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.45))' }}>🏆</div>
      </div>
    </div>
  )
}

// ── Lobby Screen (siswa menunggu guru mulai) ─────────────────────────────────
function LobbyWaitScreen({ tournament, myUserId, myName, onJoinLobby, hasJoined, goBack }) {
  const total    = tournament?.students?.length ?? tournament?.lobby?.length ?? 0
  const joined   = tournament?.lobby?.length ?? 0
  const myInLobby = tournament?.lobby?.some(l => String(l.userId) === String(myUserId))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#080f1c 0%,#0a1422 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.18)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1 }}>🏆 LOBBY TURNAMEN</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
          {tournament?.gameKey ? `Game siap` : 'Menunggu…'}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>Guru akan memulai pertandingan segera</div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status kamu */}
        <div style={{ background: myInLobby ? 'rgba(16,185,129,0.08)' : 'rgba(103,232,249,0.05)', border: `1.5px solid ${myInLobby ? 'rgba(16,185,129,0.3)' : 'rgba(103,232,249,0.25)'}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: myInLobby ? 'linear-gradient(135deg,#064e3b,#047857)' : 'linear-gradient(135deg,#0e7490,#0284c7)', border: `2px solid ${myInLobby ? '#10b981' : '#67E8F9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {myInLobby ? '✅' : '🐸'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{myName}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, color: myInLobby ? '#10b981' : '#67E8F9' }}>
                {myInLobby ? 'Sudah masuk lobby ✓' : 'Belum masuk lobby'}
              </div>
            </div>
          </div>
          {!myInLobby && (
            <button onClick={onJoinLobby} style={{ marginTop: 12, width: '100%', background: '#0e7490', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              Masuk Lobby
            </button>
          )}
        </div>

        {/* Peserta yang sudah join */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }}>PESERTA DI LOBBY</div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 800 }}>{joined} / {total > 0 ? total : '?'}</div>
          </div>
          {tournament?.lobby?.length === 0 ? (
            <div style={{ fontSize: 12, color: '#2d3d52', textAlign: 'center', padding: '8px 0' }}>Belum ada yang masuk lobby…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tournament?.lobby?.map((member, i) => (
                <div key={member.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: String(member.userId) === String(myUserId) ? 800 : 500, color: String(member.userId) === String(myUserId) ? '#67E8F9' : '#fff' }}>
                    {member.name}{String(member.userId) === String(myUserId) ? ' (Kamu)' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Animasi menunggu */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
          <div style={{ fontSize: 12, color: '#2d3d52' }}>Menunggu guru memulai turnamen…</div>
        </div>

        <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px', color: '#2d3d52', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Keluar
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}

// ── Main screen ─────────────────────────────────────────────────────────────
const GAME_LABELS = {
  katak:'🐸 Katak Pelompat', termometer:'🌡️ Termometer', pabrikrobot:'🤖 Pabrik Robot',
  gembok:'⚙️ Gembok Roda Gigi', mercusuar:'🏮 Mercusuar', sporajamur:'🍄 Spora Jamur',
  scanner:'💎 Scanner Permata', g8selramuan:'🧪 Penggandaan Sel Ramuan',
  g8racunminiatur:'☠️ Ekstraksi Racun Miniatur', g8kristal:'💎 Pemisahan Elemen Kristal',
  g8fusienergi:'⚗️ Fusi Energi Alkemis', g8mantraakar:'✨ Penyederhanaan Mantra Akar',
  g8geolog:'⛏️ Ekspedisi Geolog Kerajaan', g8trebuchet:'⚔️ Bidikan Tepat Trebuchet',
  g8perisai:'🛡️ Restorasi Perisai Kerajaan', g8hartakarun:'💰 Harta Karun di Sudut Ruangan',
  g8inspeksisudut:'🗼 Inspeksi Sudut Menara', g8petaradar:'📡 Peta Radar Pengintai',
  g8taligantung:'🪢 Misi Penyelamatan Tali Gantung',
}

export default function TournamentWaitScreen({ tournamentId, myUserId, myName, goBack }) {
  const [tournament,   setTournament]   = useState(null)
  const [rewardToast,  setRewardToast]  = useState(null)
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false)
  const { syncCoins } = usePlayer() || {}

  useEffect(() => {
    const socket = connectSocket()

    const handleState = state => {
      if (state?.id === tournamentId) setTournament(state)
    }
    const handleRoundStart = ({ state }) => {
      if (state?.id === tournamentId) setTournament(state)
    }
    const handleFinished = ({ state }) => {
      if (state?.id === tournamentId) setTournament(state)
    }
    const handleLobbyState = ({ tournamentId: tid, lobby }) => {
      if (tid === tournamentId) {
        setTournament(prev => prev ? { ...prev, lobby } : prev)
        if (lobby?.some(l => String(l.userId) === String(myUserId))) {
          setHasJoinedLobby(true)
        }
      }
    }
    const handleReward = ({ amount, rank, newCoins }) => {
      setRewardToast({ amount, rank })
      if (newCoins != null && syncCoins) syncCoins(newCoins)
      setTimeout(() => setRewardToast(null), 5000)
    }

    socket.on('tournament:state', handleState)
    socket.on('tournament:round-start', handleRoundStart)
    socket.on('tournament:finished', handleFinished)
    socket.on('tournament:lobby-state', handleLobbyState)
    socket.on('tournament:reward', handleReward)

    // Join the bracket room only after listeners are ready; otherwise the
    // initial tournament:state event can be lost on fast connections.
    const joinTournamentRoom = () => socket.emit('tournament:spectate', { tournamentId })
    socket.on('connect', joinTournamentRoom)
    if (socket.connected) joinTournamentRoom()

    return () => {
      socket.off('connect', joinTournamentRoom)
      socket.off('tournament:state', handleState)
      socket.off('tournament:round-start', handleRoundStart)
      socket.off('tournament:finished', handleFinished)
      socket.off('tournament:lobby-state', handleLobbyState)
      socket.off('tournament:reward', handleReward)
    }
  }, [tournamentId])

  const handleJoinLobby = () => {
    const socket = connectSocket()
    socket.emit('tournament:join-lobby', { tournamentId })
    setHasJoinedLobby(true)
  }

  // ── Lobby phase ─────────────────────────────────────────────────────────
  if (!tournament || tournament.lobbyOpen) {
    return (
      <LobbyWaitScreen
        tournament={tournament}
        myUserId={myUserId}
        myName={myName}
        onJoinLobby={handleJoinLobby}
        hasJoined={hasJoinedLobby}
        goBack={goBack}
      />
    )
  }

  // ── My status in this round ─────────────────────────────────────────────
  const myMatchInCurrentRound = (() => {
    const round = tournament.rounds?.[tournament.currentRound - 1]
    return round?.matches?.find(
      m => m.player1?.userId === myUserId || m.player2?.userId === myUserId
    ) || null
  })()

  const myStatus = (() => {
    if (!myMatchInCurrentRound) return { text: 'Menunggu ronde berikutnya…', color: '#94A3B8' }
    const { winner } = myMatchInCurrentRound
    if (winner) {
      if (winner.userId === myUserId) return { text: '✅ Lolos ke ronde berikutnya!', color: '#10b981' }
      return { text: '😤 Kamu kalah — tetap semangat!', color: '#f87171' }
    }
    if (myMatchInCurrentRound.status === 'in-progress')  return { text: '⚡ Sedang bertanding', color: '#f59e0b' }
    if (myMatchInCurrentRound.status === 'waiting-join') return { text: '⏳ Menunggu kamu bergabung…', color: '#67E8F9' }
    if (myMatchInCurrentRound.status === 'waiting-juru') return { text: '🧑‍⚖️ Memilih juru jawab…', color: '#a78bfa' }
    if (myMatchInCurrentRound.status === 'bye')          return { text: '🟢 BYE — Kamu langsung lolos!', color: '#34D399' }
    return { text: 'Menunggu ronde berikutnya…', color: '#94A3B8' }
  })()

  // ── Podium (tournament finished) ───────────────────────────────────────
  if (tournament?.status === 'finished' && tournament?.champion) {
    const champion    = tournament.champion
    const runnerUp    = tournament.runnerUp
    const semis       = tournament.semifinalists || []
    const iAmChampion = champion.userId === myUserId
    const iAmRunnerUp = runnerUp?.userId === myUserId
    const iAmSemi     = semis.some(s => s.userId === myUserId)
    const myResult    = iAmChampion ? '🏆 Kamu Juara!'
                      : iAmRunnerUp ? '🥈 Runner-up!'
                      : iAmSemi     ? '🥉 Peringkat 3!'
                      : '🎉 Turnamen Selesai!'
    const myResultColor = iAmChampion ? '#fbbf24' : iAmRunnerUp ? '#94A3B8' : iAmSemi ? '#cd7c3a' : '#67E8F9'

    const PodiumCard = ({ rank, player, highlight, emoji, accentColor, height }) => player ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${accentColor}33,${accentColor}11)`, border: `2.5px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: highlight ? `0 0 20px ${accentColor}55` : 'none' }}>{emoji}</div>
        <div style={{ textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: accentColor }}>{player.teamName || player.name}</div>
          {player.teamName && <div style={{ fontSize: 9, color: '#475569', fontStyle: 'italic', marginTop: 2 }}>({player.name})</div>}
        </div>
        <div style={{ background: accentColor, color: '#000', borderRadius: 8, padding: '8px 0', width: '100%', textAlign: 'center', fontSize: 18, fontWeight: 900, height, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>{rank}</div>
      </div>
    ) : null

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: 'system-ui,sans-serif', color: '#fff', padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 2 }}>🏆 TURNAMEN SELESAI</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: myResultColor }}>{myResult}</div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>PODIUM</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center' }}>
            <PodiumCard rank="🥈" player={runnerUp}       highlight={iAmRunnerUp} emoji="🥈" accentColor="#94A3B8" height={60} />
            <PodiumCard rank="🥇" player={champion}       highlight={iAmChampion} emoji="👑" accentColor="#fbbf24" height={80} />
            <PodiumCard rank="🥉" player={semis[0]||null} highlight={iAmSemi}     emoji="🥉" accentColor="#cd7c3a" height={50} />
          </div>
          {semis.length > 1 && <div style={{ marginTop: 12, fontSize: 11, color: '#64748B' }}>🥉 {semis.map(s => s.name).join(' & ')} — Peringkat 3</div>}
        </div>
        <button onClick={goBack} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '14px 40px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>← Kembali</button>
      </div>
    )
  }

  // ── Active tournament view ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#080f1c 0%,#0a1422 100%)', fontFamily: 'system-ui,sans-serif', color: '#fff' }}>
      {rewardToast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none', background: 'linear-gradient(135deg,#1a2a1a,#0d1f0d)', border: `1.5px solid ${RANK_COLOR[rewardToast.rank]}`, borderRadius: 20, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${RANK_COLOR[rewardToast.rank]}44`, animation: 'rewardSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 32 }}>🪙</div>
          <div>
            <div style={{ fontSize: 11, color: RANK_COLOR[rewardToast.rank], fontWeight: 800, letterSpacing: 1 }}>{RANK_LABEL[rewardToast.rank]}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', marginTop: 2 }}>+{rewardToast.amount} Koin</div>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.18)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
          🏆 TURNAMEN AKTIF{tournament ? ` • ${GAME_LABELS[tournament.gameKey] || tournament.gameKey}` : ''}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {tournament ? (tournament.rounds?.[tournament.currentRound - 1]?.label || `Ronde ${tournament.currentRound}`) : 'Memuat…'}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>Babak berikutnya mulai otomatis setelah semua match selesai</div>
      </div>

      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(103,232,249,0.05)', border: '1.5px solid rgba(103,232,249,0.25)', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#67E8F9', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>STATUS KAMU</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🐸</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {myName}{' '}
                <span style={{ fontSize: 10, color: '#67E8F9', background: 'rgba(103,232,249,0.12)', padding: '2px 8px', borderRadius: 20 }}>KAMU</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, color: myStatus.color }}>{myStatus.text}</div>
            </div>
          </div>
        </div>

        {tournament ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 12px' }}>
            <div style={{ fontSize: 10, color: '#2d3d52', fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Bracket Turnamen</div>
            <ClassicBracket rounds={tournament.rounds} myUserId={myUserId} currentRound={tournament.currentRound} mode={tournament.mode} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <div style={{ fontSize: 12, color: '#2d3d52' }}>Memuat bracket…</div>
          </div>
        )}

        {tournament && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <div style={{ fontSize: 11, color: '#2d3d52' }}>Menunggu semua match selesai…</div>
          </div>
        )}

        <button onClick={goBack} style={{ marginTop: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px', color: '#2d3d52', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Keluar Turnamen
        </button>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes rewardSlideIn{from{opacity:0;transform:translateX(-50%) translateY(-16px) scale(0.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
      `}</style>
    </div>
  )
}
