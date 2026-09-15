import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/shared'
import MathText from '../components/MathText'

const inputStyle = {
  width: '100%', boxSizing: 'border-box', background: '#0D1B2A', color: '#fff',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px',
  font: 'inherit', fontSize: 14,
}

function localKey(attemptId) { return `smartisa_exam_attempt_${attemptId}` }

let examDbPromise
function openExamDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (!examDbPromise) {
    examDbPromise = new Promise(resolve => {
      const request = indexedDB.open('smartisa-exams', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('attempts', { keyPath: 'id' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    })
  }
  return examDbPromise
}

async function localSave(attemptId, payload) {
  const record = { id: String(attemptId), ...payload, savedAt: Date.now() }
  try { localStorage.setItem(localKey(attemptId), JSON.stringify(record)) } catch {}
  const db = await openExamDb()
  if (!db) return
  await new Promise(resolve => {
    const request = db.transaction('attempts', 'readwrite').objectStore('attempts').put(record)
    request.onsuccess = request.onerror = () => resolve()
  })
}

async function localLoad(attemptId) {
  const db = await openExamDb()
  if (db) {
    const record = await new Promise(resolve => {
      const request = db.transaction('attempts', 'readonly').objectStore('attempts').get(String(attemptId))
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
    if (record) return record
  }
  try { return JSON.parse(localStorage.getItem(localKey(attemptId)) || 'null') } catch { return null }
}

async function localClear(attemptId) {
  try { localStorage.removeItem(localKey(attemptId)) } catch {}
  const db = await openExamDb()
  if (!db) return
  await new Promise(resolve => {
    const request = db.transaction('attempts', 'readwrite').objectStore('attempts').delete(String(attemptId))
    request.onsuccess = request.onerror = () => resolve()
  })
}

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    keepalive: options.keepalive,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.error || 'Terjadi kesalahan.')
    error.status = res.status; error.payload = data
    throw error
  }
  return data
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

function QuestionCard({ question, answer, onAnswer }) {
  const value = answer ?? ''
  if (question.answerType === 'multiple_choice') {
    return <div style={{ display: 'grid', gap: 9 }}>
      {(question.options || []).map((option, index) => {
        const selected = value === option
        return <button type="button" key={`${option}-${index}`} onClick={() => onAnswer(option)} style={{
          textAlign: 'left', borderRadius: 12, border: `1px solid ${selected ? '#67E8F9' : 'rgba(255,255,255,0.1)'}`,
          background: selected ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.035)',
          color: selected ? '#E0F2FE' : '#CBD5E1', padding: '12px 13px', cursor: 'pointer', font: 'inherit', fontSize: 13,
        }}><strong style={{ color: selected ? '#67E8F9' : '#64748B', marginRight: 8 }}>{String.fromCharCode(65 + index)}.</strong><MathText value={option} /></button>
      })}
    </div>
  }
  if (question.answerType === 'true_false') {
    return <div style={{ display: 'flex', gap: 9 }}>
      {['Benar', 'Salah'].map(option => <button type="button" key={option} onClick={() => onAnswer(option)} style={{
        flex: 1, borderRadius: 12, border: `1px solid ${value === option ? '#67E8F9' : 'rgba(255,255,255,0.1)'}`,
        background: value === option ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.035)',
        color: value === option ? '#E0F2FE' : '#CBD5E1', padding: 12, cursor: 'pointer', font: 'inherit', fontWeight: 800,
      }}>{option}</button>)}
    </div>
  }
  return <input value={value} onChange={e => onAnswer(e.target.value)} placeholder="Tulis jawaban…" style={inputStyle} />
}

function ExamList({ exams, onStart, onResume, loading, goBack }) {
  const [selected, setSelected] = useState(null)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault(); setError('')
    try { await onStart(selected.id, token) } catch (err) { setError(err.message) }
  }
  return <div style={{ minHeight: '100vh', background: '#071321', color: '#CBD5E1' }}>
    <TopBar title="Mode Ujian 📝" onBack={goBack} accentColor="#67E8F9" />
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '18px 16px 50px' }}>
      <div style={{ background: 'linear-gradient(135deg,#102A43,#0E1E35)', border: '1px solid rgba(103,232,249,0.22)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
        <div style={{ color: '#67E8F9', fontSize: 10, fontWeight: 900, letterSpacing: 1.7 }}>RUANG UJIAN SMARTISA</div>
        <div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginTop: 5 }}>Kerjakan dengan jujur dan fokus.</div>
        <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>Jawaban tersimpan otomatis ke server. Jika koneksi terputus, buka kembali Mode Ujian untuk melanjutkan attempt aktif.</div>
      </div>
      {loading ? <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>Memuat ujian…</div> : exams.length === 0 ? <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>Belum ada ujian yang diterbitkan untuk kelasmu.</div> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {exams.map(exam => <div key={exam.id} style={{ background: '#0E1E35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: 15 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{exam.title}</div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 5 }}>{exam.questionCount} soal · {exam.durationMinutes} menit · {exam.kelas}</div>
              </div>
              {exam.attemptStatus === 'submitted' ? <span style={{ color: '#34D399', fontSize: 11, fontWeight: 800 }}>Selesai · {exam.score}</span> : exam.attemptStatus === 'in_progress' ? <button type="button" onClick={() => onResume(exam.attemptId)} style={{ background: '#67E8F9', color: '#06202a', border: 0, borderRadius: 9, padding: '9px 12px', fontWeight: 900, cursor: 'pointer' }}>Lanjutkan</button> : <button type="button" onClick={() => { setSelected(exam); setToken(''); setError('') }} style={{ background: 'rgba(103,232,249,0.12)', color: '#67E8F9', border: '1px solid rgba(103,232,249,0.28)', borderRadius: 9, padding: '9px 12px', fontWeight: 800, cursor: 'pointer' }}>Masukkan Token</button>}
            </div>
          </div>)}
        </div>
      )}
      {selected && <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', padding: 18, zIndex: 20 }}>
        <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 390, background: '#111827', border: '1px solid rgba(103,232,249,0.3)', borderRadius: 18, padding: 20 }}>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 900 }}>Token ujian</div>
          <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.5, margin: '7px 0 14px' }}>Minta token bersama dari guru untuk membuka {selected.title}.</div>
          <input autoFocus required value={token} onChange={e => setToken(e.target.value.toUpperCase())} maxLength={8} placeholder="Contoh: 7A2F91BC" style={{ ...inputStyle, textAlign: 'center', letterSpacing: 4, fontWeight: 900, fontSize: 18 }} />
          {error && <div style={{ color: '#FCA5A5', fontSize: 11, marginTop: 9 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 15 }}><button type="button" onClick={() => setSelected(null)} style={{ ...inputStyle, cursor: 'pointer', background: 'rgba(255,255,255,0.06)' }}>Batal</button><button type="submit" style={{ ...inputStyle, cursor: 'pointer', background: '#67E8F9', color: '#06202a', fontWeight: 900 }}>Buka Ujian</button></div>
        </form>
      </div>}
    </div>
  </div>
}

export default function ExamScreen({ goBack }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saving, setSaving] = useState({})
  const [offline, setOffline] = useState(!navigator.onLine)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [clock, setClock] = useState(() => Date.now())
  const saveTimers = useRef({})

  const loadExams = useCallback(async () => {
    setLoading(true)
    try { const data = await apiCall('/api/siswa/exams'); setExams(data.exams || []) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [])

  const hydrate = useCallback(async data => {
    const local = await localLoad(data.attempt.id)
    const serverAnswers = Object.fromEntries(Object.entries(data.answers || {}).map(([id, value]) => [id, value.answer]))
    const merged = { ...serverAnswers, ...(local?.answers || {}) }
    setAttempt(data.attempt); setQuestions(data.questions || []); setAnswers(merged); setResult(null)
    void localSave(data.attempt.id, { answers: merged })
  }, [])

  const resume = useCallback(async attemptId => {
    setError('')
    try { await hydrate(await apiCall(`/api/siswa/exams/attempts/${attemptId}`)) } catch (err) { setError(err.message) }
  }, [hydrate])

  useEffect(() => {
    loadExams()
    const savedAttemptId = Object.keys(localStorage).find(key => key.startsWith('smartisa_exam_attempt_'))?.replace('smartisa_exam_attempt_', '')
    if (savedAttemptId) resume(savedAttemptId)
  }, [loadExams, resume])

  useEffect(() => {
    const online = () => setOffline(false)
    const offlineEvent = () => setOffline(true)
    window.addEventListener('online', online); window.addEventListener('offline', offlineEvent)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offlineEvent) }
  }, [])

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return undefined
    const clockTimer = setInterval(() => setClock(Date.now()), 1000)
    const onFullscreenChange = () => {
      if (document.visibilityState === 'visible' && !document.fullscreenElement) {
        fetch(`/api/siswa/exams/attempts/${attempt.id}/events`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'fullscreen_exit' }), keepalive: true,
        }).catch(() => {})
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.documentElement.requestFullscreen?.().catch(() => {})
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        fetch(`/api/siswa/exams/attempts/${attempt.id}/events`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType: 'background' }), keepalive: true }).catch(() => {})
      }
    }
    const onBeforeUnload = () => {
      localSave(attempt.id, { answers })
      fetch(`/api/siswa/exams/attempts/${attempt.id}/events`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType: 'reload_or_exit' }), keepalive: true }).catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility); window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      clearInterval(clockTimer)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [attempt, answers])

  const start = async (examId, token) => {
    const data = await apiCall(`/api/siswa/exams/${examId}/start`, { method: 'POST', body: { token } })
    await hydrate(data)
  }

  const saveAnswer = useCallback((questionId, answer) => {
    if (!attempt) return
    const next = { ...answers, [questionId]: answer }
    setAnswers(next); void localSave(attempt.id, { answers: next })
    setSaving(state => ({ ...state, [questionId]: 'saving' }))
    clearTimeout(saveTimers.current[questionId])
    saveTimers.current[questionId] = setTimeout(async () => {
      try {
        await apiCall(`/api/siswa/exams/attempts/${attempt.id}/answers`, {
          method: 'PATCH', body: { questionId, answer, clientEventId: `${attempt.id}-${questionId}-${Date.now()}` },
        })
        setSaving(state => ({ ...state, [questionId]: 'saved' }))
      } catch {
        setSaving(state => ({ ...state, [questionId]: 'offline' }))
      }
    }, 250)
  }, [answers, attempt])

  const finishAttempt = useCallback(async (askForConfirmation = true) => {
    if (!attempt) return
    if (askForConfirmation && !window.confirm('Kumpulkan ujian sekarang? Jawaban tidak dapat diedit lagi.')) return
    try {
      const data = await apiCall(`/api/siswa/exams/attempts/${attempt.id}/submit`, { method: 'POST' })
      setResult(data.attempt); void localClear(attempt.id); setAttempt(current => ({ ...current, ...data.attempt }))
      loadExams()
    } catch (err) { setError(err.message) }
  }, [attempt, loadExams])

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || result) return
    if (clock >= new Date(attempt.deadlineAt).getTime()) void finishAttempt(false)
  }, [attempt, clock, finishAttempt, result])

  if (!attempt) return <ExamList exams={exams} loading={loading} onStart={start} onResume={resume} goBack={goBack} />

  const currentQuestion = questions[currentIndex]
  const remaining = Math.max(0, Math.floor((new Date(attempt.deadlineAt).getTime() - clock) / 1000))
  const completedCount = questions.filter(question => answers[question.id] !== undefined && answers[question.id] !== '').length
  if (attempt.status !== 'in_progress' || result) {
    return <div style={{ minHeight: '100vh', background: '#071321', color: '#CBD5E1', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 430, textAlign: 'center', background: '#0E1E35', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 20, padding: 25 }}>
        <div style={{ fontSize: 48 }}>{attempt.status === 'expired' ? '⏰' : '🎉'}</div><div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginTop: 8 }}>{attempt.status === 'expired' ? 'Waktu Ujian Habis' : 'Ujian Terkumpul'}</div>
        <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 8 }}>Nilai kamu</div><div style={{ color: '#34D399', fontSize: 42, fontWeight: 900 }}>{result?.score ?? attempt.score ?? '—'}</div>
        <button onClick={goBack} style={{ marginTop: 18, width: '100%', padding: 12, border: 0, borderRadius: 11, background: '#67E8F9', color: '#06202a', fontWeight: 900, cursor: 'pointer' }}>Kembali</button>
      </div>
    </div>
  }

  return <div onContextMenu={event => event.preventDefault()} style={{ minHeight: '100vh', background: '#071321', color: '#CBD5E1' }}>
    <style>{`.exam-kiosk button:focus{outline:2px solid #67E8F9;outline-offset:2px}`}</style>
    <div className="exam-kiosk" style={{ maxWidth: 980, margin: '0 auto', padding: '16px clamp(14px, 4vw, 32px) 42px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, position: 'sticky', top: 0, zIndex: 3, background: 'rgba(7,19,33,0.96)', padding: '8px 0', backdropFilter: 'blur(12px)' }}>
        <div style={{ flex: 1 }}><div style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>{attempt.title}</div><div style={{ color: '#64748B', fontSize: 10 }}>{completedCount}/{questions.length} terjawab · {offline ? 'Offline — tersimpan lokal' : saving[currentQuestion?.id] === 'saved' ? 'Tersimpan' : 'Menyimpan…'}</div></div>
        <div style={{ color: remaining < 60 ? '#F87171' : '#FBBF24', fontSize: 19, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{formatTime(remaining)}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 180px', gap: 14, alignItems: 'start' }}>
        <main style={{ background: '#0E1E35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 17, padding: '20px clamp(15px, 4vw, 28px)' }}>
          <div style={{ color: '#67E8F9', fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>SOAL {currentIndex + 1} DARI {questions.length}</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.65, margin: '12px 0 19px' }}>
            <MathText value={currentQuestion?.prompt} />
          </div>
          <QuestionCard question={currentQuestion} answer={answers[currentQuestion?.id]} onAnswer={answer => saveAnswer(currentQuestion.id, answer)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(index => Math.max(0, index - 1))} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>← Sebelumnya</button>
            {currentIndex < questions.length - 1 ? <button onClick={() => setCurrentIndex(index => Math.min(questions.length - 1, index + 1))} style={{ ...inputStyle, width: 'auto', marginLeft: 'auto', cursor: 'pointer', background: '#67E8F9', color: '#06202a', fontWeight: 900 }}>Berikutnya →</button> : <button onClick={() => finishAttempt(true)} style={{ ...inputStyle, width: 'auto', marginLeft: 'auto', cursor: 'pointer', background: '#34D399', color: '#042f2e', fontWeight: 900 }}>Kumpulkan Ujian</button>}
          </div>
          {error && <div style={{ color: '#FCA5A5', fontSize: 11, marginTop: 12 }}>{error}</div>}
        </main>
        <aside style={{ background: '#0E1E35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: 12, position: 'sticky', top: 65 }}>
          <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 800, marginBottom: 9 }}>NAVIGASI SOAL</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>{questions.map((question, index) => {
            const answered = answers[question.id] !== undefined && answers[question.id] !== ''
            return <button key={question.id} onClick={() => setCurrentIndex(index)} style={{ border: `1px solid ${index === currentIndex ? '#67E8F9' : answered ? '#34D399' : 'rgba(255,255,255,0.1)'}`, background: index === currentIndex ? 'rgba(103,232,249,0.16)' : answered ? 'rgba(52,211,153,0.1)' : 'transparent', color: index === currentIndex ? '#67E8F9' : answered ? '#34D399' : '#94A3B8', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontWeight: 800 }}>{index + 1}</button>
          })}</div>
          <div style={{ color: '#64748B', fontSize: 10, lineHeight: 1.5, marginTop: 13 }}>🔒 Jangan bagikan soal. Browser biasa tidak dapat menjamin pencegahan screenshot; aktivitas keluar/background tetap dicatat.</div>
        </aside>
      </div>
    </div>
  </div>
}