/**
 * Eob5KepsekScreen.jsx
 * Overview Kepala Sekolah: kepatuhan jurnal per guru + dokumen administrasi.
 * API: GET /api/eob5/kepsek/overview, GET /api/eob5/kepsek/jurnal
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
function avatarColor(idx) { return AVATAR_COLORS[idx % AVATAR_COLORS.length] }
function initials(name) { return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?' }

function getStatusLabel(pct) {
  if (pct >= 90) return { label: 'Sangat Baik', color: '#22c55e' }
  if (pct >= 75) return { label: 'Baik',        color: '#3b82f6' }
  if (pct >= 50) return { label: 'Cukup',       color: '#f59e0b' }
  return                 { label: 'Perlu Perhatian', color: '#ef4444' }
}

function getBarColor(pct) {
  if (pct >= 90) return '#22c55e'
  if (pct >= 75) return '#3b82f6'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: 'width .4s' }} />
    </div>
  )
}

function StatCard({ label, value, icon, color, progress, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', flex: 1, minWidth: 140 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {loading
          ? <div style={{ width: 40, height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 4 }} />
          : <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginTop: 2 }}>{label}</div>
      </div>
      {/* bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: color, transition: 'width .5s' }} />
      </div>
    </div>
  )
}

function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return s }
}

export default function Eob5KepsekScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('kinerja')
  const [search, setSearch] = useState('')
  const [teachers, setTeachers] = useState([])
  const [jurnal, setJurnal] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingJurnal, setLoadingJurnal] = useState(true)

  useEffect(() => {
    fetch('/api/eob5/kepsek/overview', { credentials: 'include' })
      .then(r => r.json()).then(d => { setTeachers(d.teachers || []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/eob5/kepsek/jurnal', { credentials: 'include' })
      .then(r => r.json()).then(d => { setJurnal(d.entries || []); setLoadingJurnal(false) })
      .catch(() => setLoadingJurnal(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return teachers.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.mapel || []).some(m => m.toLowerCase().includes(q))
    )
  }, [teachers, search])

  const totalGuru       = teachers.length
  const jurnalLengkap   = teachers.filter(t => t.jurnalBulanIni >= 1).length
  const dokumenLengkap  = teachers.filter(t => t.dokumenSelesai >= t.dokumenTotal && t.dokumenTotal > 0).length
  const perluPerhatian  = teachers.filter(t => t.kelengkapanPersen < 50).length

  const thStyle = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 1, color: C.sub, borderBottom: `1px solid ${C.border}`, textAlign: 'left',
    background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '11px 14px', fontSize: 13, color: C.text, borderBottom: `1px solid rgba(245,158,11,0.08)` }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU — Kepala Sekolah</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Progres Kinerja Guru</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['kinerja','📊 Kinerja Guru'],['jurnal','📖 Jurnal Sekolah']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '8px 18px', borderRadius: 20, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === k ? C.primary : C.white, color: tab === k ? '#1a1200' : C.text, transition: 'all .2s',
            }}>{l}</button>
          ))}
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total Guru"      value={totalGuru}      icon="👨‍🏫" color="#3b82f6"  progress={100}     loading={loading} />
          <StatCard label="Jurnal Lengkap"  value={jurnalLengkap}  icon="✅"   color="#22c55e" progress={totalGuru > 0 ? Math.round(jurnalLengkap/totalGuru*100) : 0} loading={loading} />
          <StatCard label="Dokumen Lengkap" value={dokumenLengkap} icon="📄"   color="#8b5cf6" progress={totalGuru > 0 ? Math.round(dokumenLengkap/totalGuru*100) : 0} loading={loading} />
          <StatCard label="Perlu Perhatian" value={perluPerhatian}  icon="⚠️"   color="#f59e0b" progress={totalGuru > 0 ? Math.round(perluPerhatian/totalGuru*100) : 0} loading={loading} />
        </div>

        {tab === 'kinerja' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Table */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub }}>Rekap Kinerja</div>
                <input
                  placeholder="Cari guru..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px',
                    color: C.text, fontSize: 12, outline: 'none', width: 160 }}
                />
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Guru</th>
                        <th style={thStyle}>Mata Pelajaran</th>
                        <th style={thStyle}>Jurnal (Bln ini)</th>
                        <th style={thStyle}>Dokumen</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3,4].map(i => (
                          <tr key={i}><td colSpan={5} style={tdStyle}>
                            <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '80%' }} />
                          </td></tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>
                          {search ? 'Guru tidak ditemukan.' : 'Belum ada data guru.'}
                        </td></tr>
                      ) : filtered.map((t, idx) => {
                        const docPct = t.dokumenTotal > 0 ? Math.round(t.dokumenSelesai/t.dokumenTotal*100) : 0
                        const status = getStatusLabel(t.kelengkapanPersen)
                        return (
                          <tr key={t.username} style={{ transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(idx),
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                  {initials(t.name)}
                                </div>
                                <span style={{ fontWeight: 600, color: '#fff' }}>{t.name}</span>
                              </div>
                            </td>
                            <td style={{ ...tdStyle, color: C.sub }}>{(t.mapel || []).join(', ') || '—'}</td>
                            <td style={{ ...tdStyle, minWidth: 130 }}>
                              <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{t.jurnalBulanIni} entri</div>
                              <ProgressBar pct={Math.min(t.jurnalBulanIni * 10, 100)} color={getBarColor(t.kelengkapanPersen)} />
                            </td>
                            <td style={{ ...tdStyle, minWidth: 130 }}>
                              <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{t.dokumenSelesai}/{t.dokumenTotal} ({docPct}%)</div>
                              <ProgressBar pct={docPct} color={getBarColor(docPct)} />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <span style={{ background: `${status.color}22`, color: status.color, border: `1px solid ${status.color}44`,
                                borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar: Jurnal Terbaru */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginBottom: 10 }}>Aktivitas Terkini</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                  🕐 Jurnal Terbaru
                </div>
                {loadingJurnal ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 50, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 10 }} />)
                ) : jurnal.slice(0, 5).length === 0 ? (
                  <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 16 }}>Belum ada jurnal.</div>
                ) : jurnal.slice(0, 5).map((j, idx) => (
                  <div key={j.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(idx),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials(j.teacherName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{j.teacherName}</div>
                      <div style={{ fontSize: 11, color: C.sub }}>{j.kelas} · {j.materi}</div>
                      <div style={{ fontSize: 10, color: '#644a1a', marginTop: 2 }}>{fmtDate(j.tanggal)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1f1300', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 6 }}>📅 Jadwal Supervisi</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                  Supervisi akademik periode ganjil dimulai minggu pertama bulan depan.
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'jurnal' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 13, color: '#fff' }}>
              📖 Jurnal Mengajar Semua Guru
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Guru</th>
                    <th style={thStyle}>Mata Pelajaran</th>
                    <th style={thStyle}>Kelas</th>
                    <th style={thStyle}>Materi</th>
                    <th style={thStyle}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingJurnal ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan={6} style={tdStyle}>
                      <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '70%' }} />
                    </td></tr>)
                  ) : jurnal.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>Belum ada jurnal.</td></tr>
                  ) : jurnal.map(j => (
                    <tr key={j.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...tdStyle, color: C.sub, whiteSpace: 'nowrap' }}>{fmtDate(j.tanggal)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#fff' }}>{j.teacherName}</td>
                      <td style={{ ...tdStyle, color: C.sub }}>{j.subjectName || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>
                          {j.kelas || '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 220 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.materi}</div>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 160, color: C.sub }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.catatan || '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
