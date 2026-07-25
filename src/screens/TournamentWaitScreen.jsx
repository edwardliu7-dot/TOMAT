import React, { useEffect, useState } from 'react'
import { connectSocket } from '../socket'

const STATUS_BADGE = {
  finished:      { bg: 'rgba(16,185,129,0.15)',   color: '#10b981', label: '✅ Selesai' },
  'in-progress': { bg: 'rgba(245,158,11,0.15)',   color: '#f59e0b', label: '⚡ Berlangsung' },
  'waiting-join':{ bg: 'rgba(103,232,249,0.12)',  color: '#67E8F9', label: '⏳ Segera Mulai' },
  walkover:      { bg: 'rgba(239,68,68,0.12)',    color: '#f87171', label: '⏩ Walkover' },
  bye:           { bg: 'rgba(52,211,153,0.12)',   color: '#34D399', label: '🟢 BYE' },
  pending:       { bg: 'rgba(255,255,255,0.06)',  color: '#475569', label: '🔒 Menunggu' },
}

export default function TournamentWaitScreen({ tournamentId, myUserId, myName, goBack }) {
  const [tournament, setTournament] = useState(null)

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

    return () => {
      socket.off('tournament:state')
      socket.off('tournament:round-start')
      socket.off('tournament:finished')
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

  // Juara
  if (tournament?.status === 'finished' && tournament?.champion) {
    const iAmChampion = tournament.champion.userId === myUserId
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, fontFamily: 'system-ui, sans-serif', color: '#fff', padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 72 }}>{iAmChampion ? '🏆' : '🎉'}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>
          {iAmChampion ? 'Kamu Juara Turnamen!' : 'Turnamen Selesai!'}
        </div>
        <div style={{ fontSize: 16, color: '#94A3B8' }}>
          {iAmChampion ? 'Selamat! Kamu memenangkan turnamen!' : `Juara: ${tournament.champion.name}`}
        </div>
        <button onClick={goBack} style={{ marginTop: 16, background: '#0e7490', border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Kembali
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
          🏆 TURNAMEN AKTIF{tournament ? ` • ${GAME_LABELS[tournament.gameKey] || tournament.gameKey}` : ''}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {tournament ? `Ronde ${tournament.currentRound}` : 'Memuat…'}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
          Ronde berikutnya mulai otomatis setelah semua match selesai
        </div>
      </div>

      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        {/* Bracket */}
        {tournament?.rounds?.map((round, ri) => (
          <div key={ri}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              RONDE {ri + 1}{ri + 1 === tournament.currentRound ? ' (SEKARANG)' : ''}
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

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
