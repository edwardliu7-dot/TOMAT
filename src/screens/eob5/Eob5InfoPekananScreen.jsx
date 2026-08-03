/**
 * Eob5InfoPekananScreen.jsx
 * Ringkasan per pekan: jadwal tercatat, absensi, jurnal, prosem coverage.
 * Preview teks WhatsApp + salin / bagikan.
 * API: /api/eob5/academic-calendars, /api/eob5/academic-weeks, /api/eob5/info-pekanan
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}
const inp = { background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box', outline:'none' }

function toDateStr(s) {
  if (!s) return ''
  return String(s).slice(0, 10)
}
function fmtDate(s) {
  if (!s) return '—'
  try {
    const d = toDateStr(s)
    const dt = new Date(d + 'T00:00:00')
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
  }
  catch { return toDateStr(s) || String(s) }
}
function fmtShort(s) {
  if (!s) return '—'
  try {
    const d = toDateStr(s)
    const dt = new Date(d + 'T00:00:00')
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('id-ID', { day:'numeric', month:'short' })
  }
  catch { return toDateStr(s) || String(s) }
}

function Label({ children }) {
  return <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{children}</div>
}

function StatCard({ emoji, label, value, color, sub }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:12, padding:'12px 14px' }}>
      <div style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{emoji} {label}</div>
      <div style={{ fontSize:24, fontWeight:900, color, lineHeight:1, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:C.sub }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  return (
    <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width 0.4s ease' }} />
    </div>
  )
}

function StatusDot({ status }) {
  const MAP = {
    selesai: { color:'#4ade80', label:'Selesai' },
    berlangsung: { color:'#60a5fa', label:'Berlangsung' },
    belum: { color:'#fbbf24', label:'Belum' },
    libur: { color:'#94a3b8', label:'Libur' },
    ujian: { color:'#a78bfa', label:'Ujian' },
  }
  const s = MAP[status] || { color:C.sub, label: status || '—' }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }} />
      <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.label}</span>
    </div>
  )
}

export default function Eob5InfoPekananScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [calendars, setCalendars] = useState([])
  const [weeks, setWeeks] = useState([])
  const [selCalId, setSelCalId] = useState('')
  const [selWeekId, setSelWeekId] = useState('')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copyDone, setCopyDone] = useState(false)

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  // Load calendars
  useEffect(()=>{
    fetch('/api/eob5/academic-calendars', { credentials:'include' }).then(r=>r.ok?r.json():[]).then(d=>{
      const arr = Array.isArray(d) ? d : []
      setCalendars(arr)
      if (arr.length) setSelCalId(arr[0].id)
    }).catch(()=>{})
  }, [])

  // Load weeks when calendar changes
  useEffect(()=>{
    if (!selCalId) { setWeeks([]); setSelWeekId(''); return }
    fetch(`/api/eob5/academic-weeks?calendar_id=${selCalId}`, { credentials:'include' }).then(r=>r.ok?r.json():[]).then(d=>{
      const sorted = Array.isArray(d) ? [...d].sort((a,b)=>a.pekan_ke-b.pekan_ke) : []
      setWeeks(sorted)

      // Auto-select current week
      const today = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Jakarta' }).format(new Date())
      const current = sorted.find(w=>w.tanggal_mulai <= today && today <= w.tanggal_selesai)
      setSelWeekId(current?.id || sorted[0]?.id || '')
    }).catch(()=>{})
  }, [selCalId])

  // Load info pekanan when week changes
  useEffect(()=>{
    if (!selCalId || !selWeekId) { setInfo(null); return }
    setLoading(true)
    fetch(`/api/eob5/info-pekanan?calendar_id=${selCalId}&week_id=${selWeekId}`, { credentials:'include' })
      .then(r=>r.ok?r.json():null).then(d=>{ setInfo(d); setLoading(false) })
      .catch(()=>{ setInfo(null); setLoading(false) })
  }, [selCalId, selWeekId])

  const selWeek = weeks.find(w=>w.id===selWeekId)
  const selCal = calendars.find(c=>c.id===selCalId)

  // Build WhatsApp text
  const waText = useMemo(()=>{
    if (!info || !selWeek) return ''
    const lines = [
      `📅 *INFO PEKANAN — Pekan ${info.pekan_ke || selWeek.pekan_ke}*`,
      `📆 ${fmtDate(info.tanggal_mulai || selWeek.tanggal_mulai)} – ${fmtDate(info.tanggal_selesai || selWeek.tanggal_selesai)}`,
      '',
    ]

    if (info.jadwal_entries?.length) {
      lines.push('*📖 Jadwal Minggu Ini:*')
      const byHari = {}
      for (const j of info.jadwal_entries) {
        if (!byHari[j.hari]) byHari[j.hari] = []
        byHari[j.hari].push(j)
      }
      for (const hari of ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']) {
        if (byHari[hari]) {
          byHari[hari].forEach(j => {
            lines.push(`• ${hari} ${j.jam_mulai?.slice(0,5)}–${j.jam_selesai?.slice(0,5)} — ${j.mata_pelajaran} (${j.kelas})`)
          })
        }
      }
      lines.push('')
    }

    if (info.subjects?.length) {
      lines.push('*📝 Rekap Per Mata Pelajaran:*')
      for (const s of info.subjects) {
        const jurnalCheck = s.jurnal_count > 0 ? '✅' : '⬜'
        const absensiCheck = s.absensi_count > 0 ? '✅' : '⬜'
        lines.push(`• ${s.mata_pelajaran} (${s.kelas})`)
        lines.push(`  Jurnal ${jurnalCheck} · Absensi ${absensiCheck} · Prosem: ${s.prosem_materi || '—'}`)
      }
      lines.push('')
    }

    if (info.catatan) lines.push(`📌 _${info.catatan}_`)

    lines.push('_Dibuat via SMARTISA GURU_')
    return lines.join('\n')
  }, [info, selWeek])

  const handleCopy = () => {
    navigator.clipboard.writeText(waText).then(()=>{ setCopyDone(true); setTimeout(()=>setCopyDone(false), 2000) }).catch(()=>{})
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title:'Info Pekanan GURU', text: waText }).catch(()=>{})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank')
    }
  }

  // Compute summary stats from info
  const totalMapel = info?.subjects?.length || 0
  const hasJurnal = info?.subjects?.filter(s=>s.jurnal_count>0).length || 0
  const hasAbsensi = info?.subjects?.filter(s=>s.absensi_count>0).length || 0
  const hasProsem = info?.subjects?.filter(s=>s.prosem_materi).length || 0

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Info Pekanan</div>
        </div>
      </div>

      <div style={{ padding:'16px 14px 0' }}>

        {/* Selectors */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
          <div>
            <Label>Kalender Akademik</Label>
            {calendars.length === 0
              ? <div style={{ color:C.sub, fontSize:12, padding:'8px 0' }}>Belum ada kalender. Buat di menu Kalender terlebih dahulu.</div>
              : <select value={selCalId} onChange={e=>setSelCalId(e.target.value)} style={inp}>
                  {calendars.map(c=><option key={c.id} value={c.id}>{c.nama || `${c.tahun_ajaran} — Smt ${c.semester}`}</option>)}
                </select>
            }
          </div>
          {weeks.length > 0 && (
            <div>
              <Label>Pekan</Label>
              <select value={selWeekId} onChange={e=>setSelWeekId(e.target.value)} style={inp}>
                {weeks.map(w => (
                  <option key={w.id} value={w.id}>
                    Pekan {w.pekan_ke} — {fmtShort(w.tanggal_mulai)} s.d. {fmtShort(w.tanggal_selesai)} ({w.jenis})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Week navigator arrows */}
        {weeks.length > 1 && selWeekId && (
          <div style={{ display:'flex', gap:6, marginBottom:16, alignItems:'center' }}>
            <button
              onClick={()=>{ const i=weeks.findIndex(w=>w.id===selWeekId); if(i>0) setSelWeekId(weeks[i-1].id) }}
              disabled={weeks.findIndex(w=>w.id===selWeekId)===0}
              style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 13px', color:C.primary, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', opacity: weeks.findIndex(w=>w.id===selWeekId)===0 ? 0.3 : 1 }}>
              ←
            </button>
            <div style={{ flex:1, textAlign:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
              Pekan {selWeek?.pekan_ke} / {weeks.length}
            </div>
            <button
              onClick={()=>{ const i=weeks.findIndex(w=>w.id===selWeekId); if(i<weeks.length-1) setSelWeekId(weeks[i+1].id) }}
              disabled={weeks.findIndex(w=>w.id===selWeekId)===weeks.length-1}
              style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 13px', color:C.primary, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', opacity: weeks.findIndex(w=>w.id===selWeekId)===weeks.length-1 ? 0.3 : 1 }}>
              →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat info pekanan…</div>}

        {/* No calendar */}
        {!loading && calendars.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📆</div>
            <div style={{ fontWeight:700, color:'#fff', marginBottom:6 }}>Belum ada kalender akademik</div>
            <div style={{ color:C.sub, fontSize:13, marginBottom:20 }}>Buat kalender di menu Kalender untuk menggunakan fitur ini</div>
            <button onClick={()=>navigate('eob5-kalender')} style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'10px 20px', color:'#1a0a00', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>🗓️ Buka Kalender</button>
          </div>
        )}

        {!loading && selWeek && (
          <>
            {/* Week header card */}
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:900, color:'#fff' }}>Pekan {info?.pekan_ke || selWeek.pekan_ke}</div>
                  <div style={{ fontSize:12, color:C.sub }}>{fmtDate(info?.tanggal_mulai||selWeek.tanggal_mulai)} – {fmtDate(info?.tanggal_selesai||selWeek.tanggal_selesai)}</div>
                </div>
                <StatusDot status={info?.status || selWeek.jenis} />
              </div>
              {(info?.keterangan||selWeek.keterangan) && (
                <div style={{ fontSize:11, color:C.sub, fontStyle:'italic' }}>{info?.keterangan||selWeek.keterangan}</div>
              )}
            </div>

            {/* Stats row */}
            {totalMapel > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                <StatCard emoji="📝" label="Jurnal" value={`${hasJurnal}/${totalMapel}`} color="#22c55e" />
                <StatCard emoji="🙋" label="Absensi" value={`${hasAbsensi}/${totalMapel}`} color="#3b82f6" />
                <StatCard emoji="📋" label="Prosem" value={`${hasProsem}/${totalMapel}`} color="#8b5cf6" />
              </div>
            )}

            {/* Subjects detail */}
            {info?.subjects?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <Label>Detail Per Mata Pelajaran</Label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {info.subjects.map((s, i) => {
                    const jurnalOk = s.jurnal_count > 0
                    const absensiOk = s.absensi_count > 0
                    const prosemOk = !!s.prosem_materi
                    const score = [jurnalOk, absensiOk, prosemOk].filter(Boolean).length
                    const scoreColor = score === 3 ? '#22c55e' : score >= 1 ? '#f59e0b' : '#ef4444'
                    return (
                      <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{s.mata_pelajaran}</div>
                            <div style={{ fontSize:10, color:C.sub }}>{s.kelas}</div>
                          </div>
                          <div style={{ background:`rgba(${score===3?'34,197,94':score>=1?'245,158,11':'239,68,68'},0.15)`, color:scoreColor, borderRadius:8, padding:'3px 9px', fontSize:11, fontWeight:700 }}>
                            {score}/3
                          </div>
                        </div>

                        {/* Checks */}
                        <div style={{ display:'flex', gap:8, marginBottom: s.prosem_materi ? 8 : 0, flexWrap:'wrap' }}>
                          {[
                            { ok: jurnalOk, label: jurnalOk ? `Jurnal (${s.jurnal_count})` : 'Belum jurnal' },
                            { ok: absensiOk, label: absensiOk ? `Absensi (${s.absensi_count})` : 'Belum absensi' },
                            { ok: prosemOk, label: prosemOk ? 'Prosem ada' : 'Belum prosem' },
                          ].map(({ ok, label }, j) => (
                            <span key={j} style={{ fontSize:10, fontWeight:700, background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: ok ? '#4ade80' : '#f87171', borderRadius:6, padding:'2px 8px' }}>
                              {ok ? '✓' : '✗'} {label}
                            </span>
                          ))}
                        </div>

                        {s.prosem_materi && (
                          <div style={{ fontSize:11, color:'#c4b5fd', background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8, padding:'6px 10px', lineHeight:1.4 }}>
                            <span style={{ color:C.sub, fontWeight:700 }}>Materi: </span>{s.prosem_materi}
                          </div>
                        )}

                        {s.absensi_entries?.length > 0 && (
                          <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                            {s.absensi_entries.map((a, ai) => (
                              <span key={ai} style={{ fontSize:10, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'2px 8px', color:C.text }}>
                                {a.nama_siswa}: {a.status}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!info?.subjects?.length && (
              <div style={{ textAlign:'center', padding:'32px 20px', background:C.card, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:16 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                <div style={{ color:C.sub, fontSize:13 }}>
                  {['pts','pas','libur'].includes(selWeek.jenis?.toLowerCase())
                    ? `Pekan ${selWeek.jenis} — tidak ada jadwal KBM.`
                    : 'Belum ada data jadwal untuk pekan ini.'
                  }
                </div>
              </div>
            )}

            {/* WhatsApp section */}
            {waText && (
              <div style={{ marginBottom:16 }}>
                <Label>Preview WhatsApp</Label>
                <div style={{ background:'rgba(37,211,102,0.07)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:14, overflow:'hidden' }}>
                  {/* WA preview text */}
                  <div style={{ padding:'12px 14px', maxHeight:200, overflowY:'auto' }}>
                    <pre style={{ margin:0, fontFamily:'inherit', fontSize:12, color:C.text, whiteSpace:'pre-wrap', lineHeight:1.6 }}>{waText}</pre>
                  </div>
                  {/* Actions */}
                  <div style={{ display:'flex', gap:0, borderTop:'1px solid rgba(37,211,102,0.25)' }}>
                    <button onClick={handleCopy} style={{ flex:1, background:'none', border:'none', padding:'12px', color: copyDone ? '#4ade80' : '#25d366', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      {copyDone ? '✅ Disalin!' : '📋 Salin Teks'}
                    </button>
                    <div style={{ width:1, background:'rgba(37,211,102,0.25)' }} />
                    <button onClick={handleShare} style={{ flex:1, background:'none', border:'none', padding:'12px', color:'#25d366', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      📲 Bagikan WA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
