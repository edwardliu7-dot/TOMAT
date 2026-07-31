import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { PET_COIN_MULT, PET_EXP_MULT } from './petBonuses'

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

// Game files still call addCoins(50) so task-session tracking remains compatible.
// The actual economy reward is deliberately normalized here to slow down shop
// progression without requiring a risky edit across every minigame.
export const CORRECT_ANSWER_COIN_REWARD = 15

// Guru "Mode Mengajar" free-play also mounts PlayerProvider, but there is no student row to
// persist to (teachers don't earn coins/EXP) — persistence below is skipped for non-siswa.
export function PlayerProvider({ children }) {
  const { user } = useAuth()
  const isSiswa = user?.role === 'siswa'
  const skinId   = user?.equippedPetSkin || 'golden'
  const coinMult = PET_COIN_MULT[skinId] ?? 1.0
  const expMult  = PET_EXP_MULT[skinId]  ?? 1.0
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
    // `base` is the raw gameplay reward; server will apply pet multiplier independently.
    // We apply the same multiplier client-side for an accurate optimistic display.
    const base   = amount === 50 ? CORRECT_ANSWER_COIN_REWARD : amount
    const reward = Math.round(base * coinMult)
    setPlayer(p => ({ ...p, coins: p.coins + reward }))
    if (isSiswa) {
      persistGain(base, 0).then(data => {
        if (data?.player) {
          // Reconcile with server's authoritative coin balance to prevent drift.
          setPlayer(p => ({ ...p, coins: data.player.coins, level: data.player.level, exp: data.player.exp, maxExp: data.player.maxExp }))
        }
        if (data?.newBadges?.length) setNewBadges(b => [...b, ...data.newBadges])
      })
    }
  }, [isSiswa, coinMult])

  const addExp = useCallback((amount) => {
    // Apply pet EXP multiplier client-side (server applies the same)
    const boosted = Math.round(amount * expMult)
    setPlayer(p => {
      let { level, exp, maxExp } = p
      const prevLevel = level
      exp += boosted
      while (exp >= maxExp) {
        exp -= maxExp
        level += 1
        maxExp = Math.floor(maxExp * 1.5)
      }
      if (level > prevLevel) {
        // Defer side-effect outside the setState call
        setTimeout(() => import('./sfx.js').then(m => m.playSfx('levelup')).catch(() => {}), 0)
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
  }, [isSiswa, expMult])

  // Called by games when a wrong answer is confirmed. In free-play this is a
  // no-op; TaskContext overrides it to advance the task session counter so that
  // a wrong answer counts as one question answered (preventing infinite retries).
  const recordWrongAnswer = useCallback(() => {}, [])

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

  // Server-authoritative sync — use when server has ALREADY updated DB (e.g. tournament reward).
  // Does NOT call persistGain, so there's no double-counting.
  const syncCoins = useCallback((newBalance) => {
    setPlayer(p => ({ ...p, coins: newBalance }))
  }, [])

  return (
    <PlayerContext.Provider value={{ player, addCoins, addExp, syncCoins, recordWrongAnswer, reportSurvivalStreak, newBadges, dismissBadge }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
