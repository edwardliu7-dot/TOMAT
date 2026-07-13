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

export default function BadgesScreen({ goBack }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiCall('/api/siswa/lencana').then(setData).catch(err => setError(err.message))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
      <PlayerHeader />
      <TopBar title="Lencana Saya" onBack={goBack} accentColor="#818CF8" />

      {error && <div style={{ margin: '0 16px', color: '#F87171', fontSize: 13 }}>{error}</div>}
      {!data && !error && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

      {data && (
        <div style={{ padding: '0 16px 32px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, background: '#1A1D27',
            border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: 16, marginBottom: 18,
          }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(129,140,248,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏅</div>
            <div>
              <div style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Koleksi Anda</div>
              <div><span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{data.unlockedCount}</span><span style={{ color: '#94A3B8' }}> / {data.totalCount} lencana</span></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {data.badges.map(b => (
              <div key={b.id} style={{
                background: b.isUnlocked ? '#1A1D27' : '#12141C', borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.05)', padding: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8,
                opacity: b.isUnlocked ? 1 : 0.75,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                  background: b.isUnlocked ? `${b.color}33` : 'rgba(255,255,255,0.04)',
                  boxShadow: b.isUnlocked ? `0 0 14px ${b.color}44` : 'none',
                }}>
                  {b.isUnlocked ? b.icon : '🔒'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: b.isUnlocked ? '#fff' : '#6B7280' }}>{b.nama}</div>
                <div style={{ fontSize: 11, color: b.isUnlocked ? '#94A3B8' : '#4B5563', lineHeight: 1.4 }}>{b.deskripsi}</div>
                <div style={{
                  width: '100%', fontSize: 10, fontWeight: 700, padding: '5px 6px', borderRadius: 8,
                  background: b.isUnlocked ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                  color: b.isUnlocked ? '#34D399' : '#6B7280',
                  border: `1px solid ${b.isUnlocked ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                  {b.isUnlocked ? `Diraih ${formatDate(b.earnedAt)}` : 'Terkunci'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', padding: 20, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>Terus berlatih dan naik level untuk membuka lencana lainnya!</div>
          </div>
        </div>
      )}
    </div>
  )
}
