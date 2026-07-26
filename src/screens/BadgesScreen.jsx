import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'

async function apiCall(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'unlocked', label: '✅ Diraih' },
  { id: 'locked', label: '🔒 Belum Diraih' },
]

function BadgeCard({ b, desktop }) {
  return (
    <div style={{
      background: b.isUnlocked ? '#1A1D27' : '#12141C', borderRadius: desktop ? 20 : 18,
      border: `1px solid ${b.isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      padding: desktop ? 20 : 14,
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8,
      opacity: b.isUnlocked ? 1 : 0.35,
      filter: b.isUnlocked ? 'none' : 'grayscale(1)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { if (b.isUnlocked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${b.color}33` } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{
        width: desktop ? 72 : 64, height: desktop ? 72 : 64, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: desktop ? 34 : 30,
        background: b.isUnlocked ? `${b.color}33` : 'rgba(255,255,255,0.04)',
        boxShadow: b.isUnlocked ? `0 0 14px ${b.color}44` : 'none',
      }}>
        {b.isUnlocked ? b.icon : '🔒'}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: b.isUnlocked ? '#fff' : '#6B7280' }}>{b.nama}</div>
      <div style={{ fontSize: 11, color: b.isUnlocked ? '#94A3B8' : '#4B5563', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.deskripsi}</div>
      <div style={{
        width: '100%', fontSize: 10, fontWeight: 700, padding: '5px 6px', borderRadius: 8,
        background: b.isUnlocked ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
        color: b.isUnlocked ? '#34D399' : '#6B7280',
        border: `1px solid ${b.isUnlocked ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'}`,
      }}>
        {b.isUnlocked ? `Diraih ${formatDate(b.earnedAt)}` : 'Terkunci'}
      </div>
    </div>
  )
}

export default function BadgesScreen({ goBack }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const isDesktop = useIsDesktop()

  useEffect(() => {
    apiCall('/api/siswa/lencana').then(setData).catch(err => setError(err.message))
  }, [])

  const filteredBadges = data?.badges?.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked
    if (filter === 'locked') return !b.isUnlocked
    return true
  }) || []

  const pct = data ? Math.round((data.unlockedCount / data.totalCount) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
      <PlayerHeader />
      <TopBar title="Lencana Saya" onBack={goBack} accentColor="#818CF8" />

      {error && <div style={{ margin: '0 16px', color: '#F87171', fontSize: 13 }}>{error}</div>}
      {!data && !error && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

      {data && (
        <div style={{ padding: '0 var(--page-pad) 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {/* Header summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
            border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '18px 20px',
            marginBottom: 20,
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(129,140,248,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏅</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Koleksi Lencana</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{data.unlockedCount}<span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 400 }}> / {data.totalCount} lencana</span></div>
              <div style={{ marginTop: 8, height: 6, background: 'rgba(129,140,248,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366F1, #A78BFA)', borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#818CF8', flexShrink: 0 }}>{pct}%</div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4 }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  flex: 1, border: 'none', borderRadius: 8, padding: '9px 12px',
                  background: filter === f.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: filter === f.id ? '#A5B4FC' : '#64748B',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >{f.label}</button>
            ))}
          </div>

          {filteredBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>Tidak ada lencana untuk filter ini.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>
              {filteredBadges.map(b => (
                <BadgeCard key={b.id} b={b} desktop={isDesktop} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', padding: 20, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>Terus berlatih dan naik level untuk membuka lencana lainnya!</div>
          </div>
        </div>
      )}
    </div>
  )
}
