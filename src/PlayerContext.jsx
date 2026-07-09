import React, { createContext, useContext, useState, useCallback } from 'react'

export const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState({
    name: 'SiswaHebat',
    coins: 150,
    level: 5,
    exp: 250,
    maxExp: 500,
  })

  const addCoins = useCallback((amount) => {
    setPlayer(p => ({ ...p, coins: p.coins + amount }))
  }, [])

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
  }, [])

  return (
    <PlayerContext.Provider value={{ player, addCoins, addExp }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
