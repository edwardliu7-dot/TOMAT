import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { PlayerContext } from './PlayerContext'

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

// Mock tasks pre-assigned by the teacher account
const MOCK_TASKS = [
  {
    id: 'task-001',
    gameKey: 'termometer',
    gameName: 'Termometer Penyelamat',
    gameEmoji: '🌡️',
    totalQuestions: 5,
    type: 'harian',
    assignedAt: '2026-07-09',
    dueAt: '2026-07-10',
    assignedBy: 'Bu Sari',
    status: 'active',
  },
  {
    id: 'task-002',
    gameKey: 'kokipizza',
    gameName: 'Koki Pemotong Pizza',
    gameEmoji: '🍕',
    totalQuestions: 8,
    type: 'formatif',
    assignedAt: '2026-07-09',
    dueAt: '2026-07-12',
    assignedBy: 'Bu Sari',
    status: 'active',
  },
  {
    id: 'task-003',
    gameKey: 'relkereta',
    gameName: 'Menyusun Rel Kereta Cepat',
    gameEmoji: '🚄',
    totalQuestions: 10,
    type: 'sumatif',
    assignedAt: '2026-07-08',
    dueAt: '2026-07-15',
    assignedBy: 'Bu Sari',
    status: 'active',
  },
]

function loadStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

// TaskProvider must be placed INSIDE PlayerProvider so it can read PlayerContext.
// It re-provides PlayerContext with a modified addCoins that tracks task progress —
// this means every game automatically reports correct answers without any game-file changes.
export function TaskProvider({ children, onTaskComplete }) {
  const playerCtx = useContext(PlayerContext)

  const [tasks, setTasks] = useState(() => loadStorage('tomat_tasks', MOCK_TASKS))
  const [grades, setGrades] = useState(() => loadStorage('tomat_grades', []))
  // activeSession: { taskId, correctAnswers, totalQuestions, task } | null
  const [activeSession, setActiveSession] = useState(null)

  const onTaskCompleteRef = useRef(onTaskComplete)
  useEffect(() => { onTaskCompleteRef.current = onTaskComplete }, [onTaskComplete])

  const activeSessionRef = useRef(activeSession)
  useEffect(() => { activeSessionRef.current = activeSession }, [activeSession])

  // Persist tasks and grades
  useEffect(() => { try { localStorage.setItem('tomat_tasks', JSON.stringify(tasks)) } catch {} }, [tasks])
  useEffect(() => { try { localStorage.setItem('tomat_grades', JSON.stringify(grades)) } catch {} }, [grades])

  const getTaskForGame = useCallback((gameKey) => {
    return tasks.find(t => t.gameKey === gameKey && t.status === 'active') ?? null
  }, [tasks])

  const startTaskSession = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    setActiveSession({ taskId, correctAnswers: 0, totalQuestions: task.totalQuestions, task })
  }, [tasks])

  const endTaskSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  // Override addCoins: when a task session is active, track each correct answer (addCoins(50)).
  // When all questions are answered, save the grade and fire onTaskComplete.
  const addCoins = useCallback((amount) => {
    playerCtx.addCoins(amount)
    const session = activeSessionRef.current
    if (!session || amount !== 50) return // 50 coins = one correct game answer

    const newCorrect = session.correctAnswers + 1
    if (newCorrect >= session.totalQuestions) {
      const gradeRecord = {
        id: `grade-${Date.now()}`,
        taskId: session.taskId,
        gameKey: session.task.gameKey,
        gameName: session.task.gameName,
        gameEmoji: session.task.gameEmoji,
        type: session.task.type,
        correctCount: newCorrect,
        totalQuestions: session.totalQuestions,
        score: Math.round((newCorrect / session.totalQuestions) * 100),
        completedAt: new Date().toISOString(),
        assignedBy: session.task.assignedBy,
      }
      setTasks(ts => ts.map(t => t.id === session.taskId ? { ...t, status: 'completed' } : t))
      setGrades(gs => [...gs, gradeRecord])
      setActiveSession(null)
      onTaskCompleteRef.current?.(gradeRecord)
    } else {
      setActiveSession(s => s ? { ...s, correctAnswers: newCorrect } : null)
    }
  }, [playerCtx.addCoins])

  // Re-provide PlayerContext with the intercepted addCoins only during a task session.
  // All game components call usePlayer() which reads PlayerContext — so they automatically
  // report progress to TaskContext without any modification.
  const playerValue = activeSession
    ? { ...playerCtx, addCoins }
    : playerCtx

  const taskValue = {
    tasks,
    grades,
    activeSession,
    getTaskForGame,
    startTaskSession,
    endTaskSession,
    // Dev helper to reset to initial state
    resetDemo: () => {
      setTasks(MOCK_TASKS)
      setGrades([])
      setActiveSession(null)
      try { localStorage.removeItem('tomat_tasks'); localStorage.removeItem('tomat_grades') } catch {}
    },
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
