import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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

  useEffect(() => {
    let mounted = true
    // Never leave the app behind the splash screen forever when the database
    // or the session store is temporarily unavailable.
    apiCall('/me', { timeoutMs: 8000 })
      .then(data => setUser(data.user))
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setChecking(false)
      })
    return () => { mounted = false }
  }, [])

  const login = useCallback(async ({ role, username, password }) => {
    const data = await apiCall('/login', { method: 'POST', body: { role, username, password } })
    setUser(data.user)
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
    await apiCall('/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, updateProfile, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
