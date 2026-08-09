import { useState, useEffect } from 'react'

const S = {
  root: { width:'100vw', height:'100vh', background:'#12172b', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' },
  glow: { position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(113,43,19,0.14) 0%, transparent 70%)' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0, position:'relative', zIndex:2 },
  backBtn: { width:30, height:30, borderRadius:8, background:'#1c2340', border:'0.5px solid #313a5c', display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' },
  title: { color:'#f2ede3', fontSize:15, fontWeight:700 },
  onlinePill: { display:'flex', alignItems:'center', gap:6 },
  onlineDot: { width:7, height:7, borderRadius:'50%', background:'#5dcaa5', boxShadow:'0 0 6px #5dcaa5' },
  onlineTxt: { color:'#5dcaa5', fontSize:10 },
  grid: { flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:10, padding:'10px 16px 14px', position:'relative', zIndex:2 },
}

const MODES = [
  { id:'duel-lobby', icon:'⚔️', title:'Duel 1v1', desc:'Tantang siswa lain head-to-head', stat:'12 online', color:'#712b13', shadow:'rgba(113,43,19,0.5)', badge:null },
  { id:'tournament-wait', icon:'🏆', title:'Turnamen', desc:'Kelompok vs kelompok, rebut juara kelas', stat:'1 sesi aktif', color:'#3c3489', shadow:'rgba(60,52,137,0.5)', badge:'BARU' },
  { id:'boss-raid', icon:'💀', title:'Boss Raid', desc:'Serang boss bersama seluruh kelas', stat:'Siap diserang', color:'#085041', shadow:'rgba(8,80,65,0.5)', badge:null },
  { id:'moba-lobby', icon:'🎮', title:'MOBA Arena', desc:'Battle 2D real-time dengan petmu', stat:'Beta', color:'#993556', shadow:'rgba(153,53,86,0.5)', badge:'BETA' },
]

export default function LandscapeArena({ navigate, goBack, canUseDemoMoba }) {
  const [onlineCount, setOnlineCount] = useState(24)

  useEffect(() => {
    const t = setInterval(() => setOnlineCount(n => n + Math.floor(Math.random()*3)-1), 8000)
    return () => clearInterval(t)
  }, [])

  const handleMode = (id) => {
    if ((id === 'moba-lobby' || id === 'moba-match') && !canUseDemoMoba) return
    navigate(id)
  }

  return (
    <div style={S.root}>
      <div style={S.glow} />
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={S.backBtn} onClick={goBack}>‹</div>
          <span style={S.title}>Arena Tanding</span>
        </div>
        <div style={S.onlinePill}>
          <div style={S.onlineDot} />
          <span style={S.onlineTxt}>{onlineCount} siswa online</span>
        </div>
      </div>

      <div style={S.grid}>
        {MODES.map(m => (
          <div key={m.id}
            onClick={() => handleMode(m.id)}
            style={{
              background:`linear-gradient(160deg,${m.color}dd,${m.color}88)`,
              borderRadius:13, padding:'13px 16px',
              display:'flex', alignItems:'center', gap:14,
              boxShadow:`0 4px 18px ${m.shadow}`,
              cursor: (m.id==='moba-lobby' && !canUseDemoMoba) ? 'not-allowed' : 'pointer',
              opacity: (m.id==='moba-lobby' && !canUseDemoMoba) ? 0.5 : 1,
              position:'relative', overflow:'hidden',
            }}>
            <div style={{ position:'absolute', right:-12, top:-12, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
            {m.badge && (
              <div style={{ position:'absolute', top:8, right:10, background: m.badge==='BETA'?'#993556':'#fac775', color: m.badge==='BETA'?'#fff':'#12172b', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:5 }}>{m.badge}</div>
            )}
            <span style={{ fontSize:36, flexShrink:0 }}>{m.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'#f2ede3', fontSize:14, fontWeight:800, lineHeight:1.2 }}>{m.title}</div>
              <div style={{ color:'rgba(242,237,227,0.65)', fontSize:10, marginTop:4, lineHeight:1.5 }}>{m.desc}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.45)' }} />
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:9 }}>{m.stat}</span>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:9, padding:'9px 16px', flexShrink:0, color:'#fff', fontSize:11, fontWeight:700 }}>
              Masuk ▶
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
