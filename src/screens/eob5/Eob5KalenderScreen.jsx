/**
 * Eob5KalenderScreen.jsx
 * CRUD kalender akademik & status pekan (efektif/libur/ujian).
 * API: /api/eob5/academic-calendars, /api/eob5/academic-weeks
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}
const inp = { background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box', outline:'none' }

const JENIS_OPTIONS = [
  { value:'efektif', label:'Efektif' },
  { value:'pts',     label:'PTS (Penilaian Tengah Semester)' },
  { value:'pas',     label:'PAS (Penilaian Akhir Semester)' },
  { value:'libur',   label:'Libur' },
]
const JENIS_STYLE = {
  efektif: { bg:'rgba(34,197,94,0.15)', color:'#4ade80' },
  kbm:     { bg:'rgba(34,197,94,0.15)', color:'#4ade80' },
  pts:     { bg:'rgba(139,92,246,0.15)', color:'#a78bfa' },
  pas:     { bg:'rgba(139,92,246,0.15)', color:'#a78bfa' },
  libur:   { bg:'rgba(245,158,11,0.15)', color:'#fbbf24' },
}
function JenisBadge({ jenis }) {
  const s = JENIS_STYLE[jenis?.toLowerCase()] || { bg:'rgba(255,255,255,0.08)', color:C.sub }
  const label = JENIS_OPTIONS.find(o=>o.value===jenis?.toLowerCase())?.label?.split(' ')[0] || jenis || '—'
  return <span style={{ fontSize:10, fontWeight:700, background:s.bg, color:s.color, borderRadius:6, padding:'2px 7px' }}>{label}</span>
}

function Label({ children }) {
  return <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{children}</div>
}
function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:C.overlay, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1f1300', border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'88vh', overflowY:'auto', padding:'20px 16px 32px' }}>
        {children}
      </div>
    </div>
  )
}
function Toast({ msg }) {
  if (!msg.text) return null
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:300, background:msg.type==='ok'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)', color:'#fff', borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:300, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}
function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s+'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) }
  catch { return s }
}
function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Jakarta' }).format(new Date())
}

const BLANK_CAL = { nama:'', tahun_ajaran:'2025/2026', semester:'Ganjil' }
const BLANK_WEEK = { pekan_ke:'', tanggal_mulai:'', tanggal_selesai:'', jenis:'efektif', keterangan:'' }

// ── Calendar Form Modal ──────────────────────────────────────────────────────
function CalendarFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(BLANK_CAL)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(() => { if (open) { setForm(BLANK_CAL); setErr('') } }, [open])

  const handleSave = async () => {
    if (!form.tahun_ajaran||!form.semester) { setErr('Tahun ajaran dan semester wajib diisi'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/eob5/academic-calendars', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) { onSaved(); onClose() }
      else { const d=await r.json(); setErr(d.error||'Gagal membuat kalender') }
    } catch { setErr('Gagal terhubung') }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>🗓️ Buat Kalender Akademik</div>
      {err && <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444', borderRadius:8, padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:10 }}>{err}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div><Label>Nama Kalender (opsional)</Label><input value={form.nama} onChange={e=>f('nama',e.target.value)} placeholder="Kalender 2025/2026 Ganjil" style={inp} /></div>
        <div><Label>Tahun Ajaran</Label><input value={form.tahun_ajaran} onChange={e=>f('tahun_ajaran',e.target.value)} placeholder="2025/2026" style={inp} /></div>
        <div>
          <Label>Semester</Label>
          <select value={form.semester} onChange={e=>f('semester',e.target.value)} style={inp}>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:14 }}>
        <button onClick={onClose} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
        <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Buat Kalender'}</button>
      </div>
    </Modal>
  )
}

// ── Week Form Modal ──────────────────────────────────────────────────────────
function WeekFormModal({ open, editData, calendarId, nextPekan, onClose, onSaved }) {
  const [form, setForm] = useState(BLANK_WEEK)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(()=>{
    if (!open) return
    if (editData) {
      setForm({ pekan_ke:String(editData.pekan_ke), tanggal_mulai:editData.tanggal_mulai||'', tanggal_selesai:editData.tanggal_selesai||'', jenis:editData.jenis||'efektif', keterangan:editData.keterangan||'' })
    } else {
      setForm({ ...BLANK_WEEK, pekan_ke: String(nextPekan) })
    }
    setErr('')
  }, [open, editData, nextPekan])

  const handleSave = async () => {
    if (!form.pekan_ke||!form.tanggal_mulai||!form.tanggal_selesai||!form.jenis) { setErr('Semua field kecuali keterangan wajib diisi'); return }
    setSaving(true)
    const payload = { pekan_ke:parseInt(form.pekan_ke), tanggal_mulai:form.tanggal_mulai, tanggal_selesai:form.tanggal_selesai, jenis:form.jenis, keterangan:form.keterangan||undefined }
    try {
      let r
      if (editData) {
        r = await fetch(`/api/eob5/academic-weeks/${editData.id}`, { method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      } else {
        r = await fetch('/api/eob5/academic-weeks', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...payload, calendar_id: calendarId }) })
      }
      if (r.ok) { onSaved(); onClose() }
      else { const d=await r.json(); setErr(d.error||'Gagal menyimpan') }
    } catch { setErr('Gagal terhubung') }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>{editData?'✏️ Edit Pekan':'➕ Tambah Pekan'}</div>
      {err && <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444', borderRadius:8, padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:10 }}>{err}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div><Label>Pekan Ke</Label><input type="number" min="1" value={form.pekan_ke} onChange={e=>f('pekan_ke',e.target.value)} style={inp} /></div>
          <div>
            <Label>Jenis</Label>
            <select value={form.jenis} onChange={e=>f('jenis',e.target.value)} style={inp}>
              {JENIS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div><Label>Tanggal Mulai</Label><input type="date" value={form.tanggal_mulai} onChange={e=>f('tanggal_mulai',e.target.value)} style={inp} /></div>
          <div><Label>Tanggal Selesai</Label><input type="date" value={form.tanggal_selesai} onChange={e=>f('tanggal_selesai',e.target.value)} style={inp} /></div>
        </div>
        <div><Label>Keterangan (opsional)</Label><input value={form.keterangan} onChange={e=>f('keterangan',e.target.value)} placeholder="Libur Lebaran, UTS Kelas 9, …" style={inp} /></div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:14 }}>
        <button onClick={onClose} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
        <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan Pekan'}</button>
      </div>
    </Modal>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function Eob5KalenderScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [calendars, setCalendars] = useState([])
  const [selCalId, setSelCalId] = useState('')
  const [weeks, setWeeks] = useState([])
  const [calLoading, setCalLoading] = useState(true)
  const [weekLoading, setWeekLoading] = useState(false)
  const [calFormOpen, setCalFormOpen] = useState(false)
  const [weekFormOpen, setWeekFormOpen] = useState(false)
  const [editWeek, setEditWeek] = useState(null)
  const [msg, setMsg] = useState({ type:'', text:'' })

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}), 3000) }

  const loadCalendars = () => {
    setCalLoading(true)
    fetch('/api/eob5/academic-calendars', { credentials:'include' }).then(r=>r.ok?r.json():[]).then(d=>{
      const arr = Array.isArray(d) ? d : []
      setCalendars(arr)
      if (arr.length && !selCalId) setSelCalId(arr[0].id)
      setCalLoading(false)
    }).catch(()=>setCalLoading(false))
  }

  const loadWeeks = () => {
    if (!selCalId) { setWeeks([]); return }
    setWeekLoading(true)
    fetch(`/api/eob5/academic-weeks?calendar_id=${selCalId}`, { credentials:'include' }).then(r=>r.ok?r.json():[]).then(d=>{
      setWeeks(Array.isArray(d) ? [...d].sort((a,b)=>a.pekan_ke-b.pekan_ke) : [])
      setWeekLoading(false)
    }).catch(()=>setWeekLoading(false))
  }

  useEffect(()=>{ loadCalendars() }, [])
  useEffect(()=>{ loadWeeks() }, [selCalId])

  const handleDeleteCalendar = async (id) => {
    if (!confirm('Hapus kalender ini beserta semua pekannya?')) return
    await fetch(`/api/eob5/academic-calendars/${id}`, { method:'DELETE', credentials:'include' })
    showMsg('ok','Kalender dihapus.')
    if (selCalId === id) setSelCalId('')
    loadCalendars()
  }

  const handleDeleteWeek = async (id) => {
    if (!confirm('Hapus pekan ini?')) return
    await fetch(`/api/eob5/academic-weeks/${id}`, { method:'DELETE', credentials:'include' })
    showMsg('ok','Pekan dihapus.')
    loadWeeks()
  }

  const selCal = calendars.find(c=>c.id===selCalId)
  const today = todayStr()
  const nextPekan = weeks.length > 0 ? Math.max(...weeks.map(w=>w.pekan_ke)) + 1 : 1

  // Stats
  const totalPekan = weeks.length
  const weeksPast = weeks.filter(w=>{ try { return w.tanggal_selesai < today } catch { return false } }).length
  const currentWeek = weeks.find(w=>{ try { return w.tanggal_mulai <= today && today <= w.tanggal_selesai } catch { return false } })
  const sisaPekan = Math.max(0, totalPekan - weeksPast - (currentWeek ? 1 : 0))
  const efektifCount = weeks.filter(w=>['efektif','kbm'].includes(w.jenis?.toLowerCase())).length

  const STATS = [
    { label:'Total Pekan', value: totalPekan, color:'#3b82f6', bg:'rgba(59,130,246,0.15)', emoji:'📅' },
    { label:'Pekan Efektif', value: efektifCount, color:'#22c55e', bg:'rgba(34,197,94,0.15)', emoji:'✅' },
    { label:'Sudah Lewat', value: weeksPast, color:'#8b5cf6', bg:'rgba(139,92,246,0.15)', emoji:'✔️' },
    { label:'Sisa Pekan', value: sisaPekan, color:'#f59e0b', bg:'rgba(245,158,11,0.15)', emoji:'⏳' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <Toast msg={msg} />

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Kalender Akademik</div>
        </div>
        <button onClick={()=>setCalFormOpen(true)} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 13px', color:C.primary, fontWeight:700, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>+ Kalender</button>
      </div>

      <div style={{ padding:'16px 14px 0' }}>

        {/* Calendar selector */}
        {calLoading && <div style={{ color:C.sub, padding:'8px 0', fontSize:13 }}>Memuat kalender…</div>}

        {!calLoading && calendars.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📆</div>
            <div style={{ fontWeight:700, color:'#fff', marginBottom:6 }}>Belum ada kalender akademik</div>
            <div style={{ color:C.sub, fontSize:13, marginBottom:20 }}>Buat kalender untuk mulai mengatur pekan efektif</div>
            <button onClick={()=>setCalFormOpen(true)} style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'10px 20px', color:'#1a0a00', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>+ Buat Kalender</button>
          </div>
        )}

        {!calLoading && calendars.length > 0 && (
          <>
            {/* Calendar tabs */}
            <div style={{ overflowX:'auto', display:'flex', gap:8, paddingBottom:4, marginBottom:16 }}>
              {calendars.map(cal => (
                <button key={cal.id} onClick={()=>setSelCalId(cal.id)} style={{
                  flexShrink:0, background: cal.id===selCalId ? C.dim : C.card,
                  border:`1px solid ${cal.id===selCalId ? C.primary : C.border}`,
                  borderRadius:10, padding:'8px 14px', cursor:'pointer', fontFamily:'inherit',
                  display:'flex', alignItems:'center', gap:8,
                }}>
                  <span style={{ fontSize:12, fontWeight:700, color: cal.id===selCalId ? C.primary : C.sub }}>
                    {cal.nama || `${cal.tahun_ajaran} — Smt ${cal.semester}`}
                  </span>
                  <button onClick={e=>{ e.stopPropagation(); handleDeleteCalendar(cal.id) }} style={{ background:'none', border:'none', color:'rgba(248,113,113,0.5)', cursor:'pointer', fontSize:12, padding:'0 2px', lineHeight:1 }}>✕</button>
                </button>
              ))}
            </div>

            {selCal && (
              <>
                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:16 }}>
                  {STATS.map(s => (
                    <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
                      <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{s.emoji} {s.label}</div>
                      <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{weekLoading ? '…' : s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Current week highlight */}
                {currentWeek && (
                  <div style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.4)', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:18 }}>📍</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#93c5fd' }}>Pekan {currentWeek.pekan_ke} — Berlangsung Sekarang</div>
                      <div style={{ fontSize:11, color:C.sub }}>
                        {fmtDate(currentWeek.tanggal_mulai)} – {fmtDate(currentWeek.tanggal_selesai)}
                        {currentWeek.keterangan ? ` · ${currentWeek.keterangan}` : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add week button */}
                <button onClick={()=>{ setEditWeek(null); setWeekFormOpen(true) }} style={{ width:'100%', background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  ➕ Tambah Pekan
                </button>

                {/* Week list */}
                {weekLoading && <div style={{ textAlign:'center', color:C.sub, padding:30 }}>Memuat pekan…</div>}
                {!weekLoading && weeks.length === 0 && (
                  <div style={{ textAlign:'center', color:C.sub, padding:40, fontSize:13 }}>Belum ada pekan. Tambahkan pekan efektif.</div>
                )}

                {!weekLoading && weeks.length > 0 && (
                  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
                    {/* Table header */}
                    <div style={{ display:'grid', gridTemplateColumns:'40px 60px 1fr 1fr 70px 60px', gap:4, padding:'8px 10px', background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>
                      <span>No</span><span>Pekan</span><span>Mulai</span><span>Selesai</span><span>Jenis</span><span style={{ textAlign:'center' }}>Aksi</span>
                    </div>
                    {weeks.map((w, idx) => {
                      const isCurrent = currentWeek?.id === w.id
                      const isPast = w.tanggal_selesai < today && !isCurrent
                      return (
                        <div key={w.id} style={{ display:'grid', gridTemplateColumns:'40px 60px 1fr 1fr 70px 60px', gap:4, padding:'10px', borderTop:`1px solid ${C.border}`, background: isCurrent ? 'rgba(59,130,246,0.07)' : 'transparent', alignItems:'center' }}>
                          <span style={{ fontSize:11, color:C.sub }}>{idx+1}</span>
                          <span style={{ fontSize:12, fontWeight:800, color: isCurrent ? '#93c5fd' : isPast ? C.sub : '#fff' }}>
                            {w.pekan_ke}
                            {isCurrent && <span style={{ display:'block', fontSize:9, color:'#93c5fd', fontWeight:700 }}>KINI</span>}
                          </span>
                          <span style={{ fontSize:11, color: isPast ? C.sub : C.text }}>{fmtDate(w.tanggal_mulai)}</span>
                          <span style={{ fontSize:11, color: isPast ? C.sub : C.text }}>{fmtDate(w.tanggal_selesai)}</span>
                          <span><JenisBadge jenis={w.jenis} /></span>
                          <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                            <button onClick={()=>{ setEditWeek(w); setWeekFormOpen(true) }} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13, padding:'2px 4px' }}>✏️</button>
                            <button onClick={()=>handleDeleteWeek(w.id)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:13, padding:'2px 4px' }}>🗑️</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <CalendarFormModal open={calFormOpen} onClose={()=>setCalFormOpen(false)} onSaved={()=>{ showMsg('ok','Kalender dibuat!'); loadCalendars() }} />
      <WeekFormModal open={weekFormOpen} editData={editWeek} calendarId={selCalId} nextPekan={nextPekan} onClose={()=>setWeekFormOpen(false)} onSaved={()=>{ showMsg('ok', editWeek?'Pekan diperbarui!':'Pekan ditambahkan!'); loadWeeks() }} />
    </div>
  )
}
