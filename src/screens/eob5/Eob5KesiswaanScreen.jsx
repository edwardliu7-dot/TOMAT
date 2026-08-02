/**
 * Eob5KesiswaanScreen.jsx
 * Overview Kesiswaan: statistik per kelas + alert siswa bermasalah.
 * API: GET /api/eob5/kesiswaan/overview, GET /api/eob5/kesiswaan/siswa-absensi
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)',
}

const AVATAR_COLORS = ['#3b82f6','#ec4899','#f59e0b','#8b5cf6','#22c55e','#14b8a6','#f97316','#06b6d4']
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length] }
function initials(name) { return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?' }

function getProgressColor(pct) {
  if (pct >= 93) return '#22c55e'
  if (pct >= 85) return '#f59e0b'
  return '#ef4444'
}
function getStatusStyle(status) {
  const map = { Baik: ['#22c55e','#052e16'], Perhatian: ['#f59e0b','#1c0f00'], Kritis: ['#ef4444','#1f0000'] }
  return map[status] || ['#6b7280','#111827']
}

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', flex: 1, minWidth: 130 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        {loading ? <div style={{ width: 48, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 4 }} />
          : <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginTop: 2 }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color }} />
    </div>
  )
}

function ProgressBar({ pct }) {
  const col = getProgressColor(pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: col, width: 36, flexShrink: 0 }}>{pct}%</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: col, borderRadius: 4, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

export default function Eob5KesiswaanScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab]       = useState('ringkasan')
  const [overview, setOverview] = useState(null)
  const [siswa, setSiswa]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [loadingSiswa, setLoadingSiswa] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('semua')

  useEffect(() => {
    fetch('/api/eob5/kesiswaan/overview', { credentials: 'include' })
      .then(r => r.json()).then(d => { setOverview(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/eob5/kesiswaan/siswa-absensi', { credentials: 'include' })
      .then(r => r.json()).then(d => { setSiswa(Array.isArray(d) ? d : []); setLoadingSiswa(false) })
      .catch(() => setLoadingSiswa(false))
  }, [])

  const summary = useMemo(() => {
    if (!overview?.perKelas?.length) return null
    const perKelas = overview.perKelas
    const totalSiswa = perKelas.reduce((s,k) => s + k.totalSiswa, 0)
    const totalHadir = perKelas.reduce((s,k) => s + k.hadir, 0)
    const totalSesi  = perKelas.reduce((s,k) => s + k.hadir + k.izin + k.sakit + k.alpa, 0)
    const pctHadir   = totalSesi > 0 ? Math.round(totalHadir / totalSesi * 100) : 0
    const totalPoinNegatif = perKelas.reduce((s,k) => s + k.totalPoinNegatif, 0)
    const kelasKritis = perKelas.filter(k => {
      const tot = k.hadir + k.izin + k.sakit + k.alpa
      const pct = tot > 0 ? Math.round(k.hadir/tot*100) : 0
      return pct < 75 || k.totalPoinNegatif > 100
    }).length
    return { totalSiswa, pctHadir, totalPoinNegatif, kelasKritis }
  }, [overview])

  const enrichedKelas = useMemo(() => {
    if (!overview?.perKelas?.length) return []
    return overview.perKelas.map(k => {
      const tot = k.hadir + k.izin + k.sakit + k.alpa
      const pctHadir = tot > 0 ? Math.round(k.hadir/tot*100) : 0
      const status = pctHadir >= 93 && k.totalPoinNegatif <= 50 ? 'Baik'
        : (pctHadir < 85 || k.totalPoinNegatif > 100) ? 'Kritis' : 'Perhatian'
      return { ...k, pctHadir, status }
    }).sort((a,b) => a.kelas.localeCompare(b.kelas,'id'))
  }, [overview])

  const kelasOptions = useMemo(() => [...new Set(siswa.map(s => s.kelas))].sort((a,b) => a.localeCompare(b,'id')), [siswa])

  const filteredSiswa = useMemo(() => {
    return siswa.filter(s =>
      (filterKelas === 'semua' || s.kelas === filterKelas) &&
      (!search || s.namaLengkap.toLowerCase().includes(search.toLowerCase()) || s.kelas.toLowerCase().includes(search.toLowerCase()))
    )
  }, [siswa, search, filterKelas])

  const thStyle = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 1, color: C.sub, borderBottom: `1px solid ${C.border}`, textAlign: 'left',
    background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '10px 14px', fontSize: 13, color: C.text, borderBottom: `1px solid rgba(245,158,11,0.08)` }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU — Kesiswaan</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Rekap Kesiswaan</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <StatCard label="Total Siswa"         value={summary?.totalSiswa ?? 0}           icon="👥" color="#3b82f6"  loading={loading} />
          <StatCard label="Rata-rata Kehadiran" value={summary ? `${summary.pctHadir}%` : '—'} icon="✅" color="#22c55e" loading={loading} />
          <StatCard label="Total Poin Negatif"  value={summary?.totalPoinNegatif ?? 0}      icon="⚠️" color="#ef4444"  loading={loading} />
          <StatCard label="Kelas Kritis"        value={summary?.kelasKritis ?? 0}           icon="🚨" color="#f59e0b"  loading={loading} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 20, width: 'max-content', marginBottom: 20 }}>
          {[['ringkasan','Ringkasan Kelas'],['siswa','Rekap Per Siswa']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '7px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: tab === k ? C.white : 'transparent', color: tab === k ? '#fff' : C.sub,
            }}>{l}</button>
          ))}
        </div>

        {tab === 'ringkasan' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Main table */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginBottom: 10 }}>Ringkasan Per Kelas</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={thStyle}>Kelas</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Jml Siswa</th>
                    <th style={{ ...thStyle, minWidth: 140 }}>Kehadiran</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Poin −</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Poin +</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                  </tr></thead>
                  <tbody>
                    {loading ? [1,2,3].map(i => (
                      <tr key={i}><td colSpan={6} style={tdStyle}><div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '80%' }} /></td></tr>
                    )) : enrichedKelas.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>Belum ada data siswa.</td></tr>
                    ) : enrichedKelas.map((k, i) => {
                      const [sColor, sBg] = getStatusStyle(k.status)
                      return (
                        <tr key={i}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ ...tdStyle, fontWeight: 800, color: '#fff' }}>{k.kelas}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{k.totalSiswa}</td>
                          <td style={tdStyle}><ProgressBar pct={k.pctHadir} /></td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: k.totalPoinNegatif > 100 ? '#ef4444' : C.text }}>
                            {k.totalPoinNegatif > 0 ? k.totalPoinNegatif : <span style={{ color: C.sub }}>—</span>}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: '#22c55e' }}>
                            {k.totalPoinPositif > 0 ? k.totalPoinPositif : <span style={{ color: C.sub }}>—</span>}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{ background: `${sColor}22`, color: sColor, border: `1px solid ${sColor}44`,
                              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{k.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Top pelanggaran */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🚨</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Perlu Perhatian Khusus</span>
                </div>
                <div style={{ padding: 8 }}>
                  {loading ? [1,2,3].map(i => <div key={i} style={{ height: 42, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 6 }} />) :
                  (overview?.siswaPoinTerbanyak || []).length === 0 ? (
                    <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 14 }}>Belum ada catatan pelanggaran.</div>
                  ) : (overview?.siswaPoinTerbanyak || []).map((s, i) => (
                    <div key={s.studentId||i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 6px', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(s.namaLengkap),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {initials(s.namaLengkap)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.namaLengkap}</div>
                          <div style={{ fontSize: 10, color: C.sub }}>{s.kelas}</div>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{s.totalPoin}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Top prestasi */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Poin Positif Tertinggi</span>
                </div>
                <div style={{ padding: 8 }}>
                  {(overview?.siswaPoinPositifTerbanyak || []).length === 0 ? (
                    <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 14 }}>Belum ada poin positif.</div>
                  ) : (overview?.siswaPoinPositifTerbanyak || []).map((s, i) => (
                    <div key={s.studentId||i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, width: 16 }}>{i+1}</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(s.namaLengkap),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                          {initials(s.namaLengkap)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.namaLengkap}</div>
                          <div style={{ fontSize: 10, color: C.sub }}>{s.kelas}</div>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(245,158,11,0.2)', color: C.primary, border: `1px solid ${C.border}`,
                        borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>+{s.totalPoin}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'siswa' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <input placeholder="Cari nama siswa..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 14px',
                  color: C.text, fontSize: 12, outline: 'none', flex: 1, minWidth: 180 }} />
              <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
                style={{ background: '#1f1300', border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 14px',
                  color: C.text, fontSize: 12, outline: 'none' }}>
                <option value="semua">Semua Kelas</option>
                {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={thStyle}>Nama Siswa</th>
                    <th style={thStyle}>Kelas</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Hadir</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Izin</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Sakit</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Alpa</th>
                    <th style={{ ...thStyle, minWidth: 120 }}>Kehadiran</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Poin +</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Poin −</th>
                  </tr></thead>
                  <tbody>
                    {loadingSiswa ? [1,2,3,4].map(i => (
                      <tr key={i}><td colSpan={9} style={tdStyle}><div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '80%' }} /></td></tr>
                    )) : filteredSiswa.length === 0 ? (
                      <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>Belum ada data siswa.</td></tr>
                    ) : filteredSiswa.map(s => (
                      <tr key={s.studentId}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#fff' }}>{s.namaLengkap}</td>
                        <td style={{ ...tdStyle, color: C.sub }}>{s.kelas}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{s.hadir}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{s.izin}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{s.sakit}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>{s.alpa}</td>
                        <td style={tdStyle}><ProgressBar pct={s.pctHadir} /></td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: '#22c55e' }}>
                          {s.totalPoinPositif > 0 ? s.totalPoinPositif : <span style={{ color: C.sub }}>—</span>}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                          {s.totalPoinNegatif > 0
                            ? <span style={{ color: s.totalPoinNegatif > 50 ? '#ef4444' : C.text }}>{s.totalPoinNegatif}</span>
                            : <span style={{ color: C.sub }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
