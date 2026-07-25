import React, { useState, useEffect } from 'react'
import {
  TopBar, PlayerHeader, PublicProfileModal, UserAvatar, usePublicProfile,
} from '../components/shared'

async function apiCall(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

// Two rows of 10 dots: green for perkalian, blue for pembagian
function HafalanDots({ perkalian = 0, pembagian = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: i < perkalian ? '#34D399' : 'rgba(255,255,255,0.1)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: i < pembagian ? '#60A5FA' : 'rgba(255,255,255,0.1)',
          }} />
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
            <UserAvatar
              user={{ ...s, role: 'siswa' }}
              onClick={() => publicProfile.openProfile({ ...s, role: 'siswa' })}
            />
            <button onClick={() => publicProfile.openProfile({ ...s, role: 'siswa' })} style={{
              flex: 1, minWidth: 0, border: 'none', background: 'none',
              padding: 0, color: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}>
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

// Tab types: 'myclass' | '8' | '9'
const GRADE_TABS = [
  { id: 'myclass', label: '🏫 Kelasku' },
  { id: '8',       label: '📗 Kelas 8' },
  { id: '9',       label: '📘 Kelas 9' },
]

export default function LeaderboardScreen({ goBack }) {
  const [activeTab, setActiveTab] = useState('myclass')
  const [myClassData, setMyClassData]   = useState(null)
  const [grade8Data, setGrade8Data]     = useState(null)
  const [grade9Data, setGrade9Data]     = useState(null)
  const [loadingTab, setLoadingTab]     = useState(false)
  const [error, setError]               = useState('')
  const publicProfile = usePublicProfile()

  // Always fetch my class on mount
  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat').then(setMyClassData).catch(err => setError(err.message))
  }, [])

  // Fetch grade data on demand
  useEffect(() => {
    if (activeTab === 'myclass') return
    const grade = activeTab
    const already = grade === '8' ? grade8Data : grade9Data
    if (already) return
    setLoadingTab(true)
    setError('')
    apiCall(`/api/siswa/papan-peringkat/kelas/${grade}`)
      .then(data => {
        if (grade === '8') setGrade8Data(data)
        else setGrade9Data(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingTab(false))
  }, [activeTab, grade8Data, grade9Data])

  const currentData = activeTab === 'myclass' ? myClassData : (activeTab === '8' ? grade8Data : grade9Data)
  const isLoading   = activeTab === 'myclass' ? !myClassData && !error : loadingTab && !currentData

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
      <PlayerHeader />
      <TopBar title="Papan Peringkat" onBack={goBack} accentColor="#818CF8" />

      {/* Grade tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
        {GRADE_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: '0 0 auto', padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: activeTab === t.id ? '#6366F1' : '#1A1D27',
            color: activeTab === t.id ? '#fff' : '#94A3B8',
            transition: 'background 0.15s, color 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {error && <div style={{ margin: '0 16px', color: '#F87171', fontSize: 13 }}>{error}</div>}
      {isLoading && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

      {currentData && (
        <div style={{ padding: '0 16px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {activeTab === 'myclass' && currentData.kelas && (
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6, textAlign: 'center' }}>
              Peringkat siswa kelas <span style={{ color: '#A5B4FC', fontWeight: 700 }}>{currentData.kelas}</span>
            </div>
          )}
          {activeTab !== 'myclass' && (
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6, textAlign: 'center' }}>
              Peringkat semua siswa <span style={{ color: '#A5B4FC', fontWeight: 700 }}>Kelas {activeTab}</span>
            </div>
          )}

          {/* Dot legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94A3B8' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399' }} />
              Perkalian
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94A3B8' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#60A5FA' }} />
              Pembagian
            </div>
          </div>

          <LeaderboardList leaderboard={currentData.leaderboard} publicProfile={publicProfile} />

          {/* Score breakdown legend */}
          <div style={{
            marginTop: 20, padding: 14, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)',
            fontSize: 11, color: '#6B7280', lineHeight: 1.8,
          }}>
            <div style={{ fontWeight: 700, color: '#94A3B8', marginBottom: 4 }}>📊 Cara hitung poin:</div>
            <div>📝 Rata-rata tugas <strong style={{ color: '#A5B4FC' }}>40%</strong> + 🏆 Level <strong style={{ color: '#A5B4FC' }}>20%</strong> + ⚡ EXP <strong style={{ color: '#A5B4FC' }}>10%</strong> + 🧮 Hafalan <strong style={{ color: '#A5B4FC' }}>30%</strong></div>
          </div>
          <PublicProfileModal
            profile={publicProfile.profile}
            loading={publicProfile.loading}
            error={publicProfile.error}
            onClose={publicProfile.closeProfile}
          />
        </div>
      )}
    </div>
  )
}
