import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'

const BlpDataContext = createContext(null)

export function BlpDataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)
  const dataRef = useRef(null)        // stable ref so loadDashboard has no deps
  const { user } = useAuth()

  // Sync dataRef with state so loadDashboard always sees current value
  dataRef.current = data

  // Stable loadDashboard — no deps, uses refs internally
  const loadDashboard = useCallback(async ({ force = false } = {}) => {
    if (!force && dataRef.current) return dataRef.current
    if (fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30000) // 30s — Neon cold-start bisa 15-20 detik
    try {
      const res = await fetch('/api/blp/dashboard', { credentials: 'include', signal: controller.signal })
      if (!res.ok) throw new Error('Gagal memuat data BLP')
      const json = await res.json()
      dataRef.current = json
      setData(json)
      setError(null)
      return json
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Koneksi timeout — coba lagi' : e.message
      setError(msg)
    } finally {
      clearTimeout(timer)
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])  // no deps — stable forever

  // Invalidate cache — panggil setelah aksi yang mengubah data (review, buat periode, dll)
  const invalidate = useCallback(() => {
    dataRef.current = null
    setData(null)
  }, [])

  // Patch satu record siswa di cache lokal tanpa re-fetch
  const patchSubmission = useCallback((studentId, date, activityId, reviewData) => {
    setData(prev => {
      if (!prev) return prev
      const student = prev.students[studentId]
      if (!student) return prev
      const records = { ...student.records }
      const record = records[date] ? { ...records[date] } : { submissions: {} }
      record.submissions = { ...record.submissions, [activityId]: { ...record.submissions[activityId], ...reviewData } }
      records[date] = record
      return {
        ...prev,
        students: {
          ...prev.students,
          [studentId]: { ...student, records }
        }
      }
    })
  }, [])

  // Preload saat provider mount — guru langsung fetch di background agar sudah siap
  useEffect(() => {
    if (user) loadDashboard()
  }, [user?.id, loadDashboard])

  return (
    <BlpDataContext.Provider value={{ data, loading, error, loadDashboard, invalidate, patchSubmission }}>
      {children}
    </BlpDataContext.Provider>
  )
}

export function useBlpData() {
  const ctx = useContext(BlpDataContext)
  if (!ctx) throw new Error('useBlpData harus dipakai di dalam BlpDataProvider')
  return ctx
}
