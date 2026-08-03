/**
 * BlpGuruDashboardScreen.jsx
 * Dashboard utama guru BLP Harian.
 * Views: list | detail | recap | haid
 * Scoring: getEffectiveCompletedCount (school-day + haid-aware)
 * Modals: GuruReviewSubmissionModal, ConfirmModal, BlpPeriodModal, ProfileModal
 */
import { useState, useEffect, useMemo, useRef } from 'react'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'
import { useAuth } from '../../AuthContext.jsx'
import {
  BLP_CATEGORIES, PERLENGKAPAN_SEKOLAH_ITEMS, QURAN_ACTIVITY_ID,
  isSedangHaid,
} from './blpAktivitasData.js'
import {
  getEffectiveTotalActivities, getEffectiveCompletedCount,
  isDateCountedForRecap, isHaidDay, getBlpPeriodKeyForDate,
} from './utils/blpScoring.js'
import { downloadRekapPDF, downloadRekapExcel } from './utils/rekapExport.js'
import GuruReviewSubmissionModal from './modals/GuruReviewSubmissionModal.jsx'
import ConfirmModal from './modals/ConfirmModal.jsx'
import BlpPeriodModal from './modals/BlpPeriodModal.jsx'
import ProfileModal from './modals/ProfileModal.jsx'

// ─── Tema warna ────────────────────────────────────────────────────────────────
const C = {
  pageBg:  '#0d2018',
  navBg:   '#162c1f',
  cardBg:  '#1a3028',
  rowBg:   '#1c2e24',
  border:  '#2a4535',
  muted:   '#6aaa82',
  dimText: '#4a7a5a',
}

// ─── Photo cache (module-level, session) ──────────────────────────────────────
const _photoCache   = new Map()
const _photoInflight = new Map()

function fetchStudentPhoto(studentId) {
  if (_photoCache.has(studentId)) return Promise.resolve(_photoCache.get(studentId))
  if (_photoInflight.has(studentId)) return _photoInflight.get(studentId)
  const p = fetch(`/api/blp/students/${studentId}/photo`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : { photoUrl: null })
    .then(data => {
      const url = data.photoUrl || null
      _photoCache.set(studentId, url)
      _photoInflight.delete(studentId)
      return url
    })
    .catch(() => {
      _photoCache.set(studentId, null)
      _photoInflight.delete(studentId)
      return null
    })
  _photoInflight.set(studentId, p)
  return p
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function initials(name = '') {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function scoreColor(s) {
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
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(dateStr + 'T00:00:00'))
  } catch { return dateStr }
}

function formatMonthLabel(yyyymm) {
  try {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
      .format(new Date(yyyymm + '-01T00:00:00'))
  } catch { return yyyymm }
}

// Skor per-hari dengan school-day + haid awareness
function getDaySkor(student, dateStr, blpPeriods) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  if (!isDateCountedForRecap(dateObj, student.kelas, blpPeriods)) return null
  const record = student.records?.[dateStr]
  if (!record) return 0
  const total = getEffectiveTotalActivities(dateObj, student.haidPeriods || [])
  const done  = getEffectiveCompletedCount(dateObj, record.completedActivities || [], student.haidPeriods || [])
  return total > 0 ? Math.round((done / total) * 100) : 0
}

// ─── Sub-komponen umum ────────────────────────────────────────────────────────
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

function Avatar({ name, studentId, size = 36 }) {
  const [photoUrl, setPhotoUrl] = useState(() =>
    studentId && _photoCache.has(studentId) ? _photoCache.get(studentId) : null
  )
  useEffect(() => {
    if (!studentId) return
    if (_photoCache.has(studentId)) { setPhotoUrl(_photoCache.get(studentId)); return }
    let cancelled = false
    fetchStudentPhoto(studentId).then(url => { if (!cancelled) setPhotoUrl(url) })
    return () => { cancelled = true }
  }, [studentId])

  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
      }} />
    )
  }
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

const STATUS_STYLE = {
  Selesai: { background: '#14532d', color: '#4ade80' },
  Proses:  { background: '#78350f', color: '#fbbf24' },
  Belum:   { background: '#7f1d1d', color: '#f87171' },
}

// ─── View: Daftar Siswa ───────────────────────────────────────────────────────
function ViewList({ students, selectedDate, onDateChange, onViewDetail, blpPeriods, search }) {
  const today = getJakartaToday()
  const thisMonth = selectedDate.slice(0, 7)

  const filtered = useMemo(() => {
    return students
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => {
        const dateObj = new Date(selectedDate + 'T00:00:00')
        const rec     = s.records?.[selectedDate]
        const total   = getEffectiveTotalActivities(dateObj, s.haidPeriods || [])
        const done    = rec ? getEffectiveCompletedCount(dateObj, rec.completedActivities || [], s.haidPeriods || []) : 0
        const score   = total > 0 ? Math.round((done / total) * 100) : 0
        const status  = rec ? (score >= 80 ? 'Selesai' : 'Proses') : 'Belum'

        // Progress bulan: hari yang sudah diisi dalam periode aktif
        const daysInPeriod = Object.keys(s.records || {})
          .filter(d => {
            if (!d.startsWith(thisMonth)) return false
            const dObj = new Date(d + 'T00:00:00')
            return isDateCountedForRecap(dObj, s.kelas, blpPeriods)
          }).length

        // Total hari aktif dalam periode
        const [yr, mo] = thisMonth.split('-').map(Number)
        const pKey  = `${s.kelas}__${thisMonth}`
        const p     = blpPeriods?.[pKey]
        const periodTotal = p ? Math.max(1, p.endDay - p.startDay + 1) : new Date(yr, mo, 0).getDate()

        return { ...s, score, status, daysInPeriod, periodTotal }
      })
  }, [students, selectedDate, search, blpPeriods, thisMonth])

  const stats = useMemo(() => {
    const sudah  = filtered.filter(s => s.records?.[selectedDate]).length
    const scores = filtered.filter(s => s.records?.[selectedDate]).map(s => s.score)
    const avg    = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { total: filtered.length, sudah, avg, belum: filtered.length - sudah }
  }, [filtered, selectedDate])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={stats.total}     label="Total Siswa"    sub={students[0]?.kelas || ''}  iconBg="#14532d" iconColor="#4ade80" icon="👥" />
        <StatCard value={stats.sudah}     label="Sudah Isi"      sub={`${stats.total ? Math.round(stats.sudah/stats.total*100) : 0}% dari total`} iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
        <StatCard value={`${stats.avg}%`} label="Rata-rata Skor" sub={formatDateLabel(selectedDate)} iconBg="#78350f" iconColor="#fbbf24" icon="📈" />
        <StatCard value={stats.belum}     label="Belum Isi"      sub="Perlu diingatkan" iconBg="#7f1d1d" iconColor="#f87171" icon="🔔" />
      </div>

      {/* Navigasi tanggal */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
      }}>
        <button onClick={() => onDateChange(addDays(selectedDate, -1))}
          style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{formatDateLabel(selectedDate)}</div>
          {selectedDate === today && <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>Hari ini</div>}
        </div>
        <button onClick={() => onDateChange(addDays(selectedDate, 1))} disabled={selectedDate >= today}
          style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px',
            color: selectedDate >= today ? C.dimText : C.muted,
            cursor: selectedDate >= today ? 'default' : 'pointer', fontSize: 16, fontFamily: 'inherit' }}>›</button>
      </div>

      {/* Tabel siswa */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Daftar Siswa</div>
            <div style={{ fontSize: 11, color: C.muted }}>{filtered.length} siswa</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.7fr 0.8fr 0.6fr', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.dimText, textTransform: 'uppercase' }}>
          <span>Nama Siswa</span><span>Progres Bulan</span>
          <span style={{ textAlign: 'center' }}>Skor</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span style={{ textAlign: 'center' }}>Detail</span>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.dimText, fontSize: 13 }}>Tidak ada siswa.</div>
        )}
        {filtered.map((s, i) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.7fr 0.8fr 0.6fr', padding: '12px 16px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', background: i % 2 === 0 ? C.cardBg : C.rowBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={s.name} studentId={s.id} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.kelas}</div>
              </div>
            </div>
            <div style={{ paddingRight: 12 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.daysInPeriod}/{s.periodTotal} hari</div>
              <div style={{ height: 6, borderRadius: 4, background: '#2a4535', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: '#10b981', width: `${Math.min(100, (s.daysInPeriod / s.periodTotal) * 100)}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: scoreColor(s.score) }}>{s.score}%</div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ ...STATUS_STYLE[s.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>{s.status}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => onViewDetail(s.id)} title="Lihat detail" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e3a5f', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👁</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── View: Rekap Nilai ────────────────────────────────────────────────────────
function ViewRecap({ students, selectedMonth, onMonthChange, onViewDetail, blpPeriods, search }) {
  const rekapList = useMemo(() => {
    return students
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
      .map(s => {
        const monthEntries = Object.entries(s.records || {}).filter(([d]) => d.startsWith(selectedMonth))
        const scores = monthEntries.map(([dateStr]) => getDaySkor(s, dateStr, blpPeriods) ?? 0)
        const avg    = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const best   = scores.length ? Math.max(...scores) : 0
        return { ...s, daysCount: monthEntries.length, avgScore: avg, bestScore: best }
      })
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [students, selectedMonth, search, blpPeriods])

  const today     = getJakartaToday()
  const totalAvg  = rekapList.length ? Math.round(rekapList.reduce((s, r) => s + r.avgScore, 0) / rekapList.length) : 0
  const aktif     = rekapList.filter(r => r.daysCount > 0).length

  function prevMonth() {
    const d = new Date(selectedMonth + '-01T00:00:00')
    d.setMonth(d.getMonth() - 1)
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  function nextMonth() {
    const d = new Date(selectedMonth + '-01T00:00:00')
    d.setMonth(d.getMonth() + 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (next <= today.slice(0, 7)) onMonthChange(next)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={rekapList.length}         label="Total Siswa"     sub={rekapList[0]?.kelas || ''} iconBg="#14532d" iconColor="#4ade80" icon="👥" />
        <StatCard value={aktif}                    label="Aktif Bulan Ini" sub={`${rekapList.length ? Math.round(aktif/rekapList.length*100) : 0}% mengisi`} iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
        <StatCard value={`${totalAvg}%`}           label="Rata-rata Kelas" sub={formatMonthLabel(selectedMonth)} iconBg="#78350f" iconColor="#fbbf24" icon="📊" />
        <StatCard value={rekapList.length - aktif} label="Belum Aktif"    sub="Perlu perhatian" iconBg="#7f1d1d" iconColor="#f87171" icon="⚠️" />
      </div>

      {/* Nav bulan */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{formatMonthLabel(selectedMonth)}</div>
        <button onClick={nextMonth} disabled={selectedMonth >= today.slice(0, 7)} style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: selectedMonth >= today.slice(0, 7) ? C.dimText : C.muted, cursor: selectedMonth >= today.slice(0, 7) ? 'default' : 'pointer', fontSize: 16, fontFamily: 'inherit' }}>›</button>
      </div>

      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.8fr 0.5fr', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.dimText, textTransform: 'uppercase' }}>
          <span>Nama Siswa</span>
          <span style={{ textAlign: 'center' }}>Hari Isi</span>
          <span style={{ textAlign: 'center' }}>Rata-rata</span>
          <span style={{ textAlign: 'center' }}>Terbaik</span>
          <span style={{ textAlign: 'center' }}>Detail</span>
        </div>
        {rekapList.map((s, i) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.8fr 0.5fr', padding: '12px 16px', alignItems: 'center', borderBottom: i < rekapList.length - 1 ? `1px solid ${C.border}` : 'none', background: i % 2 === 0 ? C.cardBg : C.rowBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={s.name} studentId={s.id} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.kelas}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: s.daysCount > 0 ? '#2dd4bf' : C.dimText }}>{s.daysCount}</div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: scoreColor(s.avgScore) }}>{s.avgScore}%</div>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: scoreColor(s.bestScore) }}>{s.bestScore}%</div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => onViewDetail(s.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e3a5f', fontSize: 13 }}>👁</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── View: Haid Siswi ─────────────────────────────────────────────────────────
function ViewHaid({ students, search }) {
  const today = getJakartaToday()
  const haidList = useMemo(() => {
    return students
      .filter(s => {
        const isPerempuan = s.jenisKelamin === 'P' || s.jenisKelamin === 'perempuan' || !s.jenisKelamin
        if (!isPerempuan) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .map(s => {
        const todayDate   = new Date(today + 'T00:00:00')
        const sedangHaid  = isHaidDay(todayDate, s.haidPeriods || [])
        const activePeriod = (s.haidPeriods || []).find(h => !h.endDate)
        const lastPeriod  = (s.haidPeriods || []).sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
        return { ...s, sedangHaid, activePeriod, lastPeriod }
      })
      .sort((a, b) => {
        if (a.sedangHaid && !b.sedangHaid) return -1
        if (!a.sedangHaid && b.sedangHaid) return 1
        return a.name.localeCompare(b.name)
      })
  }, [students, search, today])

  const sedangHaidCount = haidList.filter(s => s.sedangHaid).length

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value={haidList.length}              label="Total Siswi"  sub="Terdaftar" iconBg="#14532d" iconColor="#4ade80" icon="👧" />
        <StatCard value={sedangHaidCount}              label="Sedang Haid"  sub="Saat ini"  iconBg="#831843" iconColor="#f9a8d4" icon="🌸" />
        <StatCard value={haidList.length - sedangHaidCount} label="Tidak Haid" sub="Saat ini" iconBg="#134e4a" iconColor="#2dd4bf" icon="✅" />
      </div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Status Haid Siswi</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{haidList.length} siswi terdaftar</div>
        </div>
        {haidList.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.dimText, fontSize: 13 }}>Tidak ada siswi.</div>
        )}
        {haidList.map((s, i) => (
          <div key={s.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < haidList.length - 1 ? `1px solid ${C.border}` : 'none', background: s.sedangHaid ? 'rgba(236,72,153,0.05)' : (i % 2 === 0 ? C.cardBg : C.rowBg) }}>
            <Avatar name={s.name} studentId={s.id} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.kelas}</div>
              {s.activePeriod && (
                <div style={{ fontSize: 11, color: '#f9a8d4', marginTop: 2 }}>
                  🌸 Mulai: {s.activePeriod.startDate}{!s.activePeriod.endDate ? ' (berlangsung)' : ` — selesai: ${s.activePeriod.endDate}`}
                </div>
              )}
              {!s.sedangHaid && s.lastPeriod && (
                <div style={{ fontSize: 11, color: C.dimText, marginTop: 2 }}>Terakhir: {s.lastPeriod.startDate}</div>
              )}
            </div>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block', background: s.sedangHaid ? 'rgba(236,72,153,0.2)' : 'rgba(16,185,129,0.15)', color: s.sedangHaid ? '#f9a8d4' : '#4ade80', border: `1px solid ${s.sedangHaid ? 'rgba(236,72,153,0.4)' : 'rgba(16,185,129,0.3)'}` }}>
              {s.sedangHaid ? 'Sedang Haid' : 'Tidak Haid'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── View: Detail Siswa ───────────────────────────────────────────────────────
function ViewDetail({ student, blpPeriods, onBack, onDeleteRequest, onReviewActivity, patchSubmission }) {
  const today = getJakartaToday()
  const thisMonth = today.slice(0, 7)
  const [viewMonth, setViewMonth] = useState(thisMonth)
  const [expandedDate, setExpandedDate] = useState(null)
  const [dlLoading, setDlLoading] = useState('')

  const records = student.records || {}
  const haidPeriods = student.haidPeriods || []

  // Statistik bulan ini
  const { monthEntries, avgScore } = useMemo(() => {
    const entries = Object.keys(records).filter(d => d.startsWith(thisMonth))
    const scores  = entries.map(d => getDaySkor(student, d, blpPeriods) ?? 0)
    const avg     = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { monthEntries: entries, avgScore: avg }
  }, [records, thisMonth, blpPeriods, student])

  // Kalender
  const { weeks, monthLabel } = useMemo(() => {
    const [yr, mo] = viewMonth.split('-').map(Number)
    const firstDay = new Date(yr, mo - 1, 1).getDay()
    const days     = new Date(yr, mo, 0).getDate()
    const label    = new Date(yr, mo - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    const cells    = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push(d)
    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return { weeks: rows, monthLabel: label }
  }, [viewMonth])

  function dayKey(d) {
    const [yr, mo] = viewMonth.split('-')
    return `${yr}-${mo}-${String(d).padStart(2, '0')}`
  }
  function prevViewMonth() {
    const [yr, mo] = viewMonth.split('-').map(Number)
    const d = new Date(yr, mo - 2, 1)
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  function nextViewMonth() {
    const [yr, mo] = viewMonth.split('-').map(Number)
    const d = new Date(yr, mo, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (next <= today.slice(0, 7)) setViewMonth(next)
  }

  const handleDownload = async (type) => {
    setDlLoading(type)
    try {
      const monthDate = new Date(viewMonth + '-01T00:00:00')
      if (type === 'pdf') await downloadRekapPDF(student, monthDate, blpPeriods)
      else               await downloadRekapExcel(student, monthDate, blpPeriods)
    } catch (e) {
      alert('Download gagal: ' + (e?.message || 'Error'))
    }
    setDlLoading('')
  }

  const allActs = BLP_CATEGORIES.flatMap(c => c.activities)

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header siswa */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Avatar name={student.name} studentId={student.id} size={56} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{student.name}</div>
            <div style={{ fontSize: 12, color: '#6ee7b7', marginTop: 2 }}>Kelas: {student.kelas}</div>
            {student.email    && <div style={{ fontSize: 11, color: C.muted }}>✉️ {student.email}</div>}
            {student.whatsapp && <div style={{ fontSize: 11, color: C.muted }}>📱 {student.whatsapp}</div>}
            {student.jenisKelamin && (
              <div style={{ fontSize: 11, color: C.muted }}>
                {student.jenisKelamin === 'P' ? '👧 Perempuan' : '👦 Laki-laki'}
              </div>
            )}
          </div>
        </div>

        {/* Statistik */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: 'Total Hari',  value: Object.keys(records).length, color: '#10b981' },
            { label: 'Bulan Ini',   value: monthEntries.length,          color: '#6366f1' },
            { label: 'Rata-rata',   value: `${avgScore}%`,               color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.dimText, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quran bookmark */}
        {student.quranBookmark && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 10, fontSize: 12, color: '#6ee7b7' }}>
            📖 Penanda Quran: <strong>{student.quranBookmark.surahName}</strong>
            {student.quranBookmark.halaman
              ? ` — Hal. ${student.quranBookmark.halaman}`
              : ` ayat ${student.quranBookmark.ayat}`}
          </div>
        )}
      </div>

      {/* Download */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => handleDownload('pdf')} disabled={!!dlLoading}
          style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, background: '#7f1d1d', color: '#fca5a5', opacity: dlLoading === 'pdf' ? 0.6 : 1 }}>
          {dlLoading === 'pdf' ? '...' : '📄'} Download PDF
        </button>
        <button onClick={() => handleDownload('excel')} disabled={!!dlLoading}
          style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, background: '#14532d', color: '#86efac', opacity: dlLoading === 'excel' ? 0.6 : 1 }}>
          {dlLoading === 'excel' ? '...' : '📊'} Download Excel
        </button>
      </div>

      {/* Kalender */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
          <button onClick={prevViewMonth} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, fontFamily: 'inherit' }}>‹</button>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{monthLabel}</div>
          <button onClick={nextViewMonth} disabled={viewMonth >= today.slice(0, 7)} style={{ background: 'none', border: 'none', color: viewMonth >= today.slice(0, 7) ? C.dimText : C.muted, cursor: viewMonth >= today.slice(0, 7) ? 'default' : 'pointer', fontSize: 18, fontFamily: 'inherit' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '8px 8px 4px' }}>
          {['Mi','Se','Se','Ra','Ka','Ju','Sa'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.dimText }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 8px' }}>
            {week.map((d, di) => {
              if (!d) return <div key={di} />
              const key     = dayKey(d)
              const isToday = key === today
              const isFut   = key > today
              const dayDate = new Date(key + 'T00:00:00')
              const skor    = getDaySkor(student, key, blpPeriods)
              const rec     = records[key]

              let bg = 'transparent'
              let textColor = isFut ? C.dimText : '#fff'
              if (isToday) { bg = 'rgba(16,185,129,0.2)'; textColor = '#4ade80' }
              if (skor !== null && skor >= 80) bg = 'rgba(16,185,129,0.3)'
              else if (skor !== null && skor >= 50) bg = 'rgba(245,158,11,0.2)'
              else if (skor !== null && skor > 0) bg = 'rgba(239,68,68,0.15)'
              else if (rec && skor === 0) bg = 'rgba(239,68,68,0.1)'

              return (
                <div key={di} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 2px' }}>
                  <button
                    onClick={() => rec && setExpandedDate(key)}
                    style={{ width: 30, height: 30, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isToday ? '1.5px solid #4ade80' : '1px solid transparent', cursor: rec ? 'pointer' : 'default', fontFamily: 'inherit' }}
                  >
                    <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: textColor }}>{d}</span>
                  </button>
                  {skor !== null && (
                    <span style={{ fontSize: 8, color: skor >= 80 ? '#4ade80' : skor >= 50 ? '#fbbf24' : '#f87171', marginTop: 1 }}>{skor}%</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Riwayat haid */}
      {haidPeriods.length > 0 && (
        <div style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#f9a8d4', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RIWAYAT HAID</div>
          {haidPeriods.slice(0, 5).map(h => (
            <div key={h.id} style={{ fontSize: 12, color: '#e5e7eb', padding: '3px 0' }}>
              {new Date(h.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' → '}
              {h.endDate
                ? new Date(h.endDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : <span style={{ color: '#ec4899' }}>berlangsung</span>}
            </div>
          ))}
        </div>
      )}

      {/* Riwayat record */}
      <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
        RIWAYAT CATATAN BLP ({Object.keys(records).length} hari)
      </div>

      {Object.keys(records).length === 0 ? (
        <div style={{ textAlign: 'center', color: C.dimText, padding: '32px 0', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          Belum ada riwayat BLP.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.keys(records).sort((a, b) => b.localeCompare(a)).map(dateStr => {
            const rec         = records[dateStr]
            const dateObj     = new Date(dateStr + 'T00:00:00')
            const total       = getEffectiveTotalActivities(dateObj, haidPeriods)
            const done        = getEffectiveCompletedCount(dateObj, rec.completedActivities || [], haidPeriods)
            const skor        = total > 0 ? Math.round((done / total) * 100) : 0
            const isExpanded  = expandedDate === dateStr
            const hasSubmissions = rec.submissions && Object.keys(rec.submissions).length > 0
            const dateLabel   = new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
            const sColor      = skor >= 80 ? '#22c55e' : skor >= 50 ? '#f59e0b' : '#ef4444'

            return (
              <div key={dateStr} style={{ background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isExpanded ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={() => setExpandedDate(isExpanded ? null : dateStr)} style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: '#fff', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{dateLabel}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>
                        {done}/{total} aktivitas{hasSubmissions ? ' • 📎 Ada submission' : ''}
                      </div>
                    </div>
                    <span style={{ background: `${sColor}22`, border: `1px solid ${sColor}55`, borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 800, color: sColor }}>{skor}%</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Aktivitas tiles */}
                    <div style={{ paddingTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: hasSubmissions ? 12 : 0 }}>
                      {allActs.map(a => {
                        const isDone = rec.completedActivities?.includes(a.id)
                        const hasSub = rec.submissions?.[a.id]
                        return (
                          <button
                            key={a.id}
                            onClick={() => hasSub && onReviewActivity(dateStr, a.id, rec)}
                            style={{ fontSize: 11, padding: '4px 9px', borderRadius: 8, fontFamily: 'inherit', cursor: hasSub ? 'pointer' : 'default', background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: isDone ? '#6ee7b7' : '#4b5563', border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}` }}
                            title={hasSub ? 'Lihat submission' : a.name}
                          >
                            {isDone ? '✓' : '✗'} {a.id}{hasSub ? ' 📎' : ''}
                          </button>
                        )
                      })}
                    </div>

                    {/* Submissions */}
                    {hasSubmissions && (
                      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 700, marginBottom: 8 }}>📎 SUBMISSION SISWA</div>
                        {Object.entries(rec.submissions).map(([actId, sub]) => {
                          const act = allActs.find(a => a.id === actId)
                          const typeLabel = sub.type === 'audio' ? '🎤 Audio' : sub.type === 'checklist' ? '☑️ Ceklis' : '📝 Teks'
                          return (
                            <div key={actId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                <div style={{ fontSize: 12, color: '#e5e7eb' }}>{act?.name || actId} <span style={{ color: '#94a3b8', fontSize: 10 }}>{typeLabel}</span></div>
                                {sub.reviewedAt
                                  ? <div style={{ fontSize: 10, color: '#10b981', marginTop: 2 }}>✅ Ditinjau {new Date(sub.reviewedAt).toLocaleDateString('id-ID')}</div>
                                  : <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>⏳ Belum ditinjau</div>}
                              </div>
                              <button
                                onClick={() => onReviewActivity(dateStr, actId, rec)}
                                style={{ background: sub.reviewedAt ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.2)', border: `1px solid ${sub.reviewedAt ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.4)'}`, borderRadius: 8, padding: '5px 10px', color: sub.reviewedAt ? '#6ee7b7' : '#a5b4fc', fontFamily: 'inherit', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                              >
                                {sub.reviewedAt ? 'Lihat' : 'Tinjau'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Hapus akun */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onDeleteRequest} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 20px', color: '#f87171', fontFamily: 'inherit', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          🗑️ Hapus Akun Siswa Ini
        </button>
      </div>
    </div>
  )
}

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function BlpGuruDashboardScreen({ navigate, goBack, activeTab = 'daftar' }) {
  const { data, loading, error, loadDashboard, patchSubmission, invalidate } = useBlpData()
  const { user } = useAuth()

  // View state
  const tabInit = activeTab === 'rekap' ? 'recap' : activeTab === 'haid' ? 'haid' : 'list'
  const [view, setView]             = useState(tabInit)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(getJakartaToday())
  const [selectedMonth, setSelectedMonth] = useState(getJakartaToday().slice(0, 7))
  const [search, setSearch]         = useState('')

  // Modal state
  const [showProfileModal, setShowProfileModal]   = useState(false)
  const [showPeriodModal, setShowPeriodModal]     = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState(null)
  const [reviewingCtx, setReviewingCtx]           = useState(null) // { dateStr, activityId, record }

  useEffect(() => { loadDashboard() }, [])

  const students   = useMemo(() => data ? Object.values(data.students || {}) : [], [data])
  const guru       = useMemo(() => data ? Object.values(data.gurus || {})[0] : null, [data])
  const blpPeriods = useMemo(() => data?.blpPeriods || {}, [data])

  const selectedStudent  = useMemo(() => students.find(s => s.id === selectedStudentId) || null, [students, selectedStudentId])
  const deletingStudent  = useMemo(() => students.find(s => s.id === deletingStudentId) || null, [students, deletingStudentId])

  // Kelas yang diajar guru (untuk BlpPeriodModal)
  const kelasOptions = useMemo(() => {
    if (!students.length) return []
    const set = new Set(students.map(s => s.kelas).filter(Boolean))
    return [...set].sort()
  }, [students])

  function handleViewDetail(studentId) {
    setSelectedStudentId(studentId)
    setView('detail')
  }

  function handleReviewActivity(dateStr, activityId, record) {
    setReviewingCtx({ dateStr, activityId, record })
    // Mark as reviewed server-side
    if (selectedStudent) {
      fetch(`/api/blp/students/${selectedStudent.id}/records/${dateStr}/submissions/${activityId}/review`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() => patchSubmission(selectedStudent.id, dateStr, activityId, { reviewedAt: new Date().toISOString() }))
        .catch(console.error)
    }
  }

  const handleSavePeriod = async (kelas, year, month, startDay, endDay) => {
    const res = await fetch('/api/blp/periods', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelas, year, month, startDay, endDay }),
    })
    if (!res.ok) {
      const j = await res.json()
      throw new Error(j.error || 'Gagal menyimpan')
    }
    invalidate()
    await loadDashboard({ force: true })
  }

  const handleSaveGuruProfile = async (photoUrl, bio) => {
    if (!guru) return
    const res = await fetch(`/api/blp/gurus/${guru.id}/profile`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl, bio }),
    })
    if (!res.ok) {
      const j = await res.json()
      throw new Error(j.error || 'Gagal menyimpan profil')
    }
    loadDashboard({ force: true })
  }

  const TABS = [
    { id: 'list',   label: 'Daftar Siswa' },
    { id: 'recap',  label: 'Rekap Nilai'  },
    { id: 'haid',   label: 'Haid Siswi'   },
  ]

  if (error) return (
    <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</div>
      <button onClick={() => loadDashboard({ force: true })} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Coba Lagi</button>
      <button onClick={goBack} style={{ background: 'transparent', border: '1px solid #2a4535', borderRadius: 12, padding: '8px 20px', color: '#6aaa82', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Kembali</button>
    </div>
  )

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: '#10b981', fontSize: 14 }}>Memuat data BLP...</div>
      </div>
    </div>
  )

  const activeViewIsTab = view !== 'detail'

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ── Header ── */}
      <div style={{ background: C.navBg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Kiri */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Tombol back: di detail → kembali ke list; di list → goBack */}
            {(view === 'detail' || goBack) && (
              <button
                onClick={() => view === 'detail' ? (setView('list'), setSelectedStudentId(null)) : goBack?.()}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22, padding: '0 8px 0 0', lineHeight: 1, fontFamily: 'inherit' }}>‹</button>
            )}
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff' }}>B</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                {view === 'detail' ? (selectedStudent?.name || 'Detail Siswa') : 'BLP Harian — Guru'}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>SMP TISA Islamic School</div>
            </div>
          </div>

          {/* Kanan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowPeriodModal(true)}
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '6px 10px', color: '#6ee7b7', fontFamily: 'inherit', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              ⚙️ Periode
            </button>
            {/* Avatar guru — klik untuk edit profil */}
            <button
              onClick={() => setShowProfileModal(true)}
              title="Edit Profil Guru"
              style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', overflow: 'hidden', background: 'linear-gradient(135deg,#10b981,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff', padding: 0, flexShrink: 0 }}>
              {guru?.photoUrl
                ? <img src={guru.photoUrl} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials(guru?.name || user?.name || '')}
            </button>
          </div>
        </div>

        {/* Tabs — disembunyikan di view detail */}
        {activeViewIsTab && (
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setView(t.id); setSearch('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: view === t.id ? '#fff' : 'transparent', color: view === t.id ? '#1a3028' : C.muted }}>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Konten ── */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '16px 16px 80px' }}>
        {/* Search — hanya di views tab */}
        {activeViewIsTab && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none', fontSize: 14 }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama siswa..."
              style={{ width: '100%', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 36px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, padding: 2 }}>✕</button>
            )}
          </div>
        )}

        {view === 'list' && (
          <ViewList
            students={students} selectedDate={selectedDate} onDateChange={setSelectedDate}
            onViewDetail={handleViewDetail} blpPeriods={blpPeriods} search={search}
          />
        )}
        {view === 'recap' && (
          <ViewRecap
            students={students} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
            onViewDetail={handleViewDetail} blpPeriods={blpPeriods} search={search}
          />
        )}
        {view === 'haid' && (
          <ViewHaid students={students} search={search} />
        )}
        {view === 'detail' && selectedStudent && (
          <ViewDetail
            student={selectedStudent}
            blpPeriods={blpPeriods}
            onBack={() => { setView('list'); setSelectedStudentId(null) }}
            onDeleteRequest={() => setDeletingStudentId(selectedStudent.id)}
            onReviewActivity={handleReviewActivity}
            patchSubmission={patchSubmission}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showProfileModal && guru && (
        <ProfileModal
          name={guru.name || user?.name || ''}
          currentPhotoUrl={guru.photoUrl || null}
          currentBio={guru.bio || null}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveGuruProfile}
        />
      )}

      {showPeriodModal && (
        <BlpPeriodModal
          kelasOptions={kelasOptions}
          monthDate={new Date(selectedMonth + '-01T00:00:00')}
          blpPeriods={blpPeriods}
          getPeriodKey={(kelas, monthDate) => {
            const yr  = monthDate.getFullYear()
            const mo  = String(monthDate.getMonth() + 1).padStart(2, '0')
            return `${kelas}__${yr}-${mo}`
          }}
          onClose={() => setShowPeriodModal(false)}
          onSave={handleSavePeriod}
        />
      )}

      {deletingStudentId && (
        <ConfirmModal
          title="Hapus Akun Siswa?"
          message={`Akun "${deletingStudent?.name}" beserta seluruh riwayat BLP-nya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Ya, Hapus Permanen"
          danger={true}
          onClose={() => setDeletingStudentId(null)}
          onConfirm={async () => {
            const res = await fetch(`/api/blp/students/${deletingStudentId}`, {
              method: 'DELETE', credentials: 'include',
            })
            if (!res.ok) {
              const j = await res.json()
              throw new Error(j.error || 'Gagal menghapus')
            }
            setDeletingStudentId(null)
            setSelectedStudentId(null)
            setView('list')
            invalidate()
            loadDashboard({ force: true })
          }}
        />
      )}

      {reviewingCtx && reviewingCtx.record?.submissions?.[reviewingCtx.activityId] && (
        <GuruReviewSubmissionModal
          activityName={BLP_CATEGORIES.flatMap(c => c.activities).find(a => a.id === reviewingCtx.activityId)?.name || reviewingCtx.activityId}
          submission={reviewingCtx.record.submissions[reviewingCtx.activityId]}
          checklistItems={reviewingCtx.activityId === 'rp1' ? PERLENGKAPAN_SEKOLAH_ITEMS : undefined}
          onClose={() => setReviewingCtx(null)}
        />
      )}
    </div>
  )
}
