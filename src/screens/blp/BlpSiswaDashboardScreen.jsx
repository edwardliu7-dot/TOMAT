/**
 * BlpSiswaDashboardScreen.jsx
 * Dashboard utama siswa BLP Harian.
 * Tabs: Harian | Kalender | Pengaturan
 * Scoring: getEffectiveCompletedCount (school-day + haid-aware)
 * Submission: Text, Checklist, Quran modals
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '../../AuthContext.jsx'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'
import {
  BLP_CATEGORIES,
  QURAN_ACTIVITY_ID, BELAJAR_ACTIVITY_ID, EVALUASI_ACTIVITY_ID,
  PERLENGKAPAN_ACTIVITY_ID, RECIPROCITY_ACTIVITY_IDS,
  PERLENGKAPAN_SEKOLAH_ITEMS,
  isSedangHaid,
} from './blpAktivitasData.js'
import {
  getEffectiveTotalActivities, getEffectiveCompletedCount,
  isDateCountedForRecap, isHaidDay, SCHOOL_ONLY_ACTIVITY_IDS, isSchoolDay,
} from './utils/blpScoring.js'
import { downloadRekapPDF, downloadRekapExcel } from './utils/rekapExport.js'
import TextSubmissionModal from './modals/TextSubmissionModal.jsx'
import ChecklistSubmissionModal from './modals/ChecklistSubmissionModal.jsx'
import QuranReadingModal from './modals/QuranReadingModal.jsx'
import ProfileModal from './modals/ProfileModal.jsx'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Submission config helpers ────────────────────────────────────────────────
function getSubmissionConfig(activityId) {
  if (activityId === BELAJAR_ACTIVITY_ID) {
    return { minChars: 100, title: 'Rangkuman Belajar Hari Ini',
             placeholder: 'Tuliskan rangkuman materi yang kamu pelajari hari ini...' }
  }
  if (activityId === EVALUASI_ACTIVITY_ID) {
    return { minChars: 100, title: 'Evaluasi Diri Sebelum Tidur',
             placeholder: 'Tuliskan evaluasi dirimu hari ini...' }
  }
  if (RECIPROCITY_ACTIVITY_IDS.includes(activityId)) {
    return { title: 'Laporan Kegiatan',
             placeholder: 'Ceritakan kegiatan yang kamu lakukan...' }
  }
  return null
}

function getChecklistConfig(activityId) {
  if (activityId === PERLENGKAPAN_ACTIVITY_ID) {
    return { title: 'Ceklis Perlengkapan Sekolah', items: PERLENGKAPAN_SEKOLAH_ITEMS }
  }
  return null
}

// ─── Circular Progress SVG ────────────────────────────────────────────────────
function CircleProgress({ pct, size = 80, stroke = 8 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r}
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

function Stars({ filled, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= filled ? '#fde047' : 'rgba(255,255,255,0.25)' }}>★</span>
      ))}
    </div>
  )
}

// ─── Submission badge ─────────────────────────────────────────────────────────
function SubmissionBadge({ type }) {
  const labels = { text: '📝', audio: '🎤', checklist: '☑️' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, background: 'rgba(16,185,129,0.2)',
      color: '#6ee7b7', borderRadius: 99, padding: '2px 7px', letterSpacing: 0.3,
    }}>
      {labels[type] || '📎'} Tersimpan
    </span>
  )
}

// ─── Tab Harian ───────────────────────────────────────────────────────────────
function TabHarian({ student, today }) {
  const existingRec = student.records?.[today] || {}
  const todayDate   = new Date(today + 'T00:00:00')
  const haidPeriods = student.haidPeriods || []
  const sedangHaid  = isHaidDay(todayDate, haidPeriods)

  const [checked, setChecked]   = useState(existingRec.completedActivities || [])
  const [submissions, setSubs]  = useState(existingRec.submissions || {})
  const [saving, setSaving]     = useState(false)
  const [saveOk, setSaveOk]     = useState(false)
  const [saveErr, setSaveErr]   = useState('')
  const [activeModalActivityId, setActiveModal] = useState(null)
  const saveTimer = useRef(null)

  // Sync kalau data dari server berubah
  useEffect(() => {
    setChecked(existingRec.completedActivities || [])
    setSubs(existingRec.submissions || {})
  }, [existingRec])

  // Scoring dengan metode baru
  const totalActs  = getEffectiveTotalActivities(todayDate)
  const doneCount  = getEffectiveCompletedCount(todayDate, checked, haidPeriods)
  const pct        = totalActs > 0 ? Math.round((doneCount / totalActs) * 100) : 0
  const stars      = starCount(pct)

  const doSave = useCallback(async (ids, subs) => {
    if (!student?.id) return
    setSaving(true)
    setSaveErr('')
    const score = totalActs > 0
      ? Math.round((getEffectiveCompletedCount(todayDate, ids, haidPeriods) / totalActs) * 100)
      : 0
    try {
      const res = await fetch(`/api/blp/students/${student.id}/records/${today}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completedActivities: ids, score, submissions: subs || {} }),
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
  }, [student?.id, today, totalActs, haidPeriods]) // eslint-disable-line

  function toggleActivity(activityId) {
    if (SCHOOL_ONLY_ACTIVITY_IDS.includes(activityId) && !isSchoolDay(todayDate)) {
      setSaveErr('Kegiatan ini hanya berlaku pada hari sekolah (Senin–Jumat).')
      setTimeout(() => setSaveErr(''), 3000)
      return
    }
    setChecked(prev => {
      const next = prev.includes(activityId) ? prev.filter(x => x !== activityId) : [...prev, activityId]
      // Jika di-uncheck, hapus submission-nya juga
      let nextSubs = submissions
      if (prev.includes(activityId)) {
        nextSubs = { ...submissions }
        delete nextSubs[activityId]
        setSubs(nextSubs)
      }
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => doSave(next, nextSubs), 800)
      return next
    })
  }

  function handleActivityClick(activityId) {
    const isDone = checked.includes(activityId)
    // Kalau sudah dicentang → toggle off langsung (tidak perlu modal ulang)
    if (isDone) { toggleActivity(activityId); return }
    // Kalau belum: cek apakah perlu modal
    const needsModal = activityId === QURAN_ACTIVITY_ID
      || !!getChecklistConfig(activityId)
      || !!getSubmissionConfig(activityId)
    if (needsModal) {
      setActiveModal(activityId)
    } else {
      toggleActivity(activityId)
    }
  }

  function applySubmissionCompletion(activityId, submission) {
    const nextChecked = checked.includes(activityId) ? checked : [...checked, activityId]
    const nextSubs    = { ...submissions, [activityId]: submission }
    setChecked(nextChecked)
    setSubs(nextSubs)
    setActiveModal(null)
    clearTimeout(saveTimer.current)
    doSave(nextChecked, nextSubs)
  }

  const todayLabel = formatTanggal(today)
  const allActs    = BLP_CATEGORIES.flatMap(c => c.activities)

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
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{pct}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Nilai BLP Hari Ini</div>
          <div style={{ marginTop: 8 }}><Stars filled={stars} size={15} /></div>
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
          🌸 Periode haid aktif — Shalat &amp; Quran dikecualikan, auto-credit dihitung ✓
        </div>
      )}

      {/* Status simpan */}
      {saveOk && (
        <div style={{
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: '#6ee7b7', fontWeight: 600,
        }}>✅ Tersimpan otomatis</div>
      )}
      {saving && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: C.muted,
        }}>💾 Menyimpan...</div>
      )}
      {saveErr && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: 12, color: '#f87171',
        }}>⚠️ {saveErr}</div>
      )}

      {/* Kategori aktivitas */}
      {BLP_CATEGORIES.map(cat => {
        const visibleActs = cat.activities.filter(a => !(sedangHaid && a.sholat))
        const catDone = visibleActs.filter(a => checked.includes(a.id)).length
        const catPct  = visibleActs.length > 0 ? Math.round((catDone / visibleActs.length) * 100) : 0

        return (
          <div key={cat.id} style={{ marginBottom: 18 }}>
            {/* Header kategori */}
            <div style={{
              background: '#fff', borderLeft: `4px solid ${cat.accentColor}`,
              borderRadius: 12, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: cat.accentColor, letterSpacing: 0.5 }}>
                  {cat.label}
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
                const disabled     = sedangHaid && act.sholat
                const isChecked    = checked.includes(act.id)
                const sub          = submissions?.[act.id]
                const schoolOnly   = SCHOOL_ONLY_ACTIVITY_IDS.includes(act.id)
                const notSchoolDay = schoolOnly && !isSchoolDay(todayDate)

                // Tentukan jenis task untuk indikator visual
                const taskType = act.id === QURAN_ACTIVITY_ID
                  ? 'audio'
                  : getChecklistConfig(act.id)
                  ? 'checklist'
                  : getSubmissionConfig(act.id)
                  ? 'text'
                  : null
                const taskLabel = taskType === 'audio'     ? { icon: '🎤', text: 'Rekam bacaan' }
                                : taskType === 'checklist' ? { icon: '☑️', text: 'Ceklis perlengkapan' }
                                : taskType === 'text'      ? { icon: '✏️', text: 'Wajib isi tulisan' }
                                : null
                const hasBorder = (act.note || taskLabel) && !disabled

                return (
                  <button
                    key={act.id}
                    onClick={() => !disabled && !notSchoolDay && handleActivityClick(act.id)}
                    disabled={disabled || notSchoolDay}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      background: disabled || notSchoolDay ? 'rgba(255,255,255,0.02)' : C.itemBg,
                      border: `1px solid ${hasBorder ? `${cat.accentColor}40` : C.border}`,
                      borderRadius: 12, padding: '12px 14px',
                      cursor: (disabled || notSchoolDay) ? 'default' : 'pointer',
                      opacity: (disabled || notSchoolDay) ? 0.4 : 1,
                      textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${isChecked && !disabled ? cat.accentColor : '#3a5545'}`,
                      background: isChecked && !disabled ? cat.accentColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isChecked && !disabled && (
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>
                      )}
                    </div>

                    {/* Teks */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{act.name}</div>
                      <div style={{ fontSize: 10, color: C.dimText, marginTop: 3, letterSpacing: 0.3 }}>
                        TARGET: {act.target}
                      </div>

                      {/* Task indicator — tampil kalau belum selesai */}
                      {taskLabel && !isChecked && !disabled && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5,
                          background: `${cat.accentColor}18`,
                          border: `1px solid ${cat.accentColor}50`,
                          borderRadius: 99, padding: '2px 8px',
                        }}>
                          <span style={{ fontSize: 10 }}>{taskLabel.icon}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: cat.accentColor }}>{taskLabel.text}</span>
                        </div>
                      )}

                      {act.note && (
                        <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>📌 {act.note}</div>
                      )}
                      {notSchoolDay && (
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>🔒 Hanya hari sekolah</div>
                      )}
                      {/* Quran bookmark hint */}
                      {act.id === QURAN_ACTIVITY_ID && student.quranBookmark && !isChecked && (
                        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 3 }}>
                          🔖 {student.quranBookmark.surahName}
                          {student.quranBookmark.halaman
                            ? ` — Hal. ${student.quranBookmark.halaman}`
                            : ` ayat ${student.quranBookmark.ayat}`}
                        </div>
                      )}
                      {/* Submission badge — sudah diisi */}
                      {sub && isChecked && (
                        <div style={{ marginTop: 5 }}>
                          <SubmissionBadge type={sub.type} />
                        </div>
                      )}
                    </div>

                    {/* Ikon task di kanan — indikator cepat */}
                    {taskLabel && (
                      <div style={{
                        flexShrink: 0, fontSize: 16, marginTop: 1,
                        opacity: isChecked ? 0.35 : 0.9,
                        filter: isChecked ? 'grayscale(1)' : 'none',
                      }}>
                        {taskLabel.icon}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={{ textAlign: 'center', fontSize: 11, color: C.dimText, padding: '16px 0' }}>
        🌐 © 2026 BLP Harian · SMP TISA Islamic School 🌐
      </div>

      {/* ── Modals ── */}
      {activeModalActivityId === QURAN_ACTIVITY_ID && (
        <QuranReadingModal
          activityName="Membaca Al Qur'an"
          bookmark={student.quranBookmark || null}
          onClose={() => setActiveModal(null)}
          onSubmit={(audioDataUrl, quranRef) => {
            applySubmissionCompletion(QURAN_ACTIVITY_ID, {
              type: 'audio', content: audioDataUrl, quranRef,
              recordedAt: new Date().toISOString(),
            })
            // Simpan bookmark quran
            if (student?.id) {
              fetch(`/api/blp/students/${student.id}/quran-bookmark`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  surahNo: quranRef.surahNo,
                  surahName: quranRef.surahName,
                  ayat: quranRef.ayatTo + 1,
                  halaman: quranRef.halaman || null,
                }),
              }).catch(console.error)
            }
          }}
        />
      )}

      {activeModalActivityId && activeModalActivityId !== QURAN_ACTIVITY_ID
        && getChecklistConfig(activeModalActivityId) && (
        <ChecklistSubmissionModal
          title={getChecklistConfig(activeModalActivityId).title}
          activityName={allActs.find(a => a.id === activeModalActivityId)?.name || ''}
          items={getChecklistConfig(activeModalActivityId).items}
          initialValues={submissions?.[activeModalActivityId]?.items}
          onClose={() => setActiveModal(null)}
          onSubmit={items => {
            applySubmissionCompletion(activeModalActivityId, {
              type: 'checklist', items, recordedAt: new Date().toISOString(),
            })
          }}
        />
      )}

      {activeModalActivityId && activeModalActivityId !== QURAN_ACTIVITY_ID
        && getSubmissionConfig(activeModalActivityId) && (
        <TextSubmissionModal
          title={getSubmissionConfig(activeModalActivityId).title}
          activityName={allActs.find(a => a.id === activeModalActivityId)?.name || ''}
          placeholder={getSubmissionConfig(activeModalActivityId).placeholder}
          minChars={getSubmissionConfig(activeModalActivityId).minChars}
          initialValue={submissions?.[activeModalActivityId]?.content || ''}
          onClose={() => setActiveModal(null)}
          onSubmit={text => {
            applySubmissionCompletion(activeModalActivityId, {
              type: 'text', content: text, charCount: text.trim().length,
              recordedAt: new Date().toISOString(),
            })
          }}
        />
      )}
    </div>
  )
}

// ─── Tab Kalender ─────────────────────────────────────────────────────────────
function TabKalender({ student }) {
  const today     = getJakartaToday()
  const thisMonth = today.slice(0, 7)
  const [viewMonth, setViewMonth] = useState(thisMonth)
  const records     = student.records || {}
  const haidPeriods = student.haidPeriods || []

  const { weeks, monthLabel } = useMemo(() => {
    const [year, month] = viewMonth.split('-').map(Number)
    const firstDay   = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const label      = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
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
    const d = new Date(y, m, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (next <= today.slice(0, 7)) setViewMonth(next)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Nav bulan */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 8px 6px' }}>
          {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.dimText, letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 8px' }}>
            {week.map((d, di) => {
              if (!d) return <div key={di} />
              const key      = dayKey(d)
              const rec      = records[key]
              const isToday  = key === today
              const isFuture = key > today
              // Scoring per-hari: gunakan haidPeriods + tanggal spesifik
              const dayDate  = new Date(key + 'T00:00:00')
              const effectiveTotal = getEffectiveTotalActivities(dayDate)
              const effectiveDone  = rec
                ? getEffectiveCompletedCount(dayDate, rec.completedActivities || [], haidPeriods)
                : null
              const skor = effectiveDone !== null && effectiveTotal > 0
                ? Math.round((effectiveDone / effectiveTotal) * 100)
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

// ─── Tab Pengaturan ───────────────────────────────────────────────────────────
function TabPengaturan({ student, onEditProfil, selectedMonth, blpPeriods }) {
  const [haidLoading, setHaidLoading] = useState(false)
  const [haidErr, setHaidErr]         = useState('')
  const [haidOk, setHaidOk]           = useState('')
  const [dlLoading, setDlLoading]     = useState('')

  const activeHaid = (student.haidPeriods || []).find(p => !p.endDate)
  const isPerempuan = student.jenisKelamin !== 'L'

  const handleToggleHaid = async () => {
    setHaidLoading(true)
    setHaidErr('')
    setHaidOk('')
    try {
      const url = activeHaid
        ? `/api/blp/students/${student.id}/haid/end`
        : `/api/blp/students/${student.id}/haid`
      const res = await fetch(url, {
        method: activeHaid ? 'PUT' : 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const j = await res.json()
        setHaidErr(j.error || 'Gagal')
      } else {
        setHaidOk(activeHaid ? 'Periode haid ditutup.' : 'Periode haid dimulai.')
        setTimeout(() => setHaidOk(''), 3000)
        // reload data
        window.dispatchEvent(new CustomEvent('blp:reload'))
      }
    } catch {
      setHaidErr('Koneksi gagal')
    }
    setHaidLoading(false)
  }

  const handleDownload = async (type) => {
    setDlLoading(type)
    try {
      if (type === 'pdf') {
        await downloadRekapPDF(student, selectedMonth, blpPeriods)
      } else {
        await downloadRekapExcel(student, selectedMonth, blpPeriods)
      }
    } catch (e) {
      console.error('Download gagal:', e)
      alert('Download gagal: ' + (e?.message || 'Error tidak diketahui'))
    }
    setDlLoading('')
  }

  const sectionStyle = {
    background: C.cardBg, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: '16px 18px', marginBottom: 14,
    display: 'flex', flexDirection: 'column', gap: 14,
  }
  const rowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  }
  const iconBoxStyle = (bg) => ({
    padding: 8, borderRadius: 12, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })
  const btnStyle = (bg, color = '#fff') => ({
    padding: '9px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13,
    background: bg, color, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 6,
  })

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── Profil ── */}
      <div style={sectionStyle}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={iconBoxStyle('#d1fae5')}>
              <span style={{ fontSize: 18 }}>👤</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Edit Profil</div>
              <div style={{ fontSize: 11, color: C.muted }}>Foto &amp; bio</div>
            </div>
          </div>
          <button onClick={onEditProfil} style={btnStyle('#059669')}>
            Edit
          </button>
        </div>
      </div>

      {/* ── Download Rekap ── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={iconBoxStyle('#d1fae5')}>
            <span style={{ fontSize: 18 }}>📥</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Download Rekap</div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {selectedMonth
                ? new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                : 'Bulan ini'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={!!dlLoading}
            style={{ ...btnStyle('#dc2626'), flex: 1, justifyContent: 'center', opacity: dlLoading === 'pdf' ? 0.6 : 1 }}
          >
            {dlLoading === 'pdf' ? '...' : '📄'} PDF
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={!!dlLoading}
            style={{ ...btnStyle('#16a34a'), flex: 1, justifyContent: 'center', opacity: dlLoading === 'excel' ? 0.6 : 1 }}
          >
            {dlLoading === 'excel' ? '...' : '📊'} Excel
          </button>
        </div>
      </div>

      {/* ── Status Haid (hanya perempuan / unknown) ── */}
      {isPerempuan && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={iconBoxStyle('#ffe4e6')}>
              <span style={{ fontSize: 18 }}>🩷</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Status Haid</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                Shalat &amp; Quran otomatis ✓ saat haid
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 12, border: `1px solid ${activeHaid ? '#fda4af' : C.border}`,
            background: activeHaid ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.04)',
            padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              {activeHaid ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fda4af' }}>🩷 Sedang haid</div>
                  <div style={{ fontSize: 11, color: '#fb7185', marginTop: 2 }}>
                    Mulai: {new Date(activeHaid.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Tidak sedang haid</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Tekan tombol saat haid dimulai</div>
                </>
              )}
            </div>
            <button
              onClick={handleToggleHaid}
              disabled={haidLoading}
              style={{
                ...btnStyle(activeHaid ? '#f43f5e' : '#059669'),
                opacity: haidLoading ? 0.6 : 1, flexShrink: 0,
              }}
            >
              {haidLoading ? '...' : activeHaid ? 'Selesai Haid' : 'Mulai Haid'}
            </button>
          </div>

          {haidErr && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{haidErr}</p>}
          {haidOk  && <p style={{ fontSize: 12, color: '#6ee7b7', margin: 0 }}>{haidOk}</p>}

          {/* Riwayat haid */}
          {(student.haidPeriods || []).filter(p => p.endDate).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, marginBottom: 6 }}>RIWAYAT HAID</div>
              {(student.haidPeriods || [])
                .filter(p => p.endDate)
                .slice(0, 6)
                .map(p => (
                  <div key={p.id} style={{
                    fontSize: 12, color: C.muted, padding: '6px 0',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {new Date(p.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' – '}
                    {new Date(p.endDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function BlpSiswaDashboardScreen({ navigate, goBack, view = 'harian' }) {
  const { user }                         = useAuth()
  const { data, loading, error, loadDashboard } = useBlpData()
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => { loadDashboard() }, [])

  // Listen untuk reload event dari TabPengaturan (haid toggle)
  useEffect(() => {
    const handler = () => loadDashboard({ force: true })
    window.addEventListener('blp:reload', handler)
    return () => window.removeEventListener('blp:reload', handler)
  }, [loadDashboard])

  const today = getJakartaToday()
  const selectedMonth = today.slice(0, 7) // YYYY-MM

  const student = useMemo(() =>
    data ? Object.values(data.students || {})[0] : null,
  [data])

  const blpPeriods = data?.blpPeriods || {}

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
      <div style={{ color: C.muted, fontSize: 14 }}>Data siswa tidak ditemukan.</div>
      <button onClick={goBack} style={{
        background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px',
        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Kembali</button>
    </div>
  )

  const handleSaveProfile = async (photoUrl, bio) => {
    const res = await fetch(`/api/blp/students/${student.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ photoUrl, bio }),
    })
    if (!res.ok) {
      const j = await res.json()
      throw new Error(j.error || 'Gagal menyimpan profil')
    }
    loadDashboard({ force: true })
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg, color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{ background: C.navBg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Kiri */}
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

          {/* Kanan: avatar / edit profil */}
          <button
            onClick={() => setShowProfileModal(true)}
            title="Edit Profil"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: student.photoUrl ? 'none' : 'linear-gradient(135deg,#10b981,#0d9488)',
              border: 'none', cursor: 'pointer', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 11, color: '#fff',
              padding: 0,
            }}
          >
            {student.photoUrl
              ? <img src={student.photoUrl} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(student.name || user?.name || '')}
          </button>
        </div>

      </div>

      {/* ── Konten ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {view === 'harian' && (
          <TabHarian student={student} today={today} />
        )}
        {view === 'kalender' && (
          <TabKalender student={student} />
        )}
        {view === 'pengaturan' && (
          <TabPengaturan
            student={student}
            onEditProfil={() => setShowProfileModal(true)}
            selectedMonth={selectedMonth}
            blpPeriods={blpPeriods}
          />
        )}
      </div>

      {/* ── ProfileModal ── */}
      {showProfileModal && (
        <ProfileModal
          name={student.name || user?.name || ''}
          currentPhotoUrl={student.photoUrl || null}
          currentBio={student.bio || null}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}
