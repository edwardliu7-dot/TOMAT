/**
 * Eob5InboxScreen.jsx
 *
 * Inbox EOB5 adalah sistem PENGUMUMAN RESMI (broadcast dari admin/kepala sekolah ke guru).
 * Berbeda dari sistem chat TOMAT (/api/komunikasi/*) yang untuk percakapan dua arah.
 * Tabel eob5_inbox terpisah dari pesan_pribadi/pesan_forum_kelas.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

export default function Eob5InboxScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul:'', isi:'', target_role:'guru' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const loadList = () => {
    setLoading(true)
    fetch('/api/eob5/inbox', { credentials:'include' })
      .then(r=>r.json()).then(d => { setList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadList() }, [])

  const handleOpen = async (item) => {
    setSelected(item)
    if (!item.sudah_dibaca) {
      await fetch(`/api/eob5/inbox/${item.id}/baca`, { method:'PUT', credentials:'include' })
      setList(l => l.map(i => i.id===item.id ? { ...i, sudah_dibaca:true } : i))
    }
  }

  const handleSend = async () => {
    if (!form.judul.trim() || !form.isi.trim()) { setMsg({type:'error',text:'Judul dan isi wajib diisi'}); return }
    setSaving(true); setMsg({type:'',text:''})
    try {
      const r = await fetch('/api/eob5/inbox', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) {
        setMsg({type:'ok',text:'Pengumuman berhasil dikirim!'})
        setShowForm(false); setForm({ judul:'', isi:'', target_role:'guru' }); loadList()
      } else {
        const d = await r.json(); setMsg({type:'error',text:d.error||'Gagal mengirim'})
      }
    } catch { setMsg({type:'error',text:'Gagal terhubung ke server'}) }
    setSaving(false)
    setTimeout(() => setMsg({type:'',text:''}), 3000)
  }

  const unread = list.filter(i => !i.sudah_dibaca).length

  if (selected) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
        <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>INBOX EOB5</div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selected.judul}</div>
          </div>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:11, color:C.sub }}>Dari: {selected.nama_pengirim || 'Sistem'}</span>
              <span style={{ fontSize:11, color:C.sub }}>{selected.created_at ? new Date(selected.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : ''}</span>
            </div>
            <div style={{ fontSize:14, color:C.text, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{selected.isi}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Inbox {unread>0 && <span style={{ background:C.primary, color:'#1a0a00', borderRadius:12, padding:'2px 8px', fontSize:12, fontWeight:800, marginLeft:6 }}>{unread}</span>}</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>{showForm?'✕ Tutup':'+ Kirim'}</button>
      </div>

      <div style={{ padding:16 }}>
        {msg.text && <div style={{ background:msg.type==='ok'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${msg.type==='ok'?'#22c55e':'#ef4444'}`, borderRadius:10, padding:'10px 14px', color:msg.type==='ok'?'#4ade80':'#f87171', fontSize:13, marginBottom:12 }}>{msg.text}</div>}

        {/* Send Form */}
        {showForm && (
          <div style={{ background:'rgba(0,0,0,0.4)', border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.primary, marginBottom:14 }}>📣 Buat Pengumuman Baru</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>JUDUL *</div>
                <input value={form.judul} onChange={e=>setForm(f=>({...f,judul:e.target.value}))} placeholder="Judul pengumuman" style={{ ...inputSt }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>ISI PENGUMUMAN *</div>
                <textarea value={form.isi} onChange={e=>setForm(f=>({...f,isi:e.target.value}))} rows={4} placeholder="Tulis pengumuman di sini…" style={{ ...inputSt, resize:'vertical' }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>PENERIMA</div>
                <select value={form.target_role} onChange={e=>setForm(f=>({...f,target_role:e.target.value}))} style={{ ...inputSt }}>
                  <option value="guru">Semua Guru</option>
                  <option value="semua">Semua (Guru & Siswa)</option>
                </select>
              </div>
              <button onClick={handleSend} disabled={saving} style={{ background:saving?C.dim:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:12, padding:'13px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>
                {saving?'Mengirim…':'📣 Kirim Pengumuman'}
              </button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat inbox…</div>}
        {!loading && list.length===0 && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📬</div>
            <div style={{ color:C.sub, fontSize:14 }}>Inbox kosong. Belum ada pengumuman.</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {list.map(item => (
            <button key={item.id} onClick={() => handleOpen(item)} style={{ background: item.sudah_dibaca ? C.card : C.dim, border:`1px solid ${item.sudah_dibaca?C.border:C.primary}`, borderRadius:14, padding:'14px 16px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ fontSize:22, flexShrink:0 }}>{item.sudah_dibaca?'📧':'📩'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight: item.sudah_dibaca?600:800, color: item.sudah_dibaca?C.text:'#fff', fontSize:13, marginBottom:4 }}>{item.judul}</div>
                <div style={{ fontSize:11, color:C.sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.isi}</div>
                <div style={{ fontSize:10, color:C.sub, marginTop:5 }}>
                  {item.nama_pengirim || 'Sistem'} · {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''}
                </div>
              </div>
              {!item.sudah_dibaca && <div style={{ width:8, height:8, borderRadius:'50%', background:C.primary, flexShrink:0, marginTop:4 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
