import React, { useState, useEffect, useMemo } from 'react'
import {
  TopBar, PlayerHeader, PublicProfileModal, UserAvatar, usePublicProfile,
} from '../components/shared'
import { useAuth } from '../AuthContext'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

async function apiCall(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function HafalanDots({ perkalian = 0, pembagian = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: i < perkalian ? '#34D399' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: i < pembagian ? '#60A5FA' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </div>
  )
}

function HafalanChip({ total }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap',
      background: total > 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)',
      color: total > 0 ? '#FBBF24' : '#6B7280',
      border: `1px solid ${total > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
    }}>🧮 {total}/20</div>
  )
}

function LeaderboardPodium({ leaderboard, publicProfile }) {
  const top = (leaderboard || []).filter(s => s.rank <= 3).sort((a, b) => a.rank - b.rank)
  if (top.length === 0) return null

  const byRank = Object.fromEntries(top.map(s => [s.rank, s]))
  const order = [byRank[2], byRank[1], byRank[3]].filter(Boolean)
  const podiumMeta = {
    1: { accent: '#FBBF24', soft: 'rgba(251,191,36,0.12)', label: 'Juara 1', height: 132, avatar: 72 },
    2: { accent: '#CBD5E1', soft: 'rgba(203,213,225,0.10)', label: 'Juara 2', height: 102, avatar: 62 },
    3: { accent: '#FB923C', soft: 'rgba(251,146,60,0.10)', label: 'Juara 3', height: 84, avatar: 58 },
  }

  return (
    <section style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12,
      padding: '18px 10px 0', marginBottom: 18,
      borderBottom: '1px solid rgba(99,102,241,0.14)',
    }} aria-label="Tiga besar papan peringkat">
      {order.map(student => {
        const meta = podiumMeta[student.rank]
        const hafalanTotal = (student.hafalanPerkalian || 0) + (student.hafalanPembagian || 0)
        const isWinner = student.rank === 1
        return (
          <div key={student.id} style={{
            width: isWinner ? 150 : 128, minWidth: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            {isWinner && <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 4, filter: 'drop-shadow(0 0 8px rgba(251,191,36,.65))' }}>♛</div>}
            <button
              onClick={() => publicProfile.openProfile({ ...student, role: 'siswa' })}
              aria-label={`Lihat profil ${student.name}`}
              style={{
                position: 'relative', width: meta.avatar, height: meta.avatar, padding: 0,
                borderRadius: '50%', border: `2px solid ${meta.accent}`,
                background: meta.soft, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${meta.accent}22`,
              }}
            >
              <UserAvatar user={{ ...student, role: 'siswa' }} size={meta.avatar - 6} />
              <span style={{
                position: 'absolute', bottom: -9, right: -5, width: 23, height: 23,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', background: meta.accent, color: '#071321',
                fontSize: 11, fontWeight: 900, border: '2px solid #071321',
              }}>{student.rank}</span>
            </button>
            <div style={{
              width: '100%', height: meta.height, marginTop: 12, padding: '16px 8px 12px',
              boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end', gap: 3,
              border: `1px solid ${meta.accent}33`, borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(180deg, ${meta.soft}, rgba(10,22,40,.88))`,
            }}>
              <div style={{
                maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: isWinner ? '#FDE68A' : '#fff', fontSize: isWinner ? 13 : 12, fontWeight: 900,
              }}>{student.name}</div>
              <div style={{ color: isWinner ? '#FBBF24' : '#94A3B8', fontSize: 11, fontWeight: 800 }}>
                {Number(student.compositeScore || 0).toLocaleString('id-ID')} poin
              </div>
              <div style={{ color: '#64748B', fontSize: 9, fontWeight: 700 }}>
                {meta.label} · 🧮 {hafalanTotal}/20
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

// Mobile card list
function LeaderboardList({ leaderboard, publicProfile }) {
  if (!leaderboard || leaderboard.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Belum ada siswa.</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {leaderboard.map(s => {
        const hafalanTotal = (s.hafalanPerkalian || 0) + (s.hafalanPembagian || 0)
        return (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14,
            background: s.isMe ? 'rgba(99,102,241,0.15)' : '#1A1D27',
            border: s.isMe ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ width: 28, textAlign: 'center', fontSize: s.rank <= 3 ? 20 : 13, fontWeight: 800, color: s.rank <= 3 ? '#fff' : '#6B7280', flexShrink: 0 }}>
              {MEDALS[s.rank] || `#${s.rank}`}
            </div>
            <UserAvatar user={{ ...s, role: 'siswa' }} onClick={() => publicProfile.openProfile({ ...s, role: 'siswa' })} />
            <button onClick={() => publicProfile.openProfile({ ...s, role: 'siswa' })} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', padding: 0, color: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}{s.isMe && <span style={{ color: '#A5B4FC' }}> (Kamu)</span>}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                {s.kelas && <span style={{ color: '#64748B' }}>{s.kelas} · </span>}
                Level {s.level} · {s.exp} EXP · {s.compositeScore} poin
              </div>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <HafalanChip total={hafalanTotal} />
              <HafalanDots perkalian={s.hafalanPerkalian} pembagian={s.hafalanPembagian} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Desktop table
function LeaderboardTable({ leaderboard, publicProfile }) {
  if (!leaderboard || leaderboard.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Belum ada siswa.</div>
  }

  const top = leaderboard.filter(s => !s.isMe || s.rank <= 20)
  const me = leaderboard.find(s => s.isMe && s.rank > 20)

  const Row = ({ s }) => {
    const hafalanTotal = (s.hafalanPerkalian || 0) + (s.hafalanPembagian || 0)
    return (
      <tr style={{
        background: s.isMe ? 'rgba(99,102,241,0.12)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { if (!s.isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
        onMouseLeave={e => { if (!s.isMe) e.currentTarget.style.background = 'transparent' }}
      >
        <td style={{ width: 56, padding: '12px 14px', textAlign: 'center', fontSize: s.rank <= 3 ? 22 : 13, fontWeight: 800, color: s.rank <= 3 ? '#fff' : '#6B7280' }}>
          {MEDALS[s.rank] || (s.isMe ? `★ ${s.rank}` : `#${s.rank}`)}
        </td>
        <td style={{ padding: '12px 10px' }}>
          <button onClick={() => publicProfile.openProfile({ ...s, role: 'siswa' })} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}>
            <UserAvatar user={{ ...s, role: 'siswa' }} size={32} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}{s.isMe && <span style={{ color: '#A5B4FC', fontSize: 11 }}> (Kamu)</span>}</div>
              {s.kelas && <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{s.kelas}</div>}
            </div>
          </button>
        </td>
        <td style={{ width: 80, padding: '12px 14px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#818CF8' }}>{s.exp}</td>
        <td style={{ width: 80, padding: '12px 14px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>{s.coins ?? '—'}</td>
        <td style={{ width: 80, padding: '12px 14px', textAlign: 'right' }}>
          <HafalanChip total={hafalanTotal} />
        </td>
        <td style={{ width: 80, padding: '12px 14px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: '#A5B4FC' }}>{s.compositeScore}</td>
      </tr>
    )
  }

  return (
    <div style={{ background: '#111318', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th style={{ width: 56, padding: '10px 14px', textAlign: 'center', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>#</th>
            <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Siswa</th>
            <th style={{ width: 80, padding: '10px 14px', textAlign: 'right', fontSize: 11, color: '#818CF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>EXP</th>
            <th style={{ width: 80, padding: '10px 14px', textAlign: 'right', fontSize: 11, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Koin</th>
            <th style={{ width: 80, padding: '10px 14px', textAlign: 'right', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Hafalan</th>
            <th style={{ width: 80, padding: '10px 14px', textAlign: 'right', fontSize: 11, color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Poin</th>
          </tr>
        </thead>
        <tbody>
          {top.map(s => <Row key={s.id} s={s} />)}
          {me && (
            <>
              <tr><td colSpan={6} style={{ padding: '4px 14px', textAlign: 'center', fontSize: 11, color: '#4B5563' }}>· · ·</td></tr>
              <Row s={me} />
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Derive numeric grade (7/8/9) from a kelas string like "IX Al Khawarizmi"
function gradeFromKelas(kelas) {
  if (!kelas) return null
  if (kelas.startsWith('IX')) return 9
  if (kelas.startsWith('VIII')) return 8
  if (kelas.startsWith('VII')) return 7
  return null
}

const GRADE_ICONS = { 7: '📕', 8: '📗', 9: '📘' }

// Build ordered tab list: [grade 7, grade 8, grade 9] with 'myclass' replacing the student's own grade
function buildGradeTabs(myGrade) {
  return [7, 8, 9].map(g => {
    const isOwn = g === myGrade
    return {
      id: isOwn ? 'myclass' : String(g),
      label: isOwn ? '🏫 Kelasku' : `${GRADE_ICONS[g]} Kelas ${g}`,
    }
  })
}

export default function LeaderboardScreen({ goBack }) {
  const { user } = useAuth()
  const myGrade = gradeFromKelas(user?.kelas)

  const gradeTabs = useMemo(() => buildGradeTabs(myGrade), [myGrade])

  const [activeTab, setActiveTab] = useState('myclass')
  const [myClassData, setMyClassData] = useState(null)
  // Generic cache: { '7': data, '8': data, '9': data }
  const [gradeDataCache, setGradeDataCache] = useState({})
  const [loadingTab, setLoadingTab] = useState(false)
  const [error, setError] = useState('')
  const publicProfile = usePublicProfile()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat').then(setMyClassData).catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    if (activeTab === 'myclass') return
    if (gradeDataCache[activeTab]) return
    setLoadingTab(true)
    setError('')
    apiCall(`/api/siswa/papan-peringkat/kelas/${activeTab}`)
      .then(data => setGradeDataCache(prev => ({ ...prev, [activeTab]: data })))
      .catch(err => setError(err.message))
      .finally(() => setLoadingTab(false))
  }, [activeTab, gradeDataCache])

  const currentData = activeTab === 'myclass' ? myClassData : gradeDataCache[activeTab]
  const isLoading = activeTab === 'myclass' ? !myClassData && !error : loadingTab && !currentData

  const tabBar = (
    <div style={{ display: 'flex', gap: 8, padding: '0 0 14px', overflowX: 'auto' }}>
      {gradeTabs.map(t => (
        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
          flex: '0 0 auto', padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
          background: activeTab === t.id ? '#6366F1' : '#1A1D27',
          color: activeTab === t.id ? '#fff' : '#94A3B8',
          transition: 'background 0.15s, color 0.15s',
        }}>{t.label}</button>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#071321', color: '#fff' }}>
      <PlayerHeader />
      <TopBar title="Papan Peringkat 🏆" onBack={goBack} accentColor="#818CF8" />

      <div style={{ padding: '0 var(--page-pad) 32px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '18px 0 12px',
        }}>
          <div>
            <div style={{ color: '#fff', fontSize: isDesktop ? 20 : 18, fontWeight: 900 }}>Papan Peringkat 🏆</div>
            <div style={{ color: '#58718A', fontSize: 11, marginTop: 4 }}>Diperbarui otomatis · lihat posisi dan progres kelasmu</div>
          </div>
          <div style={{
            display: isDesktop ? 'block' : 'none', maxWidth: 340, padding: '9px 12px',
            border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12,
            background: '#0E1E35', color: '#64748B', fontSize: 10, lineHeight: 1.5,
          }}>
            <strong style={{ color: '#A5B4FC' }}>Poin</strong> = Tugas 40% + Level 20% + EXP 10% + Hafalan 30%
          </div>
        </div>
        {tabBar}

        {error && <div style={{ marginBottom: 10, color: '#F87171', fontSize: 13 }}>{error}</div>}
        {isLoading && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

        {currentData && (
          <>
            {activeTab === 'myclass' && currentData.kelas && (
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, textAlign: 'center' }}>
                Peringkat siswa kelas <span style={{ color: '#A5B4FC', fontWeight: 700 }}>{currentData.kelas}</span>
              </div>
            )}
            {activeTab !== 'myclass' && (
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, textAlign: 'center' }}>
                Peringkat semua siswa <span style={{ color: '#A5B4FC', fontWeight: 700 }}>Kelas {activeTab}</span>
              </div>
            )}

            <LeaderboardPodium leaderboard={currentData.leaderboard} publicProfile={publicProfile} />

            {!isDesktop && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94A3B8' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399' }} /> Perkalian
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94A3B8' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#60A5FA' }} /> Pembagian
                  </div>
                </div>
                <LeaderboardList leaderboard={currentData.leaderboard} publicProfile={publicProfile} />
              </>
            )}

            {isDesktop && (
              <LeaderboardTable leaderboard={currentData.leaderboard} publicProfile={publicProfile} />
            )}

            <div style={{ marginTop: 20, padding: 14, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)', fontSize: 11, color: '#6B7280', lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: '#94A3B8', marginBottom: 4 }}>📊 Cara hitung poin:</div>
              <div>📝 Rata-rata tugas <strong style={{ color: '#A5B4FC' }}>40%</strong> + 🏆 Level <strong style={{ color: '#A5B4FC' }}>20%</strong> + ⚡ EXP <strong style={{ color: '#A5B4FC' }}>10%</strong> + 🧮 Hafalan <strong style={{ color: '#A5B4FC' }}>30%</strong></div>
            </div>
          </>
        )}
      </div>
      <PublicProfileModal profile={publicProfile.profile} loading={publicProfile.loading} error={publicProfile.error} onClose={publicProfile.closeProfile} />
    </div>
  )
}
