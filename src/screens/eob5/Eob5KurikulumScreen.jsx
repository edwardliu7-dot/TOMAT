/**
 * Eob5KurikulumScreen.jsx
 * Supervisi Kurikulum: dokumen administrasi + jurnal per guru.
 * API: GET /api/eob5/kurikulum/overview, GET /api/eob5/kurikulum/jurnal
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)',
}

const AVATAR_COLORS = ['#3b82f6','#ef4444','#f59e0b','#8b5cf6','#22c55e','#14b8a6','#f97316','#06b6d4']
function avatarColor(idx) { return AVATAR_COLORS[idx % AVATAR_COLORS.length] }
function initials(name) { return (name||'').split(' ').map(p=>p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?' }

function getProgressColor(pct) {
  if (pct >= 100) return '#22c55e'
  if (pct >= 60)  return '#3b82f6'
  return '#f59e0b'
}

function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return s }
}

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', flex: 1, minWidth: 150 }}>
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

export default function Eob5KurikulumScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab]       = useState('dokumen')
  const [teachers, setTeachers] = useState([])
  const [jurnal, setJurnal] = useState([])
  const [loading, setLoading]       = useState(true)
  const [loadingJurnal, setLoadingJurnal] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetch('/api/eob5/kurikulum/overview', { credentials: 'include' })
      .then(r => r.json()).then(d => { setTeachers(d.teachers || []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/eob5/kurikulum/jurnal', { credentials: 'include' })
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

  const totalGuru      = teachers.length
  const dokumenLengkap = teachers.filter(t => t.subjects.some(s => s.documents.length > 0)).length
  const totalDocs      = teachers.reduce((sum,t) => sum + t.subjects.reduce((s2,s) => s2 + s.documents.length, 0), 0)
  const avgKepatuhan   = totalGuru > 0 ? Math.round(dokumenLengkap/totalGuru*100) : 0

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
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU — Kurikulum</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Supervisi Kurikulum</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Tabs + Export */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 20 }}>
            {[['dokumen','📄 Dokumen'],['jurnal','📖 Jurnal']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '7px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
                background: tab === k ? C.white : 'transparent', color: tab === k ? '#fff' : C.sub,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total Guru"      value={totalGuru}                   icon="👨‍🏫" color="#3b82f6" loading={loading} />
          <StatCard label="Dokumen Lengkap" value={`${dokumenLengkap}/${totalGuru}`} icon="✅" color="#22c55e" loading={loading} />
          <StatCard label="Total Dokumen"   value={totalDocs}                   icon="📄"  color="#8b5cf6" loading={loading} />
        </div>

        {tab === 'dokumen' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Guru cards */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub }}>Status Dokumen Guru</div>
                <input placeholder="Cari guru..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px',
                    color: C.text, fontSize: 12, outline: 'none', width: 160 }} />
              </div>

              {loading ? [1,2,3].map(i => <div key={i} style={{ height: 68, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10 }} />) :
              filtered.length === 0 ? (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32,
                  textAlign: 'center', color: C.sub }}>{search ? 'Guru tidak ditemukan.' : 'Belum ada data guru.'}</div>
              ) : filtered.map((teacher, idx) => {
                const totalDocCount = teacher.subjects.reduce((sum,s) => sum + s.documents.length, 0)
                const maxDocs = Math.max(teacher.subjects.length * 3, 1)
                const progress = Math.min(Math.round(totalDocCount / maxDocs * 100), 100)
                const isExpanded = expandedId === teacher.username
                const barColor = getProgressColor(progress)

                return (
                  <div key={teacher.username} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                    overflow: 'hidden', marginBottom: 10 }}>
                    {/* Guru row */}
                    <div onClick={() => setExpandedId(isExpanded ? null : teacher.username)}
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                        transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(idx),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {initials(teacher.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{teacher.name}</span>
                          {(teacher.mapel || []).length > 0 && (
                            <span style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10,
                              padding: '1px 8px', fontSize: 10, fontWeight: 600, color: C.sub }}>
                              {teacher.mapel.join(', ')}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, maxWidth: 160, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: barColor, borderRadius: 4, transition: 'width .5s' }} />
                          </div>
                          <span style={{ fontSize: 11, color: barColor, fontWeight: 700 }}>{progress}%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20,
                          padding: '4px 12px', fontSize: 11, color: C.text }}>📄 {totalDocCount} Dokumen</span>
                        <span style={{ fontSize: 16, color: C.sub }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded: subjects + docs */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.15)', padding: 14 }}>
                        {teacher.subjects.length === 0 ? (
                          <div style={{ textAlign: 'center', color: C.sub, padding: 20, fontSize: 13 }}>
                            ⚠️ Belum ada mata pelajaran terdaftar.
                          </div>
                        ) : teacher.subjects.map(sub => (
                          <div key={sub.subjectId} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.sub, marginBottom: 8 }}>
                              {sub.subjectName} {sub.kelas && `· ${sub.kelas}`}
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead><tr>
                                  <th style={{ ...thStyle, fontSize: 10 }}>Nama Dokumen</th>
                                  <th style={{ ...thStyle, fontSize: 10 }}>Keterangan</th>
                                </tr></thead>
                                <tbody>
                                  {sub.documents.length > 0 ? sub.documents.map(doc => (
                                    <tr key={doc.id}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                      <td style={{ ...tdStyle, fontSize: 12 }}>
                                        <span style={{ color: '#22c55e', marginRight: 6 }}>✓</span>
                                        <span style={{ fontWeight: 600, color: '#fff' }}>{doc.name}</span>
                                      </td>
                                      <td style={{ ...tdStyle, fontSize: 12, color: C.sub }}>{doc.description || '—'}</td>
                                    </tr>
                                  )) : (
                                    <tr><td colSpan={2} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 20 }}>
                                      ⚠️ Belum ada dokumen yang diunggah.
                                    </td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {!loading && totalGuru > 0 && (
                <div style={{ fontSize: 11, color: C.sub, textAlign: 'right', marginTop: 8 }}>
                  Rata-rata kepatuhan dokumen: {avgKepatuhan}%
                </div>
              )}
            </div>

            {/* Sidebar: Jurnal terbaru */}
            <div style={{ width: 256, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginBottom: 10 }}>Aktivitas Mengajar</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(99,102,241,0.2)', borderRadius: 8, padding: '4px 8px', fontSize: 14 }}>📖</span>
                  Jurnal Terbaru
                </div>
                {loadingJurnal ? [1,2,3,4].map(i => <div key={i} style={{ height: 56, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 10 }} />) :
                jurnal.slice(0, 5).length === 0 ? (
                  <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 16 }}>Belum ada jurnal.</div>
                ) : jurnal.slice(0, 5).map((j, i) => (
                  <div key={j.id} style={{ position: 'relative', paddingLeft: 20, marginBottom: 16 }}>
                    {i < jurnal.slice(0,5).length - 1 && (
                      <div style={{ position: 'absolute', left: 7, top: 18, bottom: -16, width: 2, background: C.border }} />
                    )}
                    <div style={{ position: 'absolute', left: 0, top: 4, width: 14, height: 14, borderRadius: '50%',
                      background: '#6366f1', border: '2px solid #1a1200', boxShadow: '0 0 0 2px #6366f155' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: C.sub, fontWeight: 600 }}>🕐 {fmtDate(j.tanggal)}</span>
                      {j.kelas && <span style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6,
                        padding: '1px 6px', fontSize: 9, fontWeight: 700, color: C.sub }}>{j.kelas}</span>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{j.materi}</div>
                    <div style={{ fontSize: 10, color: C.sub }}>Oleh: <span style={{ color: C.text }}>{j.teacherName}</span></div>
                  </div>
                ))}
                <button onClick={() => setTab('jurnal')} style={{ width: '100%', marginTop: 4, padding: '8px', background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#818cf8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Lihat Semua Jurnal
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'jurnal' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.sub, marginBottom: 10 }}>Jurnal Mengajar Semua Guru</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Guru</th>
                    <th style={thStyle}>Mata Pelajaran</th>
                    <th style={thStyle}>Kelas</th>
                    <th style={thStyle}>Materi</th>
                    <th style={thStyle}>Catatan</th>
                  </tr></thead>
                  <tbody>
                    {loadingJurnal ? [1,2,3].map(i => (
                      <tr key={i}><td colSpan={6} style={tdStyle}><div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '70%' }} /></td></tr>
                    )) : jurnal.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>Belum ada jurnal.</td></tr>
                    ) : jurnal.map(j => (
                      <tr key={j.id}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, color: C.sub, whiteSpace: 'nowrap' }}>{fmtDate(j.tanggal)}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#fff' }}>{j.teacherName}</td>
                        <td style={{ ...tdStyle, color: C.sub }}>{j.subjectName || '—'}</td>
                        <td style={tdStyle}><span style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10,
                          padding: '2px 8px', fontSize: 11 }}>{j.kelas || '—'}</span></td>
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
          </div>
        )}
      </div>
    </div>
  )
}
