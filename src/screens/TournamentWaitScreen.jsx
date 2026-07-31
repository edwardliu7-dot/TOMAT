import React, { useEffect, useState } from 'react'
import { connectSocket } from '../socket'
import { usePlayer } from '../PlayerContext'

const RANK_LABEL = { 1: '🥇 Juara 1', 2: '🥈 Runner-up', 3: '🥉 Peringkat 3' }
const RANK_COLOR = { 1: '#fbbf24', 2: '#94A3B8', 3: '#cd7c3a' }

// ── Classic single-elimination bracket ─────────────────────────────────────
// Renders a horizontal bracket: rounds as columns, match cards connected by
// SVG lines, trophy on the far right — matching the reference layout.
function ClassicBracket({ rounds, myUserId, currentRound }) {
  const PLAYER_H = 30          // height of each player name row
  const MATCH_H  = PLAYER_H * 2 + 1   // two rows + 1 px divider
  const MATCH_W  = 158         // width of each match card
  const V_GAP    = 14          // vertical gap between match slots in round 1
  const CONN_W   = 44          // horizontal space between round columns (for lines)
  const TROPHY_W = 56          // trophy column width
  const LABEL_H  = 22          // height of round-label row above bracket

  if (!rounds || rounds.length === 0) return null

  const baseSlot = MATCH_H + V_GAP          // slot height in round 1
  const slotAt   = r => Math.pow(2, r) * baseSlot
  // Top of match card (relative to bracket area, not including label row)
  const matchTop = (r, m) => { const s = slotAt(r); return m * s + (s - MATCH_H) / 2 }

  const numRounds  = rounds.length
  const firstCount = rounds[0].matches.length
  const bracketH   = Math.max(firstCount * baseSlot, MATCH_H + 20)
  const totalH     = bracketH + LABEL_H
  const totalW     = numRounds * MATCH_W + (numRounds - 1) * CONN_W + CONN_W + TROPHY_W + 8

  // All SVG y-coords use matchCY (adds LABEL_H so lines start below labels)
  const matchCY = (r, m) => matchTop(r, m) + LABEL_H + MATCH_H / 2

  const LINE_C = 'rgba(255,255,255,0.14)'
  const LINE_W = 1.5

  // Individual player name row inside a match card
  function PlayerSlot({ player, match }) {
    const isMe     = player?.userId === myUserId
    const isWinner = match.winner?.userId === player?.userId
    const isLoser  = match.winner && !isWinner && !!player
    const isBye    = !player && match.status === 'bye'
    return (
      <div style={{
        height: PLAYER_H, display: 'flex', alignItems: 'center',
        padding: '0 8px', gap: 4,
        background: isWinner ? 'rgba(16,185,129,0.13)'
                  : isMe     ? 'rgba(103,232,249,0.08)'
                  : 'transparent',
      }}>
        <span style={{
          fontSize: 11, fontWeight: isWinner ? 800 : 600,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: isLoser  ? '#263040'
               : isWinner ? '#34D399'
               : isMe     ? '#67E8F9'
               : '#5a6a80',
        }}>
          {player ? (isMe ? '🐸 ' : '') + player.name
                  : isBye ? 'BYE' : '—'}
        </span>
        {isWinner && (
          <span style={{ fontSize: 9, color: '#34D399', flexShrink: 0 }}>✓</span>
        )}
        {!isWinner && match.scores?.[player?.userId] != null && (
          <span style={{ fontSize: 9, color: '#fbbf24', flexShrink: 0, fontWeight: 700 }}>
            {match.scores[player.userId]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: totalW, height: totalH }}>

        {/* ── Round labels ── */}
        {rounds.map((round, ri) => {
          const isCurrent = (ri + 1) === currentRound
          return (
            <div key={`lbl-${ri}`} style={{
              position: 'absolute',
              left: ri * (MATCH_W + CONN_W), top: 0,
              width: MATCH_W, height: LABEL_H,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
              color: isCurrent ? '#f59e0b' : '#2d3d52',
              textTransform: 'uppercase',
            }}>
              {round.label || `Ronde ${ri + 1}`}{isCurrent ? ' ⚡' : ''}
            </div>
          )
        })}

        {/* ── SVG connector lines (drawn behind match cards) ── */}
        <svg style={{
          position: 'absolute', left: 0, top: 0,
          width: totalW, height: totalH,
          overflow: 'visible', pointerEvents: 'none',
        }}>
          {rounds.slice(0, -1).map((round, ri) => {
            const x1   = ri * (MATCH_W + CONN_W) + MATCH_W
            const x2   = (ri + 1) * (MATCH_W + CONN_W)
            const xMid = (x1 + x2) / 2
            return rounds[ri + 1].matches.map((_, nmi) => {
              const topI = nmi * 2
              const botI = nmi * 2 + 1
              const cy1  = matchCY(ri, topI)
              const cy2  = botI < round.matches.length ? matchCY(ri, botI) : cy1
              const cyN  = matchCY(ri + 1, nmi)
              return (
                <g key={`cn-${ri}-${nmi}`}>
                  {/* top match → mid */}
                  <line x1={x1} y1={cy1} x2={xMid} y2={cy1} stroke={LINE_C} strokeWidth={LINE_W} />
                  {/* bot match → mid */}
                  {botI < round.matches.length && (
                    <line x1={x1} y1={cy2} x2={xMid} y2={cy2} stroke={LINE_C} strokeWidth={LINE_W} />
                  )}
                  {/* vertical join */}
                  <line x1={xMid} y1={cy1} x2={xMid} y2={cy2} stroke={LINE_C} strokeWidth={LINE_W} />
                  {/* mid → next match */}
                  <line x1={xMid} y1={cyN} x2={x2} y2={cyN} stroke={LINE_C} strokeWidth={LINE_W} />
                </g>
              )
            })
          })}
          {/* Final match → trophy */}
          {(() => {
            const lr   = numRounds - 1
            const fx   = lr * (MATCH_W + CONN_W) + MATCH_W
            const fy   = matchCY(lr, 0)
            const ty   = totalH / 2
            const xEnd = totalW - TROPHY_W / 2 - 4
            return (
              <g>
                <line x1={fx} y1={fy} x2={fx + CONN_W * 0.45} y2={fy} stroke={LINE_C} strokeWidth={LINE_W} />
                {Math.abs(fy - ty) > 3 && (
                  <line x1={fx + CONN_W * 0.45} y1={fy} x2={fx + CONN_W * 0.45} y2={ty} stroke={LINE_C} strokeWidth={LINE_W} />
                )}
                <line x1={fx + CONN_W * 0.45} y1={ty} x2={xEnd - TROPHY_W * 0.3} y2={ty} stroke={LINE_C} strokeWidth={LINE_W} />
              </g>
            )
          })()}
        </svg>

        {/* ── Match cards ── */}
        {rounds.map((round, ri) =>
          round.matches.map((match, mi) => {
            const isMyM  = match.player1?.userId === myUserId || match.player2?.userId === myUserId
            const isLive = match.status === 'in-progress'
            const isDone = match.status === 'finished' || !!match.winner
            const bColor = isLive ? '#67E8F9'
                         : isMyM  ? 'rgba(103,232,249,0.38)'
                         : isDone ? 'rgba(255,255,255,0.05)'
                         : 'rgba(255,255,255,0.10)'
            return (
              <div key={`m-${ri}-${mi}`} style={{
                position: 'absolute',
                left: ri * (MATCH_W + CONN_W),
                top:  matchTop(ri, mi) + LABEL_H,
                width: MATCH_W,
                background: isDone ? '#0d1320' : '#141927',
                border: `1.5px solid ${bColor}`,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: isLive ? '0 0 16px rgba(103,232,249,0.18)' : 'none',
              }}>
                <PlayerSlot player={match.player1} match={match} />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <PlayerSlot player={match.player2} match={match} />
                {isLive && (
                  <div style={{
                    position: 'absolute', top: 2, right: 5,
                    fontSize: 8, color: '#67E8F9', fontWeight: 900, letterSpacing: 0.5,
                  }}>LIVE</div>
                )}
              </div>
            )
          })
        )}

        {/* ── Trophy ── */}
        <div style={{
          position: 'absolute', right: 4,
          top: '50%', transform: 'translateY(-50%)',
          width: TROPHY_W, textAlign: 'center',
          fontSize: 36, lineHeight: 1,
          filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.45))',
        }}>
          🏆
        </div>
      </div>
    </div>
  )
}

// ── Main screen ─────────────────────────────────────────────────────────────
const GAME_LABELS = {
  katak:           '🐸 Katak Pelompat',
  termometer:      '🌡️ Termometer',
  pabrikrobot:     '🤖 Pabrik Robot',
  gembok:          '⚙️ Gembok Roda Gigi',
  mercusuar:       '🏮 Mercusuar',
  sporajamur:      '🍄 Spora Jamur',
  scanner:         '💎 Scanner Permata',
  g8selramuan:     '🧪 Penggandaan Sel Ramuan',
  g8racunminiatur: '☠️ Ekstraksi Racun Miniatur',
  g8kristal:       '💎 Pemisahan Elemen Kristal',
  g8fusienergi:    '⚗️ Fusi Energi Alkemis',
  g8mantraakar:    '✨ Penyederhanaan Mantra Akar',
  g8geolog:        '⛏️ Ekspedisi Geolog Kerajaan',
}

export default function TournamentWaitScreen({ tournamentId, myUserId, myName, goBack }) {
  const [tournament, setTournament]  = useState(null)
  const [rewardToast, setRewardToast] = useState(null)
  const { syncCoins } = usePlayer() || {}

  useEffect(() => {
    const socket = connectSocket()
    socket.emit('tournament:spectate', { tournamentId })

    socket.on('tournament:state', state => {
      if (state?.id === tournamentId) setTournament(state)
    })
    socket.on('tournament:round-start', ({ state }) => {
      if (state?.id === tournamentId) setTournament(state)
    })
    socket.on('tournament:finished', ({ state }) => {
      if (state?.id === tournamentId) setTournament(state)
    })
    socket.on('tournament:reward', ({ amount, rank, newCoins }) => {
      setRewardToast({ amount, rank })
      if (newCoins != null && syncCoins) syncCoins(newCoins)
      setTimeout(() => setRewardToast(null), 5000)
    })

    return () => {
      socket.off('tournament:state')
      socket.off('tournament:round-start')
      socket.off('tournament:finished')
      socket.off('tournament:reward')
    }
  }, [tournamentId])

  // ── My status in this round ─────────────────────────────────────────────
  const myMatchInCurrentRound = tournament ? (() => {
    const round = tournament.rounds?.[tournament.currentRound - 1]
    return round?.matches?.find(
      m => m.player1?.userId === myUserId || m.player2?.userId === myUserId
    ) || null
  })() : null

  const myStatus = (() => {
    if (!myMatchInCurrentRound) return { text: 'Menunggu ronde berikutnya…', color: '#94A3B8' }
    const { winner } = myMatchInCurrentRound
    if (winner) {
      if (winner.userId === myUserId) return { text: '✅ Lolos ke ronde berikutnya!', color: '#10b981' }
      return { text: '😤 Kamu kalah — tetap semangat!', color: '#f87171' }
    }
    if (myMatchInCurrentRound.status === 'in-progress')   return { text: '⚡ Sedang bertanding', color: '#f59e0b' }
    if (myMatchInCurrentRound.status === 'waiting-join')  return { text: '⏳ Menunggu kamu bergabung…', color: '#67E8F9' }
    if (myMatchInCurrentRound.status === 'bye')           return { text: '🟢 BYE — Kamu langsung lolos!', color: '#34D399' }
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
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `linear-gradient(135deg,${accentColor}33,${accentColor}11)`,
          border: `2.5px solid ${accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          boxShadow: highlight ? `0 0 20px ${accentColor}55` : 'none',
        }}>{emoji}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>
          {player.name}
        </div>
        <div style={{
          background: accentColor, color: '#000', borderRadius: 8, padding: '8px 0',
          width: '100%', textAlign: 'center', fontSize: 18, fontWeight: 900,
          height, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
        }}>
          {rank}
        </div>
      </div>
    ) : null

    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 24, fontFamily: 'system-ui, sans-serif', color: '#fff',
        padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 2 }}>🏆 TURNAMEN SELESAI</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: myResultColor }}>{myResult}</div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360,
        }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>PODIUM</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center' }}>
            <PodiumCard rank="🥈" player={runnerUp}       highlight={iAmRunnerUp} emoji="🥈" accentColor="#94A3B8" height={60} />
            <PodiumCard rank="🥇" player={champion}       highlight={iAmChampion} emoji="👑" accentColor="#fbbf24" height={80} />
            <PodiumCard rank="🥉" player={semis[0]||null} highlight={iAmSemi}     emoji="🥉" accentColor="#cd7c3a" height={50} />
          </div>
          {semis.length > 1 && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#64748B' }}>
              🥉 {semis.map(s => s.name).join(' & ')} — Peringkat 3
            </div>
          )}
        </div>

        <button onClick={goBack} style={{
          background: '#0e7490', border: 'none', borderRadius: 14,
          padding: '14px 40px', color: '#fff', fontSize: 14, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Kembali
        </button>
      </div>
    )
  }

  // ── Active tournament view ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#080f1c 0%,#0a1422 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Reward toast */}
      {rewardToast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, pointerEvents: 'none',
          background: 'linear-gradient(135deg,#1a2a1a,#0d1f0d)',
          border: `1.5px solid ${RANK_COLOR[rewardToast.rank]}`,
          borderRadius: 20, padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${RANK_COLOR[rewardToast.rank]}44`,
          animation: 'rewardSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 32 }}>🪙</div>
          <div>
            <div style={{ fontSize: 11, color: RANK_COLOR[rewardToast.rank], fontWeight: 800, letterSpacing: 1 }}>
              {RANK_LABEL[rewardToast.rank]}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', marginTop: 2 }}>
              +{rewardToast.amount} Koin
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.18)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
          🏆 TURNAMEN AKTIF{tournament ? ` • ${GAME_LABELS[tournament.gameKey] || tournament.gameKey}` : ''}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {tournament
            ? (tournament.rounds?.[tournament.currentRound - 1]?.label || `Ronde ${tournament.currentRound}`)
            : 'Memuat…'}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
          Babak berikutnya mulai otomatis setelah semua match selesai
        </div>
      </div>

      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* My status strip */}
        <div style={{
          background: 'rgba(103,232,249,0.05)',
          border: '1.5px solid rgba(103,232,249,0.25)',
          borderRadius: 14, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#67E8F9', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>STATUS KAMU</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0e7490,#0284c7)',
              border: '2px solid #67E8F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
            }}>🐸</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {myName}{' '}
                <span style={{ fontSize: 10, color: '#67E8F9', background: 'rgba(103,232,249,0.12)', padding: '2px 8px', borderRadius: 20 }}>KAMU</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, color: myStatus.color }}>{myStatus.text}</div>
            </div>
          </div>
        </div>

        {/* ── Classic bracket visual ── */}
        {tournament ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '16px 12px',
          }}>
            <div style={{ fontSize: 10, color: '#2d3d52', fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
              Bracket Turnamen
            </div>
            <ClassicBracket
              rounds={tournament.rounds}
              myUserId={myUserId}
              currentRound={tournament.currentRound}
            />
          </div>
        ) : (
          /* Loading skeleton */
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#2d3d52' }}>Memuat bracket…</div>
          </div>
        )}

        {/* Waiting pulse */}
        {tournament && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#2d3d52' }}>Menunggu semua match selesai…</div>
          </div>
        )}

        <button onClick={goBack} style={{
          marginTop: 4,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '12px', color: '#2d3d52', fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Keluar Turnamen
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes rewardSlideIn { from { opacity:0; transform:translateX(-50%) translateY(-16px) scale(0.9) } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}
