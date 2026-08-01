import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { hitungSkor, AKTIVITAS_LIST } from './blpAktivitasData.js'

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function SkorBadge({ skor }) {
  const color = skor >= 80 ? '#10b981' : skor >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: `${color}22`, border: `1px solid ${color}55`,
      borderRadius: 10, padding: '3px 10px',
      fontSize: 12, fontWeight: 800, color,
    }}>
      {skor}%
    </div>
  )
}

export default function BlpGuruRekapScreen({ navigate, goBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('semua') // 'semua' | 'sudah' | 'belum'
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  const today = getJakartaToday()

  useEffect(() => {
    let cancelled = false
    fetch('/api/blp/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) { setError(json.error); setLoading(false); return }
        setStudents(Object.values(json.students || {}))
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError('Gagal memuat data'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>
      <button onClick={goBack} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kembali</button>
    </div>
  )

  const thisMonth = today.slice(0, 7)
  const filtered = students
    .filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'sudah') return !!s.records?.[today]
      if (filter === 'belum') return !s.records?.[today]
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const sudahCount = students.filter(s => s.records?.[today]).length
  const avgSkorBulanIni = (() => {
    const allSkors = students.flatMap(s => {
      return Object.keys(s.records || {})
        .filter(d => d.startsWith(thisMonth))
        .map(d => hitungSkor(s.records[d].completedActivities, false))
    })
    return allSkors.length ? Math.round(allSkors.reduce((a, b) => a + b, 0) / allSkors.length) : 0
  })()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Rekap Kelas" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Statistik ringkas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total Siswa', value: students.length, color: '#10b981' },
            { label: 'Sudah Isi', value: sudahCount, color: '#6366f1' },
            { label: 'Rata Bulan Ini', value: `${avgSkorBulanIni}%`, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14, padding: '12px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & filter */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama siswa..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            padding: '11px 14px', color: '#fff', fontSize: 13,
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'semua', label: 'Semua' },
            { key: 'sudah', label: '✅ Sudah' },
            { key: 'belum', label: '⏳ Belum' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flex: 1, background: filter === f.key ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filter === f.key ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, padding: '9px 4px', color: filter === f.key ? '#6ee7b7' : '#9ca3af',
                fontFamily: 'inherit', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Daftar siswa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0', fontSize: 14 }}>
              Tidak ada siswa ditemukan.
            </div>
          )}
          {filtered.map(s => {
            const todayRec = s.records?.[today]
            const todaySkor = todayRec ? hitungSkor(todayRec.completedActivities, false) : null
            const doneThisMonth = Object.keys(s.records || {}).filter(d => d.startsWith(thisMonth)).length
            const isExpanded = selectedStudent === s.id

            return (
              <div key={s.id} style={{
                background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isExpanded ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setSelectedStudent(isExpanded ? null : s.id)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'transparent', border: 'none', color: '#fff',
                    fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>
                        {doneThisMonth} hari terisi bulan ini •{' '}
                        <span style={{ color: todayRec ? '#10b981' : '#ef4444' }}>
                          {todayRec ? '✅ Sudah isi' : '⏳ Belum isi'} hari ini
                        </span>
                      </div>
                    </div>
                    {todaySkor !== null && <SkorBadge skor={todaySkor} />}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {todayRec ? (
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, marginBottom: 8 }}>
                          AKTIVITAS HARI INI
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {AKTIVITAS_LIST.map(a => {
                            const done = todayRec.completedActivities?.includes(a.id)
                            return (
                              <span key={a.id} style={{
                                fontSize: 11, padding: '4px 8px',
                                borderRadius: 8,
                                background: done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                color: done ? '#6ee7b7' : '#4b5563',
                                border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                              }}>
                                {a.emoji} {done ? '✓' : '✗'}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ paddingTop: 12, fontSize: 13, color: '#6b7280' }}>
                        Siswa belum mengisi aktivitas hari ini.
                      </div>
                    )}
                    <button
                      onClick={() => navigate('blp-guru-siswa-detail', { studentId: s.id })}
                      style={{
                        marginTop: 12, width: '100%',
                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 10, padding: '10px', color: '#6ee7b7',
                        fontFamily: 'inherit', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      }}
                    >
                      📊 Lihat Detail Lengkap →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
