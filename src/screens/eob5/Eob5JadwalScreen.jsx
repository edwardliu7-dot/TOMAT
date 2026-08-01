/**
 * Eob5JadwalScreen.jsx
 * Timetable grid hari × mata pelajaran, CRUD jadwal, import XLSX.
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../AuthContext'
import * as XLSX from 'xlsx'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.7)',
}
const inp = { background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box', outline:'none' }
const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const BLANK = { kelas:'', mata_pelajaran:'', hari:'Senin', jam_mulai:'07:00', jam_selesai:'08:00', ruangan:'', tahun_ajaran:'2025/2026' }

const MAPEL_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#22c55e','#ec4899','#14b8a6','#ef4444','#f97316','#06b6d4','#84cc16']
function mapelColor(str) {
  let h = 0; for (const c of str) h = (h*31+c.charCodeAt(0))&0xffff
  return MAPEL_COLORS[h % MAPEL_COLORS.length]
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:C.overlay, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#1f1300', border:`1px solid ${C.border}`, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto', padding:'20px 16px 32px' }}>
        {children}
      </div>
    </div>
  )
}

function Toast({ msg }) {
  if (!msg.text) return null
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:300, background: msg.type==='ok'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)', color:'#fff', borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:300, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}

// ── Import XLSX ──────────────────────────────────────────────────────────────
function ImportModal({ open, onClose, kelasList, onSaved }) {
  const fileRef = useRef(null)
  const [rows, setRows] = useState([])  // parsed rows
  const [step, setStep] = useState('upload') // 'upload' | 'preview'
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function reset() { setRows([]); setStep('upload'); setErr(''); if (fileRef.current) fileRef.current.value = '' }
  function handleClose() { reset(); onClose() }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx','xls','csv'].includes(ext)) { setErr('Format tidak didukung. Gunakan XLSX, XLS, atau CSV.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type:'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' })
        if (raw.length < 2) { setErr('File kosong atau tidak ada data.'); return }

        // Try to detect header row
        const headerRow = raw[0].map(v => String(v).toLowerCase().trim())
        const hIdx = { hari:-1, mapel:-1, kelas:-1, mulai:-1, selesai:-1, ruangan:-1, ta:-1 }
        headerRow.forEach((h,i) => {
          if (h.includes('hari')) hIdx.hari = i
          if (h.includes('mapel')||h.includes('mata pelajaran')||h.includes('pelajaran')) hIdx.mapel = i
          if (h.includes('kelas')) hIdx.kelas = i
          if (h.includes('mulai')||h.includes('start')) hIdx.mulai = i
          if (h.includes('selesai')||h.includes('end')||h.includes('akhir')) hIdx.selesai = i
          if (h.includes('ruangan')||h.includes('room')) hIdx.ruangan = i
          if (h.includes('tahun')||h.includes('ajaran')||h.includes('t.a')) hIdx.ta = i
        })

        const parsed = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => ({
          hari: hIdx.hari>=0 ? String(r[hIdx.hari]||'').trim() : '',
          mata_pelajaran: hIdx.mapel>=0 ? String(r[hIdx.mapel]||'').trim() : '',
          kelas: hIdx.kelas>=0 ? String(r[hIdx.kelas]||'').trim() : '',
          jam_mulai: hIdx.mulai>=0 ? String(r[hIdx.mulai]||'').trim() : '',
          jam_selesai: hIdx.selesai>=0 ? String(r[hIdx.selesai]||'').trim() : '',
          ruangan: hIdx.ruangan>=0 ? String(r[hIdx.ruangan]||'').trim() : '',
          tahun_ajaran: hIdx.ta>=0 ? String(r[hIdx.ta]||'').trim() : '2025/2026',
          _valid: true,
        }))

        setRows(parsed)
        setStep('preview')
        setErr('')
      } catch { setErr('Gagal membaca file. Pastikan format valid.') }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const updateRow = (i, k, v) => setRows(prev => prev.map((r,idx) => idx===i ? { ...r, [k]:v } : r))
  const removeRow = (i) => setRows(prev => prev.filter((_,idx) => idx !== i))

  async function handleSave() {
    setSaving(true)
    let ok = 0, fail = 0
    for (const r of rows) {
      if (!r.hari || !r.mata_pelajaran || !r.kelas) { fail++; continue }
      const res = await fetch('/api/eob5/jadwal', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(r) })
      if (res.ok) ok++; else fail++
    }
    setSaving(false)
    onSaved(ok, fail)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div style={{ fontSize:16, fontWeight:800, color:C.primary, marginBottom:14 }}>📥 Import Jadwal dari XLSX</div>

      {step === 'upload' && (
        <>
          {err && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:8, padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:12 }}>{err}</div>}
          <div onClick={() => fileRef.current?.click()} style={{ border:`2px dashed ${C.border}`, borderRadius:14, padding:'32px 20px', textAlign:'center', cursor:'pointer', background:C.card }}>
            <div style={{ fontSize:36, marginBottom:8 }}>📂</div>
            <div style={{ fontWeight:700, color:'#fff', marginBottom:4 }}>Klik untuk pilih file</div>
            <div style={{ fontSize:12, color:C.sub }}>Format: XLSX, XLS, CSV</div>
            <div style={{ fontSize:11, color:C.sub, marginTop:8 }}>Kolom: Hari, Mata Pelajaran, Kelas, Jam Mulai, Jam Selesai, Ruangan</div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:'none' }} onChange={handleFile} />
          <button style={{ marginTop:12, width:'100%', background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:10, color:C.sub, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}
            onClick={handleClose}>Batal</button>
        </>
      )}

      {step === 'preview' && (
        <>
          <div style={{ fontSize:13, color:C.sub, marginBottom:10 }}>Pratinjau {rows.length} baris — edit jika perlu sebelum menyimpan.</div>
          <div style={{ overflowX:'auto', maxHeight:320, overflowY:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.3)' }}>
                  {['Hari','Mapel','Kelas','Mulai','Selesai',''].map(h => (
                    <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:C.sub, fontWeight:700, letterSpacing:0.5, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:'5px 8px' }}>
                      <select value={r.hari} onChange={e=>updateRow(i,'hari',e.target.value)} style={{ ...inp, padding:'4px 6px', fontSize:11, width:'auto' }}>
                        <option value="">—</option>{HARI.map(h=><option key={h}>{h}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'5px 8px' }}><input value={r.mata_pelajaran} onChange={e=>updateRow(i,'mata_pelajaran',e.target.value)} style={{ ...inp, padding:'4px 6px', fontSize:11, minWidth:90 }} /></td>
                    <td style={{ padding:'5px 8px' }}>
                      <select value={r.kelas} onChange={e=>updateRow(i,'kelas',e.target.value)} style={{ ...inp, padding:'4px 6px', fontSize:11, width:'auto' }}>
                        <option value="">—</option>
                        {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'5px 8px' }}><input type="time" value={r.jam_mulai} onChange={e=>updateRow(i,'jam_mulai',e.target.value)} style={{ ...inp, padding:'4px 6px', fontSize:11, width:80 }} /></td>
                    <td style={{ padding:'5px 8px' }}><input type="time" value={r.jam_selesai} onChange={e=>updateRow(i,'jam_selesai',e.target.value)} style={{ ...inp, padding:'4px 6px', fontSize:11, width:80 }} /></td>
                    <td style={{ padding:'5px 8px' }}><button onClick={()=>removeRow(i)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:14 }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => { reset() }} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.sub, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>← Ulang</button>
            <button onClick={handleSave} disabled={saving||rows.length===0} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'10px', color:'#1a0a00', fontWeight:800, cursor: rows.length===0||saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:13 }}>
              {saving ? 'Menyimpan…' : `💾 Simpan ${rows.length} Jadwal`}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

// ── CRUD Form Modal ──────────────────────────────────────────────────────────
function JadwalFormModal({ open, editData, kelasList, onClose, onSaved }) {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(() => {
    if (open) setForm(editData ? { ...editData } : BLANK)
    setErr('')
  }, [open, editData])

  async function handleSave() {
    if (!form.kelas||!form.mata_pelajaran||!form.hari||!form.jam_mulai||!form.jam_selesai) { setErr('Kelas, mata pelajaran, hari, dan jam wajib diisi'); return }
    setSaving(true); setErr('')
    const url = editData ? `/api/eob5/jadwal/${editData.id}` : '/api/eob5/jadwal'
    const method = editData ? 'PUT' : 'POST'
    try {
      const r = await fetch(url, { method, credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (r.ok) { onSaved(); onClose() }
      else { const d = await r.json(); setErr(d.error||'Gagal menyimpan') }
    } catch { setErr('Gagal terhubung ke server') }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:800, color:C.primary, marginBottom:16 }}>{editData ? '✏️ Edit Jadwal' : '➕ Tambah Jadwal'}</div>
      {err && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:8, padding:'8px 12px', color:'#f87171', fontSize:12, marginBottom:12 }}>{err}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <Label>Mata Pelajaran</Label>
          <input value={form.mata_pelajaran} onChange={e=>f('mata_pelajaran',e.target.value)} placeholder="Matematika, IPA…" style={inp} />
        </div>
        <div>
          <Label>Kelas</Label>
          <select value={form.kelas} onChange={e=>f('kelas',e.target.value)} style={inp}>
            <option value="">— Pilih —</option>
            {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
          </select>
        </div>
        <div>
          <Label>Hari</Label>
          <select value={form.hari} onChange={e=>f('hari',e.target.value)} style={inp}>
            {HARI.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <Label>Jam Mulai</Label>
          <input type="time" value={form.jam_mulai} onChange={e=>f('jam_mulai',e.target.value)} style={inp} />
        </div>
        <div>
          <Label>Jam Selesai</Label>
          <input type="time" value={form.jam_selesai} onChange={e=>f('jam_selesai',e.target.value)} style={inp} />
        </div>
        <div>
          <Label>Ruangan</Label>
          <input value={form.ruangan} onChange={e=>f('ruangan',e.target.value)} placeholder="Lab IPA (opsional)" style={inp} />
        </div>
        <div>
          <Label>Tahun Ajaran</Label>
          <input value={form.tahun_ajaran} onChange={e=>f('tahun_ajaran',e.target.value)} placeholder="2025/2026" style={inp} />
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <button onClick={onClose} style={{ flex:'0 0 auto', background:'none', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 16px', color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
        <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:12, padding:'12px', color:'#1a0a00', fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>{saving?'Menyimpan…':'💾 Simpan'}</button>
      </div>
    </Modal>
  )
}

function Label({ children }) {
  return <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{children}</div>
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function Eob5JadwalScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [jadwalList, setJadwalList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterKelas, setFilterKelas] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}), 3000) }

  const loadData = () => {
    setLoading(true)
    const p = filterKelas ? `?kelas=${encodeURIComponent(filterKelas)}` : ''
    fetch(`/api/eob5/jadwal${p}`, { credentials:'include' })
      .then(r=>r.ok?r.json():[]).then(d=>{ setJadwalList(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.ok?r.json():[]).then(d=>{ if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
    loadData()
  }, [])
  useEffect(()=>{ loadData() }, [filterKelas])

  async function handleDelete(id) {
    if (!confirm('Hapus jadwal ini?')) return
    await fetch(`/api/eob5/jadwal/${id}`, { method:'DELETE', credentials:'include' })
    showMsg('ok', 'Jadwal dihapus.')
    loadData()
  }

  // Group by hari
  const byHari = {}
  for (const h of HARI) byHari[h] = jadwalList.filter(j=>j.hari===h).sort((a,b)=>a.jam_mulai?.localeCompare(b.jam_mulai)||0)

  const hasData = jadwalList.length > 0

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <Toast msg={msg} />

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Jadwal Pelajaran</div>
        </div>
        <button onClick={()=>setImportOpen(true)} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 11px', color:C.sub, fontWeight:700, fontSize:11, cursor:'pointer', fontFamily:'inherit', marginRight:4 }}>📥 XLSX</button>
        <button onClick={()=>{ setEditData(null); setFormOpen(true) }} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 13px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Tambah</button>
      </div>

      <div style={{ padding:'16px 14px 0' }}>
        {/* Filter */}
        <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} style={{ ...inp, marginBottom:14 }}>
          <option value="">Semua Kelas</option>
          {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
        </select>

        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat jadwal…</div>}

        {!loading && !hasData && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
            <div style={{ fontWeight:700, color:'#fff', marginBottom:6 }}>Belum ada jadwal</div>
            <div style={{ color:C.sub, fontSize:13, marginBottom:20 }}>Tambahkan jadwal secara manual atau import dari file XLSX</div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>setImportOpen(true)} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 16px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📥 Import XLSX</button>
              <button onClick={()=>{ setEditData(null); setFormOpen(true) }} style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'9px 16px', color:'#1a0a00', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Tambah Manual</button>
            </div>
          </div>
        )}

        {/* Timetable grid — scrollable horizontally */}
        {!loading && hasData && (
          <div style={{ overflowX:'auto', paddingBottom:8 }}>
            <div style={{ display:'flex', gap:10, minWidth: HARI.length * 160 + 'px' }}>
              {HARI.map(hari => {
                const entries = byHari[hari]
                return (
                  <div key={hari} style={{ flex:'0 0 155px', display:'flex', flexDirection:'column', gap:8 }}>
                    {/* Day header */}
                    <div style={{ background: entries.length > 0 ? C.dim : C.card, border:`1px solid ${entries.length>0?C.primary:C.border}`, borderRadius:10, padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:800, color: entries.length>0?C.primary:C.sub, fontSize:13 }}>{hari}</span>
                      {entries.length > 0 && <span style={{ fontSize:10, color:C.sub, background:'rgba(0,0,0,0.25)', borderRadius:6, padding:'2px 6px', fontWeight:700 }}>{entries.length} kls</span>}
                    </div>

                    {entries.length === 0 && (
                      <div style={{ border:`1px dashed ${C.border}`, borderRadius:10, padding:'20px 8px', textAlign:'center', color:C.sub, fontSize:11 }}>Libur</div>
                    )}

                    {entries.map(j => {
                      const col = mapelColor(j.mata_pelajaran)
                      return (
                        <div key={j.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${col}`, borderRadius:10, padding:'10px 10px 8px' }}>
                          <div style={{ fontSize:12, fontWeight:800, color:'#fff', marginBottom:4, lineHeight:1.3 }}>{j.mata_pelajaran}</div>
                          <div style={{ fontSize:10, color:col, fontWeight:700, marginBottom:4 }}>{j.jam_mulai?.slice(0,5)}–{j.jam_selesai?.slice(0,5)}</div>
                          <div style={{ fontSize:10, color:C.sub }}>{j.kelas}{j.ruangan ? ` · ${j.ruangan}` : ''}</div>
                          <div style={{ display:'flex', gap:4, marginTop:8 }}>
                            <button onClick={()=>{ setEditData(j); setFormOpen(true) }} style={{ flex:1, background:'transparent', border:`1px solid ${C.border}`, borderRadius:6, padding:'4px', color:C.primary, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>✏️</button>
                            <button onClick={()=>handleDelete(j.id)} style={{ flex:1, background:'transparent', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, padding:'4px', color:'#f87171', cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>🗑️</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rekap row */}
        {!loading && hasData && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginTop:16, display:'flex', flexWrap:'wrap', gap:'6px 16px' }}>
            <span style={{ fontSize:11, color:C.sub, fontWeight:700 }}>Rekap:</span>
            {HARI.filter(h=>byHari[h].length>0).map(h=>(
              <span key={h} style={{ fontSize:11, color:C.text }}>
                <span style={{ color:C.primary, fontWeight:700 }}>{h}</span> {byHari[h].length} kls
              </span>
            ))}
            <span style={{ marginLeft:'auto', fontSize:11, color:C.primary, fontWeight:700 }}>{jadwalList.length} total jadwal</span>
          </div>
        )}
      </div>

      <JadwalFormModal open={formOpen} editData={editData} kelasList={kelasList} onClose={()=>setFormOpen(false)} onSaved={()=>{ showMsg('ok', editData?'Jadwal diperbarui!':'Jadwal ditambahkan!'); loadData() }} />
      <ImportModal open={importOpen} onClose={()=>setImportOpen(false)} kelasList={kelasList} onSaved={(ok,fail)=>{ showMsg(fail>0&&ok===0?'error':'ok', `${ok} jadwal disimpan${fail>0?`, ${fail} gagal`:''}.`); loadData() }} />
    </div>
  )
}
