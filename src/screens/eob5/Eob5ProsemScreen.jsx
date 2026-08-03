/**
 * Eob5ProsemScreen.jsx
 * List prosem + view detail grid minggu × materi, CRUD item, ekspor XLSX, AI import dari file.
 * Items disimpan di field `konten` JSON: { items: [{ id, pekan_ke, kd, materi, jp, catatan }] }
 * Linkage: subject_id → subjects, calendar_id → academic_calendars
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../AuthContext'
import * as XLSX from 'xlsx'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}
const inp = { background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box', outline:'none' }
const BLANK_PROSEM = { mata_pelajaran:'', kelas:'', semester:'1', tahun_ajaran:'2025/2026', subject_id:'', calendar_id:'' }
const BLANK_ITEM = { pekan_ke:'', kd:'', materi:'', jp:'2', catatan:'' }

let _uid = 0
const uid = () => `item-${++_uid}-${Date.now()}`

function Modal({ open, onClose, children, wide }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:C.overlay, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1f1300', border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', width:'100%', maxWidth: wide?680:480, maxHeight:'92vh', overflowY:'auto', padding:'20px 16px 32px' }}>
        {children}
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{children}</div>
}

function Toast({ msg }) {
  if (!msg.text) return null
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:300, background:msg.type==='ok'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)', color:'#fff', borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:320, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}

function JenisBadge({ jenis }) {
  const MAP = {
    efektif: { bg:'rgba(34,197,94,0.15)', color:'#4ade80', label:'Efektif' },
    kbm: { bg:'rgba(34,197,94,0.15)', color:'#4ade80', label:'KBM' },
    pts: { bg:'rgba(139,92,246,0.15)', color:'#a78bfa', label:'PTS' },
    pas: { bg:'rgba(139,92,246,0.15)', color:'#a78bfa', label:'PAS' },
    libur: { bg:'rgba(245,158,11,0.15)', color:'#fbbf24', label:'Libur' },
  }
  const s = MAP[jenis?.toLowerCase()] || { bg:'rgba(255,255,255,0.08)', color:C.sub, label: jenis || '—' }
  return (
    <span style={{ fontSize:10, fontWeight:700, background:s.bg, color:s.color, borderRadius:6, padding:'2px 7px' }}>{s.label}</span>
  )
}

// ── Prosem List View ─────────────────────────────────────────────────────────
function ProsemList({ onOpen }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [subjects, setSubjects] = useState([])
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterKelas, setFilterKelas] = useState('')
  const [filterMapel, setFilterMapel] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editProsem, setEditProsem] = useState(null)
  const [form, setForm] = useState(BLANK_PROSEM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}), 3000) }
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filterKelas) p.set('kelas', filterKelas)
    if (filterMapel) p.set('mata_pelajaran', filterMapel)
    fetch(`/api/eob5/prosem?${p}`, { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>{ setList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  useEffect(()=>{
    Promise.all([
      fetch('/api/eob5/kelas/list',{credentials:'include'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/api/eob5/subjects',{credentials:'include'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/api/eob5/academic-calendars',{credentials:'include'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
    ]).then(([kelas, subj, cals]) => {
      if (Array.isArray(kelas)) setKelasList(kelas)
      if (Array.isArray(subj)) setSubjects(subj)
      if (Array.isArray(cals)) setCalendars(cals)
    })
    load()
  }, [])
  useEffect(()=>{ load() }, [filterKelas, filterMapel])

  const openCreate = () => { setEditProsem(null); setForm(BLANK_PROSEM); setFormOpen(true) }
  const openEdit = (p) => {
    setEditProsem(p)
    setForm({
      mata_pelajaran: p.mata_pelajaran,
      kelas: p.kelas,
      semester: String(p.semester),
      tahun_ajaran: p.tahun_ajaran,
      subject_id: p.subject_id ? String(p.subject_id) : '',
      calendar_id: p.calendar_id ? String(p.calendar_id) : '',
    })
    setFormOpen(true)
  }

  // When subject changes, auto-fill mata_pelajaran
  const handleSubjectChange = (subjectId) => {
    f('subject_id', subjectId)
    if (subjectId) {
      const subj = subjects.find(s => String(s.id) === String(subjectId))
      if (subj) f('mata_pelajaran', subj.name)
    }
  }

  const handleSave = async () => {
    if (!form.mata_pelajaran||!form.kelas||!form.semester||!form.tahun_ajaran) { showMsg('error','Semua field wajib diisi'); return }
    setSaving(true)
    const url = editProsem ? `/api/eob5/prosem/${editProsem.id}` : '/api/eob5/prosem'
    const method = editProsem ? 'PUT' : 'POST'
    try {
      const body = {
        ...form,
        semester: parseInt(form.semester),
        subject_id: form.subject_id || null,
        calendar_id: form.calendar_id || null,
      }
      const r = await fetch(url, { method, credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      if (r.ok) { showMsg('ok', editProsem?'Prosem diperbarui!':'Prosem berhasil dibuat!'); setFormOpen(false); load() }
      else { const d=await r.json(); showMsg('error', d.error||'Gagal menyimpan') }
    } catch { showMsg('error','Gagal terhubung') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus prosem ini beserta semua materi?')) return
    await fetch(`/api/eob5/prosem/${id}`, { method:'DELETE', credentials:'include' })
    showMsg('ok','Prosem dihapus.'); load()
  }

  return (
    <>
      <Toast msg={msg} />
      <div style={{ padding:'16px 14px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} style={inp}>
            <option value="">Semua Kelas</option>
            {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
          </select>
          <input value={filterMapel} onChange={e=>setFilterMapel(e.target.value)} placeholder="Filter mata pelajaran…" style={inp} />
        </div>

        {loading && <div style={{ textAlign:'center',color:C.sub,padding:40 }}>Memuat prosem…</div>}
        {!loading && list.length===0 && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📝</div>
            <div style={{ fontWeight:700, color:'#fff', marginBottom:6 }}>Belum ada program semester</div>
            <div style={{ color:C.sub, fontSize:13 }}>Klik "+ Buat Prosem" untuk memulai</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {list.map(p => (
            <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:26, flexShrink:0 }}>📝</div>
              <button onClick={()=>onOpen(p)} style={{ flex:1, background:'none', border:'none', textAlign:'left', cursor:'pointer', padding:0, fontFamily:'inherit', minWidth:0 }}>
                <div style={{ fontWeight:700, color:'#fff', fontSize:14 }}>{p.mata_pelajaran}</div>
                <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>{p.kelas} · Semester {p.semester} · {p.tahun_ajaran}</div>
              </button>
              <button onClick={()=>openEdit(p)} style={{ background:'transparent', border:'none', color:C.primary, cursor:'pointer', fontSize:16, padding:'4px 6px' }}>✏️</button>
              <button onClick={()=>handleDelete(p.id)} style={{ background:'transparent', border:'none', color:'#f87171', cursor:'pointer', fontSize:16, padding:'4px 6px' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tombol FAB buat prosem */}
      <div style={{ position:'fixed', bottom:24, right:20, zIndex:100 }}>
        <button onClick={openCreate} style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:14, padding:'12px 20px', color:'#1a0a00', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(245,158,11,0.35)' }}>
          ➕ Buat Prosem
        </button>
      </div>

      <Modal open={formOpen} onClose={()=>setFormOpen(false)}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>{editProsem?'✏️ Edit Prosem':'➕ Buat Prosem Baru'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

          {/* Mata Pelajaran — dropdown dari subjects */}
          <div>
            <Label>Mata Pelajaran</Label>
            {subjects.length > 0 ? (
              <select
                value={form.subject_id}
                onChange={e => handleSubjectChange(e.target.value)}
                style={inp}
              >
                <option value="">— Pilih Mata Pelajaran —</option>
                {subjects.map(s=><option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            ) : (
              <input
                value={form.mata_pelajaran}
                onChange={e=>f('mata_pelajaran',e.target.value)}
                placeholder="Matematika"
                style={inp}
              />
            )}
            {subjects.length > 0 && form.mata_pelajaran && (
              <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>Terisi: {form.mata_pelajaran}</div>
            )}
          </div>

          {/* Kalender Akademik */}
          {calendars.length > 0 && (
            <div>
              <Label>Kalender Akademik (opsional)</Label>
              <select value={form.calendar_id} onChange={e=>f('calendar_id',e.target.value)} style={inp}>
                <option value="">— Pilih Kalender —</option>
                {calendars.map(c=><option key={c.id} value={String(c.id)}>{c.nama || `${c.tahun_ajaran} — Sem ${c.semester}`}</option>)}
              </select>
            </div>
          )}

          <div>
            <Label>Kelas</Label>
            <select value={form.kelas} onChange={e=>f('kelas',e.target.value)} style={inp}>
              <option value="">— Pilih Kelas —</option>
              {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>Semester</Label>
              <select value={form.semester} onChange={e=>f('semester',e.target.value)} style={inp}>
                <option value="1">Semester 1</option><option value="2">Semester 2</option>
              </select>
            </div>
            <div><Label>Tahun Ajaran</Label><input value={form.tahun_ajaran} onChange={e=>f('tahun_ajaran',e.target.value)} placeholder="2025/2026" style={inp} /></div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          <button onClick={()=>setFormOpen(false)} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
        </div>
      </Modal>
    </>
  )
}

// ── AI Import Preview Modal ───────────────────────────────────────────────────
function ImportPreviewModal({ open, onClose, importedItems, onConfirm, weeks }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} wide>
      <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:6 }}>📄 Preview Hasil AI Extraction</div>
      <div style={{ fontSize:12, color:C.sub, marginBottom:12 }}>{importedItems.length} item diekstrak. Konfirmasi untuk menambahkan ke prosem.</div>
      <div style={{ maxHeight:'50vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
        {importedItems.map((it, i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <span style={{ fontSize:10, fontWeight:700, color:C.primary, background:C.dim, borderRadius:4, padding:'1px 6px' }}>Pekan {it.pekanKe}</span>
              <span style={{ fontSize:10, color:C.sub }}>{it.jp} JP</span>
              {it.kd && <span style={{ fontSize:10, color:'#a78bfa' }}>{it.kd}</span>}
            </div>
            <div style={{ fontSize:12, color:'#fff' }}>{it.materi}</div>
            {it.catatan && <div style={{ fontSize:11, color:C.sub, marginTop:2 }}>{it.catatan}</div>}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
        <button onClick={onConfirm} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'10px', color:'#1a0a00', fontWeight:800, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>✅ Simpan {importedItems.length} Materi</button>
      </div>
    </Modal>
  )
}

// ── Prosem Detail (grid minggu × materi) ─────────────────────────────────────
function ProsemDetail({ prosemId, onBack }) {
  const [prosem, setProsem] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [calendars, setCalendars] = useState([])
  const [calId, setCalId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [itemForm, setItemForm] = useState(BLANK_ITEM)
  const [msg, setMsg] = useState({ type:'', text:'' })

  // AI Import state
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [importPreviewOpen, setImportPreviewOpen] = useState(false)
  const fileInputRef = useRef(null)

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}), 3000) }
  const fi = (k,v) => setItemForm(p=>({...p,[k]:v}))

  // Load prosem + calendars on mount
  useEffect(()=>{
    Promise.all([
      fetch(`/api/eob5/prosem/${prosemId}`, { credentials:'include' }).then(r=>r.ok?r.json():null),
      fetch('/api/eob5/academic-calendars', { credentials:'include' }).then(r=>r.ok?r.json():[]),
    ]).then(([p, cals]) => {
      setProsem(p)
      const calArr = Array.isArray(cals) ? cals : []
      setCalendars(calArr)

      // Prioritize the calendar linked to this prosem
      if (p?.calendar_id) {
        setCalId(String(p.calendar_id))
      } else if (calArr.length) {
        setCalId(String(calArr[0].id))
      }

      const stored = p?.konten?.items
      setItems(Array.isArray(stored) ? stored : [])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [prosemId])

  // Load weeks when calendar changes
  useEffect(()=>{
    if (!calId) { setWeeks([]); return }
    fetch(`/api/eob5/academic-weeks?calendar_id=${calId}`, { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>setWeeks(Array.isArray(d)?d:[])).catch(()=>setWeeks([]))
  }, [calId])

  // Persist items → save to konten
  const saveItems = async (newItems) => {
    setSaving(true)
    try {
      const r = await fetch(`/api/eob5/prosem/${prosemId}`, {
        method:'PUT', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ konten: { items: newItems } })
      })
      if (r.ok) { setItems(newItems); showMsg('ok','Materi disimpan!') }
      else showMsg('error','Gagal menyimpan')
    } catch { showMsg('error','Gagal terhubung') }
    setSaving(false)
  }

  const openAddItem = (week) => {
    setEditItem(null)
    setItemForm({ ...BLANK_ITEM, pekan_ke: String(week?.pekan_ke || '') })
    setItemFormOpen(true)
  }
  const openEditItem = (it) => {
    setEditItem(it)
    setItemForm({ pekan_ke: String(it.pekan_ke||''), kd: it.kd||'', materi: it.materi||'', jp: String(it.jp||2), catatan: it.catatan||'' })
    setItemFormOpen(true)
  }

  const handleItemSave = async () => {
    if (!itemForm.materi.trim()) { showMsg('error','Materi wajib diisi'); return }
    const newItem = {
      id: editItem?.id || uid(),
      pekan_ke: parseInt(itemForm.pekan_ke)||0,
      kd: itemForm.kd.trim(),
      materi: itemForm.materi.trim(),
      jp: parseInt(itemForm.jp)||2,
      catatan: itemForm.catatan.trim()
    }
    const newItems = editItem ? items.map(i=>i.id===editItem.id ? newItem : i) : [...items, newItem]
    setItemFormOpen(false)
    await saveItems(newItems)
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Hapus materi ini?')) return
    await saveItems(items.filter(i=>i.id!==id))
  }

  // ── AI Import from File ────────────────────────────────────────────────────
  const handleImportClick = () => { fileInputRef.current?.click() }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setImporting(true)
    showMsg('ok', 'Menganalisis file dengan AI…')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/eob5/prosem/import-analyze', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const data = await r.json()
      if (!r.ok) { showMsg('error', data.error || 'Gagal menganalisis'); setImporting(false); return }

      // Map AI items to internal format
      const mapped = (data.items || []).map(it => ({
        id: uid(),
        pekan_ke: it.pekanKe || it.pekan_ke || 0,
        materi: it.materi || '',
        jp: it.jp || 2,
        kd: it.kd || '',
        catatan: it.catatan || '',
      }))

      if (!mapped.length) { showMsg('error', 'Tidak ada materi yang diekstrak'); setImporting(false); return }
      setImportPreview(mapped)
      setImportPreviewOpen(true)
    } catch {
      showMsg('error', 'Gagal terhubung ke server')
    }
    setImporting(false)
  }

  const handleConfirmImport = async () => {
    setImportPreviewOpen(false)
    const newItems = [...items, ...importPreview]
    await saveItems(newItems)
    showMsg('ok', `${importPreview.length} materi berhasil diimpor!`)
    setImportPreview([])
  }

  const handleExportXLSX = () => {
    if (!prosem) return
    const sortedWeeks = [...weeks].sort((a,b)=>a.pekan_ke-b.pekan_ke)
    const rows = [['Pekan Ke', 'Tanggal Mulai', 'Tanggal Selesai', 'Jenis', 'KD/TP', 'Materi', 'JP', 'Catatan']]
    for (const w of sortedWeeks) {
      const wItems = items.filter(i=>i.pekan_ke===w.pekan_ke)
      if (wItems.length === 0) {
        rows.push([w.pekan_ke, w.tanggal_mulai||'', w.tanggal_selesai||'', w.jenis||'', '', '', '', ''])
      } else {
        wItems.forEach(it => {
          rows.push([w.pekan_ke, w.tanggal_mulai||'', w.tanggal_selesai||'', w.jenis||'', it.kd||'', it.materi||'', it.jp||'', it.catatan||''])
        })
      }
    }
    const noWeekItems = items.filter(i=>!sortedWeeks.some(w=>w.pekan_ke===i.pekan_ke))
    noWeekItems.forEach(it => rows.push([it.pekan_ke, '', '', '', it.kd||'', it.materi||'', it.jp||'', it.catatan||'']))

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Prosem')
    XLSX.writeFile(wb, `Prosem_${prosem.mata_pelajaran}_${prosem.kelas}_Sem${prosem.semester}.xlsx`)
  }

  if (loading) return <div style={{ textAlign:'center', color:C.sub, padding:60 }}>Memuat prosem…</div>
  if (!prosem) return <div style={{ textAlign:'center', color:'#f87171', padding:40 }}>Prosem tidak ditemukan.</div>

  const sortedWeeks = weeks.length > 0 ? [...weeks].sort((a,b)=>a.pekan_ke-b.pekan_ke) : []
  const pekanUsed = new Set(items.map(i=>i.pekan_ke))
  const orphanPekans = [...pekanUsed].filter(pk => !sortedWeeks.some(w=>w.pekan_ke===pk)).sort((a,b)=>a-b)

  return (
    <>
      <Toast msg={msg} />

      {/* Hidden file input for AI import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        style={{ display:'none' }}
        onChange={handleFileChange}
      />

      <ImportPreviewModal
        open={importPreviewOpen}
        onClose={()=>setImportPreviewOpen(false)}
        importedItems={importPreview}
        onConfirm={handleConfirmImport}
        weeks={weeks}
      />

      <div style={{ padding:'14px 14px 0' }}>

        {/* Prosem header info */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:6 }}>{prosem.mata_pelajaran}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 20px', fontSize:12 }}>
            {[['Kelas', prosem.kelas], ['Semester', `Semester ${prosem.semester}`], ['T.A.', prosem.tahun_ajaran]].map(([l,v])=>(
              <span key={l}><span style={{ color:C.sub }}>{l}: </span><span style={{ color:'#fff', fontWeight:700 }}>{v}</span></span>
            ))}
            {prosem.subject_name && (
              <span><span style={{ color:C.sub }}>Mapel: </span><span style={{ color:C.primary, fontWeight:700 }}>{prosem.subject_name}</span></span>
            )}
          </div>
        </div>

        {/* Calendar selector */}
        <div style={{ marginBottom:14 }}>
          <Label>Kalender Akademik (untuk pekan)</Label>
          {calendars.length === 0
            ? <div style={{ fontSize:12, color:C.sub, padding:'8px 0' }}>Belum ada kalender akademik. Buat di menu Kalender terlebih dahulu.</div>
            : <select value={calId} onChange={e=>setCalId(e.target.value)} style={inp}>
                {calendars.map(c=><option key={c.id} value={String(c.id)}>{c.nama || `${c.tahun_ajaran} — Semester ${c.semester}`}</option>)}
              </select>
          }
        </div>

        {/* Action bar */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <button onClick={()=>openAddItem(null)} style={{ flex:1, background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 14px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>➕ Tambah Materi</button>
          <button
            onClick={handleImportClick}
            disabled={importing}
            style={{ flex:'0 0 auto', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.35)', borderRadius:10, padding:'9px 12px', color:'#a78bfa', fontWeight:700, fontSize:12, cursor:importing?'not-allowed':'pointer', fontFamily:'inherit' }}
          >
            {importing ? '⏳ Menganalisis…' : '🤖 Import File'}
          </button>
          <button onClick={handleExportXLSX} style={{ flex:'0 0 auto', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.sub, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📥 XLSX</button>
        </div>

        {/* Import hint */}
        <div style={{ fontSize:11, color:'rgba(167,139,250,0.6)', marginBottom:10 }}>
          🤖 Import File: upload silabus PDF/DOCX → AI ekstrak materi per pekan otomatis
        </div>

        {/* Summary */}
        <div style={{ fontSize:11, color:C.sub, marginBottom:10 }}>
          {items.length > 0 ? `${items.length} materi · ${[...new Set(items.map(i=>i.pekan_ke))].length} pekan terisi` : 'Belum ada materi'}
        </div>

        {/* Grid: weeks with items */}
        {sortedWeeks.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {sortedWeeks.map(w => {
              const wItems = items.filter(i=>i.pekan_ke===w.pekan_ke)
              const isKBM = ['efektif','kbm'].includes(w.jenis?.toLowerCase())
              return (
                <div key={w.id} style={{ background:C.card, border:`1px solid ${isKBM && wItems.length>0 ? 'rgba(34,197,94,0.4)' : C.border}`, borderRadius:12 }}>
                  <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom: wItems.length>0 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:800, color:C.primary, fontSize:12 }}>Pekan {w.pekan_ke}</span>
                      <JenisBadge jenis={w.jenis} />
                      {w.tanggal_mulai && <span style={{ fontSize:10, color:C.sub }}>{fmtDate(w.tanggal_mulai)} – {fmtDate(w.tanggal_selesai)}</span>}
                    </div>
                    {isKBM && (
                      <button onClick={()=>openAddItem(w)} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:6, padding:'3px 8px', color:C.primary, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Materi</button>
                    )}
                  </div>

                  {wItems.length === 0 && isKBM && (
                    <div style={{ padding:'10px 12px', fontSize:11, color:C.sub }}>Belum ada materi untuk pekan ini.</div>
                  )}
                  {wItems.length === 0 && !isKBM && (
                    <div style={{ padding:'8px 12px', fontSize:11, color:C.sub, fontStyle:'italic' }}>{w.keterangan || w.jenis}</div>
                  )}
                  {wItems.map((it, idx) => (
                    <div key={it.id} style={{ padding:'10px 12px', borderTop: idx>0?`1px solid ${C.border}`:'none', display:'flex', alignItems:'flex-start', gap:10 }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:C.primary, fontWeight:700, flexShrink:0, marginTop:2 }}>{idx+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        {it.kd && <div style={{ fontSize:10, color:'#a78bfa', fontWeight:700, marginBottom:2 }}>{it.kd}</div>}
                        <div style={{ fontSize:12, color:'#fff', fontWeight:600, lineHeight:1.4 }}>{it.materi}</div>
                        <div style={{ fontSize:10, color:C.sub, marginTop:2 }}>
                          {it.jp ? `${it.jp} JP` : ''}{it.catatan ? ` · ${it.catatan}` : ''}
                        </div>
                      </div>
                      <button onClick={()=>openEditItem(it)} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13 }}>✏️</button>
                      <button onClick={()=>handleDeleteItem(it.id)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:13 }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* Orphan items (no matching week) */}
        {orphanPekans.length > 0 && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Materi Tanpa Kalender</div>
            {orphanPekans.map(pk => {
              const pItems = items.filter(i=>i.pekan_ke===pk)
              return pItems.map((it,idx) => (
                <div key={it.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:10, color:C.sub, minWidth:50 }}>Pekan {pk}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:'#fff' }}>{it.materi}</div>
                    <div style={{ fontSize:10, color:C.sub }}>{it.kd||''}{it.jp?` · ${it.jp} JP`:''}</div>
                  </div>
                  <button onClick={()=>openEditItem(it)} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13 }}>✏️</button>
                  <button onClick={()=>handleDeleteItem(it.id)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:13 }}>🗑️</button>
                </div>
              ))
            })}
          </div>
        )}

        {weeks.length === 0 && items.length > 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginTop:12 }}>
            {items.map((it,idx) => (
              <div key={it.id} style={{ padding:'10px 12px', borderTop:idx>0?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:10, color:C.sub, minWidth:50 }}>P{it.pekan_ke||'—'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'#fff', fontWeight:600 }}>{it.materi}</div>
                  <div style={{ fontSize:10, color:C.sub }}>{it.kd||''}{it.jp?` · ${it.jp} JP`:''}</div>
                </div>
                <button onClick={()=>openEditItem(it)} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13 }}>✏️</button>
                <button onClick={()=>handleDeleteItem(it.id)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:13 }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item form modal */}
      <Modal open={itemFormOpen} onClose={()=>setItemFormOpen(false)}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>{editItem?'✏️ Edit Materi':'➕ Tambah Materi'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div>
            <Label>Pekan Ke</Label>
            {weeks.length > 0
              ? <select value={itemForm.pekan_ke} onChange={e=>fi('pekan_ke',e.target.value)} style={inp}>
                  <option value="">— Pilih Pekan —</option>
                  {[...weeks].sort((a,b)=>a.pekan_ke-b.pekan_ke).filter(w=>['efektif','kbm'].includes(w.jenis?.toLowerCase())).map(w=>(
                    <option key={w.id} value={w.pekan_ke}>Pekan {w.pekan_ke} · {fmtDate(w.tanggal_mulai)}</option>
                  ))}
                </select>
              : <input type="number" min="1" value={itemForm.pekan_ke} onChange={e=>fi('pekan_ke',e.target.value)} placeholder="1" style={inp} />
            }
          </div>
          <div><Label>KD / TP (opsional)</Label><input value={itemForm.kd} onChange={e=>fi('kd',e.target.value)} placeholder="TP 1, 4.2, …" style={inp} /></div>
          <div><Label>Materi *</Label><textarea value={itemForm.materi} onChange={e=>fi('materi',e.target.value)} rows={3} placeholder="Deskripsi materi pembelajaran" style={{ ...inp, resize:'vertical' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div><Label>JP</Label><input type="number" min="1" value={itemForm.jp} onChange={e=>fi('jp',e.target.value)} style={inp} /></div>
            <div><Label>Catatan</Label><input value={itemForm.catatan} onChange={e=>fi('catatan',e.target.value)} placeholder="opsional" style={inp} /></div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          <button onClick={()=>setItemFormOpen(false)} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleItemSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
        </div>
      </Modal>
    </>
  )
}

function fmtDate(s) {
  if (!s) return ''
  try {
    // Ambil hanya bagian tanggal (YYYY-MM-DD) — menghindari double-T dari ISO timestamp PostgreSQL
    const datePart = String(s).slice(0, 10)
    return new Date(datePart + 'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short' })
  } catch { return s }
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function Eob5ProsemScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [openProsemId, setOpenProsemId] = useState(null)

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => { if(openProsemId) setOpenProsemId(null); else goBack() }} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{openProsemId ? 'Detail Program Semester' : 'Program Semester'}</div>
        </div>
      </div>

      {openProsemId
        ? <ProsemDetail prosemId={openProsemId} onBack={()=>setOpenProsemId(null)} />
        : <ProsemList onOpen={p=>setOpenProsemId(p.id)} />
      }
    </div>
  )
}
