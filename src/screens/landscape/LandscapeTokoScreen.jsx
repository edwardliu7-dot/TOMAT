import { useState, useEffect } from 'react'
import { usePlayer } from '../../PlayerContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f' }

const TABS = [
  { id:'featured', label:'Unggulan', icon:'⭐' },
  { id:'skin', label:'Skin Pet', icon:'🐾' },
  { id:'booster', label:'Booster EXP', icon:'⚡' },
  { id:'avatar', label:'Avatar & Frame', icon:'🖼' },
  { id:'emote', label:'Emote', icon:'😊' },
]

export default function LandscapeTokoScreen({ goBack }) {
  const { player, addCoins } = usePlayer()
  const coins = player?.coins ?? 0
  const spendCoins = (amount) => addCoins && addCoins(-amount)
  const [activeTab, setActiveTab] = useState('featured')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    fetch('/api/siswa/toko', { credentials:'include' })
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        setItems(data.items || data.skins || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'featured'
    ? items.slice(0, 9)
    : items.filter(it => {
        if (activeTab === 'skin') return it.category === 'skin' || it.type === 'skin'
        if (activeTab === 'booster') return it.category === 'booster' || it.type === 'booster'
        if (activeTab === 'avatar') return it.category === 'avatar' || it.type === 'avatar' || it.category === 'frame'
        if (activeTab === 'emote') return it.category === 'emote' || it.type === 'emote'
        return true
      })

  const buyItem = async (item) => {
    if (buying) return
    if ((coins||0) < (item.harga||item.price||0)) { setNotice('Koin tidak cukup!'); setTimeout(() => setNotice(null), 2000); return }
    setBuying(item.id)
    try {
      const r = await fetch('/api/siswa/toko/beli', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ itemId: item.id }) })
      if (r.ok) {
        spendCoins && spendCoins(item.harga||item.price||0)
        setNotice(`${item.name||item.nama} dibeli! 🎉`)
        setTimeout(() => setNotice(null), 2500)
      } else {
        const e = await r.json().catch(()=>({}))
        setNotice(e.error || 'Gagal membeli')
        setTimeout(() => setNotice(null), 2500)
      }
    } catch { setNotice('Terjadi kesalahan'); setTimeout(() => setNotice(null), 2500) }
    finally { setBuying(null) }
  }

  const dailyDeal = items.find(it => it.discount || it.discountPct || it.sale)

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', overflow:'hidden', position:'relative' }}>
      {/* Notice toast */}
      {notice && <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', background:'#1c2340', border:'0.5px solid #313a5c', borderRadius:9, padding:'8px 18px', color:C.txt, fontSize:10.5, fontWeight:600, zIndex:100, whiteSpace:'nowrap' }}>{notice}</div>}

      {/* PANEL KIRI */}
      <div style={{ width:'26%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', padding:'10px 10px 10px 14px', gap:8 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:14, cursor:'pointer' }} onClick={goBack}>‹</div>
            <span style={{ color:C.txt, fontSize:14, fontWeight:700 }}>Toko</span>
          </div>
          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'4px 10px', display:'flex', alignItems:'center', gap:4, color:C.gold, fontSize:10.5, fontWeight:700 }}>
            <span style={{ fontSize:12 }}>🪙</span> {(coins||0).toLocaleString('id')}
          </div>
        </div>

        {/* Tabs vertikal */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: t.id===activeTab?'#3c3489':C.card, border: t.id===activeTab?'none':`0.5px solid ${C.border}`, borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:7, cursor:'pointer', color: t.id===activeTab?'#eeedfe':C.sub, fontSize:10.5, fontWeight: t.id===activeTab?600:400 }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>

        {/* Daily deal */}
        {dailyDeal && (
          <div style={{ background:'linear-gradient(135deg,#8c3518,#712b13)', borderRadius:10, padding:'10px 11px', marginTop:'auto', boxShadow:'0 3px 12px rgba(113,43,19,0.4)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-8, top:-8, width:50, height:50, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
            <div style={{ color:'#f5c4b3', fontSize:8, fontWeight:700, letterSpacing:0.8, marginBottom:2 }}>⏱ PENAWARAN HARI INI</div>
            <div style={{ color:'#faece7', fontSize:11, fontWeight:700 }}>{dailyDeal.name||dailyDeal.nama}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:5 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700 }}>🪙 {(dailyDeal.harga||dailyDeal.price||0).toLocaleString('id')}</div>
              <div style={{ background:`linear-gradient(135deg,${C.orange},#c94f2d)`, color:'#fff', fontSize:10, fontWeight:900, padding:'4px 8px', borderRadius:7 }}>-{dailyDeal.discountPct||dailyDeal.discount||30}%</div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL KANAN: Item grid */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 14px', gap:7 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ color:C.sub, fontSize:10.5, fontWeight:600 }}>{TABS.find(t=>t.id===activeTab)?.label}</span>
          <span style={{ color:C.muted, fontSize:9 }}>{filtered.length} item</span>
        </div>

        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>Memuat item...</div>
        ) : filtered.length === 0 ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>Tidak ada item di kategori ini</div>
        ) : (
          <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, alignContent:'start' }}>
            {filtered.map((item, i) => {
              const price = item.harga || item.price || 0
              const name = item.name || item.nama || 'Item'
              const locked = item.locked || (item.level_required && (item.level_required > 1))
              const owned = item.owned || item.dimiliki
              return (
                <div key={item.id||i} style={{ background: locked?'#161c33':C.card, border: locked?`0.5px dashed ${C.border}`:`0.5px solid ${C.border}`, borderRadius:11, padding:'10px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, position:'relative', opacity: locked?0.55:1, cursor: locked?'default':'pointer' }}>
                  {item.badge && <div style={{ position:'absolute', top:5, right:5, background:'#3c3489', color:'#eeedfe', fontSize:7.5, fontWeight:700, padding:'1px 5px', borderRadius:5 }}>{item.badge}</div>}
                  {owned && <div style={{ position:'absolute', top:5, left:5, fontSize:12 }}>✅</div>}
                  <div style={{ width:48, height:48, borderRadius:10, background: item.bg||'#2a3158', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 3px 10px rgba(0,0,0,0.3)' }}>
                    {item.emoji||item.icon||'🎁'}
                  </div>
                  <div style={{ color: locked?C.muted:C.txt, fontSize:9.5, fontWeight:600, textAlign:'center', lineHeight:1.3, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                  {price > 0 && !owned && !locked && (
                    <>
                      <div style={{ color:C.gold, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:2 }}>🪙 {price.toLocaleString('id')}</div>
                      <div onClick={() => buyItem(item)} style={{ width:'90%', background:`linear-gradient(135deg,${C.orange},#c94f2d)`, borderRadius:6, padding:'4px 0', textAlign:'center', color:'#fff', fontSize:8.5, fontWeight:700, opacity: buying===item.id?0.6:1 }}>{buying===item.id?'...':'Beli'}</div>
                    </>
                  )}
                  {owned && <div style={{ color:C.green, fontSize:8.5, fontWeight:700 }}>Dimiliki</div>}
                  {locked && <div style={{ color:C.muted, fontSize:8, display:'flex', alignItems:'center', gap:3 }}>🔒 Lv {item.level_required||5}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
