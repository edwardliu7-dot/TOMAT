import React, { useState, useEffect } from 'react'
import { PlayerHeader } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useTask } from '../TaskContext'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'
import { getAccessibleGradesForUser } from '../kelasUtils'

const ZONE_DEFS = [
  {
    id: 'grade7', grade: 7, label: 'Kelas 7', title: 'Zona Penjelajah Pemula', subtitle: 'Lautan Dalam',
    emoji: '🌊', missions: 20,
    bg: 'linear-gradient(135deg, #0c2340 0%, #0e3d5e 50%, #0a1e38 100%)',
    accent: '#38BDF8',
    accentGlow: 'rgba(56,189,248,0.25)',
    stats: '20 Misi · Bilangan Bulat, Rasional & Rasio',
    babs: ['BAB I: Bilangan Bulat', 'BAB II: Bilangan Rasional', 'BAB III: Rasio'],
    hasContent: true,
  },
  {
    id: 'grade8', grade: 8, label: 'Kelas 8', title: 'Zona Pejuang Abad Pertengahan', subtitle: 'Kerajaan Api',
    emoji: '⚔️', missions: 16,
    bg: 'linear-gradient(135deg, #3b1200 0%, #5c2000 50%, #2a0e00 100%)',
    accent: '#FB923C',
    accentGlow: 'rgba(251,146,60,0.25)',
    stats: '16 Misi · Bilangan Berpangkat, Pythagoras & PLSV',
    babs: ['BAB I: Bilangan Berpangkat', 'BAB II: Teorema Pythagoras', 'BAB III: Persamaan & Pertidaksamaan Linear'],
    hasContent: true,
  },
  {
    id: 'grade9', grade: 9, label: 'Kelas 9', title: 'Zona Penjelajah Luar Angkasa', subtitle: 'Antariksa',
    emoji: '🚀', missions: 17,
    bg: 'linear-gradient(135deg, #0d1829 0%, #111e35 50%, #0a1020 100%)',
    accent: '#34D399',
    accentGlow: 'rgba(52,211,153,0.25)',
    stats: '17 Misi · SPLDV, Lingkaran & Bangun Ruang',
    babs: ['BAB I: SPLDV', 'BAB II: Lingkaran', 'BAB III: Bangun Ruang'],
    hasContent: true,
  },
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

  // ── Mobile layout (existing, unchanged) ──
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

          {/* Hero Banner */}
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

  // ── Desktop layout ──
  return (
    <div style={{ minHeight: '100vh', background: '#0A0B14', position: 'relative' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(52,211,153,0.07)', filter: 'blur(120px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {guruMode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 32px', background: 'rgba(52,211,153,0.12)', borderBottom: '1px solid rgba(52,211,153,0.3)' }}>
            <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700 }}>🎓 Mode Mengajar · Latihan Bebas untuk Media Ajar</div>
            <button onClick={onExitGuruMode} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>← Kembali</button>
          </div>
        )}

        {/* PlayerHeader - full width */}
        <PlayerHeader
          onAvatarClick={() => navigate('profile')}
          onNotificationTaskClick={openTask}
          onCommunicationClick={() => navigate('komunikasi')}
        />

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 24, padding: '16px var(--page-pad) 32px', maxWidth: 'var(--content-max)', margin: '0 auto', alignItems: 'flex-start' }}>

          {/* LEFT COLUMN — 300px fixed */}
          {!guruMode && (
            <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Stats card */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 50%, #1a1a3e 100%)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #818CF8, transparent)' }} />
                <img src={logo} alt="" style={{ position: 'absolute', right: -10, top: -10, width: 90, height: 90, opacity: 0.1, objectFit: 'contain' }} />
                <div style={{ fontSize: 9, color: '#818CF8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>TOMAT</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>
                  {player.name || user?.name || 'Pejuang'}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, marginTop: 2 }}>
                  {user?.kelas || ''}
                </div>

                {/* XP bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>⭐ Level {player.level}</span>
                    <span style={{ fontSize: 11, color: '#818CF8', fontWeight: 700 }}>{player.exp} EXP</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(129,140,248,0.2)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (player.exp % 100))}%`, background: 'linear-gradient(90deg, #6366F1, #818CF8)', borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <StatPill emoji="🪙" value={player.coins} label="Koin" color="#FBBF24" />
                  <StatPill emoji="📚" value={player.exp} label="EXP" color="#34D399" />
                </div>
              </div>

              {/* Nilai & Tugas card */}
              <button
                onClick={() => navigate('grades')}
                className="card-hover"
                style={{ width: '100%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 16, padding: '16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', fontFamily: 'inherit' }}
              >
                <div style={{ fontSize: 28 }}>📊</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Nilai & Tugas</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{grades.length > 0 ? `${grades.length} nilai tersimpan` : 'Belum ada nilai'}</div>
                </div>
                {pendingTaskCount > 0 && <div style={{ position: 'absolute', top: 10, right: 12, background: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>{pendingTaskCount} tugas</div>}
              </button>

              {/* Pending tasks preview */}
              {pendingTaskCount > 0 && (
                <div style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px' }}>
                  <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>⚡ Tugas Aktif</div>
                  {pendingTasks.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      onClick={() => openTask(t)}
                      style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginBottom: 6, display: 'block' }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.gameName || t.gameKey}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Kerjakan sekarang →</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Shortcuts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SHORTCUTS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="btn-hover"
                    style={{ background: item.bg, border: `1px solid ${item.color}33`, borderRadius: 14, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}
                  >
                    <div style={{ fontSize: 20 }}>{item.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: item.color }}>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT COLUMN — flex:1 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Section header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                Pilih Zona Petualangan
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>Pilih kelas untuk mulai misi matematika</div>
            </div>

            {/* Zone cards — horizontal flex on desktop */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              {zones.map(z => (
                <div
                  key={z.id}
                  onClick={() => !z.locked && navigate(z.id)}
                  className={z.locked ? '' : 'card-hover'}
                  style={{
                    flex: 1, minWidth: 220,
                    height: 200,
                    background: z.bg, borderRadius: 20, padding: '20px 18px',
                    border: `1px solid ${z.accent}40`, cursor: z.locked ? 'not-allowed' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    opacity: z.locked ? 0.4 : 1,
                    boxShadow: z.locked ? 'none' : `0 4px 24px ${z.accentGlow}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${z.accent}80, transparent)` }} />
                  <div style={{ position: 'absolute', right: -8, top: -8, fontSize: 70, opacity: 0.15, lineHeight: 1 }}>{z.emoji}</div>

                  <div>
                    <div style={{ fontSize: 9, color: z.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{z.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1.2, marginBottom: 4 }}>{z.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{z.missions} Misi</div>
                  </div>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: z.locked ? 'rgba(255,255,255,0.06)' : z.accent,
                    borderRadius: 16, padding: '7px 14px', alignSelf: 'flex-start',
                    cursor: z.locked ? 'not-allowed' : 'pointer',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: z.locked ? '#fff' : '#000' }}>
                      {z.locked ? 'Terkunci 🔒' : 'Masuk →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Guru mode - show all zones as vertical (existing style) */}
            {guruMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {zones.map(z => <ZoneCard key={z.id} z={z} onClick={() => !z.locked && navigate(z.id)} />)}
              </div>
            )}

            {/* Shortcuts grid - 4 columns on desktop */}
            {!guruMode && (
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Pintasan</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {SHORTCUTS.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className="btn-hover"
                      style={{ background: item.bg, border: `1px solid ${item.color}33`, borderRadius: 16, padding: '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
                    >
                      <div style={{ fontSize: 24 }}>{item.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: item.color }}>{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
      <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.14, lineHeight: 1 }}>{z.emoji}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {z.locked && <span style={{ background: `${z.accent}22`, color: z.accent, fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, letterSpacing: 1 }}>{z.accessDenied ? '🔒 BELUM TERBUKA' : '🔒 SEGERA HADIR'}</span>}
        <div style={{ fontSize: 10, color: z.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{z.label} · {z.subtitle}</div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontStyle: 'italic', marginTop: 2, lineHeight: 1.2 }}>{z.title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>{z.stats}</div>

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
