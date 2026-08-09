/**
 * LandscapeProfil — read-only profile view with spanduk background + hafalan section.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'
import { usePlayer } from '../../PlayerContext'
import { usePet } from '../../PetContext'
import PetSVG, { getPetName } from '../../components/PetSVG'
import { UserAvatar } from '../../components/shared'
import { SPANDUK_VISUALS } from '../../shopVisuals'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6', orange:'#e2653f' }

async function apiCall(path) {
  const r = await fetch(path, { credentials:'include' })
  return r.json().catch(()=>({}))
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

const ANGKA_LIST = [1,2,3,4,5,6,7,8,9,10,11,12]

function HafalanSection({ hafalan }) {
  if (!hafalan) return null
  const { perkalian = {}, pembagian = {} } = hafalan
  const pCount = ANGKA_LIST.filter(n => perkalian[n] === 'lulus').length
  const bCount = ANGKA_LIST.filter(n => pembagian[n] === 'lulus').length

  const chipColor = (status) => {
    if (status === 'lulus') return { bg:'rgba(93,202,165,0.2)', border:'#5dcaa5', text:'#9fe1cb' }
    if (status === 'diulang') return { bg:'rgba(250,199,117,0.15)', border:'#fac775', text:'#fde68a' }
    return { bg:'rgba(255,255,255,0.04)', border:'#313a5c', text:'#5a6180' }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>🧮 HAFALAN</div>

      {/* Perkalian */}
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'9px 10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ color:C.txt, fontSize:9.5, fontWeight:700 }}>× Perkalian</span>
          <span style={{ color:C.green, fontSize:8.5 }}>{pCount}/12 lulus</span>
        </div>
        <div style={{ height:3, background:'#2a3158', borderRadius:3, marginBottom:6 }}>
          <div style={{ height:3, width:`${(pCount/12)*100}%`, background:`linear-gradient(90deg,${C.green},#22d3a5)`, borderRadius:3, transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {ANGKA_LIST.map(n => {
            const status = perkalian[n]
            const col = chipColor(status)
            return (
              <div key={n} style={{ width:26, height:22, borderRadius:5, background:col.bg, border:`0.5px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:col.text, fontWeight:600 }}>
                {n}×
              </div>
            )
          })}
        </div>
      </div>

      {/* Pembagian */}
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'9px 10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ color:C.txt, fontSize:9.5, fontWeight:700 }}>÷ Pembagian</span>
          <span style={{ color:C.purple, fontSize:8.5 }}>{bCount}/12 lulus</span>
        </div>
        <div style={{ height:3, background:'#2a3158', borderRadius:3, marginBottom:6 }}>
          <div style={{ height:3, width:`${(bCount/12)*100}%`, background:`linear-gradient(90deg,#a78bfa,#c4b5fd)`, borderRadius:3, transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {ANGKA_LIST.map(n => {
            const status = pembagian[n]
            const col = chipColor(status)
            return (
              <div key={n} style={{ width:26, height:22, borderRadius:5, background:col.bg, border:`0.5px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:col.text, fontWeight:600 }}>
                {n}÷
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function LandscapeProfil({ goBack, navigate }) {
  const { user, logout }   = useAuth()
  const playerCtx          = usePlayer()
  const player             = playerCtx?.player ?? null
  const { pet }            = usePet() || {}

  const coins    = player?.coins ?? 0
  const level    = player?.level ?? user?.level ?? 1
  const xp       = player?.xp ?? user?.xp ?? 0
  const xpNeeded = level * 1000

  const [rank,    setRank]    = useState('—')
  const [badges,  setBadges]  = useState([])
  const [hafalan, setHafalan] = useState(null)

  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat').then(data => {
      const lb = data.leaderboard || []
      const me = lb.find(e => String(e.id) === String(user?.id))
      if (me) setRank(`#${me.rank}`)
    }).catch(()=>{})

    apiCall('/api/siswa/lencana').then(data => {
      setBadges((data.badges || []).slice(0, 6))
    }).catch(()=>{})

    apiCall('/api/siswa/hafalan').then(data => {
      setHafalan(data)
    }).catch(()=>{})
  }, [user?.id])

  const name   = user?.name || user?.username || 'Siswa'
  const kelas  = user?.kelas || '—'
  const equippedSkin = pet?.skin || 'golden'
  const petStatus = pet?.isDead ? 'dead' : pet?.isStarving ? 'hungry' : 'happy'

  // Spanduk background
  const spandukId = user?.equippedSpanduk ?? user?.equipped_spanduk ?? null
  const spanduk   = spandukId ? SPANDUK_VISUALS[spandukId] : null

  return (
    <div style={{ width:'100vw', height:'100vh', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background: C.bg }}>

      {/* ── Full-screen spanduk background ─── */}
      {spanduk && (
        <>
          <div style={{ position:'absolute', inset:0, zIndex:0, background: spanduk.image ? `url(${spanduk.image}) center center / cover no-repeat, ${spanduk.gradient}` : spanduk.gradient, opacity:0.45 }} />
          <div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(180deg, rgba(18,23,43,0.55) 0%, rgba(18,23,43,0.82) 55%, rgba(18,23,43,0.96) 100%)' }} />
        </>
      )}

      {!spanduk && <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 40% 70% at 18% 50%, rgba(226,101,63,0.08) 0%, transparent 60%)', zIndex:0 }} />}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid rgba(49,58,92,0.6)`, flexShrink:0, position:'relative', zIndex:2, background:'rgba(18,23,43,0.55)', backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>👤 Profil</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          <div onClick={() => navigate?.('toko')} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:7, padding:'5px 11px', color:C.sub, fontSize:10, cursor:'pointer' }}>🛒 Toko Spanduk</div>
          <div onClick={() => navigate?.('profile')} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:7, padding:'5px 11px', color:C.sub, fontSize:10, cursor:'pointer' }}>✏️ Edit</div>
          <div onClick={logout} style={{ background:'rgba(113,43,19,0.7)', borderRadius:7, padding:'5px 11px', color:'#faece7', fontSize:10, fontWeight:600, cursor:'pointer' }}>Logout</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>

        {/* KIRI: Identitas + Level */}
        <div style={{ width:'26%', borderRight:`0.5px solid rgba(49,58,92,0.5)`, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 12px', gap:10, overflowY:'auto' }}>
          {/* Avatar */}
          <UserAvatar user={user} size={68} />
          <div style={{ textAlign:'center' }}>
            <div style={{ color:C.txt, fontSize:14, fontWeight:800 }}>{name}</div>
            <div style={{ color:C.sub, fontSize:9.5, marginTop:2 }}>{kelas}</div>
            {user?.bio && <div style={{ color:C.muted, fontSize:8.5, marginTop:4, lineHeight:1.4, textAlign:'center' }}>{user.bio}</div>}
          </div>

          {/* Level bar */}
          <div style={{ width:'100%', background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 10px', backdropFilter:'blur(6px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ background:'#3c3489', borderRadius:4, padding:'1px 6px', color:C.purple, fontSize:9, fontWeight:700 }}>Lv {level}</div>
              <span style={{ color:C.muted, fontSize:8.5 }}>{xp}/{xpNeeded} EXP</span>
            </div>
            <div style={{ height:4, background:'#2a3158', borderRadius:3 }}>
              <div style={{ height:4, width:`${Math.min((xp/xpNeeded)*100,100)}%`, background:`linear-gradient(90deg,${C.orange},${C.gold})`, borderRadius:3 }} />
            </div>
          </div>

          {/* Pet */}
          {pet && (
            <div style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', width:'100%', backdropFilter:'blur(6px)' }}>
              <PetSVG skinId={equippedSkin} state={petStatus} size={40} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.txt, fontSize:10.5, fontWeight:600 }}>{getPetName(equippedSkin)}</div>
                <div style={{ color:C.muted, fontSize:8 }}>Pet Aktif</div>
              </div>
              <div style={{ background: pet.isDead?'rgba(58,28,28,0.8)':pet.isStarving?'rgba(58,44,10,0.8)':'rgba(8,80,65,0.8)', borderRadius:5, padding:'2px 7px', color: pet.isDead?'#f0997b':pet.isStarving?C.gold:'#9fe1cb', fontSize:8.5, flexShrink:0 }}>
                {pet.isDead?'Mati':pet.isStarving?'Lapar':'Sehat'}
              </div>
            </div>
          )}

          {/* Spanduk label */}
          {spanduk && (
            <div style={{ width:'100%', background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'6px 10px', backdropFilter:'blur(6px)', textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:7.5, marginBottom:2 }}>SPANDUK AKTIF</div>
              <div style={{ color:C.txt, fontSize:9, fontWeight:600 }}>{spandukId?.replace(/_/g,' ')?.replace(/\b\w/g, c=>c.toUpperCase())}</div>
            </div>
          )}
        </div>

        {/* TENGAH: Stats + Hafalan */}
        <div style={{ width:'30%', borderRight:`0.5px solid rgba(49,58,92,0.5)`, display:'flex', flexDirection:'column', padding:'12px 12px', gap:8, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>STATISTIK</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            {[
              { icon:'🪙', val: coins.toLocaleString('id-ID'), label:'Koin Total',   color:C.gold },
              { icon:'👑', val: rank,                          label:'Rank Kelas',   color:C.red },
              { icon:'⚡', val: `${xp.toLocaleString('id-ID')}`, label:'Total EXP', color:C.purple },
              { icon:'🎖️', val: badges.filter(b=>b.isUnlocked).length, label:'Lencana Diraih', color:C.green },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'10px 9px', display:'flex', flexDirection:'column', gap:5, justifyContent:'center', alignItems:'center', backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:17 }}>{s.icon}</span>
                <div style={{ color:s.color, fontSize:13, fontWeight:800 }}>{s.val}</div>
                <div style={{ color:C.muted, fontSize:7.5, textAlign:'center' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Hafalan section */}
          {hafalan !== null && <HafalanSection hafalan={hafalan} />}
        </div>

        {/* KANAN: Lencana terbaru */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', gap:8, overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>LENCANA TERBARU</div>
            <div onClick={() => navigate?.('lencana')} style={{ color:C.muted, fontSize:9, cursor:'pointer' }}>Lihat semua →</div>
          </div>
          {badges.length === 0 && (
            <div style={{ color:C.muted, fontSize:10, textAlign:'center', marginTop:20 }}>Belum ada lencana diraih</div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
            {badges.map((b,i) => (
              <div key={b.id||i} style={{ background: b.isUnlocked?'rgba(26,42,64,0.8)':'rgba(28,35,64,0.6)', border: b.isUnlocked?`0.5px solid #3a4a7a`:`0.5px dashed ${C.border}`, borderRadius:10, padding:'9px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity: b.isUnlocked?1:0.45, backdropFilter:'blur(4px)' }}>
                <span style={{ fontSize:22, filter: b.isUnlocked?'none':'grayscale(1)' }}>{b.icon||'🏅'}</span>
                <div style={{ color: b.isUnlocked?C.txt:C.muted, fontSize:8.5, textAlign:'center', fontWeight: b.isUnlocked?600:400, lineHeight:1.3 }}>{b.nama||b.name||'Lencana'}</div>
                {b.isUnlocked && <div style={{ color:C.muted, fontSize:7.5 }}>{formatDate(b.earnedAt)}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
