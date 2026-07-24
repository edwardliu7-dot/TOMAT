import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'

const PetContext = createContext(null)

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

export function PetProvider({ children }) {
  const { user } = useAuth()
  const isSiswa = user?.role === 'siswa'

  const [pet, setPet] = useState({
    hunger: 100,
    isDead: false,
    isStarving: false,
    skin: 'golden',
    petHungerUntil: null,
    foods: {},
  })
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  const fetchPet = useCallback(async () => {
    if (!isSiswa) return
    try {
      const data = await apiCall('/api/siswa/pet')
      setPet(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error('PetContext fetch error', err)
    }
  }, [isSiswa])

  // Initial load + poll every 60s to keep hunger bar live
  useEffect(() => {
    if (!isSiswa) return
    fetchPet()
    intervalRef.current = setInterval(fetchPet, 60_000)
    return () => clearInterval(intervalRef.current)
  }, [fetchPet, isSiswa])

  // Locally decay hunger between server polls so it feels alive
  // (1% per (24*60/100) ≈ 14.4 minutes)
  useEffect(() => {
    if (!isSiswa) return
    const decayInterval = setInterval(() => {
      setPet(prev => {
        if (!prev.petHungerUntil || prev.isDead) return prev
        const now = Date.now()
        const until = new Date(prev.petHungerUntil).getTime()
        const deadAt = until + 24 * 3600 * 1000
        if (now >= deadAt) return { ...prev, hunger: 0, isDead: true, isStarving: true }
        if (now >= until)  return { ...prev, hunger: 0, isDead: false, isStarving: true }
        const hunger = Math.min(100, Math.round((until - now) / (24 * 3600 * 1000) * 100))
        return { ...prev, hunger, isDead: false, isStarving: false }
      })
    }, 30_000) // recalc every 30s
    return () => clearInterval(decayInterval)
  }, [isSiswa])

  const feedPet = useCallback(async (foodId) => {
    setLoading(true)
    try {
      const data = await apiCall('/api/siswa/pet/feed', { method: 'POST', body: { foodId } })
      setPet(prev => ({
        ...prev,
        hunger: data.hunger,
        isDead: data.isDead,
        isStarving: data.isStarving,
        petHungerUntil: data.petHungerUntil,
      }))
      return { ok: true, newCoins: data.newCoins }
    } catch (err) {
      return { ok: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshPet = useCallback(() => fetchPet(), [fetchPet])

  return (
    <PetContext.Provider value={{ pet, loading, feedPet, refreshPet }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  return useContext(PetContext)
}
