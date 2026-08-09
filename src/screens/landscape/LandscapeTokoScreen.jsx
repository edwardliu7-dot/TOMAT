import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import PetSVG, { getPetName } from '../../components/PetSVG'
import {
  KATEGORI_LABELS, PET_SKIN_INFO,
  BINGKAI_VISUALS, SPANDUK_VISUALS, TEMA_VISUALS,
} from '../../shopVisuals'

// ── Matches real ShopScreen tabs ──────────────────────────────────────────────
const TABS = [
  { id: 'event',    icon: '🎉' },
  { id: 'pet_skin', icon: '🐾' },
  { id: 'bingkai',  icon: '🖼️' },
  { id: 'spanduk',  icon: '🏳️' },
  { id: 'tema',     icon: '✨' },
]

const C = {
  bg:'#0d1117', panel:'#161b27', card:'#1c2340', border:'#252f4a',
  txt:'#f2ede3', sub:'#8b8f9e', muted:'#4a5280', green:'#5dcaa5',
  gold:'#fac775', purple:'#cecbf6', orange:'#e2653f', accent:'#6366f1',
}

async function api(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan.')
  return d
}

// ── Item visual helpers ───────────────────────────────────────────────────────
function BingkaiPreview({ item }) {
  const v = item.visual || BINGKAI_VISUALS[item.id] || {}
  const outer = 52, sf = v.spread ?? 0.35
  const photoSz = Math.round(outer / (1 + 2 * sf))
  if (v.image) {
    return (
      <div style={{ width: outer, height: outer, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: photoSz, height: photoSz, borderRadius: '50%', background: '#1c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(photoSz * 0.45) }}>🧑‍🎓</div>
        <img src={v.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: v.mixBlend ?? 'normal', filter: v.border ? `drop-shadow(0 0 4px ${v.border}cc)` : 'none' }} />
      </div>
    )
  }
  return <div style={{ width: outer, height: outer, borderRadius: '50%', border: `2px solid ${v.border || '#6366f1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</div>
}

function SpandukPreview({ item }) {
  const v = item.visual || SPANDUK_VISUALS[item.id] || {}
  return (
    <div style={{ width: '100%', height: 36, borderRadius: 6, background: v.gradient || '#1c2340', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {v.image && <img src={v.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
    </div>
  )
}

function TemaPreview({ item }) {
  const v = item.visual || TEMA_VISUALS[item.id] || {}
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
      {(v.swatches || ['#12172b', '#1c2340', '#5dcaa5', '#fac775']).map((c, i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
      ))}
    </div>
  )
}

function PetSkinPreview({ skinId }) {
  return (
    <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <PetSVG skinId={skinId} state="idle" size={52} />
    </div>
  )
}

function ItemVisual({ item }) {
  if (item.kategori === 'pet_skin') return <PetSkinPreview skinId={item.id} />
  if (item.kategori === 'bingkai') return <BingkaiPreview item={item} />
  if (item.kategori === 'spanduk') return <SpandukPreview item={item} />
  if (item.kategori === 'tema') return <TemaPreview item={item} />
  // event items may be any sub-type
  const v = item.visual || {}
  if (v.image) return <img src={v.image} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
  return <div style={{ fontSize: 26 }}>{item.emoji || '🎁'}</div>
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandscapeTokoScreen({ goBack, initialTab }) {
  const { refreshMe } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab || 'event')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const toast = (msg, ok = true) => {
    setNotice({ msg, ok })
    setTimeout(() => setNotice(null), 2500)
  }

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const d = await api('/api/siswa/toko')
      setData(d)
    } catch (e) { toast(e.message, false) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const buy = async (item) => {
    if (busyId) return
    setBusyId(item.id)
    try {
      await api('/api/siswa/toko/beli', { method: 'POST', body: { itemId: item.id } })
      toast(`${item.nama} dibeli! 🎉`)
      await refresh()
    } catch (e) { toast(e.message, false) }
    finally { setBusyId(null) }
  }

  const equip = async (item) => {
    if (busyId) return
    setBusyId(item.id)
    try {
      const body = item.id === null ? { itemId: null, kategori: item.kategori } : { itemId: item.id }
      await api('/api/siswa/toko/pakai', { method: 'POST', body })
      toast(`${item.nama} dipakai! ✨`)
      await refresh()
      await refreshMe()
    } catch (e) { toast(e.message, false) }
    finally { setBusyId(null) }
  }

  // ── Filtered items ──────────────────────────────────────────────────────────
  const coins = data?.coins ?? 0
  const ownedIds = new Set(data?.ownedItemIds || [])
  const equipped = data?.equipped || {}

  const tabItems = (() => {
    if (!data) return []
    if (activeTab === 'event') {
      // Event items: items with visual.eventSlug matching active events
      const active = new Set(data.activeEvents || [])
      return data.items.filter(it => it.visual?.eventSlug && active.has(it.visual.eventSlug))
    }
    return data.items.filter(it => it.kategori === activeTab)
  })()

  // Pet skins: supplement API items with PET_SKIN_INFO for display
  const petSkinItems = activeTab === 'pet_skin'
    ? tabItems.map(it => ({ ...it, _info: PET_SKIN_INFO[it.id] || {} }))
    : []

  const renderItems = activeTab === 'pet_skin' ? petSkinItems : tabItems

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', overflow:'hidden', position:'relative', color:C.txt }}>

      {/* Toast */}
      {notice && (
        <div style={{ position:'fixed', top:12, left:'50%', transform:'translateX(-50%)', background: notice.ok?'#1c3d29':'#3a1c1c', border:`0.5px solid ${notice.ok?'#5dcaa5':'#e2653f'}`, borderRadius:10, padding:'7px 18px', fontSize:10.5, fontWeight:600, zIndex:200, whiteSpace:'nowrap', color: notice.ok?C.green:'#f5c4b3' }}>
          {notice.msg}
        </div>
      )}

      {/* ── PANEL KIRI ── */}
      <div style={{ width: 'min(22%, 200px)', borderRight:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', padding:'10px 8px', gap:6, background:C.panel, flexShrink:0 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, fontSize:13, cursor:'pointer' }} onClick={goBack}>‹</div>
            <span style={{ color:C.txt, fontSize:13, fontWeight:700 }}>Toko</span>
          </div>
          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:7, padding:'3px 8px', display:'flex', alignItems:'center', gap:3, color:C.gold, fontSize:10, fontWeight:700 }}>
            🪙 {coins.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Tabs */}
        {TABS.map(t => {
          const active = t.id === activeTab
          return (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ borderRadius:8, padding:'7px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:10.5, fontWeight: active?700:400, background: active?'rgba(99,102,241,0.18)':'transparent', borderLeft:`3px solid ${active?C.accent:'transparent'}`, color: active?'#c4b5fd':C.sub, transition:'all .15s' }}>
              <span style={{ fontSize:13 }}>{t.icon}</span>
              {KATEGORI_LABELS[t.id] || t.id}
            </div>
          )
        })}

        {/* Coin shortcut */}
        <div style={{ marginTop:'auto', background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08))', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 10px' }}>
          <div style={{ color:'#a5b4fc', fontSize:7.5, fontWeight:700, letterSpacing:0.8, marginBottom:3 }}>SALDO KOIN</div>
          <div style={{ color:C.gold, fontSize:14, fontWeight:700 }}>🪙 {coins.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* ── PANEL KANAN ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Subheader */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px 7px', borderBottom:`0.5px solid ${C.border}`, flexShrink:0 }}>
          <span style={{ color:C.sub, fontSize:11, fontWeight:700 }}>{KATEGORI_LABELS[activeTab]}</span>
          <span style={{ color:C.muted, fontSize:9 }}>{renderItems.length} item</span>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'10px 14px 14px' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:C.muted, fontSize:11 }}>Memuat…</div>
          ) : renderItems.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:C.muted, gap:8 }}>
              <div style={{ fontSize:28 }}>✨</div>
              <div style={{ fontSize:11, fontWeight:600, color:C.sub }}>Segera Hadir</div>
              <div style={{ fontSize:9 }}>Item baru sedang disiapkan.</div>
            </div>
          ) : (
            <ItemGrid
              items={renderItems}
              tab={activeTab}
              ownedIds={ownedIds}
              equipped={equipped}
              coins={coins}
              busyId={busyId}
              onBuy={buy}
              onEquip={equip}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Item grid ─────────────────────────────────────────────────────────────────
function ItemGrid({ items, tab, ownedIds, equipped, coins, busyId, onBuy, onEquip }) {
  const C2 = { txt:'#f2ede3', sub:'#8b8f9e', muted:'#4a5280', green:'#5dcaa5', gold:'#fac775', orange:'#e2653f', card:'#1c2340', border:'#252f4a' }

  // Spanduk & tema: single column list
  const isList = tab === 'spanduk' || tab === 'tema'
  const cols = isList ? '1fr' : 'repeat(auto-fill, minmax(120px, 1fr))'

  return (
    <div style={{ display:'grid', gridTemplateColumns: cols, gap: isList?6:8, alignContent:'start' }}>
      {items.map((item, i) => {
        const price = item.harga || 0
        const name = item.nama || item.name || 'Item'
        const owned = ownedIds.has(item.id) || item.id === 'golden'
        const isEquipped = equipped[item.kategori] === item.id || (item.id === 'golden' && !equipped.pet_skin)
        const affordable = coins >= price
        const busy = busyId === item.id

        if (isList) {
          // Wide row layout for spanduk/tema
          return (
            <div key={item.id || i} style={{ background: isEquipped?'rgba(99,102,241,0.14)':C2.card, border:`0.5px solid ${isEquipped?'rgba(99,102,241,0.5)':C2.border}`, borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flexShrink:0 }}><ItemVisual item={item} /></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C2.txt, fontSize:11, fontWeight:600 }}>{name}</div>
                {item.visual?.limited && <div style={{ color:'#c084fc', fontSize:8.5, fontWeight:700, marginTop:1 }}>★ Limited</div>}
              </div>
              <ActionBtn item={item} owned={owned} equipped={isEquipped} affordable={affordable} busy={busy} onBuy={onBuy} onEquip={onEquip} price={price} />
            </div>
          )
        }

        // Grid card layout
        return (
          <div key={item.id || i} style={{ background:C2.card, border:`0.5px solid ${isEquipped?'rgba(99,102,241,0.5)':C2.border}`, borderRadius:11, padding:'10px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, position:'relative', cursor:'pointer' }}>
            {item.visual?.limited && <div style={{ position:'absolute', top:4, right:4, background:'rgba(192,132,252,0.2)', color:'#c084fc', fontSize:7, fontWeight:800, padding:'1px 4px', borderRadius:4 }}>LIMITED</div>}
            {isEquipped && <div style={{ position:'absolute', top:4, left:4, fontSize:10 }}>✅</div>}

            <ItemVisual item={item} />

            <div style={{ color:C2.txt, fontSize:9, fontWeight:600, textAlign:'center', lineHeight:1.3, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>{name}</div>

            {tab === 'pet_skin' && PET_SKIN_INFO[item.id]?.desc && (
              <div style={{ color:C2.muted, fontSize:7.5, textAlign:'center', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', width:'100%' }}>
                {PET_SKIN_INFO[item.id].desc}
              </div>
            )}

            <div style={{ width:'100%' }}>
              <ActionBtn item={item} owned={owned} equipped={isEquipped} affordable={affordable} busy={busy} onBuy={onBuy} onEquip={onEquip} price={price} compact />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ActionBtn({ item, owned, equipped, affordable, busy, onBuy, onEquip, price, compact }) {
  const C3 = { orange:'#e2653f', green:'#5dcaa5', gold:'#fac775', muted:'#4a5280', card:'#1c2340', border:'#252f4a' }
  const baseStyle = { borderRadius:6, textAlign:'center', fontSize: compact?8:9.5, fontWeight:700, cursor:'pointer', padding: compact?'4px 0':'6px 0', width:'100%', border:'none', fontFamily:'inherit' }

  if (equipped) return <div style={{ ...baseStyle, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', cursor:'default' }}>✓ Dipakai</div>
  if (owned) return <button style={{ ...baseStyle, background:'rgba(93,202,165,0.12)', color:C3.green }} onClick={() => onEquip(item)}>Pakai</button>
  if (!affordable) return <div style={{ ...baseStyle, background:C3.card, border:`0.5px solid ${C3.border}`, color:C3.muted, cursor:'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:2 }}><span>🪙</span>{price.toLocaleString('id-ID')}</div>

  return (
    <button style={{ ...baseStyle, background: busy?'rgba(226,101,63,0.5)':`linear-gradient(135deg,${C3.orange},#c94f2d)`, color:'#fff', opacity: busy?0.7:1 }} onClick={() => onBuy(item)} disabled={busy}>
      {busy ? '…' : <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}><span>🪙</span>{price.toLocaleString('id-ID')}</span>}
    </button>
  )
}
