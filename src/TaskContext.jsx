import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { PlayerContext } from './PlayerContext'
import { useAuth } from './AuthContext'

const TaskContext = createContext(null)

export const TYPE_LABELS = {
  harian: 'Penilaian Harian',
  formatif: 'Penilaian Formatif',
  sumatif: 'Penilaian Sumatif',
}
export const TYPE_COLORS = {
  harian: '#67E8F9',
  formatif: '#A78BFA',
  sumatif: '#F59E0B',
}
export const TYPE_ICONS = {
  harian: '📝',
  formatif: '📊',
  sumatif: '🏆',
}

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

// Map a server tugas row (snake_case) into the shape screens expect (camelCase).
function mapTugas(row) {
  return {
    id: row.id,
    gameKey: row.game_key,
    gameName: row.game_name,
    gameEmoji: row.game_emoji,
    totalQuestions: row.total_questions,
    type: row.type,
    assignedAt: row.assigned_at,
    dueAt: row.due_at,
    kelas: row.kelas,
    difficulty: row.difficulty || 'medium',
    status: row.nilai ? 'completed' : row.status,
  }
}

function mapNilai(row) {
  return {
    id: `nilai-${row.id}`,
    taskId: row.tugas_id,
    gameName: row.game_name,
    gameEmoji: row.game_emoji,
    type: row.type,
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    score: row.score,
    completedAt: row.completed_at,
  }
}

// TaskProvider must be placed INSIDE PlayerProvider so it can read PlayerContext.
// It re-provides PlayerContext with a modified addCoins that tracks task progress —
// this means every game automatically reports correct answers without any game-file changes.
export function TaskProvider({ children, onTaskComplete }) {
  const playerCtx = useContext(PlayerContext)
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [grades, setGrades] = useState([])
  // activeSession: { taskId, correctAnswers, wrongAnswers, totalQuestions, task } | null
  const [activeSession, setActiveSession] = useState(null)
  // submitError: shown to student when the server rejects the grade submission
  const [submitError, setSubmitError] = useState(null)
  // exitWarning: true when student was caught leaving and task was auto-reset
  const [exitWarning, setExitWarning] = useState(false)

  const onTaskCompleteRef = useRef(onTaskComplete)
  useEffect(() => { onTaskCompleteRef.current = onTaskComplete }, [onTaskComplete])

  const activeSessionRef = useRef(activeSession)
  useEffect(() => { activeSessionRef.current = activeSession }, [activeSession])

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'siswa') return
    try {
      const [{ tugas }, { nilai }] = await Promise.all([
        apiCall('/api/siswa/tugas'),
        apiCall('/api/siswa/nilai'),
      ])
      setTasks(tugas.map(mapTugas))
      setGrades(nilai.map(mapNilai))
    } catch (err) {
      console.error('Failed to load tasks/grades', err)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const getTaskForGame = useCallback((gameKey) => {
    return tasks.find(t => t.gameKey === gameKey && t.status === 'active') ?? null
  }, [tasks])

  const startTaskSession = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    setActiveSession({ taskId, correctAnswers: 0, wrongAnswers: 0, totalQuestions: task.totalQuestions, task })
  }, [tasks])

  const endTaskSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  // Called by useTaskGuard when the student leaves mid-task.
  // Zeros correctAnswers/wrongAnswers so questions restart from the beginning,
  // and raises the exitWarning flag so the UI can show a penalty modal.
  const resetTaskSession = useCallback(() => {
    setActiveSession(s => s ? { ...s, correctAnswers: 0, wrongAnswers: 0 } : null)
    setExitWarning(true)
  }, [])

  const clearExitWarning = useCallback(() => setExitWarning(false), [])

  // Shared helper: submit grade when all questions have been answered (correct or wrong).
  const submitGrade = useCallback((session, newCorrect, newWrong) => {
    const totalAnswered = newCorrect + newWrong
    if (totalAnswered < session.totalQuestions) return false

    // Clear session immediately to prevent double-submission while the request is in-flight.
    setActiveSession(null)
    setSubmitError(null)

    apiCall('/api/siswa/nilai', {
      method: 'POST',
      body: { tugasId: session.taskId, correctCount: newCorrect },
    }).then(({ nilai }) => {
      const gradeRecord = { ...mapNilai({ ...nilai, game_name: session.task.gameName, game_emoji: session.task.gameEmoji, type: session.task.type }) }
      setTasks(ts => ts.map(t => t.id === session.taskId ? { ...t, status: 'completed' } : t))
      setGrades(gs => [...gs, gradeRecord])
      onTaskCompleteRef.current?.(gradeRecord)
    }).catch(err => {
      console.error('Failed to submit grade', err)
      // Surface the error so the student knows the task was not saved.
      // Common causes: pet died during gameplay, guru closed the task, session expired.
      const msg = err?.message || 'Terjadi kesalahan jaringan.'
      setSubmitError(msg)
    })
    return true
  }, [])

  // Override addCoins: game files use the legacy 50 marker, while the actual
  // normalized economy reward is 15 coins per correct answer.
  // A correct answer advances correctAnswers; when correct+wrong >= totalQuestions the session ends.
  const addCoins = useCallback((amount) => {
    playerCtx.addCoins(amount)
    const session = activeSessionRef.current
    if (!session || amount !== 50) return // legacy marker = one correct game answer

    const newCorrect = session.correctAnswers + 1
    const newWrong = session.wrongAnswers ?? 0
    if (!submitGrade(session, newCorrect, newWrong)) {
      setActiveSession(s => s ? { ...s, correctAnswers: newCorrect } : null)
    }
  }, [playerCtx.addCoins, submitGrade])

  // Override recordWrongAnswer: called by games (via FeedbackBanner or the standalone
  // Next button) when a wrong answer is confirmed and the student moves on.
  // This prevents infinite retries that would guarantee a perfect score.
  const recordWrongAnswer = useCallback(() => {
    playerCtx.recordWrongAnswer()
    const session = activeSessionRef.current
    if (!session) return
    const newWrong = (session.wrongAnswers ?? 0) + 1
    const newCorrect = session.correctAnswers
    if (!submitGrade(session, newCorrect, newWrong)) {
      setActiveSession(s => s ? { ...s, wrongAnswers: newWrong } : null)
    }
  }, [playerCtx.recordWrongAnswer, submitGrade])

  // Re-provide PlayerContext with intercepted addCoins + recordWrongAnswer only during
  // a task session. All game components call usePlayer() which reads PlayerContext —
  // so they automatically report progress to TaskContext without any modification.
  const playerValue = activeSession
    ? { ...playerCtx, addCoins, recordWrongAnswer }
    : playerCtx

  const clearSubmitError = useCallback(() => setSubmitError(null), [])

  const taskValue = {
    tasks,
    grades,
    activeSession,
    getTaskForGame,
    startTaskSession,
    endTaskSession,
    resetTaskSession,
    clearExitWarning,
    refresh,
    submitError,
    clearSubmitError,
    exitWarning,
  }

  return (
    <PlayerContext.Provider value={playerValue}>
      <TaskContext.Provider value={taskValue}>
        {children}
      </TaskContext.Provider>
    </PlayerContext.Provider>
  )
}

export function useTask() {
  return useContext(TaskContext)
}
