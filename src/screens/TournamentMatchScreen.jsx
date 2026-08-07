import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connectSocket, getSocket } from '../socket'
import { useAuth } from '../AuthContext'
import { useTask } from '../TaskContext'
import { getWrongImmunity } from '../petBonuses'
import { ClassicBracket } from './TournamentWaitScreen'

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

const NL_MIN = -20, NL_MAX = 20
function toPercent(n) { return ((n - NL_MIN) / (NL_MAX - NL_MIN)) * 100 }

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

// ─── Number line (katak) ───────────────────────────────────────────────────────
function KatakNumberLine({ start, myPos, oppPos, myAnswered, myCorrect }) {
  return (
    <div style={{ padding: '0 4px' }}>
      <svg width="100%" viewBox="0 0 260 80" style={{ overflow: 'visible', display: 'block' }}>
        <rect x="0" y="50" width="260" height="30" rx="4" fill="rgba(14,116,144,0.12)" />
        {[25,60,95,130,165,200,235].map((x,i) => <ellipse key={i} cx={x} cy="60" rx="13" ry="4" fill="none" stroke="rgba(103,232,249,0.1)" strokeWidth="1" />)}
        {[18,50,80,110,140,170,200,230].map((x,i) => <ellipse key={i} cx={x} cy="52" rx="16" ry="7" fill="#0a1f2e" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />)}
        <line x1="15" y1="70" x2="245" y2="70" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
        {[NL_MIN,-10,0,10,NL_MAX].map((n,i) => <text key={i} x={15+(n-NL_MIN)/(NL_MAX-NL_MIN)*230} y="78" textAnchor="middle" fill="rgba(103,232,249,0.35)" fontSize="7">{n}</text>)}
        <rect x={15+toPercent(start)/100*230-1.5} y="48" width="3" height="22" fill="#67E8F9" rx="1.5" opacity="0.5" />
        {oppPos !== null && <text x={15+toPercent(oppPos)/100*230} y="43" textAnchor="middle" fontSize="16" opacity={0.5} style={{ filter:'saturate(0.4)', transition:'x 0.15s' }}>🔥</text>}
        <text x={15+toPercent(myPos)/100*230} y="43" textAnchor="middle" fontSize="18" style={{ transition:'x 0.1s' }}>🐸</text>
        {myAnswered && <text x={15+toPercent(myPos)/100*230} y="30" textAnchor="middle" fontSize="14">{myCorrect?'✅':'❌'}</text>}
      </svg>
    </div>
  )
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ myName, oppName, myScore, oppScore, round, maxRounds, isKelompok, myTeamName, oppTeamName }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1A1D27', borderRadius:16, padding:'12px 16px', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:70 }}>
        {isKelompok && myTeamName && <div style={{ fontSize:9, color:'#67E8F9', fontWeight:800, letterSpacing:0.5, marginBottom:2 }}>{myTeamName}</div>}
        <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>KAMU</div>
        <div style={{ fontSize:12, color:'#fff', fontWeight:500, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{myName}</div>
        <div style={{ fontSize:36, fontWeight:900, color:'#67E8F9', lineHeight:1, marginTop:4 }}>{myScore}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:11, color:'#475569', fontWeight:700, letterSpacing:1 }}>SOAL</div>
        <div style={{ fontSize:18, color:'#fff', fontWeight:800, marginTop:4 }}>{round}/{maxRounds}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:70 }}>
        {isKelompok && oppTeamName && <div style={{ fontSize:9, color:'#f59e0b', fontWeight:800, letterSpacing:0.5, marginBottom:2 }}>{oppTeamName}</div>}
        <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>LAWAN</div>
        <div style={{ fontSize:12, color:'#fff', fontWeight:500, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{oppName}</div>
        <div style={{ fontSize:36, fontWeight:900, color:'#f59e0b', lineHeight:1, marginTop:4 }}>{oppScore}</div>
      </div>
    </div>
  )
}

// ─── Juru Jawab Selection Screen (kelompok mode) ──────────────────────────────
function JuruJawabSelectScreen({ myUserId, myName, teamName, teamMembers, juruJawab, onClaim, tournamentId, matchId, goBack }) {
  const [claimed, setClaimed] = useState(false)
  const myJuru = juruJawab?.some(j => String(j.userId) === String(myUserId))
  const anyJuru = juruJawab?.length > 0

  const handleClaim = () => {
    if (claimed || anyJuru) return
    setClaimed(true)
    getSocket()?.emit('tournament:claim-juru-jawab', { tournamentId, matchId })
    onClaim?.()
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily:'system-ui,sans-serif', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:24 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ fontSize:48, lineHeight:1 }}>🧑‍⚖️</div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:11, color:'#a78bfa', fontWeight:800, letterSpacing:1.5, marginBottom:8 }}>PILIH JURU JAWAB</div>
        <div style={{ fontSize:20, fontWeight:900 }}>{teamName}</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginTop:4 }}>Siapa yang akan menjawab soal untuk tim ini?</div>
      </div>

      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'16px', width:'100%', maxWidth:340 }}>
        <div style={{ fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:1.5, marginBottom:12 }}>ANGGOTA TIM</div>
        {teamMembers?.map(member => {
          const isJuru = juruJawab?.some(j => String(j.userId) === String(member.userId))
          const isMe = String(member.userId) === String(myUserId)
          return (
            <div key={member.userId} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:4, background: isJuru ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)', border:`1px solid ${isJuru ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.05)'}`, borderRadius:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: isJuru ? '#a78bfa' : '#334155', flexShrink:0 }} />
              <div style={{ flex:1, fontSize:13, fontWeight: isMe ? 800 : 500, color: isMe ? '#67E8F9' : '#fff' }}>
                {member.name}{isMe ? ' (Kamu)' : ''}
              </div>
              {isJuru && <div style={{ fontSize:11, color:'#a78bfa', fontWeight:800 }}>🎤 Juru Jawab</div>}
            </div>
          )
        })}
      </div>

      {!anyJuru ? (
        <button onClick={handleClaim} disabled={claimed} style={{ width:'100%', maxWidth:340, background: claimed ? '#1e293b' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none', borderRadius:14, padding:'16px', color:'#fff', fontSize:15, fontWeight:800, cursor: claimed ? 'not-allowed' : 'pointer', fontFamily:'inherit', opacity: claimed ? 0.6 : 1 }}>
          {claimed ? 'Menunggu konfirmasi…' : '🎤 Saya Jadi Juru Jawab!'}
        </button>
      ) : (
        <div style={{ textAlign:'center', padding:'12px 20px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)', borderRadius:12, maxWidth:340, width:'100%' }}>
          <div style={{ fontSize:13, color:'#a78bfa', fontWeight:700 }}>
            {myJuru ? '✅ Kamu jadi juru jawab! Bersiap…' : `⏳ ${juruJawab?.[0]?.name ?? '...'} jadi juru jawab. Kamu menonton.`}
          </div>
        </div>
      )}

      <div style={{ fontSize:12, color:'#334155', textAlign:'center', maxWidth:300 }}>
        Jika tidak ada yang memilih dalam 30 detik, sistem akan memilih otomatis.
      </div>

      <button onClick={goBack} style={{ background:'transparent', border:'none', color:'#334155', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>← Batalkan</button>
    </div>
  )
}

// ─── Leaderboard Wait Screen ──────────────────────────────────────────────────
function BracketWaitingCard({ bracketState, myUserId, title = 'BRACKET TURNAMEN' }) {
  if (!bracketState?.rounds?.length) return null

  return (
    <div style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'14px 10px', boxSizing:'border-box' }}>
      <div style={{ fontSize:10, color:'#67E8F9', fontWeight:800, letterSpacing:1, marginBottom:10, textAlign:'left' }}>{title}</div>
      <ClassicBracket
        rounds={bracketState.rounds}
        myUserId={myUserId}
        currentRound={bracketState.currentRound}
        mode={bracketState.mode}
      />
    </div>
  )
}

function LeaderboardWaitScreen({ myScore, myName, oppScore, oppName, round, onLeave, onViewBracket, bracketState, myUserId, isKelompok, myTeamName, oppTeamName }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily:'system-ui,sans-serif', color:'#fff', display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <style>{`@keyframes tLbBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}}`}</style>
      <div style={{ flex:1, width:'100%', maxWidth:600, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, boxSizing:'border-box', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:56, lineHeight:1 }}>🏁</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#67E8F9', textAlign:'center' }}>Tim Kamu Sudah Menjawab!</div>
          {round && oppName && <div style={{ fontSize:13, color:'#94A3B8', fontWeight:500 }}>Ronde {round} — vs {isKelompok ? oppTeamName : oppName}</div>}
        </div>
        <div style={{ background:'#1A1D27', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'24px 20px', width:'100%', boxSizing:'border-box', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:28 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
            {isKelompok && myTeamName && <div style={{ fontSize:10, color:'#67E8F9', fontWeight:800, marginBottom:2 }}>{myTeamName}</div>}
            <div style={{ fontSize:11, fontWeight:800, color:'#67E8F9', letterSpacing:0.5, marginBottom:4 }}>TIM KAMU</div>
            <div style={{ fontSize:14, color:'#fff', fontWeight:600, marginBottom:12 }}>{myName}</div>
            <div style={{ fontSize:40, fontWeight:900, color:'#67E8F9', lineHeight:1 }}>{myScore}</div>
            <div style={{ fontSize:11, color:'#94A3B8', marginTop:6, fontWeight:500 }}>soal benar</div>
          </div>
          <div style={{ fontSize:20, fontWeight:900, color:'#f59e0b', fontStyle:'italic', opacity:0.9 }}>VS</div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
            {isKelompok && oppTeamName && <div style={{ fontSize:10, color:'#f59e0b', fontWeight:800, marginBottom:2 }}>{oppTeamName}</div>}
            <div style={{ fontSize:11, fontWeight:800, color:'#f59e0b', letterSpacing:0.5, marginBottom:4 }}>TIM LAWAN</div>
            <div style={{ fontSize:14, color:'#fff', fontWeight:600, marginBottom:12 }}>{oppName}</div>
            <div style={{ fontSize:40, fontWeight:900, color:'#f59e0b', lineHeight:1 }}>{oppScore}</div>
            <div style={{ fontSize:11, color:'#94A3B8', marginTop:6, fontWeight:500 }}>soal benar</div>
          </div>
        </div>
        <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:'14px 16px', width:'100%', boxSizing:'border-box', display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ fontSize:13, color:'#f59e0b', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
            <span>⏳ Menunggu tim lain selesai menjawab</span>
            <span style={{ display:'flex', gap:2 }}>
              {['-0.32s','-0.16s','0s'].map((d,i) => <span key={i} style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:'#f59e0b', animation:`tLbBounce 1.4s ${d} infinite ease-in-out` }} />)}
            </span>
          </div>
        </div>
        <BracketWaitingCard bracketState={bracketState} myUserId={myUserId} title="BRACKET — MENUNGGU MATCH LAIN" />
        {onViewBracket && (
          <button onClick={onViewBracket} style={{ background:'#0e7490', border:'none', borderRadius:14, padding:'14px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', width:'100%', maxWidth:300, display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
            🏆 Lihat Bracket Turnamen
          </button>
        )}
        <button onClick={onLeave} style={{ background:'transparent', border:'none', color:'#475569', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>← Keluar Turnamen</button>
      </div>
    </div>
  )
}

// ─── Match Over Screen ─────────────────────────────────────────────────────────
function MatchOverScreen({ winner, scores, myUserId, myName, oppName, onLeave, bracketState, isKelompok, myTeamName, oppTeamName, myTeamRepId }) {
  const iWon = winner?.userId === myUserId || (isKelompok && winner?.teamId && myTeamRepId)
  // For kelompok: determine if my team won by checking winner's teamId against my rep
  const myScore  = isKelompok && myTeamRepId ? (scores[myTeamRepId] ?? 0) : (scores[myUserId] ?? 0)
  const oppScore = Object.entries(scores).find(([id]) => id !== String(isKelompok && myTeamRepId ? myTeamRepId : myUserId))?.[1] ?? 0

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:20, fontFamily:'system-ui,sans-serif', color:'#fff', overflowY:'auto' }}>
      <div style={{ fontSize:72 }}>{iWon ? '🏆' : '😤'}</div>
      <div style={{ fontSize:26, fontWeight:900, color: iWon ? '#fbbf24' : '#f87171', textAlign:'center' }}>
        {iWon ? (isKelompok ? `${myTeamName || 'Tim Kamu'} Menang!` : 'Kamu Menang!') : `${winner?.teamName || winner?.name} Menang!`}
      </div>
      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 32px', display:'flex', gap:32, alignItems:'center' }}>
        <div style={{ textAlign:'center' }}>
          {isKelompok && myTeamName && <div style={{ fontSize:10, color:'#67E8F9', fontWeight:800, marginBottom:2 }}>{myTeamName}</div>}
          <div style={{ fontSize:11, color:'#67E8F9', fontWeight:700, marginBottom:4 }}>KAMU</div>
          <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>{myName}</div>
          <div style={{ fontSize:36, fontWeight:900, color:'#67E8F9' }}>{myScore}</div>
        </div>
        <div style={{ fontSize:20, color:'#f59e0b', fontWeight:900 }}>VS</div>
        <div style={{ textAlign:'center' }}>
          {isKelompok && oppTeamName && <div style={{ fontSize:10, color:'#f59e0b', fontWeight:800, marginBottom:2 }}>{oppTeamName}</div>}
          <div style={{ fontSize:11, color:'#f59e0b', fontWeight:700, marginBottom:4 }}>LAWAN</div>
          <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>{oppName}</div>
          <div style={{ fontSize:36, fontWeight:900, color:'#f59e0b' }}>{oppScore}</div>
        </div>
      </div>
      {iWon && <div style={{ fontSize:13, color:'#94A3B8', textAlign:'center' }}>Menunggu ronde berikutnya…</div>}
      <BracketWaitingCard bracketState={bracketState} myUserId={myUserId} title="BRACKET — MENUNGGU RONDE BERIKUTNYA" />
      <button onClick={onLeave} style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'14px 32px', color:'#94A3B8', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>← Keluar Turnamen</button>
    </div>
  )
}

// ─── Main TournamentMatchScreen ───────────────────────────────────────────────
export default function TournamentMatchScreen({
  tournamentId, matchId, opponent, gameKey, round: initRound,
  myUserId, myName,
  goBack, onMatchOver,
  // Kelompok-specific props
  isKelompok, teamId, teamName, teamRepUserId, myTeamMembers,
}) {
  const isMd = useIsMd()
  const { user } = useAuth()
  const { activeSession } = useTask()

  const [question,      setQuestion]      = useState(null)
  const [round,         setRound]         = useState(initRound || 1)
  const [maxRounds,     setMaxRounds]     = useState(7)
  const [scores,        setScores]        = useState({})
  const [slider,        setSlider]        = useState(0)
  const [oppSlider,     setOppSlider]     = useState(null)
  const [juruSlider,    setJuruSlider]    = useState(null)  // kelompok: juru jawab's slider (for non-juru)
  const [myAnswered,    setMyAnswered]    = useState(false)
  const [myCorrect,     setMyCorrect]     = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)

  // Nananaga immunity
  const immunityLeft = useRef(!activeSession && user?.equippedPetSkin ? getWrongImmunity(user.equippedPetSkin) : 0)
  const activeSessionRef = useRef(activeSession)
  const isJuruJawabRef = useRef(false)
  useEffect(() => { activeSessionRef.current = activeSession }, [activeSession])

  // Kelompok juru jawab state
  const [juruJawabList,   setJuruJawabList]   = useState([]) // [{teamId, userId, name}]
  const [waitingOtherTeam, setWaitingOtherTeam] = useState(false)
  const [teamAnswerResult, setTeamAnswerResult] = useState(null) // {teamId, correct, correctAnswer}

  // Determine if I am juru jawab (after selection)
  const myJuruJawabEntry = juruJawabList.find(j => j.teamId === teamId)
  const isJuruJawab = myJuruJawabEntry ? String(myJuruJawabEntry.userId) === String(myUserId) : false
  useEffect(() => { isJuruJawabRef.current = isJuruJawab }, [isJuruJawab])

  // phase: 'waiting' | 'juru-select' | 'playing' | 'result' | 'leaderboard' | 'match-over'
  const [phase, setPhase] = useState('waiting')
  const [matchResult,     setMatchResult]     = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [bracketState,    setBracketState]    = useState(null)

  const MATCH_TIMER_SECONDS = 30
  const [timeLeft, setTimeLeft] = useState(MATCH_TIMER_SECONDS)
  const timerIntervalRef = useRef(null)
  const sliderThrottle   = useRef(null)
  const matchIdRef       = useRef(matchId)
  const tournIdRef       = useRef(tournamentId)

  // ── Emit player-ready on mount ───────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()
    // Soal baru datang
    const handleQuestion = ({ question: q, round: r, maxRounds: mr, scores: s, isKelompok: ik, teamJuruJawab: tjj }) => {
      setQuestion(q)
      setRound(r)
      setMaxRounds(mr)
      setScores(s || {})
      setSlider(q.question?.start ?? q.start ?? 0)
      setJuruSlider(null)
      setOppSlider(null)
      setMyAnswered(false)
      setMyCorrect(null)
      setCorrectAnswer(null)
      setWaitingOtherTeam(false)
      setTeamAnswerResult(null)
      setPhase('playing')
      setTimeLeft(MATCH_TIMER_SECONDS)
      // Sync juru jawab from question payload
      if (ik && tjj) {
        const list = Object.entries(tjj).map(([tid, uid]) => ({ teamId: tid, userId: uid }))
        setJuruJawabList(list)
      }
    }
    socket.on('tournament:question', handleQuestion)

    // Juru jawab dipilih (kelompok)
    socket.on('tournament:juru-jawab-set', ({ teamId: tid, userId, name, autoSelected }) => {
      setJuruJawabList(prev => {
        const exists = prev.find(j => j.teamId === tid)
        if (exists) return prev.map(j => j.teamId === tid ? { ...j, userId, name } : j)
        return [...prev, { teamId: tid, userId, name }]
      })
      // If both teams now have juru jawab in kelompok, game will start → phase stays waiting until question arrives
    })

    // Anggota tim join
    socket.on('tournament:team-member-joined', ({ userId, name, teamId: tid }) => {
      // Trigger juru-select phase for kelompok when someone joins the match room
      if (isKelompok) {
        setPhase(prev => prev === 'waiting' ? 'juru-select' : prev)
      }
    })

    // Hasil jawaban tim (kelompok)
    socket.on('tournament:team-answer-result', ({ teamId: tid, correct, correctAnswer: ans, scores: s }) => {
      setScores(s || {})
       if (tid === teamId && !correct && immunityLeft.current > 0 && !activeSessionRef.current && isJuruJawabRef.current) {
         getSocket()?.emit(
           'tournament:use-immunity',
           { tournamentId: tournIdRef.current, matchId: matchIdRef.current },
           ({ ok, tokensLeft } = {}) => {
             if (!ok) {
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
             setMyAnswered(false)
             setMyCorrect(null)
             setCorrectAnswer(null)
             setPhase('playing')
           },
         )
         return
       }
      setTeamAnswerResult({ teamId: tid, correct, correctAnswer: ans })
      if (tid === teamId) {
        setMyAnswered(true)
        setMyCorrect(correct)
        setCorrectAnswer(ans)
        setPhase('result')
      }
    })

    // Menunggu tim lain menjawab
    socket.on('tournament:waiting-other-team', ({ answeredTeamId, scores: s }) => {
      setScores(s || {})
      if (answeredTeamId === teamId) setWaitingOtherTeam(true)
    })

    // Hasil jawaban individual
    socket.on('tournament:answer-result', ({ correct, correctAnswer: ans, yourValue, scores: s }) => {
      if (!correct && immunityLeft.current > 0 && !activeSessionRef.current) {
        getSocket()?.emit(
          'tournament:use-immunity',
          { tournamentId: tournIdRef.current, matchId: matchIdRef.current },
          ({ ok, tokensLeft } = {}) => {
            if (!ok) {
              setMyAnswered(true)
              setMyCorrect(false)
              setCorrectAnswer(ans)
              setScores(s || {})
              setPhase('result')
              return
            }
            immunityLeft.current = tokensLeft
            window.dispatchEvent(new CustomEvent('nananaga-shield', {
              detail: { tokensLeft },
            }))
            setScores(s || {})
            setMyAnswered(false)
          },
        )
        return
      }
      setMyAnswered(true)
      setMyCorrect(correct)
      setCorrectAnswer(ans)
      setScores(s || {})
      setPhase('result')
    })

    socket.on('tournament:score-update', ({ opponentScore }) => {
      setScores(prev => {
        const oppEntry = Object.entries(prev).find(([id]) => id !== String(myUserId))
        if (!oppEntry) return prev
        return { ...prev, [oppEntry[0]]: opponentScore }
      })
      setLeaderboardData(prev => prev ? { ...prev, oppScore: opponentScore } : prev)
    })

    socket.on('tournament:self-finished', ({ scores: finalScores }) => {
      const myScore  = isKelompok && teamRepUserId ? (finalScores[teamRepUserId] ?? 0) : (finalScores[myUserId] ?? 0)
      const oppEntry = Object.entries(finalScores).find(([id]) => id !== String(isKelompok && teamRepUserId ? teamRepUserId : myUserId))
      setLeaderboardData({ myScore, myName, oppScore: oppEntry?.[1] ?? 0, oppName: opponent?.teamName || opponent?.name })
      setScores(finalScores)
      setPhase('leaderboard')
      getSocket()?.emit('tournament:spectate', { tournamentId: tournIdRef.current })
    })

    socket.on('tournament:state', (state) => {
      if (state?.id === tournIdRef.current) setBracketState(state)
    })

    socket.on('tournament:match-over', ({ winner, scores: s, matchId: mid }) => {
      if (mid !== matchIdRef.current) return
      setMatchResult({ winner, scores: s || {} })
      setPhase('match-over')
    })

    // Slider posisi dari juru jawab (untuk anggota non-juru)
    socket.on('tournament:team-slider-update', ({ userId, value }) => {
      setJuruSlider(value)
    })

    // Slider lawan dari spectator
    socket.on('tournament:opponent-slider', ({ userId, value }) => {
      if (userId !== myUserId) setOppSlider(value)
    })

    // Untuk kelompok: langsung masuk juru-select saat mount (saat player ready, server akan emit team-member-joined)
    if (isKelompok) {
      setPhase('juru-select')
    }

    // Announce readiness only after all listeners are active. The second
    // player can cause the server to emit the first question immediately.
    socket.emit('tournament:player-ready', {
      tournamentId: tournIdRef.current,
      matchId:      matchIdRef.current,
    })

    return () => {
      socket.off('tournament:question', handleQuestion)
      socket.off('tournament:juru-jawab-set')
      socket.off('tournament:team-member-joined')
      socket.off('tournament:team-answer-result')
      socket.off('tournament:waiting-other-team')
      socket.off('tournament:answer-result')
      socket.off('tournament:score-update')
      socket.off('tournament:self-finished')
      socket.off('tournament:state')
      socket.off('tournament:match-over')
      socket.off('tournament:team-slider-update')
      socket.off('tournament:opponent-slider')
    }
  }, [myUserId, myName, isKelompok, teamId, teamRepUserId])

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; return }
    timerIntervalRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null }
  }, [phase])

  const submitAnswer = useCallback(() => {
    if (myAnswered || phase !== 'playing') return
    if (isKelompok && !isJuruJawab) return  // non-juru tidak bisa submit
    getSocket()?.emit('tournament:answer', {
      tournamentId: tournIdRef.current,
      matchId:      matchIdRef.current,
      value:        slider,
    })
  }, [myAnswered, phase, slider, isKelompok, isJuruJawab])

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing' && !myAnswered) {
      if (!isKelompok || isJuruJawab) submitAnswer()
    }
  }, [timeLeft, phase, myAnswered, submitAnswer, isKelompok, isJuruJawab])

  const emitSlider = useCallback((val) => {
    if (sliderThrottle.current) return
    sliderThrottle.current = setTimeout(() => { sliderThrottle.current = null }, 80)
    if (isKelompok) {
      // Juru jawab: broadcast ke tim
      getSocket()?.emit('tournament:team-slider', { tournamentId: tournIdRef.current, matchId: matchIdRef.current, value: val })
    } else {
      getSocket()?.emit('tournament:slider-move', { matchId: matchIdRef.current, value: val })
    }
  }, [isKelompok])

  const handleSlider = useCallback((val) => {
    setSlider(val)
    emitSlider(val)
  }, [emitSlider])

  // ── Juru jawab selection phase (kelompok) ────────────────────────────────
  if (phase === 'juru-select' && isKelompok) {
    return (
      <JuruJawabSelectScreen
        myUserId={myUserId}
        myName={myName}
        teamName={teamName}
        teamMembers={myTeamMembers}
        juruJawab={juruJawabList.filter(j => j.teamId === teamId)}
        onClaim={() => {}}
        tournamentId={tournamentId}
        matchId={matchId}
        goBack={goBack}
      />
    )
  }

  // ── Waiting screen ──────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, fontFamily:'system-ui,sans-serif', color:'#fff' }}>
        <div style={{ fontSize:48 }}>⚔️</div>
        <div style={{ fontSize:20, fontWeight:900, color:'#f59e0b' }}>Memasuki Arena…</div>
        <div style={{ fontSize:13, color:'#94A3B8' }}>vs {opponent?.teamName || opponent?.name} — Menunggu lawan siap</div>
        <div style={{ display:'flex', gap:6, marginTop:8 }}>
          {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
        </div>
        <button onClick={goBack} style={{ marginTop:16, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 24px', color:'#475569', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Batal</button>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      </div>
    )
  }

  // ── Leaderboard ─────────────────────────────────────────────────────────
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
        myUserId={myUserId}
        isKelompok={isKelompok}
        myTeamName={teamName}
        oppTeamName={opponent?.teamName || opponent?.name}
      />
    )
  }

  // ── Match over ───────────────────────────────────────────────────────────
  if (phase === 'match-over' && matchResult) {
    return (
      <MatchOverScreen
        winner={matchResult.winner}
        scores={matchResult.scores}
        myUserId={myUserId}
        myName={myName}
        oppName={opponent?.teamName || opponent?.name}
        onLeave={onMatchOver}
        bracketState={bracketState}
        isKelompok={isKelompok}
        myTeamName={teamName}
        oppTeamName={opponent?.teamName || opponent?.name}
        myTeamRepId={teamRepUserId}
      />
    )
  }

  // ── Main game ────────────────────────────────────────────────────────────
  const q = question?.question || question || {}
  const start   = q.start  ?? 0
  const jump    = q.jump   ?? 0
  const isForward = q.isForward ?? true
  const sliderMin = question?.sliderMin ?? NL_MIN
  const sliderMax = question?.sliderMax ?? NL_MAX

  const myScore  = isKelompok && teamRepUserId ? (scores[teamRepUserId] ?? 0) : (scores[myUserId] ?? 0)
  const oppScore = Object.entries(scores).find(([id]) => id !== String(isKelompok && teamRepUserId ? teamRepUserId : myUserId))?.[1] ?? 0

  // For kelompok, show juru jawab's slider position to non-juru members
  const displaySlider = isKelompok && !isJuruJawab && juruSlider !== null ? juruSlider : slider
  const canInteract = !myAnswered && phase === 'playing' && (!isKelompok || isJuruJawab)

  // Kelompok: show which team has already answered this question
  const myTeamAnswered = isKelompok ? (teamAnswerResult?.teamId === teamId) : false
  const oppTeamAnswered = isKelompok ? (teamAnswerResult && teamAnswerResult.teamId !== teamId) : false

  const questionPanel = (
    <div style={{ background:'#1A1D27', border:`1.5px solid ${phase === 'result' ? (myCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(103,232,249,0.25)'}`, borderRadius:20, padding:16 }}>
      {/* Kelompok role badge */}
      {isKelompok && (
        <div style={{ marginBottom:10, display:'flex', justifyContent:'center' }}>
          <div style={{ padding:'4px 14px', borderRadius:20, background: isJuruJawab ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${isJuruJawab ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`, fontSize:11, fontWeight:700, color: isJuruJawab ? '#a78bfa' : '#64748B' }}>
            {isJuruJawab ? '🎤 Juru Jawab — kamu yang menjawab' : '👥 Penonton — juru jawab yang menjawab'}
          </div>
        </div>
      )}
      {gameKey === 'katak' && (
        <KatakNumberLine
          start={start}
          myPos={displaySlider}
          oppPos={isMd ? null : oppSlider}
          myAnswered={myAnswered}
          myCorrect={myCorrect}
        />
      )}
      {phase === 'playing' && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background: timeLeft <= 10 ? 'rgba(239,68,68,0.15)' : 'rgba(103,232,249,0.08)', border:`2.5px solid ${timeLeft <= 10 ? '#ef4444' : '#67E8F9'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color: timeLeft <= 10 ? '#ef4444' : '#67E8F9', transition:'border-color 0.3s,color 0.3s,background 0.3s', boxShadow: timeLeft <= 5 ? '0 0 12px rgba(239,68,68,0.4)' : 'none' }}>{timeLeft}</div>
        </div>
      )}
      <div style={{ textAlign:'center', marginTop: gameKey === 'katak' ? 8 : 0, marginBottom:16 }}>
        {gameKey === 'katak' ? (
          <div style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6 }}>
            Katak di batu <strong style={{ color:'#67E8F9' }}>{start}</strong>, melompat {isForward ? '⮕ maju' : '⬅ mundur'} <strong style={{ color:'#f59e0b' }}>{jump} batu</strong>. {isJuruJawab || !isKelompok ? 'Geser katak ke posisi akhir!' : 'Juru jawab akan menggeser katak.'}
          </div>
        ) : (
          <div style={{ fontSize:14, color:'#fff', lineHeight:1.7, fontWeight:700, padding:'8px 4px' }}>{q.text || ''}</div>
        )}
      </div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
        <div style={{ background:'rgba(103,232,249,0.1)', border:'1px solid rgba(103,232,249,0.4)', color:'#67E8F9', padding:'8px 24px', borderRadius:12, fontSize:28, fontWeight:900, boxShadow:'0 0 16px rgba(103,232,249,0.15)' }}>{displaySlider}</div>
      </div>
      <div style={{ width:'100%', padding:'0 10px', boxSizing:'border-box' }}>
        <input
          type="range" min={sliderMin} max={sliderMax} step={1} value={displaySlider}
          onChange={e => canInteract && handleSlider(parseInt(e.target.value, 10))}
          disabled={!canInteract}
          style={{ width:'100%', accentColor:'#67E8F9', height:6, opacity: !canInteract ? 0.4 : 1, cursor: !canInteract ? 'not-allowed' : 'pointer' }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', color:'#94A3B8', fontSize:13, fontWeight:600, marginTop:12 }}>
          {[sliderMin, Math.round((sliderMin+sliderMax)/2), sliderMax].map(n => <span key={n}>{n}</span>)}
        </div>
      </div>
      {canInteract && (
        <button onClick={submitAnswer} style={{ width:'100%', background:'#0e7490', border:'none', borderRadius:14, padding:'16px', color:'#fff', fontSize:16, fontWeight:'bold', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(14,116,144,0.3)', marginTop:8 }}>
          ✅ Konfirmasi Jawaban: {slider}
        </button>
      )}
      {isKelompok && !isJuruJawab && phase === 'playing' && (
        <div style={{ marginTop:8, padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:10, textAlign:'center', fontSize:12, color:'#64748B' }}>
          ⏳ Menunggu juru jawab ({myJuruJawabEntry?.name ?? '...'}) menjawab…
        </div>
      )}
      {/* Kelompok: tampilkan status jawaban kedua tim */}
      {isKelompok && (myTeamAnswered || oppTeamAnswered) && phase === 'result' && (
        <div style={{ marginTop:8, display:'flex', gap:8 }}>
          {myTeamAnswered && (
            <div style={{ flex:1, padding:'8px', background: teamAnswerResult?.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${teamAnswerResult?.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius:8, textAlign:'center', fontSize:11, fontWeight:700, color: teamAnswerResult?.correct ? '#10b981' : '#f87171' }}>
              {teamName}: {teamAnswerResult?.correct ? '✅ Benar' : `❌ Salah (jwb: ${teamAnswerResult?.correctAnswer})`}
            </div>
          )}
          {waitingOtherTeam && (
            <div style={{ flex:1, padding:'8px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, textAlign:'center', fontSize:11, color:'#f59e0b' }}>
              ⏳ Menunggu tim lain…
            </div>
          )}
        </div>
      )}
    </div>
  )

  const opponentPanel = (
    <div style={{ background:'#1A1D27', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ fontSize:11, color:'#f59e0b', fontWeight:700, letterSpacing:1 }}>🔥 LAWAN — {opponent?.teamName || opponent?.name}</div>
      {gameKey === 'katak' && (
        <KatakNumberLine start={start} myPos={oppSlider ?? start} oppPos={null} myAnswered={false} myCorrect={null} />
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:'#67E8F9', fontWeight:700 }}>Kamu</span>
            <span style={{ fontSize:11, color:'#67E8F9', fontWeight:800 }}>{myScore} benar</span>
          </div>
          <div style={{ height:8, background:'rgba(103,232,249,0.1)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${maxRounds > 0 ? (myScore / maxRounds) * 100 : 0}%`, height:'100%', background:'#67E8F9', borderRadius:4, transition:'width 0.3s' }} />
          </div>
        </div>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>Lawan</span>
            <span style={{ fontSize:11, color:'#f59e0b', fontWeight:800 }}>{oppScore} benar</span>
          </div>
          <div style={{ height:8, background:'rgba(245,158,11,0.1)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${maxRounds > 0 ? (oppScore / maxRounds) * 100 : 0}%`, height:'100%', background:'#f59e0b', borderRadius:4, transition:'width 0.3s' }} />
          </div>
        </div>
      </div>
      {phase === 'result' && (
        <div style={{ background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border:`1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius:12, padding:'12px', textAlign:'center' }}>
          <div style={{ fontSize:24 }}>{myCorrect ? '✅' : '❌'}</div>
          <div style={{ fontSize:13, fontWeight:700, color: myCorrect ? '#10b981' : '#f87171', marginTop:4 }}>
            {myCorrect ? 'Benar!' : `Jawaban: ${correctAnswer}`}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily:'system-ui,sans-serif', color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={goBack} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'5px 10px', color:'#94A3B8', fontSize:12, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#f59e0b' }}>🏆 Ronde {round} Turnamen{isKelompok ? ` — ${teamName}` : ''}</div>
          <div style={{ fontSize:11, color:'#94A3B8' }}>{GAME_LABELS[gameKey] || gameKey} • vs {opponent?.teamName || opponent?.name}</div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {Array.from({ length: maxRounds }, (_, i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:'50%', background: i < round - 1 ? '#10b981' : i === round - 1 ? '#67E8F9' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      {isMd ? (
        <div style={{ padding:'16px 24px 40px', maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>
          <ScoreBar myName={myName} oppName={opponent?.teamName || opponent?.name} myScore={myScore} oppScore={oppScore} round={round} maxRounds={maxRounds} isKelompok={isKelompok} myTeamName={teamName} oppTeamName={opponent?.teamName || opponent?.name} />
          <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>{questionPanel}</div>
            <div style={{ flex:1 }}>{opponentPanel}</div>
          </div>
          {phase === 'result' && (
            <div style={{ background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border:`1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:800, color: myCorrect ? '#10b981' : '#f87171' }}>{myCorrect ? '✅ Benar!' : `❌ Salah! Jawaban: ${correctAnswer}`}</div>
              <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>Soal berikutnya sebentar lagi…</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding:'12px 16px 40px', display:'flex', flexDirection:'column', gap:12, maxWidth:480, margin:'0 auto' }}>
          <ScoreBar myName={myName} oppName={opponent?.teamName || opponent?.name} myScore={myScore} oppScore={oppScore} round={round} maxRounds={maxRounds} isKelompok={isKelompok} myTeamName={teamName} oppTeamName={opponent?.teamName || opponent?.name} />
          {questionPanel}
          {phase === 'result' && (
            <div style={{ background: myCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border:`1px solid ${myCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:800, color: myCorrect ? '#10b981' : '#f87171' }}>{myCorrect ? '✅ Benar!' : `❌ Salah! Jawaban: ${correctAnswer}`}</div>
              <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>Soal berikutnya sebentar lagi…</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
