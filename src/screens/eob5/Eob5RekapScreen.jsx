/**
 * Eob5RekapScreen.jsx
 * Rekap Analitik: Absensi (chart) + Nilai + Kesiswaan dengan filter kelas.
 * API: /api/eob5/rekap/absensi-chart, /api/eob5/rekap/nilai-chart, /api/eob5/kesiswaan/overview
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)',
}

// ── CSV helper ────────────────────────────────────────────────────────────────
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => (String(c).includes(',') ? `"${String(c).replace(/"/g,'""')}"` : c)).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Simple stacked SVG bar chart ──────────────────────────────────────────────
function AbsensiBarChart({ data }) {
  if (!data.length) return null
  const barW  = 38
  const gap   = 12
  const padL  = 36
  const padB  = 28
  const H     = 180
  const W     = padL + data.length * (barW + gap) + gap
  const max   = Math.max(...data.map(d => d.hadir + d.izin + d.sakit + d.alpa), 1)

  const ticks = [0, Math.round(max * 0.5), max]

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(W, 240)} height={H + padB} style={{ display: 'block' }}>
        {/* Y axis ticks */}
        {ticks.map(v => {
          const y = H - Math.round((v / max) * (H - 10)) - 5
          return (
            <g key={v}>
              <line x1={padL - 4} y1={y} x2={W} y2={y} stroke="rgba(245,158,11,0.1)" strokeDasharray="4 4" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#92400e">{v}</text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + i * (barW + gap) + gap / 2
          const scale = (H - 15) / max
          const hadirH = Math.max(d.hadir  * scale, d.hadir  > 0 ? 2 : 0)
          const izinH  = Math.max(d.izin   * scale, d.izin   > 0 ? 2 : 0)
          const sakitH = Math.max(d.sakit  * scale, d.sakit  > 0 ? 2 : 0)
          const alpaH  = Math.max(d.alpa   * scale, d.alpa   > 0 ? 2 : 0)
          let y = H - 5

          return (
            <g key={i}>
              {hadirH > 0 && (
                <rect x={x} y={y - hadirH} width={barW} height={hadirH} fill="#22c55e" />
              )}
              {izinH > 0 && (
                <rect x={x} y={y - hadirH - izinH} width={barW} height={izinH} fill="#3b82f6" />
              )}
              {sakitH > 0 && (
                <rect x={x} y={y - hadirH - izinH - sakitH} width={barW} height={sakitH} fill="#f59e0b" />
              )}
              {alpaH > 0 && (
                <rect x={x} y={y - hadirH - izinH - sakitH - alpaH} width={barW} height={alpaH}
                  fill="#ef4444" rx={2} ry={2} />
              )}
              <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize={9} fill="#92400e">{d.label}</text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
        {[['#22c55e','Hadir'],['#3b82f6','Izin'],['#f59e0b','Sakit'],['#ef4444','Alpa']].map(([col,lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
            <span style={{ fontSize: 11, color: C.sub }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mini bar chart for nilai distribution ─────────────────────────────────────
function NilaiMiniChart({ distribusi }) {
  if (!distribusi?.length) return null
  const max = Math.max(...distribusi.map(d => d.jumlah), 1)
  const H = 60, barW = 20, gap = 6
  const W = distribusi.length * (barW + gap)

  return (
    <svg width={W} height={H + 16} style={{ display: 'block' }}>
      {distribusi.map((d, i) => {
        const h = Math.max(Math.round((d.jumlah / max) * (H - 4)), d.jumlah > 0 ? 3 : 0)
        return (
          <g key={i}>
            <rect x={i * (barW + gap)} y={H - h} width={barW} height={h}
              fill={C.primary} rx={2} ry={2} fillOpacity={0.8} />
            <text x={i * (barW + gap) + barW / 2} y={H + 13} textAnchor="middle" fontSize={8} fill="#92400e">
              {d.range}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = C.primary }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 36, flexShrink: 0 }}>{pct}%</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct,100)}%`, background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

// ── Absensi Tab ───────────────────────────────────────────────────────────────
function AbsensiTab() {
  const [absensi, setAbsensi] = useState(null)
  const [kesiswaan, setKesiswaan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedKelas, setSelectedKelas] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/eob5/rekap/absensi-chart', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/eob5/kesiswaan/overview', { credentials: 'include' }).then(r => r.json()),
    ]).then(([a, k]) => {
      setAbsensi(a)
      setKesiswaan(k)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const kelasOptions = absensi?.kelasOptions || []

  const chartData = useMemo(() => {
    if (!absensi?.data) return []
    const filtered = selectedKelas === 'all' ? absensi.data : absensi.data.filter(d => d.kelas === selectedKelas)
    const byMonth = {}
    for (const r of filtered) {
      if (!byMonth[r.bulan]) byMonth[r.bulan] = { bulan: r.bulan, label: fmtMonth(r.bulan), hadir: 0, izin: 0, sakit: 0, alpa: 0 }
      byMonth[r.bulan].hadir += r.hadir
      byMonth[r.bulan].izin  += r.izin
      byMonth[r.bulan].sakit += r.sakit
      byMonth[r.bulan].alpa  += r.alpa
    }
    return Object.values(byMonth).sort((a,b) => a.bulan.localeCompare(b.bulan))
  }, [absensi, selectedKelas])

  const totals = useMemo(() => chartData.reduce((acc,d) => ({
    hadir: acc.hadir + d.hadir,
    izin:  acc.izin  + d.izin,
    sakit: acc.sakit + d.sakit,
    alpa:  acc.alpa  + d.alpa,
  }), { hadir: 0, izin: 0, sakit: 0, alpa: 0 }), [chartData])

  const kelasTerbaik = useMemo(() => {
    if (!absensi?.data) return []
    const byKelas = {}
    for (const r of absensi.data) {
      if (!byKelas[r.kelas]) byKelas[r.kelas] = { kelas: r.kelas, hadir: 0, total: 0 }
      byKelas[r.kelas].hadir += r.hadir
      byKelas[r.kelas].total += r.hadir + r.izin + r.sakit + r.alpa
    }
    return Object.values(byKelas)
      .map(k => ({ ...k, pctHadir: k.total > 0 ? Math.round(k.hadir/k.total*100) : 0 }))
      .sort((a,b) => b.pctHadir - a.pctHadir).slice(0, 5)
  }, [absensi])

  function handleExport() {
    const filtered = selectedKelas === 'all' ? (absensi?.data||[]) : (absensi?.data||[]).filter(d => d.kelas === selectedKelas)
    downloadCSV(`rekap-absensi-${selectedKelas === 'all' ? 'semua' : selectedKelas}.csv`,
      [['Bulan','Kelas','Hadir','Izin','Sakit','Alpa'], ...filtered.map(r => [r.bulan,r.kelas,r.hadir,r.izin,r.sakit,r.alpa])])
  }

  const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', padding: 18, flex: 1, minWidth: 100 }

  if (loading) return <div style={{ height: 300, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>Memuat data…</div>
  if (!absensi) return <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Gagal memuat data absensi.</div>

  return (
    <div>
      {/* Filter + Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Filter Kelas:</span>
        <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
          style={{ background: '#1f1300', border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '6px 14px', color: C.text, fontSize: 12, outline: 'none' }}>
          <option value="all">Semua Kelas</option>
          {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        {chartData.length > 0 && (
          <button onClick={handleExport} style={{ marginLeft: 'auto', background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '6px 14px', color: C.text, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            📥 Ekspor CSV
          </button>
        )}
      </div>

      {/* Chart Card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>Tren Absensi Bulanan</div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>
          {selectedKelas === 'all' ? 'Agregasi kehadiran seluruh kelas.' : `Kehadiran kelas ${selectedKelas}.`}
        </div>
        {chartData.length === 0
          ? <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>📊 Belum ada data absensi</div>
          : <AbsensiBarChart data={chartData} />}
      </div>

      {/* Summary cards */}
      {chartData.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {[['✅','Hadir',totals.hadir,'#22c55e'],['ℹ️','Izin',totals.izin,'#3b82f6'],['⚠️','Sakit',totals.sakit,'#f59e0b'],['❌','Alpa',totals.alpa,'#ef4444']].map(([ic,lb,v,col]) => (
            <div key={lb} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 28 }}>{ic}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{lb}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: col }} />
            </div>
          ))}
        </div>
      )}

      {/* Kelas Terbaik + Siswa Perlu Perhatian */}
      {(kelasTerbaik.length > 0 || (kesiswaan?.siswaPoinTerbanyak?.length > 0)) && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {kelasTerbaik.length > 0 && (
            <div style={{ flex: 1, minWidth: 220, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(34,197,94,0.2)', borderRadius: 8, padding: '4px 8px', fontSize: 14 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Kelas Terbaik</div>
                  <div style={{ fontSize: 11, color: C.sub }}>Berdasarkan persentase kehadiran</div>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                {kelasTerbaik.map((k, i) => {
                  const col = k.pctHadir >= 85 ? '#22c55e' : k.pctHadir >= 70 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={k.kelas} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, width: 16 }}>{i+1}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{k.kelas}</span>
                          <span style={{ fontSize: 10, color: C.sub }}>{k.total} sesi</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{k.pctHadir}%</span>
                      </div>
                      <div style={{ marginLeft: 24, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${k.pctHadir}%`, background: col, borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {(kesiswaan?.siswaPoinTerbanyak?.length > 0) && (
            <div style={{ flex: 1, minWidth: 220, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(245,158,11,0.2)', borderRadius: 8, padding: '4px 8px', fontSize: 14 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Siswa Perlu Perhatian</div>
                  <div style={{ fontSize: 11, color: C.sub }}>Poin pelanggaran terbanyak</div>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                {kesiswaan.siswaPoinTerbanyak.slice(0,5).map((s,i) => (
                  <div key={s.studentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, width: 16 }}>{i+1}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>{s.namaLengkap}</div>
                        <div style={{ fontSize: 10, color: C.sub }}>{s.kelas}</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>−{s.totalPoin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Nilai Tab ─────────────────────────────────────────────────────────────────
function NilaiTab() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedKelas, setSelectedKelas] = useState('all')

  useEffect(() => {
    fetch('/api/eob5/rekap/nilai-chart', { credentials: 'include' })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const kelasOptions = data?.kelasOptions || []
  const filtered = useMemo(() => {
    if (!data?.subjects) return []
    if (selectedKelas === 'all') return data.subjects
    return data.subjects.filter(s => s.kelas === selectedKelas)
  }, [data, selectedKelas])

  function handleExport() {
    downloadCSV(`rekap-nilai-${selectedKelas === 'all' ? 'semua' : selectedKelas}.csv`,
      [['Mata Pelajaran','Kelas','Rata-rata','Min','Max','Jumlah'],
       ...filtered.map(s => [s.subjectName, s.kelas, s.rataRata ?? '-', s.nilaiMin ?? '-', s.nilaiMax ?? '-', s.jumlahNilai])])
  }

  if (loading) return <div style={{ height: 250, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>Memuat data…</div>
  if (!data)   return <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Gagal memuat data nilai.</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Filter Kelas:</span>
        <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
          style={{ background: '#1f1300', border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '6px 14px', color: C.text, fontSize: 12, outline: 'none' }}>
          <option value="all">Semua Kelas</option>
          {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        {filtered.length > 0 && (
          <button onClick={handleExport} style={{ marginLeft: 'auto', background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '6px 14px', color: C.text, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            📥 Ekspor CSV
          </button>
        )}
      </div>

      {filtered.length === 0
        ? <div style={{ textAlign: 'center', padding: 48, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, color: C.sub }}>
            📊 Belum ada data nilai untuk kelas ini.
          </div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filtered.map((sub, idx) => {
              const rata = sub.rataRata ?? 0
              const col = rata >= 75 ? '#22c55e' : rata >= 60 ? '#f59e0b' : '#ef4444'
              return (
                <div key={`${sub.subjectId}-${idx}`} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', flex: 1 }}>{sub.subjectName}</div>
                    <span style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10,
                      padding: '2px 10px', fontSize: 11, fontWeight: 700, color: C.sub, flexShrink: 0 }}>{sub.kelas}</span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    {sub.jumlahNilai === 0
                      ? <div style={{ textAlign: 'center', color: C.sub, padding: 20, fontSize: 13 }}>Belum ada nilai</div>
                      : <>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.sub, marginBottom: 4 }}>Rata-rata</div>
                              <div style={{ fontSize: 36, fontWeight: 900, color: col, lineHeight: 1 }}>{rata.toFixed(1)}</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12 }}>
                              <div style={{ color: C.sub, marginBottom: 4 }}>Min / Max</div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>{sub.nilaiMin} / {sub.nilaiMax}</div>
                              <div style={{ color: C.sub, marginTop: 4 }}>Total Nilai</div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>{sub.jumlahNilai}</div>
                            </div>
                          </div>
                          <NilaiMiniChart distribusi={sub.distribusi} />
                        </>}
                  </div>
                </div>
              )
            })}
          </div>}
    </div>
  )
}

// ── Kesiswaan Tab ─────────────────────────────────────────────────────────────
function KesiswaanTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/eob5/kesiswaan/overview', { credentials: 'include' })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const perKelas = useMemo(() => {
    if (!data?.perKelas?.length) return []
    return data.perKelas.map(k => {
      const tot = k.hadir + k.izin + k.sakit + k.alpa
      const pctHadir = tot > 0 ? Math.round(k.hadir/tot*100) : 0
      const status = pctHadir >= 93 && k.totalPoinNegatif <= 50 ? 'Baik'
        : (pctHadir < 85 || k.totalPoinNegatif > 100) ? 'Kritis' : 'Perhatian'
      return { ...k, pctHadir, status }
    }).sort((a,b) => a.kelas.localeCompare(b.kelas,'id'))
  }, [data])

  const thStyle = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 1, color: C.sub, borderBottom: `1px solid ${C.border}`, textAlign: 'left',
    background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '10px 14px', fontSize: 13, color: C.text, borderBottom: `1px solid rgba(245,158,11,0.08)` }

  const statusStyle = { Baik: '#22c55e', Perhatian: '#f59e0b', Kritis: '#ef4444' }

  if (loading) return <div style={{ height: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>Memuat data…</div>

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 13, color: '#fff' }}>Ringkasan Per Kelas</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>Kelas</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Siswa</th>
              <th style={{ ...thStyle, minWidth: 120 }}>Kehadiran</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Poin −</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
            </tr></thead>
            <tbody>
              {perKelas.length === 0
                ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: C.sub, padding: 32 }}>Belum ada data siswa.</td></tr>
                : perKelas.map((k, i) => {
                    const col = statusStyle[k.status] || C.sub
                    return (
                      <tr key={i}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, fontWeight: 800, color: '#fff' }}>{k.kelas}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{k.totalSiswa}</td>
                        <td style={tdStyle}>
                          <ProgressBar pct={k.pctHadir} color={k.pctHadir >= 85 ? '#22c55e' : k.pctHadir >= 70 ? '#f59e0b' : '#ef4444'} />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: k.totalPoinNegatif > 100 ? '#ef4444' : C.text }}>
                          {k.totalPoinNegatif > 0 ? k.totalPoinNegatif : <span style={{ color: C.sub }}>—</span>}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ background: `${col}22`, color: col, border: `1px solid ${col}44`,
                            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{k.status}</span>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            🚨 Perlu Perhatian Khusus
          </div>
          <div style={{ padding: 10 }}>
            {(data?.siswaPoinTerbanyak || []).slice(0,5).length === 0
              ? <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 12 }}>Belum ada catatan.</div>
              : (data?.siswaPoinTerbanyak || []).slice(0,5).map((s,i) => (
                  <div key={s.studentId||i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.namaLengkap}</div>
                      <div style={{ fontSize: 10, color: C.sub }}>{s.kelas}</div>
                    </div>
                    <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 20,
                      padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{s.totalPoin}</span>
                  </div>
                ))}
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            ⭐ Kehadiran Kelas Terbaik
          </div>
          <div style={{ padding: 10 }}>
            {[...perKelas].sort((a,b) => b.pctHadir - a.pctHadir).slice(0,5).length === 0
              ? <div style={{ fontSize: 12, color: C.sub, textAlign: 'center', padding: 12 }}>Belum ada data.</div>
              : [...perKelas].sort((a,b) => b.pctHadir - a.pctHadir).slice(0,5).map((k,i) => (
                  <div key={k.kelas} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.sub, width: 14 }}>{i+1}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{k.kelas}</div>
                        <div style={{ fontSize: 10, color: C.sub }}>{k.totalSiswa} siswa</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', borderRadius: 20,
                      padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{k.pctHadir}%</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────
function fmtMonth(yyyyMM) {
  if (!yyyyMM) return ''
  const [y,m] = yyyyMM.split('-')
  try { return new Date(parseInt(y), parseInt(m)-1, 1).toLocaleString('id-ID', { month: 'short' }) }
  catch { return yyyyMM }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Eob5RekapScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('absensi')

  if (user?.role !== 'guru') return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Rekap & Analitik</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['absensi','📋 Absensi'],['nilai','📊 Nilai'],['kesiswaan','👥 Kesiswaan']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '8px 18px', borderRadius: 20, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: tab === k ? C.primary : C.white, color: tab === k ? '#1a1200' : C.text,
            }}>{l}</button>
          ))}
        </div>

        {tab === 'absensi'  && <AbsensiTab />}
        {tab === 'nilai'    && <NilaiTab />}
        {tab === 'kesiswaan' && <KesiswaanTab />}
      </div>
    </div>
  )
}
