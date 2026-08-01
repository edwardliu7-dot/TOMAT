import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const COLOR = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  primaryDim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  textSub: '#92400e',
  card: 'rgba(255,255,255,0.04)',
}

const STATUS_OPTIONS = ['hadir', 'sakit', 'izin', 'alpha']
const STATUS_COLORS = {
  hadir: '#22c55e',
  sakit: '#f59e0b',
  izin:  '#3b82f6',
  alpha: '#ef4444',
}
const STATUS_LABELS = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin:  'Izin',
  alpha: 'Alpha',
}

export default function Eob5AbsensiScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('input')   // 'input' | 'rekap'
  const [kelasList, setKelasList] = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [siswaList, setSiswaList] = useState([])
  const [statusMap, setStatusMap] = useState({})   // { studentId: 'hadir'|... }
  const [existingMap, setExistingMap] = useState({}) // today's saved records
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loadingSiswa, setLoadingSiswa] = useState(false)

  // Rekap state
  const [rekapData, setRekapData] = useState([])
  const [rekapKelas, setRekapKelas] = useState('')
  const [rekapBulan, setRekapBulan] = useState(String(new Date().getMonth() + 1))
  const [rekapTahun, setRekapTahun] = useState(String(new Date().getFullYear()))
  const [loadingRekap, setLoadingRekap] = useState(false)

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  }

  // Load kelas list on mount
  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setKelasList(data)
      })
      .catch(() => {})
  }, [])

  // Load siswa when kelas changes
  useEffect(() => {
    if (!selectedKelas) { setSiswaList([]); setStatusMap({}); return }
    setLoadingSiswa(true)
    Promise.all([
      fetch(`/api/eob5/kelas/${encodeURIComponent(selectedKelas)}/siswa`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/eob5/absensi/hari-ini?kelas=${encodeURIComponent(selectedKelas)}`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([kelasData, hariIniData]) => {
      const list = kelasData.siswa || []
      setSiswaList(list)
      const existing = {}
      const initial = {}
      if (Array.isArray(hariIniData?.absensi)) {
        for (const a of hariIniData.absensi) {
          existing[a.student_id] = a.status
          initial[a.student_id] = a.status
        }
      }
      setExistingMap(existing)
      // Default all to 'hadir' if not yet recorded
      const map = {}
      for (const s of list) {
        map[s.id] = initial[s.id] || 'hadir'
      }
      setStatusMap(map)
      setLoadingSiswa(false)
    }).catch(() => { setLoadingSiswa(false) })
  }, [selectedKelas])

  const loadRekap = () => {
    setLoadingRekap(true)
    const params = new URLSearchParams()
    if (rekapKelas) params.set('kelas', rekapKelas)
    params.set('bulan', rekapBulan)
    params.set('tahun', rekapTahun)
    fetch(`/api/eob5/absensi/rekap?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setRekapData(Array.isArray(data) ? data : []); setLoadingRekap(false) })
      .catch(() => setLoadingRekap(false))
  }

  useEffect(() => {
    if (tab === 'rekap') loadRekap()
  }, [tab])

  const handleSimpan = async () => {
    if (!selectedKelas || siswaList.length === 0) return
    setSaving(true); setError(''); setSaved(false)
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const absensi = siswaList.map(s => ({ student_id: s.id, status: statusMap[s.id] || 'hadir' }))
    try {
      const r = await fetch('/api/eob5/absensi/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tanggal: today, kelas: selectedKelas, absensi }),
      })
      if (!r.ok) {
        const d = await r.json()
        setError(d.error || 'Gagal menyimpan')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { setError('Gagal terhubung ke server') }
    setSaving(false)
  }

  const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date())

  return (
    <div style={{ minHeight: '100vh', background: COLOR.bg, fontFamily: 'system-ui, sans-serif', color: COLOR.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${COLOR.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: COLOR.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Absensi</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLOR.border}`, background: 'rgba(0,0,0,0.2)' }}>
        {[['input','Input Hari Ini'],['rekap','Rekap Bulanan']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '14px', background: 'none', border: 'none',
            borderBottom: tab === key ? `2px solid ${COLOR.primary}` : '2px solid transparent',
            color: tab === key ? COLOR.primary : COLOR.textSub,
            fontWeight: tab === key ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 'input' && (
          <>
            <div style={{ fontSize: 11, color: COLOR.textSub, marginBottom: 12 }}>{todayStr}</div>
            {/* Kelas Picker */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PILIH KELAS</div>
              <select
                value={selectedKelas}
                onChange={e => setSelectedKelas(e.target.value)}
                style={{ width: '100%', background: '#1c0a00', border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px', color: '#fff', fontFamily: 'inherit', fontSize: 14 }}
              >
                <option value="">— Pilih Kelas —</option>
                {kelasList.map(k => (
                  <option key={k.kelas} value={k.kelas}>{k.kelas} ({k.jumlahSiswa} siswa)</option>
                ))}
              </select>
            </div>

            {loadingSiswa && <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 32 }}>Memuat data siswa…</div>}

            {!loadingSiswa && selectedKelas && siswaList.length === 0 && (
              <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 32 }}>Tidak ada siswa di kelas ini.</div>
            )}

            {!loadingSiswa && siswaList.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                  DAFTAR SISWA — {siswaList.length} orang
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {siswaList.map((s, i) => (
                    <div key={s.id} style={{
                      background: COLOR.card, border: `1px solid ${COLOR.border}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLOR.primaryDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: COLOR.primary, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: COLOR.textSub }}>{s.username}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {STATUS_OPTIONS.map(st => (
                          <button key={st} onClick={() => setStatusMap(m => ({ ...m, [s.id]: st }))} style={{
                            padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                            border: statusMap[s.id] === st ? `1.5px solid ${STATUS_COLORS[st]}` : '1.5px solid rgba(255,255,255,0.1)',
                            background: statusMap[s.id] === st ? `${STATUS_COLORS[st]}22` : 'transparent',
                            color: statusMap[s.id] === st ? STATUS_COLORS[st] : 'rgba(255,255,255,0.35)',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}>{STATUS_LABELS[st].charAt(0)}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {STATUS_OPTIONS.map(st => (
                    <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[st] }} />
                      <span style={{ color: COLOR.textSub }}>{st.charAt(0).toUpperCase()} = {STATUS_LABELS[st]}</span>
                    </div>
                  ))}
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
                {saved && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: 10, padding: '10px 14px', color: '#4ade80', fontSize: 13, marginBottom: 12 }}>✅ Absensi berhasil disimpan!</div>}

                <button onClick={handleSimpan} disabled={saving} style={{
                  width: '100%', background: saving ? 'rgba(245,158,11,0.3)' : 'linear-gradient(90deg,#f59e0b,#d97706)',
                  border: 'none', borderRadius: 14, padding: '15px', color: '#1a0a00',
                  fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>
                  {saving ? 'Menyimpan…' : '💾 Simpan Absensi Hari Ini'}
                </button>
              </>
            )}
          </>
        )}

        {tab === 'rekap' && (
          <>
            {/* Filter rekap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: COLOR.textSub, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>KELAS</div>
                <select value={rekapKelas} onChange={e => setRekapKelas(e.target.value)} style={{ width: '100%', background: '#1c0a00', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '8px', color: '#fff', fontFamily: 'inherit', fontSize: 12 }}>
                  <option value="">Semua</option>
                  {kelasList.map(k => <option key={k.kelas} value={k.kelas}>{k.kelas}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLOR.textSub, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>BULAN</div>
                <select value={rekapBulan} onChange={e => setRekapBulan(e.target.value)} style={{ width: '100%', background: '#1c0a00', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '8px', color: '#fff', fontFamily: 'inherit', fontSize: 12 }}>
                  {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLOR.textSub, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>TAHUN</div>
                <select value={rekapTahun} onChange={e => setRekapTahun(e.target.value)} style={{ width: '100%', background: '#1c0a00', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '8px', color: '#fff', fontFamily: 'inherit', fontSize: 12 }}>
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button onClick={loadRekap} style={{ width: '100%', background: COLOR.primaryDim, border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px', color: COLOR.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}>
              🔍 Tampilkan Rekap
            </button>

            {loadingRekap && <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 32 }}>Memuat rekap…</div>}

            {!loadingRekap && rekapData.length === 0 && (
              <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 32 }}>Belum ada data absensi.</div>
            )}

            {!loadingRekap && rekapData.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(245,158,11,0.1)' }}>
                      <th style={{ padding: '10px 8px', textAlign: 'left', color: COLOR.primary, fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>Nama</th>
                      <th style={{ padding: '10px 6px', textAlign: 'center', color: '#4ade80', fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>H</th>
                      <th style={{ padding: '10px 6px', textAlign: 'center', color: '#fbbf24', fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>S</th>
                      <th style={{ padding: '10px 6px', textAlign: 'center', color: '#60a5fa', fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>I</th>
                      <th style={{ padding: '10px 6px', textAlign: 'center', color: '#f87171', fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>A</th>
                      <th style={{ padding: '10px 6px', textAlign: 'center', color: COLOR.textSub, fontWeight: 700, borderBottom: `1px solid ${COLOR.border}` }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.map((r, i) => {
                      const total = parseInt(r.total_tercatat) || 0
                      const hadir = parseInt(r.hadir) || 0
                      const pct = total > 0 ? Math.round((hadir / total) * 100) : 0
                      return (
                        <tr key={r.id} style={{ borderBottom: `1px solid rgba(245,158,11,0.1)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '9px 8px', color: '#fff', fontWeight: 500 }}>{r.name}</td>
                          <td style={{ padding: '9px 6px', textAlign: 'center', color: '#4ade80' }}>{hadir}</td>
                          <td style={{ padding: '9px 6px', textAlign: 'center', color: '#fbbf24' }}>{r.sakit || 0}</td>
                          <td style={{ padding: '9px 6px', textAlign: 'center', color: '#60a5fa' }}>{r.izin || 0}</td>
                          <td style={{ padding: '9px 6px', textAlign: 'center', color: '#f87171' }}>{r.alpha || 0}</td>
                          <td style={{ padding: '9px 6px', textAlign: 'center', color: pct >= 80 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171', fontWeight: 700 }}>{pct}%</td>
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
