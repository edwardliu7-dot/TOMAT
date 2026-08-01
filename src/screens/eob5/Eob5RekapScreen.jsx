import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box' }

export default function Eob5RekapScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('kelas')
  const [kelasList, setKelasList] = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [rekapKelas, setRekapKelas] = useState(null)
  const [rekapPeriode, setRekapPeriode] = useState([])
  const [loading, setLoading] = useState(false)
  const [siswaList, setSiswaList] = useState([])
  const [loadingSiswa, setLoadingSiswa] = useState(false)

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setKelasList(d) }).catch(()=>{})
  }, [])

  const loadRekapKelas = () => {
    if (!selectedKelas) return
    setLoading(true)
    fetch(`/api/eob5/rekap/kelas/${encodeURIComponent(selectedKelas)}`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setRekapKelas(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const loadRekapPeriode = () => {
    setLoading(true)
    fetch('/api/eob5/rekap/periode', { credentials:'include' })
      .then(r=>r.json()).then(d => { setRekapPeriode(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const loadSiswa = () => {
    if (!selectedKelas) return
    setLoadingSiswa(true)
    fetch(`/api/eob5/kelas/${encodeURIComponent(selectedKelas)}/siswa`, { credentials:'include' })
      .then(r=>r.json()).then(d => { setSiswaList(d.siswa||[]); setLoadingSiswa(false) })
      .catch(() => setLoadingSiswa(false))
  }

  useEffect(() => {
    if (tab === 'kelas' && selectedKelas) loadRekapKelas()
    if (tab === 'kelas' && selectedKelas) loadSiswa()
    if (tab === 'periode') loadRekapPeriode()
    if (tab === 'siswa' && selectedKelas) loadSiswa()
  }, [tab, selectedKelas])

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div><div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5</div><div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Rekap</div></div>
      </div>

      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:'rgba(0,0,0,0.2)' }}>
        {[['kelas','Per Kelas'],['siswa','Per Siswa'],['periode','Per Periode']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'12px 6px', background:'none', border:'none', borderBottom:tab===k?`2px solid ${C.primary}`:'2px solid transparent', color:tab===k?C.primary:C.sub, fontWeight:tab===k?700:500, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:16 }}>
        {/* Kelas picker (shared) */}
        {(tab==='kelas'||tab==='siswa') && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:5 }}>PILIH KELAS</div>
            <select value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)} style={{ ...inputSt }}>
              <option value="">— Pilih Kelas —</option>
              {kelasList.map(k=><option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
            </select>
          </div>
        )}

        {/* TAB: Per Kelas */}
        {tab==='kelas' && (
          <>
            {!selectedKelas && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Pilih kelas untuk melihat rekap.</div>}
            {loading && selectedKelas && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat rekap…</div>}

            {!loading && rekapKelas && (
              <>
                {/* Absensi summary */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:C.primary, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>REKAP KEHADIRAN</div>
                  {rekapKelas.absensi.length === 0 && <div style={{ color:C.sub, fontSize:13, padding:'12px 0' }}>Belum ada data absensi.</div>}
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      {rekapKelas.absensi.length > 0 && (
                        <thead><tr style={{ background:'rgba(245,158,11,0.08)' }}>
                          {['Nama','H','S','I','A','%'].map(h=><th key={h} style={{ padding:'8px 6px', textAlign:h==='Nama'?'left':'center', color:C.primary, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}
                        </tr></thead>
                      )}
                      <tbody>
                        {rekapKelas.absensi.map((r,i) => {
                          const total = parseInt(r.total_pertemuan)||0
                          const hadir = parseInt(r.hadir)||0
                          const pct = total>0?Math.round((hadir/total)*100):0
                          return (
                            <tr key={r.student_id} style={{ borderBottom:'1px solid rgba(245,158,11,0.06)', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding:'7px 6px', color:'#fff', fontSize:12 }}>{r.nama_siswa}</td>
                              <td style={{ padding:'7px 6px', textAlign:'center', color:'#4ade80' }}>{hadir}</td>
                              <td style={{ padding:'7px 6px', textAlign:'center', color:'#fbbf24' }}>{r.sakit||0}</td>
                              <td style={{ padding:'7px 6px', textAlign:'center', color:'#60a5fa' }}>{r.izin||0}</td>
                              <td style={{ padding:'7px 6px', textAlign:'center', color:'#f87171' }}>{r.alpha||0}</td>
                              <td style={{ padding:'7px 6px', textAlign:'center', fontWeight:700, color:pct>=80?'#4ade80':pct>=60?'#fbbf24':'#f87171' }}>{pct}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Nilai summary */}
                <div>
                  <div style={{ fontSize:11, color:C.primary, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>REKAP NILAI</div>
                  {rekapKelas.nilai.length === 0 && <div style={{ color:C.sub, fontSize:13, padding:'12px 0' }}>Belum ada data nilai.</div>}
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      {rekapKelas.nilai.length > 0 && (
                        <thead><tr style={{ background:'rgba(245,158,11,0.08)' }}>
                          {['Nama','Mapel','Jenis','Rata-rata'].map(h=><th key={h} style={{ padding:'8px 6px', textAlign:'left', color:C.primary, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}
                        </tr></thead>
                      )}
                      <tbody>
                        {rekapKelas.nilai.map((r,i) => {
                          const avg = parseFloat(r.rata_rata)||0
                          return (
                            <tr key={i} style={{ borderBottom:'1px solid rgba(245,158,11,0.06)', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding:'7px 6px', color:'#fff' }}>{r.nama_siswa}</td>
                              <td style={{ padding:'7px 6px', color:C.sub }}>{r.mata_pelajaran}</td>
                              <td style={{ padding:'7px 6px', color:C.text }}>{r.jenis_nilai}</td>
                              <td style={{ padding:'7px 6px', fontWeight:700, color:avg>=75?'#4ade80':avg>=60?'#fbbf24':'#f87171' }}>{avg.toFixed(1)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* TAB: Per Siswa */}
        {tab==='siswa' && (
          <>
            {!selectedKelas && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Pilih kelas untuk melihat daftar siswa.</div>}
            {loadingSiswa && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat siswa…</div>}
            {!loadingSiswa && siswaList.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {siswaList.map((s,i) => (
                  <button key={s.id} onClick={() => window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail:{ id:s.id } }))}
                    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}
                  >
                    <div style={{ width:36, height:36, borderRadius:'50%', background:C.dim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:C.primary, flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#fff', fontSize:13 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:C.sub }}>{s.username}</div>
                    </div>
                    <span style={{ color:C.primary, fontSize:14 }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB: Per Periode */}
        {tab==='periode' && (
          <>
            {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat rekap periode…</div>}
            {!loading && rekapPeriode.length===0 && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada data nilai per periode.</div>}
            {!loading && rekapPeriode.length>0 && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead><tr style={{ background:'rgba(245,158,11,0.1)' }}>
                    {['Mapel','Kelas','Sem','TA','Siswa','Nilai Avg'].map(h=><th key={h} style={{ padding:'9px 6px', textAlign:'left', color:C.primary, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {rekapPeriode.map((r,i) => {
                      const avg = parseFloat(r.rata_rata_kelas)||0
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(245,158,11,0.07)', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding:'8px 6px', color:'#fff', fontWeight:600 }}>{r.mata_pelajaran}</td>
                          <td style={{ padding:'8px 6px', color:C.sub, fontSize:11 }}>{r.kelas||'—'}</td>
                          <td style={{ padding:'8px 6px', color:C.text }}>{r.semester||'—'}</td>
                          <td style={{ padding:'8px 6px', color:C.sub, fontSize:11 }}>{r.tahun_ajaran||'—'}</td>
                          <td style={{ padding:'8px 6px', color:C.text }}>{r.jumlah_siswa}</td>
                          <td style={{ padding:'8px 6px', fontWeight:700, color:avg>=75?'#4ade80':avg>=60?'#fbbf24':'#f87171' }}>{avg.toFixed(1)}</td>
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
