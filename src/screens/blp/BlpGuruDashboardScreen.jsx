/**
 * BlpGuruDashboardScreen.jsx
 * Dashboard utama guru BLP Harian — menggantikan BlpGuruRekapScreen.
 * Tabs: Daftar Siswa | Rekap Nilai | Haid Siswi
 * Styling: SEMUA inline style — tidak menggunakan Tailwind/className UI.
 */
import { useState, useEffect, useMemo } from 'react'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'
import { useAuth } from '../../AuthContext.jsx'
import { hitungSkor, isSedangHaid, AKTIVITAS_LIST } from './blpAktivitasData.js'

// ─── Warna tema ───────────────────────────────────────────────────────────────
const C = {
  pageBg:  '#0d2018',
  navBg:   '#162c1f',
  cardBg:  '#1a3028',
  rowBg:   '#1c2e24',
  border:  '#2a4535',
  muted:   '#6aaa82',
  dimText: '#4a7a5a',
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function initials(name = '') {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function scoreColor(s) {
  if (s === 0) return '#ef4444'
  if (s >= 85) return '#22c55e'
  if (s >= 70) return '#f59e0b'
  return '#ef4444'
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }).format(d)
  } catch { return dateStr }
}

function formatMonthLabel(dateStr) {
  try {
    const d = new Date(dateStr + '-01T00:00:00')
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d)
  } catch { return dateStr }
}

const STATUS_STYLE = {
  Selesai: { background: '#14532d', color: '#4ade80' },
  Proses:  { background: '#78350f', color: '#fbbf24' },
  Belum:   { background: '#7f1d1d', color: '#f87171' },
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function StatCard({ value, label, sub, iconBg, iconColor, icon }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '14px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.dimText, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
    </div>
  )
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#10b981,#0d9488)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.33,
    }}>
      {initials(name)}
    </div>
  )
}

function ActionBtn({ bg, children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
      }}
    >
      {children}
    </button>
  )
}

// ─── Tab: Daftar Siswa ────────────────────────────────────────────────────────
function DaftarSiswaTab({ students, selectedDate, onDateChange, onViewDetail, blpPeriods, search }) {
  const stats = useMemo(() => {
    const total = students.length
    const list = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    const sudah = list.filter(s => s.records?.[selectedDate]).length
    const scores = list
      .filter(s => s.records?.[selectedDate])
      .map(s => hitungSkor(s.records[selectedDate].completedActivities || [], isSedangHaid(s.haidPeriods)))
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { total, sudah, avg, belum: total - sudah }
  }, [students, selectedDate, search])

  const thisMonth = selectedDate.slice(0, 7)

  // Jumlah hari dalam periode BLP bulan ini (dari blpPeriods, cari kelas siswa pertama)
  const getPeriodTotal = (kelas) => {
    if (!blpPeriods || !kelas) return 30
    const key = `${kelas}__${thisMonth}`
    const p = blpPeriods[key]
    if (!p) return 30
    return Math.max(1, p.endDay - p.startDay + 1)
  }

  const filtered = useMemo(() => {
    return students
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => {
        const rec = s.records?.[selectedDate]
        const sedangHaid = isSedangHaid(s.haidPeriods)
        const score = rec ? hitungSkor(rec.completedActivities || [], sedangHaid) : 0
        const status = rec ? (score >= 80 ? 'Selesai' : 'Proses') : 'Belum'
        const daysFilledThisMonth = Object.keys(s.records || {}).filter(d => d.startsWith(thisMonth)).length
        const periodTotal = getPeriodTotal(s.kelas)
        return { ...s, score, status, daysFilledThisMonth, periodTotal }
      })
  }, [students, selectedDate, search, blpPeriods])

  const today = getJakartaToday()

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={stats.total}  label="Total Siswa"    sub={students[0]?.kelas || ''} iconBg="#14532d" iconColor="#4ade80" icon="👥" />
        <StatCard value={stats.sudah}  label="Sudah Isi"      sub={`${stats.total ? Math.round(stats.sudah/stats.total*100) : 0}% dari total`} iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
        <StatCard value={`${stats.avg}%`} label="Rata-rata Skor" sub={formatDateLabel(selectedDate)} iconBg="#78350f" iconColor="#fbbf24" icon="📈" />
        <StatCard value={stats.belum}  label="Belum Isi"      sub="Perlu diingatkan"  iconBg="#7f1d1d" iconColor="#f87171" icon="🔔" />
      </div>

      {/* Navigasi tanggal */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <button
          onClick={() => onDateChange(addDays(selectedDate, -1))}
          style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
        >‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{formatDateLabel(selectedDate)}</div>
          {selectedDate === today && <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>Hari ini</div>}
        </div>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          disabled={selectedDate >= today}
          style={{
            background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px',
            color: selectedDate >= today ? C.dimText : C.muted,
            cursor: selectedDate >= today ? 'default' : 'pointer', fontSize: 16, fontFamily: 'inherit',
          }}
        >›</button>
      </div>

      {/* Daftar siswa */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Daftar Siswa</div>
            <div style={{ fontSize: 11, color: C.muted }}>{filtered.length} siswa</div>
          </div>
        </div>

        {/* Column headers — hidden on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 0.7fr 0.8fr 1fr',
          padding: '8px 16px',
          borderBottom: `1px solid ${C.border}`,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          color: C.dimText, textTransform: 'uppercase',
        }}>
          <span>Nama Siswa</span>
          <span>Progres Bulan</span>
          <span style={{ textAlign: 'center' }}>Skor</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span style={{ textAlign: 'center' }}>Aksi</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.dimText, fontSize: 13 }}>
            Tidak ada siswa ditemukan.
          </div>
        )}
        {filtered.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 0.7fr 0.8fr 1fr',
              padding: '12px 16px',
              alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
              background: i % 2 === 0 ? C.cardBg : C.rowBg,
            }}
          >
            {/* Nama */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={s.name} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.kelas}</div>
              </div>
            </div>

            {/* Progres bulan */}
            <div style={{ paddingRight: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 4 }}>
                <span>{s.daysFilledThisMonth}/{s.periodTotal} hari</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: '#2a4535', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, background: '#10b981',
                  width: `${Math.min(100, (s.daysFilledThisMonth / s.periodTotal) * 100)}%`,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            {/* Skor hari ini */}
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: scoreColor(s.score) }}>
              {s.score}%
            </div>

            {/* Status */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                ...STATUS_STYLE[s.status],
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, display: 'inline-block',
              }}>
                {s.status}
              </span>
            </div>

            {/* Aksi */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              <ActionBtn bg="#1e3a5f" onClick={() => onViewDetail(s.id)} title="Lihat detail">👁</ActionBtn>
              <ActionBtn bg="#134e3a" onClick={() => {}} title="Chat">💬</ActionBtn>
              <ActionBtn bg="#14401a" onClick={() => {}} title="Kirim pengingat">✉️</ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Rekap Nilai ─────────────────────────────────────────────────────────
function RekapNilaiTab({ students, selectedDate, onDateChange, onViewDetail, search }) {
  const thisMonth = selectedDate.slice(0, 7)

  const rekapList = useMemo(() => {
    return students
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
      .map(s => {
        const sedangHaid = isSedangHaid(s.haidPeriods)
        const monthEntries = Object.entries(s.records || {}).filter(([d]) => d.startsWith(thisMonth))
        const scores = monthEntries.map(([, r]) => hitungSkor(r.completedActivities || [], sedangHaid))
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const best = scores.length ? Math.max(...scores) : 0
        return { ...s, daysCount: monthEntries.length, avgScore: avg, bestScore: best }
      })
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [students, thisMonth, search])

  const totalAvg = rekapList.length
    ? Math.round(rekapList.reduce((s, r) => s + r.avgScore, 0) / rekapList.length)
    : 0
  const aktif = rekapList.filter(r => r.daysCount > 0).length

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={rekapList.length}  label="Total Siswa"    sub={rekapList[0]?.kelas || ''} iconBg="#14532d" iconColor="#4ade80" icon="👥" />
        <StatCard value={aktif}             label="Aktif Bulan Ini" sub={`${rekapList.length ? Math.round(aktif/rekapList.length*100) : 0}% mengisi`} iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
        <StatCard value={`${totalAvg}%`}    label="Rata-rata Kelas" sub={formatMonthLabel(thisMonth)} iconBg="#78350f" iconColor="#fbbf24" icon="📊" />
        <StatCard value={rekapList.length - aktif} label="Belum Aktif" sub="Perlu perhatian" iconBg="#7f1d1d" iconColor="#f87171" icon="⚠️" />
      </div>

      {/* Navigasi bulan */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <button
          onClick={() => {
            const d = new Date(thisMonth + '-01T00:00:00')
            d.setMonth(d.getMonth() - 1)
            onDateChange(d.toISOString().slice(0, 10))
          }}
          style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
        >‹</button>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{formatMonthLabel(thisMonth)}</div>
        <button
          onClick={() => {
            const d = new Date(thisMonth + '-01T00:00:00')
            d.setMonth(d.getMonth() + 1)
            const next = d.toISOString().slice(0, 10)
            if (next.slice(0, 7) <= getJakartaToday().slice(0, 7)) onDateChange(next)
          }}
          disabled={thisMonth >= getJakartaToday().slice(0, 7)}
          style={{
            background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px',
            color: thisMonth >= getJakartaToday().slice(0, 7) ? C.dimText : C.muted,
            cursor: thisMonth >= getJakartaToday().slice(0, 7) ? 'default' : 'pointer', fontSize: 16, fontFamily: 'inherit',
          }}
        >›</button>
      </div>

      {/* Tabel rekap */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.8fr 0.8fr',
          padding: '8px 16px', borderBottom: `1px solid ${C.border}`,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.dimText, textTransform: 'uppercase',
        }}>
          <span>Nama Siswa</span>
          <span style={{ textAlign: 'center' }}>Hari Isi</span>
          <span style={{ textAlign: 'center' }}>Rata-rata</span>
          <span style={{ textAlign: 'center' }}>Terbaik</span>
          <span style={{ textAlign: 'center' }}>Detail</span>
        </div>

        {rekapList.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.dimText, fontSize: 13 }}>
            Tidak ada data bulan ini.
          </div>
        )}
        {rekapList.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.8fr 0.8fr',
              padding: '12px 16px', alignItems: 'center',
              borderBottom: i < rekapList.length - 1 ? `1px solid ${C.border}` : 'none',
              background: i % 2 === 0 ? C.cardBg : C.rowBg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={s.name} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.kelas}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: s.daysCount > 0 ? '#2dd4bf' : C.dimText }}>
              {s.daysCount}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: scoreColor(s.avgScore) }}>
              {s.avgScore}%
            </div>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: scoreColor(s.bestScore) }}>
              {s.bestScore}%
            </div>
            <div style={{ textAlign: 'center' }}>
              <ActionBtn bg="#1e3a5f" onClick={() => onViewDetail(s.id)} title="Lihat detail">👁</ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Haid Siswi ──────────────────────────────────────────────────────────
function HaidSiswiTab({ students, search }) {
  const today = getJakartaToday()

  const haidList = useMemo(() => {
    return students
      .filter(s => {
        // Tampilkan semua siswi (perempuan) — filter jenis kelamin P atau belum diset
        const isPerempuan = s.jenisKelamin === 'P' || s.jenisKelamin === 'perempuan' || !s.jenisKelamin
        if (!isPerempuan) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .map(s => {
        const sedangHaid = isSedangHaid(s.haidPeriods || [])
        const activePeriod = (s.haidPeriods || []).find(h => !h.endDate || h.endDate >= today)
        const lastPeriod = (s.haidPeriods || []).sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
        return { ...s, sedangHaid, activePeriod, lastPeriod }
      })
      .sort((a, b) => {
        // Siswi yang sedang haid muncul duluan
        if (a.sedangHaid && !b.sedangHaid) return -1
        if (!a.sedangHaid && b.sedangHaid) return 1
        return a.name.localeCompare(b.name)
      })
  }, [students, search, today])

  const sedangHaidCount = haidList.filter(s => s.sedangHaid).length

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={haidList.length} label="Total Siswi" sub="Terdaftar" iconBg="#14532d" iconColor="#4ade80" icon="👧" />
        <StatCard value={sedangHaidCount} label="Sedang Haid" sub="Saat ini" iconBg="#831843" iconColor="#f9a8d4" icon="🌸" />
        <StatCard value={haidList.length - sedangHaidCount} label="Tidak Haid" sub="Saat ini" iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
      </div>

      {/* Daftar */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Status Haid Siswi</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{haidList.length} siswi terdaftar</div>
        </div>

        {haidList.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.dimText, fontSize: 13 }}>
            Tidak ada siswi ditemukan.
          </div>
        )}
        {haidList.map((s, i) => (
          <div
            key={s.id}
            style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < haidList.length - 1 ? `1px solid ${C.border}` : 'none',
              background: s.sedangHaid ? 'rgba(236,72,153,0.05)' : (i % 2 === 0 ? C.cardBg : C.rowBg),
            }}
          >
            <Avatar name={s.name} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.kelas}</div>
              {s.activePeriod && (
                <div style={{ fontSize: 11, color: '#f9a8d4', marginTop: 2 }}>
                  🌸 Mulai: {s.activePeriod.startDate}
                  {s.activePeriod.endDate ? ` — selesai: ${s.activePeriod.endDate}` : ' (belum selesai)'}
                </div>
              )}
              {!s.sedangHaid && s.lastPeriod && (
                <div style={{ fontSize: 11, color: C.dimText, marginTop: 2 }}>
                  Terakhir: {s.lastPeriod.startDate}
                </div>
              )}
            </div>
            <div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
                background: s.sedangHaid ? 'rgba(236,72,153,0.2)' : 'rgba(16,185,129,0.15)',
                color: s.sedangHaid ? '#f9a8d4' : '#4ade80',
                border: `1px solid ${s.sedangHaid ? 'rgba(236,72,153,0.4)' : 'rgba(16,185,129,0.3)'}`,
              }}>
                {s.sedangHaid ? 'Sedang Haid' : 'Tidak Haid'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function BlpGuruDashboardScreen({ navigate, goBack, activeTab = 'daftar' }) {
  const { data, loading, error, loadDashboard } = useBlpData()
  const { user } = useAuth()
  const [tab, setTab] = useState(activeTab)
  const [selectedDate, setSelectedDate] = useState(getJakartaToday())
  const [search, setSearch] = useState('')

  useEffect(() => { loadDashboard() }, [])

  const students = useMemo(() => data ? Object.values(data.students || {}) : [], [data])
  const guru = useMemo(() => data ? Object.values(data.gurus || {})[0] : null, [data])
  const blpPeriods = useMemo(() => data?.blpPeriods || {}, [data])

  const TABS = [
    { id: 'daftar', label: 'Daftar Siswa', icon: '👥' },
    { id: 'rekap',  label: 'Rekap Nilai',  icon: '📊' },
    { id: 'haid',   label: 'Haid Siswi',   icon: '🌸' },
  ]

  function handleViewDetail(studentId) {
    navigate('blp-guru-siswa-detail', { studentId })
  }

  // Loading
  if (loading || !data) return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: '#10b981', fontSize: 14 }}>Memuat data BLP...</div>
      </div>
    </div>
  )

  // Error
  if (error) return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 24,
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</div>
      <button
        onClick={goBack}
        style={{
          background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Kembali
      </button>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg, color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{ background: C.navBg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{
          maxWidth: 1024, margin: '0 auto', padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Kiri: logo + nama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {goBack && (
              <button
                onClick={goBack}
                style={{
                  background: 'none', border: 'none', color: C.muted,
                  cursor: 'pointer', fontSize: 22, padding: '0 8px 0 0', lineHeight: 1,
                  fontFamily: 'inherit',
                }}
              >‹</button>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, color: '#fff',
            }}>B</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>BLP Harian</div>
              <div style={{ fontSize: 11, color: C.muted }}>SMP TISA Islamic School</div>
            </div>
          </div>

          {/* Kanan: avatar guru + atur periode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate('blp-guru-periode')}
              style={{
                background: 'rgba(16,185,129,0.12)', border: `1px solid rgba(16,185,129,0.3)`,
                borderRadius: 8, padding: '6px 10px', color: '#6ee7b7',
                fontFamily: 'inherit', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              }}
            >
              ⚙️ Periode
            </button>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#10b981,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0,
            }}>
              {initials(guru?.name || user?.name || '')}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px', fontSize: 13, fontWeight: 600,
                border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#1a3028' : C.muted,
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Konten ── */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '16px 16px 80px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: C.muted, pointerEvents: 'none', fontSize: 14,
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama siswa..."
            style={{
              width: '100%', background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: '10px 14px 10px 36px', color: '#fff', fontSize: 13,
              fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, padding: 2,
              }}
            >✕</button>
          )}
        </div>

        {/* Tab content */}
        {tab === 'daftar' && (
          <DaftarSiswaTab
            students={students}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onViewDetail={handleViewDetail}
            blpPeriods={blpPeriods}
            search={search}
          />
        )}
        {tab === 'rekap' && (
          <RekapNilaiTab
            students={students}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onViewDetail={handleViewDetail}
            search={search}
          />
        )}
        {tab === 'haid' && (
          <HaidSiswiTab
            students={students}
            search={search}
          />
        )}
      </div>
    </div>
  )
}
