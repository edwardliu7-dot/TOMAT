import { useState, useEffect } from 'react'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

// Same filter options as original BadgesScreen
const FILTERS = [
  { id:'all',      label:'Semua' },
  { id:'unlocked', label:'✅ Diraih' },
  { id:'locked',   label:'🔒 Belum' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

export default function LandscapeLencana({ goBack }) {
  const [data, setData]     = useState(null)
  const [error, setError]   = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/siswa/lencana', { credentials:'include' })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  // Same field names as original BadgesScreen: b.isUnlocked, b.nama, b.deskripsi, b.icon, b.color, b.earnedAt
  const badges = data?.badges || []
  const filtered = badges.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked
    if (filter === 'locked')   return !b.isUnlocked
    return true
  })
  const earned = badges.filter(b => b.isUnlocked).length

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(240,153,123,0.07) 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>🏅 Lencana</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {data && <div style={{ color:C.muted, fontSize:9 }}>{earned} / {badges.length} diraih</div>}
          {FILTERS.map(f => (
            <div key={f.id} onClick={() => setFilter(f.id)} style={{ background: f.id===filter?'#3c3489':C.card, border: f.id===filter?'none':`0.5px solid ${C.border}`, borderRadius:20, padding:'4px 11px', color: f.id===filter?'#eeedfe':C.sub, fontSize:9.5, fontWeight: f.id===filter?600:400, cursor:'pointer' }}>{f.label}</div>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 16px', position:'relative', zIndex:2 }}>
        {error && <div style={{ color:'#f0997b', fontSize:10, marginBottom:8 }}>{error}</div>}
        {!data && !error && <div style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:30 }}>Memuat lencana...</div>}
        {data && filtered.length === 0 && <div style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:30 }}>Tidak ada lencana</div>}
        {data && filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:9 }}>
            {filtered.map((b, i) => (
              <div key={b.id||i} style={{
                background: b.isUnlocked?'#1A1D27':'#12141C',
                border: `1px solid ${b.isUnlocked?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)'}`,
                borderRadius:12, padding:'12px 11px',
                display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:7,
                opacity: b.isUnlocked?1:0.4,
                filter: b.isUnlocked?'none':'grayscale(1)',
              }}>
                <div style={{ width:52, height:52, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, background: b.isUnlocked?`${b.color||C.green}33`:'rgba(255,255,255,0.04)', boxShadow: b.isUnlocked?`0 0 14px ${b.color||C.green}44`:'none' }}>
                  {b.isUnlocked ? (b.icon||'🏅') : '🔒'}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color: b.isUnlocked?'#fff':C.muted }}>{b.nama||b.name||'Lencana'}</div>
                <div style={{ fontSize:9.5, color: b.isUnlocked?C.sub:'#4B5563', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{b.deskripsi||b.description||''}</div>
                <div style={{ width:'100%', fontSize:9, fontWeight:700, padding:'4px 6px', borderRadius:7, background: b.isUnlocked?'rgba(52,211,153,0.1)':'rgba(255,255,255,0.04)', color: b.isUnlocked?'#34D399':C.muted, border: `1px solid ${b.isUnlocked?'rgba(52,211,153,0.2)':'rgba(255,255,255,0.05)'}` }}>
                  {b.isUnlocked ? `Diraih ${formatDate(b.earnedAt)}` : 'Terkunci'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
