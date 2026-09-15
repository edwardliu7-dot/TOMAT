import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MathText from '../components/MathText'

const inputStyle = {
  width: '100%', boxSizing: 'border-box', background: '#0D1117',
  color: '#fff', border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 10, padding: '10px 11px', font: 'inherit', fontSize: 12,
}
const primary = {
  background: 'linear-gradient(135deg,#34D399,#059669)', color: '#042f2e',
  border: 'none', borderRadius: 10, padding: '10px 14px', font: 'inherit',
  fontSize: 12, fontWeight: 800, cursor: 'pointer',
}
const secondary = {
  background: 'rgba(255,255,255,0.06)', color: '#CBD5E1',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px',
  font: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer',
}

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

function blankQuestion(position = 1) {
  return { position, prompt: '', answerType: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1 }
}

function emptyForm(kelas = '') {
  return { kelas, mataPelajaran: '', title: '', description: '', durationMinutes: 60, questions: [blankQuestion()] }
}

function hasDraftContent(form) {
  return Boolean(
    form.title?.trim()
    || form.mataPelajaran?.trim()
    || form.description?.trim()
    || form.questions?.some(question => (
      question.prompt?.trim()
      || question.correctAnswer?.trim()
      || question.options?.some(option => option?.trim())
    )),
  )
}

function normalizeStoredForm(stored, fallbackClass) {
  if (!stored || typeof stored !== 'object' || !Array.isArray(stored.questions) || stored.questions.length === 0) return null
  return {
    ...emptyForm(stored.kelas || fallbackClass),
    ...stored,
    questions: stored.questions.map((question, index) => ({
      ...blankQuestion(index + 1),
      ...question,
      position: index + 1,
      options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
    })),
  }
}

function QuestionEditor({ question, index, onChange, onRemove, canRemove }) {
  const update = (key, value) => onChange({ ...question, [key]: value })
  const updateOption = (index, value) => {
    const options = [...(question.options || [])]
    options[index] = value
    onChange({ ...question, options })
  }
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 13, background: 'rgba(255,255,255,0.025)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <span style={{ width: 25, height: 25, borderRadius: 8, background: 'rgba(103,232,249,0.13)', color: '#67E8F9', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900 }}>{index + 1}</span>
        <span style={{ color: '#94A3B8', fontSize: 11, flex: 1 }}>Soal</span>
        {canRemove && <button type="button" onClick={onRemove} style={{ ...secondary, color: '#FCA5A5', padding: '5px 8px' }}>Hapus</button>}
      </div>
      <textarea value={question.prompt} onChange={e => update('prompt', e.target.value)} rows={3} maxLength={5000} placeholder="Tulis pertanyaan…" style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
      <div style={{ marginBottom: 8, padding: '10px 11px', borderRadius: 10, border: '1px solid rgba(103,232,249,0.18)', background: 'rgba(103,232,249,0.045)' }}>
        <div style={{ color: '#67E8F9', fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Preview Soal</div>
        <MathText
          value={question.prompt || 'Preview soal akan tampil di sini'}
          style={{ color: question.prompt ? '#F8FAFC' : '#64748B', fontSize: 14, lineHeight: 1.65 }}
        />
        <div style={{ color: '#64748B', fontSize: 10, marginTop: 7 }}>Equation bisa ditulis sebagai <code>$x^2$</code>, <code>$$\frac{'{'}a{'}'}{'{'}b{'}'}$$</code>, atau langsung seperti <code>2^2</code>.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8, marginBottom: 8 }}>
        <select value={question.answerType} onChange={e => update('answerType', e.target.value)} style={inputStyle}>
          <option value="multiple_choice">Pilihan ganda</option>
          <option value="short_answer">Isian singkat</option>
          <option value="true_false">Benar / Salah</option>
        </select>
        <input type="number" min="1" max="100" value={question.points} onChange={e => update('points', e.target.value)} style={inputStyle} title="Poin" />
      </div>
      {question.answerType === 'multiple_choice' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
          {(question.options || []).map((option, optionIndex) => (
            <div key={optionIndex}>
              <input value={option} onChange={e => updateOption(optionIndex, e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + optionIndex)}`} style={inputStyle} />
              {option && <div style={{ color: '#CBD5E1', fontSize: 11, padding: '4px 5px 0', lineHeight: 1.45 }}><MathText value={option} /></div>}
            </div>
          ))}
        </div>
      )}
      {question.answerType === 'true_false' && (
        <select value={question.correctAnswer} onChange={e => update('correctAnswer', e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}>
          <option value="">Pilih kunci jawaban</option>
          <option value="Benar">Benar</option>
          <option value="Salah">Salah</option>
        </select>
      )}
      {question.answerType !== 'true_false' && (
        <input value={question.correctAnswer} onChange={e => update('correctAnswer', e.target.value)} placeholder={question.answerType === 'multiple_choice' ? 'Kunci harus sama persis dengan pilihan' : 'Kunci jawaban'} style={inputStyle} />
      )}
    </div>
  )
}

function statusLabel(status) {
  return status === 'published' ? 'Diterbitkan' : status === 'closed' ? 'Ditutup' : 'Draft'
}

export default function GuruExamScreen({ kelasDiampu = [] }) {
  const [exams, setExams] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(() => emptyForm(kelasDiampu[0] || ''))
  const [editingId, setEditingId] = useState(null)
  const [results, setResults] = useState([])
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const draftHydratedRef = useRef(false)
  const defaultClass = kelasDiampu[0] || ''
  const draftStorageKey = useMemo(
    () => `smartisa_guru_exam_draft_${kelasDiampu.join('|') || 'default'}`,
    [kelasDiampu.join('|')],
  )
  const [draftSavedAt, setDraftSavedAt] = useState(null)

  const selected = useMemo(() => exams.find(exam => exam.id === selectedId) || null, [exams, selectedId])
  const refresh = useCallback(async () => {
    try {
      const { exams: rows } = await apiCall('/api/guru/exams')
      setExams(rows || [])
      if (selectedId && !rows.some(row => row.id === selectedId)) setSelectedId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    draftHydratedRef.current = false
    try {
      const stored = JSON.parse(localStorage.getItem(draftStorageKey) || 'null')
      const restored = normalizeStoredForm(stored?.form, kelasDiampu[0] || '')
      if (restored) {
        setForm(restored)
        setDraftSavedAt(stored.savedAt || null)
      } else {
        setDraftSavedAt(null)
      }
    } catch {
      setDraftSavedAt(null)
    } finally {
      draftHydratedRef.current = true
    }
  }, [draftStorageKey, defaultClass])

  useEffect(() => {
    if (!draftHydratedRef.current) return undefined
    if (!hasDraftContent(form)) {
      try { localStorage.removeItem(draftStorageKey) } catch {}
      setDraftSavedAt(null)
      return undefined
    }
    const timer = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString()
        localStorage.setItem(draftStorageKey, JSON.stringify({ form, savedAt }))
        setDraftSavedAt(savedAt)
      } catch {
        // Draft tetap bisa disimpan manual ke server jika storage browser penuh.
      }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [form, draftStorageKey])

  const startNew = () => {
    setEditingId(null)
    setSelectedId(null)
    setToken('')
    setResults([])
    setForm(emptyForm(kelasDiampu[0] || ''))
    try { localStorage.removeItem(draftStorageKey) } catch {}
    setDraftSavedAt(null)
    setError('')
  }

  const edit = async id => {
    setError('')
    try {
      const { exam, questions } = await apiCall(`/api/guru/exams/${id}`)
      setEditingId(id)
      setSelectedId(id)
      setToken('')
      setForm({
        kelas: exam.kelas, mataPelajaran: exam.mataPelajaran || 'Matematika', title: exam.title, description: exam.description || '',
        durationMinutes: exam.durationMinutes,
        questions: questions.map(question => ({
          position: question.position, prompt: question.prompt, answerType: question.answerType,
          options: question.options || ['', '', '', ''], correctAnswer: question.correctAnswer || '', points: question.points,
        })),
      })
    } catch (err) { setError(err.message) }
  }

  const save = async event => {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const data = await apiCall(editingId ? `/api/guru/exams/${editingId}` : '/api/guru/exams', {
        method: editingId ? 'PATCH' : 'POST', body: form,
      })
      setEditingId(data.exam.id)
      setSelectedId(data.exam.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  const importWord = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImporting(true); setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await apiCall('/api/guru/exams/import-docx', { method: 'POST', body })
      setForm(current => ({ ...current, questions: data.questions }))
    } catch (err) {
      setError(err.message)
    } finally { setImporting(false) }
  }

  const publish = async () => {
    if (!selected) return
    setError('')
    try {
      await apiCall(`/api/guru/exams/${selected.id}/publish`, { method: 'POST' })
      await refresh()
    } catch (err) { setError(err.message) }
  }

  const closeExam = async () => {
    if (!selected) return
    try {
      await apiCall(`/api/guru/exams/${selected.id}/close`, { method: 'POST' })
      await refresh()
    } catch (err) { setError(err.message) }
  }

  const deleteDraft = async () => {
    if (!selected || selected.status !== 'draft') return
    const confirmed = window.confirm(`Hapus draft "${selected.title}"?\nSemua soal di dalam draft ini akan dihapus dan tidak dapat dipulihkan.`)
    if (!confirmed) return
    setSaving(true)
    setError('')
    try {
      await apiCall(`/api/guru/exams/${selected.id}`, { method: 'DELETE' })
      try { localStorage.removeItem(draftStorageKey) } catch {}
      setDraftSavedAt(null)
      setEditingId(null)
      setSelectedId(null)
      setToken('')
      setResults([])
      setForm(emptyForm(defaultClass))
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const generateToken = async () => {
    if (!selected) return
    try {
      const data = await apiCall(`/api/guru/exams/${selected.id}/token`, { method: 'POST' })
      setToken(data.token)
    } catch (err) { setError(err.message) }
  }

  const showResults = async id => {
    setSelectedId(id)
    try {
      const data = await apiCall(`/api/guru/exams/${id}/results`)
      setResults(data.attempts || [])
    } catch (err) { setError(err.message) }
  }

  const updateQuestion = (index, question) => setForm(current => ({
    ...current, questions: current.questions.map((item, itemIndex) => itemIndex === index ? question : item),
  }))

  return (
    <div style={{ minHeight: '100%', overflowY: 'auto', padding: '28px clamp(16px, 4vw, 42px) 60px', color: '#CBD5E1' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ color: '#9fe3bd', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>Ruang Guru · Penilaian</div>
            <h1 style={{ color: '#fff', fontSize: 25, margin: '5px 0 6px' }}>Mode Ujian</h1>
            <div style={{ color: '#64748B', fontSize: 12, lineHeight: 1.55 }}>Buat soal manual atau impor dokumen Word. Siswa memakai satu token bersama, tetapi setiap attempt tetap terikat ke akun dan kelasnya.</div>
          </div>
          <button type="button" onClick={startNew} style={primary}>＋ Ujian Baru</button>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', color: '#FCA5A5', borderRadius: 11, padding: '10px 12px', fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 0.75fr) minmax(320px, 1.25fr)', gap: 16, alignItems: 'start' }}>
          <section style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 15 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 11 }}>Daftar Ujian</div>
            {loading ? <div style={{ color: '#64748B', fontSize: 12 }}>Memuat…</div> : exams.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: 12, lineHeight: 1.5 }}>Belum ada ujian. Buat ujian pertama untuk kelas yang Anda ampu.</div>
            ) : exams.map(exam => (
              <button key={exam.id} type="button" onClick={() => exam.status === 'draft' ? edit(exam.id) : showResults(exam.id)} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: '#CBD5E1',
                background: selectedId === exam.id ? 'rgba(103,232,249,0.09)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${selectedId === exam.id ? 'rgba(103,232,249,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 11, padding: '11px 12px', marginBottom: 7,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: 12, flex: 1 }}>{exam.title}</strong>
                  <span style={{ color: exam.status === 'published' ? '#34D399' : exam.status === 'closed' ? '#FCA5A5' : '#FBBF24', fontSize: 9, fontWeight: 800 }}>{statusLabel(exam.status)}</span>
                </div>
                 <div style={{ color: '#64748B', fontSize: 10, marginTop: 5 }}>{exam.mataPelajaran || 'Matematika'} · {exam.kelas} · {exam.questionCount} soal · {exam.submittedCount || 0}/{exam.attemptCount || 0} terkumpul</div>
              </button>
            ))}
          </section>

          <section style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, flex: 1 }}>{editingId ? 'Edit Draft Ujian' : 'Buat Ujian'}</div>
              {editingId && selected?.status === 'draft' && <span style={{ color: '#FBBF24', fontSize: 10 }}>DRAFT</span>}
               {draftSavedAt && <span style={{ color: '#5eead4', fontSize: 10 }}>✓ Draft otomatis tersimpan</span>}
            </div>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 8, marginBottom: 8 }}>
                <select required value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} style={inputStyle}>
                  {kelasDiampu.map(kelas => <option key={kelas} value={kelas}>{kelas}</option>)}
                </select>
                <input required type="number" min="1" max="480" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} style={inputStyle} placeholder="Menit" />
              </div>
               <input required maxLength={100} value={form.mataPelajaran} onChange={e => setForm({ ...form, mataPelajaran: e.target.value })} placeholder="Nama mata pelajaran, contoh: Matematika" style={{ ...inputStyle, marginBottom: 8 }} />
              <input required maxLength={160} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul ujian" style={{ ...inputStyle, marginBottom: 8 }} />
              <textarea maxLength={2000} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Petunjuk untuk siswa (opsional)" style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={importing} style={secondary}>{importing ? 'Menganalisis Word…' : '📄 Impor Word + AI'}</button>
                <input ref={fileRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={importWord} style={{ display: 'none' }} />
                <span style={{ color: '#64748B', fontSize: 10, alignSelf: 'center' }}>Hasil AI tetap harus diperiksa sebelum disimpan.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {form.questions.map((question, index) => (
                  <QuestionEditor key={index} index={index} question={question} canRemove={form.questions.length > 1}
                    onChange={next => updateQuestion(index, next)}
                    onRemove={() => setForm(current => ({ ...current, questions: current.questions.filter((_, itemIndex) => itemIndex !== index) }))} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 11, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setForm(current => ({ ...current, questions: [...current.questions, blankQuestion(current.questions.length + 1)] }))} style={secondary}>＋ Tambah Soal</button>
                <button type="submit" disabled={saving || selected?.status === 'published'} style={{ ...primary, opacity: saving || selected?.status === 'published' ? 0.5 : 1 }}>{saving ? 'Menyimpan…' : editingId ? 'Simpan Draft' : 'Simpan Ujian'}</button>
              </div>
            </form>
          </section>
        </div>

        {selected && (
          <section style={{ background: '#111827', border: '1px solid rgba(159,227,189,0.14)', borderRadius: 16, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>{selected.title}</div>
                 <div style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>{selected.mataPelajaran || 'Matematika'} · {selected.kelas} · {selected.questionCount} soal · {selected.durationMinutes} menit</div>
              </div>
              {selected.status === 'draft' && <button type="button" onClick={() => edit(selected.id)} style={secondary}>✏️ Edit</button>}
              {selected.status === 'draft' && <button type="button" onClick={publish} style={primary}>Terbitkan</button>}
              {selected.status === 'draft' && <button type="button" onClick={deleteDraft} disabled={saving} style={{ ...secondary, color: '#FCA5A5', borderColor: 'rgba(248,113,113,0.35)', opacity: saving ? 0.55 : 1 }}>🗑️ Hapus Draft</button>}
              {selected.status === 'published' && <button type="button" onClick={closeExam} style={{ ...secondary, color: '#FCA5A5' }}>Tutup Ujian</button>}
              {selected.status === 'published' && <button type="button" onClick={generateToken} style={secondary}>🔑 {token ? 'Ganti Token' : 'Buat Token'}</button>}
            </div>
            {token && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 13, padding: 13, borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.24)', flexWrap: 'wrap' }}>
              <span style={{ color: '#94A3B8', fontSize: 11 }}>Token bersama kelas:</span>
              <strong style={{ color: '#34D399', fontSize: 22, letterSpacing: 4 }}>{token}</strong>
              <span style={{ color: '#64748B', fontSize: 10 }}>Simpan/cetak token ini. Token lama langsung tidak berlaku saat diganti.</span>
            </div>}
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 13 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, marginBottom: 9 }}>Monitoring & Hasil</div>
              {results.length === 0 ? <div style={{ color: '#64748B', fontSize: 11 }}>Belum ada attempt siswa atau klik ujian lagi untuk memuat data terbaru.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ color: '#64748B', textAlign: 'left' }}><th style={{ padding: 7 }}>Siswa</th><th style={{ padding: 7 }}>Status</th><th style={{ padding: 7 }}>Jawaban</th><th style={{ padding: 7 }}>Nilai</th><th style={{ padding: 7 }}>Aktivitas</th></tr></thead>
                    <tbody>{results.map(row => <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 7, color: '#fff' }}>{row.name}<div style={{ color: '#64748B', fontSize: 9 }}>{row.kelas}</div></td>
                      <td style={{ padding: 7, color: row.status === 'submitted' ? '#34D399' : row.status === 'expired' ? '#FCA5A5' : '#FBBF24' }}>{row.status}</td>
                      <td style={{ padding: 7 }}>{row.answered_count || 0}/{selected.questionCount}</td>
                      <td style={{ padding: 7, color: '#67E8F9', fontWeight: 800 }}>{row.score ?? '—'}</td>
                      <td style={{ padding: 7, color: '#64748B' }}>{row.last_seen_at ? new Date(row.last_seen_at).toLocaleString('id-ID') : '—'}</td>
                    </tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}