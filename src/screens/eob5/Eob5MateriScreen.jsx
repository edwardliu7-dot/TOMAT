import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

const TIPE_OPTIONS = ['pdf','video','link','modul-ajar','lainnya']
const TIPE_EMOJI = { pdf:'📄', video:'🎬', link:'🔗', 'modul-ajar':'📓', lainnya:'📎' }

const EMPTY_FORM = { judul:'', deskripsi:'', kelas:'', mata_pelajaran:'', url_file:'', tipe:'link' }

export default function Eob5MateriScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })
  const [filterKelas, setFilterKelas] = useState('')
  const [filterMapel, setFilterMapel] = useState('')
  const [filterTipe, setFilterTipe] = useState('')

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const loadList = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filterKelas) p.set('kelas', filterKelas)
    if (filterMapel) p.set('mata_pelajaran', filterMapel)
    if (filterTipe) p.set('tipe', filterTipe)
    fetch(`/api/eob5/materi?${p}`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
    loadList()
  }, [])
  useEffect(() => { loadList() }, [filterKelas, filterMapel, filterTipe])

  const f = (k,v) => setForm(p => ({ ...p, [k]:v }))

  const handleSave = async () => {
    if (!form.judul) { setMsg({type:'error',text:'Judul materi wajib diisi'}); return }
    setSaving(true); setMsg({type:'',text:''})
    try {
      const r = await fetch('/api/eob5/materi', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) {
        setMsg({type:'ok',text:'Materi berhasil ditambahkan!'}); setShowForm(false); setForm(EMPTY_FORM); loadList()
      } else {
        const d = await r.json(); setMsg({type:'error',text:d.error||'Gagal menyimpan'})
      }
    } catch { setMsg({type:'error',text:'Gagal terhubung ke server'}) }
    setSaving(false)
    setTimeout(() => setMsg({type:'',text:''}), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus materi ini?')) return
    await fetch(`/api/eob5/materi/${id}`, { method:'DELETE', credentials:'include' })
    loadList()
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}><div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div><div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Materi Ajar</div></div>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM) }} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>{showForm?'✕ Tutup':'+ Tambah'}</button>
      </div>

      <div style={{ padding:16 }}>
        {msg.text && <div style={{ background:msg.type==='ok'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${msg.type==='ok'?'#22c55e':'#ef4444'}`, borderRadius:10, padding:'10px 14px', color:msg.type==='ok'?'#4ade80':'#f87171', fontSize:13, marginBottom:12 }}>{msg.text}</div>}

        {/* Add Form */}
        {showForm && (
          <div style={{ background:'rgba(0,0,0,0.4)', border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.primary, marginBottom:14 }}>Tambah Materi Baru</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>JUDUL *</div>
                <input value={form.judul} onChange={e=>f('judul',e.target.value)} placeholder="Judul materi" style={{ ...inputSt }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>DESKRIPSI</div>
                <textarea value={form.deskripsi} onChange={e=>f('deskripsi',e.target.value)} rows={2} placeholder="Deskripsi singkat…" style={{ ...inputSt, resize:'vertical' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>KELAS</div>
                  <select value={form.kelas} onChange={e=>f('kelas',e.target.value)} style={{ ...inputSt }}>
                    <option value="">— Pilih —</option>
                    {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>MAPEL</div>
                  <input value={form.mata_pelajaran} onChange={e=>f('mata_pelajaran',e.target.value)} placeholder="Mis: Matematika" style={{ ...inputSt }} />
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>TIPE</div>
                  <select value={form.tipe} onChange={e=>f('tipe',e.target.value)} style={{ ...inputSt }}>
                    {TIPE_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>URL / LINK FILE</div>
                <input value={form.url_file} onChange={e=>f('url_file',e.target.value)} placeholder="https://…" style={{ ...inputSt }} />
              </div>
              <button onClick={handleSave} disabled={saving} style={{ background:saving?C.dim:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:12, padding:'13px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>
                {saving?'Menyimpan…':'💾 Tambahkan Materi'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} style={{ ...inputSt, fontSize:11 }}>
            <option value="">Semua Kelas</option>
            {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
          </select>
          <input value={filterMapel} onChange={e=>setFilterMapel(e.target.value)} placeholder="Filter mapel…" style={{ ...inputSt, fontSize:11 }} />
          <select value={filterTipe} onChange={e=>setFilterTipe(e.target.value)} style={{ ...inputSt, fontSize:11 }}>
            <option value="">Semua Tipe</option>
            {TIPE_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat materi…</div>}
        {!loading && list.length===0 && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada materi. Klik "+ Tambah" untuk mulai.</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {list.map(m => (
            <div key={m.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ fontSize:28, flexShrink:0, marginTop:2 }}>{TIPE_EMOJI[m.tipe]||'📎'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'#fff', fontSize:14, marginBottom:3 }}>{m.judul}</div>
                  {m.deskripsi && <div style={{ fontSize:12, color:C.sub, marginBottom:5, lineHeight:1.4 }}>{m.deskripsi}</div>}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {m.kelas && <span style={{ background:C.dim, color:C.primary, borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.kelas}</span>}
                    {m.mata_pelajaran && <span style={{ background:'rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:5, padding:'2px 7px', fontSize:10 }}>{m.mata_pelajaran}</span>}
                    <span style={{ background:'rgba(255,255,255,0.06)', color:'#64748b', borderRadius:5, padding:'2px 7px', fontSize:10 }}>{m.tipe}</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                  {m.url_file && <a href={m.url_file} target="_blank" rel="noopener noreferrer" style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 10px', color:C.primary, fontSize:11, fontWeight:700, textDecoration:'none' }}>Buka →</a>}
                  <button onClick={() => handleDelete(m.id)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'5px 10px', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
