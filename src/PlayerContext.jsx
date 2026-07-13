import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

export const PlayerContext = createContext(null)

async function persistGain(coins, exp) {
  try {
    const res = await fetch('/api/siswa/player/gain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ coins, exp }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error('Failed to persist coins/exp gain', err)
    return null
  }
}

// Guru "Mode Mengajar" free-play also mounts PlayerProvider, but there is no student row to
// persist to (teachers don't earn coins/EXP) — persistence below is skipped for non-siswa.
export function PlayerProvider({ children }) {
  const { user } = useAuth()
  const isSiswa = user?.role === 'siswa'
  const [player, setPlayer] = useState({
    name: user?.name || 'SiswaHebat',
    coins: isSiswa ? (user?.coins ?? 0) : 150,
    level: isSiswa ? (user?.level ?? 1) : 5,
    exp: isSiswa ? (user?.exp ?? 0) : 250,
    maxExp: isSiswa ? (user?.maxExp ?? 100) : 500,
  })
  const [newBadges, setNewBadges] = useState([])

  useEffect(() => {
    if (user?.name) {
      setPlayer(p => ({ ...p, name: user.name }))
    }
  }, [user?.name])

  // Re-hydrate from the authoritative server values whenever the logged-in student changes
  // (e.g. after login), so a stale local guess never overrides real persisted progress.
  useEffect(() => {
    if (!isSiswa) return
    setPlayer(p => ({
      ...p,
      coins: user?.coins ?? p.coins,
      level: user?.level ?? p.level,
      exp: user?.exp ?? p.exp,
      maxExp: user?.maxExp ?? p.maxExp,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const addCoins = useCallback((amount) => {
    setPlayer(p => ({ ...p, coins: p.coins + amount }))
    if (isSiswa) persistGain(amount, 0)
  }, [isSiswa])

  const addExp = useCallback((amount) => {
    setPlayer(p => {
      let { level, exp, maxExp } = p
      exp += amount
      while (exp >= maxExp) {
        exp -= maxExp
        level += 1
        maxExp = Math.floor(maxExp * 1.5)
      }
      return { ...p, level, exp, maxExp }
    })
    if (isSiswa) {
      persistGain(0, amount).then(data => {
        if (data?.player) {
          // Reconcile with the server's authoritative level/exp (its curve formula is the
          // source of truth) in case client-side rounding ever drifts from it.
          setPlayer(p => ({ ...p, coins: data.player.coins, level: data.player.level, exp: data.player.exp, maxExp: data.player.maxExp }))
        }
        if (data?.newBadges?.length) setNewBadges(b => [...b, ...data.newBadges])
      })
    }
  }, [isSiswa])

  const reportSurvivalStreak = useCallback((streak) => {
    if (!isSiswa || streak <= 0) return
    fetch('/api/siswa/player/survival', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ streak }),
    }).then(res => res.ok ? res.json() : null).then(data => {
      if (data?.newBadges?.length) setNewBadges(b => [...b, ...data.newBadges])
    }).catch(err => console.error('Failed to report survival streak', err))
  }, [isSiswa])

  const dismissBadge = useCallback((badgeId) => {
    setNewBadges(b => b.filter(x => x.id !== badgeId))
  }, [])

  return (
    <PlayerContext.Provider value={{ player, addCoins, addExp, reportSurvivalStreak, newBadges, dismissBadge }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
