import { useState, useEffect, useMemo, useContext } from 'react'
import { AuthContext } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.05)',
}

const inp = {
  background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
  borderRadius: 8, padding: '8px 10px', color: '#fff',
  fontFamily: 'inherit', fontSize: 13, boxSizing: 'border-box',
}

function fmt1(v) {
  if (v === null || v === undefined) return '-'
  const n = Number(v)
  if (isNaN(n)) return '-'
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function gradeKey(jenis, lm, tp) {
  return `${jenis}|${lm ?? '-'}|${tp ?? '-'}`
}

function GradeCell({ value, onSave, disabled }) {
  const [local, setLocal] = useState(value === null || value === undefined ? '' : String(value))

  useEffect(() => {
    setLocal(value === null || value === undefined ? '' : String(value))
  }, [value])

  const cellStyle = {
    width: 52, height: 30, textAlign: 'center', padding: '0 2px',
    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${C.border}`, borderRadius: 6, color: '#fff',
    fontFamily: 'inherit', fontSize: 12, boxSizing: 'border-box',
    opacity: disabled ? 0.4 : 1,
  }

  return (
    <input
      type="number" min={0} max={100}
      disabled={!!disabled}
      value={local}
      style={cellStyle}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim()
        const parsed = trimmed === '' ? null : Number(trimmed)
        if (parsed !== null && (isNaN(parsed) || parsed < 0 || parsed > 100)) {
          setLocal(value === null || value === undefined ? '' : String(value))
          return
        }
        const orig = value === null || value === undefined ? null : value
        if (parsed === orig) return
        onSave(parsed)
      }}
    />
  )
}

export default function Eob5NilaiScreen({ navigate, goBack }) {
  const { user } = useContext(AuthContext)
  const [subjects, setSubjects]     = useState([])
  const [students, setStudents]     = useState([])
  const [calendars, setCalendars]   = useState([])
  const [grades, setGrades]         = useState([])
  const [tpList, setTpList]         = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const [kelasFilter, setKelasFilter] = useState('')
  const [subjectId, setSubjectId]     = useState('')
  const [calendarId, setCalendarId]   = useState('')
  const [msg, setMsg]                 = useState({ type: '', text: '' })

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>Akses hanya untuk guru.</div>
  }

  // Load static data once
  useEffect(() => {
    Promise.all([
      fetch('/api/eob5/siswa/list',          { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/eob5/subjects',            { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/eob5/academic-calendars',  { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([studs, subj, cal]) => {
      const studsArr = Array.isArray(studs) ? studs : []
      const subjArr  = Array.isArray(subj)  ? subj  : []
      const calArr   = Array.isArray(cal)   ? cal   : []
      setStudents(studsArr)
      setSubjects(subjArr)
      setCalendars(calArr)
      if (calArr.length) setCalendarId(String(calArr[0].id))
      const kelas = [...new Set(studsArr.map(s => s.kelas))].sort()
      if (kelas.length) setKelasFilter(kelas[0])
    }).catch(() => {})
  }, [])

  const kelasList = useMemo(() => [...new Set(students.map(s => s.kelas))].sort(), [students])

  const filteredSubjects = useMemo(() =>
    subjects.filter(s => !kelasFilter || (s.name || '').toLowerCase().includes(kelasFilter.toLowerCase())),
    [subjects, kelasFilter])

  // Auto-select subject when kelas changes
  useEffect(() => {
    if (!filteredSubjects.length) return
    const still = filteredSubjects.some(s => String(s.id) === subjectId)
    if (!still) setSubjectId(String(filteredSubjects[0].id))
  }, [filteredSubjects])

  useEffect(() => {
    if (!subjectId && filteredSubjects.length) setSubjectId(String(filteredSubjects[0].id))
  }, [filteredSubjects, subjectId])

  useEffect(() => {
    if (!calendarId && calendars.length) setCalendarId(String(calendars[0].id))
  }, [calendars])

  const kelasStudents = useMemo(() =>
    students.filter(s => s.kelas === kelasFilter)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [students, kelasFilter])

  const ready = !!subjectId && !!calendarId && !!kelasFilter

  // Load grades + TP when filters change
  useEffect(() => {
    if (!ready) return
    setLoadingData(true)
    Promise.all([
      fetch(`/api/eob5/grades?subjectId=${subjectId}&calendarId=${calendarId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/eob5/tujuan-pembelajaran?subjectId=${subjectId}&calendarId=${calendarId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([g, tp]) => {
      setGrades(Array.isArray(g) ? g : [])
      setTpList(Array.isArray(tp) ? tp : [])
      setLoadingData(false)
    }).catch(() => setLoadingData(false))
  }, [subjectId, calendarId, ready])

  const LM_LIST = useMemo(() => {
    const s = new Set(tpList.map(tp => tp.lingkup_materi ?? tp.lingkupMateri).filter(v => v != null))
    return [...s].sort((a, b) => a - b)
  }, [tpList])

  const tpByLM = useMemo(() => {
    const map = new Map()
    for (const tp of tpList) {
      const lm   = tp.lingkup_materi ?? tp.lingkupMateri
      const tpNum = tp.tp_number ?? tp.tpNumber
      if (lm == null || tpNum == null) continue
      const arr = map.get(lm) ?? []
      arr.push(tpNum)
      map.set(lm, arr)
    }
    for (const arr of map.values()) arr.sort((a, b) => a - b)
    return map
  }, [tpList])

  const gradeMap = useMemo(() => {
    const map = new Map()
    for (const g of grades) {
      const studentId = g.student_id ?? g.studentId
      const lm  = g.lingkup_materi ?? g.lingkupMateri ?? null
      const tp  = g.tp_number     ?? g.tpNumber       ?? null
      map.set(`${studentId}::${gradeKey(g.jenis, lm, tp)}`, g)
    }
    return map
  }, [grades])

  const invalidate = () => {
    if (!ready) return
    fetch(`/api/eob5/grades?subjectId=${subjectId}&calendarId=${calendarId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : []).then(g => setGrades(Array.isArray(g) ? g : [])).catch(() => {})
  }

  const saveCell = async (studentId, jenis, lingkupMateri, tpNumber, nilai) => {
    const existing = gradeMap.get(`${studentId}::${gradeKey(jenis, lingkupMateri, tpNumber)}`)
    try {
      if (nilai === null) {
        if (existing) {
          await fetch(`/api/eob5/grades/${existing.id}`, { method: 'DELETE', credentials: 'include' })
          invalidate()
        }
        return
      }
      const body = { studentId, subjectId, calendarId, jenis, nilai }
      if (lingkupMateri !== null) body.lingkupMateri = lingkupMateri
      if (tpNumber !== null) body.tpNumber = tpNumber
      const r = await fetch('/api/eob5/grades', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) {
        invalidate()
      } else {
        const d = await r.json()
        setMsg({ type: 'error', text: d.error || 'Nilai tidak tersimpan' })
        setTimeout(() => setMsg({ type: '', text: '' }), 3000)
      }
    } catch {
      setMsg({ type: 'error', text: 'Gagal menyimpan nilai' })
      setTimeout(() => setMsg({ type: '', text: '' }), 3000)
    }
  }

  const computeStats = (studentId) => {
    const allValues = []
    const sumatifComponents = []

    for (const lm of LM_LIST) {
      for (const tp of tpByLM.get(lm) ?? []) {
        const g = gradeMap.get(`${studentId}::${gradeKey('formatif', lm, tp)}`)
        if (g) allValues.push(g.nilai)
      }
    }

    let sumatifLmSum = 0, sumatifLmCount = 0
    for (const lm of LM_LIST) {
      const g = gradeMap.get(`${studentId}::${gradeKey('sumatif_lm', lm, null)}`)
      if (g) { allValues.push(g.nilai); sumatifLmSum += g.nilai; sumatifLmCount++ }
    }
    if (sumatifLmCount > 0) sumatifComponents.push(sumatifLmSum / sumatifLmCount)

    const tengah = gradeMap.get(`${studentId}::${gradeKey('sumatif_tengah', null, null)}`)
    if (tengah) { allValues.push(tengah.nilai); sumatifComponents.push(tengah.nilai) }

    const akhir = gradeMap.get(`${studentId}::${gradeKey('sumatif_akhir', null, null)}`)
    if (akhir) { allValues.push(akhir.nilai); sumatifComponents.push(akhir.nilai) }

    const rataRata   = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null
    const nilaiRaport = sumatifComponents.length > 0 ? sumatifComponents.reduce((a, b) => a + b, 0) / sumatifComponents.length : null
    return { rataRata, jumlah: allValues.length, nilaiRaport }
  }

  const nilaiStats = useMemo(() => {
    const all = grades.map(g => g.nilai).filter(v => typeof v === 'number')
    if (!all.length) return null
    const avg   = all.reduce((a, b) => a + b, 0) / all.length
    const tuntas = all.filter(v => v >= 75).length
    return {
      avg: avg.toFixed(1),
      max: Math.max(...all),
      min: Math.min(...all),
      pctTuntas: Math.round((tuntas / all.length) * 100),
    }
  }, [grades])

  const selectedSubjectName = subjects.find(s => String(s.id) === subjectId)?.name ?? ''
  const selectedCalendar    = calendars.find(c => String(c.id) === calendarId)

  const thSt = {
    padding: '8px 6px', textAlign: 'center', color: C.sub, fontWeight: 700, fontSize: 11,
    borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
    background: 'rgba(245,158,11,0.08)', position: 'sticky', top: 0, zIndex: 2,
  }
  const tdSt = { padding: '6px 4px', border: `1px solid ${C.border}22`, textAlign: 'center', verticalAlign: 'middle' }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {goBack && <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Data Nilai</div>
        </div>
        <div style={{ fontSize: 11, color: C.sub }}>Formatif · Sumatif · Raport</div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Filters */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Kelas</div>
            <select value={kelasFilter} onChange={e => setKelasFilter(e.target.value)} style={inp}>
              <option value="">Pilih Kelas</option>
              {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Mata Pelajaran</div>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ ...inp, width: '100%' }}>
              <option value="">Pilih Mapel</option>
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              {!filteredSubjects.length && <option disabled>Tidak ada mapel untuk kelas ini</option>}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Semester</div>
            <select value={calendarId} onChange={e => setCalendarId(e.target.value)} style={inp}>
              <option value="">Pilih Semester</option>
              {calendars.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama || `${c.tahun_ajaran ?? c.tahunAjaran} Sem.${c.semester}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {msg.text && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#fca5a5' }}>
            {msg.text}
          </div>
        )}

        {/* Stats summary */}
        {nilaiStats && ready && !loadingData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Rata-rata',    value: nilaiStats.avg,         color: '#f59e0b' },
              { label: 'Tertinggi',    value: nilaiStats.max,         color: '#22c55e' },
              { label: 'Terendah',     value: nilaiStats.min,         color: '#ef4444' },
              { label: '% Tuntas (≥75)', value: `${nilaiStats.pctTuntas}%`, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Header info */}
        {selectedCalendar && subjectId && (
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>
            📅 {selectedCalendar.tahun_ajaran || selectedCalendar.tahunAjaran} &nbsp;·&nbsp; Semester {selectedCalendar.semester} &nbsp;·&nbsp; {selectedSubjectName} &nbsp;·&nbsp; {kelasFilter}
          </div>
        )}

        {/* Table */}
        {!calendars.length ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>
            Belum ada kalender akademik. Buat tahun ajaran/semester di halaman Administrasi terlebih dahulu.
          </div>
        ) : !filteredSubjects.length ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>
            Belum ada mata pelajaran untuk kelas ini. Buat mapel di halaman Administrasi.
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>Pilih kelas, mata pelajaran, dan semester.</div>
        ) : loadingData ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>⏳ Memuat data nilai…</div>
        ) : kelasStudents.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>Tidak ada siswa di kelas {kelasFilter}.</div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${C.border}` }}>
            {LM_LIST.length === 0 && (
              <div style={{ padding: '12px 16px', fontSize: 12, color: '#fbbf24', borderBottom: `1px solid ${C.border}` }}>
                ⚠️ Belum ada Tujuan Pembelajaran untuk mapel & semester ini. Tambahkan TP agar kolom Formatif muncul.
              </div>
            )}
            <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: '100%', background: 'rgba(0,0,0,0.2)' }}>
              <thead>
                {/* Row 1: group headers */}
                <tr>
                  <th style={{ ...thSt, textAlign: 'left', padding: '8px 10px' }} rowSpan={2}>No</th>
                  <th style={{ ...thSt, textAlign: 'left', minWidth: 160 }} rowSpan={2}>Nama</th>
                  {LM_LIST.map(lm => {
                    const tps = tpByLM.get(lm) ?? []
                    return tps.length > 0 ? (
                      <th key={lm} colSpan={tps.length} style={{ ...thSt, color: C.primary }}>Formatif LM {lm}</th>
                    ) : null
                  })}
                  {LM_LIST.map(lm => (
                    <th key={lm} style={{ ...thSt, color: '#fbbf24' }} rowSpan={2}>SLM {lm}</th>
                  ))}
                  <th style={{ ...thSt, color: '#a78bfa' }} rowSpan={2}>PTS</th>
                  <th style={{ ...thSt, color: '#a78bfa' }} rowSpan={2}>PAS</th>
                  <th style={{ ...thSt, color: C.primary, background: 'rgba(245,158,11,0.12)' }} rowSpan={2}>Avg</th>
                  <th style={{ ...thSt, color: C.sub }} rowSpan={2}>N</th>
                  <th style={{ ...thSt, color: '#fde047', background: 'rgba(253,224,71,0.1)', minWidth: 64 }} rowSpan={2}>Raport</th>
                </tr>
                {/* Row 2: TP sub-headers */}
                <tr>
                  {LM_LIST.map(lm =>
                    (tpByLM.get(lm) ?? []).map(tp => (
                      <th key={`${lm}-${tp}`} style={{ ...thSt, fontSize: 10 }}>TP{tp}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {kelasStudents.map((s, i) => {
                  const { rataRata, jumlah, nilaiRaport } = computeStats(s.id)
                  const rr = rataRata !== null ? Number(rataRata) : null
                  const nr = nilaiRaport !== null ? Number(nilaiRaport) : null
                  const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                  return (
                    <tr key={s.id} style={{ background: rowBg }}>
                      <td style={{ ...tdSt, textAlign: 'center', color: C.sub, paddingLeft: 10 }}>{i + 1}</td>
                      <td style={{ ...tdSt, textAlign: 'left', paddingLeft: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 160, position: 'sticky', left: 0, background: i % 2 === 0 ? '#1a1200' : '#1e1400' }}>
                        {s.name}
                      </td>
                      {LM_LIST.map(lm =>
                        (tpByLM.get(lm) ?? []).map(tp => (
                          <td key={`${lm}-${tp}`} style={tdSt}>
                            <GradeCell
                              value={gradeMap.get(`${s.id}::${gradeKey('formatif', lm, tp)}`)?.nilai ?? null}
                              onSave={v => saveCell(s.id, 'formatif', lm, tp, v)}
                            />
                          </td>
                        ))
                      )}
                      {LM_LIST.map(lm => (
                        <td key={lm} style={{ ...tdSt, background: 'rgba(251,191,36,0.05)' }}>
                          <GradeCell
                            value={gradeMap.get(`${s.id}::${gradeKey('sumatif_lm', lm, null)}`)?.nilai ?? null}
                            onSave={v => saveCell(s.id, 'sumatif_lm', lm, null, v)}
                          />
                        </td>
                      ))}
                      <td style={{ ...tdSt, background: 'rgba(167,139,250,0.05)' }}>
                        <GradeCell
                          value={gradeMap.get(`${s.id}::${gradeKey('sumatif_tengah', null, null)}`)?.nilai ?? null}
                          onSave={v => saveCell(s.id, 'sumatif_tengah', null, null, v)}
                        />
                      </td>
                      <td style={{ ...tdSt, background: 'rgba(167,139,250,0.05)' }}>
                        <GradeCell
                          value={gradeMap.get(`${s.id}::${gradeKey('sumatif_akhir', null, null)}`)?.nilai ?? null}
                          onSave={v => saveCell(s.id, 'sumatif_akhir', null, null, v)}
                        />
                      </td>
                      <td style={{ ...tdSt, fontWeight: 700, color: rr !== null ? (rr >= 75 ? '#4ade80' : rr >= 60 ? '#fbbf24' : '#f87171') : C.sub, background: 'rgba(245,158,11,0.06)' }}>
                        {fmt1(rataRata)}
                      </td>
                      <td style={{ ...tdSt, color: C.sub }}>{jumlah || '-'}</td>
                      <td style={{ ...tdSt, fontWeight: 800, fontSize: 13, color: nr !== null ? (nr >= 75 ? '#fde047' : nr >= 60 ? '#fbbf24' : '#f87171') : C.sub, background: 'rgba(253,224,71,0.06)' }}>
                        {fmt1(nilaiRaport)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
          <p>Klik sel untuk mengisi atau mengubah nilai. Kosongkan lalu klik di luar sel untuk menghapus.</p>
          <p><strong style={{ color: C.text }}>Nilai Raport</strong> = rata-rata komponen sumatif (Sumatif LM ÷ jumlah LM, PTS, PAS).</p>
        </div>
      </div>
    </div>
  )
}
