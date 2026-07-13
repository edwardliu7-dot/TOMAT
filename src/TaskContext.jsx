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
  // activeSession: { taskId, correctAnswers, totalQuestions, task } | null
  const [activeSession, setActiveSession] = useState(null)

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
    setActiveSession({ taskId, correctAnswers: 0, totalQuestions: task.totalQuestions, task })
  }, [tasks])

  const endTaskSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  // Override addCoins: when a task session is active, track each correct answer (addCoins(50)).
  // When all questions are answered, submit the grade to the server and fire onTaskComplete.
  const addCoins = useCallback((amount) => {
    playerCtx.addCoins(amount)
    const session = activeSessionRef.current
    if (!session || amount !== 50) return // 50 coins = one correct game answer

    const newCorrect = session.correctAnswers + 1
    if (newCorrect >= session.totalQuestions) {
      setActiveSession(null)
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
      })
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
    refresh,
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
