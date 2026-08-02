/**
 * Eob5DirektoriSiswaScreen.jsx
 * Direktori semua siswa lintas kelas: nama, kelas, gender, akun, kehadiran.
 * API: /api/eob5/siswa/list (tanpa filter kelas), /api/eob5/kelas/list
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}

const AVATAR_PALETTES = [
  ['#3b82f6','rgba(59,130,246,0.2)'],
  ['#ec4899','rgba(236,72,153,0.2)'],
  ['#8b5cf6','rgba(139,92,246,0.2)'],
  ['#22c55e','rgba(34,197,94,0.2)'],
  ['#f59e0b','rgba(245,158,11,0.2)'],
  ['#14b8a6','rgba(20,184,166,0.2)'],
  ['#f97316','rgba(249,115,22,0.2)'],
  ['#06b6d4','rgba(6,182,212,0.2)'],
]
function kelasColorIdx(kelas) {
  let h = 0
  for (const c of (kelas||'')) h = (h*31 + c.charCodeAt(0)) & 0xffff
  return h % AVATAR_PALETTES.length
}
function initials(name) {
  return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?'
}

export default function Eob5DirektoriSiswaScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [akunFilter, setAkunFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>
  )

  useEffect(()=>{
    setLoading(true)
    fetch('/api/eob5/siswa/list', { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>{ setStudents(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  const kelasList = useMemo(()=>[...new Set(students.map(s=>s.kelas))].filter(Boolean).sort(), [students])

  const filtered = useMemo(()=>students.filter(s=>{
    if (query) {
      const q = query.toLowerCase()
      if (!(s.name||'').toLowerCase().includes(q) && !(s.username||'').toLowerCase().includes(q)) return false
    }
    if (kelasFilter && s.kelas !== kelasFilter) return false
    if (akunFilter === 'yes' && !s.username) return false
    if (akunFilter === 'no' && s.username) return false
    return true
  }), [students, query, kelasFilter, akunFilter])

  const total = students.length
  const withAkun = students.filter(s=>s.username).length
  const withoutAkun = total - withAkun

  const pctHadir = (s) => {
    const h = parseInt(s.total_hadir)||0, a = parseInt(s.total_alpha)||0
    const total = h + a
    return total > 0 ? Math.round((h/total)*100) : null
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Direktori Siswa</div>
        </div>
        {/* Grid/List toggle */}
        <div style={{ display:'flex', gap:4 }}>
          {[['grid','⊞'],['list','≡']].map(([m,icon])=>(
            <button key={m} onClick={()=>setViewMode(m)} style={{
              background: viewMode===m ? C.dim : 'none',
              border:`1px solid ${viewMode===m?C.primary:C.border}`, borderRadius:8,
              padding:'6px 10px', color:viewMode===m?C.primary:C.sub,
              cursor:'pointer', fontSize:14 }}>{icon}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { label:'Total Siswa', value:total, color:'#3b82f6' },
            { label:'Punya Akun', value:withAkun, color:'#22c55e' },
            { label:'Belum Akun', value:withoutAkun, color:'#f59e0b' },
          ].map(s=>(
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:12, padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{loading?'…':s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="🔍 Cari nama atau username…"
            style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:10,
              padding:'10px 14px', color:'#fff', fontFamily:'inherit', fontSize:13,
              width:'100%', boxSizing:'border-box', outline:'none' }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <select value={kelasFilter} onChange={e=>setKelasFilter(e.target.value)}
              style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8,
                padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:12, outline:'none' }}>
              <option value="">Semua Kelas</option>
              {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
            </select>
            <select value={akunFilter} onChange={e=>setAkunFilter(e.target.value)}
              style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8,
                padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:12, outline:'none' }}>
              <option value="all">Semua Status Akun</option>
              <option value="yes">Punya Akun</option>
              <option value="no">Belum Akun</option>
            </select>
          </div>
        </div>

        {/* Filter info */}
        {(query||kelasFilter||akunFilter!=='all') && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            marginBottom:10, fontSize:12, color:C.sub }}>
            <span>{filtered.length} dari {total} siswa</span>
            <button onClick={()=>{ setQuery(''); setKelasFilter(''); setAkunFilter('all') }}
              style={{ background:'none', border:'none', color:C.primary, cursor:'pointer',
                fontFamily:'inherit', fontSize:11, textDecoration:'underline' }}>Reset Filter</button>
          </div>
        )}

        {loading && <div style={{ textAlign:'center', color:C.sub, padding:60 }}>Memuat direktori…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📚</div>
            <div style={{ color:C.sub, fontSize:13 }}>
              {query||kelasFilter||akunFilter!=='all' ? 'Tidak ada siswa yang cocok.' : 'Belum ada data siswa.'}
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && filtered.length > 0 && viewMode === 'grid' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
            {filtered.map((s, idx) => {
              const [color, bg] = AVATAR_PALETTES[idx % AVATAR_PALETTES.length]
              const [kcolor, kbg] = AVATAR_PALETTES[kelasColorIdx(s.kelas)]
              const pct = pctHadir(s)
              const hasAkun = !!s.username

              return (
                <div key={s.id} style={{ background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:'14px 12px', display:'flex', flexDirection:'column',
                  gap:8, cursor:'pointer' }}
                  onClick={()=>{
                    if (navigate) navigate('eob5-detail-siswa')
                    window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail:{ id:s.id } }))
                  }}>
                  {/* Avatar */}
                  <div style={{ display:'flex', justifyContent:'center' }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:bg, color,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:900, fontSize:20, overflow:'hidden' }}>
                      {s.photo_url
                        ? <img src={s.photo_url} alt={s.name} style={{ width:52, height:52, objectFit:'cover' }} />
                        : initials(s.name)}
                    </div>
                  </div>
                  {/* Name */}
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:4,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                    <span style={{ fontSize:10, fontWeight:700, background:`${kbg}`, color:kcolor,
                      borderRadius:5, padding:'2px 7px' }}>{s.kelas}</span>
                  </div>
                  {/* Gender + akun */}
                  <div style={{ display:'flex', gap:4, justifyContent:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase',
                      background: s.jenis_kelamin==='L'?'rgba(59,130,246,0.15)':'rgba(236,72,153,0.15)',
                      color: s.jenis_kelamin==='L'?'#60a5fa':'#f472b6',
                      borderRadius:5, padding:'1px 6px' }}>
                      {s.jenis_kelamin==='L'?'L':'P'}
                    </span>
                    <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase',
                      background:hasAkun?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',
                      color:hasAkun?'#4ade80':C.primary, borderRadius:5, padding:'1px 6px' }}>
                      {hasAkun?'✓ Akun':'Belum Akun'}
                    </span>
                  </div>
                  {/* Kehadiran */}
                  {pct !== null && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.sub, marginBottom:2 }}>
                        <span>Kehadiran</span><span>{pct}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99,
                          width:`${pct}%`, background:pct>=80?'#22c55e':pct>=60?'#f59e0b':'#ef4444' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && filtered.length > 0 && viewMode === 'list' && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 70px 40px 70px 60px', gap:4,
              padding:'8px 12px', background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub,
              fontWeight:700, textTransform:'uppercase' }}>
              <span>No</span><span>Nama</span><span>Kelas</span><span>JK</span><span>Akun</span><span>Hadir</span>
            </div>
            {filtered.map((s, idx) => {
              const [color, bg] = AVATAR_PALETTES[idx % AVATAR_PALETTES.length]
              const pct = pctHadir(s)
              const hasAkun = !!s.username
              return (
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'36px 1fr 70px 40px 70px 60px', gap:4,
                  padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center', cursor:'pointer' }}
                  onClick={()=>{
                    if (navigate) navigate('eob5-detail-siswa')
                    window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail:{ id:s.id } }))
                  }}>
                  <span style={{ fontSize:11, color:C.sub }}>{idx+1}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:bg, color,
                      display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:11, flexShrink:0 }}>
                      {initials(s.name)}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden',
                        textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                      {s.username && <div style={{ fontSize:10, color:C.sub, fontFamily:'monospace' }}>@{s.username}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, background:C.dim, color:C.primary,
                    borderRadius:5, padding:'2px 6px', textAlign:'center' }}>{s.kelas}</span>
                  <span style={{ fontSize:11, textAlign:'center',
                    color:s.jenis_kelamin==='L'?'#60a5fa':'#f472b6', fontWeight:700 }}>
                    {s.jenis_kelamin==='L'?'L':'P'}
                  </span>
                  <span style={{ textAlign:'center' }}>
                    <span style={{ fontSize:10, fontWeight:700,
                      background:hasAkun?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',
                      color:hasAkun?'#4ade80':C.primary, borderRadius:5, padding:'2px 7px' }}>
                      {hasAkun?'✓':'—'}
                    </span>
                  </span>
                  <span style={{ fontSize:11, textAlign:'center',
                    color:pct===null?C.sub:pct>=80?'#22c55e':pct>=60?'#f59e0b':'#ef4444', fontWeight:700 }}>
                    {pct===null?'—':`${pct}%`}
                  </span>
                </div>
              )
            })}
            <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}`,
              fontSize:11, color:C.sub, textAlign:'right' }}>
              {filtered.length} siswa
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
