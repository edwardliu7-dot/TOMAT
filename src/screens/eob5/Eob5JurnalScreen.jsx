import { useState, useEffect, useMemo, useContext } from 'react'
import { AuthContext } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.05)',
}

const inp  = { background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: '#fff', fontFamily: 'inherit', fontSize: 13, boxSizing: 'border-box', width: '100%', outline: 'none' }
const lblSt = { display: 'block', fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5, letterSpacing: 0.5 }

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum']
const MANUAL_VALUE = '__manual__'

function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}
function fmtDate(str) {
  if (!str) return ''
  try { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str.slice(0, 10) + 'T00:00:00')) }
  catch { return str }
}

export default function Eob5JurnalScreen({ navigate, goBack }) {
  const { user } = useContext(AuthContext)

  // ── Data ──
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [journals, setJournals] = useState([])
  const [prosemItems, setProsemItems] = useState({}) // { `subjectId_kelas`: [...items] }
  const [loading, setLoading] = useState(true)

  // ── Filters ──
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterKelas, setFilterKelas]     = useState('all')

  // ── Form state ──
  const [showModal, setShowModal]     = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [form, setForm]               = useState({ subjectId: '', tanggal: todayStr(), kelas: '', materi: '', catatan: '', prosemItemId: '' })
  const [formError, setFormError]     = useState('')
  const [formSaving, setFormSaving]   = useState(false)

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>Akses hanya untuk guru.</div>
  }

  const loadJournals = () =>
    fetch('/api/eob5/journal', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setJournals(Array.isArray(data) ? data : []))
      .catch(() => {})

  // Initial load
  useEffect(() => {
    Promise.all([
      fetch('/api/eob5/subjects',     { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/eob5/siswa/list',   { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/eob5/journal',      { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([subj, studs, jour]) => {
      setSubjects(Array.isArray(subj)  ? subj  : [])
      setStudents(Array.isArray(studs) ? studs : [])
      setJournals(Array.isArray(jour)  ? jour  : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Load prosem items when subject+kelas combo is selected in form
  useEffect(() => {
    const { subjectId, kelas } = form
    if (!subjectId || !kelas) return
    const key = `${subjectId}_${kelas}`
    if (prosemItems[key] !== undefined) return
    fetch(`/api/eob5/prosem?subject_id=${subjectId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        const prosem = arr.find(p => p.kelas === kelas)
        if (!prosem) { setProsemItems(prev => ({ ...prev, [key]: [] })); return }
        const items = Array.isArray(prosem.konten) ? prosem.konten : []
        setProsemItems(prev => ({ ...prev, [key]: items }))
      }).catch(() => setProsemItems(prev => ({ ...prev, [`${subjectId}_${kelas}`]: [] })))
  }, [form.subjectId, form.kelas])

  // Derived
  const kelasList = useMemo(() => [...new Set(students.map(s => s.kelas).filter(Boolean))].sort(), [students])

  const filteredJournals = useMemo(() => journals.filter(j => {
    const matchSubj  = filterSubject === 'all' || String(j.subject_id) === String(filterSubject)
    const matchKelas = filterKelas   === 'all' || j.kelas === filterKelas
    return matchSubj && matchKelas
  }), [journals, filterSubject, filterKelas])

  // Week progress
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // Monday

  const daysRecorded = useMemo(() => {
    const recorded = new Set()
    for (const j of journals) {
      const d = new Date(j.tanggal.slice(0, 10) + 'T00:00:00')
      const diff = Math.floor((d - startOfWeek) / (1000 * 60 * 60 * 24))
      if (diff >= 0 && diff < 5) recorded.add(diff)
    }
    return recorded
  }, [journals])

  const weekProgress = Math.round((daysRecorded.size / 5) * 100)

  const bulanIniCount = useMemo(() => journals.filter(j => {
    const d = new Date(j.tanggal.slice(0, 10) + 'T00:00:00')
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }).length, [journals])

  const currentProsemItems = useMemo(() => {
    if (!form.subjectId || !form.kelas) return []
    return prosemItems[`${form.subjectId}_${form.kelas}`] || []
  }, [form.subjectId, form.kelas, prosemItems])

  const openNew = () => {
    setEditingId(null)
    setForm({ subjectId: subjects[0] ? String(subjects[0].id) : '', tanggal: todayStr(), kelas: '', materi: '', catatan: '', prosemItemId: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (j) => {
    setEditingId(j.id)
    setForm({
      subjectId:   String(j.subject_id ?? ''),
      tanggal:     (j.tanggal || todayStr()).slice(0, 10),
      kelas:       j.kelas || '',
      materi:      j.materi || '',
      catatan:     j.catatan || '',
      prosemItemId: j.prosem_item_id ? String(j.prosem_item_id) : '',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subjectId)               { setFormError('Mata pelajaran harus dipilih'); return }
    if (!form.tanggal)                 { setFormError('Tanggal harus diisi'); return }
    if (!form.kelas.trim())            { setFormError('Kelas harus diisi'); return }
    if (!form.prosemItemId && !form.materi.trim()) { setFormError('Isi materi atau pilih topik dari Prosem'); return }

    setFormSaving(true); setFormError('')
    try {
      const body = {
        subject_id: form.subjectId,
        tanggal:    form.tanggal,
        kelas:      form.kelas.trim(),
        materi:     form.materi || '',
        catatan:    form.catatan || '',
      }
      if (form.prosemItemId && form.prosemItemId !== MANUAL_VALUE) body.prosem_item_id = form.prosemItemId

      const url    = editingId ? `/api/eob5/journal/${editingId}` : '/api/eob5/journal'
      const method = editingId ? 'PATCH' : 'POST'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) {
        setShowModal(false)
        setEditingId(null)
        await loadJournals()
      } else {
        const d = await r.json()
        setFormError(d.error || 'Gagal menyimpan jurnal')
      }
    } catch { setFormError('Terjadi kesalahan jaringan') }
    setFormSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus jurnal ini?')) return
    try {
      const r = await fetch(`/api/eob5/journal/${id}`, { method: 'DELETE', credentials: 'include' })
      if (r.ok) await loadJournals()
    } catch { /* silent */ }
  }

  const subjectName = (id) => subjects.find(s => String(s.id) === String(id))?.name ?? '—'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {goBack && <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Jurnal Mengajar</div>
        </div>
        <button onClick={openNew} style={{
          background: C.primary, border: 'none', borderRadius: 20, padding: '8px 16px',
          color: '#1a0f00', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ＋ Tulis Jurnal
        </button>
      </div>

      <div style={{ padding: 16 }}>

        {/* Week Progress Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Progres Pekan Ini</div>
              <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{daysRecorded.size} dari 5 hari tercatat</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.primary, lineHeight: 1 }}>
              {weekProgress}<span style={{ fontSize: 13, color: C.sub }}>%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: daysRecorded.has(idx) ? C.primary : 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: daysRecorded.has(idx) ? C.primary : C.sub, textTransform: 'uppercase' }}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{journals.length}</div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
          </div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{bulanIniCount}</div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase' }}>Bulan Ini</div>
          </div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#8b5cf6' }}>{subjects.length}</div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase' }}>Mapel</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={lblSt}>Mapel</label>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={inp}>
              <option value="all">Semua Mapel</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={lblSt}>Kelas</label>
            <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} style={inp}>
              <option value="all">Semua Kelas</option>
              {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {/* Journal List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>⏳ Memuat jurnal…</div>
        ) : filteredJournals.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Belum ada jurnal</div>
            <div style={{ fontSize: 12 }}>Tulis jurnal pertama Anda hari ini!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredJournals.map(j => (
              <div key={j.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '12px 14px',
                borderLeft: `3px solid ${C.primary}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: C.dim, borderRadius: 5, padding: '2px 7px', border: `1px solid ${C.border}` }}>
                        {j.kelas}
                      </span>
                      <span style={{ fontSize: 11, color: C.sub }}>{j.subject_name || subjectName(j.subject_id)}</span>
                      {j.prosem_item_id && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', borderRadius: 4, padding: '1px 5px' }}>
                          📝 Prosem
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {j.materi || '(tanpa judul materi)'}
                    </div>
                    {j.catatan && (
                      <div style={{ fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {j.catatan}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>
                      📅 {fmtDate(j.tanggal)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => openEdit(j)} title="Edit" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✏️</button>
                    <button onClick={() => handleDelete(j.id)} title="Hapus" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditingId(null) } }}
        >
          <div style={{
            background: '#1a1200', border: `1px solid ${C.border}`,
            borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: '24px 20px 32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                {editingId ? '✏️ Edit Jurnal' : '📖 Tulis Jurnal Baru'}
              </div>
              <button onClick={() => { setShowModal(false); setEditingId(null) }} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Mata Pelajaran */}
              <div>
                <label style={lblSt}>Mata Pelajaran <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  value={form.subjectId}
                  onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, prosemItemId: '' }))}
                  style={inp}
                >
                  <option value="">Pilih mata pelajaran</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Tanggal + Kelas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lblSt}>Tanggal <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lblSt}>Kelas <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="mis. VII A"
                    value={form.kelas}
                    onChange={e => setForm(f => ({ ...f, kelas: e.target.value, prosemItemId: '' }))}
                    style={inp}
                    list="jurnal-kelas-list"
                  />
                  <datalist id="jurnal-kelas-list">
                    {kelasList.map(k => <option key={k} value={k} />)}
                  </datalist>
                </div>
              </div>

              {/* Prosem topic picker */}
              {form.subjectId && form.kelas && (
                <div>
                  <label style={lblSt}>Topik dari Prosem (Opsional)</label>
                  {currentProsemItems.length === 0 ? (
                    <div style={{ fontSize: 12, color: C.sub, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${C.border}` }}>
                      Belum ada Prosem untuk mapel &amp; kelas ini. Isi materi secara manual.
                    </div>
                  ) : (
                    <>
                      <select
                        value={form.prosemItemId || MANUAL_VALUE}
                        onChange={e => {
                          const v = e.target.value
                          if (v === MANUAL_VALUE) {
                            setForm(f => ({ ...f, prosemItemId: '' }))
                          } else {
                            const item = currentProsemItems.find((it, idx) => String(it.id ?? idx) === v)
                            setForm(f => ({ ...f, prosemItemId: v, materi: item?.materi || f.materi }))
                          }
                        }}
                        style={inp}
                      >
                        <option value={MANUAL_VALUE}>Materi manual (tidak dari Prosem)</option>
                        {currentProsemItems.map((item, idx) => (
                          <option key={item.id ?? idx} value={String(item.id ?? idx)}>
                            {item.kd ? `${item.kd} — ` : ''}{item.materi}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>
                        Memilih topik akan menandai realisasi materi pada Info Pekanan.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Materi — only when no prosem item selected */}
              {!form.prosemItemId && (
                <div>
                  <label style={lblSt}>Materi</label>
                  <input
                    type="text"
                    placeholder="Topik bahasan hari ini"
                    value={form.materi}
                    onChange={e => setForm(f => ({ ...f, materi: e.target.value }))}
                    style={inp}
                  />
                </div>
              )}

              {/* Catatan */}
              <div>
                <label style={lblSt}>Catatan (Opsional)</label>
                <textarea
                  placeholder="Keterangan tambahan, hambatan, atau rencana tindak lanjut"
                  value={form.catatan}
                  onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                  rows={3}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fca5a5' }}>
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null) }} style={{
                  background: 'none', border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '9px 18px', color: C.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>Batal</button>
                <button type="submit" disabled={formSaving} style={{
                  background: formSaving ? C.dim : C.primary, border: 'none', borderRadius: 10,
                  padding: '9px 20px', color: '#1a0f00', fontSize: 13, fontWeight: 800,
                  cursor: formSaving ? 'default' : 'pointer', fontFamily: 'inherit',
                }}>
                  {formSaving ? '⏳ Menyimpan…' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
