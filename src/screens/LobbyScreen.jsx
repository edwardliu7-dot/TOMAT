import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TopBar, Card, Btn } from '../components/shared'
import { useAuth } from '../AuthContext'
import { connectSocket } from '../socket'
import { getGameInfo } from '../gamesCatalog'

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

// Games available for duel (shown in the selector grid)
const DUEL_GAMES = [
  // ── Kelas 7 BAB I ──────────────────────────────────────────────────────────
  { key: 'katak',            emoji: '🐸', name: 'Katak Pelompat',            group: 'Kelas 7' },
  { key: 'termometer',       emoji: '🌡️', name: 'Termometer',                group: 'Kelas 7' },
  { key: 'pabrikrobot',      emoji: '🤖', name: 'Pabrik Robot',              group: 'Kelas 7' },
  { key: 'gembok',           emoji: '⚙️', name: 'Gembok FPB',                group: 'Kelas 7' },
  { key: 'mercusuar',        emoji: '🏮', name: 'Mercusuar KPK',             group: 'Kelas 7' },
  { key: 'scanner',          emoji: '💎', name: 'Scanner Prima',             group: 'Kelas 7' },
  // ── Kelas 8 BAB I — Bilangan Berpangkat ────────────────────────────────────
  { key: 'g8selramuan',      emoji: '🧪', name: 'Sel Ramuan',                group: 'Kelas 8 — Bab I' },
  { key: 'g8racunminiatur',  emoji: '☠️', name: 'Racun Miniatur',            group: 'Kelas 8 — Bab I' },
  { key: 'g8kristal',        emoji: '💎', name: 'Kristal',                   group: 'Kelas 8 — Bab I' },
  { key: 'g8fusienergi',     emoji: '⚗️', name: 'Fusi Energi',              group: 'Kelas 8 — Bab I' },
  { key: 'g8mantraakar',     emoji: '✨', name: 'Mantra Akar',               group: 'Kelas 8 — Bab I' },
  { key: 'g8geolog',         emoji: '⛏️', name: 'Ekspedisi Geolog',          group: 'Kelas 8 — Bab I' },
  // ── Kelas 8 BAB II — Teorema Pythagoras ────────────────────────────────────
  { key: 'g8trebuchet',      emoji: '⚔️', name: 'Trebuchet',                 group: 'Kelas 8 — Bab II' },
  { key: 'g8perisai',        emoji: '🛡️', name: 'Perisai Kerajaan',          group: 'Kelas 8 — Bab II' },
  { key: 'g8hartakarun',     emoji: '💰', name: 'Harta Karun',               group: 'Kelas 8 — Bab II' },
  { key: 'g8inspeksisudut',  emoji: '🗼', name: 'Inspeksi Sudut',            group: 'Kelas 8 — Bab II' },
  { key: 'g8petaradar',      emoji: '📡', name: 'Peta Radar',                group: 'Kelas 8 — Bab II' },
  { key: 'g8taligantung',    emoji: '🪢', name: 'Tali Gantung',              group: 'Kelas 8 — Bab II' },
]

// ─── Avatar bubble ────────────────────────────────────────────────────────────
function PlayerBubble({ player, isMe, pending = false }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: isMe ? 'linear-gradient(135deg,#0e7490,#0284c7)' : 'linear-gradient(135deg,#b45309,#d97706)',
        border: `3px solid ${isMe ? '#67E8F9' : '#fbbf24'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, margin: '0 auto 8px',
        opacity: pending ? 0.4 : 1,
        animation: pending ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}>
        {pending ? '?' : (player?.avatar ? '🖼️' : '🐸')}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: pending ? '#4B5563' : '#fff' }}>
        {pending ? 'Menunggu…' : player?.name}
      </div>
      {isMe && <div style={{ fontSize: 10, color: '#67E8F9', marginTop: 3, fontWeight: 600 }}>KAMU</div>}
    </div>
  )
}

// ─── Code digit display ───────────────────────────────────────────────────────
function RoomCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>KODE RUANGAN</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
        {code.split('').map((ch, i) => (
          <div key={i} style={{
            width: 38, height: 48, borderRadius: 10,
            background: 'rgba(103,232,249,0.1)', border: '2px solid rgba(103,232,249,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#67E8F9', letterSpacing: 0,
          }}>{ch}</div>
        ))}
      </div>
      <button onClick={copy} style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(103,232,249,0.08)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(103,232,249,0.25)'}`,
        color: copied ? '#10b981' : '#67E8F9',
        borderRadius: 20, padding: '6px 18px', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        {copied ? '✅ Tersalin!' : '📋 Salin Kode'}
      </button>
    </div>
  )
}

// ─── Main Lobby Screen ────────────────────────────────────────────────────────
export default function LobbyScreen({ goBack, onStart, initialCode, gameKey = 'katak' }) {
  const { user } = useAuth()
  const isMd = useIsMd()

  const [selectedGameKey, setSelectedGameKey] = useState(gameKey)
  const gameInfo = getGameInfo(selectedGameKey)

  const [phase, setPhase]         = useState('menu')       // menu | creating | waiting | joining | ready | countdown
  const [roomCode, setRoomCode]   = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [players, setPlayers]     = useState([])
  const [myIndex, setMyIndex]     = useState(0)
  const [countdown, setCountdown] = useState(null)
  const [error, setError]         = useState(null)

  // Refs so socket event handlers always see fresh values without re-subscribing
  const roomCodeRef = useRef('')
  const myIndexRef  = useRef(0)

  const setCode = (c) => { setRoomCode(c); roomCodeRef.current = c }
  const setIdx  = (i) => { setMyIndex(i);  myIndexRef.current  = i }

  // ── Auto-join if invited directly ─────────────────────────────────────────
  useEffect(() => {
    if (!initialCode) return
    const t = setTimeout(() => {
      connectSocket().emit('duel:join', { code: initialCode, avatar: user?.photoUrl ?? user?.photo_url ?? null })
    }, 300)
    return () => clearTimeout(t)
  }, [initialCode])

  // ── Socket setup (mounted once) ────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()

    socket.on('duel:created', ({ code, player }) => {
      setCode(code)
      setPlayers([player])
      setIdx(0)
      setPhase('waiting')
      setError(null)
    })

    socket.on('duel:joined', ({ code, players, myIndex }) => {
      setCode(code)
      setPlayers(players)
      setIdx(myIndex)
      setPhase('ready')
      setError(null)
    })

    socket.on('duel:opponent-joined', ({ player }) => {
      setPlayers(prev => {
        const updated = [...prev]
        updated[1] = player
        return updated
      })
      setPhase('ready')
    })

    socket.on('duel:player-left', ({ name }) => {
      setError(`${name} meninggalkan ruangan.`)
      setPlayers(prev => prev.slice(0, 1))
      setPhase('waiting')
      setCountdown(null)
    })

    socket.on('duel:countdown', ({ count }) => {
      setPhase('countdown')
      setCountdown(count)
    })

    // Game starts — hand off to DuelKatakScreen via onStart callback
    socket.on('duel:question', ({ question, round, maxRounds, scores, gameKey: gk }) => {
      onStart({
        code:    roomCodeRef.current,
        myIndex: myIndexRef.current,
        question, round, maxRounds, scores,
        gameKey: gk || gameKey,
      })
    })

    socket.on('duel:error', ({ message }) => {
      setError(message)
    })

    socket.on('connect_error', () => {
      setError('Tidak dapat terhubung ke server. Coba refresh halaman.')
    })

    return () => {
      socket.off('duel:created')
      socket.off('duel:joined')
      socket.off('duel:opponent-joined')
      socket.off('duel:player-left')
      socket.off('duel:countdown')
      socket.off('duel:question')
      socket.off('duel:error')
      socket.off('connect_error')
    }
  }, [onStart])

  // ── Actions ────────────────────────────────────────────────────────────────
  const createRoom = useCallback(() => {
    setError(null)
    connectSocket().emit('duel:create', { avatar: user?.photoUrl ?? user?.photo_url ?? null, gameKey: selectedGameKey })
  }, [user, selectedGameKey])

  const joinRoom = useCallback(() => {
    const trimmed = codeInput.trim().toUpperCase()
    if (!trimmed) { setError('Masukkan kode ruangan dulu.'); return }
    setError(null)
    connectSocket().emit('duel:join', { code: trimmed, avatar: user?.photoUrl ?? user?.photo_url ?? null })
  }, [codeInput, user])

  const startGame = useCallback(() => {
    setError(null)
    connectSocket().emit('duel:start-game', { code: roomCodeRef.current })
  }, [])

  const handleBack = useCallback(() => {
    connectSocket().emit('duel:leave')
    goBack()
  }, [goBack])

  // ── Render ─────────────────────────────────────────────────────────────────

  // Countdown overlay
  if (phase === 'countdown') {
    const me  = players[myIndex]
    const opp = players[myIndex === 0 ? 1 : 0]
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        {/* Player name banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, width: '100%', maxWidth: 360 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>KAMU</div>
            <div style={{
              background: 'rgba(103,232,249,0.1)', border: '2px solid rgba(103,232,249,0.4)',
              borderRadius: 14, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {me?.name || user?.nama || 'Kamu'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', flexShrink: 0 }}>VS</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>LAWAN</div>
            <div style={{
              background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.4)',
              borderRadius: 14, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {opp?.name || '???'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, fontWeight: 700, letterSpacing: 2 }}>DUEL DIMULAI DALAM</div>
        <div style={{
          fontSize: 120, fontWeight: 900, color: '#67E8F9', lineHeight: 1,
          textShadow: '0 0 60px rgba(103,232,249,0.6)',
          animation: 'countdownPop 0.4s cubic-bezier(.36,.07,.19,.97)',
        }} key={countdown}>{countdown}</div>
        <div style={{ marginTop: 32, fontSize: 16, color: '#475569' }}>⚔️ Siapkan dirimu!</div>
        <style>{`@keyframes countdownPop{0%{transform:scale(1.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)' }}>
      <TopBar title="⚔️ Mode Duel" onBack={handleBack} />

      <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: isMd ? 900 : 480, margin: '0 auto' }}>

        {/* ── MENU ── */}
        {phase === 'menu' && (
          <>
            {/* Game selector — grouped by bab */}
            <div style={{ padding: '16px 0 4px' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>PILIH GAME DUEL</div>
              {(() => {
                // Build ordered group list preserving insertion order
                const groups = []
                const seen = {}
                DUEL_GAMES.forEach(g => {
                  if (!seen[g.group]) { seen[g.group] = true; groups.push(g.group) }
                })
                return groups.map(grp => {
                  const games = DUEL_GAMES.filter(g => g.group === grp)
                  return (
                    <div key={grp} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, color: '#475569', fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 8 }}>{grp}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {games.map(g => {
                          const active = selectedGameKey === g.key
                          return (
                            <button key={g.key} onClick={() => setSelectedGameKey(g.key)} style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                              width: 70, padding: '9px 4px',
                              background: active ? 'rgba(103,232,249,0.10)' : 'rgba(255,255,255,0.03)',
                              border: `2px solid ${active ? 'rgba(103,232,249,0.65)' : 'rgba(255,255,255,0.07)'}`,
                              borderRadius: 13, cursor: 'pointer', fontFamily: 'inherit',
                              boxShadow: active ? '0 0 14px rgba(103,232,249,0.2)' : 'none',
                              transition: 'all 0.15s',
                            }}>
                              <span style={{ fontSize: 24 }}>{g.emoji}</span>
                              <span style={{ fontSize: 8, fontWeight: 700, color: active ? '#67E8F9' : '#475569', textAlign: 'center', lineHeight: 1.3 }}>{g.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Buat Ruangan + Masuk — side by side on desktop */}
            <div style={isMd ? { display: 'flex', gap: 16 } : {}}>
              {/* Buat Ruangan card */}
              <div style={{
                background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)',
                borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                position: 'relative', overflow: 'hidden', flex: isMd ? 1 : undefined,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Buat Ruangan</div>
                <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>Bagikan kode ke temanmu</div>
                <button onClick={createRoom} style={{
                  background: '#0891b2', color: '#fff', border: 'none', borderRadius: 14,
                  padding: '16px', width: '100%', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Buat Ruangan →
                </button>
              </div>

              {/* Masuk dengan kode card */}
              <div style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                flex: isMd ? 1 : undefined,
                marginTop: isMd ? 0 : 0,
              }}>
                <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700, marginBottom: 12 }}>Masuk dengan Kode</div>
                <input
                  value={codeInput}
                  onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(null) }}
                  onKeyDown={e => e.key === 'Enter' && joinRoom()}
                  maxLength={6}
                  placeholder="A B C D 1 2"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 12, padding: 16, color: '#f59e0b', fontSize: 24,
                    fontWeight: 800, letterSpacing: 4, outline: 'none', textTransform: 'uppercase',
                    textAlign: 'center', marginBottom: 20, fontFamily: 'inherit',
                  }}
                />
                <button onClick={joinRoom} style={{
                  width: '100%', background: '#b45309', color: '#fff', border: 'none', borderRadius: 14,
                  padding: '16px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Bergabung →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── WAITING (host, waiting for opponent) ── */}
        {phase === 'waiting' && (
          <>
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>RUANGAN DIBUAT</div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>Bagikan kode ini ke lawanmu:</div>
            </div>

            <Card border="rgba(103,232,249,0.3)">
              <RoomCodeDisplay code={roomCode} />
            </Card>

            <Card border="rgba(255,255,255,0.08)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PlayerBubble player={players[0]} isMe />
                <div style={{ flex: 1, textAlign: 'center', fontSize: 24, color: '#334155' }}>VS</div>
                <PlayerBubble pending />
              </div>
            </Card>

            <div style={{
              textAlign: 'center', color: '#94A3B8', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#0e7490', animation: 'ping 1s ease-in-out infinite' }} />
              Menunggu lawan bergabung…
              <style>{`@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
            </div>
          </>
        )}

        {/* ── READY (both players in room) ── */}
        {phase === 'ready' && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>Ruangan penuh! Siap duel?</div>
            </div>

            <Card border="rgba(103,232,249,0.25)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PlayerBubble player={players[myIndex === 0 ? 0 : 1]} isMe />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>VS</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{roomCode}</div>
                </div>
                <PlayerBubble player={players[myIndex === 0 ? 1 : 0]} />
              </div>
            </Card>

            {myIndex === 0 ? (
              <Btn onClick={startGame} color="#059669">
                🚀 Mulai Duel!
              </Btn>
            ) : (
              <div style={{
                textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '12px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#059669', animation: 'ping 1s ease-in-out infinite' }} />
                Menunggu host memulai…
              </div>
            )}
          </>
        )}

        {/* ── JOINING (enter code phase — now handled inline in menu) ── */}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 13, fontWeight: 600,
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

      </div>
    </div>
  )
}
