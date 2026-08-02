/**
 * Eob5DetailSiswaScreen.jsx
 * Profil siswa, stats kehadiran + nilai + poin.
 * API: /api/eob5/siswa/:id/rekap
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}

function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s+'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) }
  catch { return s }
}

const STATUS_COLOR = { hadir:'#22c55e', sakit:'#f59e0b', izin:'#3b82f6', alpha:'#ef4444' }
const STATUS_BG = { hadir:'rgba(34,197,94,0.15)', sakit:'rgba(245,158,11,0.15)', izin:'rgba(59,130,246,0.15)', alpha:'rgba(239,68,68,0.15)' }
const NILAI_COLORS = { UH:'#f59e0b', UTS:'#3b82f6', UAS:'#8b5cf6', tugas:'#22c55e', praktik:'#f472b6' }

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value/max*100)) : 0
  return (
    <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden', margin:'4px 0' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width 0.4s' }} />
    </div>
  )
}

export default function Eob5DetailSiswaScreen({ navigate, goBack, siswaId }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('profil')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>
  )

  useEffect(()=>{
    if (!siswaId) { setError('ID siswa tidak tersedia'); setLoading(false); return }
    setLoading(true)
    fetch(`/api/eob5/siswa/${siswaId}/rekap`, { credentials:'include' })
      .then(r=>r.ok?r.json():r.json().then(d=>Promise.reject(d.error||'Error')))
      .then(d=>{ setData(d); setLoading(false) })
      .catch(e=>{ setError(typeof e==='string'?e:'Gagal memuat data siswa'); setLoading(false) })
  }, [siswaId])

  const siswa = data?.siswa || {}
  const absensiRekap = data?.absensi?.rekap || {}
  const absensiRiwayat = data?.absensi?.riwayat || []
  const nilaiList = data?.nilai || []
  const poinRiwayat = data?.poin?.riwayat || []
  const poinTotal = data?.poin?.total || 0

  const totalHadir = absensiRekap.hadir||0, totalSakit = absensiRekap.sakit||0
  const totalIzin = absensiRekap.izin||0, totalAlpha = absensiRekap.alpha||0
  const totalCatat = totalHadir+totalSakit+totalIzin+totalAlpha
  const pctHadir = totalCatat>0 ? Math.round((totalHadir/totalCatat)*100) : 0

  const nilaiRata = nilaiList.length > 0
    ? Math.round(nilaiList.reduce((s,n)=>s+(parseFloat(n.nilai)||0),0)/nilaiList.length*10)/10
    : null

  const TABS = [
    { key:'profil', label:'Profil' },
    { key:'absensi', label:`Absensi (${totalCatat})` },
    { key:'nilai', label:`Nilai (${nilaiList.length})` },
    { key:'poin', label:`Poin (${poinRiwayat.length})` },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>
            {loading ? 'Detail Siswa' : siswa.name || 'Detail Siswa'}
          </div>
        </div>
        {!loading && siswa.kelas && (
          <span style={{ background:C.dim, color:C.primary, borderRadius:8, padding:'4px 10px',
            fontSize:11, fontWeight:700 }}>{siswa.kelas}</span>
        )}
      </div>

      {loading && <div style={{ textAlign:'center', color:C.sub, padding:60, fontSize:13 }}>Memuat…</div>}
      {error && (
        <div style={{ margin:20, background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444',
          borderRadius:12, padding:'14px 16px', color:'#f87171', fontSize:13 }}>❌ {error}</div>
      )}

      {!loading && !error && (
        <div style={{ padding:'14px 14px 0' }}>

          {/* Summary Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
              padding:'10px 12px', borderLeft:`3px solid #22c55e` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Kehadiran</div>
              <div style={{ fontSize:22, fontWeight:900, color:'#22c55e' }}>{pctHadir}%</div>
              <div style={{ fontSize:10, color:C.sub }}>{totalHadir}/{totalCatat} hari</div>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
              padding:'10px 12px', borderLeft:`3px solid #3b82f6` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Rata Nilai</div>
              <div style={{ fontSize:22, fontWeight:900, color:'#3b82f6' }}>{nilaiRata ?? '—'}</div>
              <div style={{ fontSize:10, color:C.sub }}>{nilaiList.length} catatan</div>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
              padding:'10px 12px', borderLeft:`3px solid ${poinTotal>=0?'#f59e0b':'#ef4444'}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Poin</div>
              <div style={{ fontSize:22, fontWeight:900, color:poinTotal>=0?'#f59e0b':'#ef4444' }}>
                {poinTotal>0?'+':''}{poinTotal}
              </div>
              <div style={{ fontSize:10, color:C.sub }}>{poinRiwayat.length} catatan</div>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:2 }}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                flexShrink:0, background: tab===t.key ? C.dim : C.card,
                border:`1px solid ${tab===t.key ? C.primary : C.border}`,
                borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'inherit',
                fontSize:11, fontWeight:700, color: tab===t.key ? C.primary : C.sub,
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab: Profil */}
          {tab === 'profil' && (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:C.dim, color:C.primary,
                  display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, flexShrink:0 }}>
                  {(siswa.name||'?').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{siswa.name}</div>
                  <div style={{ fontSize:12, color:C.sub }}>{siswa.kelas} · {siswa.jenis_kelamin==='L'?'Laki-laki':'Perempuan'}</div>
                  {siswa.username && <div style={{ fontSize:11, color:C.primary, fontFamily:'monospace' }}>@{siswa.username}</div>}
                </div>
              </div>
              {[
                { label:'Email', value:siswa.email },
                { label:'WhatsApp', value:siswa.whatsapp },
              ].filter(r=>r.value).map(r=>(
                <div key={r.label} style={{ display:'flex', gap:12, padding:'8px 0',
                  borderTop:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:11, color:C.sub, fontWeight:700, minWidth:80 }}>{r.label}</div>
                  <div style={{ fontSize:12, color:C.text }}>{r.value}</div>
                </div>
              ))}
              {/* Absensi summary */}
              <div style={{ marginTop:14, padding:'12px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:8 }}>Ringkasan Kehadiran</div>
                <ProgressBar value={totalHadir} max={totalCatat} color="#22c55e" />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginTop:8 }}>
                  {[['Hadir',totalHadir,'#22c55e'],['Sakit',totalSakit,'#f59e0b'],['Izin',totalIzin,'#3b82f6'],['Alpha',totalAlpha,'#ef4444']].map(([l,v,c])=>(
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Absensi */}
          {tab === 'absensi' && (
            <div>
              {absensiRiwayat.length === 0 ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada catatan absensi.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {absensiRiwayat.map((a,i)=>(
                    <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
                      padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:11, fontWeight:700, background:STATUS_BG[a.status]||C.dim,
                        color:STATUS_COLOR[a.status]||C.primary, borderRadius:6, padding:'2px 8px', flexShrink:0 }}>
                        {a.status?.toUpperCase()}
                      </span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{fmtDate(a.tanggal)}</div>
                        {a.keterangan && <div style={{ fontSize:11, color:C.sub }}>{a.keterangan}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Nilai */}
          {tab === 'nilai' && (
            <div>
              {nilaiList.length === 0 ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada catatan nilai.</div>
              ) : (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'50px 60px 1fr 1fr', gap:4, padding:'8px 12px',
                    background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
                    <span>Nilai</span><span>Jenis</span><span>Mapel</span><span>Tanggal</span>
                  </div>
                  {nilaiList.map((n,i)=>(
                    <div key={n.id||i} style={{ display:'grid', gridTemplateColumns:'50px 60px 1fr 1fr', gap:4,
                      padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                      <span style={{ fontSize:16, fontWeight:900,
                        color: n.nilai>=80?'#22c55e':n.nilai>=65?'#f59e0b':'#ef4444' }}>{n.nilai}</span>
                      <span style={{ fontSize:10, fontWeight:700,
                        background:`${NILAI_COLORS[n.jenis]||C.border}25`,
                        color:NILAI_COLORS[n.jenis]||C.primary, borderRadius:5, padding:'2px 6px' }}>
                        {n.jenis}
                      </span>
                      <span style={{ fontSize:12, color:C.text }}>{n.mata_pelajaran||'—'}</span>
                      <span style={{ fontSize:11, color:C.sub }}>{fmtDate(n.tanggal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Poin */}
          {tab === 'poin' && (
            <div>
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px',
                marginBottom:12, display:'flex', gap:16, alignItems:'center' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:900, color:poinTotal>=0?'#f59e0b':'#ef4444' }}>
                    {poinTotal>0?'+':''}{poinTotal}
                  </div>
                  <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>Saldo Poin</div>
                </div>
                <div style={{ flex:1, display:'flex', gap:12, justifyContent:'flex-end' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#22c55e' }}>
                      +{poinRiwayat.filter(p=>p.jenis==='positif').reduce((s,p)=>s+p.poin,0)}
                    </div>
                    <div style={{ fontSize:9, color:C.sub, fontWeight:700 }}>Positif</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#ef4444' }}>
                      -{poinRiwayat.filter(p=>p.jenis==='negatif').reduce((s,p)=>s+p.poin,0)}
                    </div>
                    <div style={{ fontSize:9, color:C.sub, fontWeight:700 }}>Negatif</div>
                  </div>
                </div>
              </div>

              {poinRiwayat.length === 0 ? (
                <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Belum ada catatan poin.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {poinRiwayat.map((p,i)=>{
                    const isPos = p.jenis==='positif'
                    return (
                      <div key={p.id||i} style={{ background:C.white, border:`1px solid ${C.border}`,
                        borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ fontWeight:900, fontSize:18, color:isPos?'#22c55e':'#ef4444', minWidth:40, textAlign:'center' }}>
                          {isPos?'+':'-'}{p.poin}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{p.keterangan||'—'}</div>
                          <div style={{ fontSize:11, color:C.sub }}>{fmtDate(p.tanggal)}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700,
                          background:isPos?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',
                          color:isPos?'#4ade80':'#f87171', borderRadius:6, padding:'2px 7px' }}>
                          {isPos?'Positif':'Negatif'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
