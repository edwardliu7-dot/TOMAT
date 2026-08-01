import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

const EMPTY_FORM = { mata_pelajaran:'', kelas:'', semester:'1', tahun_ajaran:'2025/2026', konten:'' }

export default function Eob5ProsemScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')  // 'list' | 'form' | 'detail'
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })
  const [filterMapel, setFilterMapel] = useState('')
  const [filterKelas, setFilterKelas] = useState('')

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const loadList = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filterMapel) p.set('mata_pelajaran', filterMapel)
    if (filterKelas) p.set('kelas', filterKelas)
    fetch(`/api/eob5/prosem?${p}`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
    loadList()
  }, [])
  useEffect(() => { loadList() }, [filterMapel, filterKelas])

  const f = (k,v) => setForm(p => ({ ...p, [k]:v }))

  const handleSave = async () => {
    if (!form.mata_pelajaran || !form.kelas || !form.semester || !form.tahun_ajaran) { setMsg({type:'error',text:'Semua field wajib diisi'}); return }
    setSaving(true); setMsg({type:'',text:''})
    let konten = null
    if (form.konten.trim()) {
      try { konten = JSON.parse(form.konten) } catch { konten = { teks: form.konten } }
    }
    const url = editId ? `/api/eob5/prosem/${editId}` : '/api/eob5/prosem'
    const method = editId ? 'PUT' : 'POST'
    try {
      const r = await fetch(url, { method, credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, semester:parseInt(form.semester), konten }) })
      if (r.ok) {
        setMsg({type:'ok', text: editId?'Prosem diperbarui!':'Prosem berhasil dibuat!'})
        setView('list'); setEditId(null); setForm(EMPTY_FORM); loadList()
      } else {
        const d = await r.json(); setMsg({type:'error', text:d.error||'Gagal menyimpan'})
      }
    } catch { setMsg({type:'error',text:'Gagal terhubung ke server'}) }
    setSaving(false)
    setTimeout(() => setMsg({type:'',text:''}), 3000)
  }

  const loadDetail = async (id) => {
    const r = await fetch(`/api/eob5/prosem/${id}`, { credentials:'include' })
    const d = await r.json()
    setDetail(d); setView('detail')
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus prosem ini?')) return
    await fetch(`/api/eob5/prosem/${id}`, { method:'DELETE', credentials:'include' })
    loadList()
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => { if(view!=='list') setView('list'); else goBack() }} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{view==='form'?(editId?'Edit Prosem':'Buat Prosem'):view==='detail'?'Detail Prosem':'Program Semester'}</div>
        </div>
        {view==='list' && <button onClick={() => { setView('form'); setEditId(null); setForm(EMPTY_FORM) }} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Buat</button>}
      </div>

      <div style={{ padding:16 }}>
        {msg.text && <div style={{ background:msg.type==='ok'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${msg.type==='ok'?'#22c55e':'#ef4444'}`, borderRadius:10, padding:'10px 14px', color:msg.type==='ok'?'#4ade80':'#f87171', fontSize:13, marginBottom:12 }}>{msg.text}</div>}

        {/* LIST VIEW */}
        {view==='list' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} style={{ ...inputSt }}>
                <option value="">Semua Kelas</option>
                {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
              </select>
              <input value={filterMapel} onChange={e=>setFilterMapel(e.target.value)} placeholder="Filter mata pelajaran…" style={{ ...inputSt }} />
            </div>

            {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat prosem…</div>}
            {!loading && list.length===0 && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada prosem. Klik "+ Buat" untuk mulai.</div>}

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {list.map(p => (
                <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:26, flexShrink:0 }}>📝</div>
                  <div style={{ flex:1, minWidth:0 }} onClick={() => loadDetail(p.id)} style={{ flex:1, cursor:'pointer' }}>
                    <div style={{ fontWeight:700, color:'#fff', fontSize:14 }}>{p.mata_pelajaran}</div>
                    <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>{p.kelas} · Sem {p.semester} · {p.tahun_ajaran}</div>
                  </div>
                  <button onClick={() => { setEditId(p.id); setForm({ mata_pelajaran:p.mata_pelajaran, kelas:p.kelas, semester:String(p.semester), tahun_ajaran:p.tahun_ajaran, konten: p.konten ? JSON.stringify(p.konten,null,2):'' }); setView('form') }} style={{ background:'transparent', border:'none', color:C.primary, cursor:'pointer', fontSize:14, padding:'4px 6px' }}>✏️</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background:'transparent', border:'none', color:'#f87171', cursor:'pointer', fontSize:14, padding:'4px 6px' }}>🗑️</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* FORM VIEW */}
        {view==='form' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[['mata_pelajaran','Mata Pelajaran'],['tahun_ajaran','Tahun Ajaran']].map(([key,label]) => (
              <div key={key}>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>{label.toUpperCase()}</div>
                <input value={form[key]} onChange={e=>f(key,e.target.value)} placeholder={label} style={{ ...inputSt }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>KELAS</div>
              <select value={form.kelas} onChange={e=>f('kelas',e.target.value)} style={{ ...inputSt }}>
                <option value="">— Pilih Kelas —</option>
                {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>SEMESTER</div>
              <select value={form.semester} onChange={e=>f('semester',e.target.value)} style={{ ...inputSt }}>
                <option value="1">Semester 1</option><option value="2">Semester 2</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>KONTEN (opsional — teks atau JSON)</div>
              <textarea value={form.konten} onChange={e=>f('konten',e.target.value)} rows={6} placeholder={'Deskripsi program semester, atau tempel JSON konten…'} style={{ ...inputSt, resize:'vertical', lineHeight:1.5 }} />
            </div>
            <button onClick={handleSave} disabled={saving} style={{ background:saving?C.dim:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:14, padding:'14px', color:'#1a0a00', fontSize:15, fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', marginTop:4 }}>
              {saving?'Menyimpan…':'💾 Simpan Prosem'}
            </button>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view==='detail' && detail && (
          <div>
            <div style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:6 }}>{detail.mata_pelajaran}</div>
              {[['Kelas',detail.kelas],['Semester',`Semester ${detail.semester}`],['Tahun Ajaran',detail.tahun_ajaran]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(245,158,11,0.1)', fontSize:13 }}>
                  <span style={{ color:C.sub }}>{l}</span><span style={{ color:'#fff',fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            {detail.konten && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                <div style={{ fontSize:11, color:C.primary, fontWeight:700, letterSpacing:1, marginBottom:8 }}>KONTEN</div>
                <pre style={{ color:C.text, fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>
                  {typeof detail.konten === 'string' ? detail.konten : JSON.stringify(detail.konten, null, 2)}
                </pre>
              </div>
            )}
            <button onClick={() => { setEditId(detail.id); setForm({ mata_pelajaran:detail.mata_pelajaran, kelas:detail.kelas, semester:String(detail.semester), tahun_ajaran:detail.tahun_ajaran, konten: detail.konten?JSON.stringify(detail.konten,null,2):'' }); setView('form') }} style={{ marginTop:14, width:'100%', background:C.dim, border:`1px solid ${C.border}`, borderRadius:14, padding:'13px', color:C.primary, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              ✏️ Edit Prosem Ini
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
