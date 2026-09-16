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

const MAX_STRICT_VIOLATIONS = 3
const STRICT_VIOLATION_LABELS = {
  background: 'perpindahan tab atau aplikasi',
  reload_or_exit: 'percobaan keluar atau memuat ulang halaman',
  copy_attempt: 'percobaan menyalin',
  cut_attempt: 'percobaan memotong',
  paste_attempt: 'percobaan menempel',
  contextmenu_attempt: 'percobaan membuka menu klik kanan',
  shortcut_attempt: 'shortcut browser yang diblokir',
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

function reviewAnswerText(value) {
  if (value === null || value === undefined || value === '') return 'Tidak dijawab'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ExamReview({ review, onBack, onExit }) {
  const isFinal = review.attempt.gradingStatus === 'confirmed'
  return <div style={{ minHeight: '100vh', background: '#071321', color: '#CBD5E1' }}>
    <TopBar title="Review Hasil Ujian" onBack={onBack} accentColor="#67E8F9" />
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '18px 16px 50px' }}>
      <div style={{ background: 'linear-gradient(135deg,#1c2340,#24204e)', border: `1px solid ${isFinal ? 'rgba(52,211,153,0.28)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
        <div style={{ color: '#67E8F9', fontSize: 10, fontWeight: 900, letterSpacing: 1.7 }}>REVIEW HASIL</div>
        <div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginTop: 5 }}>{review.attempt.title}</div>
        <div style={{ color: isFinal ? '#86EFAC' : '#FBBF24', fontSize: 12, fontWeight: 800, marginTop: 8 }}>
          {isFinal ? 'Nilai final sudah dikonfirmasi guru.' : 'Nilai masih sementara dan menunggu konfirmasi guru.'}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 15 }}>
          <div><div style={{ color: '#64748B', fontSize: 10 }}>NILAI</div><div style={{ color: isFinal ? '#34D399' : '#FBBF24', fontSize: 27, fontWeight: 900 }}>{isFinal ? review.attempt.finalScore : review.attempt.score ?? '—'}</div></div>
          <div><div style={{ color: '#64748B', fontSize: 10 }}>SOAL</div><div style={{ color: '#E2E8F0', fontSize: 27, fontWeight: 900 }}>{review.questions.length}</div></div>
          {isFinal && <div><div style={{ color: '#64748B', fontSize: 10 }}>BENAR PENUH</div><div style={{ color: '#E2E8F0', fontSize: 27, fontWeight: 900 }}>{review.attempt.correctCount ?? '—'}</div></div>}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {review.questions.map(question => {
          const points = isFinal ? question.awardedPoints : question.autoAwardedPoints
          const status = isFinal
            ? points >= question.points ? { label: 'Benar', color: '#34D399' } : points > 0 ? { label: 'Sebagian benar', color: '#FBBF24' } : { label: 'Belum tepat', color: '#F87171' }
            : { label: 'Jawaban tersimpan', color: '#94A3B8' }
          return <article key={question.id} style={{ background: '#0E1E35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#67E8F9', fontSize: 10, fontWeight: 900, letterSpacing: 1.2 }}>SOAL {question.position}</div>
              <div style={{ color: status.color, fontSize: 11, fontWeight: 900 }}>{status.label} · {points ?? '—'}/{question.points} poin</div>
            </div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.6, margin: '11px 0 14px' }}><MathText value={question.prompt} /></div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.16)', borderRadius: 10, padding: 11 }}>
                <div style={{ color: '#67E8F9', fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>JAWABANMU</div>
                <div style={{ color: '#E2E8F0', fontSize: 13, marginTop: 5 }}><MathText value={reviewAnswerText(question.answer)} /></div>
              </div>
              {isFinal && <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.16)', borderRadius: 10, padding: 11 }}>
                <div style={{ color: '#34D399', fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>KUNCI JAWABAN</div>
                <div style={{ color: '#E2E8F0', fontSize: 13, marginTop: 5 }}><MathText value={reviewAnswerText(question.correctAnswer)} /></div>
              </div>}
            </div>
            {!isFinal && <div style={{ color: '#64748B', fontSize: 11, lineHeight: 1.5, marginTop: 10 }}>Kunci jawaban dan poin final akan terlihat setelah guru mengonfirmasi nilai.</div>}
          </article>
        })}
      </div>
      <button type="button" onClick={onExit} style={{ width: '100%', marginTop: 18, padding: 12, border: 0, borderRadius: 11, background: '#67E8F9', color: '#06202a', fontWeight: 900, cursor: 'pointer' }}>Kembali ke daftar ujian</button>
    </div>
  </div>
}

function ExamList({ exams, onStart, onResume, onViewResult, loading, goBack }) {
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
      <div style={{ background: 'linear-gradient(135deg,#1c2340,#24204e)', border: '1px solid rgba(206,203,246,0.2)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
        <div style={{ color: '#67E8F9', fontSize: 10, fontWeight: 900, letterSpacing: 1.7 }}>RUANG UJIAN SMARTISA</div>
        <div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginTop: 5 }}>Kerjakan dengan jujur dan fokus.</div>
        <div style={{ color: '#c9cdd8', fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>Tampilan mengikuti Simulasi Ujian. Mode ini lebih ketat: layar penuh, tanpa menyalin jawaban, dan aktivitas keluar tab dicatat.</div>
        <div style={{ color: '#fac775', fontSize: 11, lineHeight: 1.5, marginTop: 7 }}>⚠️ 3 pelanggaran akan mengumpulkan ujian secara otomatis.</div>
      </div>
      {loading ? <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>Memuat ujian…</div> : exams.length === 0 ? <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>Belum ada ujian yang diterbitkan untuk kelasmu.</div> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {exams.map(exam => <div key={exam.id} style={{ background: '#0E1E35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: 15 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{exam.title}</div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 5 }}>{exam.mataPelajaran || 'Matematika'} · {exam.questionCount} soal · {exam.durationMinutes} menit · {exam.kelas}</div>
              </div>
              {['submitted', 'expired'].includes(exam.attemptStatus) ? (
                <button type="button" onClick={() => onViewResult(exam.attemptId)} style={{ background: exam.gradingStatus === 'confirmed' ? 'rgba(52,211,153,0.13)' : 'rgba(251,191,36,0.12)', color: exam.gradingStatus === 'confirmed' ? '#34D399' : '#FBBF24', border: `1px solid ${exam.gradingStatus === 'confirmed' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 9, padding: '9px 12px', fontWeight: 900, cursor: 'pointer' }}>
                  {exam.gradingStatus === 'confirmed' ? `Review hasil · ${exam.finalScore}` : 'Review jawaban sementara'}
                </button>
              ) : exam.attemptStatus === 'in_progress' ? <button type="button" onClick={() => onResume(exam.attemptId)} style={{ background: '#67E8F9', color: '#06202a', border: 0, borderRadius: 9, padding: '9px 12px', fontWeight: 900, cursor: 'pointer' }}>Lanjutkan</button> : <button type="button" onClick={() => { setSelected(exam); setToken(''); setError('') }} style={{ background: 'rgba(103,232,249,0.12)', color: '#67E8F9', border: '1px solid rgba(103,232,249,0.28)', borderRadius: 9, padding: '9px 12px', fontWeight: 800, cursor: 'pointer' }}>Masukkan Token</button>}
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
  const [strictViolations, setStrictViolations] = useState(0)
  const [violationWarning, setViolationWarning] = useState(null)
  const [review, setReview] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const saveTimers = useRef({})
  const answersRef = useRef(answers)
  const strictViolationRef = useRef(0)
  const strictTerminationRef = useRef(false)
  const finishAttemptRef = useRef(null)
  const violationWarningTimerRef = useRef(null)
  answersRef.current = answers

  const loadExams = useCallback(async () => {
    setLoading(true)
    try { const data = await apiCall('/api/siswa/exams'); setExams(data.exams || []) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [])

  const hydrate = useCallback(async data => {
    const local = await localLoad(data.attempt.id)
    const serverAnswers = Object.fromEntries(Object.entries(data.answers || {}).map(([id, value]) => [id, value.answer]))
    const merged = { ...serverAnswers, ...(local?.answers || {}) }
    const persistedViolations = Number(data.attempt.strictViolationCount || 0)
    strictViolationRef.current = persistedViolations
    strictTerminationRef.current = false
    setStrictViolations(persistedViolations)
    setViolationWarning(null)
    setAttempt(data.attempt); setQuestions(data.questions || []); setAnswers(merged); setResult(null); setReview(null)
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

  const recordStrictViolation = useCallback((eventType, metadata = {}) => {
    if (!attempt || attempt.status !== 'in_progress' || strictTerminationRef.current) return
    const nextCount = strictViolationRef.current + 1
    strictViolationRef.current = nextCount
    setStrictViolations(nextCount)
    const warningMessage = nextCount >= MAX_STRICT_VIOLATIONS
      ? 'Batas pelanggaran tercapai. Ujian akan dikumpulkan otomatis.'
      : `Peringatan ${nextCount}/${MAX_STRICT_VIOLATIONS}: ${STRICT_VIOLATION_LABELS[eventType] || 'aktivitas yang tidak diperbolehkan'} terdeteksi.`
    setViolationWarning({ message: warningMessage, count: nextCount })
    window.clearTimeout(violationWarningTimerRef.current)
    if (nextCount < MAX_STRICT_VIOLATIONS) {
      violationWarningTimerRef.current = window.setTimeout(() => setViolationWarning(null), 6000)
    }
    fetch(`/api/siswa/exams/attempts/${attempt.id}/events`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        metadata: { strict: true, violationCount: nextCount, ...metadata },
      }),
      keepalive: true,
    }).catch(() => {})
    if (nextCount >= MAX_STRICT_VIOLATIONS) {
      strictTerminationRef.current = true
      setError('Batas pelanggaran tercapai. Ujian dikumpulkan otomatis.')
      window.setTimeout(() => finishAttemptRef.current?.(false), 0)
    }
  }, [attempt])

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return undefined
    const clockTimer = setInterval(() => setClock(Date.now()), 1000)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') recordStrictViolation('background')
    }
    const onBeforeUnload = event => {
      localSave(attempt.id, { answers: answersRef.current })
      recordStrictViolation('reload_or_exit')
      event.preventDefault()
      event.returnValue = ''
    }
    const onCopy = event => {
      event.preventDefault()
      recordStrictViolation('copy_attempt')
    }
    const onCut = event => {
      event.preventDefault()
      recordStrictViolation('cut_attempt')
    }
    const onPaste = event => {
      event.preventDefault()
      recordStrictViolation('paste_attempt')
    }
    const onContextMenu = event => {
      event.preventDefault()
      recordStrictViolation('contextmenu_attempt')
    }
    const onKeyDown = event => {
      const key = event.key.toLowerCase()
      const blockedShortcut = (event.ctrlKey || event.metaKey) && ['a', 'c', 'p', 's', 'u', 'v', 'x'].includes(key)
        || event.key === 'F12'
        || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(key))
        || (event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key))
      if (blockedShortcut) {
        event.preventDefault()
        recordStrictViolation('shortcut_attempt', { key: event.key })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('paste', onPaste)
    document.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      clearInterval(clockTimer)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [attempt, recordStrictViolation])

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
  finishAttemptRef.current = finishAttempt

  const openReview = async () => {
    if (!attempt) return
    setReviewLoading(true)
    setError('')
    try {
      setReview(await apiCall(`/api/siswa/exams/attempts/${attempt.id}/review`))
    } catch (err) {
      setError(err.message)
    } finally {
      setReviewLoading(false)
    }
  }

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || result) return
    if (clock >= new Date(attempt.deadlineAt).getTime()) void finishAttempt(false)
  }, [attempt, clock, finishAttempt, result])

  if (!attempt) return <ExamList exams={exams} loading={loading} onStart={start} onResume={resume} onViewResult={resume} goBack={goBack} />

  const currentQuestion = questions[currentIndex]
  const remaining = Math.max(0, Math.floor((new Date(attempt.deadlineAt).getTime() - clock) / 1000))
  const completedCount = questions.filter(question => answers[question.id] !== undefined && answers[question.id] !== '').length
  if (review) return <ExamReview review={review} onBack={() => setReview(null)} onExit={goBack} />
  if (attempt.status !== 'in_progress' || result) {
    const resultAttempt = result ? { ...attempt, ...result } : attempt
    const isFinal = resultAttempt.gradingStatus === 'confirmed'
    const displayedScore = isFinal ? resultAttempt.finalScore : resultAttempt.score
    return <div style={{ minHeight: '100vh', background: '#071321', color: '#CBD5E1', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 430, textAlign: 'center', background: '#0E1E35', border: `1px solid ${isFinal ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 20, padding: 25 }}>
        <div style={{ fontSize: 48 }}>{attempt.status === 'expired' ? '⏰' : '🎉'}</div><div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginTop: 8 }}>{attempt.status === 'expired' ? 'Waktu Ujian Habis' : 'Ujian Terkumpul'}</div>
        <div style={{ color: isFinal ? '#86EFAC' : '#FBBF24', fontSize: 13, fontWeight: 800, marginTop: 10 }}>
          {isFinal ? 'Nilai akhir telah dikonfirmasi guru' : 'Hasil sementara — menunggu koreksi guru'}
        </div>
        <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 12 }}>{isFinal ? 'Nilai akhir kamu' : 'Nilai otomatis sementara'}</div>
        <div style={{ color: isFinal ? '#34D399' : '#FBBF24', fontSize: 42, fontWeight: 900 }}>{displayedScore ?? '—'}</div>
        {!isFinal && <div style={{ color: '#94A3B8', fontSize: 11, lineHeight: 1.5, marginTop: 5 }}>Guru akan memeriksa poin setiap soal dan mengonfirmasi nilai akhir.</div>}
         <button onClick={openReview} disabled={reviewLoading} style={{ marginTop: 18, width: '100%', padding: 12, border: 0, borderRadius: 11, background: '#67E8F9', color: '#06202a', fontWeight: 900, cursor: reviewLoading ? 'wait' : 'pointer', opacity: reviewLoading ? 0.7 : 1 }}>{reviewLoading ? 'Memuat review…' : 'Review jawaban'}</button>
         <button onClick={goBack} style={{ marginTop: 8, width: '100%', padding: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 11, background: 'rgba(255,255,255,0.04)', color: '#CBD5E1', fontWeight: 800, cursor: 'pointer' }}>Kembali</button>
      </div>
    </div>
  }

  return <div style={{ minHeight: '100vh', background: '#12172b', color: '#CBD5E1' }}>
    <style>{`
      .exam-kiosk button:focus{outline:2px solid #67E8F9;outline-offset:2px}
      @media (max-width: 720px) {
        .exam-layout { grid-template-columns: 1fr !important; }
        .exam-nav { position: static !important; }
      }
    `}</style>
    <div className="exam-kiosk" style={{ maxWidth: 980, margin: '0 auto', padding: '16px clamp(14px, 4vw, 32px) 42px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, position: 'sticky', top: 0, zIndex: 3, background: 'rgba(7,19,33,0.96)', padding: '8px 0', backdropFilter: 'blur(12px)' }}>
        <div style={{ flex: 1 }}><div style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>{attempt.title}</div><div style={{ color: '#64748B', fontSize: 10 }}>{completedCount}/{questions.length} terjawab · {offline ? 'Offline — tersimpan lokal' : saving[currentQuestion?.id] === 'saved' ? 'Tersimpan' : 'Menyimpan…'} · <span style={{ color: strictViolations ? '#F87171' : '#5dcaa5' }}>Pelanggaran {strictViolations}/{MAX_STRICT_VIOLATIONS}</span></div></div>
        <div style={{ color: remaining < 60 ? '#F87171' : '#FBBF24', fontSize: 19, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{formatTime(remaining)}</div>
      </div>
      {violationWarning && <div role="alert" style={{ marginBottom: 12, padding: '11px 14px', borderRadius: 12, border: `1px solid ${violationWarning.count >= MAX_STRICT_VIOLATIONS ? 'rgba(248,113,113,0.5)' : 'rgba(251,191,36,0.45)'}`, background: violationWarning.count >= MAX_STRICT_VIOLATIONS ? 'rgba(127,29,29,0.35)' : 'rgba(120,53,15,0.35)', color: violationWarning.count >= MAX_STRICT_VIOLATIONS ? '#FCA5A5' : '#FDE68A', fontSize: 12, lineHeight: 1.5, fontWeight: 700 }}>{violationWarning.message} <span style={{ fontWeight: 500 }}>Jangan ulangi aktivitas ini.</span></div>}
      <div className="exam-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 180px', gap: 14, alignItems: 'start' }}>
        <main style={{ background: '#1c2340', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 17, padding: '20px clamp(15px, 4vw, 28px)' }}>
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
        <aside className="exam-nav" style={{ background: '#1c2340', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: 12, position: 'sticky', top: 65 }}>
          <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 800, marginBottom: 9 }}>NAVIGASI SOAL</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>{questions.map((question, index) => {
            const answered = answers[question.id] !== undefined && answers[question.id] !== ''
            return <button key={question.id} onClick={() => setCurrentIndex(index)} style={{ border: `1px solid ${index === currentIndex ? '#67E8F9' : answered ? '#34D399' : 'rgba(255,255,255,0.1)'}`, background: index === currentIndex ? 'rgba(103,232,249,0.16)' : answered ? 'rgba(52,211,153,0.1)' : 'transparent', color: index === currentIndex ? '#67E8F9' : answered ? '#34D399' : '#94A3B8', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontWeight: 800 }}>{index + 1}</button>
          })}</div>
           <div style={{ color: '#64748B', fontSize: 10, lineHeight: 1.5, marginTop: 13 }}>🔒 Jangan bagikan soal. Aktivitas keluar tab/background dan percobaan interaksi yang diblokir tetap dicatat sebagai pelanggaran.</div>
        </aside>
      </div>
    </div>
  </div>
}