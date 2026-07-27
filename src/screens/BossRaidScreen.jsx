import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TopBar } from '../components/shared'
import { useAuth } from '../AuthContext'
import { connectSocket } from '../socket'

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

const DAMAGE_PER_HIT = 100
const COOLDOWN_SEC   = 60

// ── HP Bar ─────────────────────────────────────────────────────────────────────
function HPBar({ hp, maxHp }) {
  const pct   = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }}>HP BOS</span>
        <span style={{ fontSize: 13, fontWeight: 900, color }}>{hp.toLocaleString()} / {maxHp.toLocaleString()}</span>
      </div>
      <div style={{ height: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 12,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1), background 0.5s ease',
          boxShadow: `0 0 16px ${color}55`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)',
            animation: 'shimmer 2s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Participant Row ─────────────────────────────────────────────────────────────
function ParticipantRow({ p, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ width: 26, textAlign: 'center', fontSize: rank < 3 ? 18 : 12, color: '#94A3B8', fontWeight: 700, flexShrink: 0 }}>
        {rank < 3 ? medals[rank] : `${rank + 1}`}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontSize: 11, color: '#64748B' }}>{p.hits} serangan · -{p.damage} HP</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>⚔️ ×{p.hits}</div>
    </div>
  )
}

// ── Slider ─────────────────────────────────────────────────────────────────────
function SliderInput({ min, max, value, onChange }) {
  return (
    <div>
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#ef4444', height: 6, cursor: 'pointer' }}
      />
      <div style={{
        textAlign: 'center', marginTop: 10, fontSize: 40, fontWeight: 900,
        color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.3)',
      }}>{value}</div>
    </div>
  )
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function BossRaidScreen({ goBack }) {
  const { user } = useAuth()
  const isMd = useIsMd()

  const [raid,        setRaid]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [phase,       setPhase]       = useState('battle')  // battle | question | result | defeated
  const [question,    setQuestion]    = useState(null)
  const [sliderVal,   setSliderVal]   = useState(0)
  const [attackResult, setAttackResult] = useState(null)
  const [cooldownSec, setCooldownSec] = useState(0)
  const [floatingDmg, setFloatingDmg] = useState([])
  const [defeatReward, setDefeatReward] = useState(null)  // { rewardType, rewardAmount, rewardedCount }

  const cooldownRef = useRef(null)
  const dmgIdRef    = useRef(0)

  // ── cooldown ticker ──────────────────────────────────────────────────────────
  const startCooldown = useCallback((secs) => {
    setCooldownSec(secs)
    clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldownSec(s => {
        if (s <= 1) { clearInterval(cooldownRef.current); return 0 }
        return s - 1
      })
    }, 1000)
  }, [])

  // ── floating damage numbers ──────────────────────────────────────────────────
  const spawnFloat = useCallback((text, ok) => {
    const id = ++dmgIdRef.current
    setFloatingDmg(prev => [...prev, { id, text, ok }])
    setTimeout(() => setFloatingDmg(prev => prev.filter(f => f.id !== id)), 1600)
  }, [])

  // ── socket + initial REST fetch ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    fetch('/api/siswa/boss-raid', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (mounted) { setRaid(data.raid || null); setLoading(false) } })
      .catch(() => { if (mounted) setLoading(false) })

    const socket = connectSocket()
    socket.emit('boss:join', { kelas: user?.kelas })

    socket.on('boss:state',  (state) => { if (mounted) setRaid(state) })

    socket.on('boss:update', ({ hp, maxHp, attacker, participants }) => {
      if (!mounted) return
      setRaid(prev => prev ? { ...prev, hp, maxHp, participants } : prev)
      if (attacker?.correct) spawnFloat(`⚔️ -${attacker.damage}`, true)
    })

    socket.on('boss:question', ({ question: q }) => {
      if (!mounted) return
      setQuestion(q)
      setSliderVal(0)
      setPhase('question')
    })

    socket.on('boss:attack-result', (result) => {
      if (!mounted) return
      setAttackResult(result)
      setPhase('result')
      if (result.newHp !== undefined) setRaid(prev => prev ? { ...prev, hp: result.newHp } : prev)
      spawnFloat(result.correct ? `💥 -${result.damage} HP!` : '💨 Meleset!', result.correct)
      startCooldown(COOLDOWN_SEC)
    })

    socket.on('boss:defeated', ({ participants, rewardType, rewardAmount, rewardedCount }) => {
      if (!mounted) return
      setRaid(prev => prev ? { ...prev, status: 'defeated', hp: 0, participants } : prev)
      if (rewardType && rewardAmount > 0) {
        setDefeatReward({ rewardType, rewardAmount, rewardedCount })
      }
      setPhase('defeated')
    })

    socket.on('boss:ended', () => {
      if (!mounted) return
      setRaid(null)
    })

    socket.on('boss:error', ({ message, cooldownSec: cs }) => {
      if (!mounted) return
      if (cs) startCooldown(cs)
    })

    return () => {
      mounted = false
      socket.off('boss:state')
      socket.off('boss:update')
      socket.off('boss:question')
      socket.off('boss:attack-result')
      socket.off('boss:defeated')
      socket.off('boss:ended')
      socket.off('boss:error')
      clearInterval(cooldownRef.current)
    }
  }, [user, spawnFloat, startCooldown])

  const handleAttack = () => {
    if (cooldownSec > 0 || !user?.kelas) return
    connectSocket().emit('boss:attack', { kelas: user.kelas })
  }

  const handleAnswer = () => {
    if (!user?.kelas) return
    connectSocket().emit('boss:answer', { kelas: user.kelas, value: sliderVal })
  }

  const dismissResult = () => {
    setPhase('battle')
    setAttackResult(null)
    setQuestion(null)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748B', fontSize: 15 }}>Memuat Boss Raid…</div>
      </div>
    )
  }

  // ── No active raid ────────────────────────────────────────────────────────────
  if (!raid) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14' }}>
        <TopBar title="⚔️ Boss Raid" onBack={goBack} />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 40, gap: 16, minHeight: '65vh',
        }}>
          <div style={{ fontSize: 64 }}>😴</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Tidak Ada Boss Aktif</div>
          <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
            Tunggu gurumu memulai Boss Raid untuk kelasmu!<br/>
            Nanti akan ada banner di halaman zona.
          </div>
          <button onClick={goBack} style={{
            marginTop: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>← Kembali</button>
        </div>
      </div>
    )
  }

  // ── Boss Defeated celebration ─────────────────────────────────────────────────
  if (phase === 'defeated' || raid.status === 'defeated') {
    const topAttackers = [...(raid.participants || [])].sort((a, b) => b.damage - a.damage)
    const rewardLabel = defeatReward
      ? defeatReward.rewardType === 'koin'
        ? `🪙 +${defeatReward.rewardAmount} Koin`
        : defeatReward.rewardType === 'exp'
          ? `⚡ +${defeatReward.rewardAmount} EXP`
          : `🪙 +${defeatReward.rewardAmount} Koin  ⚡ +${defeatReward.rewardAmount} EXP`
      : null
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg,#1a0800 0%,#2d1500 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, gap: 20,
      }}>
        <div style={{ fontSize: 88, animation: 'bossShake 0.4s ease 4', lineHeight: 1 }}>💥</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24', textAlign: 'center', textShadow: '0 0 40px rgba(251,191,36,0.7)' }}>
          BOSS DIKALAHKAN!
        </div>
        <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center' }}>
          {raid.bossName} telah jatuh! Kerja bagus, tim!
        </div>

        {/* Reward banner */}
        {rewardLabel && (
          <div style={{
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)',
            borderRadius: 16, padding: '16px 24px', textAlign: 'center',
            width: '100%', maxWidth: 360,
            boxShadow: '0 0 30px rgba(251,191,36,0.15)',
          }}>
            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>🎁 HADIAH KEMENANGAN</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{rewardLabel}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              sudah ditambahkan ke akun kamu!
            </div>
          </div>
        )}

        {topAttackers.length > 0 && (
          <div style={{
            background: '#111827', borderRadius: 16,
            border: '1px solid rgba(251,191,36,0.3)', padding: '16px 20px',
            width: '100%', maxWidth: 360,
          }}>
            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🏆 PAHLAWAN RAID</div>
            {topAttackers.slice(0, 5).map((p, i) => <ParticipantRow key={p.userId || i} p={p} rank={i} />)}
          </div>
        )}
        <button onClick={goBack} style={{
          marginTop: 8, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
          color: '#000', border: 'none', borderRadius: 14, padding: '14px 40px',
          fontSize: 16, fontWeight: 900, cursor: 'pointer',
        }}>🏠 Kembali ke Menu</button>
        <style>{`@keyframes bossShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-12px) rotate(-5deg)}75%{transform:translateX(12px) rotate(5deg)}}`}</style>
      </div>
    )
  }

  // ── Main battle screen ────────────────────────────────────────────────────────
  const bossHeader = (
    <>
      {/* Boss visual */}
      <div style={{ textAlign: 'center', padding: '16px 0 10px' }}>
        <div style={{
          fontSize: isMd ? 72 : 86, lineHeight: 1, marginBottom: 10,
          animation: 'bossFloat 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 36px rgba(239,68,68,0.55))',
          display: 'inline-block',
        }}>{raid.bossEmoji || '👹'}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{raid.bossName || 'Boss Matematika'}</div>
        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1.5 }}>KELAS {raid.kelas}</div>
      </div>
      {/* HP Bar */}
      <div style={{
        background: '#111827', borderRadius: 14,
        border: '1px solid rgba(239,68,68,0.2)', padding: '14px 16px', marginBottom: 14,
      }}>
        <HPBar hp={raid.hp} maxHp={raid.maxHp} />
      </div>
    </>
  )

  const questionArea = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Question overlay */}
      {phase === 'question' && question && (
        <div style={{
          background: '#111827', borderRadius: 16,
          border: '2px solid rgba(239,68,68,0.5)', padding: '18px 16px',
        }}>
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>⚔️ JAWAB UNTUK MENYERANG!</div>
          <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, marginBottom: 14 }}>
            Katak mulai di{' '}
            <strong style={{ color: '#67E8F9', fontSize: 16 }}>{question.start}</strong>, lalu{' '}
            {question.isForward ? 'melompat maju' : 'melompat mundur'} sejauh{' '}
            <strong style={{ color: '#67E8F9', fontSize: 16 }}>{question.jump}</strong> langkah.
            <br />Posisi akhir katak?
          </div>
          <SliderInput min={-20} max={20} value={sliderVal} onChange={setSliderVal} />
          <button onClick={handleAnswer} style={{
            width: '100%', marginTop: 14,
            background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '14px', fontSize: 16, fontWeight: 900, cursor: 'pointer',
            boxShadow: '0 0 24px rgba(239,68,68,0.4)',
          }}>⚔️ Serang!</button>
        </div>
      )}

      {/* Attack result */}
      {phase === 'result' && attackResult && (
        <div style={{
          background: attackResult.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)',
          borderRadius: 16,
          border: `2px solid ${attackResult.correct ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.25)'}`,
          padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{attackResult.correct ? '💥' : '💨'}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: attackResult.correct ? '#22c55e' : '#f87171', marginBottom: 6 }}>
            {attackResult.correct ? `Mengenai! -${attackResult.damage} HP dari Bos` : 'Serangan meleset!'}
          </div>
          {!attackResult.correct && (
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
              Jawaban yang benar: <strong style={{ color: '#fff' }}>{attackResult.correctAnswer}</strong>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>
            ⏳ Cooldown serangan: {COOLDOWN_SEC} detik
          </div>
          <button onClick={dismissResult} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', borderRadius: 10, padding: '10px 32px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Oke</button>
        </div>
      )}

      {/* Attack button (battle phase only) */}
      {phase === 'battle' && (
        <button
          onClick={handleAttack}
          disabled={cooldownSec > 0}
          style={{
            width: '100%',
            background: cooldownSec > 0
              ? 'rgba(255,255,255,0.03)'
              : 'linear-gradient(135deg,#ef4444,#b91c1c)',
            color: cooldownSec > 0 ? '#475569' : '#fff',
            border: cooldownSec > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            borderRadius: 16, padding: '18px',
            fontSize: cooldownSec > 0 ? 14 : 18,
            fontWeight: 900, cursor: cooldownSec > 0 ? 'default' : 'pointer',
            boxShadow: cooldownSec > 0 ? 'none' : '0 0 36px rgba(239,68,68,0.45)',
            transition: 'all 0.3s',
          }}
        >
          {cooldownSec > 0 ? `⏳ Cooldown: ${cooldownSec}s` : '⚔️ SERANG BOS!'}
        </button>
      )}

      {/* Hint */}
      <div style={{ textAlign: 'center', fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
        Setiap jawaban benar = -{DAMAGE_PER_HIT} HP Bos · Cooldown {COOLDOWN_SEC}s
        {raid.rewardType && raid.rewardAmount > 0 && (
          <>
            <br/>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>
              🎁 {raid.rewardType === 'koin'
                ? `🪙 ${raid.rewardAmount} koin`
                : raid.rewardType === 'exp'
                  ? `⚡ ${raid.rewardAmount} EXP`
                  : `🪙 ${raid.rewardAmount} koin + ⚡ ${raid.rewardAmount} EXP`
              } per siswa saat boss kalah
            </span>
          </>
        )}
      </div>
    </div>
  )

  const liveFeedPanel = (
    <div style={{
      background: '#111827', borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }}>
        ⚔️ PENYERANG TERKUAT
      </div>
      {(raid.participants?.length ?? 0) === 0 ? (
        <div style={{ fontSize: 12, color: '#374151' }}>Belum ada serangan…</div>
      ) : (
        raid.participants.slice(0, 8).map((p, i) => (
          <ParticipantRow key={p.userId || i} p={p} rank={i} />
        ))
      )}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#0d0506 0%,#1a080a 50%,#0d0506 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <TopBar title="⚔️ Boss Raid" onBack={goBack} />

      {/* Floating damage numbers */}
      {floatingDmg.map(f => (
        <div key={f.id} style={{
          position: 'fixed', top: '28%', left: '50%', transform: 'translateX(-50%)',
          fontSize: f.ok ? 26 : 18, fontWeight: 900,
          color: f.ok ? '#ef4444' : '#94A3B8',
          animation: 'floatUp 1.6s ease-out forwards',
          pointerEvents: 'none', zIndex: 200,
          textShadow: f.ok ? '0 0 20px rgba(239,68,68,0.8)' : 'none',
          whiteSpace: 'nowrap',
        }}>{f.text}</div>
      ))}

      {isMd ? (
        /* ── Desktop layout ── */
        <div style={{ padding: '0 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
          {bossHeader}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: 2 }}>{questionArea}</div>
            <div style={{ width: 260, flexShrink: 0 }}>{liveFeedPanel}</div>
          </div>
        </div>
      ) : (
        /* ── Mobile layout ── */
        <div style={{ padding: '0 16px 48px', maxWidth: 440, margin: '0 auto' }}>
          {bossHeader}
          {questionArea}
          {(raid.participants?.length ?? 0) > 0 && liveFeedPanel}
        </div>
      )}

      <style>{`
        @keyframes bossFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes floatUp {
          0%   { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-90px); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
