import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connectSocket, getSocket } from '../socket'
import { useAuth } from '../AuthContext'
import { useTask } from '../TaskContext'
import { getWrongImmunity } from '../petBonuses'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NL_MIN = -20, NL_MAX = 20
function toPercent(n) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

const GAME_LABELS = {
  katak:             '🐸 Katak Pelompat',
  termometer:        '🌡️ Termometer',
  pabrikrobot:       '🤖 Pabrik Robot',
  gembok:            '⚙️ Gembok Roda Gigi',
  mercusuar:         '🏮 Mercusuar',
  sporajamur:        '🍄 Spora Jamur',
  scanner:           '💎 Scanner Permata',
  // Grade 8 BAB I — Bilangan Berpangkat
  g8selramuan:       '🧪 Penggandaan Sel Ramuan',
  g8racunminiatur:   '☠️ Ekstraksi Racun Miniatur',
  g8kristal:         '💎 Pemisahan Elemen Kristal',
  g8fusienergi:      '⚗️ Fusi Energi Alkemis',
  g8mantraakar:      '✨ Penyederhanaan Mantra Akar',
  g8geolog:          '⛏️ Ekspedisi Geolog Kerajaan',
  // Grade 8 BAB II — Teorema Pythagoras
  g8trebuchet:       '⚔️ Bidikan Tepat Trebuchet',
  g8perisai:         '🛡️ Restorasi Perisai Kerajaan',
  g8hartakarun:      '💰 Harta Karun di Sudut Ruangan',
  g8inspeksisudut:   '🗼 Inspeksi Sudut Menara',
  g8petaradar:       '📡 Peta Radar Pengintai',
  g8taligantung:     '🪢 Misi Penyelamatan Tali Gantung',
}

// ─── Number line (katak) ───────────────────────────────────────────────────────
function KatakNumberLine({ start, myPos, oppPos, myAnswered, myCorrect }) {
  return (
    <div style={{ padding: '0 4px' }}>
      <svg width="100%" viewBox="0 0 260 80" style={{ overflow: 'visible', display: 'block' }}>
        <rect x="0" y="50" width="260" height="30" rx="4" fill="rgba(14,116,144,0.12)" />
        {[25,60,95,130,165,200,235].map((x, i) => (
          <ellipse key={i} cx={x} cy="60" rx="13" ry="4" fill="none" stroke="rgba(103,232,249,0.1)" strokeWidth="1" />
        ))}
        {[18,50,80,110,140,170,200,230].map((x, i) => (
          <ellipse key={i} cx={x} cy="52" rx="16" ry="7" fill="#0a1f2e" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
        ))}
        <line x1="15" y1="70" x2="245" y2="70" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
        {[NL_MIN,-10,0,10,NL_MAX].map((n, i) => (
          <text key={i} x={15 + (n - NL_MIN) / (NL_MAX - NL_MIN) * 230} y="78"
            textAnchor="middle" fill="rgba(103,232,249,0.35)" fontSize="7">{n}</text>
        ))}
        {/* Start marker */}
        <rect x={15 + toPercent(start) / 100 * 230 - 1.5} y="48" width="3" height="22"
          fill="#67E8F9" rx="1.5" opacity="0.5" />
        {/* Opponent ghost — last known slider position */}
        {oppPos !== null && (
          <text x={15 + toPercent(oppPos) / 100 * 230} y="43"
            textAnchor="middle" fontSize="16"
            opacity={0.5}
            style={{ filter: 'saturate(0.4)', transition: 'x 0.15s' }}>🔥</text>
        )}
        {/* My frog */}
        <text x={15 + toPercent(myPos) / 100 * 230} y="43"
          textAnchor="middle" fontSize="18"
          style={{ transition: 'x 0.1s' }}>🐸</text>
        {myAnswered && (
          <text x={15 + toPercent(myPos) / 100 * 230} y="30" textAnchor="middle" fontSize="14">
            {myCorrect ? '✅' : '❌'}
          </text>
        )}
      </svg>
    </div>
  )
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ myName, oppName, myScore, oppScore, round, maxRounds }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#1A1D27', borderRadius: 16, padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>KAMU</div>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{myName}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#67E8F9', lineHeight: 1, marginTop: 4 }}>{myScore}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: 1 }}>SOAL</div>
        <div style={{ fontSize: 18, color: '#fff', fontWeight: 800, marginTop: 4 }}>{round}/{maxRounds}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>LAWAN</div>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{oppName}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginTop: 4 }}>{oppScore}</div>
      </div>
    </div>
  )
}

// ─── Leaderboard Wait Screen ──────────────────────────────────────────────────
function LeaderboardWaitScreen({ myScore, myName, oppScore, oppName, round, onLeave, onViewBracket, bracketState }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      fontFamily: 'system-ui, sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <style>{`@keyframes tLbBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}}`}</style>
      <div style={{
        flex: 1, width: '100%', maxWidth: 390, margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, boxSizing: 'border-box', gap: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>🏁</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', textAlign: 'center' }}>
            Kamu Sudah Selesai!
          </div>
          {round && oppName && (
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
              Ronde {round} — vs {oppName}
            </div>
          )}
        </div>

        {/* Score card */}
        <div style={{
          background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px 20px', width: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 28, boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#67E8F9', letterSpacing: 0.5, marginBottom: 4 }}>KAMU</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 12 }}>{myName}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#67E8F9', lineHeight: 1 }}>{myScore}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: 500 }}>soal benar</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b', fontStyle: 'italic', opacity: 0.9 }}>VS</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: 0.5, marginBottom: 4 }}>LAWAN</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 12 }}>{oppName}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{oppScore}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: 500 }}>soal benar</div>
          </div>
        </div>

        {/* Status banner */}
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12, padding: '14px 16px', width: '100%', boxSizing: 'border-box',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⏳ Lawan masih mengerjakan soal</span>
            <span style={{ display: 'flex', gap: 2 }}>
              {['-0.32s','-0.16s','0s'].map((d,i) => (
                <span key={i} style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', animation: `tLbBounce 1.4s ${d} infinite ease-in-out` }} />
              ))}
            </span>
          </div>
        </div>

        {/* Bracket info */}
        <div style={{
          background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '12px 16px', width: '100%', boxSizing: 'border-box',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{ fontSize: 18, lineHeight: 1.2 }}>🏆</div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, fontWeight: 500 }}>
            Hasil ronde ini menentukan lanjutan turnamen. Tetap semangat!
          </div>
        </div>

        {/* Other ongoing matches in this round */}
        {bracketState && (() => {
          const round = bracketState.rounds?.[bracketState.currentRound - 1]
          const others = round?.matches?.filter(m =>
            m.player1?.userId !== myName && m.player2?.userId !== myName &&
            ['in-progress', 'waiting-join', 'finished'].includes(m.status)
          ) || []
          if (!others.length) return null
          return (
            <div style={{
              background: '#1A1D27', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '12px 14px', width: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
                PERTANDINGAN RONDE {bracketState.currentRound}
              </div>
              {others.slice(0, 3).map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#94A3B8' }}>{m.player1?.name || 'BYE'} vs {m.player2?.name || 'BYE'}</span>
                  <span style={{ fontSize: 11, color: m.status === 'finished' ? '#10b981' : m.status === 'in-progress' ? '#f59e0b' : '#475569', fontWeight: 700 }}>
                    {m.status === 'finished' ? '✅' : m.status === 'in-progress' ? '⚡' : '⏳'}
                  </span>
                </div>
              ))}
            </div>
          )
        })()}

        {onViewBracket && (
          <button onClick={onViewBracket} style={{
            background: '#0e7490', border: 'none', borderRadius: 14,
            padding: '14px 24px', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', width: '100%', maxWidth: 300,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          }}>
            🏆 Lihat Bracket Turnamen
          </button>
        )}
        <button onClick={onLeave} style={{
          background: 'transparent', border: 'none', color: '#475569', fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Keluar Turnamen
        </button>
      </div>
    </div>
  )
}

// ─── Match Over Screen ─────────────────────────────────────────────────────────
function MatchOverScreen({ winner, scores, myUserId, myName, oppName, onLeave }) {
  const iWon = winner?.userId === myUserId
  const myScore  = scores[myUserId] ?? 0
  const oppScore = Object.entries(scores).find(([id]) => id !== String(myUserId))?.[1] ?? 0

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 20, fontFamily: 'system-ui, sans-serif', color: '#fff',
    }}>
      <div style={{ fontSize: 72 }}>{iWon ? '🏆' : '😤'}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: iWon ? '#fbbf24' : '#f87171', textAlign: 'center' }}>
        {iWon ? 'Kamu Menang!' : `${winner?.name} Menang!`}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '16px 32px', display: 'flex', gap: 32, alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 4 }}>KAMU</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{myName}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#67E8F9' }}>{myScore}</div>
        </div>
        <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 900 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>LAWAN</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{oppName}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>{oppScore}</div>
        </div>
      </div>
      {iWon && (
        <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
          Menunggu ronde berikutnya…
        </div>
      )}
      <button onClick={onLeave} style={{
        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
        padding: '14px 32px', color: '#94A3B8', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>← Keluar Turnamen</button>
    </div>
  )
}

// ─── Main TournamentMatchScreen ───────────────────────────────────────────────
export default function TournamentMatchScreen({
  tournamentId, matchId, opponent, gameKey, round: initRound,
  myUserId, myName,
  goBack, onMatchOver,
}) {
  const isMd = useIsMd()
  const { user } = useAuth()
  const { activeSession } = useTask()
  const [question,    setQuestion]    = useState(null)
  const [round,       setRound]       = useState(initRound || 1)
  const [maxRounds,   setMaxRounds]   = useState(7)
  const [scores,      setScores]      = useState({})
  const [slider,      setSlider]      = useState(0)
  const [oppSlider,   setOppSlider]   = useState(null)
  const [myAnswered,  setMyAnswered]  = useState(false)
  const [myCorrect,   setMyCorrect]   = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)

  // Nananaga wrong-answer immunity tokens for this tournament match
  const immunityLeft = useRef(
    !activeSession && user?.equippedPetSkin ? getWrongImmunity(user.equippedPetSkin) : 0
  )

  // phase: 'waiting' | 'playing' | 'result' | 'leaderboard' | 'match-over'
  const [phase, setPhase] = useState('waiting')
  const [matchResult, setMatchResult] = useState(null)

  // Leaderboard state (while waiting for opponent to finish)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [bracketState,   setBracketState]   = useState(null)

  // Per-question countdown timer
  const MATCH_TIMER_SECONDS = 30
  const [timeLeft, setTimeLeft] = useState(MATCH_TIMER_SECONDS)
  const timerIntervalRef = useRef(null)

  const sliderThrottle = useRef(null)
  const matchIdRef     = useRef(matchId)
  const tournIdRef     = useRef(tournamentId)

  // ── Emit player-ready on mount ─────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()
    socket.emit('tournament:player-ready', {
      tournamentId: tournIdRef.current,
      matchId:      matchIdRef.current,
    })

    // Soal datang → mulai bermain (sent per-player, async)
    socket.on('tournament:question', ({ question: q, round: r, maxRounds: mr, scores: s }) => {
      setQuestion(q)
      setRound(r)
      setMaxRounds(mr)
      setScores(s || {})
      setSlider(q.question?.start ?? q.start ?? 0)
      setOppSlider(null)
      setMyAnswered(false)
      setMyCorrect(null)
      setCorrectAnswer(null)
      setPhase('playing')
      setTimeLeft(MATCH_TIMER_SECONDS)
    })

    // Hasil jawabanku — brief feedback, soal berikutnya datang otomatis ~1.2s
    socket.on('tournament:answer-result', ({ correct, correctAnswer: ans, yourValue, scores: s }) => {
      // Nananaga immunity: intercept wrong answers when tokens remain and no task session active
      if (!correct && immunityLeft.current > 0 && !activeSession) {
        immunityLeft.current -= 1
        window.dispatchEvent(new CustomEvent('nananaga-shield', {
          detail: { tokensLeft: immunityLeft.current },
        }))
        // Request a bonus question from server without advancing the round
        getSocket()?.emit('tournament:use-immunity', {
          tournamentId: tournIdRef.current,
          matchId:      matchIdRef.current,
        })
        // Update scores but stay in 'playing' phase
        setScores(s || {})
        setMyAnswered(false)
        return
      }
      setMyAnswered(true)
      setMyCorrect(correct)
      setCorrectAnswer(ans)
      setScores(s || {})
      setPhase('result')
    })

    // Skor lawan diperbarui realtime (setiap kali lawan menjawab soalnya)
    socket.on('tournament:score-update', ({ opponentScore, opponentRound }) => {
      setScores(prev => {
        const oppEntry = Object.entries(prev).find(([id]) => id !== String(myUserId))
        if (!oppEntry) return prev
        return { ...prev, [oppEntry[0]]: opponentScore }
      })
      // Update leaderboard opponent score in realtime
      setLeaderboardData(prev => prev ? { ...prev, oppScore: opponentScore } : prev)
    })

    // Aku sudah selesai, lawan masih bermain → masuk leaderboard
    socket.on('tournament:self-finished', ({ scores: finalScores }) => {
      const myScore  = finalScores[myUserId] ?? 0
      const oppEntry = Object.entries(finalScores).find(([id]) => id !== String(myUserId))
      setLeaderboardData({
        myScore,
        myName,
        oppScore: oppEntry?.[1] ?? 0,
        oppName:  opponent?.name,
      })
      setScores(finalScores)
      setPhase('leaderboard')
      // Subscribe to bracket so the waiting screen shows live match updates
      getSocket()?.emit('tournament:spectate', { tournamentId: tournIdRef.current })
    })

    // Live bracket update (received after spectate join above)
    socket.on('tournament:state', (state) => {
      if (state?.id === tournIdRef.current) setBracketState(state)
    })

    // Match selesai — works from any phase including leaderboard
    socket.on('tournament:match-over', ({ winner, scores: s, matchId: mid }) => {
      if (mid !== matchIdRef.current) return
      setMatchResult({ winner, scores: s || {} })
      setPhase('match-over')
    })

    // Spectator slider lawan
    socket.on('tournament:opponent-slider', ({ userId, value }) => {
      if (userId !== myUserId) setOppSlider(value)
    })

    return () => {
      socket.off('tournament:question')
      socket.off('tournament:answer-result')
      socket.off('tournament:score-update')
      socket.off('tournament:self-finished')
      socket.off('tournament:state')
      socket.off('tournament:match-over')
      socket.off('tournament:opponent-slider')
    }
  }, [myUserId, myName])

  // Countdown — runs while playing, resets when phase leaves 'playing'
  useEffect(() => {
    if (phase !== 'playing') {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
      return
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1))
    }, 1000)
    return () => {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [phase])

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing' && !myAnswered) {
      submitAnswer()
    }
  }, [timeLeft, phase, myAnswered, submitAnswer])

  const emitSlider = useCallback((val) => {
    if (sliderThrottle.current) return
    sliderThrottle.current = setTimeout(() => { sliderThrottle.current = null }, 80)
    getSocket()?.emit('tournament:slider-move', { matchId: matchIdRef.current, value: val })
  }, [])

  const handleSlider = useCallback((val) => {
    setSlider(val)
    emitSlider(val)
  }, [emitSlider])

  const submitAnswer = useCallback(() => {
    if (myAnswered || phase !== 'playing') return
    getSocket()?.emit('tournament:answer', {
      tournamentId: tournIdRef.current,
      matchId:      matchIdRef.current,
      value:        slider,
    })
  }, [myAnswered, phase, slider])

  // ── Waiting screen ─────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, fontFamily: 'system-ui, sans-serif', color: '#fff',
      }}>
        <div style={{ fontSize: 48 }}>⚔️</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>Memasuki Arena…</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>vs {opponent?.name} — Menunggu lawan siap</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b',
              animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
        <button onClick={goBack} style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 24px', color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Batal
        </button>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      </div>
    )
  }

  // ── Leaderboard (I'm done, waiting for opponent) ───────────────────────────
  if (phase === 'leaderboard' && leaderboardData) {
    return (
      <LeaderboardWaitScreen
        myScore={leaderboardData.myScore}
        myName={leaderboardData.myName}
        oppScore={leaderboardData.oppScore}
        oppName={leaderboardData.oppName}
        round={round}
        onLeave={goBack}
        onViewBracket={onMatchOver}
        bracketState={bracketState}
      />
    )
  }

  // ── Match over screen — navigates to bracket ───────────────────────────────
  if (phase === 'match-over' && matchResult) {
    return (
      <MatchOverScreen
        winner={matchResult.winner}
        scores={matchResult.scores}
        myUserId={myUserId}
        myName={myName}
        oppName={opponent?.name}
        onLeave={onMatchOver}
      />
    )
  }

  // ── Main game ──────────────────────────────────────────────────────────────
  const q = question?.question || question || {}
  const start   = q.start  ?? 0
  const jump    = q.jump   ?? 0
  const isForward = q.isForward ?? true
  const sliderMin = question?.sliderMin ?? NL_MIN
  const sliderMax = question?.sliderMax ?? NL_MAX

  const myScore  = scores[myUserId] ?? 0
  const oppScore = Object.entries(scores).find(([id]) => id !== String(myUserId))?.[1] ?? 0

  const questionPanel = (
    <div style={{
      background: '#1A1D27',
      border: `1.5px solid ${phase === 'result' ? (myCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(103,232,249,0.25)'}`,
      borderRadius: 20, padding: 16,
    }}>
      {/* Number line — only for katak */}
      {gameKey === 'katak' && (
        <KatakNumberLine
          start={start}
          myPos={slider}
          oppPos={isMd ? null : oppSlider}
          myAnswered={myAnswered}
          myCorrect={myCorrect}
        />
      )}
      {/* Per-question countdown timer */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: timeLeft <= 10 ? 'rgba(239,68,68,0.15)' : 'rgba(103,232,249,0.08)',
            border: `2.5px solid ${timeLeft <= 10 ? '#ef4444' : '#67E8F9'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900,
            color: timeLeft <= 10 ? '#ef4444' : '#67E8F9',
            transition: 'border-color 0.3s, color 0.3s, background 0.3s',
            boxShadow: timeLeft <= 5 ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
          }}>{timeLeft}</div>
        </div>
      )}
      {/* Question text */}
      <div style={{ textAlign: 'center', marginTop: gameKey === 'katak' ? 8 : 0, marginBottom: 16 }}>
        {gameKey === 'katak' ? (
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            Katak di batu{' '}
            <strong style={{ color: '#67E8F9' }}>{start}</strong>, melompat{' '}
            {isForward ? '⮕ maju' : '⬅ mundur'}{' '}
            <strong style={{ color: '#f59e0b' }}>{jump} batu</strong>. Geser katak ke posisi akhir!
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, fontWeight: 700, padding: '8px 4px' }}>
            {q.text || ''}
          </div>
        )}
      </div>
      {/* Value badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.4)',
          color: '#67E8F9', padding: '8px 24px', borderRadius: 12,
          fontSize: 28, fontWeight: 900, boxShadow: '0 0 16px rgba(103,232,249,0.15)',
        }}>{slider}</div>
      </div>
      {/* Slider */}
      <div style={{ width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
        <input
          type="range" min={sliderMin} max={sliderMax} step={1} value={slider}
          onChange={e => !myAnswered && handleSlider(parseInt(e.target.value, 10))}
          disabled={myAnswered}
          style={{ width: '100%', accentColor: '#67E8F9', height: 6, opacity: myAnswered ? 0.4 : 1, cursor: myAnswered ? 'not-allowed' : 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          {[sliderMin, Math.round((sliderMin+sliderMax)/2), sliderMax].map(n => <span key={n}>{n}</span>)}
        </div>
      </div>
      {/* Confirm button */}
      {!myAnswered && phase === 'playing' && (
        <button onClick={submitAnswer} style={{
          width: '100%', background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px',
          color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 12px rgba(14,116,144,0.3)', marginTop: 8,
        }}>
          ✅ Konfirmasi Jawaban: {slider}
        </button>
      )}
    </div>
  )

  const opponentPanel = (
    <div style={{
      background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1 }}>🔥 LAWAN — {opponent?.name}</div>
      {/* Opponent ghost on number line */}
      {gameKey === 'katak' && (
        <KatakNumberLine
          start={start}
          myPos={oppSlider ?? start}
          oppPos={null}
          myAnswered={false}
          myCorrect={null}
        />
      )}
      {/* Progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>Kamu</span>
            <span style={{ fontSize: 11, color: '#67E8F9', fontWeight: 800 }}>{myScore} benar</span>
          </div>
          <div style={{ height: 8, background: 'rgba(103,232,249,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${maxRounds > 0 ? (myScore / maxRounds) * 100 : 0}%`, height: '100%', background: '#67E8F9', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>Lawan</span>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>{oppScore} benar</span>
          </div>
          <div style={{ height: 8, background: 'rgba(245,158,11,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${maxRounds > 0 ? (oppScore / maxRounds) * 100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>
      {/* Last answer feedback */}
      {phase === 'result' && (
        <div style={{
          background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
          borderRadius: 12, padding: '12px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24 }}>{myCorrect ? '✅' : '❌'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: myCorrect ? '#10b981' : '#f87171', marginTop: 4 }}>
            {myCorrect ? 'Benar!' : `Jawaban: ${correctAnswer}`}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: '#475569', marginTop: 'auto' }}>
        <span>🐸 Kamu</span>
        <span>🔥 Lawan</span>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🏆 Ronde {round} Turnamen</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{GAME_LABELS[gameKey] || gameKey} • vs {opponent?.name}</div>
        </div>
        {/* Round dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: maxRounds }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < round - 1 ? '#10b981' : i === round - 1 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      {isMd ? (
        /* ── Desktop split layout ── */
        <div style={{ padding: '16px 24px 40px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ScoreBar
            myName={myName}
            oppName={opponent?.name}
            myScore={myScore}
            oppScore={oppScore}
            round={round}
            maxRounds={maxRounds}
          />
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>{questionPanel}</div>
            <div style={{ flex: 1 }}>{opponentPanel}</div>
          </div>
          {phase === 'result' && (
            <div style={{
              background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
              borderRadius: 12, padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: myCorrect ? '#10b981' : '#f87171' }}>
                {myCorrect ? '✅ Benar!' : `❌ Salah! Jawaban: ${correctAnswer}`}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Soal berikutnya sebentar lagi…</div>
            </div>
          )}
        </div>
      ) : (
        /* ── Mobile layout ── */
        <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          <ScoreBar
            myName={myName}
            oppName={opponent?.name}
            myScore={myScore}
            oppScore={oppScore}
            round={round}
            maxRounds={maxRounds}
          />
          {questionPanel}
          {phase === 'result' && (
            <div style={{
              background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
              borderRadius: 12, padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: myCorrect ? '#10b981' : '#f87171' }}>
                {myCorrect ? '✅ Benar!' : `❌ Salah! Jawaban: ${correctAnswer}`}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Soal berikutnya sebentar lagi…</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#475569' }}>
            <span>🐸 Kamu</span>
            <span>🔥 Lawan</span>
          </div>
        </div>
      )}
    </div>
  )
}
