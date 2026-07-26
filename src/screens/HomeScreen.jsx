import React, { useState, useEffect } from 'react'
import { PlayerHeader } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useTask } from '../TaskContext'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'
import { getAccessibleGradesForUser } from '../kelasUtils'

const ZONE_DEFS = [
  {
    id: 'grade7', grade: 7, label: 'Kelas 7', title: 'Gerbang Bilangan', subject: 'Matematika · Kelas VII',
    description: 'Bangun fondasi logika dan taklukkan bilangan bulat, rasional, dan rasio.',
    progress: null, // live from player
    icon: '🧭', missions: 20, accent: '#67E8F9', accentDim: 'rgba(103,232,249,0.1)',
    accentBorder: 'rgba(103,232,249,0.2)', accentText: 'indigo',
    bg: 'linear-gradient(135deg, #0c2340 0%, #0e3d5e 50%, #0a1e38 100%)',
    accentGlow: 'rgba(56,189,248,0.25)',
    babs: ['BAB I: Bilangan Bulat', 'BAB II: Bilangan Rasional', 'BAB III: Rasio'],
    hasContent: true,
  },
  {
    id: 'grade8', grade: 8, label: 'Kelas 8', title: 'Kerajaan Pythagoras', subject: 'Matematika · Kelas VIII',
    description: 'Perjuangkan teorema, pangkat, dan persamaan linear di kerajaan api.',
    progress: null,
    icon: '⚔️', missions: 38, accent: '#FB923C', accentDim: 'rgba(251,146,60,0.1)',
    accentBorder: 'rgba(251,146,60,0.2)', accentText: 'amber',
    bg: 'linear-gradient(135deg, #3b1200 0%, #5c2000 50%, #2a0e00 100%)',
    accentGlow: 'rgba(251,146,60,0.25)',
    babs: ['BAB I: Bilangan Berpangkat', 'BAB II: Teorema Pythagoras', 'BAB III: PLSV'],
    hasContent: true,
  },
  {
    id: 'grade9', grade: 9, label: 'Kelas 9', title: 'Observatorium SPLDV', subject: 'Matematika · Kelas IX',
    description: 'Jelajahi antariksa persamaan, lingkaran, dan bangun ruang.',
    progress: null,
    icon: '🚀', missions: 31, accent: '#34D399', accentDim: 'rgba(52,211,153,0.1)',
    accentBorder: 'rgba(52,211,153,0.2)', accentText: 'emerald',
    bg: 'linear-gradient(135deg, #0d1829 0%, #111e35 50%, #0a1020 100%)',
    accentGlow: 'rgba(52,211,153,0.25)',
    babs: ['BAB I: SPLDV', 'BAB II: Lingkaran', 'BAB III: Bangun Ruang'],
    hasContent: true,
  },
]

const QUICK_LINKS = [
  { id: 'grades',       label: 'Nilai',    sublabel: 'Rekap belajarmu',   icon: '📊', accent: '#67E8F9', bg: 'rgba(103,232,249,0.1)' },
  { id: 'komunikasi',   label: 'Chat',     sublabel: 'Tanya guru',        icon: '💬', accent: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  { id: 'toko',         label: 'Toko',     sublabel: null,                 icon: '🛍️', accent: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'lencana',      label: 'Lencana',  sublabel: null,                 icon: '🏅', accent: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
]

const NAV_ITEMS = [
  { label: 'Perjalanan', icon: '🧭', screen: null },
  { label: 'Kelas Saya', icon: '📊', screen: 'grades' },
  { label: 'Pencapaian', icon: '🏆', screen: 'lencana' },
]

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isDesktop
}

export default function HomeScreen({ navigate, guruMode, onExitGuruMode }) {
  const { player } = usePlayer()
  const { tasks, grades } = useTask()
  const { user } = useAuth()
  const isDesktop = useIsDesktop()
  const accessibleGrades = getAccessibleGradesForUser(user)
  const pendingTasks = tasks.filter(t => t.status === 'active')
  const pendingTaskCount = pendingTasks.length

  const openTask = (task) => navigate(task.gameKey, { taskId: task.id })

  const zones = ZONE_DEFS.map(z => {
    const accessible = accessibleGrades.includes(z.grade)
    return { ...z, locked: !z.hasContent || !accessible, accessDenied: !accessible }
  })

  const SHORTCUTS = [
    { id: 'komunikasi', emoji: '💬', label: 'Chat & Forum', color: '#67E8F9', bg: 'rgba(103,232,249,0.12)' },
    { id: 'toko',       emoji: '🛍️', label: 'Toko',         color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
    { id: 'papanperingkat', emoji: '🏆', label: 'Peringkat', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
    { id: 'lencana',    emoji: '🏅', label: 'Lencana',      color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    { id: 'profile',    emoji: '👤', label: 'Profil',       color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
  ]

  // ── Mobile layout (unchanged) ──
  if (!isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: '60%', height: '40%', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(52,211,153,0.08)', filter: 'blur(100px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {guruMode && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(52,211,153,0.12)', borderBottom: '1px solid rgba(52,211,153,0.3)' }}>
              <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700 }}>🎓 Mode Mengajar · Latihan Bebas untuk Media Ajar</div>
              <button onClick={onExitGuruMode} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>← Kembali</button>
            </div>
          )}

          <PlayerHeader
            onAvatarClick={() => navigate('profile')}
            onNotificationTaskClick={openTask}
            onCommunicationClick={() => navigate('komunikasi')}
          />

          <div style={{ margin: '16px 16px 0', borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 50%, #1a1a3e 100%)', border: '1px solid rgba(99,102,241,0.4)', padding: '22px 20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #818CF8, transparent)' }} />
              <img src={logo} alt="" style={{ position: 'absolute', right: -16, top: -16, width: 120, height: 120, opacity: 0.12, objectFit: 'contain' }} />
              <div style={{ fontSize: 10, color: '#818CF8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>TANTANGAN OTAK MATEMATIKA</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: -1 }}>TOMAT</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 5, lineHeight: 1.5 }}>Selesaikan misi matematika, kumpulkan koin &amp; EXP untuk naik level!</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <StatPill emoji="🪙" value={player.coins} label="Koin" color="#FBBF24" />
                <StatPill emoji="⭐" value={`Lv ${player.level}`} label="Level" color="#818CF8" />
                <StatPill emoji="📚" value={player.exp} label="EXP" color="#34D399" />
              </div>
            </div>
          </div>

          {!guruMode && (
            <div style={{ padding: '14px 16px 0', display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('grades')} style={{ flex: 1, background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 18, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                <div style={{ fontSize: 24 }}>📊</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Nilai Akademik Saya</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{grades.length > 0 ? `${grades.length} nilai tersimpan` : 'Belum ada nilai'}</div>
                </div>
                {pendingTaskCount > 0 && <div style={{ position: 'absolute', top: 10, right: 12, background: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>{pendingTaskCount} tugas</div>}
              </button>
            </div>
          )}

          {!guruMode && (
            <div style={{ padding: '10px 16px 0', display: 'flex', gap: 10 }}>
              {SHORTCUTS.slice(0, 4).map(item => (
                <button key={item.id} onClick={() => navigate(item.id)} style={{ flex: 1, background: item.bg, border: `1px solid ${item.color}33`, borderRadius: 16, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 22 }}>{item.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: item.color }}>{item.label}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '18px 16px 32px' }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Pilih Zona Petualangan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {zones.map(z => <ZoneCard key={z.id} z={z} onClick={() => !z.locked && navigate(z.id)} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop layout: canvas-matched design ──
  const nama = user?.name || player?.name || 'Pelajar'
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Halo' : hour < 15 ? 'Halo' : hour < 18 ? 'Halo' : 'Halo'
  const photoSrc = user?.photoUrl ?? user?.photo_url ?? null
  const initials = nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const firstName = nama.split(' ')[0]
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const [activeSideNav, setActiveSideNav] = useState('Perjalanan')
  const [activeZone, setActiveZone] = useState(null)
  const [notice, setNotice] = useState(null)

  const showNotice = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 2600) }

  const handleSideNav = (item) => {
    setActiveSideNav(item.label)
    if (item.screen) navigate(item.screen)
    else showNotice(`${item.label} — kamu sudah di halaman ini.`)
  }

  const nextTask = pendingTasks[0] || null
  const firstAccessibleZone = zones.find(z => !z.locked)

  return (
    <div style={{ minHeight: '100vh', background: '#071321', color: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -128, top: -128, width: 520, height: 520, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', filter: 'blur(110px)' }} />
        <div style={{ position: 'absolute', right: -160, top: '38%', width: 580, height: 580, borderRadius: '50%', background: 'rgba(99,102,241,0.10)', filter: 'blur(130px)' }} />
        <div style={{ position: 'absolute', bottom: -280, left: '35%', width: 520, height: 520, borderRadius: '50%', background: 'rgba(14,165,233,0.06)', filter: 'blur(120px)' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(#b8deef 0.65px, transparent 0.65px)', backgroundSize: '23px 23px' }} />
      </div>

      {guruMode && (
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 32px', background: 'rgba(52,211,153,0.12)', borderBottom: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700 }}>🎓 Mode Mengajar · Latihan Bebas untuk Media Ajar</div>
          <button onClick={onExitGuruMode} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>← Kembali</button>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>

        {/* ── Left Sidebar ── */}
        {!guruMode && (
          <aside style={{ width: 222, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(9,24,39,0.8)', padding: '28px 20px', backdropFilter: 'blur(12px)' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', marginBottom: 48 }}>
              <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg, #67E8F9, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(45,212,191,0.18)', color: '#071321', flexShrink: 0 }}>
                🎯
                <span style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: '50%', border: '2px solid #091827', background: '#FCD34D' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, letterSpacing: '0.18em', color: '#fff', fontSize: 14 }}>TOMAT</div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(103,232,249,0.7)', marginTop: 2 }}>Ruang Tumbuh</div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NAV_ITEMS.map(item => {
                const isActive = activeSideNav === item.label
                return (
                  <button
                    key={item.label}
                    onClick={() => handleSideNav(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      borderRadius: 12, padding: '12px 14px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      background: isActive ? 'rgba(103,232,249,0.12)' : 'transparent',
                      color: isActive ? '#67E8F9' : '#94A3B8',
                      border: isActive ? '1px solid rgba(103,232,249,0.2)' : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#E2E8F0' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' } }}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {item.label}
                    {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#67E8F9', boxShadow: '0 0 12px rgba(103,232,249,0.9)', flexShrink: 0 }} />}
                  </button>
                )
              })}
            </nav>

            {/* Help card */}
            <div style={{ marginTop: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(99,102,241,0.13), rgba(6,182,212,0.06))', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#67E8F9', marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>❓</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Butuh bantuan?</span>
              </div>
              <p style={{ fontSize: 10, lineHeight: 1.6, color: '#64748B', margin: '0 0 12px' }}>Teman belajar TOMAT siap menemanimu.</p>
              <button onClick={() => navigate('komunikasi')} style={{ fontSize: 10, fontWeight: 700, color: '#67E8F9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Hubungi guru → </button>
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <section style={{ flex: 1, minWidth: 0, padding: guruMode ? '0 40px 48px' : '0 40px 48px' }}>

          {/* Header */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
              {todayStr} <span style={{ color: '#1E3A4C', margin: '0 8px' }}>/</span> Semester Aktif
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Coins */}
              {!guruMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.07)', padding: '8px 12px' }}>
                  <span style={{ fontSize: 14 }}>🪙</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FDE68A' }}>{player.coins?.toLocaleString?.() ?? player.coins}</span>
                </div>
              )}
              {/* Notif bell (reuse existing PlayerHeader click) */}
              <button onClick={() => openTask(pendingTasks[0])} style={{ position: 'relative', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '10px', color: '#94A3B8', cursor: 'pointer', lineHeight: 1 }} onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#fff' }} onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#94A3B8' }}>
                <span style={{ fontSize: 15 }}>🔔</span>
                {pendingTaskCount > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#67E8F9' }} />}
              </button>
              {/* Profile */}
              <button onClick={() => navigate('profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '6px 10px 6px 6px', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                {photoSrc
                  ? <img src={photoSrc} alt="" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }} />
                  : <span style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #67E8F9, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#071321' }}>{initials}</span>
                }
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0' }}>{firstName}</span>
                <span style={{ fontSize: 12, color: '#475569' }}>▾</span>
              </button>
            </div>
          </header>

          <div style={{ maxWidth: 1120, paddingTop: 36 }}>

            {/* Hero greeting + streak */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#67E8F9', margin: '0 0 8px' }}>PETA PERJALANANMU</p>
                <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.035em', color: '#fff', margin: 0 }}>
                  {greeting}, {firstName}. <span style={{ color: '#475569' }}>Siap menjelajah?</span>
                </h1>
                <p style={{ marginTop: 8, fontSize: 13, color: '#64748B', margin: '8px 0 0' }}>Satu langkah kecil hari ini membawa kamu lebih dekat ke tujuan.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.035)', padding: '12px 16px', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(251,146,60,0.1)', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔥</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Lv {player.level}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>level saat ini</div>
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#67E8F9' }}>{player.exp?.toLocaleString?.() ?? player.exp} XP</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>total EXP</div>
                </div>
              </div>
            </div>

            {/* Next mission / active task hero card */}
            {!guruMode && (
              <section style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, border: '1px solid rgba(103,232,249,0.2)', background: 'linear-gradient(135deg, #102e42, #0c2539, #151b47)', padding: 28, boxShadow: '0 22px 70px rgba(3,16,38,0.35)', marginBottom: 32 }}>
                {/* Decorative rings */}
                <div style={{ position: 'absolute', top: -96, right: -48, width: 288, height: 288, borderRadius: '50%', border: '34px solid rgba(103,232,249,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 32, right: -8, width: 224, height: 224, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.12)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -75, right: '19%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(103,232,249,0.08)', filter: 'blur(48px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 28 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ borderRadius: 6, background: 'rgba(103,232,249,0.15)', padding: '4px 8px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#67E8F9' }}>
                        {nextTask ? 'TUGAS AKTIF' : 'MISI BERIKUTNYA'}
                      </span>
                      {nextTask && <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>⚡ +{(nextTask.totalQuestions || 5) * 10} EXP</span>}
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.025em', color: '#fff', margin: 0, maxWidth: 520 }}>
                      {nextTask
                        ? <><span>{nextTask.gameName || nextTask.gameKey}</span></>
                        : firstAccessibleZone
                          ? <>Masuki <span style={{ color: '#67E8F9' }}>{firstAccessibleZone.title}</span></>
                          : <><span style={{ color: '#67E8F9' }}>Mulai petualangan</span> matematikamu</>
                      }
                    </h2>
                    <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.7, color: 'rgba(203,213,225,0.8)', margin: '8px 0 0', maxWidth: 480 }}>
                      {nextTask
                        ? `Selesaikan ${nextTask.totalQuestions || 5} soal untuk mendapatkan nilai dari gurumu.`
                        : firstAccessibleZone
                          ? firstAccessibleZone.description
                          : 'Pilih zona petualangan di bawah untuk mulai belajar.'}
                    </p>
                    <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                      <button
                        onClick={() => nextTask ? openTask(nextTask) : (firstAccessibleZone && navigate(firstAccessibleZone.id))}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, background: '#67E8F9', padding: '12px 16px', fontSize: 11, fontWeight: 900, color: '#082033', boxShadow: '0 8px 28px rgba(103,232,249,0.2)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#a5f3fc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#67E8F9'}
                      >
                        {nextTask ? 'KERJAKAN SEKARANG' : 'MULAI MISI'} →
                      </button>
                      {pendingTaskCount > 1 && (
                        <button onClick={() => navigate('grades')} style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)', textUnderlineOffset: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Lihat {pendingTaskCount - 1} tugas lainnya
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress panel */}
                  <div style={{ width: 260, flexShrink: 0, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(7,24,39,0.45)', padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#64748B' }}>PROGRES</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#67E8F9' }}>Lv {player.level}</span>
                    </div>
                    {/* EXP bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ height: 8, borderRadius: 9999, background: 'rgba(255,255,255,0.09)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 9999, background: '#67E8F9', boxShadow: '0 0 10px rgba(103,232,249,0.35)', width: `${Math.min(100, (player.exp % 100))}%`, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#64748B' }}>
                      <span>✓</span> {pendingTaskCount > 0 ? `${pendingTaskCount} tugas menunggu` : 'Tidak ada tugas aktif'}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Zone cards */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>Zona petualangan</h2>
                  <span style={{ borderRadius: 9999, background: 'rgba(103,232,249,0.1)', padding: '4px 8px', fontSize: 9, fontWeight: 700, color: '#67E8F9' }}>3 ZONA</span>
                </div>
                <p style={{ marginTop: 4, fontSize: 11, color: '#475569', margin: '4px 0 0' }}>Pilih jalur yang ingin kamu taklukkan.</p>
              </div>
              <button onClick={() => showNotice('Semua zona yang tersedia sudah tampil di sini.')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#67E8F9', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color='#a5f3fc'} onMouseLeave={e => e.currentTarget.style.color='#67E8F9'}>Lihat semua →</button>
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {zones.map(z => {
                const isSelected = activeZone === z.id
                return (
                  <button
                    key={z.id}
                    onClick={() => z.locked ? showNotice('Selesaikan zona sebelumnya atau minta gurumu untuk membuka akses.') : (isSelected ? setActiveZone(null) : setActiveZone(z.id))}
                    style={{
                      position: 'relative', overflow: 'hidden', borderRadius: 20,
                      border: `1px solid ${z.locked ? 'rgba(255,255,255,0.07)' : isSelected ? `${z.accent}66` : 'rgba(255,255,255,0.08)'}`,
                      background: z.locked ? 'rgba(255,255,255,0.025)' : isSelected ? `${z.accentDim}` : 'rgba(11,28,44,0.8)',
                      padding: 20, textAlign: 'left', cursor: z.locked ? 'not-allowed' : 'pointer',
                      opacity: z.locked ? 0.7 : 1,
                      boxShadow: isSelected ? `0 14px 38px rgba(22,184,209,0.1)` : 'none',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!z.locked && !isSelected) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${z.accent}44` } }}
                    onMouseLeave={e => { if (!z.locked && !isSelected) { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
                  >
                    <div style={{ position: 'absolute', top: -36, right: -36, width: 112, height: 112, borderRadius: '50%', background: z.locked ? 'rgba(148,163,184,0.05)' : `${z.accent}18`, filter: 'blur(24px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${z.locked ? 'rgba(255,255,255,0.1)' : `${z.accent}33`}`, background: z.locked ? 'rgba(255,255,255,0.04)' : z.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: z.locked ? '#64748B' : z.accent }}>
                        {z.icon}
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#1E3A4C' }}>0{zones.indexOf(z) + 1}</span>
                    </div>
                    <div style={{ position: 'relative', marginTop: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: 0 }}>{z.title}</h3>
                      <p style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: `${z.accent}bb`, margin: '4px 0 0' }}>{z.subject}</p>
                      <p style={{ marginTop: 12, minHeight: 34, fontSize: 11, lineHeight: 1.6, color: '#64748B', margin: '12px 0 0' }}>{z.description}</p>
                    </div>
                    <div style={{ position: 'relative', marginTop: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>{z.missions} misi tersedia</span>
                        {z.locked ? <span style={{ fontSize: 12 }}>🔒</span> : <span style={{ fontWeight: 900, color: z.accent }}>{z.missions} misi</span>}
                      </div>
                      <div style={{ height: 6, overflow: 'hidden', borderRadius: 9999, background: 'rgba(255,255,255,0.09)' }}>
                        <div style={{ height: '100%', borderRadius: 9999, background: z.locked ? '#334155' : z.accent, width: z.locked ? '0%' : '100%' }} />
                      </div>
                    </div>
                    {!z.locked && (
                      <div style={{ position: 'relative', marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 900, color: isSelected ? z.accent : '#475569' }}>
                        {isSelected ? 'ZONA DIPILIH' : 'BUKA PETA'} <span style={{ fontSize: 12 }}>›</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </section>

            {/* Zone detail panel (if selected) */}
            {activeZone && !zones.find(z => z.id === activeZone)?.locked && (
              <div style={{ marginBottom: 32, borderRadius: 16, border: `1px solid ${zones.find(z => z.id === activeZone)?.accent}33`, background: `${zones.find(z => z.id === activeZone)?.accentDim}`, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{zones.find(z => z.id === activeZone)?.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {zones.find(z => z.id === activeZone)?.babs.map((b, i) => (
                        <span key={i} style={{ background: `${zones.find(z => z.id === activeZone)?.accent}22`, color: zones.find(z => z.id === activeZone)?.accent, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${zones.find(z => z.id === activeZone)?.accent}33` }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigate(activeZone)} style={{ borderRadius: 12, background: zones.find(z => z.id === activeZone)?.accent, color: '#071321', padding: '10px 20px', fontSize: 12, fontWeight: 900, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Masuki Zona →
                  </button>
                </div>
              </div>
            )}

            {/* Quick links */}
            {!guruMode && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 900, color: '#fff', margin: 0 }}>Akses cepat</h2>
                  <span style={{ fontSize: 10, color: '#1E3A4C' }}>Semua yang kamu butuhkan</span>
                </div>
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {QUICK_LINKS.map(({ id, label, sublabel, icon, accent, bg }) => (
                    <button
                      key={id}
                      onClick={() => navigate(id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(11,28,44,0.75)', padding: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(11,28,44,0.75)' }}
                    >
                      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 12, background: bg, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#E2E8F0' }}>{label}</span>
                        {sublabel && <span style={{ display: 'block', marginTop: 2, fontSize: 9, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sublabel}</span>}
                        {!sublabel && id === 'toko' && <span style={{ display: 'block', marginTop: 2, fontSize: 9, color: '#475569' }}>{player.coins?.toLocaleString?.() ?? player.coins} koin</span>}
                        {!sublabel && id === 'lencana' && <span style={{ display: 'block', marginTop: 2, fontSize: 9, color: '#475569' }}>koleksimu</span>}
                      </span>
                    </button>
                  ))}
                </section>
              </>
            )}

            {/* Guru mode zones */}
            {guruMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {zones.map(z => <ZoneCard key={z.id} z={z} onClick={() => !z.locked && navigate(z.id)} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Notice toast */}
      {notice && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: '1px solid rgba(103,232,249,0.2)', background: '#10263a', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#67E8F9', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          ✦ {notice}
          <button onClick={() => setNotice(null)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginLeft: 8 }}>✕</button>
        </div>
      )}
    </div>
  )
}

function ZoneCard({ z, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: z.bg, borderRadius: 22, padding: '20px',
        border: `1px solid ${z.accent}40`, cursor: z.locked ? 'default' : 'pointer',
        position: 'relative', overflow: 'hidden',
        opacity: z.locked ? 0.55 : 1,
        boxShadow: z.locked ? 'none' : `0 4px 32px ${z.accentGlow}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (!z.locked) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = '' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${z.accent}80, transparent)` }} />
      <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.14, lineHeight: 1 }}>{z.icon}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {z.locked && <span style={{ background: `${z.accent}22`, color: z.accent, fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, letterSpacing: 1 }}>{z.accessDenied ? '🔒 BELUM TERBUKA' : '🔒 SEGERA HADIR'}</span>}
        <div style={{ fontSize: 10, color: z.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{z.label}</div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontStyle: 'italic', marginTop: 2, lineHeight: 1.2 }}>{z.title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>{z.missions} Misi</div>

      {z.babs && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {z.babs.map((b, i) => (
            <span key={i} style={{ background: `${z.accent}18`, color: z.accent, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${z.accent}25` }}>{b}</span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: 4, width: i === 0 ? 36 : 10, background: i === 0 ? z.accent : `${z.accent}40`, borderRadius: 2 }} />)}
        </div>
        <div style={{ background: z.locked ? 'rgba(255,255,255,0.06)' : z.accent, border: `1px solid ${z.locked ? 'rgba(255,255,255,0.1)' : 'transparent'}`, borderRadius: 20, padding: '7px 18px', color: z.locked ? '#fff' : '#000' }}>
          <span style={{ fontSize: 12, fontWeight: 800 }}>{z.locked ? 'Terkunci 🔒' : 'Masuki Zona ▶'}</span>
        </div>
      </div>
    </div>
  )
}

function StatPill({ emoji, value, label, color }) {
  return (
    <div style={{ background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 12, padding: '8px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{emoji} {value}</div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{label}</div>
    </div>
  )
}
