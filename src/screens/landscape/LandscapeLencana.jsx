import { useState, useEffect } from 'react'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

const RARITY_COLOR = { Epic:'#f0997b', Langka:'#cecbf6', Umum:'#5dcaa5' }
const RARITY_BG = { Epic:'#2a1208', Langka:'#1a1535', Umum:'#0d2218' }

export default function LandscapeLencana({ goBack }) {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Semua')

  useEffect(() => {
    fetch('/api/siswa/lencana', { credentials:'include' })
      .then(r => r.ok ? r.json() : { badges:[] })
      .then(data => { setBadges(data.badges || data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = ['Semua', 'Diraih', 'Belum']
  const filtered = badges.filter(b => {
    if (activeCategory === 'Diraih') return b.earned
    if (activeCategory === 'Belum') return !b.earned
    return true
  })
  const earned = badges.filter(b => b.earned).length

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(240,153,123,0.07) 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Lencana</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ color:C.muted, fontSize:9 }}>{earned} / {badges.length} diraih</div>
          {categories.map((cat,i) => (
            <div key={i} onClick={() => setActiveCategory(cat)} style={{ background: cat===activeCategory?'#3c3489':C.card, border: cat===activeCategory?'none':`0.5px solid ${C.border}`, borderRadius:20, padding:'4px 11px', color: cat===activeCategory?'#eeedfe':C.sub, fontSize:9.5, fontWeight: cat===activeCategory?600:400, cursor:'pointer' }}>{cat}</div>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 16px', position:'relative', zIndex:2 }}>
        {loading ? (
          <div style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:30 }}>Memuat lencana...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:30 }}>Belum ada lencana</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:9 }}>
            {filtered.map((b, i) => {
              const rarity = b.rarity || 'Umum'
              const rc = RARITY_COLOR[rarity] || C.green
              const rb = RARITY_BG[rarity] || '#0d2218'
              return (
                <div key={i} style={{ background: b.earned?rb:C.card, border: b.earned?`0.5px solid ${rc}44`:`0.5px dashed ${C.border}`, borderRadius:11, padding:'10px 11px', display:'flex', alignItems:'center', gap:10, opacity: b.earned?1:0.55 }}>
                  <div style={{ width:44, height:44, borderRadius:10, background: b.earned?`${rc}22`:C.card, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, filter: b.earned?'none':'grayscale(1)' }}>
                    {b.icon || '🏅'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                      <div style={{ color: b.earned?rc:C.muted, fontSize:7, fontWeight:700, background: b.earned?`${rc}22`:C.card, borderRadius:4, padding:'1px 5px' }}>{rarity}</div>
                      {b.earned && <span style={{ fontSize:10 }}>✅</span>}
                    </div>
                    <div style={{ color: b.earned?C.txt:C.muted, fontSize:10, fontWeight: b.earned?700:400, lineHeight:1.2 }}>{b.name || b.label || 'Lencana'}</div>
                    <div style={{ color:C.muted, fontSize:8, marginTop:2 }}>{b.earned ? `Diraih ${b.date||''}` : b.progress || b.description || ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
