/**
 * Eob5ManajemenSiswaScreen.jsx
 * List siswa per kelas, filter, tambah/edit/hapus, import Excel.
 * API: /api/eob5/siswa/list, /api/eob5/siswa/:id, /api/eob5/kelas/list
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import * as XLSX from 'xlsx'
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
const AVATAR_COLORS = [
  ['#3b82f6','rgba(59,130,246,0.2)'], ['#ec4899','rgba(236,72,153,0.2)'],
  ['#f59e0b','rgba(245,158,11,0.2)'], ['#8b5cf6','rgba(139,92,246,0.2)'],
  ['#22c55e','rgba(34,197,94,0.2)'],  ['#14b8a6','rgba(20,184,166,0.2)'],
  ['#f97316','rgba(249,115,22,0.2)'], ['#06b6d4','rgba(6,182,212,0.2)'],
]
function avatarStyle(idx) {
  const [color, bg] = AVATAR_COLORS[idx % AVATAR_COLORS.length]
  return { width:34, height:34, borderRadius:'50%', background:bg, color, display:'flex',
           alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, flexShrink:0 }
}
function initials(name) {
  return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?'
}

function Toast({ msg }) {
  if (!msg.text) return null
  const ok = msg.type === 'ok'
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:400,
      background: ok?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)', color:'#fff', borderRadius:12,
      padding:'10px 22px', fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
      maxWidth:320, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:C.overlay, zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1f1300', border:`1px solid ${C.border}`,
        borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto',
        padding:'20px 16px 32px' }}>
        {children}
      </div>
    </div>
  )
}

const BLANK = { name:'', kelas:'', jenis_kelamin:'L', username:'', whatsapp:'' }

export default function Eob5ManajemenSiswaScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [kelasList, setKelasList] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editSiswa, setEditSiswa] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [importRows, setImportRows] = useState([])
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })
  const fileRef = useRef()

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>
      Akses hanya untuk guru.
    </div>
  )

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}),3000) }
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  const loadKelas = () => {
    fetch('/api/eob5/kelas/list', { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>setKelasList(Array.isArray(d)?d.map(k=>k.kelas||k):[])).catch(()=>{})
  }

  const loadStudents = () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (kelasFilter) q.set('kelas', kelasFilter)
    if (search) q.set('search', search)
    fetch(`/api/eob5/siswa/list?${q}`, { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>{ setStudents(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>{ setStudents([]); setLoading(false) })
  }

  useEffect(()=>{ loadKelas() }, [])
  useEffect(()=>{ loadStudents() }, [kelasFilter, search])

  const filtered = useMemo(()=>
    genderFilter ? students.filter(s=>s.jenis_kelamin===genderFilter) : students,
  [students, genderFilter])

  const totalL = students.filter(s=>s.jenis_kelamin==='L').length
  const totalP = students.filter(s=>s.jenis_kelamin==='P').length

  const openAdd = () => { setEditSiswa(null); setForm(BLANK); setFormErr(''); setModalOpen(true) }
  const openEdit = (s) => {
    setEditSiswa(s)
    setForm({ name:s.name||'', kelas:s.kelas||'', jenis_kelamin:s.jenis_kelamin||'L',
              username:s.username||'', whatsapp:s.whatsapp||'' })
    setFormErr(''); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormErr('Nama wajib diisi'); return }
    if (!form.kelas.trim()) { setFormErr('Kelas wajib diisi'); return }
    setSaving(true); setFormErr('')
    try {
      const url = editSiswa ? `/api/eob5/siswa/${editSiswa.id}` : '/api/eob5/siswa'
      const method = editSiswa ? 'PUT' : 'POST'
      const r = await fetch(url, { method, credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) {
        showMsg('ok', editSiswa ? 'Data siswa diperbarui.' : 'Siswa ditambahkan.')
        setModalOpen(false); loadStudents()
      } else {
        const d = await r.json(); setFormErr(d.error||'Gagal menyimpan')
      }
    } catch { setFormErr('Gagal terhubung ke server') }
    setSaving(false)
  }

  const handleDelete = async (s) => {
    if (!confirm(`Hapus siswa "${s.name}"? Tindakan ini tidak dapat dibatalkan.`)) return
    const r = await fetch(`/api/eob5/siswa/${s.id}`, { method:'DELETE', credentials:'include' })
    if (r.ok) { showMsg('ok','Siswa dihapus.'); loadStudents() }
    else showMsg('err','Gagal menghapus siswa.')
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type:'array' })
      const rows = []
      for (const sn of wb.SheetNames) {
        const sheet = wb.Sheets[sn]
        if (!sheet) continue
        const sr = XLSX.utils.sheet_to_json(sheet, { header:1, raw:false, defval:'' })
        for (const row of sr) rows.push(row.map(c=>String(c??'').trim()))
      }
      const nonEmpty = rows.filter(r=>r.some(c=>c!==''))
      if (nonEmpty.length === 0) { showMsg('err','File tidak berisi data.'); return }
      // Asumsikan baris pertama header, sisanya data
      const header = nonEmpty[0].map(h=>h.toLowerCase())
      const nameIdx = header.findIndex(h=>h.includes('nama'))
      const kelasIdx = header.findIndex(h=>h.includes('kelas'))
      const jkIdx = header.findIndex(h=>h.includes('jenis') || h==='l/p' || h==='jk')
      const hpIdx = header.findIndex(h=>h.includes('hp') || h.includes('wa') || h.includes('whatsapp'))
      const dataRows = nonEmpty.slice(nameIdx>=0 ? 1 : 0)
      const parsed = dataRows.map(r => ({
        name: nameIdx>=0 ? r[nameIdx] : r[0] || '',
        kelas: kelasIdx>=0 ? r[kelasIdx] : r[1] || '',
        jenis_kelamin: jkIdx>=0
          ? (r[jkIdx].toUpperCase().startsWith('P') ? 'P' : 'L')
          : 'L',
        whatsapp: hpIdx>=0 ? r[hpIdx] : '',
      })).filter(r=>r.name && r.kelas)
      if (parsed.length === 0) { showMsg('err','Tidak ditemukan data nama & kelas.'); return }
      setImportRows(parsed); setVerifyOpen(true)
    } catch { showMsg('err','Gagal membaca file Excel.') }
  }

  const handleConfirmImport = async () => {
    if (importRows.some(r=>!r.name||!r.kelas)) { showMsg('err','Nama dan kelas wajib pada semua baris.'); return }
    setImporting(true)
    try {
      const r = await fetch('/api/eob5/siswa/bulk', { method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({ students:importRows }) })
      if (r.ok) {
        const d = await r.json()
        showMsg('ok', `${d.created} siswa ditambahkan${d.skipped>0?`, ${d.skipped} dilewati`:''}`)
        setVerifyOpen(false); setImportRows([]); loadStudents()
      } else { const d=await r.json(); showMsg('err',d.error||'Gagal import') }
    } catch { showMsg('err','Gagal terhubung ke server') }
    setImporting(false)
  }

  const updateImportRow = (i, patch) => setImportRows(rows=>rows.map((r,idx)=>idx===i?{...r,...patch}:r))
  const removeImportRow = (i) => setImportRows(rows=>rows.filter((_,idx)=>idx!==i))

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <Toast msg={msg} />

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Manajemen Siswa</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input type="file" accept=".xlsx,.xls,.csv" ref={fileRef} onChange={handleImportFile} style={{ display:'none' }} />
          <button onClick={()=>fileRef.current?.click()} style={{ background:C.white, border:`1px solid ${C.border}`,
            borderRadius:10, padding:'7px 12px', color:C.text, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            📥 Import Excel
          </button>
          <button onClick={openAdd} style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none',
            borderRadius:10, padding:'7px 12px', color:'#1a0a00', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
            + Tambah
          </button>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { label:'Total Siswa', value:students.length, color:'#3b82f6', bg:'rgba(59,130,246,0.15)', emoji:'👥' },
            { label:'Laki-laki', value:totalL, color:'#60a5fa', bg:'rgba(96,165,250,0.15)', emoji:'♂️' },
            { label:'Perempuan', value:totalP, color:'#f472b6', bg:'rgba(244,114,182,0.15)', emoji:'♀️' },
          ].map(s=>(
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
              padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{s.emoji} {s.label}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>
                {loading ? '…' : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari nama atau username…"
            style={{ ...inp, padding:'9px 13px' }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <select value={kelasFilter} onChange={e=>setKelasFilter(e.target.value)} style={inp}>
              <option value="">Semua Kelas</option>
              {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
            </select>
            <select value={genderFilter} onChange={e=>setGenderFilter(e.target.value)} style={inp}>
              <option value="">Semua Gender</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', marginBottom:12 }}>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 70px 60px 70px', gap:4, padding:'8px 12px',
            background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700,
            textTransform:'uppercase', letterSpacing:0.5 }}>
            <span>No</span><span>Nama</span><span>Kelas</span><span>JK</span><span style={{textAlign:'center'}}>Aksi</span>
          </div>

          {loading && (
            <div style={{ textAlign:'center', color:C.sub, padding:40, fontSize:13 }}>Memuat…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:'center', color:C.sub, padding:40 }}>
              <div style={{ fontSize:28, marginBottom:8 }}>👥</div>
              <div style={{ fontSize:13 }}>{search||kelasFilter||genderFilter ? 'Tidak ada siswa yang cocok.' : 'Belum ada data siswa.'}</div>
            </div>
          )}

          {!loading && filtered.map((s, idx) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'36px 1fr 70px 60px 70px', gap:4,
              padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
              <span style={{ fontSize:11, color:C.sub }}>{idx+1}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                <div style={avatarStyle(idx)}>{initials(s.name)}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {s.name}
                  </div>
                  {s.username && <div style={{ fontSize:10, color:C.sub, fontFamily:'monospace' }}>@{s.username}</div>}
                </div>
              </div>
              <span style={{ fontSize:11, background:C.dim, color:C.primary, borderRadius:6, padding:'2px 7px',
                fontWeight:700, textAlign:'center' }}>{s.kelas}</span>
              <span style={{ fontSize:11, color: s.jenis_kelamin==='L'?'#60a5fa':'#f472b6', fontWeight:700, textAlign:'center' }}>
                {s.jenis_kelamin==='L'?'L':'P'}
              </span>
              <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                <button onClick={()=>{ navigate && navigate('eob5-detail-siswa');
                  window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail:{ id:s.id } })) }}
                  style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13, padding:'2px 3px' }}>👁</button>
                <button onClick={()=>openEdit(s)}
                  style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:13, padding:'2px 3px' }}>✏️</button>
                <button onClick={()=>handleDelete(s)}
                  style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:13, padding:'2px 3px' }}>🗑</button>
              </div>
            </div>
          ))}

          {!loading && filtered.length > 0 && (
            <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}`, fontSize:11, color:C.sub, textAlign:'right' }}>
              Menampilkan {filtered.length} dari {students.length} siswa
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:14 }}>
          {editSiswa ? '✏️ Edit Data Siswa' : '➕ Tambah Siswa Baru'}
        </div>
        {formErr && (
          <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444', borderRadius:8,
            padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:10 }}>{formErr}</div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Nama Lengkap *</div>
            <input value={form.name} onChange={e=>f('name',e.target.value)} placeholder="Contoh: Budi Santoso" style={inp} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Kelas *</div>
              <select value={form.kelas} onChange={e=>f('kelas',e.target.value)} style={inp}>
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Jenis Kelamin</div>
              <select value={form.jenis_kelamin} onChange={e=>f('jenis_kelamin',e.target.value)} style={inp}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>WhatsApp (opsional)</div>
            <input value={form.whatsapp} onChange={e=>f('whatsapp',e.target.value)} placeholder="628xxxxxxxxx" style={inp} />
          </div>
          {!editSiswa && (
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Username (opsional)</div>
              <input value={form.username} onChange={e=>f('username',e.target.value)} placeholder="Biarkan kosong untuk auto-generate" style={inp} />
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>setModalOpen(false)} style={{ flex:'0 0 auto', background:'none',
            border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px', color:C.sub,
            cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ flex:1,
            background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10,
            padding:'11px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer',
            fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
        </div>
      </Modal>

      {/* Import Verify Modal */}
      <Modal open={verifyOpen} onClose={()=>{ setVerifyOpen(false); setImportRows([]) }}>
        <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:6 }}>✅ Verifikasi Import Excel</div>
        <div style={{ fontSize:12, color:C.sub, marginBottom:14 }}>
          {importRows.length} baris data ditemukan. Periksa dan perbaiki sebelum disimpan.
        </div>
        <div style={{ maxHeight:'45vh', overflowY:'auto', marginBottom:14 }}>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 50px 30px', gap:6, padding:'6px 8px',
            background:'rgba(0,0,0,0.3)', fontSize:10, color:C.sub, fontWeight:700,
            textTransform:'uppercase', borderRadius:'8px 8px 0 0' }}>
            <span>Nama</span><span>Kelas</span><span>JK</span><span></span>
          </div>
          {importRows.map((row, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 50px 30px', gap:6,
              padding:'6px 8px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
              <input value={row.name} onChange={e=>updateImportRow(i,{name:e.target.value})}
                style={{ ...inp, padding:'5px 8px', fontSize:11 }} />
              <select value={row.kelas} onChange={e=>updateImportRow(i,{kelas:e.target.value})}
                style={{ ...inp, padding:'5px 8px', fontSize:11 }}>
                <option value="">--</option>
                {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
              <select value={row.jenis_kelamin} onChange={e=>updateImportRow(i,{jenis_kelamin:e.target.value})}
                style={{ ...inp, padding:'5px 8px', fontSize:11 }}>
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
              <button onClick={()=>removeImportRow(i)} style={{ background:'none', border:'none',
                color:'#f87171', cursor:'pointer', fontSize:14, padding:'2px' }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>{ setVerifyOpen(false); setImportRows([]) }} style={{ flex:'0 0 auto',
            background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 14px',
            color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={handleConfirmImport} disabled={importing||importRows.length===0}
            style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none',
              borderRadius:10, padding:'11px', color:'#1a0a00', fontWeight:800,
              cursor:(importing||importRows.length===0)?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>
            {importing?'Menyimpan…':`💾 Simpan ${importRows.length} Siswa`}
          </button>
        </div>
      </Modal>
    </div>
  )
}
