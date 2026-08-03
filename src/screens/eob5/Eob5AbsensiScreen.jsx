import { useState, useEffect, useMemo, useRef, useContext } from 'react'
import { AuthContext } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.05)',
}

const STATUS_ORDER = ['hadir', 'sakit', 'izin', 'alpa']
const STATUS_LABELS = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpa: 'Alpa' }
const STATUS_COLORS = { hadir: '#22c55e', sakit: '#f97316', izin: '#3b82f6', alpa: '#ef4444' }
const STATUS_BG    = { hadir: 'rgba(34,197,94,0.15)', sakit: 'rgba(249,115,22,0.15)', izin: 'rgba(59,130,246,0.15)', alpa: 'rgba(239,68,68,0.15)' }

const ABSENT_BADGE = { sakit: 'rgba(249,115,22,0.15)', izin: 'rgba(59,130,246,0.15)', alpa: 'rgba(239,68,68,0.15)' }

function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}
function fmtDate(str) {
  try { return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str + 'T00:00:00')) }
  catch { return str }
}

const inp = { background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: '#fff', fontFamily: 'inherit', fontSize: 13, boxSizing: 'border-box' }

export default function Eob5AbsensiScreen({ navigate, goBack }) {
  const { user } = useContext(AuthContext)
  const [tab, setTab] = useState('input')

  // ── Input state ──
  const [students, setStudents]           = useState([])
  const [kelasList, setKelasList]         = useState([])
  const [bulkKelas, setBulkKelas]         = useState('')
  const [bulkTanggal, setBulkTanggal]     = useState(todayStr())
  const [statusMap, setStatusMap]         = useState({})
  const [search, setSearch]               = useState('')
  const [alreadyFilledBy, setAlreadyFilledBy] = useState(null)
  const [loadingSession, setLoadingSession]   = useState(false)
  const [saving, setSaving]               = useState(false)
  const [msg, setMsg]                     = useState({ type: '', text: '' })
  const pendingSessionRef                 = useRef(null)

  // ── History state ──
  const [historyGrouped, setHistoryGrouped] = useState([])
  const [histBulan, setHistBulan]   = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [histTahun, setHistTahun]   = useState(String(new Date().getFullYear()))
  const [loadingHist, setLoadingHist] = useState(false)

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>Akses hanya untuk guru.</div>
  }

  // Load students
  useEffect(() => {
    fetch('/api/eob5/siswa/list', { credentials: 'include' })
      .then(r => r.json()).then(data => {
        const arr = Array.isArray(data) ? data : []
        setStudents(arr)
        const kelas = [...new Set(arr.map(s => s.kelas))].sort()
        setKelasList(kelas)
        if (kelas.length && !bulkKelas) setBulkKelas(kelas[0])
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!bulkKelas && kelasList.length) setBulkKelas(kelasList[0])
  }, [kelasList])

  const bulkStudents = useMemo(() =>
    students.filter(s => !bulkKelas || s.kelas === bulkKelas), [students, bulkKelas])

  // Reset statusMap when bulkStudents changes — apply pending session if any
  useEffect(() => {
    if (pendingSessionRef.current !== null) {
      const records = pendingSessionRef.current
      pendingSessionRef.current = null
      const next = {}
      for (const s of bulkStudents) {
        const rec = records.find(r => r.student_id === s.id)
        next[s.id] = rec ? (rec.status === 'alpha' ? 'alpa' : rec.status) : 'hadir'
      }
      setStatusMap(next)
      return
    }
    setStatusMap(prev => {
      const next = {}
      for (const s of bulkStudents) next[s.id] = prev[s.id] ?? 'hadir'
      return next
    })
  }, [bulkStudents])

  // Check existing session when kelas/tanggal changes
  useEffect(() => {
    if (!bulkKelas || !bulkTanggal) { setAlreadyFilledBy(null); return }
    let cancelled = false
    setLoadingSession(true)
    fetch(`/api/eob5/attendance?kelas=${encodeURIComponent(bulkKelas)}&date=${bulkTanggal}`, { credentials: 'include' })
      .then(r => r.json()).then(records => {
        if (cancelled) return
        setLoadingSession(false)
        const arr = Array.isArray(records) ? records : []
        if (arr.length > 0) {
          const teacherName = arr[0]?.filled_by_teacher_name || null
          setAlreadyFilledBy(teacherName || 'Guru')
          setStatusMap(prev => {
            const next = { ...prev }
            for (const r of arr) {
              if (r.student_id) next[r.student_id] = r.status === 'alpha' ? 'alpa' : r.status
            }
            return next
          })
        } else {
          setAlreadyFilledBy(null)
        }
      }).catch(() => { if (!cancelled) setLoadingSession(false) })
    return () => { cancelled = true }
  }, [bulkKelas, bulkTanggal])

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return bulkStudents
    const q = search.toLowerCase()
    return bulkStudents.filter(s =>
      (s.name || '').toLowerCase().includes(q) || (s.username || '').toLowerCase().includes(q)
    )
  }, [bulkStudents, search])

  const stats = useMemo(() => {
    const r = { hadir: 0, sakit: 0, izin: 0, alpa: 0 }
    for (const s of bulkStudents) {
      const st = statusMap[s.id] || 'hadir'
      r[st] = (r[st] || 0) + 1
    }
    return r
  }, [statusMap, bulkStudents])

  const total = bulkStudents.length

  const setAllStatus = status => {
    setStatusMap(prev => {
      const next = { ...prev }
      for (const s of bulkStudents) next[s.id] = status
      return next
    })
  }

  const handleSave = async () => {
    if (!bulkStudents.length) return
    setSaving(true); setMsg({ type: '', text: '' })
    try {
      const entries = bulkStudents.map(s => ({ student_id: s.id, status: statusMap[s.id] || 'hadir' }))
      const r = await fetch('/api/eob5/attendance/bulk-mixed', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal: bulkTanggal, kelas: bulkKelas, absensi: entries }),
      })
      const data = await r.json()
      if (r.ok) {
        setMsg({ type: 'ok', text: `✅ Kehadiran ${data.jumlah} siswa dicatat` })
        setAlreadyFilledBy('Anda')
      } else {
        setMsg({ type: 'error', text: data.error || 'Gagal menyimpan' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' })
    }
    setSaving(false)
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const handleLoadSession = ({ kelas, tanggal }) => {
    // Pre-fetch records then set kelas/tanggal (pendingSessionRef ensures correct apply)
    setLoadingSession(true)
    fetch(`/api/eob5/attendance?kelas=${encodeURIComponent(kelas)}&date=${tanggal}`, { credentials: 'include' })
      .then(r => r.json()).then(records => {
        pendingSessionRef.current = Array.isArray(records) ? records : []
        setBulkTanggal(tanggal)
        setBulkKelas(kelas)
        setTab('input')
      }).catch(() => {
        setBulkTanggal(tanggal)
        setBulkKelas(kelas)
        setTab('input')
      }).finally(() => setLoadingSession(false))
  }

  const handleHapusSesi = async ({ kelas, tanggal }) => {
    if (!confirm(`Hapus absensi ${kelas} tanggal ${tanggal}?`)) return
    try {
      const r = await fetch('/api/eob5/attendance/bulk-kelas', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelas, tanggal }),
      })
      if (r.ok) {
        loadHistory()
        if (bulkKelas === kelas && bulkTanggal === tanggal) {
          setStatusMap({}); setAlreadyFilledBy(null)
        }
      }
    } catch { /* silent */ }
  }

  // History
  const loadHistory = () => {
    setLoadingHist(true)
    fetch(`/api/eob5/attendance?tahun=${histTahun}&bulan=${parseInt(histBulan)}`, { credentials: 'include' })
      .then(r => r.json()).then(data => {
        const arr = Array.isArray(data) ? data : []
        // Group by date + kelas
        const byDate = new Map()
        for (const r of arr) {
          const dateKey = (r.tanggal || '').slice(0, 10)
          if (!byDate.has(dateKey)) byDate.set(dateKey, new Map())
          const kelasMap = byDate.get(dateKey)
          const k = r.kelas || ''
          if (!kelasMap.has(k)) kelasMap.set(k, { kelas: k, tanggal: dateKey, hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0, absentStudents: [], filledBy: null })
          const g = kelasMap.get(k)
          const st = r.status === 'alpha' ? 'alpa' : (r.status || 'hadir')
          g[st] = (g[st] || 0) + 1
          g.total++
          if (st !== 'hadir') g.absentStudents.push({ name: r.siswa_name || r.student_id, status: st })
          if (!g.filledBy && r.filled_by_teacher_name) g.filledBy = r.filled_by_teacher_name
        }
        const result = []
        for (const [tanggal, kelasMap] of [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
          result.push({ tanggal, groups: [...kelasMap.values()] })
        }
        setHistoryGrouped(result)
        setLoadingHist(false)
      }).catch(() => setLoadingHist(false))
  }

  useEffect(() => { if (tab === 'histori') loadHistory() }, [tab])

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, padding: '8px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
      background: tab === t ? C.dim : 'transparent',
      border: `1px solid ${tab === t ? C.primary : C.border}`,
      borderRadius: 8, color: tab === t ? C.primary : C.sub, cursor: 'pointer',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {goBack && <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Absensi</div>
        </div>
        <div style={{ fontSize: 11, color: C.sub, textAlign: 'right' }}>
          Pencatatan kehadiran harian
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {tabBtn('input', '📋 Input')}
          {tabBtn('histori', '📅 Histori')}
        </div>

        {/* ── INPUT TAB ── */}
        {tab === 'input' && (
          <>
            {/* Selectors + Save */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Kelas</div>
                <div style={{ position: 'relative' }}>
                  <select value={bulkKelas} onChange={e => setBulkKelas(e.target.value)} style={{ ...inp, width: '100%', paddingRight: 28 }}>
                    <option value="">Pilih Kelas</option>
                    {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Tanggal</div>
                <input type="date" value={bulkTanggal} onChange={e => setBulkTanggal(e.target.value)} style={{ ...inp, width: '100%' }} />
              </div>
              <button onClick={handleSave} disabled={saving || total === 0} style={{
                background: saving ? C.dim : C.primary, border: 'none', borderRadius: 10,
                padding: '9px 18px', color: '#1a0f00', fontWeight: 800, fontSize: 13,
                cursor: saving || total === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
                opacity: total === 0 ? 0.5 : 1, whiteSpace: 'nowrap',
              }}>
                {saving ? '⏳ Menyimpan…' : `💾 Simpan ${total} Siswa`}
              </button>
            </div>

            {/* Already filled banner */}
            {alreadyFilledBy && (
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#93c5fd' }}>
                ℹ️ Absensi <strong>{bulkKelas}</strong> tanggal <strong>{bulkTanggal}</strong> sudah diisi oleh <strong>{alreadyFilledBy}</strong>. Anda bisa melihat & memperbarui.
              </div>
            )}

            {/* Feedback message */}
            {msg.text && (
              <div style={{ background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                {msg.text}
              </div>
            )}

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
              {STATUS_ORDER.map(st => (
                <div key={st} style={{ background: STATUS_BG[st], border: `1px solid ${STATUS_COLORS[st]}44`, borderRadius: 12, padding: '10px 8px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: STATUS_COLORS[st] }}>{stats[st] || 0}</div>
                  <div style={{ fontSize: 10, color: STATUS_COLORS[st], fontWeight: 700, textTransform: 'uppercase' }}>{STATUS_LABELS[st]}</div>
                  {total > 0 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `${STATUS_COLORS[st]}22` }}>
                      <div style={{ height: '100%', width: `${((stats[st] || 0) / total) * 100}%`, background: STATUS_COLORS[st], transition: 'width 0.4s' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search + Set All */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text" placeholder="🔍 Cari siswa…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inp, flex: 1, minWidth: 160 }}
              />
              <button onClick={() => setAllStatus('hadir')} style={{
                background: STATUS_BG.hadir, border: `1px solid ${STATUS_COLORS.hadir}44`, borderRadius: 8,
                padding: '6px 10px', fontSize: 11, fontWeight: 700, color: STATUS_COLORS.hadir,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
                ✅ Semua Hadir
              </button>
            </div>

            {/* Student List */}
            {loadingSession ? (
              <div style={{ textAlign: 'center', color: C.sub, padding: 30 }}>⏳ Memuat sesi…</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>
                {bulkKelas ? 'Tidak ada siswa di kelas ini.' : 'Pilih kelas terlebih dahulu.'}
              </div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Daftar Siswa</span>
                  <span style={{ fontSize: 11, color: C.sub, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '1px 8px' }}>{total} siswa</span>
                  {bulkKelas && <span style={{ fontSize: 11, color: C.primary, background: C.dim, borderRadius: 6, padding: '1px 7px', border: `1px solid ${C.border}` }}>{bulkKelas}</span>}
                </div>
                <div>
                  {filteredStudents.map((s, i) => {
                    const st = statusMap[s.id] || 'hadir'
                    return (
                      <div key={s.id} style={{
                        padding: '10px 14px',
                        borderBottom: i < filteredStudents.length - 1 ? `1px solid ${C.border}22` : 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: st !== 'hadir' ? `${STATUS_COLORS[st]}08` : 'transparent',
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: STATUS_BG[st],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, color: STATUS_COLORS[st], flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: C.sub }}>{s.username} · {s.kelas}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                          {STATUS_ORDER.map(opt => (
                            <button key={opt} onClick={() => setStatusMap(prev => ({ ...prev, [s.id]: opt }))} style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              background: st === opt ? STATUS_COLORS[opt] : 'rgba(255,255,255,0.05)',
                              color: st === opt ? '#fff' : C.sub,
                              border: `1px solid ${st === opt ? STATUS_COLORS[opt] : C.border}`,
                              fontFamily: 'inherit',
                            }}>
                              {opt === 'hadir' ? 'H' : opt === 'sakit' ? 'S' : opt === 'izin' ? 'I' : 'A'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── HISTORI TAB ── */}
        {tab === 'histori' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Bulan</div>
                <select value={histBulan} onChange={e => setHistBulan(e.target.value)} style={inp}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const v = String(i + 1).padStart(2, '0')
                    const name = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2025, i, 1))
                    return <option key={v} value={v}>{name}</option>
                  })}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Tahun</div>
                <input type="number" value={histTahun} onChange={e => setHistTahun(e.target.value)} style={{ ...inp, width: 80 }} />
              </div>
              <button onClick={loadHistory} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', color: C.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                🔍 Muat
              </button>
            </div>

            {loadingHist && <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>Memuat histori…</div>}
            {!loadingHist && historyGrouped.length === 0 && (
              <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>Belum ada riwayat absensi.</div>
            )}

            {!loadingHist && historyGrouped.map(({ tanggal, groups }) => (
              <div key={tanggal} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  {fmtDate(tanggal)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groups.map(g => {
                    const allHadir = g.alpa === 0 && g.sakit === 0 && g.izin === 0
                    const isActive = bulkTanggal === g.tanggal && bulkKelas === g.kelas
                    return (
                      <div key={`${g.kelas}|${g.tanggal}`}
                        onClick={() => handleLoadSession({ kelas: g.kelas, tanggal: g.tanggal })}
                        style={{
                          background: isActive ? C.dim : C.card,
                          border: `1px solid ${isActive ? C.primary : allHadir ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)'}`,
                          borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                          borderLeft: `3px solid ${isActive ? C.primary : allHadir ? '#22c55e' : '#f97316'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Kelas {g.kelas}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: allHadir ? '#22c55e' : C.sub }}>{g.hadir}/{g.total}</div>
                        </div>
                        {g.filledBy && (
                          <div style={{ fontSize: 10, color: C.sub, marginBottom: 6 }}>
                            👤 Diisi oleh: <span style={{ color: '#93c5fd' }}>{g.filledBy}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                          {allHadir ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 5, padding: '2px 7px', border: '1px solid rgba(34,197,94,0.2)' }}>
                              Semua Hadir
                            </span>
                          ) : (
                            <>
                              {STATUS_ORDER.map(st => g[st] > 0 && (
                                <span key={st} style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[st], background: STATUS_BG[st], borderRadius: 5, padding: '2px 6px' }}>
                                  {STATUS_LABELS[st]}: {g[st]}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                        {g.absentStudents.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {g.absentStudents.slice(0, 5).map((stu, i) => (
                              <span key={i} style={{ fontSize: 10, background: ABSENT_BADGE[stu.status] || STATUS_BG[stu.status], color: STATUS_COLORS[stu.status], borderRadius: 4, padding: '1px 5px', border: `1px solid ${STATUS_COLORS[stu.status]}44` }}>
                                {stu.name}
                              </span>
                            ))}
                            {g.absentStudents.length > 5 && <span style={{ fontSize: 10, color: C.sub }}>+{g.absentStudents.length - 5} lainnya</span>}
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); handleHapusSesi({ kelas: g.kelas, tanggal: g.tanggal }) }}
                          style={{ marginTop: 8, fontSize: 10, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                          🗑 Hapus absensi ini
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
