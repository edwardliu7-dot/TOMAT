/**
 * BlpSiswaDashboardScreen.jsx
 * Dashboard utama siswa BLP Harian — implementasi mockup siswa-dashboard.
 * Tabs: Harian | Kalender | Riwayat
 * Fitur: toggle aktivitas inline, auto-save, skor bulat SVG, 5 kategori 5R.
 * Styling: SEMUA inline style — tidak menggunakan Tailwind/className UI.
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '../../AuthContext.jsx'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'
import {
  BLP_CATEGORIES, hitungSkorV2, isSedangHaid, isV2Record,
  hitungSkor, AKTIVITAS_LIST,
} from './blpAktivitasData.js'

// ─── Warna tema ───────────────────────────────────────────────────────────────
const C = {
  pageBg:  '#0d2018',
  navBg:   '#162c1f',
  cardBg:  '#1a3028',
  itemBg:  '#1c2838',
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

function formatTanggal(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

function starCount(pct) {
  if (pct >= 100) return 5
  if (pct >= 80)  return 4
  if (pct >= 60)  return 3
  if (pct >= 40)  return 2
  if (pct >= 20)  return 1
  return 0
}

function initials(name = '') {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

// ─── Circular Progress SVG ────────────────────────────────────────────────────
function CircleProgress({ pct, size = 80, stroke = 8 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="white" strokeWidth={stroke}
          strokeDasharray={`${circ * pct / 100} ${circ}`}
          strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.19, fontWeight: 800, color: '#fff' }}>{pct}%</span>
        <span style={{ fontSize: size * 0.13, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>selesai</span>
      </div>
    </div>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ filled, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= filled ? '#fde047' : 'rgba(255,255,255,0.25)' }}>★</span>
      ))}
    </div>
  )
}

// ─── Tab Harian ───────────────────────────────────────────────────────────────
function TabHarian({ student, today, navigate }) {
  const sedangHaid  = isSedangHaid(student.haidPeriods || [])
  const existingRec = student.records?.[today]

  // Deteksi versi: jika ada record yang pakai v2 IDs, pakai v2; kalau tidak, init kosong
  const initChecked = useMemo(() => {
    if (!existingRec) return []
    const ids = existingRec.completedActivities || []
    return ids
  }, [existingRec])

  const [checked, setChecked] = useState(initChecked)
  const [saving, setSaving]   = useState(false)
  const [saveOk, setSaveOk]   = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const saveTimer = useRef(null)

  // Sync jika student.records berubah dari luar
  useEffect(() => {
    setChecked(existingRec?.completedActivities || [])
  }, [existingRec])

  const pct  = hitungSkorV2(checked, sedangHaid)
  const stars = starCount(pct)

  // Hitung total aktivitas (exclude sholat kalau haid)
  const totalActs = useMemo(() => {
    return BLP_CATEGORIES.reduce((sum, cat) =>
      sum + cat.activities.filter(a => !(sedangHaid && a.sholat)).length, 0)
  }, [sedangHaid])
  const doneCount = checked.filter(id => {
    const allActs = BLP_CATEGORIES.flatMap(c => c.activities)
    const act = allActs.find(a => a.id === id)
    return act && !(sedangHaid && act.sholat)
  }).length

  // Auto-save dengan debounce 800ms
  const doSave = useCallback(async (ids) => {
    if (!student?.id) return
    setSaving(true)
    setSaveErr('')
    try {
      const score = hitungSkorV2(ids, sedangHaid)
      const res = await fetch(`/api/blp/students/${student.id}/records/${today}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completedActivities: ids, score, submissions: {} }),
      })
      if (!res.ok) {
        const j = await res.json()
        setSaveErr(j.error || 'Gagal menyimpan')
      } else {
        setSaveOk(true)
        setTimeout(() => setSaveOk(false), 1800)
      }
    } catch {
      setSaveErr('Koneksi gagal, coba lagi')
    }
    setSaving(false)
  }, [student?.id, today, sedangHaid])

  function toggle(id) {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => doSave(next), 800)
      return next
    })
  }

  const todayLabel = formatTanggal(today)

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Kartu tanggal */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '12px 16px',
        textAlign: 'center', marginBottom: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{todayLabel}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginTop: 3, letterSpacing: 1 }}>HARI INI</div>
      </div>

      {/* Kartu skor */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 55%, #34d399 100%)',
        borderRadius: 20, padding: '18px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, letterSpacing: 1, marginBottom: 6 }}>
            NILAI BLP HARI INI
            <span style={{
              marginLeft: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 99,
              padding: '2px 8px', fontSize: 9,
            }}>HARI INI</span>
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{pct}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Nilai BLP Hari Ini</div>
          <div style={{ marginTop: 8 }}>
            <Stars filled={stars} size={15} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
            {pct < 100 ? 'Ayo selesaikan amaliyahmu!' : 'Luar biasa! Semua selesai 🎉'}
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 5 }}>
              {doneCount} / {totalActs} aktivitas selesai
            </div>
            <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)', width: 180, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#fff', borderRadius: 4,
                width: `${pct}%`, transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>
        <CircleProgress pct={pct} size={76} stroke={7} />
      </div>

      {/* Status haid */}
      {sedangHaid && (
        <div style={{
          background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 14,
          fontSize: 12, color: '#f9a8d4',
        }}>
          🌸 Periode haid aktif — aktivitas sholat dikecualikan secara otomatis
        </div>
      )}

      {/* Status simpan */}
      {saveOk && (
        <div style={{
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: '#6ee7b7', fontWeight: 600,
        }}>
          ✅ Tersimpan otomatis
        </div>
      )}
      {saving && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: C.muted,
        }}>
          💾 Menyimpan...
        </div>
      )}
      {saveErr && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: '#f87171',
        }}>
          ⚠️ {saveErr}
        </div>
      )}

      {/* Kategori */}
      {BLP_CATEGORIES.map(cat => {
        const visibleActs = cat.activities.filter(a => !(sedangHaid && a.sholat))
        const catDone = visibleActs.filter(a => checked.includes(a.id)).length
        const catPct = visibleActs.length > 0 ? Math.round((catDone / visibleActs.length) * 100) : 0

        return (
          <div key={cat.id} style={{ marginBottom: 18 }}>
            {/* Header kategori — kartu putih dengan border kiri berwarna */}
            <div style={{
              background: '#fff', borderLeft: `4px solid ${cat.accentColor}`,
              borderRadius: 12, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 8,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: cat.accentColor, letterSpacing: 0.5 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.sub}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{catDone}/{visibleActs.length}</span>
                <div style={{ width: 72, height: 6, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: cat.accentColor, width: `${catPct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>

            {/* Daftar aktivitas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
              {cat.activities.map(act => {
                const disabled = sedangHaid && act.sholat
                const isChecked = checked.includes(act.id)
                return (
                  <button
                    key={act.id}
                    onClick={() => !disabled && toggle(act.id)}
                    disabled={disabled}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      background: disabled ? 'rgba(255,255,255,0.02)' : C.itemBg,
                      border: `1px solid ${act.note && !disabled ? `${cat.accentColor}40` : C.border}`,
                      borderRadius: 12, padding: '12px 14px',
                      cursor: disabled ? 'default' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      textAlign: 'left', fontFamily: 'inherit',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    {/* Circle checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      border: `2px solid ${isChecked && !disabled ? cat.accentColor : '#3a5545'}`,
                      background: isChecked && !disabled ? cat.accentColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isChecked && !disabled && (
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{act.label}</div>
                      <div style={{ fontSize: 10, color: C.dimText, marginTop: 3, letterSpacing: 0.3 }}>
                        TARGET: {act.target}
                      </div>
                      {act.note && (
                        <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 3 }}>📌 {act.note}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: C.dimText, padding: '16px 0' }}>
        🌐 © 2026 BLP Harian · SMP TISA Islamic School 🌐
      </div>
    </div>
  )
}

// ─── Tab Kalender ─────────────────────────────────────────────────────────────
function TabKalender({ student, navigate }) {
  const today = getJakartaToday()
  const thisMonth = today.slice(0, 7)
  const [viewMonth, setViewMonth] = useState(thisMonth)

  const records = student.records || {}

  // Hitung grid kalender
  const { weeks, monthLabel } = useMemo(() => {
    const [year, month] = viewMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate()
    const label = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return { weeks: rows, monthLabel: label }
  }, [viewMonth])

  function dayKey(d) {
    const [year, month] = viewMonth.split('-')
    return `${year}-${month}-${String(d).padStart(2, '0')}`
  }

  function prevMonth() {
    const [y, m] = viewMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  function nextMonth() {
    const [y, m] = viewMonth.split('-').map(Number)
    const next = `${y}-${String(m + 1).padStart(2, '0')}`
    if (next.slice(0, 7) <= today.slice(0, 7)) {
      const d = new Date(y, m, 1)
      setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
  }

  const sedangHaid = isSedangHaid(student.haidPeriods || [])

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Nav bulan */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, padding: '0 8px', fontFamily: 'inherit' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{monthLabel}</span>
        <button
          onClick={nextMonth}
          disabled={viewMonth >= today.slice(0, 7)}
          style={{
            background: 'none', border: 'none', fontSize: 20, padding: '0 8px', fontFamily: 'inherit',
            color: viewMonth >= today.slice(0, 7) ? C.dimText : C.muted,
            cursor: viewMonth >= today.slice(0, 7) ? 'default' : 'pointer',
          }}
        >›</button>
      </div>

      {/* Grid kalender */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {/* Header hari */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 8px 6px' }}>
          {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.dimText, letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        {/* Baris minggu */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 8px' }}>
            {week.map((d, di) => {
              if (!d) return <div key={di} />
              const key = dayKey(d)
              const rec = records[key]
              const isToday = key === today
              const isFuture = key > today
              const sedangHaidThisDay = isSedangHaid(student.haidPeriods || [])
              const skor = rec
                ? (isV2Record(rec.completedActivities || [])
                  ? hitungSkorV2(rec.completedActivities, sedangHaidThisDay)
                  : hitungSkor(rec.completedActivities, sedangHaidThisDay))
                : null

              let bg = 'transparent'
              let textColor = isFuture ? C.dimText : '#fff'
              if (isToday) { bg = 'rgba(16,185,129,0.2)'; textColor = '#4ade80' }
              if (skor !== null && skor >= 80) bg = 'rgba(16,185,129,0.25)'
              else if (skor !== null && skor >= 50) bg = 'rgba(245,158,11,0.2)'
              else if (skor !== null) bg = 'rgba(239,68,68,0.15)'

              return (
                <div key={di} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 2px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isToday ? '1.5px solid #4ade80' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: textColor }}>{d}</span>
                  </div>
                  {skor !== null && (
                    <span style={{ fontSize: 9, color: skor >= 80 ? '#4ade80' : skor >= 50 ? '#fbbf24' : '#f87171', marginTop: 1 }}>
                      {skor}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        <div style={{ padding: '10px 16px', display: 'flex', gap: 14, borderTop: `1px solid ${C.border}` }}>
          {[
            { label: '≥80%', bg: 'rgba(16,185,129,0.25)', color: '#4ade80' },
            { label: '50–79%', bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
            { label: '<50%', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
            { label: 'Belum', bg: 'transparent', color: C.dimText },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${l.color}33` }} />
              <span style={{ fontSize: 10, color: C.dimText }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab Riwayat ──────────────────────────────────────────────────────────────
function TabRiwayat({ student, navigate }) {
  const sedangHaid = isSedangHaid(student.haidPeriods || [])
  const records = student.records || {}
  const sorted = Object.entries(records).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30)

  return (
    <div style={{ paddingBottom: 40 }}>
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', color: C.dimText, padding: '40px 0', fontSize: 14 }}>
          Belum ada riwayat aktivitas.
        </div>
      )}
      {sorted.map(([date, rec]) => {
        const ids = rec.completedActivities || []
        const skor = isV2Record(ids)
          ? hitungSkorV2(ids, sedangHaid)
          : hitungSkor(ids, sedangHaid)
        const label = formatTanggal(date)
        const sColor = skor >= 80 ? '#22c55e' : skor >= 50 ? '#f59e0b' : '#ef4444'
        return (
          <div key={date} style={{
            background: C.cardBg, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                {ids.length} aktivitas tercatat
              </div>
            </div>
            <div style={{
              background: `${sColor}20`, border: `1px solid ${sColor}55`,
              borderRadius: 10, padding: '4px 12px',
              fontSize: 14, fontWeight: 800, color: sColor,
            }}>
              {skor}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function BlpSiswaDashboardScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const { data, loading, error, loadDashboard } = useBlpData()
  const [tab, setTab] = useState('harian')

  useEffect(() => { loadDashboard() }, [])

  const today = getJakartaToday()
  const student = useMemo(() =>
    data ? Object.values(data.students || {})[0] : null,
  [data])

  const TABS = [
    { id: 'harian',   label: 'Harian',    icon: '✅' },
    { id: 'kalender', label: 'Kalender',  icon: '📅' },
    { id: 'riwayat',  label: 'Riwayat',   icon: '📋' },
  ]

  if (loading || !data) return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: '#10b981', fontSize: 14 }}>Memuat BLP Harian...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 24,
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</div>
      <button onClick={goBack} style={{
        background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px',
        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Kembali</button>
    </div>
  )

  if (!student) return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 24,
    }}>
      <div style={{ color: C.muted, fontSize: 14, textAlign: 'center' }}>Data siswa tidak ditemukan.</div>
      <button onClick={goBack} style={{
        background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px',
        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Kembali</button>
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
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Kiri: back + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {goBack && (
              <button onClick={goBack} style={{
                background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                fontSize: 22, padding: '0 8px 0 0', lineHeight: 1, fontFamily: 'inherit',
              }}>‹</button>
            )}
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, color: '#fff',
            }}>B</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>BLP Harian</div>
              <div style={{ fontSize: 10, color: C.muted }}>SMP TISA</div>
            </div>
          </div>

          {/* Kanan: avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#10b981,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 11, color: '#fff',
            }}>
              {initials(student.name || user?.name || '')}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 16px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center',
                padding: '9px 6px', fontSize: 12, fontWeight: 600,
                border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#1a3028' : C.muted,
              }}
            >
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Konten ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {tab === 'harian' && (
          <TabHarian student={student} today={today} navigate={navigate} />
        )}
        {tab === 'kalender' && (
          <TabKalender student={student} navigate={navigate} />
        )}
        {tab === 'riwayat' && (
          <TabRiwayat student={student} navigate={navigate} />
        )}
      </div>
    </div>
  )
}
