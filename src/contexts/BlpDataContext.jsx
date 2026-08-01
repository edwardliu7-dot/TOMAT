import { createContext, useContext, useState, useCallback, useRef } from 'react'

const BlpDataContext = createContext(null)

export function BlpDataProvider({ children }) {
  const [data, setData] = useState(null)      // null = belum pernah fetch
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)           // cegah concurrent fetch

  // Fetch dashboard — hanya ambil dari server jika cache kosong atau force=true
  const loadDashboard = useCallback(async ({ force = false } = {}) => {
    if (!force && data) return data           // kembalikan cache langsung
    if (fetchingRef.current) return           // sudah ada fetch berjalan
    fetchingRef.current = true
    setLoading(true)
    try {
      const res = await fetch('/api/blp/dashboard', { credentials: 'include' })
      if (!res.ok) throw new Error('Gagal memuat data BLP')
      const json = await res.json()
      setData(json)
      setError(null)
      return json
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [data])

  // Invalidate cache — panggil setelah aksi yang mengubah data (review, buat periode, dll)
  const invalidate = useCallback(() => setData(null), [])

  // Patch satu record siswa di cache lokal tanpa re-fetch
  // Dipakai oleh BlpGuruSiswaDetailScreen setelah review
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
