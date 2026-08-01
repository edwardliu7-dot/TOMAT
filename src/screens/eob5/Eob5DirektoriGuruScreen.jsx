/**
 * Eob5DirektoriGuruScreen.jsx
 * Direktori semua guru + progress jurnal & dokumen.
 * API: /api/eob5/teachers, /api/eob5/teachers/progress (admin only — graceful fallback)
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}

const JABATAN_LABELS = {
  kepala_sekolah: 'Kepala Sekolah', wakasek: 'Wakasek',
  wali_kelas: 'Wali Kelas', guru: 'Guru', staff_tu: 'Staff TU',
}
const JABATAN_COLORS = {
  kepala_sekolah: { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },
  wakasek:        { color:'#8b5cf6', bg:'rgba(139,92,246,0.15)' },
  wali_kelas:     { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
  guru:           { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },
}
const AVATAR_COLORS = ['#3b82f6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#14b8a6','#f97316','#06b6d4','#a78bfa','#fb923c']

function initials(name) {
  return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?'
}
function progressBarColor(pct) {
  if (pct >= 100) return '#22c55e'
  if (pct > 50) return '#3b82f6'
  return '#f59e0b'
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value/max*100)) : 0
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:C.sub, marginBottom:3 }}>
        <span>{value}/{max}</span><span>{pct}%</span>
      </div>
      <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: progressBarColor(pct),
          borderRadius:99, transition:'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function Eob5DirektoriGuruScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>
  )

  useEffect(()=>{
    setLoading(true)
    Promise.all([
      fetch('/api/eob5/teachers', { credentials:'include' }).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/api/eob5/teachers/progress', { credentials:'include' }).then(r=>r.ok?r.json():[]).catch(()=>[]),
    ]).then(([tch, prog])=>{
      setTeachers(Array.isArray(tch)?tch:[])
      const map = {}
      for (const p of (Array.isArray(prog)?prog:[])) map[p.teacherId||p.teacher_id||p.id] = p
      setProgress(map)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [])

  const filtered = useMemo(()=>{
    if (!query.trim()) return teachers
    const q = query.toLowerCase()
    return teachers.filter(t=>
      (t.name||'').toLowerCase().includes(q) ||
      (t.jabatan||[]).some(j=>(JABATAN_LABELS[j]||j).toLowerCase().includes(q)) ||
      (t.mapel||[]).some(m=>m.toLowerCase().includes(q))
    )
  }, [teachers, query])

  const total = teachers.length
  const guruAktif = teachers.filter(t=>(t.jabatan||[]).some(j=>['guru','wali_kelas','kepala_sekolah','wakasek'].includes(j))).length
  const staffTU = total - guruAktif

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Direktori Guru</div>
        </div>
        <div style={{ fontSize:12, color:C.sub }}>{loading?'…':`${total} pendidik`}</div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { label:'Total Guru', value:total, color:'#3b82f6' },
            { label:'Guru Aktif', value:guruAktif, color:'#22c55e' },
            { label:'Staff TU', value:staffTU, color:'#f59e0b' },
          ].map(s=>(
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:12, padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{loading?'…':s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:14 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="🔍 Cari nama guru, jabatan, atau mata pelajaran…"
            style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:10,
              padding:'10px 14px', color:'#fff', fontFamily:'inherit', fontSize:13,
              width:'100%', boxSizing:'border-box', outline:'none' }} />
        </div>

        {/* Loading */}
        {loading && <div style={{ textAlign:'center', color:C.sub, padding:60 }}>Memuat daftar guru…</div>}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>👨‍🏫</div>
            <div style={{ color:C.sub, fontSize:13 }}>
              {query ? 'Tidak ada guru yang cocok.' : 'Belum ada data guru.'}
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {filtered.map((t, idx) => {
              const prog = progress[t.id]
              const jabatan = t.jabatan || []
              const mapel = t.mapel || []

              // Progress jurnal
              const jurnalCurrent = prog?.jurnalBulanIni ?? 0
              const jurnalTotal = prog ? Math.round((prog.dokumenTotal/5)*4) : 0
              // Progress dokumen
              const dokCurrent = prog?.dokumenSelesai ?? 0
              const dokTotal = prog?.dokumenTotal ?? 0

              const emailDisplay = t.username ? `${t.username}@sekolah.id` : t.email || ''
              const pjab = jabatan.find(j=>['kepala_sekolah','wakasek','wali_kelas','guru'].includes(j)) || jabatan[0]

              const roleText = (() => {
                const parts = []
                if (jabatan.includes('wali_kelas') && t.waliKelasKelas) parts.push(`Wali Kelas ${t.waliKelasKelas}`)
                if (mapel.length > 0) parts.push(`Guru ${mapel.slice(0,2).join(' & ')}`)
                else if (jabatan.includes('kepala_sekolah')) parts.push('Kepala Sekolah')
                else if (jabatan.includes('wakasek')) parts.push('Wakasek')
                else if (jabatan.includes('guru')) parts.push('Guru')
                return parts.join(' • ') || JABATAN_LABELS[pjab] || 'Pendidik'
              })()

              return (
                <div key={t.id} style={{ background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:16, padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
                  {/* Header: Avatar + Info */}
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', flexShrink:0,
                      background:`${AVATAR_COLORS[idx%AVATAR_COLORS.length]}25`,
                      color:AVATAR_COLORS[idx%AVATAR_COLORS.length],
                      display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18 }}>
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt={t.name} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover' }} />
                      ) : initials(t.name)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:2 }}>{t.name}</div>
                      <div style={{ fontSize:11, color:C.sub, marginBottom:6 }}>{roleText}</div>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {jabatan.slice(0,2).map(j=>{
                          const jc = JABATAN_COLORS[j] || { color:C.sub, bg:C.white }
                          return (
                            <span key={j} style={{ fontSize:9, fontWeight:700, textTransform:'uppercase',
                              letterSpacing:0.5, background:jc.bg, color:jc.color, borderRadius:5, padding:'2px 7px' }}>
                              {JABATAN_LABELS[j]||j}
                            </span>
                          )
                        })}
                        {mapel.slice(0,1).map(m=>(
                          <span key={m} style={{ fontSize:9, fontWeight:700, textTransform:'uppercase',
                            letterSpacing:0.5, background:C.white, color:C.sub, borderRadius:5, padding:'2px 7px' }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars (if data available) */}
                  {prog ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <div>
                        <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>
                          📖 Jurnal Mengajar (Bln Ini)
                        </div>
                        <ProgressBar value={jurnalCurrent} max={Math.max(jurnalTotal,1)} />
                      </div>
                      {dokTotal > 0 && (
                        <div>
                          <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>
                            📋 Dokumen Kinerja
                          </div>
                          <ProgressBar value={dokCurrent} max={dokTotal} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px',
                      fontSize:11, color:C.sub, textAlign:'center' }}>
                      📊 Data progress tidak tersedia
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ paddingTop:10, borderTop:`1px solid ${C.border}`, display:'flex',
                    alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:11, color:C.sub, overflow:'hidden', textOverflow:'ellipsis',
                      whiteSpace:'nowrap', maxWidth:160 }}>
                      {emailDisplay || t.username || '—'}
                    </div>
                    <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5,
                      background:'rgba(34,197,94,0.15)', color:'#4ade80', borderRadius:6, padding:'2px 8px' }}>
                      Aktif
                    </span>
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
