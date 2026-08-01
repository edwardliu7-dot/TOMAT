import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}

const JENIS_OPTIONS = ['UH', 'UTS', 'UAS', 'tugas', 'praktik']
const JENIS_COLORS = { UH:'#f59e0b', UTS:'#3b82f6', UAS:'#8b5cf6', tugas:'#22c55e', praktik:'#f472b6' }

const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

export default function Eob5NilaiScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('input')
  const [kelasList, setKelasList] = useState([])
  const [kelas, setKelas] = useState('')
  const [mapel, setMapel] = useState('')
  const [jenis, setJenis] = useState('UH')
  const [semester, setSemester] = useState('1')
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026')
  const [siswaList, setSiswaList] = useState([])
  const [nilaiMap, setNilaiMap] = useState({})  // { studentId: nilai }
  const [loadingSiswa, setLoadingSiswa] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  // Rekap
  const [rekapData, setRekapData] = useState([])
  const [rekapKelas, setRekapKelas] = useState('')
  const [loadingRekap, setLoadingRekap] = useState(false)

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.json()).then(d => { if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!kelas) { setSiswaList([]); return }
    setLoadingSiswa(true)
    fetch(`/api/eob5/kelas/${encodeURIComponent(kelas)}/siswa`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setSiswaList(d.siswa||[]); setNilaiMap({}); setLoadingSiswa(false) })
      .catch(() => setLoadingSiswa(false))
  }, [kelas])

  const loadRekap = () => {
    setLoadingRekap(true)
    const p = rekapKelas ? `?kelas=${encodeURIComponent(rekapKelas)}` : ''
    fetch(`/api/eob5/nilai/rekap${p}`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setRekapData(Array.isArray(d)?d:[]); setLoadingRekap(false) })
      .catch(() => setLoadingRekap(false))
  }

  useEffect(() => { if(tab==='rekap') loadRekap() }, [tab])

  const handleSimpan = async () => {
    const entries = Object.entries(nilaiMap).filter(([,v]) => v !== '' && v !== undefined)
    if (!kelas || !mapel || entries.length === 0) { setMsg({type:'error',text:'Pilih kelas, mata pelajaran, dan isi minimal satu nilai'}); return }
    setSaving(true); setMsg({type:'',text:''})
    let ok=0, fail=0
    for (const [student_id, nilai] of entries) {
      try {
        const r = await fetch('/api/eob5/nilai', {
          method:'POST', credentials:'include',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ student_id, mata_pelajaran:mapel, jenis_nilai:jenis, nilai:parseFloat(nilai), semester, tahun_ajaran:tahunAjaran }),
        })
        if(r.ok) ok++; else fail++
      } catch { fail++ }
    }
    setSaving(false)
    setMsg({ type: fail>0?'error':'ok', text: fail>0 ? `${ok} berhasil, ${fail} gagal disimpan` : `✅ ${ok} nilai berhasil disimpan!` })
    setTimeout(() => setMsg({type:'',text:''}), 4000)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div><div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div><div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Nilai Akademik</div></div>
      </div>

      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:'rgba(0,0,0,0.2)' }}>
        {[['input','Input Nilai'],['rekap','Rekap Nilai']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'13px', background:'none', border:'none', borderBottom: tab===k?`2px solid ${C.primary}`:'2px solid transparent', color:tab===k?C.primary:C.sub, fontWeight:tab===k?700:500, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:16 }}>
        {tab==='input' && (
          <>
            {/* Filter row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>KELAS</div>
                <select value={kelas} onChange={e=>setKelas(e.target.value)} style={{ ...inputSt }}>
                  <option value="">— Pilih —</option>
                  {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>JENIS</div>
                <select value={jenis} onChange={e=>setJenis(e.target.value)} style={{ ...inputSt }}>
                  {JENIS_OPTIONS.map(j=><option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>MATA PELAJARAN</div>
                <input value={mapel} onChange={e=>setMapel(e.target.value)} placeholder="Mis: Matematika" style={{ ...inputSt }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>SEMESTER</div>
                <select value={semester} onChange={e=>setSemester(e.target.value)} style={{ ...inputSt }}>
                  <option value="1">1</option><option value="2">2</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:4 }}>TAHUN AJARAN</div>
                <input value={tahunAjaran} onChange={e=>setTahunAjaran(e.target.value)} style={{ ...inputSt }} />
              </div>
            </div>

            {loadingSiswa && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat siswa…</div>}
            {!loadingSiswa && !kelas && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Pilih kelas untuk mulai input nilai.</div>}

            {!loadingSiswa && siswaList.length > 0 && (
              <>
                <div style={{ fontSize:11, color:C.sub, marginBottom:10 }}>{siswaList.length} siswa · {kelas}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                  {siswaList.map((s,i) => (
                    <div key={s.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:C.dim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.primary, flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1, fontSize:13, color:'#fff', fontWeight:500 }}>{s.name}</div>
                      <input
                        type="number" min="0" max="100" placeholder="0–100"
                        value={nilaiMap[s.id] ?? ''}
                        onChange={e => setNilaiMap(m => ({ ...m, [s.id]: e.target.value }))}
                        style={{ width:80, background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:700, textAlign:'center' }}
                      />
                    </div>
                  ))}
                </div>

                {msg.text && (
                  <div style={{ background: msg.type==='ok'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${msg.type==='ok'?'#22c55e':'#ef4444'}`, borderRadius:10, padding:'10px 14px', color: msg.type==='ok'?'#4ade80':'#f87171', fontSize:13, marginBottom:12 }}>{msg.text}</div>
                )}
                <button onClick={handleSimpan} disabled={saving} style={{ width:'100%', background:saving?C.dim:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:14, padding:'14px', color:'#1a0a00', fontSize:15, fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit' }}>
                  {saving ? 'Menyimpan…' : '💾 Simpan Semua Nilai'}
                </button>
              </>
            )}
          </>
        )}

        {tab==='rekap' && (
          <>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <select value={rekapKelas} onChange={e=>setRekapKelas(e.target.value)} style={{ flex:1, ...inputSt }}>
                <option value="">Semua Kelas</option>
                {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
              </select>
              <button onClick={loadRekap} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 16px', color:C.primary, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>🔍 Muat</button>
            </div>

            {loadingRekap && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat rekap…</div>}
            {!loadingRekap && rekapData.length===0 && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada data nilai.</div>}

            {!loadingRekap && rekapData.length>0 && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:'rgba(245,158,11,0.1)' }}>
                      {['Nama','Kelas','Mapel','Jenis','Rata-rata','Jumlah'].map(h=>(
                        <th key={h} style={{ padding:'9px 8px', textAlign:'left', color:C.primary, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.map((r,i) => {
                      const avg = parseFloat(r.rata_rata)||0
                      return (
                        <tr key={i} style={{ borderBottom:`1px solid rgba(245,158,11,0.08)`, background: i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding:'8px',color:'#fff' }}>{r.nama_siswa}</td>
                          <td style={{ padding:'8px',color:C.sub,fontSize:11 }}>{r.kelas}</td>
                          <td style={{ padding:'8px',color:C.text }}>{r.mata_pelajaran}</td>
                          <td style={{ padding:'8px' }}>
                            <span style={{ background:`${JENIS_COLORS[r.jenis_nilai]||C.primary}22`, color:JENIS_COLORS[r.jenis_nilai]||C.primary, borderRadius:5, padding:'2px 6px', fontSize:10, fontWeight:700 }}>{r.jenis_nilai}</span>
                          </td>
                          <td style={{ padding:'8px', fontWeight:700, color: avg>=75?'#4ade80':avg>=60?'#fbbf24':'#f87171' }}>{avg.toFixed(1)}</td>
                          <td style={{ padding:'8px',color:C.sub }}>{r.jumlah_nilai}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
