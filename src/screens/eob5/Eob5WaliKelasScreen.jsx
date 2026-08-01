/**
 * Eob5WaliKelasScreen.jsx
 * Pantauan Wali Kelas: ranking + kehadiran + nilai satu kelas.
 * API: GET /api/eob5/walikelas/rekap, GET /api/eob5/walikelas/jurnal
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

function getAttendanceColor(pct) {
  if (pct >= 90) return '#22c55e'
  if (pct >= 80) return '#f59e0b'
  return '#ef4444'
}

function getStatusBadge(pctHadir, poin) {
  if (pctHadir < 75 || poin < -30) return { label: 'Kritis',          color: '#ef4444' }
  if (pctHadir < 85 || poin < -15) return { label: 'Perlu Perhatian', color: '#f59e0b' }
  return                              { label: 'Baik',                 color: '#22c55e' }
}

function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return s }
}

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', flex: 1, minWidth: 130 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        {loading ? <div style={{ width: 48, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 4 }} />
          : <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginTop: 2 }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color }} />
    </div>
  )
}

export default function Eob5WaliKelasScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab]    = useState('rekap')
  const [data, setData]  = useState(null)
  const [jurnal, setJurnal] = useState([])
  const [loading, setLoading]       = useState(true)
  const [loadingJurnal, setLoadingJurnal] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/eob5/walikelas/rekap', { credentials: 'include' })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/eob5/walikelas/jurnal', { credentials: 'include' })
      .then(r => r.json()).then(d => { setJurnal(d.entries || []); setLoadingJurnal(false) })
      .catch(() => setLoadingJurnal(false))
  }, [])

  const stats = useMemo(() => {
    const siswa = data?.siswa || []
    if (!siswa.length) return null
    const totalSesi = siswa.reduce((s,x) => s + x.hadir + x.izin + x.sakit + x.alpa, 0)
    const totalHadir = siswa.reduce((s,x) => s + x.hadir, 0)
    const avgHadir = totalSesi > 0 ? Math.round(totalHadir/totalSesi*100) : 0
    const withNilai = siswa.filter(x => x.rataNilai != null)
    const avgNilai = withNilai.length > 0
      ? (withNilai.reduce((s,x) => s + x.rataNilai, 0) / withNilai.length).toFixed(1) : null
    const totalPoinNegatif = siswa.reduce((s,x) => s + (x.totalPoin < 0 ? Math.abs(x.totalPoin) : 0), 0)
    const perluPerhatian = siswa.filter(x => x.alpa >= 3 || x.totalPoin < -20).length
    return { avgHadir, avgNilai, totalPoinNegatif, perluPerhatian }
  }, [data])

  const filtered = useMemo(() => {
    const list = data?.siswa || []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(s => s.namaLengkap?.toLowerCase().includes(q) || s.nisn?.includes(q))
  }, [data, search])

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
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            GURU — Wali Kelas {loading ? '' : data?.kelas || ''}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
            Rekap Wali Kelas{data?.kelas ? ` — ${data.kelas}` : ''}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 20, width: 'max-content', marginBottom: 20 }}>
          {[['rekap','Rekap Siswa'],['jurnal','Jurnal Kelas']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '7px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: tab === k ? C.white : 'transparent', color: tab === k ? '#fff' : C.sub,
            }}>{l}</button>
          ))}
        </div>

        {/* Stat Cards */}
        {stats && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <StatCard label="Hadir Rata-rata"  value={`${stats.avgHadir}%`}     icon="✅"  color="#22c55e" loading={loading} />
            <StatCard label="Rata-rata Nilai"  value={stats.avgNilai ?? '—'}    icon="📊"  color="#3b82f6" loading={loading} />
            <StatCard label="Poin Pelanggaran" value={stats.totalPoinNegatif}   icon="⚠️"  color="#ef4444" loading={loading} />
            <StatCard label="Perlu Perhatian"  value={stats.perluPerhatian}     icon="🔴"  color="#f59e0b" loading={loading} />
          </div>
        )}

        {tab === 'rekap' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Table */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Rekap Komprehensif Siswa</div>
                  <input placeholder="Cari siswa..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 12px',
                      color: C.text, fontSize: 12, outline: 'none', width: 160 }} />
                </div>
                {loading ? (
                  <div style={{ padding: 16 }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: C.sub, fontSize: 14 }}>
                    👥<br />
                    {search ? 'Tidak ada siswa ditemukan.' : 'Belum ada siswa terdaftar di kelas ini.'}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr>
                        <th style={{ ...thStyle, textAlign: 'center', width: 44 }}>No</th>
                        <th style={thStyle}>Nama Siswa</th>
                        <th style={{ ...thStyle, minWidth: 130 }}>Kehadiran</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Nilai</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Poin</th>
                        <th style={thStyle}>Status</th>
                      </tr></thead>
                      <tbody>
                        {filtered.map((s, idx) => {
                          const totalSesi = s.hadir + s.izin + s.sakit + s.alpa
                          const pctHadir  = totalSesi > 0 ? Math.round(s.hadir/totalSesi*100) : 0
                          const barColor  = getAttendanceColor(pctHadir)
                          const status    = getStatusBadge(pctHadir, s.totalPoin)
                          const poin      = s.totalPoin || 0
                          return (
                            <tr key={s.studentId}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ ...tdStyle, textAlign: 'center', color: C.sub, fontWeight: 600 }}>{idx+1}</td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(s.namaLengkap),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {initials(s.namaLengkap)}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{s.namaLengkap}</div>
                                    <div style={{ fontSize: 10, color: C.sub }}>{s.nisn ? `NISN: ${s.nisn}` : s.kelas}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: barColor, width: 32, flexShrink: 0 }}>{pctHadir}%</span>
                                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pctHadir}%`, background: barColor, borderRadius: 4 }} />
                                  </div>
                                </div>
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>
                                {s.rataNilai != null
                                  ? <span style={{ fontWeight: 700, fontSize: 14, color: s.rataNilai >= 75 ? '#22c55e' : '#ef4444' }}>{Number(s.rataNilai).toFixed(1)}</span>
                                  : <span style={{ color: C.sub }}>—</span>}
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <span style={{ background: poin === 0 ? 'rgba(255,255,255,0.08)' : poin > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: poin === 0 ? C.sub : poin > 0 ? '#22c55e' : '#ef4444',
                                  border: `1px solid ${poin === 0 ? 'rgba(255,255,255,0.1)' : poin > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                  borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                                  {poin > 0 ? `+${poin}` : poin}
                                </span>
                              </td>
                              <td style={tdStyle}>
                                <span style={{ background: `${status.color}22`, color: status.color, border: `1px solid ${status.color}44`,
                                  borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{status.label}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.1)',
                      fontSize: 11, color: C.sub }}>
                      Menampilkan {filtered.length}{search ? ` dari ${data?.siswa?.length || 0}` : ''} siswa
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Jurnal terbaru kelas */}
            <div style={{ width: 256, flexShrink: 0 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                  📖 Catatan Jurnal Kelas
                </div>
                {loadingJurnal ? [1,2,3].map(i => <div key={i} style={{ height: 56, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 10 }} />) :
                jurnal.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 16 }}>Belum ada jurnal.</div>
                ) : jurnal.slice(0, 5).map((j, i) => (
                  <div key={j.id} style={{ position: 'relative', paddingLeft: 16, paddingBottom: 14, borderLeft: `2px solid ${C.border}` }}>
                    <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: C.primary }} />
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 2 }}>{fmtDate(j.tanggal)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{j.subjectName}</div>
                    <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{j.materi}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: avatarColor(j.teacherName||''),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                        {initials(j.teacherName||'')}
                      </div>
                      <span style={{ fontSize: 10, color: C.sub }}>{j.teacherName}</span>
                    </div>
                  </div>
                ))}
                {jurnal.length > 5 && (
                  <button onClick={() => setTab('jurnal')} style={{ width: '100%', marginTop: 8, padding: '8px', background: C.white,
                    border: `1px solid ${C.border}`, borderRadius: 8, color: C.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Lihat Semua Jurnal →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'jurnal' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📖</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Jurnal Mengajar — Kelas {data?.kelas || ''}</span>
            </div>
            {loadingJurnal ? (
              <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />)}</div>
            ) : jurnal.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.sub }}>📖<br />Belum ada jurnal untuk kelas ini.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Guru</th>
                    <th style={thStyle}>Mata Pelajaran</th>
                    <th style={thStyle}>Materi</th>
                    <th style={thStyle}>Catatan</th>
                  </tr></thead>
                  <tbody>
                    {jurnal.map(j => (
                      <tr key={j.id}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, color: C.sub, whiteSpace: 'nowrap' }}>{fmtDate(j.tanggal)}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: avatarColor(j.teacherName||''),
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {initials(j.teacherName||'')}
                            </div>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{j.teacherName}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: C.sub }}>{j.subjectName || '—'}</td>
                        <td style={{ ...tdStyle, maxWidth: 240 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.materi}</div>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 180, color: C.sub }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.catatan || '—'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
