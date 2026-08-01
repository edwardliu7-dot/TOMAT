import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}

const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

const EMPTY_FORM = { kelas:'', mata_pelajaran:'', hari:'Senin', jam_mulai:'07:00', jam_selesai:'08:00', ruangan:'', tahun_ajaran:'2025/2026' }

export default function Eob5JadwalScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [jadwalList, setJadwalList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [filterKelas, setFilterKelas] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const loadJadwal = () => {
    setLoading(true)
    const p = filterKelas ? `?kelas=${encodeURIComponent(filterKelas)}` : ''
    fetch(`/api/eob5/jadwal${p}`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setJadwalList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
    loadJadwal()
  }, [])

  useEffect(() => { loadJadwal() }, [filterKelas])

  const f = (k,v) => setForm(prev => ({ ...prev, [k]:v }))

  const handleSave = async () => {
    if (!form.kelas || !form.mata_pelajaran || !form.hari || !form.jam_mulai || !form.jam_selesai) {
      setMsg({type:'error', text:'Kelas, mata pelajaran, hari, dan jam wajib diisi'}); return
    }
    setSaving(true); setMsg({type:'',text:''})
    const url = editId ? `/api/eob5/jadwal/${editId}` : '/api/eob5/jadwal'
    const method = editId ? 'PUT' : 'POST'
    try {
      const r = await fetch(url, { method, credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) {
        setMsg({type:'ok', text: editId?'Jadwal diperbarui!':'Jadwal berhasil ditambahkan!'})
        setShowForm(false); setEditId(null); setForm(EMPTY_FORM); loadJadwal()
      } else {
        const d = await r.json(); setMsg({type:'error', text:d.error||'Gagal menyimpan'})
      }
    } catch { setMsg({type:'error', text:'Gagal terhubung ke server'}) }
    setSaving(false)
    setTimeout(() => setMsg({type:'',text:''}), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return
    await fetch(`/api/eob5/jadwal/${id}`, { method:'DELETE', credentials:'include' })
    loadJadwal()
  }

  // Group by hari
  const grouped = {}
  for (const h of HARI) grouped[h] = jadwalList.filter(j => j.hari === h)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}><div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div><div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Jadwal Pelajaran</div></div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Tambah</button>
      </div>

      <div style={{ padding:16 }}>
        {/* Filter */}
        <div style={{ marginBottom:14 }}>
          <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} style={{ ...inputSt }}>
            <option value="">Semua Kelas</option>
            {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
          </select>
        </div>

        {msg.text && <div style={{ background:msg.type==='ok'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${msg.type==='ok'?'#22c55e':'#ef4444'}`, borderRadius:10, padding:'10px 14px', color:msg.type==='ok'?'#4ade80':'#f87171', fontSize:13, marginBottom:12 }}>{msg.text}</div>}

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ background:'rgba(0,0,0,0.4)', border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.primary, marginBottom:14 }}>{editId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['kelas','Kelas'],['mata_pelajaran','Mata Pelajaran'],['ruangan','Ruangan (opsional)'],['tahun_ajaran','Tahun Ajaran']].map(([key,label]) => (
                <div key={key}>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>{label.toUpperCase()}</div>
                  {key === 'kelas' ? (
                    <select value={form[key]} onChange={e=>f(key,e.target.value)} style={{ ...inputSt }}>
                      <option value="">— Pilih —</option>
                      {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
                    </select>
                  ) : (
                    <input value={form[key]} onChange={e=>f(key,e.target.value)} placeholder={label} style={{ ...inputSt }} />
                  )}
                </div>
              ))}
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>HARI</div>
                <select value={form.hari} onChange={e=>f('hari',e.target.value)} style={{ ...inputSt }}>
                  {HARI.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                <div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>MULAI</div>
                  <input type="time" value={form.jam_mulai} onChange={e=>f('jam_mulai',e.target.value)} style={{ ...inputSt }} />
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>SELESAI</div>
                  <input type="time" value={form.jam_selesai} onChange={e=>f('jam_selesai',e.target.value)} style={{ ...inputSt }} />
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:12, padding:'12px', color:'#1a0a00', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
              <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 16px', color:C.sub, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat jadwal…</div>}
        {!loading && jadwalList.length===0 && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada jadwal. Klik "+ Tambah" untuk mulai.</div>}

        {/* Grouped by day */}
        {!loading && HARI.map(hari => grouped[hari].length > 0 && (
          <div key={hari} style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:C.primary, fontWeight:700, letterSpacing:1.5, marginBottom:8, paddingBottom:4, borderBottom:`1px solid ${C.border}` }}>{hari.toUpperCase()}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {grouped[hari].map(j => (
                <div key={j.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:22, flexShrink:0 }}>📅</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'#fff', fontSize:13 }}>{j.mata_pelajaran}</div>
                    <div style={{ fontSize:11, color:C.sub, marginTop:2 }}>{j.kelas} · {j.jam_mulai?.slice(0,5)}–{j.jam_selesai?.slice(0,5)}{j.ruangan?` · ${j.ruangan}`:''}</div>
                  </div>
                  <button onClick={() => { setEditId(j.id); setForm({ kelas:j.kelas, mata_pelajaran:j.mata_pelajaran, hari:j.hari, jam_mulai:j.jam_mulai?.slice(0,5)||'', jam_selesai:j.jam_selesai?.slice(0,5)||'', ruangan:j.ruangan||'', tahun_ajaran:j.tahun_ajaran||'' }); setShowForm(true) }} style={{ background:'transparent', border:'none', color:C.primary, cursor:'pointer', fontSize:14, padding:'4px 8px' }}>✏️</button>
                  <button onClick={() => handleDelete(j.id)} style={{ background:'transparent', border:'none', color:'#f87171', cursor:'pointer', fontSize:14, padding:'4px 8px' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
