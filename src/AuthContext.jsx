import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { resetSocket } from './socket'

export const AuthContext = createContext(null)

async function apiCall(path, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs || 15000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`/api/auth${path}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Terjadi kesalahan.')
    }
    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Server terlalu lama merespons. Silakan coba lagi.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [dailyBonus, setDailyBonus] = useState(null)

  useEffect(() => {
    let mounted = true
    // Never leave the app behind the splash screen forever when the database
    // or the session store is temporarily unavailable.
    apiCall('/me', { timeoutMs: 8000 })
      .then(data => {
        if (mounted) {
          setUser(data.user)
          if (data.dailyBonus) setDailyBonus(data.dailyBonus)
        }
      })
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setChecking(false)
      })
    return () => { mounted = false }
  }, [])

  const login = useCallback(async ({ role, username, password }) => {
    // Reset any stale socket from a previous user before establishing a new session
    resetSocket()
    const data = await apiCall('/login', { method: 'POST', body: { role, username, password } })
    setUser(data.user)
    if (data.dailyBonus) setDailyBonus(data.dailyBonus)
    return data.user
  }, [])

  const updateProfile = useCallback(async ({ photoUrl, bio }) => {
    const data = await apiCall('/profile', { method: 'PUT', body: { photoUrl, bio } })
    setUser(data.user)
    return data.user
  }, [])

  // Re-fetch /me without a full login round-trip — used after actions that change
  // server-side user fields outside AuthContext itself (e.g. equipping a shop item).
  const refreshMe = useCallback(async () => {
    const data = await apiCall('/me')
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    resetSocket()
    await apiCall('/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const dismissDailyBonus = useCallback(() => setDailyBonus(null), [])

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, updateProfile, refreshMe, dailyBonus, dismissDailyBonus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
