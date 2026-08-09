import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'
import { usePlayer } from '../../PlayerContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6', orange:'#e2653f' }

export default function LandscapeProfil({ goBack, navigate }) {
  const { user, logout } = useAuth()
  const { player } = usePlayer()
  const coins = player?.coins ?? 0
  const [stats, setStats] = useState({ gamesPlayed:0, rank:'—', streak:0 })
  const [badges, setBadges] = useState([])

  useEffect(() => {
    fetch('/api/siswa/lencana', { credentials:'include' })
      .then(r => r.ok ? r.json() : {})
      .then(d => setBadges((d.badges||d||[]).slice(0,6)))
      .catch(() => {})
    fetch('/api/siswa/papan-peringkat', { credentials:'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : data.entries||[]
        const me = arr.find(e => e.id === user?.id)
        if (me) setStats(s => ({...s, rank:`#${me.rank||'—'}`}))
      }).catch(() => {})
  }, [user?.id])

  const level = user?.level || 1
  const xp = user?.xp || 0
  const xpNeeded = level * 1000
  const name = user?.name || user?.username || 'Siswa'
  const kelas = user?.kelas || '—'

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 40% 70% at 18% 50%, rgba(226,101,63,0.1) 0%, transparent 60%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Profil</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          <div onClick={() => navigate('profile')} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:7, padding:'5px 11px', color:C.sub, fontSize:10, cursor:'pointer' }}>Edit Profil ✏️</div>
          <div onClick={logout} style={{ background:'#712b13', borderRadius:7, padding:'5px 11px', color:'#faece7', fontSize:10, fontWeight:600, cursor:'pointer' }}>Logout</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>
        {/* KIRI: Identitas */}
        <div style={{ width:'26%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 16px', gap:10 }}>
          {/* Avatar */}
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${C.orange},#c94f2d)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 0 3px #2a3158, 0 0 0 5px ${C.orange}44`, fontSize:28, fontWeight:800, color:'#fff' }}>
            {name[0]?.toUpperCase()}
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:C.txt, fontSize:14, fontWeight:800 }}>{name}</div>
            <div style={{ color:C.sub, fontSize:9.5, marginTop:2 }}>{kelas}</div>
          </div>

          {/* Level + XP */}
          <div style={{ width:'100%', background:C.card, border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ background:'#3c3489', borderRadius:4, padding:'1px 6px', color:C.purple, fontSize:9, fontWeight:700 }}>Lv {level}</div>
                <span style={{ color:C.sub, fontSize:8.5 }}>Penjelajah</span>
              </div>
              <span style={{ color:C.muted, fontSize:8.5 }}>{xp}/{xpNeeded}</span>
            </div>
            <div style={{ height:4, background:'#2a3158', borderRadius:3 }}>
              <div style={{ height:4, width:`${Math.min((xp/xpNeeded)*100,100)}%`, background:`linear-gradient(90deg,${C.orange},${C.gold})`, borderRadius:3 }} />
            </div>
          </div>

          {/* Pet */}
          <div style={{ display:'flex', alignItems:'center', gap:9, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', width:'100%' }}>
            <span style={{ fontSize:26 }}>🐇</span>
            <div>
              <div style={{ color:C.txt, fontSize:10.5, fontWeight:600 }}>Tomi</div>
              <div style={{ color:C.muted, fontSize:8 }}>Pet Aktif</div>
            </div>
            <div style={{ marginLeft:'auto', background:'#085041', borderRadius:5, padding:'2px 7px', color:'#9fe1cb', fontSize:8.5 }}>Sehat</div>
          </div>
        </div>

        {/* TENGAH: Stats */}
        <div style={{ width:'26%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', padding:'12px 12px', gap:8 }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>STATISTIK</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, flex:1 }}>
            {[
              { icon:'🪙', val:coins?.toLocaleString('id')||'0', label:'Koin Total', color:C.gold },
              { icon:'🎮', val:stats.gamesPlayed||'—', label:'Game Selesai', color:C.purple },
              { icon:'👑', val:stats.rank, label:'Rank Kelas', color:C.red },
              { icon:'🔥', val:`${stats.streak} hari`, label:'Streak', color:C.green },
            ].map((s,i) => (
              <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'11px 9px', display:'flex', flexDirection:'column', gap:5, justifyContent:'center', alignItems:'center' }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <div style={{ color:s.color, fontSize:14, fontWeight:800 }}>{s.val}</div>
                <div style={{ color:C.muted, fontSize:7.5, textAlign:'center' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KANAN: Lencana */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', gap:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>LENCANA TERBARU</div>
            <div onClick={() => navigate('lencana')} style={{ color:C.muted, fontSize:9, cursor:'pointer' }}>Lihat semua →</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:7 }}>
            {badges.length === 0 && (
              <div style={{ color:C.muted, fontSize:10, gridColumn:'1/-1', textAlign:'center', marginTop:20 }}>Belum ada lencana</div>
            )}
            {badges.map((b,i) => (
              <div key={i} style={{ background: b.earned?'#1a2a40':C.card, border: b.earned?`0.5px solid #3a4a7a`:`0.5px dashed ${C.border}`, borderRadius:10, padding:'9px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity: b.earned?1:0.45 }}>
                <span style={{ fontSize:22, filter: b.earned?'none':'grayscale(1)' }}>{b.icon||'🏅'}</span>
                <div style={{ color: b.earned?C.txt:C.muted, fontSize:8.5, textAlign:'center', fontWeight: b.earned?600:400, lineHeight:1.3 }}>{b.name||b.label||'Lencana'}</div>
                {b.earned && <div style={{ width:18, height:18, borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✓</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
