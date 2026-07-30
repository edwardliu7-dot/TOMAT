import React, { useEffect, useState } from 'react'
import { connectSocket } from '../socket'
import { usePlayer } from '../PlayerContext'

function useIsDesktop() {
  const [desk, setDesk] = React.useState(() => window.innerWidth >= 1024)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesk(mq.matches)
    const h = e => setDesk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desk
}

function useIsMd() {
  const [md, setMd] = React.useState(() => window.innerWidth >= 768)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setMd(mq.matches)
    const h = e => setMd(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return md
}

const STATUS_BADGE = {
  finished:      { bg: 'rgba(16,185,129,0.15)',   color: '#10b981', label: '✅ Selesai' },
  'in-progress': { bg: 'rgba(245,158,11,0.15)',   color: '#f59e0b', label: '⚡ Berlangsung' },
  'waiting-join':{ bg: 'rgba(103,232,249,0.12)',  color: '#67E8F9', label: '⏳ Segera Mulai' },
  walkover:      { bg: 'rgba(239,68,68,0.12)',    color: '#f87171', label: '⏩ Walkover' },
  bye:           { bg: 'rgba(52,211,153,0.12)',   color: '#34D399', label: '🟢 BYE' },
  pending:       { bg: 'rgba(255,255,255,0.06)',  color: '#475569', label: '🔒 Menunggu' },
}

const RANK_LABEL = { 1: '🥇 Juara 1', 2: '🥈 Runner-up', 3: '🥉 Peringkat 3' }
const RANK_COLOR = { 1: '#fbbf24', 2: '#94A3B8', 3: '#cd7c3a' }

export default function TournamentWaitScreen({ tournamentId, myUserId, myName, goBack }) {
  const [tournament,   setTournament]   = useState(null)
  const [rewardToast,  setRewardToast]  = useState(null)  // { amount, rank }
  const isDesktop = useIsDesktop()
  const { syncCoins } = usePlayer() || {}

  useEffect(() => {
    const socket = connectSocket()

    // Minta state turnamen saat ini
    socket.emit('tournament:spectate', { tournamentId })

    socket.on('tournament:state', (state) => {
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

  const GAME_LABELS = {
    katak:          '🐸 Katak Pelompat',
    termometer:     '🌡️ Termometer',
    pabrikrobot:    '🤖 Pabrik Robot',
    gembok:         '⚙️ Gembok Roda Gigi',
    mercusuar:      '🏮 Mercusuar',
    sporajamur:     '🍄 Spora Jamur',
    scanner:        '💎 Scanner Permata',
    // Grade 8 BAB I — Bilangan Berpangkat
    g8selramuan:    '🧪 Penggandaan Sel Ramuan',
    g8racunminiatur:'☠️ Ekstraksi Racun Miniatur',
    g8kristal:      '💎 Pemisahan Elemen Kristal',
    g8fusienergi:   '⚗️ Fusi Energi Alkemis',
    g8mantraakar:   '✨ Penyederhanaan Mantra Akar',
    g8geolog:       '⛏️ Ekspedisi Geolog Kerajaan',
  }

  // Cari status saya di turnamen
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
    if (myMatchInCurrentRound.status === 'in-progress') return { text: '⚡ Sedang bertanding', color: '#f59e0b' }
    if (myMatchInCurrentRound.status === 'waiting-join') return { text: '⏳ Menunggu kamu bergabung…', color: '#67E8F9' }
    if (myMatchInCurrentRound.status === 'bye') return { text: '🟢 BYE — Kamu langsung lolos!', color: '#34D399' }
    return { text: 'Menunggu ronde berikutnya…', color: '#94A3B8' }
  })()

  // ── Podium Juara ───────────────────────────────────────────────────────────
  if (tournament?.status === 'finished' && tournament?.champion) {
    const champion     = tournament.champion
    const runnerUp     = tournament.runnerUp
    const semis        = tournament.semifinalists || []
    const iAmChampion  = champion.userId === myUserId
    const iAmRunnerUp  = runnerUp?.userId === myUserId
    const iAmSemi      = semis.some(s => s.userId === myUserId)

    const myResult = iAmChampion ? '🏆 Kamu Juara!' : iAmRunnerUp ? '🥈 Runner-up!' : iAmSemi ? '🥉 Peringkat 3!' : '🎉 Turnamen Selesai!'
    const myResultColor = iAmChampion ? '#fbbf24' : iAmRunnerUp ? '#94A3B8' : iAmSemi ? '#cd7c3a' : '#67E8F9'

    const PodiumCard = ({ rank, player, highlight, emoji, accentColor, height }) => player ? (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
          border: `2.5px solid ${accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: highlight ? `0 0 20px ${accentColor}55` : 'none',
        }}>{emoji}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>{player.name}</div>
        <div style={{
          background: accentColor, color: '#000', borderRadius: 8, padding: '6px 0',
          width: '100%', textAlign: 'center', fontSize: 11, fontWeight: 900,
          height, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          alignItems: 'center', paddingTop: 8,
        }}>
          <div style={{ fontSize: 18 }}>{rank}</div>
        </div>
      </div>
    ) : null

    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 24, fontFamily: 'system-ui, sans-serif', color: '#fff', padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 2 }}>🏆 TURNAMEN SELESAI</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: myResultColor }}>{myResult}</div>

        {/* Podium */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360,
        }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>PODIUM</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center' }}>
            {/* Peringkat 2 */}
            <PodiumCard rank="🥈" player={runnerUp} highlight={iAmRunnerUp} emoji="🥈" accentColor="#94A3B8" height={60} />
            {/* Juara 1 */}
            <PodiumCard rank="🥇" player={champion} highlight={iAmChampion} emoji="👑" accentColor="#fbbf24" height={80} />
            {/* Peringkat 3 */}
            <PodiumCard rank="🥉" player={semis[0] || null} highlight={iAmSemi} emoji="🥉" accentColor="#cd7c3a" height={50} />
          </div>
          {semis.length > 1 && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#64748B' }}>
              🥉 {semis.map(s => s.name).join(' & ')} — Peringkat 3
            </div>
          )}
        </div>

        <button onClick={goBack} style={{ background: '#0e7490', border: 'none', borderRadius: 14, padding: '14px 40px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Kembali
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
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
      <div style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
          🏆 TURNAMEN AKTIF{tournament ? ` • ${GAME_LABELS[tournament.gameKey] || tournament.gameKey}` : ''}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {tournament
            ? (tournament.rounds?.[tournament.currentRound - 1]?.label || `Ronde ${tournament.currentRound}`)
            : 'Memuat…'}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
          Babak berikutnya mulai otomatis setelah semua match selesai
        </div>
      </div>

      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: isDesktop ? 'none' : undefined }}>
        {/* Summary strip on desktop */}
        {isDesktop && tournament && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>🎮 {GAME_LABELS[tournament.gameKey] || tournament.gameKey}</span>
            </div>
            <div style={{ background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12, padding: '10px 16px' }}>
              <span style={{ fontSize: 13, color: '#67E8F9', fontWeight: 700 }}>Ronde {tournament.currentRound} / {tournament.rounds?.length}</span>
            </div>
          </div>
        )}

        {/* My status */}
        <div style={{ background: 'rgba(103,232,249,0.06)', border: '1.5px solid rgba(103,232,249,0.3)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 10 }}>STATUS KAMU</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐸</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{myName} <span style={{ fontSize: 11, color: '#67E8F9', background: 'rgba(103,232,249,0.12)', padding: '2px 8px', borderRadius: 20 }}>KAMU</span></div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, color: myStatus.color }}>{myStatus.text}</div>
            </div>
          </div>
        </div>

        {/* Bracket — horizontal on desktop, vertical on mobile */}
        {isDesktop ? (
          <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 8 }}>
            {tournament?.rounds?.map((round, ri) => (
              <div key={ri} style={{ minWidth: 220, flex: '0 0 auto' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                  {(round.label || `RONDE ${ri + 1}`).toUpperCase()}{ri + 1 === tournament.currentRound ? ' ⚡' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {round.matches.map((m, mi) => {
                    const badge = STATUS_BADGE[m.status] || STATUS_BADGE.pending
                    const isMyMatch = m.player1?.userId === myUserId || m.player2?.userId === myUserId
                    const isLive = m.status === 'in-progress'
                    return (
                      <div key={mi} style={{
                        background: isMyMatch ? 'rgba(103,232,249,0.06)' : '#1A1D27',
                        border: `1.5px solid ${isLive ? '#67E8F9' : isMyMatch ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 14, padding: '12px 14px',
                        boxShadow: isLive ? '0 0 12px rgba(103,232,249,0.15)' : 'none',
                      }}>
                        {isLive && <div style={{ fontSize: 9, color: '#67E8F9', fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>⚡ LIVE</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            {[m.player1, m.player2].map((p, pi) => p ? (
                              <div key={pi}>
                                {pi === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '5px 0' }} />}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: 12, fontWeight: m.winner?.userId === p.userId ? 800 : 600, color: m.winner && m.winner.userId !== p.userId ? '#475569' : p.userId === myUserId ? '#67E8F9' : '#94A3B8' }}>
                                    {p.userId === myUserId ? '🐸 ' : ''}{p.name}
                                  </span>
                                  {m.scores?.[p.userId] !== undefined && (
                                    <span style={{ fontSize: 12, fontWeight: 800, color: pi === 0 ? '#67E8F9' : '#f59e0b' }}>{m.scores[p.userId]}</span>
                                  )}
                                </div>
                              </div>
                            ) : null)}
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            <span style={{ background: badge.bg, color: badge.color, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, display: 'block' }}>{badge.label}</span>
                            {m.winner && <div style={{ fontSize: 9, color: '#10b981', marginTop: 4, fontWeight: 600 }}>🏅 {m.winner.name}</div>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Mobile: vertical stacked rounds */
          <>
            {tournament?.rounds?.map((round, ri) => (
              <div key={ri}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                  {(round.label || `RONDE ${ri + 1}`).toUpperCase()}{ri + 1 === tournament.currentRound ? ' (SEKARANG)' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {round.matches.map((m, mi) => {
                    const badge = STATUS_BADGE[m.status] || STATUS_BADGE.pending
                    const isMyMatch = m.player1?.userId === myUserId || m.player2?.userId === myUserId
                    return (
                      <div key={mi} style={{
                        background: isMyMatch ? 'rgba(103,232,249,0.06)' : '#1A1D27',
                        border: `1.5px solid ${isMyMatch ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 14, padding: '12px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            {[m.player1, m.player2].map((p, pi) => p ? (
                              <div key={pi}>
                                {pi === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '5px 0' }} />}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: 13, fontWeight: m.winner?.userId === p.userId ? 800 : 600, color: m.winner && m.winner.userId !== p.userId ? '#475569' : p.userId === myUserId ? '#67E8F9' : '#94A3B8' }}>
                                    {p.userId === myUserId ? '🐸 ' : ''}{p.name}
                                  </span>
                                  {m.scores?.[p.userId] !== undefined && (
                                    <span style={{ fontSize: 12, fontWeight: 800, color: pi === 0 ? '#67E8F9' : '#f59e0b' }}>{m.scores[p.userId]}</span>
                                  )}
                                </div>
                              </div>
                            ) : null)}
                          </div>
                          <div style={{ flexShrink: 0, textAlign: 'right' }}>
                            <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'block' }}>{badge.label}</span>
                            {m.winner && <div style={{ fontSize: 10, color: '#10b981', marginTop: 4, fontWeight: 600 }}>🏅 {m.winner.name}</div>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Loading */}
        {!tournament && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>Memuat bracket…</div>
          </div>
        )}

        {/* Waiting animation */}
        {tournament && (
          <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>Menunggu semua match selesai…</div>
          </div>
        )}

        <button onClick={goBack} style={{ marginTop: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
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
