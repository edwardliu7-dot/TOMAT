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

const STATUS_COLORS = {
  hadir: '#22c55e',
  sakit: '#f59e0b',
  izin:  '#3b82f6',
  alpha: '#ef4444',
}

const JENIS_COLORS = {
  UH: '#f59e0b',
  UTS: '#3b82f6',
  UAS: '#8b5cf6',
  tugas: '#22c55e',
  praktik: '#f472b6',
}

export default function Eob5DetailSiswaScreen({ navigate, goBack, siswaId }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('absensi')  // 'absensi' | 'nilai'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  }

  useEffect(() => {
    if (!siswaId) { setError('ID siswa tidak tersedia'); setLoading(false); return }
    setLoading(true)
    fetch(`/api/eob5/rekap/siswa/${siswaId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat data siswa'); setLoading(false) })
  }, [siswaId])

  const absensiStat = data?.absensi || {}
  const totalHadir = parseInt(absensiStat.hadir) || 0
  const totalSakit = parseInt(absensiStat.sakit) || 0
  const totalIzin  = parseInt(absensiStat.izin) || 0
  const totalAlpha = parseInt(absensiStat.alpha) || 0
  const totalCatat = parseInt(absensiStat.total) || 0
  const pctHadir   = totalCatat > 0 ? Math.round((totalHadir / totalCatat) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: COLOR.bg, fontFamily: 'system-ui, sans-serif', color: COLOR.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${COLOR.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: COLOR.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1.5 }}>EOB5</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Detail Siswa</div>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 60 }}>Memuat data…</div>}
      {error && (
        <div style={{ margin: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 12, padding: '14px 16px', color: '#f87171' }}>
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Student Card */}
          <div style={{ margin: '16px 16px 0', background: COLOR.primaryDim, border: `1px solid ${COLOR.border}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg,#f59e0b,#d97706)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#1a0a00', flexShrink: 0,
            }}>
              {data.siswa?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{data.siswa?.name}</div>
              <div style={{ fontSize: 12, color: COLOR.textSub, marginTop: 2 }}>{data.siswa?.kelas} · {data.siswa?.id}</div>
            </div>
          </div>

          {/* Kehadiran summary */}
          <div style={{ margin: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { label: 'Hadir', val: totalHadir, color: STATUS_COLORS.hadir },
              { label: 'Sakit', val: totalSakit, color: STATUS_COLORS.sakit },
              { label: 'Izin',  val: totalIzin,  color: STATUS_COLORS.izin  },
              { label: 'Alpha', val: totalAlpha, color: STATUS_COLORS.alpha },
            ].map(s => (
              <div key={s.label} style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: s.color, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Kehadiran % bar */}
          {totalCatat > 0 && (
            <div style={{ margin: '0 16px 8px', background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: COLOR.textSub }}>Persentase Kehadiran</span>
                <span style={{ fontWeight: 800, color: pctHadir >= 80 ? '#4ade80' : pctHadir >= 60 ? '#fbbf24' : '#f87171' }}>{pctHadir}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctHadir}%`, background: pctHadir >= 80 ? '#22c55e' : pctHadir >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 8, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: COLOR.textSub, marginTop: 6 }}>{totalHadir} dari {totalCatat} pertemuan tercatat</div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${COLOR.border}`, background: 'rgba(0,0,0,0.15)', margin: '8px 0 0' }}>
            {[['absensi','📋 Riwayat Absensi'],['nilai','📊 Nilai Akademik']].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex: 1, padding: '12px 8px', background: 'none', border: 'none',
                borderBottom: tab === k ? `2px solid ${COLOR.primary}` : '2px solid transparent',
                color: tab === k ? COLOR.primary : COLOR.textSub,
                fontWeight: tab === k ? 700 : 500, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: 16 }}>
            {tab === 'absensi' && (
              <>
                {(!data.nilai || data.nilai.length === 0) && (
                  <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 40 }}>
                    Belum ada riwayat absensi tercatat.
                  </div>
                )}
                {/* Note: riwayat per-tanggal needs separate endpoint; show summary here */}
                <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, color: COLOR.textSub, marginBottom: 10, fontWeight: 600 }}>Ringkasan Kehadiran</div>
                  {[
                    { label: 'Total Hadir', val: totalHadir, color: STATUS_COLORS.hadir },
                    { label: 'Total Sakit', val: totalSakit, color: STATUS_COLORS.sakit },
                    { label: 'Total Izin',  val: totalIzin,  color: STATUS_COLORS.izin  },
                    { label: 'Total Alpha', val: totalAlpha, color: STATUS_COLORS.alpha },
                    { label: 'Total Pertemuan', val: totalCatat, color: COLOR.primary },
                    { label: 'Persentase Hadir', val: `${pctHadir}%`, color: pctHadir >= 80 ? '#4ade80' : '#f87171' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 13, color: COLOR.text }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'nilai' && (
              <>
                {(!data.nilai || data.nilai.length === 0) && (
                  <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 40 }}>
                    Belum ada data nilai akademik untuk siswa ini.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(data.nilai || []).map((n, i) => {
                    const jenisColor = JENIS_COLORS[n.jenis_nilai] || COLOR.primary
                    return (
                      <div key={i} style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{n.mata_pelajaran}</div>
                            <div style={{ fontSize: 11, color: COLOR.textSub, marginTop: 2 }}>
                              {n.semester ? `Sem ${n.semester}` : ''}
                              {n.tahun_ajaran ? ` · ${n.tahun_ajaran}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <span style={{ background: `${jenisColor}22`, color: jenisColor, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                              {n.jenis_nilai}
                            </span>
                            <span style={{
                              fontSize: 20, fontWeight: 900,
                              color: parseFloat(n.nilai) >= 75 ? '#4ade80' : parseFloat(n.nilai) >= 60 ? '#fbbf24' : '#f87171',
                            }}>
                              {n.nilai != null ? parseFloat(n.nilai).toFixed(0) : '—'}
                            </span>
                          </div>
                        </div>
                        {n.keterangan && <div style={{ fontSize: 11, color: COLOR.textSub, lineHeight: 1.4 }}>{n.keterangan}</div>}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
