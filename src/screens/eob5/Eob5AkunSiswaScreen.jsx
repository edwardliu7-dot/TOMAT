/**
 * Eob5AkunSiswaScreen.jsx
 * Generate/reset akun login siswa per kelas (wali kelas only).
 * API: /api/eob5/student-accounts, /api/eob5/student-accounts/:id/generate,
 *      /api/eob5/student-accounts/generate-all, /api/eob5/kelas/list
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)', overlay: 'rgba(0,0,0,0.75)',
}

const AVATAR_COLORS = ['#3b82f6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#14b8a6','#f97316','#06b6d4']
function avatarBg(idx) {
  const c = AVATAR_COLORS[idx % AVATAR_COLORS.length]
  return { width:34, height:34, borderRadius:'50%', background:`${c}25`, color:c,
    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, flexShrink:0 }
}
function initials(name) {
  return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?'
}

function Toast({ msg }) {
  if (!msg.text) return null
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:400,
      background:msg.type==='ok'?'rgba(34,197,94,0.95)':'rgba(239,68,68,0.95)',
      color:'#fff', borderRadius:12, padding:'10px 22px', fontSize:13, fontWeight:700,
      boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:340, textAlign:'center' }}>
      {msg.text}
    </div>
  )
}

function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:C.overlay, zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'0 20px' }}>
      <div style={{ background:'#1f1300', border:`1px solid ${C.border}`, borderRadius:18,
        width:'100%', maxWidth:440, padding:'22px 20px' }}>
        <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:10 }}>{title}</div>
        <div style={{ fontSize:13, color:C.text, lineHeight:1.6, marginBottom:20 }}>{body}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onCancel} style={{ flex:'0 0 auto', background:'none',
            border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 16px',
            color:C.sub, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
          <button onClick={onConfirm} style={{ flex:1,
            background: danger ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#f59e0b,#d97706)',
            border:'none', borderRadius:10, padding:'11px', fontWeight:800, fontSize:14,
            color: danger ? '#fff' : '#1a0a00', cursor:'pointer', fontFamily:'inherit' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Eob5AkunSiswaScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [accounts, setAccounts] = useState({}) // studentId → { username, password }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [kelasList, setKelasList] = useState([])
  const [generatingId, setGeneratingId] = useState(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [confirm, setConfirm] = useState({ open:false })
  const [pendingAction, setPendingAction] = useState(null)
  const [msg, setMsg] = useState({ type:'', text:'' })
  const [showPassword, setShowPassword] = useState({})

  if (user?.role !== 'guru') return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>
  )

  function showMsg(type, text) { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}),4000) }

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/eob5/student-accounts', { credentials:'include' }).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/api/eob5/kelas/list', { credentials:'include' }).then(r=>r.ok?r.json():[]).catch(()=>[]),
    ]).then(([accs, kelas]) => {
      const arr = Array.isArray(accs) ? accs : []
      setData(arr)
      // Pre-populate known accounts
      const map = {}
      for (const s of arr) {
        if (s.hasAccount && s.username) map[s.studentId] = { username:s.username, password:s.password||'' }
      }
      setAccounts(prev=>({ ...map, ...prev }))
      setKelasList(Array.isArray(kelas) ? kelas.map(k=>k.kelas||k) : [])
      setLoading(false)
    }).catch(()=>{ setLoading(false); setError('Gagal memuat data') })
  }

  useEffect(()=>{ loadData() }, [])

  const filtered = useMemo(()=>
    kelasFilter ? data.filter(s=>s.kelas===kelasFilter) : data,
  [data, kelasFilter])

  const totalAkun = data.filter(s=>s.hasAccount||accounts[s.studentId]).length
  const totalBelum = data.length - totalAkun

  const handleGenerate = async (studentId, regenerate=false) => {
    setGeneratingId(studentId)
    try {
      const r = await fetch(`/api/eob5/student-accounts/${studentId}/generate`, {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({ regenerate })
      })
      if (r.ok) {
        const acc = await r.json()
        setAccounts(prev=>({ ...prev, [studentId]:{ username:acc.username, password:acc.password } }))
        setData(prev=>prev.map(s=>s.studentId===studentId?{...s,hasAccount:true,username:acc.username}:s))
        showMsg('ok', regenerate?'Akun berhasil diperbaharui.':'Akun berhasil dibuat.')
      } else { const d=await r.json(); showMsg('err',d.error||'Gagal generate akun') }
    } catch { showMsg('err','Gagal terhubung ke server') }
    setGeneratingId(null)
  }

  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    try {
      const r = await fetch('/api/eob5/student-accounts/generate-all', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({})
      })
      if (r.ok) {
        const result = await r.json()
        const map = {}
        for (const a of (result.accounts||[])) map[a.studentId]={ username:a.username, password:a.password }
        setAccounts(prev=>({ ...prev, ...map }))
        loadData()
        showMsg('ok', result.alreadyExisted>0
          ? `${result.generated} akun baru dibuat, ${result.alreadyExisted} diperbarui.`
          : `${result.generated} akun baru dibuat.`)
      } else { const d=await r.json(); showMsg('err',d.error||'Gagal generate akun') }
    } catch { showMsg('err','Gagal terhubung ke server') }
    setGeneratingAll(false)
  }

  const openConfirm = (action) => {
    setPendingAction(action)
    const isRegen = action.regenerate && !action.isAll
    const isAll = action.isAll
    setConfirm({
      open: true,
      title: isAll ? 'Generate Semua Akun Siswa?' : isRegen ? 'Ganti Username & Password?' : 'Buat Akun Baru?',
      body: isAll
        ? `Akun baru akan dibuat untuk semua siswa yang belum punya akun. Siswa yang sudah punya akun akan diperbarui.`
        : isRegen
          ? `Username dan password lama untuk ${action.name} akan diganti. Siswa harus login dengan akun baru.`
          : `Akun baru akan dibuat untuk ${action.name}.`,
      confirmLabel: isAll ? '🔑 Generate Semua' : isRegen ? '♻️ Ganti Akun' : '🔑 Buat Akun',
      danger: isRegen,
    })
  }

  const handleConfirmAction = async () => {
    setConfirm({ open:false })
    if (!pendingAction) return
    if (pendingAction.isAll) await handleGenerateAll()
    else await handleGenerate(pendingAction.studentId, pendingAction.regenerate||false)
    setPendingAction(null)
  }

  const togglePassword = (id) => setShowPassword(p=>({ ...p, [id]:!p[id] }))

  if (!loading && !error && data.length === 0 && !user?.waliKelasKelas) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text }}>
        <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
          display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Akun Siswa</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 24px', gap:12 }}>
          <div style={{ fontSize:40 }}>⚠️</div>
          <div style={{ fontWeight:700, color:'#fff', textAlign:'center' }}>Fitur Wali Kelas</div>
          <div style={{ fontSize:13, color:C.sub, textAlign:'center', maxWidth:300, lineHeight:1.6 }}>
            Fitur ini hanya tersedia untuk guru yang menjadi Wali Kelas.
            Hubungi admin untuk mengatur jabatan Wali Kelas Anda.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <Toast msg={msg} />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        body={confirm.body}
        confirmLabel={confirm.confirmLabel}
        danger={confirm.danger}
        onConfirm={handleConfirmAction}
        onCancel={()=>{ setConfirm({open:false}); setPendingAction(null) }}
      />

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>Akun Siswa</div>
        </div>
        <button onClick={()=>openConfirm({ isAll:true })} disabled={generatingAll}
          style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none',
            borderRadius:10, padding:'8px 13px', color:'#1a0a00', fontWeight:800, fontSize:11,
            cursor:generatingAll?'not-allowed':'pointer', fontFamily:'inherit', opacity:generatingAll?0.6:1 }}>
          {generatingAll ? '⏳…' : '🔑 Generate Semua'}
        </button>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* Info Banner */}
        <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)',
          borderRadius:12, padding:'12px 14px', marginBottom:14, display:'flex', gap:10 }}>
          <span style={{ fontSize:18, flexShrink:0 }}>ℹ️</span>
          <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>
            Generate akun untuk siswa agar dapat login ke TOMAT. Password dapat di-reset kapan saja.
            <strong style={{ color:C.primary }}> Simpan daftar akun sebelum membagikannya.</strong>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { label:'Total Siswa', value:loading?'…':data.length, color:'#3b82f6' },
            { label:'Akun Dibuat', value:loading?'…':totalAkun, color:'#22c55e' },
            { label:'Belum Akun', value:loading?'…':totalBelum, color:'#f59e0b' },
          ].map(s=>(
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:12, padding:'10px 12px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:9, color:C.sub, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        {kelasList.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <select value={kelasFilter} onChange={e=>setKelasFilter(e.target.value)}
              style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8,
                padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, outline:'none', minWidth:160 }}>
              <option value="">Semua Kelas</option>
              {kelasList.map(k=><option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid #ef4444', borderRadius:12,
            padding:'12px 14px', color:'#f87171', fontSize:13, marginBottom:12 }}>❌ {error}</div>
        )}

        {/* Loading */}
        {loading && <div style={{ textAlign:'center', color:C.sub, padding:40 }}>Memuat data siswa…</div>}

        {/* Table */}
        {!loading && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 1fr 70px 1fr', gap:4, padding:'8px 12px',
              background:'rgba(0,0,0,0.25)', fontSize:10, color:C.sub, fontWeight:700, textTransform:'uppercase' }}>
              <span>No</span><span>Nama</span><span>Username</span><span style={{textAlign:'center'}}>Status</span><span style={{textAlign:'right'}}>Aksi</span>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign:'center', color:C.sub, padding:40, fontSize:13 }}>
                Belum ada data siswa.
              </div>
            )}

            {filtered.map((s, idx) => {
              const acc = accounts[s.studentId]
              const hasAkun = !!(acc || s.hasAccount)
              const displayUser = acc?.username || s.username || '—'
              const displayPass = acc?.password || ''
              const passVisible = showPassword[s.studentId]
              const isGenerating = generatingId === s.studentId

              return (
                <div key={s.studentId} style={{ display:'grid', gridTemplateColumns:'36px 1fr 1fr 70px 1fr', gap:4,
                  padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:C.sub }}>{idx+1}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    <div style={avatarBg(idx)}>{initials(s.namaLengkap||s.name)}</div>
                    <span style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.namaLengkap||s.name}
                    </span>
                  </div>
                  <div style={{ minWidth:0 }}>
                    {hasAkun ? (
                      <div>
                        <span style={{ fontFamily:'monospace', fontSize:11, color:C.primary,
                          background:C.dim, borderRadius:5, padding:'2px 6px' }}>{displayUser}</span>
                        {displayPass && (
                          <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
                            <span style={{ fontFamily:'monospace', fontSize:10, color:C.sub }}>
                              {passVisible ? displayPass : '••••••••'}
                            </span>
                            <button onClick={()=>togglePassword(s.studentId)} style={{ background:'none',
                              border:'none', color:C.sub, cursor:'pointer', fontSize:10, padding:0 }}>
                              {passVisible?'🙈':'👁'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize:11, color:C.sub }}>—</span>
                    )}
                  </div>
                  <div style={{ textAlign:'center' }}>
                    {hasAkun ? (
                      <span style={{ fontSize:10, fontWeight:700, background:'rgba(34,197,94,0.15)',
                        color:'#4ade80', borderRadius:6, padding:'2px 8px' }}>Aktif</span>
                    ) : (
                      <span style={{ fontSize:10, fontWeight:700, background:'rgba(245,158,11,0.15)',
                        color:C.primary, borderRadius:6, padding:'2px 8px' }}>Belum</span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                    {isGenerating ? (
                      <span style={{ fontSize:11, color:C.sub }}>Membuat…</span>
                    ) : hasAkun ? (
                      <button onClick={()=>openConfirm({ studentId:s.studentId, name:s.namaLengkap||s.name, regenerate:true })}
                        style={{ background:'rgba(245,158,11,0.1)', border:`1px solid ${C.border}`,
                          borderRadius:8, padding:'5px 10px', color:C.primary, fontSize:10,
                          fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>♻️ Reset</button>
                    ) : (
                      <button onClick={()=>openConfirm({ studentId:s.studentId, name:s.namaLengkap||s.name, regenerate:false })}
                        style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', border:'none',
                          borderRadius:8, padding:'5px 10px', color:'#1a0a00', fontSize:10,
                          fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>🔑 Buat</button>
                    )}
                  </div>
                </div>
              )
            })}

            <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}`,
              fontSize:11, color:C.sub, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Menampilkan {filtered.length} siswa</span>
              <button onClick={loadData} style={{ background:'none', border:'none', color:C.sub,
                cursor:'pointer', fontSize:11, fontFamily:'inherit', textDecoration:'underline' }}>
                Muat Ulang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
