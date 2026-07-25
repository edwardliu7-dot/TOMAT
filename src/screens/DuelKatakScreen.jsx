import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TopBar, Card, Btn } from '../components/shared'
import { connectSocket, getSocket } from '../socket'

// ─── Number line helpers (mirrors SubmarineGame.jsx) ─────────────────────────
const NL_MIN = -15, NL_MAX = 15
function toPercent(n) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

// ─── Slider (inline — no shared-component dependency) ────────────────────────
function DuelSlider({ value, min = NL_MIN, max = NL_MAX, onChange, disabled }) {
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
        {[-15, -10, -5, 0, 5, 10, 15].map(n => <span key={n}>{n}</span>)}
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
function NumberLine({ question, myPos, oppPos, myAnswered, oppAnswered, myCorrect, oppCorrect }) {
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
          const dir = isForward ? -18 : -18
          return <path d={`M ${sx} 48 Q ${mx} ${48 + dir} ${ex} 48`}
            fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
        })()}

        {/* Opponent ghost frog 👾 */}
        {oppPos !== null && (
          <text
            x={15 + toPercent(oppPos) / 100 * 230} y="43"
            textAnchor="middle" fontSize="16"
            opacity={oppAnswered ? 1 : 0.5}
            style={{ filter: 'saturate(0.4)', transition: 'x 0.15s' }}
          >🔥</text>
        )}

        {/* Result overlay for opponent */}
        {oppAnswered && (
          <text x={15 + toPercent(oppPos) / 100 * 230} y="32" textAnchor="middle" fontSize="12">
            {oppCorrect ? '✅' : '❌'}
          </text>
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

// ─── Game Over Screen ─────────────────────────────────────────────────────────
function GameOverScreen({ winner, scores, myIndex, onRematch, onLeave }) {
  const me  = scores[myIndex]
  const opp = scores[myIndex === 0 ? 1 : 0]
  const iWon  = winner?.userId === me?.userId
  const isDraw = winner === null

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 20,
    }}>
      <div style={{ fontSize: 72 }}>{isDraw ? '🤝' : iWon ? '🏆' : '😤'}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: iWon ? '#fbbf24' : isDraw ? '#94A3B8' : '#f87171', textAlign: 'center' }}>
        {isDraw ? 'Seri!' : iWon ? 'Kamu Menang!' : `${winner?.name} Menang!`}
      </div>

      {/* Score comparison */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '16px 24px', display: 'flex', gap: 32, alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 4 }}>KAMU</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{me?.name}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#67E8F9' }}>{me?.score}</div>
          <div style={{ fontSize: 10, color: '#475569' }}>soal benar</div>
        </div>
        <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 900 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>LAWAN</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{opp?.name}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>{opp?.score}</div>
          <div style={{ fontSize: 10, color: '#475569' }}>soal benar</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn onClick={onLeave} color="#1e293b">← Keluar</Btn>
      </div>
    </div>
  )
}

// ─── Main Duel Screen ─────────────────────────────────────────────────────────
export default function DuelKatakScreen({ code, myIndex, question: initQ, round: initRound, maxRounds, scores: initScores, goBack }) {
  const [question, setQuestion] = useState(initQ)
  const [round, setRound]       = useState(initRound)
  const [scores, setScores]     = useState(initScores)

  const [mySlider, setMySlider]         = useState(initQ.start)
  const [oppSlider, setOppSlider]       = useState(null)
  const [myAnswered, setMyAnswered]     = useState(false)
  const [oppAnswered, setOppAnswered]   = useState(false)
  const [myCorrect, setMyCorrect]       = useState(null)
  const [oppCorrect, setOppCorrect]     = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)

  const [phase, setPhase]   = useState('playing') // playing | result | game-over | left
  const [gameOver, setGameOver] = useState(null)
  const [leftMsg, setLeftMsg]   = useState('')

  // Throttled slider emit
  const sliderThrottle = useRef(null)

  const emitSlider = useCallback((val) => {
    if (sliderThrottle.current) return
    sliderThrottle.current = setTimeout(() => { sliderThrottle.current = null }, 80)
    getSocket()?.emit('duel:slider-move', { code, value: val })
  }, [code])

  const handleSlider = useCallback((val) => {
    setMySlider(val)
    emitSlider(val)
  }, [emitSlider])

  // ── Socket events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()

    // Opponent slider moves
    socket.on('duel:opponent-slider', ({ value }) => {
      setOppSlider(value)
    })

    // Opponent answered
    socket.on('duel:opponent-answered', ({ correct, opponentScore, opponentValue }) => {
      setOppSlider(opponentValue)
      setOppAnswered(true)
      setOppCorrect(correct)
      setScores(prev => {
        const updated = [...prev]
        const oppIdx  = myIndex === 0 ? 1 : 0
        updated[oppIdx] = { ...updated[oppIdx], score: opponentScore }
        return updated
      })
    })

    // My answer result
    socket.on('duel:answer-result', ({ correct, yourScore, opponentScore, correctAnswer: ans }) => {
      setMyAnswered(true)
      setMyCorrect(correct)
      setCorrectAnswer(ans)
      setPhase('result')
      setScores(prev => {
        const updated = [...prev]
        updated[myIndex] = { ...updated[myIndex], score: yourScore }
        const oppIdx = myIndex === 0 ? 1 : 0
        updated[oppIdx] = { ...updated[oppIdx], score: opponentScore }
        return updated
      })
    })

    // Next question
    socket.on('duel:question', ({ question: q, round: r, maxRounds: mr, scores: s }) => {
      setQuestion(q)
      setRound(r)
      setScores(s)
      setMySlider(q.start)
      setOppSlider(null)
      setMyAnswered(false)
      setOppAnswered(false)
      setMyCorrect(null)
      setOppCorrect(null)
      setCorrectAnswer(null)
      setPhase('playing')
    })

    // Game over
    socket.on('duel:game-over', ({ winner, scores: finalScores }) => {
      setScores(finalScores)
      setPhase('game-over')
      setGameOver({ winner, scores: finalScores })
    })

    // Opponent left mid-game
    socket.on('duel:player-left', ({ name }) => {
      setLeftMsg(`${name} meninggalkan pertandingan.`)
      setPhase('left')
    })

    return () => {
      socket.off('duel:opponent-slider')
      socket.off('duel:opponent-answered')
      socket.off('duel:answer-result')
      socket.off('duel:question')
      socket.off('duel:game-over')
      socket.off('duel:player-left')
    }
  }, [myIndex, code])

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
  const { start, jump, isForward } = question
  const correctAns = isForward ? start + jump : start - jump

  // What position to show for the opponent frog
  const oppDisplayPos = oppAnswered ? oppSlider : (oppSlider !== null ? oppSlider : start)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)' }}>
      <TopBar
        title="⚔️ Katak Duel"
        onBack={() => { getSocket()?.emit('duel:leave'); goBack() }}
      />

      <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, margin: '0 auto' }}>

        {/* Score Bar */}
        <ScoreBar scores={scores} myIndex={myIndex} round={round} maxRounds={maxRounds} />

        {/* Game card */}
        <Card border={phase === 'result' ? (myCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(103,232,249,0.25)'}>

          {/* Number line with both frogs */}
          <NumberLine
            question={question}
            myPos={myAnswered ? mySlider : mySlider}
            oppPos={oppDisplayPos}
            myAnswered={myAnswered}
            oppAnswered={oppAnswered}
            myCorrect={myCorrect}
            oppCorrect={oppCorrect}
          />

          {/* Question text */}
          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              Katak di batu{' '}
              <strong style={{ color: '#67E8F9' }}>{start}</strong>, melompat{' '}
              {isForward ? '⮕ maju' : '⬅ mundur'}{' '}
              <strong style={{ color: '#f59e0b' }}>{jump} batu</strong>. Geser katak!
            </div>
          </div>

          {/* My slider */}
          <DuelSlider
            value={mySlider}
            onChange={handleSlider}
            disabled={myAnswered}
          />

          {/* Slider value indicator */}
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <span style={{
              background: 'rgba(103,232,249,0.1)', border: '1.5px solid rgba(103,232,249,0.3)',
              borderRadius: 20, padding: '4px 16px', fontSize: 18, fontWeight: 900, color: '#67E8F9',
            }}>{mySlider}</span>
          </div>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: myCorrect ? '#10b981' : '#f87171', marginBottom: 4 }}>
              {myCorrect ? '✅ Benar!' : `❌ Salah! Jawaban: ${correctAnswer}`}
            </div>
            {!oppAnswered && (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Menunggu lawan menjawab…</div>
            )}
            {oppAnswered && (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                Lawan {oppCorrect ? '✅ benar' : '❌ salah'}. Soal berikutnya sebentar lagi…
              </div>
            )}
          </div>
        )}

        {/* Waiting banner when I haven't answered yet but opponent has */}
        {oppAnswered && !myAnswered && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 12, padding: '10px 16px', textAlign: 'center',
            fontSize: 12, color: '#fbbf24', fontWeight: 600,
          }}>
            🔥 Lawan sudah menjawab! Cepat!
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#475569' }}>
          <span>🐸 Kamu</span>
          <span>🔥 Lawan</span>
        </div>
      </div>
    </div>
  )
}
