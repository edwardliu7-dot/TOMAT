import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { BINGKAI_VISUALS } from '../shopVisuals'

async function apiCall(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Avatar({ name, bingkaiId, size = 40 }) {
  const v = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#6366F1,#A855F7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 800, color: '#fff',
      border: v ? `3px ${v.style} ${v.border}` : '2px solid rgba(255,255,255,0.15)',
      boxShadow: v?.glow ? `0 0 10px ${v.border}88` : 'none',
    }}>{name?.[0]?.toUpperCase()}</div>
  )
}

export default function LeaderboardScreen({ goBack }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat').then(setData).catch(err => setError(err.message))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
      <PlayerHeader />
      <TopBar title="Papan Peringkat" onBack={goBack} accentColor="#818CF8" />

      {error && <div style={{ margin: '0 16px', color: '#F87171', fontSize: 13 }}>{error}</div>}
      {!data && !error && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

      {data && (
        <div style={{ padding: '0 16px 32px' }}>
          {data.kelas && (
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, textAlign: 'center' }}>
              Peringkat siswa kelas <span style={{ color: '#A5B4FC', fontWeight: 700 }}>{data.kelas}</span>
            </div>
          )}
          {data.leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Belum ada siswa lain di kelasmu.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.leaderboard.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  background: s.isMe ? 'rgba(99,102,241,0.15)' : '#1A1D27',
                  border: s.isMe ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ width: 28, textAlign: 'center', fontSize: s.rank <= 3 ? 20 : 14, fontWeight: 800, color: s.rank <= 3 ? '#fff' : '#6B7280' }}>
                    {MEDALS[s.rank] || `#${s.rank}`}
                  </div>
                  <Avatar name={s.name} bingkaiId={s.equippedBingkai} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}{s.isMe && <span style={{ color: '#A5B4FC' }}> (Kamu)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Level {s.level} · {s.exp} EXP</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
