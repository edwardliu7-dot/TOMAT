import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const BabLockContext = createContext(null)

async function apiCall(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

export function BabLockProvider({ children }) {
  const { user } = useAuth()
  const [locks, setLocks] = useState([])
  const [grades, setGrades] = useState([])

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'siswa') return
    try {
      const data = await apiCall('/api/siswa/bab-locks')
      setLocks(data.locks)
      setGrades(data.grades)
    } catch (err) {
      console.error('Failed to load bab locks', err)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const isBabLocked = useCallback((grade, bab) => {
    return locks.some(l => l.grade === grade && l.bab === bab && l.locked)
  }, [locks])

  const isGradeAccessible = useCallback((grade) => {
    return grades.includes(grade)
  }, [grades])

  return (
    <BabLockContext.Provider value={{ locks, grades, isBabLocked, isGradeAccessible, refresh }}>
      {children}
    </BabLockContext.Provider>
  )
}

export function useBabLock() {
  return useContext(BabLockContext)
}
