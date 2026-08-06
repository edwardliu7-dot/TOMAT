import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TopBar, Card, Btn } from '../components/shared'
import { connectSocket, getSocket } from '../socket'
import { getGameInfo } from '../gamesCatalog'
import { useAuth } from '../AuthContext'
import { useTask } from '../TaskContext'
import { usePlayer } from '../PlayerContext'
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

// ─── Number line helpers (katak) ─────────────────────────────────────────────
const NL_MIN = -15, NL_MAX = 15
function toPercent(n) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

// ─── Initial slider value helper ─────────────────────────────────────────────
function getInitSlider(q, gameKey) {
  if (gameKey === 'katak') {
    const inner = q?.question || q || {}
    return inner.start ?? 0
  }
  const min = q?.sliderMin ?? -15
  const max = q?.sliderMax ?? 15
  return Math.round((min + max) / 2)
}

// ─── Slider (inline — no shared-component dependency) ────────────────────────
function DuelSlider({ value, min = NL_MIN, max = NL_MAX, onChange, disabled }) {
  const ticks = [min, Math.round((min + max) / 2), max]
  return (
    <div style={{ padding: '0 4px' }}>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={e => !disabled && onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        style={{
          width: '100%', accentColor: '#67E8F9',
          opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
          height: 28,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
        {ticks.map(n => <span key={n}>{n}</span>)}
      </div>
    </div>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ scores, myIndex, round, maxRounds }) {
  const me  = scores[myIndex]
  const opp = scores[myIndex === 0 ? 1 : 0]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 16px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Me */}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 2 }}>KAMU</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.name}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9' }}>{me?.score ?? 0}</div>
      </div>
      {/* Centre */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>SOAL</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{round}/{maxRounds}</div>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
      </div>
      {/* Opponent */}
      <div style={{ flex: 1, textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{opp?.name}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>{opp?.score ?? 0}</div>
      </div>
    </div>
  )
}

// ─── Number line visualisation ────────────────────────────────────────────────
function NumberLine({ question, myPos, oppPos, myAnswered, myCorrect }) {
  const { start, jump, isForward } = question
  const correctAns = isForward ? start + jump : start - jump

  return (
    <div style={{ padding: '0 4px' }}>
      <svg width="100%" viewBox="0 0 260 80" style={{ overflow: 'visible', display: 'block' }}>
        {/* River background */}
        <rect x="0" y="50" width="260" height="30" rx="4" fill="rgba(14,116,144,0.12)" />

        {/* Water ripples */}
        {[25,60,95,130,165,200,235].map((x, i) => (
          <ellipse key={i} cx={x} cy="60" rx="13" ry="4" fill="none" stroke="rgba(103,232,249,0.12)" strokeWidth="1" />
        ))}

        {/* Stones */}
        {[18,50,80,110,140,170,200,230].map((x, i) => (
          <ellipse key={i} cx={x} cy="52" rx="16" ry="7" fill="#0a1f2e" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
        ))}

        {/* Number line */}
        <line x1="15" y1="70" x2="245" y2="70" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
        {[NL_MIN, -10, -5, 0, 5, 10, NL_MAX].map((n, i) => (
          <text key={i} x={15 + (n - NL_MIN) / (NL_MAX - NL_MIN) * 230} y="78"
            textAnchor="middle" fill="rgba(103,232,249,0.35)" fontSize="7">{n}</text>
        ))}

        {/* Start position marker */}
        <rect
          x={15 + toPercent(start) / 100 * 230 - 1.5} y="48" width="3" height="22"
          fill="#67E8F9" rx="1.5" opacity="0.5"
        />

        {/* Jump arc */}
        {(() => {
          const sx = 15 + toPercent(start) / 100 * 230
          const ex = 15 + toPercent(correctAns) / 100 * 230
          const mx = (sx + ex) / 2
          return <path d={`M ${sx} 48 Q ${mx} ${30} ${ex} 48`}
            fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
        })()}

        {/* Opponent ghost frog 🔥 — shows last known slider position */}
        {oppPos !== null && (
          <text
            x={15 + toPercent(oppPos) / 100 * 230} y="43"
            textAnchor="middle" fontSize="16"
            opacity={0.5}
            style={{ filter: 'saturate(0.4)', transition: 'x 0.15s' }}
          >🔥</text>
        )}

        {/* My frog 🐸 */}
        <text
          x={15 + toPercent(myPos) / 100 * 230} y="43"
          textAnchor="middle" fontSize="18"
          style={{ transition: 'x 0.1s' }}
        >🐸</text>

        {/* Result overlay for me */}
        {myAnswered && (
          <text x={15 + toPercent(myPos) / 100 * 230} y="30" textAnchor="middle" fontSize="14">
            {myCorrect ? '✅' : '❌'}
          </text>
        )}
      </svg>
    </div>
  )
}

// ─── Leaderboard Wait Screen ──────────────────────────────────────────────────
function LeaderboardWaitScreen({ myScore, myName, oppScore, oppName, oppRound, maxRounds, onLeave }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 24, fontFamily: 'system-ui, sans-serif', color: '#fff',
    }}>
      <style>{`
        @keyframes lbBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 64, lineHeight: 1 }}>🏁</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', textAlign: 'center' }}>
          Kamu Sudah Selesai!
        </div>
      </div>

      {/* Score comparison card */}
      <div style={{
        background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '24px 20px', width: '100%', maxWidth: 340, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', width: '100%' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 800, letterSpacing: 1 }}>KAMU</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{myName}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#67E8F9', marginTop: 6, lineHeight: 1 }}>{myScore}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>soal benar</div>
          </div>
          <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 900, opacity: 0.9 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1 }}>LAWAN</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{oppName}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', marginTop: 6, lineHeight: 1 }}>{oppScore}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>soal benar</div>
          </div>
        </div>
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
          diperbarui langsung saat lawan menjawab
        </div>
      </div>

      {/* Status banner */}
      <div style={{
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 12, padding: '16px 20px', width: '100%', maxWidth: 340, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>⏳ Lawan masih mengerjakan soal…</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#f59e0b',
              animation: `lbBounce 1.4s ease-in-out ${[-0.32,-0.16,0][i]}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Opponent progress */}
      {oppRound != null && maxRounds != null && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '10px 16px', width: '100%', maxWidth: 340, boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{oppName}</span>
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>soal {oppRound} dari {maxRounds}</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (oppRound / maxRounds) * 100)}%`, background: '#f59e0b', borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      <button onClick={onLeave} style={{
        width: '100%', maxWidth: 300, padding: 16, background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
        color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        ← Keluar
      </button>
    </div>
  )
}

// ─── Game Over Screen ─────────────────────────────────────────────────────────
function GameOverScreen({ winner, scores, myIndex, onLeave }) {
  const me  = scores[myIndex]
  const opp = scores[myIndex === 0 ? 1 : 0]
  const iWon  = winner?.userId === me?.userId
  const isDraw = winner === null

  const myScoreColor  = iWon ? '#67E8F9' : isDraw ? '#94A3B8' : '#f87171'
  const oppScoreColor = !iWon && !isDraw ? '#10b981' : isDraw ? '#94A3B8' : '#f87171'
  const myLabelColor  = iWon ? '#67E8F9' : '#94A3B8'
  const oppLabelColor = (!iWon && !isDraw) ? '#f59e0b' : '#94A3B8'

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 20, fontFamily: 'system-ui, sans-serif', color: '#fff',
    }}>
      <style>{`
        @keyframes duelPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes duelShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
      `}</style>

      <div style={{
        fontSize: 80, lineHeight: 1, marginBottom: 4,
        animation: isDraw ? 'none' : iWon ? 'duelPulse 2s infinite ease-in-out' : 'duelShake 4s infinite ease-in-out',
      }}>
        {isDraw ? '🤝' : iWon ? '🏆' : '😤'}
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: iWon ? '#fbbf24' : isDraw ? '#94A3B8' : '#f87171' }}>
          {isDraw ? 'Seri!' : iWon ? 'Kamu Menang!' : 'Kamu Kalah!'}
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>
          {isDraw ? 'Pertarungan sengit — tidak ada yang kalah!'
            : iWon ? 'Selamat! Kamu mendapat 🪙 +15 koin'
            : 'Jangan menyerah, coba lagi di duel berikutnya!'}
        </div>
      </div>

      {/* Score comparison */}
      <div style={{
        background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '24px 20px', display: 'flex', gap: 32, alignItems: 'center',
        width: '100%', maxWidth: 340, boxSizing: 'border-box', marginTop: 12, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: myLabelColor, letterSpacing: 0.5 }}>KAMU</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{me?.name}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: myScoreColor, lineHeight: 1.2 }}>{me?.score ?? 0}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>soal benar</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b', marginTop: -16 }}>VS</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: oppLabelColor, letterSpacing: 0.5 }}>LAWAN</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{opp?.name}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: oppScoreColor, lineHeight: 1.2 }}>{opp?.score ?? 0}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>soal benar</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onLeave} style={{
          width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14, color: '#fff', padding: 16, fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Keluar
        </button>
      </div>
    </div>
  )
}

// ─── Main Duel Screen ─────────────────────────────────────────────────────────
export default function DuelKatakScreen({ code, myIndex, question: initQ, round: initRound, maxRounds, scores: initScores, gameKey = 'katak', goBack }) {
  const gameInfo = getGameInfo(gameKey)
  const isMd = useIsMd()
  const { user } = useAuth()
  const { activeSession } = useTask()
  const { syncCoins } = usePlayer()
  const [question, setQuestion] = useState(initQ)
  const [round, setRound]       = useState(initRound)
  const [scores, setScores]     = useState(initScores)

  const [mySlider, setMySlider]         = useState(() => getInitSlider(initQ, gameKey))
  const [oppSlider, setOppSlider]       = useState(null)
  const [myAnswered, setMyAnswered]     = useState(false)
  const [myCorrect, setMyCorrect]       = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)

  // Nananaga wrong-answer immunity tokens for this duel session
  const immunityLeft = useRef(
    !activeSession && user?.equippedPetSkin ? getWrongImmunity(user.equippedPetSkin) : 0
  )

  // phase: 'playing' | 'result' | 'leaderboard' | 'game-over' | 'left'
  const [phase, setPhase]   = useState('playing')
  const [gameOver, setGameOver] = useState(null)
  const [leftMsg, setLeftMsg]   = useState('')

  // Leaderboard state (while waiting for opponent to finish)
  const [leaderboardData, setLeaderboardData] = useState(null)

  const handleSlider = useCallback((val) => {
    setMySlider(val)
  }, [])

  // ── Socket events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()

    const rejoin = () => socket.emit('duel:rejoin', { code })

    // Opponent score updated (fires every time opponent answers any question)
    socket.on('duel:score-update', ({ opponentScore, opponentRound }) => {
      setScores(prev => {
        const updated = [...prev]
        const oppIdx  = myIndex === 0 ? 1 : 0
        updated[oppIdx] = { ...updated[oppIdx], score: opponentScore }
        return updated
      })
      // Update leaderboard opponent score in realtime if we're waiting
      setLeaderboardData(prev => prev ? { ...prev, oppScore: opponentScore } : prev)
    })

    // My answer result — brief feedback, next question comes automatically after ~1.2s
    socket.on('duel:answer-result', ({ correct, yourScore, correctAnswer: ans }) => {
      // Nananaga immunity: intercept wrong answers when tokens remain and no task session active
      if (!correct && immunityLeft.current > 0 && !activeSession) {
        // Request a bonus question from server without advancing the round
        getSocket()?.emit('duel:use-immunity', { code }, ({ ok, tokensLeft } = {}) => {
          if (!ok) {
            // Server rejected the claim (for example, token state changed).
            // Keep the local token untouched and show the normal result.
            setMyAnswered(true)
            setMyCorrect(false)
            setCorrectAnswer(ans)
            setPhase('result')
            return
          }
          immunityLeft.current = tokensLeft
          window.dispatchEvent(new CustomEvent('nananaga-shield', {
            detail: { tokensLeft },
          }))
          // Stay in 'playing' phase; server sends the bonus question.
          setMyAnswered(false)
          setScores(prev => {
            const updated = [...prev]
            updated[myIndex] = { ...updated[myIndex], score: yourScore }
            return updated
          })
        })
        return
      }
      setMyAnswered(true)
      setMyCorrect(correct)
      setCorrectAnswer(ans)
      setPhase('result')
      setScores(prev => {
        const updated = [...prev]
        updated[myIndex] = { ...updated[myIndex], score: yourScore }
        return updated
      })
    })

    // Next question (sent by server to this player only)
    socket.on('duel:question', ({ question: q, round: r, maxRounds: mr, scores: s, gameKey: gk }) => {
      setQuestion(q)
      setRound(r)
      setScores(s)
      setMySlider(getInitSlider(q, gk || gameKey))
      setOppSlider(null)
      setMyAnswered(false)
      setMyCorrect(null)
      setCorrectAnswer(null)
      setPhase('playing')
    })

    // I finished all questions — go to leaderboard while opponent still plays
    socket.on('duel:self-finished', ({ yourScore, opponentScore, scores: finalScores }) => {
      const oppIdx = myIndex === 0 ? 1 : 0
      setLeaderboardData({
        myScore:  yourScore,
        myName:   finalScores[myIndex]?.name,
        oppScore: opponentScore,
        oppName:  finalScores[oppIdx]?.name,
      })
      setScores(finalScores)
      setPhase('leaderboard')
    })

    // Game over — works from any phase (playing, result, leaderboard)
    socket.on('duel:game-over', ({ winner, scores: finalScores, winnerNewCoins }) => {
      const myUserId = user?.id
      const iWon = winner?.userId && String(winner.userId) === String(myUserId)
      console.log(`[duel:game-over] winner=${winner?.userId ?? 'draw'} myId=${myUserId} iWon=${iWon} winnerNewCoins=${winnerNewCoins}`)
      // BUG FIX: sync the server-authoritative coin balance so the UI reflects
      // the 15-coin win reward that the server now awards in finishGame().
      if (iWon && winnerNewCoins != null) {
        console.log(`[duel:game-over] Syncing coins → ${winnerNewCoins}`)
        syncCoins(winnerNewCoins)
      }
      setScores(finalScores)
      setPhase('game-over')
      setGameOver({ winner, scores: finalScores })
    })

    // Opponent left mid-game (only fires if they hadn't finished yet)
    socket.on('duel:player-left', ({ name }) => {
      setLeftMsg(`${name} meninggalkan pertandingan.`)
      setPhase('left')
    })

    // Opponent ghost slider (real-time position, shown on number line)
    socket.on('duel:opponent-slider', ({ value }) => {
      setOppSlider(value)
    })

    socket.on('connect', rejoin)
    // LobbyScreen normally leaves the socket connected, but this also
    // recovers a duel when the screen is opened after a reconnect.
    if (socket.connected) rejoin()

    return () => {
      socket.off('duel:score-update')
      socket.off('duel:answer-result')
      socket.off('duel:question')
      socket.off('duel:self-finished')
      socket.off('duel:game-over')
      socket.off('duel:player-left')
      socket.off('duel:opponent-slider')
      socket.off('connect', rejoin)
    }
  }, [myIndex, code, gameKey, syncCoins, user])

  // Emit leave on unmount if game not over
  useEffect(() => {
    return () => {
      getSocket()?.emit('duel:leave')
    }
  }, [])

  const submitAnswer = useCallback(() => {
    if (myAnswered) return
    getSocket()?.emit('duel:answer', { code, value: mySlider })
  }, [myAnswered, code, mySlider])

  // ── Game Over ──────────────────────────────────────────────────────────────
  if (phase === 'game-over' && gameOver) {
    return (
      <GameOverScreen
        winner={gameOver.winner}
        scores={gameOver.scores}
        myIndex={myIndex}
        onLeave={goBack}
      />
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
        onLeave={() => { getSocket()?.emit('duel:leave'); goBack() }}
      />
    )
  }

  // ── Opponent left ──────────────────────────────────────────────────────────
  if (phase === 'left') {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, gap: 20,
      }}>
        <div style={{ fontSize: 64 }}>🏃</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171', textAlign: 'center' }}>Lawan Kabur!</div>
        <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center' }}>{leftMsg}</div>
        <Btn onClick={goBack} color="#1e293b">← Kembali</Btn>
      </div>
    )
  }

  // ── Game in progress ───────────────────────────────────────────────────────
  // Parse question — genTournamentQ wraps content in question.question
  const q          = question?.question || question || {}
  const { start = 0, jump = 0, isForward = true } = q
  const sliderMin  = question?.sliderMin ?? NL_MIN
  const sliderMax  = question?.sliderMax ?? NL_MAX
  const isKatak    = gameKey === 'katak'

  const inputArea = (
    <>
      <Card border={phase === 'result' ? (myCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(103,232,249,0.25)'}>
        {/* Number line — katak only (on mobile only; on desktop shown on right panel) */}
        {isKatak && !isMd && (
          <NumberLine
            question={q}
            myPos={mySlider}
            oppPos={oppSlider}
            myAnswered={myAnswered}
            myCorrect={myCorrect}
          />
        )}
        {/* Question text */}
        <div style={{ textAlign: 'center', marginTop: isKatak && !isMd ? 8 : 0, marginBottom: 16 }}>
          {isKatak ? (
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              Katak di batu{' '}
              <strong style={{ color: '#67E8F9' }}>{start}</strong>, melompat{' '}
              {isForward ? '⮕ maju' : '⬅ mundur'}{' '}
              <strong style={{ color: '#f59e0b' }}>{jump} batu</strong>. Geser katak!
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, fontWeight: 700, padding: '8px 4px' }}>
              {q.text || ''}
            </div>
          )}
        </div>
        {/* Slider value indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.4)',
            color: '#67E8F9', padding: '8px 24px', borderRadius: 12,
            fontSize: 28, fontWeight: 900, boxShadow: '0 0 16px rgba(103,232,249,0.15)',
          }}>{mySlider}</div>
        </div>
        {/* My slider */}
        <DuelSlider
          value={mySlider}
          min={sliderMin}
          max={sliderMax}
          onChange={handleSlider}
          disabled={myAnswered}
        />
      </Card>
      {/* Confirm button */}
      {!myAnswered && (
        <Btn onClick={submitAnswer} color="#0e7490">
          ✅ Konfirmasi Posisi {mySlider}
        </Btn>
      )}
      {/* Result banner */}
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
      {isKatak && !isMd && (
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#475569' }}>
          <span>🐸 Kamu</span>
          <span>🔥 Lawan</span>
        </div>
      )}
    </>
  )

  const visualPanel = (
    <div style={{
      background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1 }}>
        🔥 VISUALISASI — {scores[myIndex === 0 ? 1 : 0]?.name || 'Lawan'}
      </div>
      {/* Garis bilangan lawan */}
      {isKatak && (
        <NumberLine
          question={q}
          myPos={oppSlider ?? start}
          oppPos={null}
          myAnswered={false}
          myCorrect={null}
        />
      )}
      {/* Status lawan */}
      <div style={{
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#94A3B8',
      }}>
        {oppSlider !== null
          ? `🔥 Lawan di posisi ${oppSlider}`
          : '⌛ Menunggu gerakan lawan…'}
      </div>
      {/* Progress kamu vs lawan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Kamu', score: scores[myIndex]?.score ?? 0, color: '#67E8F9' },
          { label: 'Lawan', score: scores[myIndex === 0 ? 1 : 0]?.score ?? 0, color: '#f59e0b' },
        ].map(({ label, score, color }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color, fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 11, color, fontWeight: 800 }}>{score} benar</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${maxRounds > 0 ? (score / maxRounds) * 100 : 0}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>
      {phase === 'result' && (
        <div style={{ textAlign: 'center', fontSize: 32 }}>{myCorrect ? '✅' : '❌'}</div>
      )}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: '#475569', marginTop: 'auto' }}>
        <span>🐸 Kamu</span>
        <span>🔥 Lawan</span>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)' }}>
      <TopBar
        title={`⚔️ ${gameInfo?.name || 'Duel'}`}
        onBack={() => { getSocket()?.emit('duel:leave'); goBack() }}
      />
      {isMd ? (
        /* ── Desktop split layout ── */
        <div style={{ padding: '12px 24px 40px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ScoreBar scores={scores} myIndex={myIndex} round={round} maxRounds={maxRounds} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>{inputArea}</div>
            <div style={{ flex: 1 }}>{visualPanel}</div>
          </div>
        </div>
      ) : (
        /* ── Mobile layout ── */
        <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, margin: '0 auto' }}>
          <ScoreBar scores={scores} myIndex={myIndex} round={round} maxRounds={maxRounds} />
          {inputArea}
        </div>
      )}
    </div>
  )
}
