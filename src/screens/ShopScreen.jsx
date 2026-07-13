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
    return <div style={{ width: '100%', height: 64, borderRadius: 12, background: v.gradient || '#334155' }} />
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
                  <ItemVisual item={item} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{item.nama}</div>
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
