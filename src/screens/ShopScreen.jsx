import React, { useState, useEffect, useCallback } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useAuth } from '../AuthContext'
import { KATEGORI_LABELS } from '../shopVisuals'

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const TABS = ['bingkai', 'spanduk', 'tema', 'stiker']

function ItemVisual({ item }) {
  const luxury = item.visual?.luxury
  if (luxury === 'aurum') {
    return (
      <div style={{
        width: '100%', height: 150, borderRadius: 8, padding: 1,
        background: 'linear-gradient(145deg,#fff5b8,#d4af37 22%,#2a220b 52%,#aa7c11)',
        boxShadow: '0 12px 26px rgba(212,175,55,0.18)',
      }}>
        <div style={{
          height: '100%', borderRadius: 7, background: 'radial-gradient(circle at 50% 32%,rgba(212,175,55,.28),transparent 45%),#0a0a0a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#e8d08c', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(212,175,55,.45)' }} />
          <div style={{ fontSize: 42, lineHeight: 1, filter: 'drop-shadow(0 0 10px rgba(212,175,55,.5))' }}>♛</div>
          <div style={{ marginTop: 10, fontSize: 9, letterSpacing: 2.2, fontWeight: 800 }}>AURUM SOVEREIGN</div>
        </div>
      </div>
    )
  }
  if (luxury === 'void') {
    return (
      <div style={{
        width: '100%', height: 150, borderRadius: 8, background: 'radial-gradient(circle at 50% 22%,rgba(79,70,229,.24),transparent 46%),#040406',
        border: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#a5b4fc', boxShadow: '0 12px 30px rgba(49,46,129,.2)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 112, height: 112, border: '1px dashed rgba(99,102,241,.35)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: 78, height: 78, border: '1px solid rgba(129,140,248,.3)', borderRadius: '50%' }} />
        <div style={{ fontSize: 38, lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(99,102,241,.8))' }}>◈</div>
        <div style={{ marginTop: 12, fontSize: 9, letterSpacing: 2, fontWeight: 800, zIndex: 1 }}>VOID MONARCH</div>
      </div>
    )
  }
  if (luxury === 'celestia' || luxury === 'royal') {
    const celestial = luxury === 'celestia'
    return (
      <div style={{
        width: '100%', height: 116, borderRadius: 12,
        background: celestial
          ? 'linear-gradient(145deg,#0f172a,#030712 72%)'
          : 'linear-gradient(145deg,#0d1222,#05070c 72%)',
        border: `1px solid ${celestial ? 'rgba(96,165,250,.35)' : 'rgba(212,175,55,.3)'}`,
        display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', position: 'relative', overflow: 'hidden',
        boxShadow: celestial ? '0 12px 28px rgba(37,99,235,.16)' : '0 12px 28px rgba(212,175,55,.12)',
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
          border: `1px ${celestial ? 'solid' : 'dashed'} ${celestial ? 'rgba(147,197,253,.55)' : 'rgba(212,175,55,.55)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: celestial ? '#bfdbfe' : '#d4af37', fontSize: 30,
          boxShadow: celestial ? '0 0 28px rgba(96,165,250,.24)' : '0 0 24px rgba(212,175,55,.2)',
        }}>{celestial ? '✦' : '◇'}</div>
        <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ color: celestial ? '#dbeafe' : '#f5e7b2', fontSize: 13, fontWeight: 700, letterSpacing: .5 }}>
            {celestial ? 'PIJAR BINTANG' : 'DEKRIT MAHAGURU'}
          </div>
          <div style={{ color: celestial ? '#93c5fd' : '#d4af37', fontSize: 9, letterSpacing: 1.4, marginTop: 6, fontWeight: 800 }}>
            {celestial ? 'COSMIC RELIC' : 'ACADEMIC ROYALTY'}
          </div>
        </div>
      </div>
    )
  }
  if (item.kategori === 'bingkai') {
    const v = item.visual || {}
    return (
      <div style={{
        width: 76, height: 76, borderRadius: '50%',
        border: `4px ${v.style || 'solid'} ${v.border || '#67E8F9'}`,
        boxShadow: v.glow ? `0 0 16px ${v.border}88` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#1E2128', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🧑‍🎓</div>
      </div>
    )
  }
  if (item.kategori === 'spanduk') {
    const v = item.visual || {}
    return (
      <div style={{
        width: '100%', height: 64, borderRadius: 12, background: v.gradient || '#334155',
        boxShadow: v.glow ? '0 0 20px rgba(212,175,55,0.3)' : 'none',
        border: v.limited ? '1px solid rgba(212,175,55,0.55)' : 'none',
      }} />
    )
  }
  if (item.kategori === 'stiker') {
    const emoji = item.visual?.emoji || '🪄'
    const tier = item.visual?.tier || 'common'
    const tierBg = tier === 'epic' ? 'radial-gradient(circle,#3b0764,#1e1b4b)' : tier === 'rare' ? 'radial-gradient(circle,#1e3a5f,#0f172a)' : 'radial-gradient(circle,#1e293b,#0f172a)'
    const tierBorder = tier === 'epic' ? 'rgba(168,85,247,0.5)' : tier === 'rare' ? 'rgba(96,165,250,0.5)' : 'rgba(100,116,139,0.4)'
    return (
      <div style={{
        width: '100%', height: 100, borderRadius: 12, background: tierBg,
        border: `1px solid ${tierBorder}`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <div style={{ fontSize: 44, lineHeight: 1 }}>{emoji}</div>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
          color: tier === 'epic' ? '#c084fc' : tier === 'rare' ? '#93c5fd' : '#94a3b8',
        }}>{tier === 'epic' ? '★ Epik' : tier === 'rare' ? '◆ Langka' : 'Umum'}</div>
      </div>
    )
  }
  return <div style={{ width: 76, height: 76, borderRadius: 12, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>❔</div>
}

export default function ShopScreen({ goBack }) {
  const { refreshMe } = useAuth()
  const [tab, setTab] = useState('bingkai')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const d = await apiCall('/api/siswa/toko')
      setData(d)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const buy = async (item) => {
    setError('')
    setBusyId(item.id)
    try {
      await apiCall('/api/siswa/toko/beli', { method: 'POST', body: { itemId: item.id } })
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const equip = async (item) => {
    setError('')
    setBusyId(item.id)
    try {
      await apiCall('/api/siswa/toko/pakai', { method: 'POST', body: { itemId: item.id } })
      await refresh()
      await refreshMe()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
        <PlayerHeader />
        <TopBar title="Toko Kosmetik" onBack={goBack} accentColor="#818CF8" />
        <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>{error || 'Memuat…'}</div>
      </div>
    )
  }

  const items = data.items.filter(it => it.kategori === tab)

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D14' }}>
      <PlayerHeader />
      <TopBar title="Toko Kosmetik" onBack={goBack} accentColor="#818CF8" />

      <div style={{ margin: '0 16px 16px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Saldo Koin</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>🪙 {data.coins.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: '0 0 auto', padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: tab === t ? '#6366F1' : '#1A1D27', color: tab === t ? '#fff' : '#94A3B8',
          }}>{KATEGORI_LABELS[t]}</button>
        ))}
      </div>

      {error && <div style={{ margin: '0 16px 12px', color: '#F87171', fontSize: 13 }}>{error}</div>}

      <div style={{ padding: '0 16px 32px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
            <div style={{ fontWeight: 700, color: '#94A3B8' }}>Segera Hadir</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Item baru untuk kategori ini sedang disiapkan.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'spanduk' ? '1fr' : 'repeat(2,1fr)', gap: 12 }}>
            {items.map(item => {
              const owned = data.ownedItemIds.includes(item.id)
              const equipped = data.equipped[item.kategori] === item.id
              const affordable = data.coins >= item.harga
              const busy = busyId === item.id
              return (
                <div key={item.id} style={{
                  background: '#1A1D27', borderRadius: 16, padding: 14,
                  border: `1px solid ${equipped ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative',
                }}>
                  {equipped && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#EAB308', color: '#000', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: '0 14px 0 10px' }}>DIPAKAI</div>
                  )}
                   {item.visual?.limited && !equipped && (
                     <div style={{ position: 'absolute', top: 0, left: 0, background: 'linear-gradient(90deg,#D4AF37,#F8E7A1)', color: '#21180a', fontSize: 9, fontWeight: 900, letterSpacing: 0.7, padding: '4px 7px', borderRadius: '14px 0 10px 0' }}>
                       LIMITED
                     </div>
                   )}
                  <ItemVisual item={item} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{item.nama}</div>
                   {item.visual?.edition && (
                     <div style={{ fontSize: 10, color: '#D4AF37', fontWeight: 800, letterSpacing: 0.8 }}>EDISI {item.visual.edition}</div>
                   )}
                   {item.visual?.description && (
                     <div style={{ fontSize: 10, lineHeight: 1.35, color: '#94A3B8', textAlign: 'center' }}>{item.visual.description}</div>
                   )}
                  {equipped ? (
                    <button disabled style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: 'none', fontSize: 12, fontWeight: 700 }}>✓ Terpasang</button>
                  ) : owned ? (
                    <button onClick={() => equip(item)} disabled={busy} style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: '#334155', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {busy ? '…' : 'Pakai'}
                    </button>
                  ) : (
                    <button onClick={() => buy(item)} disabled={!affordable || busy} style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      background: affordable ? '#6366F1' : 'rgba(248,113,113,0.15)',
                      color: affordable ? '#fff' : '#F87171',
                    }}>
                      {busy ? '…' : affordable ? `Beli 🪙 ${item.harga.toLocaleString('id-ID')}` : `🔒 🪙 ${item.harga.toLocaleString('id-ID')}`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
