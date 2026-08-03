/**
 * Eob5PoinScreen.jsx
 * Rekap poin perilaku siswa: riwayat, rekap per siswa, input poin baru.
 * API: /api/eob5/points, /api/eob5/siswa/list
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}
const inp = {
  background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: 8,
  padding: '9px 11px', color: '#fff', fontFamily: 'inherit', fontSize: 13,
  width: '100%', boxSizing: 'border-box', outline: 'none',
}

const SARAN_NEGATIF = [
  { label:'Terlambat', poin:5 }, { label:'Tidak bawa buku', poin:3 },
  { label:'Tidak kerjakan PR', poin:5 }, { label:'Tidak pakai seragam', poin:5 },
  { label:'Menyontek', poin:15 }, { label:'Bolos', poin:20 },
]
const SARAN_POSITIF = [
  { label:'Aktif menjawab', poin:5 }, { label:'Membantu teman', poin:5 },
  { label:'Nilai ujian terbaik', poin:10 }, { label:'Juara kelas', poin:20 },
  { label:'Mewakili lomba', poin:15 },
]

function todayStr() { return new Date().toISOString().split('T')[0] }
function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s+'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) }
  catch { return s }
}
function initials(name) {
  return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?'
}
const AVATAR_COLORS = [
  '#3b82f6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#14b8a6','#f97316','#06b6d4',
]
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0)||0)%AVATAR_COLORS.length] }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:C.overlay, zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1f1300', border:`1px solid ${C.border}`,
        borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'92vh', overflowY:'auto',
        padding:'20px 16px 32px' }}>
        {children}
      </div>
    </div>
  )
}

function Toast({ msg }) {
  if (!msg.text) return null
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:400,
      background:msg.type==='ok'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)',
      color:'#fff', borderRadius:12, padding:'10px 22px', fontSize:13, fontWeight:700,
      boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:320, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}

export default function Eob5PoinScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [points, setPoints] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('riwayat') // 'riwayat' | 'rekap' | 'massal'
  const [rekapKelas, setRekapKelas] = useState('')
  const [inputOpen, setInputOpen] = useState(false)
  const [editPoint, setEditPoint] = useState(null)
  const [msg, setMsg] = useState({ type:'', text:'' })

  // Input form (bulk — satu jenis/poin untuk banyak siswa)
  const [form, setForm] = useState({ student_ids:[], jenis:'negatif', poin:5, keterangan:'', tanggal:todayStr() })
  const [kelasDialogFilter, setKelasDialogFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  // Edit form
  const [editForm, setEditForm] = useState({ jenis:'positif', poin:5, keterangan:'', tanggal:todayStr() })

  // Bulk-mixed state
  const [massalKelas, setMassalKelas] = useState('')
  const [massalTanggal, setMassalTanggal] = useState(todayStr())
  const [massalRows, setMassalRows] = useState({}) // { [studentId]: { jenis, poin, keterangan } }
  const [massalSaving, setMassalSaving] = useState(false)

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>
  )

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}),3000) }
  const ef = (k,v) => setEditForm(p=>({...p,[k]:v}))

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/eob5/points', { credentials:'include' }).then(r=>r.ok?r.json():[]),
      fetch('/api/eob5/siswa/list', { credentials:'include' }).then(r=>r.ok?r.json():[]),
    ]).then(([pts, sts]) => {
      setPoints(Array.isArray(pts)?pts:[])
      setStudents(Array.isArray(sts)?sts:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }

  useEffect(()=>{ loadData() }, [])

  const kelasList = useMemo(()=>[...new Set(students.map(s=>s.kelas))].filter(Boolean).sort(), [students])

  // Stats
  const totalPos = points.filter(p=>p.jenis==='positif').reduce((s,p)=>s+p.poin,0)
  const totalNeg = points.filter(p=>p.jenis==='negatif').reduce((s,p)=>s+p.poin,0)
  const saldo = totalPos - totalNeg

  // Top pelanggaran & prestasi
  const { topPelanggaran, topPrestasi } = useMemo(()=>{
    const mapNeg = new Map(), mapPos = new Map()
    for (const p of points) {
      const map = p.jenis==='negatif' ? mapNeg : mapPos
      const cur = map.get(p.student_id) || { id:p.student_id, total:0, count:0 }
      cur.total += p.poin; cur.count++
      map.set(p.student_id, cur)
    }
    const getName = id => students.find(s=>s.id===id)?.name || id
    const getKelas = id => students.find(s=>s.id===id)?.kelas || ''
    const top = (m) => [...m.values()].sort((a,b)=>b.total-a.total).slice(0,3)
      .map(x=>({ ...x, name:getName(x.id), kelas:getKelas(x.id) }))
    return { topPelanggaran: top(mapNeg), topPrestasi: top(mapPos) }
  }, [points, students])

  // Rekap per siswa
  const rekapRows = useMemo(()=>{
    const map = new Map()
    for (const p of points) {
      const cur = map.get(p.student_id) || { pos:0, neg:0 }
      if (p.jenis==='positif') cur.pos += p.poin; else cur.neg += p.poin
      map.set(p.student_id, cur)
    }
    return students
      .filter(s=>!rekapKelas || s.kelas===rekapKelas)
      .map(s=>{ const acc=map.get(s.id)||{pos:0,neg:0}; return {...s,...acc, saldo:acc.pos-acc.neg} })
      .sort((a,b)=>b.neg-a.neg)
  }, [students, points, rekapKelas])

  // Dialog input
  const visibleStudents = useMemo(()=>
    kelasDialogFilter ? students.filter(s=>s.kelas===kelasDialogFilter) : students,
  [students, kelasDialogFilter])

  const toggleStudent = (id) => {
    setForm(p=>({ ...p, student_ids: p.student_ids.includes(id)
      ? p.student_ids.filter(x=>x!==id)
      : [...p.student_ids, id] }))
  }
  const toggleAll = () => {
    const ids = visibleStudents.map(s=>s.id)
    const allSel = ids.every(id=>form.student_ids.includes(id))
    setForm(p=>({ ...p, student_ids: allSel
      ? p.student_ids.filter(id=>!ids.includes(id))
      : [...new Set([...p.student_ids, ...ids])] }))
  }

  // Bulk-mixed helpers
  const massalStudents = useMemo(()=>
    massalKelas ? students.filter(s=>s.kelas===massalKelas) : students,
  [students, massalKelas])

  const setMassalRow = (studentId, field, value) => {
    setMassalRows(prev => ({
      ...prev,
      [studentId]: { jenis:'negatif', poin:'', keterangan:'', ...(prev[studentId]||{}), [field]: value }
    }))
  }

  const handleSaveMassal = async () => {
    const entries = massalStudents
      .filter(s => {
        const r = massalRows[s.id]
        return r && r.poin !== '' && parseInt(r.poin) > 0
      })
      .map(s => {
        const r = massalRows[s.id]
        return { student_id: s.id, jenis: r.jenis||'negatif', poin: parseInt(r.poin), keterangan: r.keterangan||'' }
      })
    if (!entries.length) { showMsg('err','Tidak ada poin yang diisi'); return }
    setMassalSaving(true)
    try {
      const r = await fetch('/api/eob5/points/bulk-mixed', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ tanggal: massalTanggal, entries })
      })
      const d = await r.json()
      if (r.ok) {
        showMsg('ok', `${d.count} catatan poin berhasil disimpan`)
        setMassalRows({})
        loadData()
      } else {
        showMsg('err', d.error || 'Gagal menyimpan')
      }
    } catch { showMsg('err','Gagal terhubung ke server') }
    setMassalSaving(false)
  }

  const applyPreset = (preset, jenis) => {
    setForm(p=>({ ...p, jenis, poin:preset.poin, keterangan:preset.label }))
  }

  const handleSubmitInput = async () => {
    if (form.student_ids.length === 0) { setFormErr('Pilih minimal satu siswa'); return }
    if (!form.keterangan.trim()) { setFormErr('Keterangan wajib diisi'); return }
    if (!form.poin || form.poin < 1) { setFormErr('Poin harus minimal 1'); return }
    setSaving(true); setFormErr('')
    try {
      const r = await fetch('/api/eob5/points/bulk', { method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({
          student_ids: form.student_ids, jenis:form.jenis,
          poin: parseInt(form.poin), keterangan:form.keterangan, tanggal:form.tanggal
        })})
      if (r.ok) {
        const d = await r.json()
        showMsg('ok',`Poin dicatat untuk ${d.count||form.student_ids.length} siswa`)
        setInputOpen(false)
        setForm({ student_ids:[], jenis:'negatif', poin:5, keterangan:'', tanggal:todayStr() })
        setKelasDialogFilter('')
        loadData()
      } else { const d=await r.json(); setFormErr(d.error||'Gagal menyimpan') }
    } catch { setFormErr('Gagal terhubung ke server') }
    setSaving(false)
  }

  const openEdit = (p) => {
    setEditPoint(p)
    setEditForm({ jenis:p.jenis, poin:p.poin, keterangan:p.keterangan, tanggal:p.tanggal })
  }

  const handleSaveEdit = async () => {
    if (!editPoint) return
    setSaving(true)
    try {
      const r = await fetch(`/api/eob5/points/${editPoint.id}`, { method:'PATCH', credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify(editForm) })
      if (r.ok) { showMsg('ok','Poin diperbarui.'); setEditPoint(null); loadData() }
      else showMsg('err','Gagal memperbarui poin.')
    } catch { showMsg('err','Gagal terhubung.') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan poin ini?')) return
    const r = await fetch(`/api/eob5/points/${id}`, { method:'DELETE', credentials:'include' })
    if (r.ok) { showMsg('ok','Catatan dihapus.'); loadData() }
    else showMsg('err','Gagal menghapus.')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <Toast msg={msg} />

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Poin Siswa</div>
        </div>
        <button onClick={()=>{ setInputOpen(true); setForm({ student_ids:[], jenis:'negatif', poin:5, keterangan:'', tanggal:todayStr() }); setFormErr('') }}
          style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none',
            borderRadius:10, padding:'8px 14px', color:'#1a0a00', fontWeight:800, fontSize:12,
            cursor:'pointer', fontFamily:'inherit' }}>+ Input Poin</button>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { label:'Poin Positif', value:totalPos, color:'#22c55e', sign:'+' },
            { label:'Poin Negatif', value:totalNeg, color:'#ef4444', sign:'-' },
            { label:'Saldo Bersih', value:saldo, color:saldo>=0?'#f59e0b':'#ef4444', sign:saldo>0?'+':'' },
          ].map(s=>(
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:12, padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>
                {s.label}
              </div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>
                {loading?'…':`${s.sign}${s.value}`}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          {[['riwayat','📋 Riwayat'],['rekap','👥 Rekap Siswa'],['massal','📝 Input Massal']].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              background: tab===k ? C.dim : C.card, border:`1px solid ${tab===k?C.primary:C.border}`,
              borderRadius:10, padding:'8px 16px', cursor:'pointer', fontFamily:'inherit',
              fontSize:12, fontWeight:700, color: tab===k ? C.primary : C.sub,
            }}>{l}</button>
          ))}
        </div>

        {/* RIWAYAT TAB */}
        {tab === 'riwayat' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Table */}
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase',
                letterSpacing:1, marginBottom:8 }}>Riwayat Poin Terbaru</div>
              {loading ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat…</div>
              ) : points.length === 0 ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada catatan poin.</div>
              ) : (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'70px 1fr 1fr 50px 40px', gap:4, padding:'8px 12px',
                    background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
                    <span>Tanggal</span><span>Siswa</span><span>Keterangan</span><span style={{textAlign:'right'}}>Poin</span><span></span>
                  </div>
                  {points.slice(0,100).map(p=>{
                    const s = students.find(x=>x.id===p.student_id)
                    const isPos = p.jenis==='positif'
                    return (
                      <div key={p.id} style={{ display:'grid', gridTemplateColumns:'70px 1fr 1fr 50px 40px', gap:4,
                        padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                        <span style={{ fontSize:10, color:C.sub }}>{fmtDate(p.tanggal)}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                          <div style={{ width:26, height:26, borderRadius:'50%', background:`${avatarColor(s?.name)}25`,
                            color:avatarColor(s?.name), display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:800, fontSize:10, flexShrink:0 }}>{initials(s?.name||p.siswa_name)}</div>
                          <span style={{ fontSize:11, fontWeight:600, color:'#fff', overflow:'hidden',
                            textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {s?.name || p.siswa_name || '—'}
                          </span>
                        </div>
                        <span style={{ fontSize:11, color:C.text, overflow:'hidden',
                          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.keterangan}</span>
                        <span style={{ textAlign:'right', fontWeight:800, fontSize:13,
                          color:isPos?'#22c55e':'#ef4444' }}>
                          {isPos?'+':'-'}{p.poin}
                        </span>
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          <button onClick={()=>openEdit(p)} style={{ background:'none', border:'none',
                            color:'#60a5fa', cursor:'pointer', fontSize:11, padding:1 }}>✏️</button>
                          <button onClick={()=>handleDelete(p.id)} style={{ background:'none', border:'none',
                            color:'#f87171', cursor:'pointer', fontSize:11, padding:1 }}>🗑</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top Pelanggaran + Prestasi */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { title:'🚨 Top Pelanggaran', data:topPelanggaran, color:'#ef4444', sign:'-' },
                { title:'🏆 Top Prestasi', data:topPrestasi, color:'#22c55e', sign:'+' },
              ].map(box=>(
                <div key={box.title} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
                  <div style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}`,
                    fontSize:12, fontWeight:800, color:box.color }}>{box.title}</div>
                  <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:10 }}>
                    {box.data.length===0 ? (
                      <div style={{ fontSize:11, color:C.sub, textAlign:'center', padding:8 }}>Belum ada data</div>
                    ) : box.data.map((item,i)=>(
                      <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:10, color:C.sub, width:14, fontWeight:700 }}>{i+1}</span>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:`${avatarColor(item.name)}25`,
                          color:avatarColor(item.name), display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:800, fontSize:10, flexShrink:0 }}>{initials(item.name)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'#fff', overflow:'hidden',
                            textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize:9, color:C.sub }}>{item.count} catatan</div>
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, color:box.color, flexShrink:0 }}>
                          {box.sign}{item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REKAP TAB */}
        {tab === 'rekap' && (
          <div>
            <div style={{ marginBottom:10 }}>
              <select value={rekapKelas} onChange={e=>setRekapKelas(e.target.value)} style={{ ...inp, width:'auto', minWidth:160 }}>
                <option value="">Semua Kelas</option>
                {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 60px 60px 60px', gap:4, padding:'8px 12px',
                background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
                <span>Nama Siswa</span><span style={{textAlign:'center'}}>Kelas</span>
                <span style={{textAlign:'right',color:'#22c55e'}}>+Positif</span>
                <span style={{textAlign:'right',color:'#ef4444'}}>-Negatif</span>
                <span style={{textAlign:'right'}}>Saldo</span>
              </div>
              {loading ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat…</div>
              ) : rekapRows.length === 0 ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada data poin.</div>
              ) : rekapRows.map((s,idx)=>(
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'1fr 60px 60px 60px 60px', gap:4,
                  padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:`${avatarColor(s.name)}25`,
                      color:avatarColor(s.name), display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:800, fontSize:10, flexShrink:0 }}>{initials(s.name)}</div>
                    <span style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize:10, color:C.sub, textAlign:'center' }}>{s.kelas}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#22c55e', textAlign:'right' }}>
                    {s.pos>0?`+${s.pos}`:'—'}
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#ef4444', textAlign:'right' }}>
                    {s.neg>0?`-${s.neg}`:'—'}
                  </span>
                  <span style={{ textAlign:'right' }}>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:6, padding:'2px 7px',
                      background: s.saldo>0?'rgba(34,197,94,0.15)':s.saldo<0?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.05)',
                      color: s.saldo>0?'#4ade80':s.saldo<0?'#f87171':C.sub,
                    }}>{s.saldo>0?`+${s.saldo}`:s.saldo}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* MASSAL TAB */}
        {tab === 'massal' && (
          <div>
            {/* Filter bar */}
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
              padding:'12px 14px', marginBottom:14, display:'flex', flexWrap:'wrap', gap:10, alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Kelas</div>
                <select value={massalKelas} onChange={e=>{ setMassalKelas(e.target.value); setMassalRows({}) }}
                  style={{ ...inp, width:'auto', minWidth:160 }}>
                  <option value="">Semua Kelas</option>
                  {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Tanggal</div>
                <input type="date" value={massalTanggal} onChange={e=>setMassalTanggal(e.target.value)} style={{ ...inp, width:'auto' }} />
              </div>
              <div style={{ marginLeft:'auto', alignSelf:'flex-end' }}>
                <button onClick={handleSaveMassal} disabled={massalSaving}
                  style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10,
                    padding:'9px 20px', color:'#1a0a00', fontWeight:800, fontSize:13,
                    cursor:massalSaving?'not-allowed':'pointer', fontFamily:'inherit' }}>
                  {massalSaving ? 'Menyimpan…' : '💾 Simpan Semua'}
                </button>
              </div>
            </div>

            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase',
              letterSpacing:1, marginBottom:8 }}>
              {massalStudents.length} Siswa · Kosongkan poin = siswa tidak dicatat
            </div>

            {massalStudents.length === 0 ? (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
                padding:32, textAlign:'center', color:C.sub }}>Pilih kelas untuk menampilkan siswa.</div>
            ) : (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
                {/* Header */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 80px 1fr', gap:8, padding:'8px 12px',
                  background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
                  <span>Siswa</span><span>Jenis</span><span>Poin</span><span>Keterangan</span>
                </div>
                {massalStudents.map(s => {
                  const row = massalRows[s.id] || {}
                  const filled = row.poin !== '' && row.poin !== undefined && parseInt(row.poin) > 0
                  return (
                    <div key={s.id} style={{ display:'grid', gridTemplateColumns:'1fr 110px 80px 1fr', gap:8,
                      padding:'8px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center',
                      background: filled ? C.dim : 'transparent' }}>
                      {/* Nama */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:`${avatarColor(s.name)}25`,
                          color:avatarColor(s.name), display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:800, fontSize:10, flexShrink:0 }}>{initials(s.name)}</div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden',
                            textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize:9, color:C.sub }}>{s.kelas}</div>
                        </div>
                      </div>
                      {/* Jenis */}
                      <select value={row.jenis||'negatif'} onChange={e=>setMassalRow(s.id,'jenis',e.target.value)}
                        style={{ ...inp, padding:'6px 8px', fontSize:11 }}>
                        <option value="negatif">Negatif</option>
                        <option value="positif">Positif</option>
                      </select>
                      {/* Poin */}
                      <input type="number" min="1" placeholder="—"
                        value={row.poin !== undefined ? row.poin : ''}
                        onChange={e=>setMassalRow(s.id,'poin',e.target.value)}
                        style={{ ...inp, padding:'6px 8px', fontSize:12, textAlign:'center',
                          color: filled ? (row.jenis==='positif'?'#4ade80':'#f87171') : C.sub }} />
                      {/* Keterangan */}
                      <input placeholder="Keterangan (opsional)"
                        value={row.keterangan||''}
                        onChange={e=>setMassalRow(s.id,'keterangan',e.target.value)}
                        style={{ ...inp, padding:'6px 8px', fontSize:11 }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Input Poin Dialog */}
      <Modal open={inputOpen} onClose={()=>setInputOpen(false)}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>📌 Input Poin</div>
        {formErr && (
          <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444', borderRadius:8,
            padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:10 }}>{formErr}</div>
        )}
        {/* Preset Saran */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>
            Preset Cepat
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
            {SARAN_NEGATIF.map(s=>(
              <button key={s.label} onClick={()=>applyPreset(s,'negatif')} style={{
                background: form.keterangan===s.label&&form.jenis==='negatif'?'rgba(239,68,68,0.2)':'rgba(239,68,68,0.08)',
                border:`1px solid ${form.keterangan===s.label&&form.jenis==='negatif'?'#ef4444':'rgba(239,68,68,0.3)'}`,
                borderRadius:8, padding:'4px 10px', color:'#f87171', fontSize:11, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit' }}>{s.label} (-{s.poin})</button>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {SARAN_POSITIF.map(s=>(
              <button key={s.label} onClick={()=>applyPreset(s,'positif')} style={{
                background: form.keterangan===s.label&&form.jenis==='positif'?'rgba(34,197,94,0.2)':'rgba(34,197,94,0.08)',
                border:`1px solid ${form.keterangan===s.label&&form.jenis==='positif'?'#22c55e':'rgba(34,197,94,0.3)'}`,
                borderRadius:8, padding:'4px 10px', color:'#4ade80', fontSize:11, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit' }}>{s.label} (+{s.poin})</button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {/* Jenis + Poin */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Jenis</div>
              <select value={form.jenis} onChange={e=>setForm(p=>({...p,jenis:e.target.value}))} style={inp}>
                <option value="negatif">Negatif (Pelanggaran)</option>
                <option value="positif">Positif (Prestasi)</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Jumlah Poin</div>
              <input type="number" min="1" value={form.poin}
                onChange={e=>setForm(p=>({...p,poin:e.target.value}))} style={inp} />
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Keterangan</div>
            <input value={form.keterangan} onChange={e=>setForm(p=>({...p,keterangan:e.target.value}))}
              placeholder="Contoh: Terlambat masuk kelas" style={inp} />
          </div>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Tanggal</div>
            <input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} style={inp} />
          </div>
          {/* Pilih Siswa */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
                Siswa ({form.student_ids.length} dipilih)
              </div>
              <select value={kelasDialogFilter} onChange={e=>setKelasDialogFilter(e.target.value)}
                style={{ ...inp, width:'auto', padding:'4px 8px', fontSize:11 }}>
                <option value="">Semua Kelas</option>
                {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ border:`1px solid ${C.border}`, borderRadius:10, maxHeight:200, overflowY:'auto' }}>
              {/* Pilih Semua */}
              <label style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                borderBottom:`1px solid ${C.border}`, background:'rgba(0,0,0,0.2)', cursor:'pointer' }}>
                <input type="checkbox"
                  checked={visibleStudents.length>0 && visibleStudents.every(s=>form.student_ids.includes(s.id))}
                  onChange={toggleAll} />
                <span style={{ fontSize:12, fontWeight:700, color:C.primary }}>
                  Pilih Semua {kelasDialogFilter?`(${kelasDialogFilter})`:''}
                </span>
              </label>
              {visibleStudents.length === 0 ? (
                <div style={{ padding:'12px', textAlign:'center', fontSize:12, color:C.sub }}>Tidak ada siswa</div>
              ) : visibleStudents.map(s=>(
                <label key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                  borderBottom:`1px solid ${C.border}`, cursor:'pointer',
                  background:form.student_ids.includes(s.id)?C.dim:'transparent' }}>
                  <input type="checkbox" checked={form.student_ids.includes(s.id)} onChange={()=>toggleStudent(s.id)} />
                  <span style={{ fontSize:12, color:'#fff', fontWeight:form.student_ids.includes(s.id)?700:400 }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize:10, color:C.sub, marginLeft:'auto' }}>{s.kelas}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>setInputOpen(false)} style={{ flex:'0 0 auto', background:'none',
            border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px',
            color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleSubmitInput} disabled={saving} style={{ flex:1,
            background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10,
            padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer',
            fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan Poin'}</button>
        </div>
      </Modal>

      {/* Edit Poin Dialog */}
      <Modal open={!!editPoint} onClose={()=>setEditPoint(null)}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>✏️ Edit Catatan Poin</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Jenis</div>
              <select value={editForm.jenis} onChange={e=>ef('jenis',e.target.value)} style={inp}>
                <option value="negatif">Negatif</option>
                <option value="positif">Positif</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Poin</div>
              <input type="number" min="1" value={editForm.poin} onChange={e=>ef('poin',parseInt(e.target.value))} style={inp} />
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Keterangan</div>
            <input value={editForm.keterangan} onChange={e=>ef('keterangan',e.target.value)} style={inp} />
          </div>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Tanggal</div>
            <input type="date" value={editForm.tanggal} onChange={e=>ef('tanggal',e.target.value)} style={inp} />
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>setEditPoint(null)} style={{ flex:'0 0 auto', background:'none',
            border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px',
            color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleSaveEdit} disabled={saving} style={{ flex:1,
            background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10,
            padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer',
            fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
        </div>
      </Modal>
    </div>
  )
}
