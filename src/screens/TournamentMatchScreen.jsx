import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connectSocket, getSocket } from '../socket'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NL_MIN = -20, NL_MAX = 20
function toPercent(n) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

const GAME_LABELS = {
  katak:           '🐸 Katak Pelompat',
  termometer:      '🌡️ Termometer',
  pabrikrobot:     '🤖 Pabrik Robot',
  gembok:          '⚙️ Gembok Roda Gigi',
  mercusuar:       '🏮 Mercusuar',
  sporajamur:      '🍄 Spora Jamur',
  scanner:         '💎 Scanner Permata',
  // Grade 8 BAB I — Bilangan Berpangkat
  g8selramuan:     '🧪 Penggandaan Sel Ramuan',
  g8racunminiatur: '☠️ Ekstraksi Racun Miniatur',
  g8kristal:       '💎 Pemisahan Elemen Kristal',
  g8fusienergi:    '⚗️ Fusi Energi Alkemis',
  g8mantraakar:    '✨ Penyederhanaan Mantra Akar',
  g8geolog:        '⛏️ Ekspedisi Geolog Kerajaan',
}

// ─── Number line (katak) ───────────────────────────────────────────────────────
function KatakNumberLine({ start, myPos, oppPos, myAnswered, oppAnswered, myCorrect, oppCorrect }) {
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
        {/* Opponent ghost */}
        {oppPos !== null && (
          <text x={15 + toPercent(oppPos) / 100 * 230} y="43"
            textAnchor="middle" fontSize="16"
            opacity={oppAnswered ? 1 : 0.5}
            style={{ filter: 'saturate(0.4)', transition: 'x 0.15s' }}>🔥</text>
        )}
        {oppAnswered && (
          <text x={15 + toPercent(oppPos) / 100 * 230} y="32" textAnchor="middle" fontSize="12">
            {oppCorrect ? '✅' : '❌'}
          </text>
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
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 16px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 2 }}>KAMU</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{myName}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#67E8F9' }}>{myScore}</div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>SOAL</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{round}/{maxRounds}</div>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>VS</div>
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>LAWAN</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{oppName}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>{oppScore}</div>
      </div>
    </div>
  )
}

// ─── Match Over Screen ─────────────────────────────────────────────────────────
function MatchOverScreen({ winner, scores, myUserId, myName, oppName, onWait, onLeave }) {
  const iWon = winner?.userId === myUserId
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
          <div style={{ fontSize: 36, fontWeight: 900, color: '#67E8F9' }}>{scores[myUserId] ?? 0}</div>
        </div>
        <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 900 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>LAWAN</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{oppName}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>
            {Object.entries(scores).find(([id]) => id !== String(myUserId))?.[1] ?? 0}
          </div>
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
  const [question,    setQuestion]    = useState(null)
  const [round,       setRound]       = useState(initRound || 1)
  const [maxRounds,   setMaxRounds]   = useState(7)
  const [scores,      setScores]      = useState({})
  const [slider,      setSlider]      = useState(0)
  const [oppSlider,   setOppSlider]   = useState(null)
  const [myAnswered,  setMyAnswered]  = useState(false)
  const [oppAnswered, setOppAnswered] = useState(false)
  const [myCorrect,   setMyCorrect]   = useState(null)
  const [oppCorrect,  setOppCorrect]  = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const [phase, setPhase] = useState('waiting') // waiting | playing | result | match-over
  const [matchResult, setMatchResult] = useState(null) // { winner, scores }

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

    // Soal datang → mulai bermain
    socket.on('tournament:question', ({ question: q, round: r, maxRounds: mr, scores: s }) => {
      setQuestion(q)
      setRound(r)
      setMaxRounds(mr)
      setScores(s || {})
      setSlider(q.question?.start ?? q.start ?? 0)
      setOppSlider(null)
      setMyAnswered(false)
      setOppAnswered(false)
      setMyCorrect(null)
      setOppCorrect(null)
      setCorrectAnswer(null)
      setPhase('playing')
    })

    // Hasil jawabanku
    socket.on('tournament:answer-result', ({ correct, correctAnswer: ans, yourValue, scores: s }) => {
      setMyAnswered(true)
      setMyCorrect(correct)
      setCorrectAnswer(ans)
      setScores(s || {})
      setPhase('result')
    })

    // Lawan sudah jawab
    socket.on('tournament:player-answered', ({ userId, correct, value, scores: s }) => {
      if (userId !== myUserId) {
        setOppSlider(value)
        setOppAnswered(true)
        setOppCorrect(correct)
        setScores(s || {})
      }
    })

    // Spectator slider lawan
    socket.on('tournament:opponent-slider', ({ userId, value }) => {
      if (userId !== myUserId) setOppSlider(value)
    })

    // Match selesai
    socket.on('tournament:match-over', ({ winner, scores: s, matchId: mid }) => {
      if (mid !== matchIdRef.current) return
      setMatchResult({ winner, scores: s || {} })
      setPhase('match-over')
    })

    return () => {
      socket.off('tournament:question')
      socket.off('tournament:answer-result')
      socket.off('tournament:player-answered')
      socket.off('tournament:opponent-slider')
      socket.off('tournament:match-over')
    }
  }, [myUserId])

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

  // ── Match over screen ──────────────────────────────────────────────────────
  if (phase === 'match-over' && matchResult) {
    return (
      <MatchOverScreen
        winner={matchResult.winner}
        scores={matchResult.scores}
        myUserId={myUserId}
        myName={myName}
        oppName={opponent?.name}
        onWait={onMatchOver}
        onLeave={goBack}
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

  const oppDisplayPos = oppAnswered
    ? (oppSlider ?? start)
    : (oppSlider !== null ? oppSlider : start)

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

      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
        {/* Score bar */}
        <ScoreBar
          myName={myName}
          oppName={opponent?.name}
          myScore={scores[myUserId] ?? 0}
          oppScore={Object.entries(scores).find(([id]) => id !== String(myUserId))?.[1] ?? 0}
          round={round}
          maxRounds={maxRounds}
        />

        {/* Game card */}
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
              oppPos={oppDisplayPos}
              myAnswered={myAnswered}
              oppAnswered={oppAnswered}
              myCorrect={myCorrect}
              oppCorrect={oppCorrect}
            />
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

          {/* Slider */}
          <div style={{ padding: '0 4px' }}>
            <input
              type="range" min={sliderMin} max={sliderMax} step={1} value={slider}
              onChange={e => !myAnswered && handleSlider(parseInt(e.target.value, 10))}
              disabled={myAnswered}
              style={{ width: '100%', accentColor: '#67E8F9', height: 28, opacity: myAnswered ? 0.4 : 1, cursor: myAnswered ? 'not-allowed' : 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: -4 }}>
              {[sliderMin, Math.round((sliderMin+sliderMax)/2), sliderMax].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          {/* Current value */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{
              background: 'rgba(103,232,249,0.1)', border: '1.5px solid rgba(103,232,249,0.3)',
              borderRadius: 20, padding: '4px 16px', fontSize: 20, fontWeight: 900, color: '#67E8F9',
            }}>{slider}</span>
          </div>
        </div>

        {/* Confirm button */}
        {!myAnswered && phase === 'playing' && (
          <button onClick={submitAnswer} style={{
            background: '#0e7490', border: 'none', borderRadius: 14, padding: '16px',
            color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ✅ Konfirmasi Posisi {slider}
          </button>
        )}

        {/* Lawan sudah jawab banner */}
        {oppAnswered && !myAnswered && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
            🔥 Lawan sudah menjawab! Cepat!
          </div>
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
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              {!oppAnswered ? 'Menunggu lawan menjawab…' : 'Soal berikutnya sebentar lagi…'}
            </div>
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
